"""Iteration-23: ORQYNE pilot lead API (save + admin listing + single delete) and /products SEO title."""
import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN_EMAIL = "support@orgainse.com"
ADMIN_PASSWORD = "QaTest!2026#Org"


@pytest.fixture(scope="module")
def s():
    x = requests.Session()
    x.headers.update({"Content-Type": "application/json"})
    return x


@pytest.fixture(scope="module")
def auth(s):
    r = s.post(f"{BASE_URL}/api/admin-login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"login failed {r.status_code}")
    return {"Authorization": f"Bearer {r.json()['token']}"}


@pytest.fixture(scope="module")
def created(s, auth):
    ids = []
    yield ids
    for i in ids:
        s.delete(f"{BASE_URL}/api/admin-delete", params={"deleteType": "single", "collection": "orqyne_pilot_leads", "leadId": i}, headers=auth)


# ORQYNE pilot lead save
class TestPilotLead:
    def test_pilot_saves_and_lists(self, s, auth, created):
        tag = uuid.uuid4().hex[:8]
        payload = {
            "name": f"TEST_pilot_{tag}", "email": f"qa-pilot-api-{tag}@example.com", "company": "TEST_Org",
            "service_type": "ORQYNE Pilot", "team_size": "11 – 50", "operating_experience": "Canvas Business Management",
            "message": "[ORQYNE Pilot] TEST scope", "leadType": "orqyne_pilot",
        }
        r = s.post(f"{BASE_URL}/api/contact", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        lid = r.json()["id"]
        created.append(lid)
        assert r.json()["leadType"] == "orqyne_pilot"
        g = s.get(f"{BASE_URL}/api/admin", params={"page": 1, "page_size": 100}, headers=auth, timeout=30)
        assert g.status_code == 200
        body = g.json()
        txt = str(body)
        assert lid in txt
        lead = None
        def walk(o):
            nonlocal lead
            if isinstance(o, dict):
                if o.get("id") == lid:
                    lead = o
                for v in o.values():
                    walk(v)
            elif isinstance(o, list):
                for v in o:
                    walk(v)
        walk(body)
        assert lead is not None
        assert lead["team_size"] == "11 – 50"
        assert lead["operating_experience"] == "Canvas Business Management"
        assert lead["service_type"] == "ORQYNE Pilot"

    def test_pilot_missing_fields_400(self, s):
        r = s.post(f"{BASE_URL}/api/contact", json={"name": "TEST_x", "leadType": "orqyne_pilot"})
        assert r.status_code == 400

    def test_pilot_invalid_email_400(self, s):
        r = s.post(f"{BASE_URL}/api/contact", json={"name": "TEST_x", "email": "bad", "message": "m", "leadType": "orqyne_pilot"})
        assert r.status_code == 400

    def test_single_delete(self, s, auth):
        tag = uuid.uuid4().hex[:8]
        r = s.post(f"{BASE_URL}/api/contact", json={"name": f"TEST_del_{tag}", "email": f"qa-del-{tag}@example.com", "message": "x", "leadType": "orqyne_pilot"})
        assert r.status_code == 200
        lid = r.json()["id"]
        d = s.delete(f"{BASE_URL}/api/admin-delete", params={"deleteType": "single", "collection": "orqyne_pilot_leads", "leadId": lid}, headers=auth)
        assert d.status_code == 200 and d.json()["deletedCount"] == 1
        d2 = s.delete(f"{BASE_URL}/api/admin-delete", params={"deleteType": "single", "collection": "orqyne_pilot_leads", "leadId": lid}, headers=auth)
        # API design: not-found returns 200 with success:false (not 404)
        assert d2.json()["deletedCount"] == 0 and d2.json()["success"] is False


# Earned Value removal in source
def test_no_earned_value_in_pages():
    root = "/app/frontend/src"
    hits = []
    for dp, _, fs in os.walk(root):
        for f in fs:
            if f.endswith((".js", ".jsx")):
                p = os.path.join(dp, f)
                if "earned value" in open(p, encoding="utf-8", errors="ignore").read().lower():
                    hits.append(p)
    assert not hits, hits
