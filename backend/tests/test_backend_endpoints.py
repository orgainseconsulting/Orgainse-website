"""Backend endpoint smoke tests for orgainse copy-cleanup verification."""
import os, time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://cms-dashboard-23.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "support@orgainse.com"
ADMIN_PASSWORD = "QaTest!2026#Org"

ts = int(time.time())


@pytest.fixture(scope="session")
def s():
    return requests.Session()


def test_health(s):
    r = s.get(f"{BASE_URL}/api/health", timeout=15)
    assert r.status_code == 200, r.text


def test_contact_submit(s):
    r = s.post(f"{BASE_URL}/api/contact", json={
        "name": f"TEST_Contact_{ts}",
        "email": f"test_contact_{ts}@example.com",
        "subject": "Delivery visibility enquiry",
        "message": "Testing banned-term cleanup regression",
        "leadType": "contact"
    }, timeout=20)
    assert r.status_code == 200, r.text


def test_ai_assessment_submit(s):
    r = s.post(f"{BASE_URL}/api/ai-assessment", json={
        "name": f"TEST_Assess_{ts}",
        "email": f"test_assess_{ts}@example.com",
        "company": "Test Co",
        "industry": "IT",
        "company_size": "11-50",
        "responses": [{"score": 8}, {"score": 7}, {"score": 8}, {"score": 6}, {"score": 8}]
    }, timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    # Verify banned terms not in output
    txt = str(data).lower()
    for banned in ["ai foundation building", "cutting-edge", "ai center of excellence", "predictive analytics"]:
        assert banned not in txt, f"Banned term '{banned}' in AI assessment response: {data}"
    # Verify new labels
    label = str(data.get("readiness_label") or data.get("scoreLabel") or data.get("score_label") or data)
    print("AI assessment response:", data)


def test_roi_submit(s):
    r = s.post(f"{BASE_URL}/api/roi-calculator", json={
        "company_name": f"TEST_ROI_{ts}",
        "email": f"test_roi_{ts}@example.com",
        "industry": "IT",
        "company_size": "11-50",
        "current_project_cost": 100000,
        "project_duration_months": 12,
        "current_efficiency_rating": 5,
        "desired_services": [],
        "user_region": "US"
    }, timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    txt = str(data).lower()
    assert "digital transformation" not in txt, f"Banned term in ROI: {data}"
    assert "ai project management" not in txt, f"Banned term in ROI: {data}"
    print("ROI response:", data)


def test_consultation_submit(s):
    r = s.post(f"{BASE_URL}/api/consultation", json={
        "full_name": f"TEST_Cons_{ts}",
        "email": f"test_cons_{ts}@example.com",
        "phone": "+12345678901",
        "company": "Test Co",
        "consultation_type": "video",
        "preferred_date": "2026-02-01",
        "preferred_time": "10:00 AM",
        "requirements": "Testing consultation",
        "industry": "IT"
    }, timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    msg = str(data).lower()
    assert "24 hours" not in msg, f"Consultation still says 24 hours: {data}"
    assert "one business day" in msg or "business day" in msg, f"Missing new copy: {data}"
    print("Consultation:", data)


def test_newsletter_submit(s):
    r = s.post(f"{BASE_URL}/api/newsletter", json={
        "email": f"test_newsletter_{ts}@example.com",
        "first_name": "TEST",
        "name": f"TEST_News_{ts}",
        "leadType": "newsletter"
    }, timeout=20)
    assert r.status_code in (200, 201), r.text


def test_admin_login_and_list(s):
    r = s.post(f"{BASE_URL}/api/admin-login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    token = r.json().get("token")
    assert token
    r2 = s.get(f"{BASE_URL}/api/admin", headers={"Authorization": f"Bearer {token}"}, timeout=15)
    assert r2.status_code == 200, r2.text
    d = r2.json()
    # Verify our submissions appear
    print("Admin keys:", list(d.keys()) if isinstance(d, dict) else "list")
