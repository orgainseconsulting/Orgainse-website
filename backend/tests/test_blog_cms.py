"""Blog CMS backend tests — public + admin CRUD, slug uniqueness, image validation."""
import os
import base64
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://review-and-learn.preview.emergentagent.com").rstrip("/")
ADMIN_USERNAME = "orgainse_admin"
ADMIN_PASSWORD = "Org@iNs3-Adm!n-2026-x7P9qK"

# 1x1 transparent PNG (base64)
TINY_PNG_B64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
)
TINY_PNG_DATA_URL = f"data:image/png;base64,{TINY_PNG_B64}"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{BASE_URL}/api/admin-login", json={
        "username": ADMIN_USERNAME, "password": ADMIN_PASSWORD,
    })
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# --- Auth ---
class TestAuth:
    def test_post_blog_admin_without_token_returns_401(self, session):
        r = session.post(f"{BASE_URL}/api/blog-admin", json={
            "title": "no auth", "content_html": "<p>x</p>"
        }, headers={"Content-Type": "application/json"})
        assert r.status_code == 401

    def test_get_blog_admin_without_token_returns_401(self, session):
        r = session.get(f"{BASE_URL}/api/blog-admin", headers={"Content-Type": "application/json"})
        assert r.status_code == 401


# --- CRUD lifecycle ---
class TestBlogCRUD:
    _created_ids = []
    _slug = f"test-cms-post-{int(time.time())}"

    def test_01_create_published_post(self, session, auth_headers):
        payload = {
            "title": "TEST CMS Post for Testing",
            "slug": self._slug,
            "content_html": "<h2>Heading</h2><p>Hello <strong>world</strong></p>",
            "status": "published",
            "tags": ["test", "cms"],
            "category": "Testing",
            "seo_title": "SEO Title",
            "seo_description": "SEO Description",
            "cover_image_url": TINY_PNG_DATA_URL,
        }
        r = session.post(f"{BASE_URL}/api/blog-admin", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["success"] is True
        post = data["post"]
        assert post["slug"] == self._slug
        assert post["status"] == "published"
        assert post["title"] == payload["title"]
        assert "cms" in post["tags"]
        assert post["cover_image_url"].startswith("data:image/png;base64,")
        TestBlogCRUD._created_ids.append(post["id"])

    def test_02_public_blog_list_returns_published(self, session):
        r = session.get(f"{BASE_URL}/api/blog")
        assert r.status_code == 200
        data = r.json()
        assert "posts" in data
        # all returned posts should be published (no draft leakage)
        slugs = [p["slug"] for p in data["posts"]]
        assert self._slug in slugs

    def test_03_public_get_by_slug(self, session):
        r = session.get(f"{BASE_URL}/api/blog", params={"slug": self._slug})
        assert r.status_code == 200
        post = r.json()["post"]
        assert post["slug"] == self._slug
        assert "content_html" in post and "<strong>world</strong>" in post["content_html"]
        assert post["cover_image_url"].startswith("data:image/png;base64,")

    def test_04_public_get_by_slug_not_found_returns_404(self, session):
        r = session.get(f"{BASE_URL}/api/blog", params={"slug": "definitely-does-not-exist-xyz"})
        assert r.status_code == 404

    def test_05_create_draft_and_assert_hidden_from_public(self, session, auth_headers):
        draft_slug = f"test-draft-{int(time.time())}"
        payload = {
            "title": "TEST Draft",
            "slug": draft_slug,
            "content_html": "<p>draft body</p>",
            "status": "draft",
        }
        r = session.post(f"{BASE_URL}/api/blog-admin", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        TestBlogCRUD._created_ids.append(r.json()["post"]["id"])

        # Public by-slug should 404 for draft
        r2 = session.get(f"{BASE_URL}/api/blog", params={"slug": draft_slug})
        assert r2.status_code == 404

        # Public list should not include it
        r3 = session.get(f"{BASE_URL}/api/blog", params={"page_size": 50})
        slugs = [p["slug"] for p in r3.json()["posts"]]
        assert draft_slug not in slugs

    def test_06_admin_list_includes_drafts(self, session, auth_headers):
        r = session.get(f"{BASE_URL}/api/blog-admin", params={"page_size": 100}, headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        statuses = {p["status"] for p in data["posts"]}
        assert "draft" in statuses, f"Expected at least one draft, got: {statuses}"

    def test_07_admin_get_by_id_returns_full_content(self, session, auth_headers):
        post_id = TestBlogCRUD._created_ids[0]
        r = session.get(f"{BASE_URL}/api/blog-admin", params={"id": post_id}, headers=auth_headers)
        assert r.status_code == 200, r.text
        post = r.json()["post"]
        assert post["id"] == post_id
        assert post["content_html"] != ""
        assert post["cover_image_url"].startswith("data:image/png;base64,")

    def test_08_update_post(self, session, auth_headers):
        post_id = TestBlogCRUD._created_ids[0]
        payload = {
            "title": "TEST CMS Post UPDATED",
            "slug": self._slug,
            "content_html": "<p>Updated body</p>",
            "status": "published",
            "tags": ["updated"],
        }
        r = session.put(f"{BASE_URL}/api/blog-admin", params={"id": post_id}, json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        assert r.json()["post"]["title"] == "TEST CMS Post UPDATED"

        # verify persistence via public get
        r2 = session.get(f"{BASE_URL}/api/blog", params={"slug": self._slug})
        assert r2.status_code == 200
        assert "Updated body" in r2.json()["post"]["content_html"]

    def test_09_slug_uniqueness_on_create(self, session, auth_headers):
        payload = {
            "title": "Another with duplicate slug",
            "slug": self._slug,  # same slug as existing
            "content_html": "<p>x</p>",
            "status": "draft",
        }
        r = session.post(f"{BASE_URL}/api/blog-admin", json=payload, headers=auth_headers)
        assert r.status_code == 400
        assert "slug" in r.text.lower()

    def test_10_reject_unsupported_image_mime(self, session, auth_headers):
        svg_data_url = "data:image/svg+xml;base64," + base64.b64encode(b"<svg/>").decode()
        payload = {
            "title": "TEST Bad Image",
            "slug": f"test-bad-image-{int(time.time())}",
            "content_html": "<p>x</p>",
            "status": "draft",
            "cover_image_url": svg_data_url,
        }
        r = session.post(f"{BASE_URL}/api/blog-admin", json=payload, headers=auth_headers)
        assert r.status_code == 400
        assert "image" in r.text.lower() or "unsupported" in r.text.lower()

    def test_11_delete_posts(self, session, auth_headers):
        for pid in TestBlogCRUD._created_ids:
            r = session.delete(f"{BASE_URL}/api/blog-admin", params={"id": pid}, headers=auth_headers)
            assert r.status_code == 200, r.text
        # verify deletion
        for pid in TestBlogCRUD._created_ids:
            r = session.get(f"{BASE_URL}/api/blog-admin", params={"id": pid}, headers=auth_headers)
            assert r.status_code == 404

    def test_12_delete_nonexistent_returns_404(self, session, auth_headers):
        r = session.delete(f"{BASE_URL}/api/blog-admin", params={"id": "does-not-exist-123"}, headers=auth_headers)
        assert r.status_code == 404
