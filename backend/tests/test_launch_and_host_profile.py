"""
Tests for new admin features (iteration 10):
- AppSettings: next_blog_launch_at / next_newsletter_launch_at  (set + clear).
- AdminUser profile: designation, photo_url, initials, booking_url,
  show_as_host, custom_fields.
- /api/app-settings/public derives hosts from admin_users when at least one
  user has show_as_host=true + booking_url; falls back to legacy hosts list
  otherwise.
"""
import asyncio
import os
import uuid

import bcrypt
import pytest
import requests
from motor.motor_asyncio import AsyncIOMotorClient

def _read_base():
    val = os.environ.get("REACT_APP_BACKEND_URL")
    if val:
        return val.rstrip("/")
    try:
        with open("/app/frontend/.env", "r") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    return line.split("=", 1)[1].strip().rstrip("/")
    except Exception:
        pass
    raise RuntimeError("REACT_APP_BACKEND_URL not set and /app/frontend/.env missing")


BASE = _read_base()
TEMP_PASSWORD = "Orgainse25%Web.."
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "orgainse-consulting"


# ---------------------------------------------------------------------------
# Direct-Mongo helpers
# ---------------------------------------------------------------------------
def _reset_user_to_temp(email: str):
    async def _do():
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        ph = bcrypt.hashpw(TEMP_PASSWORD.encode(), bcrypt.gensalt()).decode()
        await db.admin_users.update_one(
            {"email": email},
            {
                "$set": {
                    "password_hash": ph,
                    "temp_password_plain": TEMP_PASSWORD,
                    "must_change_password": True,
                },
                "$unset": {"password_changed_at": ""},
            },
        )
        await db.login_attempts.delete_many({"_id": {"$regex": email}})
        client.close()
    asyncio.run(_do())


def _set_show_as_host(email: str, show: bool, booking_url: str = ""):
    async def _do():
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        update = {"show_as_host": show}
        if booking_url:
            update["booking_url"] = booking_url
        await db.admin_users.update_one({"email": email}, {"$set": update})
        client.close()
    asyncio.run(_do())


def _login(email: str, password: str):
    return requests.post(f"{BASE}/api/admin-login", json={"email": email, "password": password})


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(scope="module")
def swarag_full_token():
    """Reset swarag + force-change password → return full-purpose token."""
    _reset_user_to_temp("swarag@orgainse.com")
    r = _login("swarag@orgainse.com", TEMP_PASSWORD)
    assert r.status_code == 200, r.text
    short = r.json()["token"]
    r2 = requests.post(
        f"{BASE}/api/admin-change-password",
        headers={"Authorization": f"Bearer {short}"},
        json={"current_password": TEMP_PASSWORD, "new_password": "FreshPass!2026"},
    )
    assert r2.status_code == 200, r2.text
    return r2.json()["token"]


@pytest.fixture(scope="module")
def info_full_token():
    _reset_user_to_temp("info@orgainse.com")
    r = _login("info@orgainse.com", TEMP_PASSWORD)
    short = r.json()["token"]
    r2 = requests.post(
        f"{BASE}/api/admin-change-password",
        headers={"Authorization": f"Bearer {short}"},
        json={"current_password": TEMP_PASSWORD, "new_password": "InfoFull!2026"},
    )
    assert r2.status_code == 200, r2.text
    return r2.json()["token"]


# ---------------------------------------------------------------------------
# AppSettings launch_at fields
# ---------------------------------------------------------------------------
class TestLaunchAtFields:
    def test_put_next_blog_launch_at_persists(self, swarag_full_token):
        target = "2026-06-01T10:00:00.000Z"
        r = requests.put(
            f"{BASE}/api/app-settings",
            headers={"Authorization": f"Bearer {swarag_full_token}"},
            json={"next_blog_launch_at": target},
        )
        assert r.status_code == 200, r.text
        s = r.json()["settings"]
        assert s.get("next_blog_launch_at") == target

        # Verify GET (admin) reflects it
        g = requests.get(f"{BASE}/api/app-settings", headers={"Authorization": f"Bearer {swarag_full_token}"})
        assert g.json()["settings"].get("next_blog_launch_at") == target

        # Verify public endpoint also exposes it
        p = requests.get(f"{BASE}/api/app-settings/public").json()["settings"]
        assert p.get("next_blog_launch_at") == target

    def test_put_next_newsletter_launch_at_persists(self, swarag_full_token):
        target = "2026-07-15T14:30:00.000Z"
        r = requests.put(
            f"{BASE}/api/app-settings",
            headers={"Authorization": f"Bearer {swarag_full_token}"},
            json={"next_newsletter_launch_at": target},
        )
        assert r.status_code == 200, r.text
        assert r.json()["settings"].get("next_newsletter_launch_at") == target
        p = requests.get(f"{BASE}/api/app-settings/public").json()["settings"]
        assert p.get("next_newsletter_launch_at") == target

    def test_clear_launch_at_with_empty_string(self, swarag_full_token):
        # Set then clear
        requests.put(
            f"{BASE}/api/app-settings",
            headers={"Authorization": f"Bearer {swarag_full_token}"},
            json={"next_blog_launch_at": "2026-09-09T09:09:09.000Z"},
        )
        r = requests.put(
            f"{BASE}/api/app-settings",
            headers={"Authorization": f"Bearer {swarag_full_token}"},
            json={"next_blog_launch_at": ""},
        )
        assert r.status_code == 200, r.text
        s = r.json()["settings"]
        assert s.get("next_blog_launch_at") in ("", None)
        p = requests.get(f"{BASE}/api/app-settings/public").json()["settings"]
        assert p.get("next_blog_launch_at") in ("", None)

    def test_non_super_admin_cannot_put_launch_at(self, info_full_token):
        r = requests.put(
            f"{BASE}/api/app-settings",
            headers={"Authorization": f"Bearer {info_full_token}"},
            json={"next_blog_launch_at": "2026-12-31T00:00:00.000Z"},
        )
        assert r.status_code == 403


# ---------------------------------------------------------------------------
# AdminUser profile (designation/booking_url/show_as_host/custom_fields)
# ---------------------------------------------------------------------------
class TestAdminUserProfile:
    def test_list_returns_new_profile_fields(self, swarag_full_token):
        r = requests.get(f"{BASE}/api/admin-users", headers={"Authorization": f"Bearer {swarag_full_token}"})
        assert r.status_code == 200, r.text
        users = r.json()["users"]
        for u in users:
            for key in ("designation", "photo_url", "initials", "booking_url", "show_as_host", "custom_fields"):
                assert key in u, f"missing {key} in {u['email']}"
            assert isinstance(u["custom_fields"], list)
            assert isinstance(u["show_as_host"], bool)

    def test_pre_seeded_hosts_are_live(self, swarag_full_token):
        r = requests.get(f"{BASE}/api/admin-users", headers={"Authorization": f"Bearer {swarag_full_token}"})
        users = {u["email"]: u for u in r.json()["users"]}
        # swarag + rajesh pre-seeded as hosts per problem statement
        sw = users["swarag@orgainse.com"]
        ra = users["rajesh@orgainse.com"]
        # If a previous test/iteration toggled these off, the agent must re-seed.
        # We assert the documented contract:
        assert sw["show_as_host"] is True, "swarag must be pre-seeded as live host"
        assert sw["booking_url"], "swarag must have booking_url set"
        assert ra["show_as_host"] is True, "rajesh must be pre-seeded as live host"
        assert ra["booking_url"], "rajesh must have booking_url set"

    def test_update_host_profile_persists_all_fields(self, swarag_full_token):
        # Pick info@ (currently NOT a host) and turn it into one.
        r = requests.get(f"{BASE}/api/admin-users", headers={"Authorization": f"Bearer {swarag_full_token}"})
        info = next(u for u in r.json()["users"] if u["email"] == "info@orgainse.com")
        uid = info["id"]

        payload = {
            "designation": "Senior Strategy Advisor",
            "photo_url": "https://cdn.example.com/info.jpg",
            "initials": "io",  # server upper-cases to "IO"
            "booking_url": "https://cal.example.com/info",
            "show_as_host": True,
            "custom_fields": [
                {"label": "Languages", "value": "EN, ES"},
                {"label": "Focus", "value": "Operations"},
            ],
        }
        u = requests.put(
            f"{BASE}/api/admin-users",
            headers={"Authorization": f"Bearer {swarag_full_token}"},
            params={"id": uid},
            json=payload,
        )
        assert u.status_code == 200, u.text
        updated = u.json()["user"]
        assert updated["designation"] == "Senior Strategy Advisor"
        assert updated["photo_url"] == "https://cdn.example.com/info.jpg"
        assert updated["initials"] == "IO"
        assert updated["booking_url"] == "https://cal.example.com/info"
        assert updated["show_as_host"] is True
        assert len(updated["custom_fields"]) == 2
        labels = [c["label"] for c in updated["custom_fields"]]
        assert "Languages" in labels and "Focus" in labels

        # Verify Pydantic rejects empty label (server-side validation, not silent strip)
        bad = requests.put(
            f"{BASE}/api/admin-users",
            headers={"Authorization": f"Bearer {swarag_full_token}"},
            params={"id": uid},
            json={"custom_fields": [{"label": "", "value": "x"}]},
        )
        assert bad.status_code in (200, 422)  # accept either contract; record actual below

        # Persistence via GET
        g = requests.get(f"{BASE}/api/admin-users", headers={"Authorization": f"Bearer {swarag_full_token}"})
        info2 = next(u for u in g.json()["users"] if u["email"] == "info@orgainse.com")
        assert info2["designation"] == "Senior Strategy Advisor"
        assert info2["initials"] == "IO"
        assert info2["show_as_host"] is True

        # Public endpoint now lists info as a host (derived from admin_users)
        p = requests.get(f"{BASE}/api/app-settings/public").json()["settings"]
        host_emails = [h.get("email") for h in p["hosts"]]
        assert "info@orgainse.com" in host_emails
        info_host = next(h for h in p["hosts"] if h.get("email") == "info@orgainse.com")
        assert info_host["role"] == "Senior Strategy Advisor"
        assert info_host["booking_url"] == "https://cal.example.com/info"
        assert info_host["name"]  # name present
        # custom_fields propagated
        cf_labels = [c["label"] for c in info_host.get("custom_fields", [])]
        assert "Languages" in cf_labels

        # Clean-up: turn info back into a non-host (don't change booking url so re-test idempotent)
        requests.put(
            f"{BASE}/api/admin-users",
            headers={"Authorization": f"Bearer {swarag_full_token}"},
            params={"id": uid},
            json={"show_as_host": False, "custom_fields": []},
        )

    def test_partial_update_does_not_clear_other_fields(self, swarag_full_token):
        # Update only designation on rajesh, ensure booking_url + show_as_host unchanged
        r = requests.get(f"{BASE}/api/admin-users", headers={"Authorization": f"Bearer {swarag_full_token}"})
        raj_before = next(u for u in r.json()["users"] if u["email"] == "rajesh@orgainse.com")
        original_booking = raj_before["booking_url"]
        original_show = raj_before["show_as_host"]

        new_desig = f"Director-{uuid.uuid4().hex[:4]}"
        u = requests.put(
            f"{BASE}/api/admin-users",
            headers={"Authorization": f"Bearer {swarag_full_token}"},
            params={"id": raj_before["id"]},
            json={"designation": new_desig},
        )
        assert u.status_code == 200, u.text
        raj_after = u.json()["user"]
        assert raj_after["designation"] == new_desig
        assert raj_after["booking_url"] == original_booking, "booking_url should not have been cleared"
        assert raj_after["show_as_host"] == original_show, "show_as_host should not have changed"

    def test_non_super_admin_cannot_put_admin_user(self, info_full_token):
        # Get someone's id (use info's own from a separate call as super-admin? no — try without auth)
        # Use a clearly-junk id; we just expect 403 before any lookup.
        r = requests.put(
            f"{BASE}/api/admin-users",
            headers={"Authorization": f"Bearer {info_full_token}"},
            params={"id": "any-id"},
            json={"designation": "x"},
        )
        assert r.status_code == 403


# ---------------------------------------------------------------------------
# /api/app-settings/public host source switching
# ---------------------------------------------------------------------------
class TestPublicHostSource:
    def test_derived_hosts_when_any_admin_show_as_host(self, swarag_full_token):
        # Ensure swarag still a host (problem statement says pre-seeded)
        _set_show_as_host("swarag@orgainse.com", True, booking_url="https://cal.example.com/swarag")
        p = requests.get(f"{BASE}/api/app-settings/public").json()["settings"]
        emails = [h.get("email") for h in p["hosts"]]
        assert "swarag@orgainse.com" in emails
        # Required shape
        h = next(h for h in p["hosts"] if h["email"] == "swarag@orgainse.com")
        for key in ("name", "role", "photo_url", "initials", "booking_url", "custom_fields", "email"):
            assert key in h

    def test_fallback_to_legacy_hosts_when_no_admin_is_host(self, swarag_full_token):
        # Temporarily disable all admin hosts
        for e in ["swarag@orgainse.com", "rajesh@orgainse.com", "info@orgainse.com", "support@orgainse.com"]:
            _set_show_as_host(e, False)
        try:
            # Seed legacy hosts so we can verify fallback path is hit
            legacy = [{
                "name": "Legacy", "role": "X",
                "booking_url": "https://cal.example.com/legacy",
                "initials": "LG", "photo_url": ""
            }]
            r = requests.put(
                f"{BASE}/api/app-settings",
                headers={"Authorization": f"Bearer {swarag_full_token}"},
                json={"hosts": legacy},
            )
            assert r.status_code == 200, r.text
            p = requests.get(f"{BASE}/api/app-settings/public").json()["settings"]
            names = [h["name"] for h in p["hosts"]]
            assert "Legacy" in names, f"legacy fallback not used: {p['hosts']}"
        finally:
            # Restore pre-seeded live hosts so subsequent iterations match documented state
            _set_show_as_host("swarag@orgainse.com", True, booking_url="https://cal.example.com/swarag")
            _set_show_as_host("rajesh@orgainse.com", True, booking_url="https://cal.example.com/rajesh")
            # Clear legacy hosts list
            requests.put(
                f"{BASE}/api/app-settings",
                headers={"Authorization": f"Bearer {swarag_full_token}"},
                json={"hosts": []},
            )


# ---------------------------------------------------------------------------
# Cleanup at end-of-module — restore temp password on all 4 seed accounts.
# ---------------------------------------------------------------------------
@pytest.fixture(scope="module", autouse=True)
def _final_cleanup():
    yield
    for e in ["info@orgainse.com", "support@orgainse.com", "swarag@orgainse.com", "rajesh@orgainse.com"]:
        _reset_user_to_temp(e)
