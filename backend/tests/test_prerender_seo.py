# Prerender / SEO regression tests: build output, static server (3100), sitemap-content API, www canonicals
import json
import os
import re
import subprocess
from datetime import date

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

ROUTES = ["services", "products", "about", "contact", "ai-assessment", "roi-calculator",
          "smart-calendar", "blog", "newsletter", "careers", "privacy", "terms"]
ALL = [("/", "index.html")] + [(f"/{r}", f"{r}.html") for r in ROUTES]


def read(name):
    with open(os.path.join(BUILD, name), encoding="utf-8") as fh:
        return fh.read()


def root_html(html):
    m = re.search(r'<div id="root">(.*)</div>\s*(<script|</body>)', html, re.S)
    return m.group(1) if m else ""


# Prerendered files: content, head tags, JSON-LD
@pytest.mark.parametrize("path,fname", ALL)
def test_prerendered_file(path, fname):
    html = read(fname)
    body = root_html(html)
    assert len(body) > 2000, "root empty"
    assert "<h1" in body and "<nav" in body and "<footer" in body
    assert '<template id="B:' not in html
    url = "https://www.orgainse.com" + path
    assert f'<link rel="canonical" href="{url}" />' in html
    assert f'<meta property="og:url" content="{url}" />' in html
    assert f'<meta property="twitter:url" content="{url}" />' in html
    assert 'name="robots" content="index, follow' in html
    assert html.count("<title>") == 1
    lds = re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', html, re.S)
    for ld in lds:
        json.loads(ld)
    if path != "/":
        assert "BreadcrumbList" in html


def test_titles_and_descriptions_unique():
    titles, descs = set(), set()
    for _, f in ALL:
        html = read(f)
        titles.add(re.search(r"<title>([^<]*)</title>", html).group(1))
        descs.add(re.search(r'<meta name="description" content="([^"]*)"', html).group(1))
    assert len(titles) == len(ALL)
    assert len(descs) == len(ALL)


def test_spa_shell_neutral():
    html = read("spa.html")
    assert 'rel="canonical"' not in html
    assert '<div id="root"></div>' in html
    assert "hreflang" not in html


def test_build_sitemap():
    xml = read("sitemap.xml")
    locs = re.findall(r"<loc>([^<]+)</loc>", xml)
    assert len(locs) == 13
    assert all(l.startswith("https://www.orgainse.com/") for l in locs)
    mods = set(re.findall(r"<lastmod>([^<]+)</lastmod>", xml))
    assert len(mods) == 1


def test_robots():
    txt = read("robots.txt")
    for d in ["Disallow: /admin", "Disallow: /api/admin", "Disallow: /unsubscribe", "Disallow: /spa",
              "Sitemap: https://www.orgainse.com/sitemap.xml", "Sitemap: https://www.orgainse.com/sitemap-content.xml"]:
        assert d in txt
    assert not os.path.exists(os.path.join(BUILD, "sitemap-ai-content.xml"))


def test_no_non_www_canonicals_in_source():
    r = subprocess.run(["grep", "-rn", "https://orgainse.com", "/app/frontend/src", "/app/api/_handlers"],
                       capture_output=True, text=True)
    assert r.stdout.strip() == "", r.stdout


def test_vercel_json():
    with open("/app/vercel.json") as fh:
        cfg = json.load(fh)
    assert cfg["cleanUrls"] is True and cfg["trailingSlash"] is False
    dests = {r["source"]: r["destination"] for r in cfg["rewrites"]}
    assert dests.get("/sitemap-content.xml") == "/api"
    assert any(d == "/spa" for d in dests.values())


# Static server (Vercel-like)
@pytest.mark.parametrize("path", ["/", "/about", "/privacy", "/careers"])
def test_static_server_routes(path):
    r = requests.get(STATIC + path, timeout=10)
    assert r.status_code == 200
    url = "https://www.orgainse.com" + path
    assert f'<link rel="canonical" href="{url}" />' in r.text


@pytest.mark.parametrize("path", ["/does-not-exist", "/newsletter/some-issue"])
def test_static_server_unknown_routes_spa(path):
    r = requests.get(STATIC + path, timeout=10)
    assert r.status_code == 200
    assert '<div id="root"></div>' in r.text
    assert 'rel="canonical"' not in r.text


# Live sitemap-content API
def test_sitemap_content_api():
    r = requests.get(f"{BASE_URL}/api/sitemap-content.xml", timeout=20)
    assert r.status_code == 200
    assert "xml" in r.headers.get("content-type", "")
    assert "<urlset" in r.text and r.text.startswith("<?xml")
    for loc in re.findall(r"<loc>([^<]+)</loc>", r.text):
        assert loc.startswith("https://www.orgainse.com/")


def test_sitemap_content_via_static_server():
    r = requests.get(f"{STATIC}/api/sitemap-content.xml", timeout=20)
    assert r.status_code == 200
    assert "<urlset" in r.text
