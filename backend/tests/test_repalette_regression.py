"""Iteration-11 backend regression tests for the site-wide re-palette work.
Palette migration should NOT have touched API logic — this file verifies the
public + admin endpoints still respond correctly."""
import os
import uuid
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://cms-dashboard-23.preview.emergentagent.com").rstrip("/")

ADMIN_EMAIL = "support@orgainse.com"
ADMIN_PASSWORD = "QaTest!2026#Org"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(client):
    r = client.post(f"{BASE_URL}/api/admin-login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"admin-login failed: {r.status_code} {r.text[:200]}")
    data = r.json()
    assert "token" in data, data
    return data["token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ---------------- Public / regression ----------------
class TestPublic:
    def test_health(self, client):
        r = client.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        assert r.json().get("status") in ("ok", "healthy", "OK")

    def test_blog_list(self, client):
        r = client.get(f"{BASE_URL}/api/blog")
        assert r.status_code == 200
        body = r.json()
        # accept either list or dict-with-posts
        assert isinstance(body, (list, dict))

    def test_newsletter_issues(self, client):
        r = client.get(f"{BASE_URL}/api/newsletter-issues")
        assert r.status_code == 200

    def test_app_settings_public(self, client):
        r = client.get(f"{BASE_URL}/api/app-settings/public")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, dict)


# ---------------- Newsletter signup ----------------
class TestNewsletter:
    def test_newsletter_signup_and_duplicate(self, client):
        email = f"TEST_repalette_{uuid.uuid4().hex[:8]}@example.com"
        payload = {"email": email, "firstName": "Test", "source": "home"}
        r1 = client.post(f"{BASE_URL}/api/newsletter", json=payload)
        assert r1.status_code in (200, 201), r1.text
        # duplicate submit
        r2 = client.post(f"{BASE_URL}/api/newsletter", json=payload)
        # depending on backend contract, duplicate returns 200 with duplicate flag or 409
        assert r2.status_code in (200, 201, 409), r2.text
        body = r2.json() if r2.headers.get("content-type", "").startswith("application/json") else {}
        # duplicate signal in body
        text = str(body).lower()
        if r2.status_code in (200, 201):
            assert "duplicate" in text or "already" in text or body.get("status") in ("duplicate", "already_subscribed"), body


# ---------------- Contact / ORQYNE pilot lead ----------------
class TestContactAndPilotLead:
    lead_email = None

    def test_contact_generic(self, client):
        email = f"TEST_repalette_contact_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "Repalette Tester",
            "email": email,
            "company": "QA Co",
            "message": "Regression contact submission",
            "leadType": "contact",
        }
        r = client.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code in (200, 201), r.text

    def test_orqyne_pilot_lead_creates_and_shows_in_admin(self, client, auth_headers):
        email = f"test_repalette_pilot_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "Pilot QA",
            "email": email,
            "company": "Pilot Co",
            "message": "Need ORQYNE guided pilot",
            "leadType": "orqyne_pilot",
        }
        r = client.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code in (200, 201), r.text
        # allow write to settle
        time.sleep(1.0)
        # verify appears in admin leads (contact_messages collection)
        found = False
        for page in range(1, 4):
            rr = requests.get(f"{BASE_URL}/api/admin?page={page}&page_size=200", headers=auth_headers)
            assert rr.status_code == 200, rr.text
            body = rr.json()
            data = body.get("data") or {}
            all_docs = []
            if isinstance(data, dict):
                for v in data.values():
                    if isinstance(v, list):
                        all_docs.extend(v)
            elif isinstance(data, list):
                all_docs = data
            for item in all_docs:
                if isinstance(item, dict) and item.get("email") == email:
                    found = True
                    # verify leadType preserved
                    assert item.get("leadType") in ("orqyne_pilot", "Contact Inquiry"), item.get("leadType")
                    break
            if found:
                break
        assert found, f"ORQYNE pilot lead {email} not found in admin lead listing"


# ---------------- Tool forms ----------------
class TestToolForms:
    def test_ai_assessment(self, client):
        payload = {
            "name": "AI QA",
            "email": f"TEST_ai_{uuid.uuid4().hex[:8]}@example.com",
            "company": "QA",
            "industry": "Software",
            "company_size": "11-50",
            "responses": [
                {"q": "strategy", "v": 3},
                {"q": "data", "v": 3},
                {"q": "talent", "v": 3},
                {"q": "tech", "v": 3},
            ],
        }
        r = client.post(f"{BASE_URL}/api/ai-assessment", json=payload)
        assert r.status_code in (200, 201), r.text

    def test_roi_calculator(self, client):
        payload = {
            "company_name": "QA Co",
            "email": f"TEST_roi_{uuid.uuid4().hex[:8]}@example.com",
            "industry": "Software",
            "company_size": "11-50",
            "current_project_cost": 50000,
            "project_duration_months": 6,
            "current_efficiency_rating": 5,
            "desired_services": ["AI Strategy"],
            "user_region": "US",
        }
        r = client.post(f"{BASE_URL}/api/roi-calculator", json=payload)
        assert r.status_code in (200, 201), r.text

    def test_consultation(self, client):
        payload = {
            "full_name": "Consult QA",
            "email": f"TEST_consult_{uuid.uuid4().hex[:8]}@example.com",
            "company": "QA Co",
            "consultation_type": "AI Strategy",
            "preferred_date": "2026-02-15",
            "preferred_time": "10:00",
            "requirements": "Please book",
        }
        r = client.post(f"{BASE_URL}/api/consultation", json=payload)
        assert r.status_code in (200, 201), r.text


# ---------------- Admin auth ----------------
class TestAdminAuth:
    def test_admin_login(self, client):
        r = client.post(f"{BASE_URL}/api/admin-login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("is_super_admin") is True
        assert data.get("must_change_password") in (False, None)
        assert "token" in data

    def test_admin_list_leads_requires_auth(self, client):
        r = client.get(f"{BASE_URL}/api/admin")
        assert r.status_code in (401, 403)

    def test_admin_list_leads_with_auth(self, client, auth_headers):
        r = requests.get(f"{BASE_URL}/api/admin?page=1&page_size=25", headers=auth_headers)
        assert r.status_code == 200, r.text
