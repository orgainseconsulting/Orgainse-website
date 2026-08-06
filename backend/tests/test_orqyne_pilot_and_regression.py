"""Iteration-12 backend regression tests: verifies the new ORQYNE Pilot
admin bucket + all endpoints called out in the review request."""
import os
import uuid
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
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
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ---------------- Health / public GETs ----------------
class TestPublic:
    def test_health(self, client):
        r = client.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        assert r.json().get("status") in ("ok", "healthy", "OK")

    def test_blog_list(self, client):
        r = client.get(f"{BASE_URL}/api/blog")
        assert r.status_code == 200

    def test_newsletter_issues(self, client):
        r = client.get(f"{BASE_URL}/api/newsletter-issues")
        assert r.status_code == 200

    def test_app_settings_public(self, client):
        r = client.get(f"{BASE_URL}/api/app-settings/public")
        assert r.status_code == 200
        assert isinstance(r.json(), dict)


# ---------------- Newsletter ----------------
class TestNewsletter:
    def test_newsletter_new_and_duplicate(self, client):
        email = f"TEST_it12_{uuid.uuid4().hex[:8]}@example.com"
        payload = {"email": email, "firstName": "Test", "source": "home"}
        r1 = client.post(f"{BASE_URL}/api/newsletter", json=payload)
        assert r1.status_code in (200, 201), r1.text
        r2 = client.post(f"{BASE_URL}/api/newsletter", json=payload)
        assert r2.status_code in (200, 201, 409), r2.text
        body = r2.json()
        text = str(body).lower()
        if r2.status_code in (200, 201):
            assert "duplicate" in text or "already" in text or body.get("status") in ("duplicate", "already_subscribed"), body


# ---------------- Contact default vs orqyne_pilot ----------------
class TestContactRouting:
    def test_contact_default_goes_to_contact_messages(self, client, auth_headers):
        email = f"test_it12_contact_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "Contact QA",
            "email": email,
            "company": "QA Co",
            "message": "Default contact routing",
        }
        r = client.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code in (200, 201), r.text
        time.sleep(1.0)
        rr = requests.get(f"{BASE_URL}/api/admin?page=1&page_size=200", headers=auth_headers)
        assert rr.status_code == 200
        data = rr.json().get("data") or {}
        contact_msgs = data.get("contact_messages") or []
        assert any(d.get("email") == email for d in contact_msgs), \
            f"Default contact lead {email} not in contact_messages"
        pilots = data.get("orqyne_pilot_leads") or []
        assert not any(d.get("email") == email for d in pilots), \
            "Default contact lead accidentally landed in orqyne_pilot_leads"

    def test_orqyne_pilot_lead_goes_to_dedicated_bucket(self, client, auth_headers):
        email = f"test_it12_pilot_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "Pilot QA",
            "email": email,
            "company": "Pilot Co",
            "message": "Need ORQYNE guided pilot",
            "leadType": "orqyne_pilot",
        }
        r = client.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code in (200, 201), r.text
        time.sleep(1.0)
        rr = requests.get(f"{BASE_URL}/api/admin?page=1&page_size=200", headers=auth_headers)
        assert rr.status_code == 200
        body = rr.json()
        # summary should include orqyne_pilots breakdown
        summary = body.get("summary") or {}
        breakdown = summary.get("breakdown") or {}
        assert "orqyne_pilots" in breakdown, f"summary.breakdown missing orqyne_pilots: {breakdown}"
        # doc should be in dedicated bucket
        data = body.get("data") or {}
        pilots = data.get("orqyne_pilot_leads") or []
        assert any(d.get("email") == email for d in pilots), \
            f"ORQYNE pilot lead {email} not found in orqyne_pilot_leads bucket"
        # And NOT in generic contact_messages
        contact_msgs = data.get("contact_messages") or []
        assert not any(d.get("email") == email for d in contact_msgs), \
            "ORQYNE pilot lead leaked into contact_messages"

    def test_orqyne_guided_pilot_string_variant(self, client, auth_headers):
        email = f"test_it12_pilot2_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "name": "Pilot QA 2",
            "email": email,
            "company": "Pilot Co 2",
            "message": "String variant",
            "leadType": "ORQYNE Guided Pilot",
        }
        r = client.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code in (200, 201), r.text
        time.sleep(1.0)
        rr = requests.get(f"{BASE_URL}/api/admin?page=1&page_size=200", headers=auth_headers)
        data = rr.json().get("data") or {}
        pilots = data.get("orqyne_pilot_leads") or []
        assert any(d.get("email") == email for d in pilots), \
            f"'ORQYNE Guided Pilot' lead {email} not routed to orqyne_pilot_leads"


# ---------------- Tool forms ----------------
class TestToolForms:
    def test_ai_assessment(self, client):
        payload = {
            "name": "AI QA",
            "email": f"TEST_ai_{uuid.uuid4().hex[:8]}@example.com",
            "company": "QA",
            "industry": "Software",
            "company_size": "11-50",
            "responses": [{"q": "strategy", "v": 3}, {"q": "data", "v": 3}],
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


# ---------------- Admin auth + delete ----------------
class TestAdminAuthAndDelete:
    def test_admin_login(self, client):
        r = client.post(f"{BASE_URL}/api/admin-login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("is_super_admin") is True

    def test_admin_list_requires_auth(self, client):
        r = client.get(f"{BASE_URL}/api/admin")
        assert r.status_code in (401, 403)

    def test_admin_delete_single_orqyne_pilot(self, client, auth_headers):
        # 1. create a throwaway pilot lead
        email = f"test_it12_pilot_del_{uuid.uuid4().hex[:8]}@example.com"
        r = client.post(f"{BASE_URL}/api/contact", json={
            "name": "Delete Me",
            "email": email,
            "company": "Del Co",
            "message": "delete",
            "leadType": "orqyne_pilot",
        })
        assert r.status_code in (200, 201)
        time.sleep(1.0)
        # 2. find its id
        rr = requests.get(f"{BASE_URL}/api/admin?page=1&page_size=200", headers=auth_headers)
        pilots = (rr.json().get("data") or {}).get("orqyne_pilot_leads") or []
        target = next((d for d in pilots if d.get("email") == email), None)
        assert target is not None, "created pilot lead not found for delete test"
        lead_id = target.get("id") or target.get("_id")
        assert lead_id, f"lead has no id field: {target}"
        # 3. delete with collection=orqyne_pilot_leads
        dr = requests.delete(
            f"{BASE_URL}/api/admin-delete?deleteType=single&collection=orqyne_pilot_leads&leadId={lead_id}",
            headers=auth_headers,
        )
        assert dr.status_code in (200, 204), dr.text
        # 4. confirm gone
        time.sleep(0.7)
        rr2 = requests.get(f"{BASE_URL}/api/admin?page=1&page_size=200", headers=auth_headers)
        pilots2 = (rr2.json().get("data") or {}).get("orqyne_pilot_leads") or []
        assert not any(d.get("email") == email for d in pilots2), "pilot lead still present after delete"
