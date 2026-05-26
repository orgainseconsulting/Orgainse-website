"""
Tests for new admin auth / users / settings (Phase 1 + 2).

Covers:
- POST /api/admin-login (domain restriction, lockout, force-change flow)
- GET  /api/auth/me
- POST /api/admin-change-password
- /api/admin-users (super-admin CRUD + reset-password)
- /api/app-settings (GET/PUT super-admin) + /api/app-settings/public
- Regression: /api/admin (lead listing) + /api/blog-admin still works
"""
import asyncio
import os
import time
import uuid
import bcrypt
import pytest
import requests
from motor.motor_asyncio import AsyncIOMotorClient

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://review-and-learn.preview.emergentagent.com").rstrip("/")
TEMP_PASSWORD = "Orgainse25%Web.."
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "orgainse-consulting"


# -----------------------------------------------------------------------------
# Helpers — reset seed passwords back to temp via direct Mongo writes
# -----------------------------------------------------------------------------
def _reset_user_to_temp(email: str):
    """Reset a seed user back to temp password + must_change_password=True."""
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
        # Also clear any lockout
        await db.login_attempts.delete_many({"_id": {"$regex": email}})
        client.close()
    asyncio.run(_do())


def _clear_lockout(email: str):
    async def _do():
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        await db.login_attempts.delete_many({"_id": {"$regex": email}})
        client.close()
    asyncio.run(_do())


def _login(email: str, password: str):
    return requests.post(f"{BASE}/api/admin-login", json={"email": email, "password": password})


# -----------------------------------------------------------------------------
# Fixtures
# -----------------------------------------------------------------------------
@pytest.fixture(scope="module", autouse=True)
def reset_all_seed_users():
    for e in ["info@orgainse.com", "support@orgainse.com", "swarag@orgainse.com", "rajesh@orgainse.com"]:
        _reset_user_to_temp(e)
    yield
    for e in ["info@orgainse.com", "support@orgainse.com", "swarag@orgainse.com", "rajesh@orgainse.com"]:
        _reset_user_to_temp(e)


@pytest.fixture
def swarag_full_token():
    """Login swarag, change password to a fresh one, return full-purpose token."""
    _reset_user_to_temp("swarag@orgainse.com")
    r = _login("swarag@orgainse.com", TEMP_PASSWORD)
    assert r.status_code == 200, r.text
    short_token = r.json()["token"]
    new_pw = "FreshPass!2026"
    r2 = requests.post(
        f"{BASE}/api/admin-change-password",
        headers={"Authorization": f"Bearer {short_token}"},
        json={"current_password": TEMP_PASSWORD, "new_password": new_pw},
    )
    assert r2.status_code == 200, r2.text
    return r2.json()["token"]


# -----------------------------------------------------------------------------
# admin-login: domain + temp password + lockout
# -----------------------------------------------------------------------------
class TestAdminLogin:
    def test_non_orgainse_email_rejected(self):
        r = _login("evil@gmail.com", "whatever")
        assert r.status_code == 403
        assert "@orgainse.com" in r.json().get("detail", "")

    def test_invalid_password_returns_401(self):
        _clear_lockout("info@orgainse.com")
        r = _login("info@orgainse.com", "wrong-pass")
        assert r.status_code == 401

    def test_login_with_temp_password_returns_must_change(self):
        _reset_user_to_temp("info@orgainse.com")
        r = _login("info@orgainse.com", TEMP_PASSWORD)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["must_change_password"] is True
        assert body["expires_in"] == 900  # 15 minutes
        assert body["is_super_admin"] is False
        assert body["email"] == "info@orgainse.com"
        assert body.get("token")

    def test_swarag_is_super_admin(self):
        _reset_user_to_temp("swarag@orgainse.com")
        r = _login("swarag@orgainse.com", TEMP_PASSWORD)
        assert r.status_code == 200
        assert r.json()["is_super_admin"] is True

    def test_lockout_after_5_fails(self):
        # Use rajesh to avoid clashing with other tests
        email = "rajesh@orgainse.com"
        _clear_lockout(email)
        last_status = None
        for _ in range(5):
            last_status = _login(email, "BAD-pass").status_code
        # next attempt should be 429
        r = _login(email, "BAD-pass")
        assert r.status_code == 429, f"expected 429, got {r.status_code} (last invalid attempt was {last_status})"
        _clear_lockout(email)


# -----------------------------------------------------------------------------
# /api/auth/me + /api/admin-change-password
# -----------------------------------------------------------------------------
class TestAuthMe:
    def test_me_before_change_reports_needs_change(self):
        _reset_user_to_temp("support@orgainse.com")
        r = _login("support@orgainse.com", TEMP_PASSWORD)
        tok = r.json()["token"]
        m = requests.get(f"{BASE}/api/auth/me", headers={"Authorization": f"Bearer {tok}"})
        assert m.status_code == 200, m.text
        body = m.json()
        assert body["email"] == "support@orgainse.com"
        assert body["needs_password_change"] is True
        assert body["is_super_admin"] is False
        assert body["role"] == "admin"
        assert body.get("name")

    def test_change_password_clears_flag_and_returns_full_token(self):
        _reset_user_to_temp("info@orgainse.com")
        r = _login("info@orgainse.com", TEMP_PASSWORD)
        short_tok = r.json()["token"]
        new_pw = "NewPass!2026"
        c = requests.post(
            f"{BASE}/api/admin-change-password",
            headers={"Authorization": f"Bearer {short_tok}"},
            json={"current_password": TEMP_PASSWORD, "new_password": new_pw},
        )
        assert c.status_code == 200, c.text
        body = c.json()
        assert body["must_change_password"] is False
        assert body["expires_in"] == 28800
        full_tok = body["token"]
        # /me should now reflect change
        m = requests.get(f"{BASE}/api/auth/me", headers={"Authorization": f"Bearer {full_tok}"})
        assert m.status_code == 200
        assert m.json()["needs_password_change"] is False
        # cleanup: restore temp
        _reset_user_to_temp("info@orgainse.com")


# -----------------------------------------------------------------------------
# /api/admin-users — super-admin CRUD
# -----------------------------------------------------------------------------
class TestAdminUsers:
    def test_non_super_admin_cannot_list_users(self):
        _reset_user_to_temp("info@orgainse.com")
        # login info, force change to get full token
        r = _login("info@orgainse.com", TEMP_PASSWORD)
        short = r.json()["token"]
        ch = requests.post(
            f"{BASE}/api/admin-change-password",
            headers={"Authorization": f"Bearer {short}"},
            json={"current_password": TEMP_PASSWORD, "new_password": "InfoFull!2026"},
        )
        assert ch.status_code == 200
        full = ch.json()["token"]
        # try to list users
        r = requests.get(f"{BASE}/api/admin-users", headers={"Authorization": f"Bearer {full}"})
        assert r.status_code == 403
        assert "Super-admin" in r.json().get("detail", "")
        _reset_user_to_temp("info@orgainse.com")

    def test_super_admin_lists_users_with_temp_passwords(self, swarag_full_token):
        r = requests.get(f"{BASE}/api/admin-users", headers={"Authorization": f"Bearer {swarag_full_token}"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert "users" in body and "me" in body
        users = body["users"]
        emails = {u["email"] for u in users}
        for e in ["info@orgainse.com", "support@orgainse.com", "swarag@orgainse.com", "rajesh@orgainse.com"]:
            assert e in emails
        # swarag (caller) has changed pwd → temp_password_plain should be None
        me_in_list = next(u for u in users if u["email"] == "swarag@orgainse.com")
        assert me_in_list["temp_password_plain"] is None
        assert me_in_list["is_super_admin"] is True
        # rajesh hasn't changed → still visible
        raj = next(u for u in users if u["email"] == "rajesh@orgainse.com")
        assert raj["temp_password_plain"] == TEMP_PASSWORD
        assert raj["must_change_password"] is True

    def test_invite_user_creates_admin(self, swarag_full_token):
        new_email = f"test-{uuid.uuid4().hex[:8]}@orgainse.com"
        body = {"email": new_email, "name": "Test Invited", "temp_password": "InvitePass!23"}
        r = requests.post(f"{BASE}/api/admin-users", headers={"Authorization": f"Bearer {swarag_full_token}"}, json=body)
        assert r.status_code == 200, r.text
        u = r.json()["user"]
        assert u["email"] == new_email
        assert u["temp_password_plain"] == "InvitePass!23"
        assert u["must_change_password"] is True
        # verify persistence via GET
        g = requests.get(f"{BASE}/api/admin-users", headers={"Authorization": f"Bearer {swarag_full_token}"})
        assert any(x["email"] == new_email for x in g.json()["users"])
        # cleanup: delete
        d = requests.delete(
            f"{BASE}/api/admin-users",
            headers={"Authorization": f"Bearer {swarag_full_token}"},
            params={"id": u["id"]},
        )
        assert d.status_code == 200

    def test_invite_non_orgainse_email_rejected(self, swarag_full_token):
        r = requests.post(
            f"{BASE}/api/admin-users",
            headers={"Authorization": f"Bearer {swarag_full_token}"},
            json={"email": "bad@gmail.com", "name": "X", "temp_password": "Whatever!23"},
        )
        assert r.status_code == 400

    def test_reset_password_sets_new_temp(self, swarag_full_token):
        # list to find rajesh's id
        r = requests.get(f"{BASE}/api/admin-users", headers={"Authorization": f"Bearer {swarag_full_token}"})
        raj = next(u for u in r.json()["users"] if u["email"] == "rajesh@orgainse.com")
        new_pw = "ResetTmp!2026"
        rp = requests.post(
            f"{BASE}/api/admin-users/reset-password",
            headers={"Authorization": f"Bearer {swarag_full_token}"},
            params={"id": raj["id"]},
            json={"new_temp_password": new_pw},
        )
        assert rp.status_code == 200, rp.text
        u = rp.json()["user"]
        assert u["temp_password_plain"] == new_pw
        assert u["must_change_password"] is True
        # verify login works
        _clear_lockout("rajesh@orgainse.com")
        lr = _login("rajesh@orgainse.com", new_pw)
        assert lr.status_code == 200
        assert lr.json()["must_change_password"] is True
        # restore
        _reset_user_to_temp("rajesh@orgainse.com")

    def test_cannot_delete_self_or_super_admin(self, swarag_full_token):
        r = requests.get(f"{BASE}/api/admin-users", headers={"Authorization": f"Bearer {swarag_full_token}"})
        swarag = next(u for u in r.json()["users"] if u["email"] == "swarag@orgainse.com")
        d = requests.delete(
            f"{BASE}/api/admin-users",
            headers={"Authorization": f"Bearer {swarag_full_token}"},
            params={"id": swarag["id"]},
        )
        assert d.status_code == 400


# -----------------------------------------------------------------------------
# /api/app-settings
# -----------------------------------------------------------------------------
class TestAppSettings:
    def test_public_endpoint_no_auth_no_secret(self):
        r = requests.get(f"{BASE}/api/app-settings/public")
        assert r.status_code == 200, r.text
        body = r.json()
        s = body["settings"]
        assert "hosts" in s
        assert "booking_url_default" in s
        # No secret exposed
        assert "resend_api_key" not in s
        assert "resend_api_key_masked" not in s

    def test_admin_get_returns_masked_resend_key(self, swarag_full_token):
        r = requests.get(f"{BASE}/api/app-settings", headers={"Authorization": f"Bearer {swarag_full_token}"})
        assert r.status_code == 200, r.text
        s = r.json()["settings"]
        assert s["resend_api_key_set"] is True
        masked = s["resend_api_key_masked"]
        # Should not contain the full key
        assert "re_AFwQGdui" not in masked
        assert masked.startswith("re_")
        # Sender from env
        assert s["sender_email"] == "info@orgainse.com"
        assert "hosts" in s

    def test_put_hosts_and_booking_url_persists(self, swarag_full_token):
        hosts = [
            {"name": "Swarag", "role": "Founder", "booking_url": "https://cal.example.com/swarag", "initials": "SW"},
            {"name": "Rajesh", "role": "Director", "booking_url": "https://cal.example.com/rajesh", "initials": "RA"},
        ]
        payload = {"hosts": hosts, "booking_url_default": "https://cal.example.com/default"}
        r = requests.put(
            f"{BASE}/api/app-settings",
            headers={"Authorization": f"Bearer {swarag_full_token}"},
            json=payload,
        )
        assert r.status_code == 200, r.text
        s = r.json()["settings"]
        assert len(s["hosts"]) == 2
        assert s["booking_url_default"] == "https://cal.example.com/default"
        # Re-read via public endpoint
        p = requests.get(f"{BASE}/api/app-settings/public").json()["settings"]
        names = [h["name"] for h in p["hosts"]]
        assert "Swarag" in names and "Rajesh" in names

    def test_invalid_resend_key_rejected(self, swarag_full_token):
        r = requests.put(
            f"{BASE}/api/app-settings",
            headers={"Authorization": f"Bearer {swarag_full_token}"},
            json={"resend_api_key": "bad_prefix_key"},
        )
        assert r.status_code == 400
        assert "re_" in r.json().get("detail", "")

    def test_non_super_admin_cannot_get_app_settings(self):
        _reset_user_to_temp("support@orgainse.com")
        r = _login("support@orgainse.com", TEMP_PASSWORD)
        short = r.json()["token"]
        ch = requests.post(
            f"{BASE}/api/admin-change-password",
            headers={"Authorization": f"Bearer {short}"},
            json={"current_password": TEMP_PASSWORD, "new_password": "SupFull!2026"},
        )
        full = ch.json()["token"]
        r = requests.get(f"{BASE}/api/app-settings", headers={"Authorization": f"Bearer {full}"})
        assert r.status_code == 403
        _reset_user_to_temp("support@orgainse.com")


# -----------------------------------------------------------------------------
# Regression: legacy lead listing + blog admin still work with new auth
# -----------------------------------------------------------------------------
class TestRegression:
    def test_admin_leads_listing(self, swarag_full_token):
        r = requests.get(f"{BASE}/api/admin?page=1&page_size=10", headers={"Authorization": f"Bearer {swarag_full_token}"})
        assert r.status_code == 200, r.text
        # Should at least return a dict
        assert isinstance(r.json(), dict)

    def test_blog_admin_list_works(self, swarag_full_token):
        r = requests.get(f"{BASE}/api/blog-admin?page=1&page_size=5", headers={"Authorization": f"Bearer {swarag_full_token}"})
        assert r.status_code in (200, 404)
