"""
Newsletter system backend tests.
Covers: issues CRUD, subscribers CRUD, segments CRUD, send (test mode via Resend),
unsubscribe flow, public listing, and regression on /api/newsletter signup.

API response shapes used by server.py:
- POST/PUT/GET issue (by id/slug) -> {success: true, issue: {...}}
- GET issues list (admin or public) -> {success, pagination, issues: [...]}
- POST/PUT subscriber -> {success, subscriber: {...}}
- GET subscribers list -> {success, pagination, counts, subscribers: [...]}
- GET segments -> {success, segments: [...]}
"""
import os
import uuid
import pytest
import requests
from pymongo import MongoClient

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "orgainse-consulting")
_mongo = MongoClient(MONGO_URL)
_db = _mongo[DB_NAME]


def _db_sub(email=None, sid=None):
    q = {"email": email} if email else {"id": sid}
    return _db.newsletter_subscriptions.find_one(q)

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://orgainse-dashboard.preview.emergentagent.com").rstrip("/")
ADMIN_USER = "orgainse_admin"
ADMIN_PASS = "Org@iNs3-Adm!n-2026-x7P9qK"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_headers(session):
    r = session.post(f"{BASE_URL}/api/admin-login", json={"username": ADMIN_USER, "password": ADMIN_PASS})
    assert r.status_code == 200, f"admin-login failed: {r.status_code} {r.text}"
    token = r.json().get("token")
    assert token
    return {"Content-Type": "application/json", "Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def created_issue(session, admin_headers):
    slug = f"test-issue-{uuid.uuid4().hex[:8]}"
    payload = {
        "slug": slug,
        "title": "TEST Issue Title",
        "subtitle": "TEST subtitle",
        "issue_number": 99,
        "edition_date": "2026-01-15",
        "preview_text": "TEST preview",
        "content_html": "<p>TEST body content</p>",
        "cover_image_url": "",
        "status": "draft",
        "seo_title": "TEST seo",
        "seo_description": "TEST seo desc",
    }
    r = session.post(f"{BASE_URL}/api/newsletter-admin/issues", json=payload, headers=admin_headers)
    assert r.status_code in (200, 201), f"create issue failed: {r.status_code} {r.text}"
    issue = r.json()["issue"]
    assert issue["slug"] == slug
    yield issue
    session.delete(f"{BASE_URL}/api/newsletter-admin/issues?id={issue['id']}", headers=admin_headers)


# ---------- issues ----------
class TestIssues:
    def test_create_requires_auth(self, session):
        r = session.post(f"{BASE_URL}/api/newsletter-admin/issues",
                         json={"slug": "x", "title": "x", "content_html": "<p>x</p>"})
        assert r.status_code == 401

    def test_created_issue_persists(self, session, admin_headers, created_issue):
        r = session.get(f"{BASE_URL}/api/newsletter-admin/issues?id={created_issue['id']}", headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["issue"]["slug"] == created_issue["slug"]

    def test_public_list_excludes_drafts(self, session, created_issue):
        r = session.get(f"{BASE_URL}/api/newsletter-issues")
        assert r.status_code == 200
        slugs = [i["slug"] for i in r.json()["issues"]]
        assert created_issue["slug"] not in slugs

    def test_public_get_draft_returns_404(self, session, created_issue):
        r = session.get(f"{BASE_URL}/api/newsletter-issues?slug={created_issue['slug']}")
        assert r.status_code == 404

    def test_public_list_returns_seed(self, session):
        r = session.get(f"{BASE_URL}/api/newsletter-issues")
        assert r.status_code == 200
        slugs = [i["slug"] for i in r.json()["issues"]]
        assert any("welcome-to-the-orgainse-pulse" in s for s in slugs), f"seed issue missing: {slugs}"

    def test_public_get_by_slug(self, session):
        r = session.get(f"{BASE_URL}/api/newsletter-issues?slug=welcome-to-the-orgainse-pulse-issue-01")
        assert r.status_code == 200
        issue = r.json()["issue"]
        assert issue["slug"] == "welcome-to-the-orgainse-pulse-issue-01"
        assert "content_html" in issue and issue["content_html"]

    def test_update_issue(self, session, admin_headers, created_issue):
        payload = dict(created_issue)
        payload["title"] = "TEST Updated Title"
        r = session.put(f"{BASE_URL}/api/newsletter-admin/issues?id={created_issue['id']}",
                        json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text
        r = session.get(f"{BASE_URL}/api/newsletter-admin/issues?id={created_issue['id']}", headers=admin_headers)
        assert r.json()["issue"]["title"] == "TEST Updated Title"

    def test_slug_uniqueness_on_update(self, session, admin_headers, created_issue):
        other_slug = f"test-other-{uuid.uuid4().hex[:8]}"
        r = session.post(f"{BASE_URL}/api/newsletter-admin/issues",
                         json={"slug": other_slug, "title": "Other",
                               "content_html": "<p>x</p>", "status": "draft"},
                         headers=admin_headers)
        assert r.status_code in (200, 201), r.text
        other = r.json()["issue"]
        try:
            other["slug"] = created_issue["slug"]
            r = session.put(f"{BASE_URL}/api/newsletter-admin/issues?id={other['id']}",
                            json=other, headers=admin_headers)
            assert r.status_code == 400
            assert "slug" in r.text.lower()
        finally:
            session.delete(f"{BASE_URL}/api/newsletter-admin/issues?id={other['id']}", headers=admin_headers)

    def test_delete_issue(self, session, admin_headers):
        r = session.post(f"{BASE_URL}/api/newsletter-admin/issues",
                         json={"slug": f"test-del-{uuid.uuid4().hex[:6]}", "title": "to-del",
                               "content_html": "<p>x</p>", "status": "draft"},
                         headers=admin_headers)
        assert r.status_code in (200, 201)
        iid = r.json()["issue"]["id"]
        r = session.delete(f"{BASE_URL}/api/newsletter-admin/issues?id={iid}", headers=admin_headers)
        assert r.status_code in (200, 204)
        r = session.get(f"{BASE_URL}/api/newsletter-admin/issues?id={iid}", headers=admin_headers)
        assert r.status_code == 404


# ---------- subscribers ----------
class TestSubscribers:
    def test_list_requires_auth(self, session):
        r = session.get(f"{BASE_URL}/api/newsletter-admin/subscribers")
        assert r.status_code == 401

    def test_list_counts(self, session, admin_headers):
        r = session.get(f"{BASE_URL}/api/newsletter-admin/subscribers", headers=admin_headers)
        assert r.status_code == 200
        body = r.json()
        assert "subscribers" in body
        assert "counts" in body
        assert "active" in body["counts"]
        assert "unsubscribed" in body["counts"]
        assert "bounced" in body["counts"]

    def test_create_update_delete_subscriber(self, session, admin_headers):
        email = f"test_sub_{uuid.uuid4().hex[:6]}@example.com"
        r = session.post(f"{BASE_URL}/api/newsletter-admin/subscribers",
                         json={"email": email, "tags": ["test"]}, headers=admin_headers)
        assert r.status_code in (200, 201), r.text
        sub = r.json()["subscriber"]
        assert sub["email"] == email
        assert sub.get("unsubscribed") is False
        sid = sub["id"]
        # Token is stored in DB but not exposed via API (security)
        db_doc = _db_sub(sid=sid)
        assert db_doc is not None
        assert db_doc.get("unsubscribe_token"), "unsubscribe_token missing in DB"

        # duplicate
        r = session.post(f"{BASE_URL}/api/newsletter-admin/subscribers",
                         json={"email": email}, headers=admin_headers)
        assert r.status_code == 400

        # update tags + unsubscribe
        r = session.put(f"{BASE_URL}/api/newsletter-admin/subscribers?id={sid}",
                        json={"tags": ["vip", "test"], "unsubscribed": True}, headers=admin_headers)
        assert r.status_code == 200
        upd = r.json()["subscriber"]
        assert "vip" in upd["tags"]
        assert upd["unsubscribed"] is True
        assert upd.get("unsubscribed_at")

        # delete
        r = session.delete(f"{BASE_URL}/api/newsletter-admin/subscribers?id={sid}", headers=admin_headers)
        assert r.status_code in (200, 204)

    def test_csv_export(self, session, admin_headers):
        r = session.get(f"{BASE_URL}/api/newsletter-admin/subscribers/export", headers=admin_headers)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        first_line = r.text.splitlines()[0] if r.text else ""
        assert "email" in first_line.lower()

    def test_public_signup_regression(self, session, admin_headers):
        email = f"test_signup_{uuid.uuid4().hex[:6]}@example.com"
        r = session.post(f"{BASE_URL}/api/newsletter", json={"email": email, "first_name": "TestFN"})
        assert r.status_code == 200, r.text
        # API regression check — must persist in DB with new fields
        doc = _db_sub(email=email)
        assert doc is not None
        assert doc.get("unsubscribe_token"), "regression: unsubscribe_token missing"
        assert doc.get("unsubscribed") is False
        assert doc.get("bounced") is False
        assert doc.get("tags") == []
        # cleanup
        r = session.get(f"{BASE_URL}/api/newsletter-admin/subscribers?q={email}", headers=admin_headers)
        items = r.json()["subscribers"]
        for it in items:
            if it["email"] == email:
                session.delete(f"{BASE_URL}/api/newsletter-admin/subscribers?id={it['id']}", headers=admin_headers)


# ---------- segments ----------
class TestSegments:
    def test_segment_crud_and_tag_strip(self, session, admin_headers):
        slug = f"test-seg-{uuid.uuid4().hex[:6]}"
        r = session.post(f"{BASE_URL}/api/newsletter-admin/segments",
                         json={"name": slug, "slug": slug, "description": "TEST"},
                         headers=admin_headers)
        assert r.status_code in (200, 201), r.text
        seg_body = r.json()
        seg = seg_body.get("segment") or seg_body
        assert seg.get("slug") == slug
        seg_id = seg["id"]

        # list
        r = session.get(f"{BASE_URL}/api/newsletter-admin/segments", headers=admin_headers)
        assert r.status_code == 200
        segs = r.json()["segments"]
        assert any(s["slug"] == slug for s in segs)

        # sub with that tag
        email = f"test_segsub_{uuid.uuid4().hex[:6]}@example.com"
        r = session.post(f"{BASE_URL}/api/newsletter-admin/subscribers",
                         json={"email": email, "tags": [slug]}, headers=admin_headers)
        assert r.status_code in (200, 201)
        sid = r.json()["subscriber"]["id"]

        # delete segment
        r = session.delete(f"{BASE_URL}/api/newsletter-admin/segments?id={seg_id}", headers=admin_headers)
        assert r.status_code in (200, 204)

        # verify tag removed
        r = session.get(f"{BASE_URL}/api/newsletter-admin/subscribers?q={email}", headers=admin_headers)
        items = r.json()["subscribers"]
        assert len(items) == 1
        assert slug not in items[0]["tags"]
        session.delete(f"{BASE_URL}/api/newsletter-admin/subscribers?id={sid}", headers=admin_headers)


# ---------- send ----------
class TestSend:
    def test_send_test_email(self, session, admin_headers, created_issue):
        r = session.post(f"{BASE_URL}/api/newsletter-admin/issues/send?id={created_issue['id']}",
                         json={"test_email": "info@orgainse.com"}, headers=admin_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("success") is True, data
        assert data.get("is_test") is True
        assert data.get("sent") == 1
        assert data.get("total_recipients") == 1


# ---------- unsubscribe ----------
class TestUnsubscribe:
    def test_invalid_token(self, session):
        r = session.post(f"{BASE_URL}/api/unsubscribe", json={"token": "definitely-invalid-token-xyz"})
        assert r.status_code == 404
        r = session.get(f"{BASE_URL}/api/unsubscribe?token=definitely-invalid-token-xyz")
        assert r.status_code == 404

    def test_full_unsubscribe_flow(self, session, admin_headers):
        email = f"test_unsub_{uuid.uuid4().hex[:6]}@example.com"
        r = session.post(f"{BASE_URL}/api/newsletter-admin/subscribers",
                         json={"email": email}, headers=admin_headers)
        assert r.status_code in (200, 201)
        sub = r.json()["subscriber"]
        sid = sub["id"]
        # token is in DB, not in API response
        db_doc = _db_sub(sid=sid)
        token = db_doc["unsubscribe_token"]
        try:
            r = session.get(f"{BASE_URL}/api/unsubscribe?token={token}")
            assert r.status_code == 200
            assert r.json().get("already_unsubscribed") in (False, None)

            r = session.post(f"{BASE_URL}/api/unsubscribe", json={"token": token})
            assert r.status_code == 200
            data = r.json()
            assert data.get("success") is True or data.get("unsubscribed") is True

            r = session.get(f"{BASE_URL}/api/unsubscribe?token={token}")
            assert r.status_code == 200
            assert r.json().get("already_unsubscribed") is True
        finally:
            session.delete(f"{BASE_URL}/api/newsletter-admin/subscribers?id={sid}", headers=admin_headers)
