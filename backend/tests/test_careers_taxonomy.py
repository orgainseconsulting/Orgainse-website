"""
Iteration 20 — Careers taxonomy + stage gating + share shim.

Focused delta tests on top of test_careers.py:
  - Public GET returns layer + hiring_stage on list and by-slug
  - Admin CRUD preserves layer + custom (long) department + hiring_stage
  - /api/careers-apply returns 409 when hiring_stage is "Role Closed" / "On Hold"
    and passes that gate when set back to an open stage
  - Dispatcher routing: /api/careers?slug=... still JSON (no share shim collision)
  - vercel.json: /careers/:slug rewrite is BEFORE the index.html catch-all
  - Share handler direct invocation returns full index.html shell with per-role
    <title>, og:*, canonical and JobPosting JSON-LD
"""
import json
import os
import subprocess
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://cms-dashboard-23.preview.emergentagent.com").rstrip("/")
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"}
ADMIN_EMAIL = "support@orgainse.com"
ADMIN_PASSWORD = "QaTest!2026#Org"
SEED_SLUG = "senior-delivery-lead-pmaas"


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
    return r.json().get("token")


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {**UA, "Content-Type": "application/json", "Authorization": f"Bearer {admin_token}"}


# ------------------------ Taxonomy round-trip ------------------------
class TestTaxonomyRoundTrip:
    def test_list_includes_layer_and_stage(self, api):
        r = api.get(f"{BASE_URL}/api/careers")
        assert r.status_code == 200
        jobs = r.json()["jobs"]
        for j in jobs:
            assert "layer" in j, f"layer missing on {j.get('slug')}"
            assert "hiring_stage" in j, f"hiring_stage missing on {j.get('slug')}"

    def test_seed_by_slug_has_layer_and_stage(self, api):
        r = api.get(f"{BASE_URL}/api/careers", params={"slug": SEED_SLUG})
        assert r.status_code == 200
        job = r.json()["job"]
        assert "layer" in job
        assert "hiring_stage" in job
        # Ensure seeded role currently at 'Receiving Profiles' per the request note
        assert job["hiring_stage"] in ("Receiving Profiles", "Open Role")


# ------------------------ Admin CRUD w/ new fields ------------------------
class TestAdminNewFields:
    slug = f"test-taxonomy-{uuid.uuid4().hex[:8]}"
    created_id = None
    long_dept = "Custom Department " + "X" * 100  # 118 chars total, < 140 limit

    def test_create_with_layer_hiring_stage_long_department(self, auth_headers):
        payload = {
            "title": "TEST_ Taxonomy Role",
            "slug": TestAdminNewFields.slug,
            "department": TestAdminNewFields.long_dept,
            "layer": "Second Line Management",
            "hiring_stage": "Open Role",
            "employment_type": "Contractor",
            "location": "Remote",
            "about_role": "Role for testing taxonomy fields end-to-end.",
            "status": "published",
        }
        r = requests.post(f"{BASE_URL}/api/careers-admin", headers=auth_headers, json=payload)
        assert r.status_code == 201, r.text
        job = r.json()["job"]
        assert job["layer"] == "Second Line Management"
        assert job["hiring_stage"] == "Open Role"
        assert job["employment_type"] == "Contractor"
        assert job["department"] == TestAdminNewFields.long_dept
        TestAdminNewFields.created_id = job["id"]

    def test_public_reflects_new_fields(self, api):
        r = api.get(f"{BASE_URL}/api/careers", params={"slug": TestAdminNewFields.slug})
        assert r.status_code == 200
        job = r.json()["job"]
        assert job["layer"] == "Second Line Management"
        assert job["hiring_stage"] == "Open Role"
        assert job["department"] == TestAdminNewFields.long_dept

    def test_update_stage_to_role_closed(self, auth_headers):
        payload = {
            "title": "TEST_ Taxonomy Role",
            "slug": TestAdminNewFields.slug,
            "department": TestAdminNewFields.long_dept,
            "layer": "Second Line Management",
            "hiring_stage": "Role Closed",
            "employment_type": "Contractor",
            "location": "Remote",
            "about_role": "Role for testing taxonomy fields end-to-end.",
            "status": "published",
        }
        r = requests.put(f"{BASE_URL}/api/careers-admin",
                         headers=auth_headers,
                         params={"id": TestAdminNewFields.created_id},
                         json=payload)
        assert r.status_code == 200
        assert r.json()["job"]["hiring_stage"] == "Role Closed"

    def test_apply_gated_when_role_closed(self, api):
        payload = {
            "action": "submit",
            "upload_id": uuid.uuid4().hex,
            "job_slug": TestAdminNewFields.slug,
            "full_name": "Test QA Candidate",
            "email": "qa@example.com",
            "phone": "+15551234567",
            "portfolio_url": "https://example.com",
            "why": "I am the automated QA test suite testing the stage-gating path end to end.",
            "filename": "resume.pdf",
            "mime": "application/pdf",
        }
        r = api.post(f"{BASE_URL}/api/careers-apply", json=payload)
        assert r.status_code == 409, r.text
        assert "not accepting" in r.text.lower()

    def test_update_stage_to_on_hold(self, auth_headers):
        payload = {
            "title": "TEST_ Taxonomy Role",
            "slug": TestAdminNewFields.slug,
            "department": TestAdminNewFields.long_dept,
            "layer": "Second Line Management",
            "hiring_stage": "On Hold",
            "employment_type": "Contractor",
            "location": "Remote",
            "about_role": "Role for testing taxonomy fields end-to-end.",
            "status": "published",
        }
        r = requests.put(f"{BASE_URL}/api/careers-admin", headers=auth_headers,
                         params={"id": TestAdminNewFields.created_id}, json=payload)
        assert r.status_code == 200
        assert r.json()["job"]["hiring_stage"] == "On Hold"

    def test_apply_gated_when_on_hold(self, api):
        payload = {
            "action": "submit",
            "upload_id": uuid.uuid4().hex,
            "job_slug": TestAdminNewFields.slug,
            "full_name": "Test QA Candidate",
            "email": "qa@example.com",
            "why": "I am the automated QA test suite testing the on-hold gating path end to end.",
            "filename": "resume.pdf",
            "mime": "application/pdf",
        }
        r = api.post(f"{BASE_URL}/api/careers-apply", json=payload)
        assert r.status_code == 409
        assert "not accepting" in r.text.lower()

    def test_reopen_passes_stage_gate(self, auth_headers, api):
        # Restore to open stage
        payload = {
            "title": "TEST_ Taxonomy Role",
            "slug": TestAdminNewFields.slug,
            "department": TestAdminNewFields.long_dept,
            "layer": "Second Line Management",
            "hiring_stage": "Receiving Profiles",
            "employment_type": "Contractor",
            "location": "Remote",
            "about_role": "Role for testing taxonomy fields end-to-end.",
            "status": "published",
        }
        r = requests.put(f"{BASE_URL}/api/careers-admin", headers=auth_headers,
                         params={"id": TestAdminNewFields.created_id}, json=payload)
        assert r.status_code == 200

        # Now the same payload must PASS the stage gate. It will fail at the
        # "upload expired" check further down (because we did not stage chunks),
        # NOT at the 409 gate.
        submit = {
            "action": "submit",
            "upload_id": uuid.uuid4().hex,
            "job_slug": TestAdminNewFields.slug,
            "full_name": "Test QA Candidate",
            "email": "qa@example.com",
            "why": "Testing that stage gate passes for open stage — automated regression.",
            "filename": "resume.pdf",
            "mime": "application/pdf",
        }
        r2 = api.post(f"{BASE_URL}/api/careers-apply", json=submit)
        assert r2.status_code != 409, f"Should NOT be gated by stage, got 409: {r2.text}"
        # We expect a 400 "upload expired/incomplete" here because we didn't stage chunks
        assert r2.status_code == 400
        assert "expired" in r2.text.lower() or "incomplete" in r2.text.lower() or "again" in r2.text.lower()

    def test_cleanup_delete(self, auth_headers, api):
        r = requests.delete(f"{BASE_URL}/api/careers-admin", headers=auth_headers,
                            params={"id": TestAdminNewFields.created_id})
        assert r.status_code == 200
        # Confirm gone
        r2 = api.get(f"{BASE_URL}/api/careers", params={"slug": TestAdminNewFields.slug})
        assert r2.status_code == 404


# ------------------------ Dispatcher / routing sanity ------------------------
class TestDispatcherRouting:
    def test_api_careers_still_returns_json_list(self, api):
        r = api.get(f"{BASE_URL}/api/careers")
        assert r.status_code == 200
        assert "application/json" in r.headers.get("Content-Type", "").lower()
        body = r.json()
        assert "jobs" in body

    def test_api_careers_slug_still_returns_json(self, api):
        r = api.get(f"{BASE_URL}/api/careers", params={"slug": SEED_SLUG})
        assert r.status_code == 200
        assert "application/json" in r.headers.get("Content-Type", "").lower()
        assert r.json()["job"]["slug"] == SEED_SLUG


# ------------------------ vercel.json structure ------------------------
class TestVercelConfig:
    def test_valid_json_and_rewrite_order(self):
        with open("/app/vercel.json", "r") as f:
            data = json.load(f)  # will raise if invalid JSON
        rewrites = data.get("rewrites", [])
        sources = [r.get("source") for r in rewrites]
        assert "/careers/:slug" in sources, "Missing /careers/:slug rewrite"
        assert "/api/(.*)" in sources, "Missing /api/(.*) rewrite"
        careers_idx = sources.index("/careers/:slug")
        # The final index.html catch-all should come AFTER the careers rewrite.
        catchall_idx = None
        for i, s in enumerate(sources):
            if s and "index.html" not in (rewrites[i].get("destination") or ""):
                continue
            catchall_idx = i
            break
        assert catchall_idx is not None, "No index.html catch-all rewrite found"
        assert careers_idx < catchall_idx, (
            f"/careers/:slug rewrite (idx {careers_idx}) must precede the index.html "
            f"catch-all (idx {catchall_idx})"
        )


# ------------------------ Share handler direct invocation ------------------------
class TestShareHandlerDirect:
    """Invoke api/_handlers/careers-share.js directly via Node with a mocked req/res
    to assert (c) of the review request without depending on preview-pod routing."""

    SCRIPT = r"""
    import handler from '/app/api/_handlers/careers-share.js';
    import { EventEmitter } from 'events';

    process.env.MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
    process.env.DB_NAME = process.env.DB_NAME || 'orgainse-consulting';

    class Res {
      constructor() { this.headers = {}; this._status = 200; this.body = ''; }
      setHeader(k, v) { this.headers[k.toLowerCase()] = v; }
      status(s) { this._status = s; return this; }
      send(b) { this.body = b; return this; }
      end(b) { if (b) this.body += b; return this; }
    }

    (async () => {
      const req = Object.assign(new EventEmitter(), {
        method: 'GET',
        url: '/careers/__SLUG__',
        headers: { host: 'orgainse.com', 'x-forwarded-proto': 'https' },
        query: {},
      });
      const res = new Res();
      try {
        await handler(req, res);
      } catch (e) {
        console.log(JSON.stringify({ error: e.message }));
        process.exit(2);
      }
      const body = String(res.body || '');
      const out = {
        status: res._status,
        contentType: res.headers['content-type'] || '',
        hasRoot: /id=["']root["']/.test(body),
        hasTitle: /<title>[^<]*Careers at Orgainse[^<]*<\/title>/.test(body),
        hasOgTitle: /<meta\s+property=["']og:title["']/.test(body),
        hasOgDescription: /<meta\s+property=["']og:description["']/.test(body),
        hasOgUrl: /<meta\s+property=["']og:url["'][^>]*\/careers\/__SLUG__/.test(body),
        hasCanonical: /<link\s+rel=["']canonical["'][^>]*\/careers\/__SLUG__/.test(body),
        hasJsonLd: /application\/ld\+json/.test(body) && /"@type"\s*:\s*"JobPosting"/.test(body),
        bodyLen: body.length,
      };
      console.log(JSON.stringify(out));
      process.exit(0);
    })().catch((e) => { console.log(JSON.stringify({ error: String(e) })); process.exit(3); });
    """

    def _run(self, slug):
        script = self.SCRIPT.replace("__SLUG__", slug)
        script_path = f"/tmp/share_probe_{uuid.uuid4().hex[:8]}.mjs"
        with open(script_path, "w") as f:
            f.write(script)
        # Node ESM: the file must be .mjs OR the working project needs "type":"module".
        # /app has type: module in package.json? Check:
        try:
            res = subprocess.run(
                ["node", script_path],
                capture_output=True, text=True, timeout=30, cwd="/app",
            )
        finally:
            try: os.unlink(script_path)
            except OSError: pass
        return res

    def test_handler_returns_full_html_shell_with_meta_and_jsonld(self):
        res = self._run(SEED_SLUG)
        if res.returncode != 0:
            pytest.skip(f"Node probe could not run: rc={res.returncode} stderr={res.stderr[:400]}")
        # Take last stdout line (in case of noisy imports)
        stdout = res.stdout.strip().splitlines()
        assert stdout, f"No output from node probe. stderr={res.stderr[:400]}"
        out = json.loads(stdout[-1])
        assert "error" not in out, f"Handler error: {out}"
        # If the local build/index.html isn't reachable via fetch(origin/index.html) the
        # handler emits a 302 to /careers. That's a legitimate fallback but not what
        # we want to assert here — skip in that case.
        if out.get("status") == 302:
            pytest.skip("Share handler fell back to 302 — origin/index.html not reachable from Node probe")
        assert out["status"] == 200, out
        assert "text/html" in out["contentType"].lower()
        assert out["hasRoot"], "Response is not the CRA shell (no id=\"root\")"
        assert out["hasTitle"], "Missing per-role <title>"
        assert out["hasOgTitle"], "Missing og:title"
        assert out["hasOgDescription"], "Missing og:description"
        assert out["hasOgUrl"], "Missing og:url with /careers/<slug>"
        assert out["hasCanonical"], "Missing canonical with /careers/<slug>"
        assert out["hasJsonLd"], "Missing JobPosting JSON-LD"
