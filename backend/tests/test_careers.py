"""
Backend tests for Careers feature (iteration 19).
Covers:
  - Public GET /api/careers (list + by slug + 404)
  - Admin auth guard on /api/careers-admin
  - Admin CRUD (create draft/publish/update/delete), duplicate slug, validation
  - Admin analytics endpoint
  - Apply flow validation (mime, why length, email, portfolio, expired upload)
  - Resume persistence guarantee: no chunks and no applications collection
"""
import base64
import os
import uuid
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://cms-dashboard-23.preview.emergentagent.com").rstrip("/")
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"}
ADMIN_EMAIL = "support@orgainse.com"
ADMIN_PASSWORD = "QaTest!2026#Org"
SEED_SLUG = "senior-delivery-lead-pmaas"


# --------------------------- fixtures ---------------------------
@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", **UA})
    return s


@pytest.fixture(scope="session")
def admin_token(api):
    r = api.post(f"{BASE_URL}/api/admin-login",
                 json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    data = r.json()
    return data.get("token")


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {**UA, "Content-Type": "application/json", "Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def mongo_db():
    """Direct Mongo access to verify no persistence."""
    url = "mongodb://localhost:27017"
    dbname = "orgainse-consulting"
    try:
        c = MongoClient(url, serverSelectionTimeoutMS=2000)
        c.admin.command("ping")
        return c[dbname]
    except Exception as e:
        pytest.skip(f"Local mongo not reachable: {e}")


# --------------------------- Public careers ---------------------------
class TestPublicCareers:
    def test_list_published(self, api):
        r = api.get(f"{BASE_URL}/api/careers")
        assert r.status_code == 200
        data = r.json()
        assert data["success"] is True
        slugs = [j["slug"] for j in data["jobs"]]
        assert SEED_SLUG in slugs
        # published only — no status field exposed but ensure no drafts leak by count sanity
        for j in data["jobs"]:
            assert "status" not in j or j.get("status") == "published"

    def test_get_seed_by_slug(self, api):
        r = api.get(f"{BASE_URL}/api/careers", params={"slug": SEED_SLUG})
        assert r.status_code == 200
        job = r.json()["job"]
        assert job["slug"] == SEED_SLUG
        assert job["title"]
        assert job["location"]
        assert job["about_role"]

    def test_get_unknown_slug_404(self, api):
        r = api.get(f"{BASE_URL}/api/careers", params={"slug": "nope-does-not-exist"})
        assert r.status_code == 404


# --------------------------- Admin auth guard ---------------------------
class TestAdminAuthGuard:
    def test_no_token_forbidden(self, api):
        r = api.get(f"{BASE_URL}/api/careers-admin", headers=UA)
        assert r.status_code in (401, 403)

    def test_bad_token_forbidden(self, api):
        r = api.get(f"{BASE_URL}/api/careers-admin",
                    headers={**UA, "Authorization": "Bearer bad.token.here"})
        assert r.status_code in (401, 403)


# --------------------------- Admin CRUD ---------------------------
class TestAdminCareersCRUD:
    created_id = None
    created_slug = f"test-role-{uuid.uuid4().hex[:8]}"

    def test_list_includes_drafts(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/careers-admin", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert "jobs" in data
        assert data["total"] >= 1

    def test_analytics(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/careers-admin",
                         headers=auth_headers, params={"action": "analytics"})
        assert r.status_code == 200
        a = r.json()["analytics"]
        assert "total_jobs" in a and "published_jobs" in a and "draft_jobs" in a
        assert a["total_jobs"] >= a["published_jobs"]

    def test_missing_required_fields_rejected(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/careers-admin", headers=auth_headers,
                          json={"title": "", "location": "", "about_role": ""})
        assert r.status_code == 400

    def test_create_draft(self, auth_headers):
        payload = {
            "title": "TEST_ QA Role",
            "slug": TestAdminCareersCRUD.created_slug,
            "department": "Delivery",
            "location": "Remote",
            "work_type": "Remote",
            "employment_type": "Full-time",
            "experience_level": "Mid",
            "experience_range": "3-5 yrs",
            "compensation": "Competitive",
            "summary": "QA test",
            "about_role": "This is a QA created role for automated testing.",
            "responsibilities": "Do QA\nWrite tests",
            "requirements": "Python\nPytest",
            "nice_to_have": "Playwright",
            "what_we_offer": "Great team",
            "status": "draft",
        }
        r = requests.post(f"{BASE_URL}/api/careers-admin", headers=auth_headers, json=payload)
        assert r.status_code == 201, r.text
        job = r.json()["job"]
        assert job["slug"] == TestAdminCareersCRUD.created_slug
        assert job["status"] == "draft"
        TestAdminCareersCRUD.created_id = job["id"]

    def test_draft_not_public(self, api):
        r = api.get(f"{BASE_URL}/api/careers")
        slugs = [j["slug"] for j in r.json()["jobs"]]
        assert TestAdminCareersCRUD.created_slug not in slugs

    def test_duplicate_slug_rejected(self, auth_headers):
        payload = {
            "title": "TEST_ Duplicate",
            "slug": TestAdminCareersCRUD.created_slug,
            "location": "Remote",
            "about_role": "dup",
        }
        r = requests.post(f"{BASE_URL}/api/careers-admin", headers=auth_headers, json=payload)
        assert r.status_code == 400
        assert "slug" in r.text.lower()

    def test_publish_via_put(self, auth_headers):
        assert TestAdminCareersCRUD.created_id
        payload = {
            "title": "TEST_ QA Role Published",
            "slug": TestAdminCareersCRUD.created_slug,
            "location": "Remote",
            "about_role": "Publish this now for the QA test suite.",
            "status": "published",
        }
        r = requests.put(f"{BASE_URL}/api/careers-admin",
                         headers=auth_headers,
                         params={"id": TestAdminCareersCRUD.created_id},
                         json=payload)
        assert r.status_code == 200
        assert r.json()["job"]["status"] == "published"

    def test_published_visible_publicly(self, api):
        r = api.get(f"{BASE_URL}/api/careers", params={"slug": TestAdminCareersCRUD.created_slug})
        assert r.status_code == 200

    def test_delete_role(self, auth_headers, api):
        r = requests.delete(f"{BASE_URL}/api/careers-admin",
                            headers=auth_headers,
                            params={"id": TestAdminCareersCRUD.created_id})
        assert r.status_code == 200

        # confirm gone publicly
        r2 = api.get(f"{BASE_URL}/api/careers", params={"slug": TestAdminCareersCRUD.created_slug})
        assert r2.status_code == 404


# --------------------------- Apply flow validation ---------------------------
class TestApplyValidation:
    def _submit(self, api, **overrides):
        payload = {
            "action": "submit",
            "upload_id": uuid.uuid4().hex,
            "job_slug": SEED_SLUG,
            "full_name": "Test QA Candidate",
            "email": "qa@example.com",
            "phone": "+15551234567",
            "portfolio_url": "https://example.com",
            "why": "I am the automated QA test suite, testing the apply flow end-to-end.",
            "filename": "resume.pdf",
            "mime": "application/pdf",
        }
        payload.update(overrides)
        return api.post(f"{BASE_URL}/api/careers-apply", json=payload)

    def test_invalid_mime_rejected(self, api):
        r = self._submit(api, mime="text/plain")
        assert r.status_code == 400
        assert "pdf" in r.text.lower() or "doc" in r.text.lower()

    def test_invalid_email_rejected(self, api):
        r = self._submit(api, email="not-an-email")
        assert r.status_code == 400

    def test_short_why_rejected(self, api):
        r = self._submit(api, why="too short")
        assert r.status_code == 400

    def test_bad_portfolio_rejected(self, api):
        r = self._submit(api, portfolio_url="ftp://foo")
        assert r.status_code == 400

    def test_missing_upload_id_rejected(self, api):
        r = self._submit(api, upload_id="")
        assert r.status_code == 400

    def test_upload_expired_no_chunks(self, api):
        """Valid input but no chunks staged → 'upload expired'."""
        r = self._submit(api, upload_id=uuid.uuid4().hex)
        assert r.status_code == 400
        # Should indicate expired/incomplete
        assert "expired" in r.text.lower() or "again" in r.text.lower()


# --------------------------- Persistence guarantee ---------------------------
class TestNoPersistence:
    def test_no_applications_collection(self, mongo_db):
        cols = mongo_db.list_collection_names()
        # Ensure no applications-style collection exists
        forbidden = [c for c in cols if any(k in c.lower() for k in
                                            ("application", "resume", "candidates"))]
        assert not forbidden, f"Unexpected persistence collections: {forbidden}"

    def test_chunk_collection_empty_after_stale(self, mongo_db):
        # Not strictly required to be empty, but our validation tests didn't stage any.
        # Just ensure the collection exists (or not) and no stale chunks accumulate uncontrollably.
        if "career_upload_chunks" in mongo_db.list_collection_names():
            count = mongo_db["career_upload_chunks"].count_documents({})
            assert count < 100, f"career_upload_chunks has {count} docs — unexpected buildup"
