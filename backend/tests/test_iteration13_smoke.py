"""Iteration 13 smoke tests — favicon assets, backend regression, ORQYNE pilot."""
import os
import time
import uuid
import requests
import pytest

BASE = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else "https://cms-dashboard-23.preview.emergentagent.com"
ADMIN_EMAIL = "support@orgainse.com"
ADMIN_PASSWORD = "QaTest!2026#Org"


# ----- Favicon / static assets -----
@pytest.mark.parametrize("path", [
    "/favicon.ico",
    "/favicon-32x32.png",
    "/favicon-16x16.png",
    "/apple-touch-icon.png",
    "/logo192.png",
    "/logo512.png",
    "/manifest.json",
])
def test_favicon_asset_served(path):
    r = requests.get(f"{BASE}{path}", timeout=15)
    assert r.status_code == 200, f"{path} -> {r.status_code}"
    ctype = r.headers.get("content-type", "")
    if path.endswith(".json"):
        assert "json" in ctype
    else:
        assert ("image" in ctype) or (path.endswith(".ico") and ("octet-stream" in ctype or "icon" in ctype or "image" in ctype)), f"{path} ctype={ctype}"
    assert len(r.content) > 100


def test_index_html_has_icon_links():
    r = requests.get(f"{BASE}/", timeout=15)
    assert r.status_code == 200
    html = r.text
    assert 'rel="icon"' in html
    assert 'favicon' in html
    assert 'apple-touch-icon' in html
    assert 'mask-icon' in html


def test_manifest_has_three_icons():
    r = requests.get(f"{BASE}/manifest.json", timeout=15)
    data = r.json()
    icons = data.get("icons", [])
    assert len(icons) == 3
    srcs = [i["src"] for i in icons]
    assert "favicon.ico" in srcs
    assert "logo192.png" in srcs
    assert "logo512.png" in srcs
    for i in icons:
        if i["src"] in ("logo192.png", "logo512.png"):
            assert i.get("purpose") == "any maskable"


# ----- Backend API smoke -----
def test_health():
    r = requests.get(f"{BASE}/api/health", timeout=15)
    assert r.status_code == 200


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE}/api/admin-login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, r.text
    tok = r.json().get("token") or r.json().get("access_token")
    assert tok
    return tok


def test_admin_returns_orqyne_pilots_bucket(admin_token):
    r = requests.get(f"{BASE}/api/admin", headers={"Authorization": f"Bearer {admin_token}"}, timeout=20)
    assert r.status_code == 200
    data = r.json()
    breakdown = (data.get("summary") or {}).get("breakdown") or {}
    assert "orqyne_pilots" in breakdown, f"breakdown keys={list(breakdown.keys())}"


def test_newsletter_subscribe_new_then_duplicate():
    email = f"TEST_it13_{uuid.uuid4().hex[:8]}@example.com"
    r1 = requests.post(f"{BASE}/api/newsletter", json={"email": email, "name": "T13"}, timeout=20)
    assert r1.status_code in (200, 201), r1.text
    r2 = requests.post(f"{BASE}/api/newsletter", json={"email": email, "name": "T13"}, timeout=20)
    assert r2.status_code in (200, 201, 409), r2.text
    body = r2.json() if r2.headers.get("content-type", "").startswith("application/json") else {}
    combined = (str(body) + r2.text).lower()
    assert ("duplicate" in combined) or ("already" in combined) or (r2.status_code == 409)


def test_contact_orqyne_pilot_lead_routes_correctly():
    payload = {
        "name": "TEST it13 pilot",
        "email": f"TEST_it13_pilot_{uuid.uuid4().hex[:8]}@example.com",
        "company": "TEST Co",
        "message": "iter13 automated pilot request",
        "leadType": "orqyne_pilot",
    }
    r = requests.post(f"{BASE}/api/contact", json=payload, timeout=20)
    assert r.status_code in (200, 201), r.text
