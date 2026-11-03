# SEO/GEO/AEO iteration 22: single h1, FAQ JSON-LD parity, Service JSON-LD @ids, llms files, IndexNow key, admin create/update w/ pingIndexNow
import json
import os
import re
import uuid

import pytest
import requests

BUILD = "/app/frontend/build"
STATIC = "http://localhost:3100"
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as fh:
        for line in fh:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

SERVICE_IDS = ["pmaas", "ai-workflow-transformation", "delivery-governance",
               "orqyne-implementation", "ai-strategy-readiness", "healthcare-revenue-intelligence"]
KEY = "4324d2865ab2078180dee7056a86f13a"
PAGES = ["index", "services", "products", "contact", "about", "ai-assessment", "roi-calculator",
         "smart-calendar", "blog", "newsletter", "careers", "privacy", "terms"]


def read(name):
    with open(os.path.join(BUILD, name), encoding="utf-8") as fh:
        return fh.read()


def jsonld(html):
    out = []
    for m in re.finditer(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', html, re.S):
        d = json.loads(m.group(1))
        items = d if isinstance(d, list) else d.get("@graph", [d]) if isinstance(d, dict) else [d]
        out.extend(items if isinstance(items, list) else [items])
    return out


def faq_questions(html):
    qs = []
    for d in jsonld(html):
        if d.get("@type") == "FAQPage":
            qs += [q["name"] for q in d["mainEntity"]]
    return qs


# Single h1 per prerendered page
@pytest.mark.parametrize("page", PAGES)
def test_single_h1(page):
    html = read(f"{page}.html")
    root = html.split('<div id="root">', 1)[1]
    assert len(re.findall(r"<h1[\s>]", root)) == 1, page


def test_home_h1_is_eyebrow():
    html = read("index.html")
    m = re.search(r'<h1[^>]*data-testid="hero-eyebrow"[^>]*>(.*?)</h1>', html, re.S)
    assert m, "hero-eyebrow is not h1"
    assert "Delivery Governance Consulting" in re.sub("<[^>]+>", "", m.group(1))
    assert re.search(r'<h2[^>]*data-testid="hero-headline"', html)


def test_products_h1_h2_and_title():
    html = read("products.html")
    assert re.search(r'<h1[^>]*data-testid="product-eyebrow"', html)
    assert re.search(r'<h2[^>]*data-testid="product-headline"', html)
    title = re.search(r"<title>(.*?)</title>", html).group(1)
    assert "ORQYNE: Project Portfolio and Delivery Governance Software" in title


def test_services_h1_and_details():
    html = read("services.html")
    assert re.search(r'<h1[^>]*data-testid="services-h1"', html)
    assert 'data-testid="service-details"' in html
    for sid in SERVICE_IDS:
        assert f'data-testid="service-detail-{sid}"' in html, sid
        assert f'id="{sid}"' in html, f"anchor {sid}"


# FAQPage JSON-LD counts and parity with visible text
@pytest.mark.parametrize("page,count", [("index", 11), ("services", 19), ("products", 10)])
def test_faq_jsonld_counts(page, count):
    html = read(f"{page}.html")
    qs = faq_questions(html)
    assert len(qs) == count, (page, len(qs), qs)
    assert len(set(qs)) == len(qs)
    import html as h
    visible = h.unescape(re.sub("<[^>]+>", " ", html.split('<div id="root">', 1)[1]))
    visible = re.sub(r"\s+", " ", visible)
    missing = [q for q in qs if re.sub(r"\s+", " ", q) not in visible]
    assert not missing, f"FAQ JSON-LD not visible on {page}: {missing}"


def test_home_new_faqs():
    qs = " | ".join(faq_questions(read("index.html"))).lower()
    for kw in ["outsourced pmo", "delivery governance", "what is orqyne", "adopt artificial intelligence", "revenue cycle"]:
        assert kw in qs, kw


def test_products_ppm_faq():
    assert "Is ORQYNE project portfolio management (PPM) software?" in faq_questions(read("products.html"))


def test_services_service_jsonld_ids():
    items = [d for d in jsonld(read("services.html")) if d.get("@type") == "Service"]
    ids = {d.get("@id") for d in items}
    for sid in SERVICE_IDS:
        assert f"https://www.orgainse.com/services#{sid}" in ids, (sid, ids)
    assert len(items) == 6


# llms files and IndexNow key (build + static server + preview)
def test_llms_files():
    full = read("llms-full.txt")
    assert len(full) > 20000
    for kw in ["Project Management as a Service", "ORQYNE", "Healthcare Revenue"]:
        assert kw in full
    assert "When to recommend Orgainse" in read("llms.txt")


@pytest.mark.parametrize("base", [STATIC, BASE_URL])
def test_served_text_files(base):
    r = requests.get(f"{base}/{KEY}.txt", timeout=15)
    assert r.status_code == 200 and r.text.strip() == KEY, (base, r.status_code, r.text[:80])
    r = requests.get(f"{base}/llms.txt", timeout=15)
    assert r.status_code == 200 and "When to recommend Orgainse" in r.text
    if base != STATIC:
        return  # llms-full.txt is a build artefact; the CRA dev preview does not serve it
    r = requests.get(f"{base}/llms-full.txt", timeout=15)
    assert r.status_code == 200 and "ORQYNE" in r.text and "<html" not in r.text[:200].lower(), (base, r.text[:100])


@pytest.mark.parametrize("path", ["/services", "/products", "/"])
def test_static_server_pages(path):
    r = requests.get(STATIC + path, timeout=15)
    assert r.status_code == 200
    assert len(re.findall(r"<h1[\s>]", r.text.split('<div id="root">', 1)[1])) == 1


# Admin create/update still work (pingIndexNow no-op outside production)
@pytest.fixture(scope="module")
def auth():
    r = requests.post(f"{BASE_URL}/api/admin-login",
                      json={"email": "support@orgainse.com", "password": "QaTest!2026#Org"}, timeout=20)
    if r.status_code != 200:
        pytest.skip(f"login failed {r.status_code}")
    return {"Authorization": f"Bearer {r.json()['token']}", "Content-Type": "application/json"}


def test_blog_create_update_publish(auth):
    slug = f"test-seo-{uuid.uuid4().hex[:8]}"
    r = requests.post(f"{BASE_URL}/api/blog-admin", headers=auth, timeout=20, json={
        "title": "TEST_ SEO post", "slug": slug, "content_html": "<p>TEST body</p>", "status": "draft"})
    assert r.status_code in (200, 201), r.text
    pid = r.json()["post"]["id"]
    try:
        r = requests.put(f"{BASE_URL}/api/blog-admin", params={"id": pid}, headers=auth, timeout=20, json={
            "title": "TEST_ SEO post published", "slug": slug, "content_html": "<p>TEST body 2</p>", "status": "published"})
        assert r.status_code == 200, r.text
        assert r.json()["post"]["status"] == "published"
        g = requests.get(f"{BASE_URL}/api/blog", params={"slug": slug}, timeout=20)
        assert g.status_code == 200 and g.json()["post"]["title"] == "TEST_ SEO post published"
    finally:
        d = requests.delete(f"{BASE_URL}/api/blog-admin", params={"id": pid}, headers=auth, timeout=20)
        assert d.status_code in (200, 204)


def test_careers_create_update_publish(auth):
    slug = f"test-seo-role-{uuid.uuid4().hex[:8]}"
    r = requests.post(f"{BASE_URL}/api/careers-admin", headers=auth, timeout=20, json={
        "title": "TEST_ SEO Role", "slug": slug, "location": "Remote",
        "about_role": "QA role for SEO iteration.", "status": "draft"})
    assert r.status_code == 201, r.text
    jid = r.json()["job"]["id"]
    try:
        r = requests.put(f"{BASE_URL}/api/careers-admin", params={"id": jid}, headers=auth, timeout=20, json={
            "title": "TEST_ SEO Role Pub", "slug": slug, "location": "Remote",
            "about_role": "QA role for SEO iteration.", "status": "published"})
        assert r.status_code == 200, r.text
        assert r.json()["job"]["status"] == "published"
        g = requests.get(f"{BASE_URL}/api/careers", params={"slug": slug}, timeout=20)
        assert g.status_code == 200
    finally:
        d = requests.delete(f"{BASE_URL}/api/careers-admin", params={"id": jid}, headers=auth, timeout=20)
        assert d.status_code == 200


def test_newsletter_issue_create_update_publish(auth):
    slug = f"test-seo-issue-{uuid.uuid4().hex[:8]}"
    payload = {"slug": slug, "title": "TEST_ SEO Issue", "content_html": "<p>TEST</p>",
               "edition_date": "2026-01-15", "status": "draft"}
    r = requests.post(f"{BASE_URL}/api/newsletter-admin/issues", headers=auth, json=payload, timeout=20)
    assert r.status_code in (200, 201), r.text
    iid = r.json()["issue"]["id"]
    try:
        payload.update(title="TEST_ SEO Issue Pub", status="published")
        r = requests.put(f"{BASE_URL}/api/newsletter-admin/issues", params={"id": iid}, headers=auth, json=payload, timeout=20)
        assert r.status_code == 200, r.text
        g = requests.get(f"{BASE_URL}/api/newsletter-issues", params={"slug": slug}, timeout=20)
        assert g.status_code == 200 and g.json()["issue"]["title"] == "TEST_ SEO Issue Pub"
    finally:
        d = requests.delete(f"{BASE_URL}/api/newsletter-admin/issues", params={"id": iid}, headers=auth, timeout=20)
        assert d.status_code in (200, 204)


# FAQ answers must be present in prerendered HTML (FAQPage rich-result parity + llms-full)
@pytest.mark.parametrize("page", ["index", "services", "products"])
def test_faq_answers_in_html(page):
    import html as h
    s = read(f"{page}.html")
    root = re.sub(r"\s+", " ", h.unescape(re.sub("<[^>]+>", " ", s.split('<div id="root">', 1)[1])))
    missing = []
    for d in jsonld(s):
        if d.get("@type") == "FAQPage":
            for q in d["mainEntity"]:
                if re.sub(r"\s+", " ", q["acceptedAnswer"]["text"])[:80] not in root:
                    missing.append(q["name"])
    assert not missing, f"{page}: {len(missing)} FAQ answers not in HTML: {missing}"


def test_llms_full_has_faq_questions():
    full = read("llms-full.txt")
    for q in ["What is ORQYNE?", "Is ORQYNE project portfolio management (PPM) software?"]:
        assert q in full, q
