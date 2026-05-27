"""
Orgainse Consulting — FastAPI backend (entrypoint).

DESIGN: this Python process exists only to keep the supervisor-managed
backend port (8001) up. The actual API logic lives in the SAME Node
serverless handlers that ship to Vercel production (`/app/api/_handlers/**`
dispatched through `/app/api/index.js`).

At startup we:
  1. Spawn a Node sidecar (`sidecar.mjs`) that wraps the Vercel dispatcher
     on `127.0.0.1:8765`.
  2. Create Mongo indexes + seed admin users (one-shot bootstrap, idempotent).
  3. Mount a single catch-all FastAPI route that reverse-proxies every
     `/api/*` request to the Node sidecar.

This gives us ONE source of truth for API behaviour — Vercel handlers — and
zero schema drift between local dev and production.
"""
from __future__ import annotations

import asyncio
import os
import signal
import subprocess
import sys
from contextlib import asynccontextmanager

import httpx
import resend
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from deps import (
    ADMIN_PASSWORD,
    ADMIN_USERNAME,
    ALLOWED_ORIGINS,
    SETTINGS_DOC_ID,
    db,
    gen_id,
    hash_password,
    now_iso,
    verify_password,
)

SIDECAR_PORT = int(os.environ.get("SIDECAR_PORT", "8765"))
SIDECAR_HOST = "127.0.0.1"
SIDECAR_BASE = f"http://{SIDECAR_HOST}:{SIDECAR_PORT}"
SIDECAR_SCRIPT = os.path.join(os.path.dirname(__file__), "sidecar.mjs")

# Headers that hop-by-hop / proxy infrastructure must never forward.
_HOP_BY_HOP = {
    "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
    "te", "trailers", "transfer-encoding", "upgrade", "host", "content-length",
}


async def _wait_for_sidecar(timeout: float = 10.0) -> None:
    """Block until the Node sidecar answers /api/health (or timeout)."""
    deadline = asyncio.get_event_loop().time() + timeout
    async with httpx.AsyncClient(timeout=2.0) as client:
        last_err: Exception | None = None
        while asyncio.get_event_loop().time() < deadline:
            try:
                r = await client.get(f"{SIDECAR_BASE}/api/health")
                if r.status_code == 200:
                    return
            except Exception as e:  # noqa: BLE001
                last_err = e
            await asyncio.sleep(0.25)
        raise RuntimeError(f"Sidecar did not become ready in {timeout}s (last err: {last_err})")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ---- 1. Spawn the Node sidecar -----------------------------------------
    env = {**os.environ, "SIDECAR_PORT": str(SIDECAR_PORT)}
    sidecar_proc = subprocess.Popen(
        ["node", SIDECAR_SCRIPT],
        env=env,
        stdout=sys.stdout,
        stderr=sys.stderr,
        cwd=os.path.dirname(__file__),
        start_new_session=False,  # keep in same process group so supervisor stop kills us together
    )
    app.state.sidecar_proc = sidecar_proc
    try:
        await _wait_for_sidecar()
        print(f"[startup] Node sidecar ready on {SIDECAR_BASE}")
    except Exception as e:  # noqa: BLE001
        print(f"[startup] Sidecar startup failed: {e}")

    # ---- 2. DB bootstrap (one-shot, idempotent) ----------------------------
    try:
        existing_indexes = await db.admin_users.index_information()
        if "username_1" in existing_indexes and not existing_indexes["username_1"].get("sparse"):
            await db.admin_users.drop_index("username_1")
    except Exception as e:  # noqa: BLE001
        print(f"[startup] could not inspect/drop legacy username_1 index: {e}")

    await db.admin_users.create_index("email", unique=True, sparse=True)
    await db.admin_users.create_index("username", unique=True, sparse=True)
    await db.login_attempts.create_index("expires_at", expireAfterSeconds=0)
    await db.newsletter_subscriptions.create_index("email", unique=False)
    await db.newsletter_subscriptions.create_index("unsubscribe_token", unique=False, sparse=True)
    await db.newsletter_issues.create_index("slug", unique=True)
    await db.newsletter_issues.create_index([("status", 1), ("published_at", -1)])
    await db.newsletter_segments.create_index("slug", unique=True)
    await db.blog_posts.create_index("slug", unique=True)
    await db.blog_posts.create_index([("status", 1), ("published_at", -1)])

    # Seed @orgainse.com admin users
    seed_temp_password = os.environ.get("ADMIN_SEED_TEMP_PASSWORD", "Orgainse25%Web..")
    seed_users = [
        {"email": "info@orgainse.com",    "name": "Orgainse Admin",   "is_super_admin": False},
        {"email": "support@orgainse.com", "name": "Orgainse Support", "is_super_admin": False},
        {"email": "swarag@orgainse.com",  "name": "Swarag",           "is_super_admin": True},
        {"email": "rajesh@orgainse.com",  "name": "Rajesh",           "is_super_admin": False},
    ]
    seeded = 0
    for u in seed_users:
        existing = await db.admin_users.find_one({"email": u["email"]})
        if existing:
            if u["is_super_admin"] and not existing.get("is_super_admin"):
                await db.admin_users.update_one(
                    {"_id": existing["_id"]}, {"$set": {"is_super_admin": True}}
                )
            continue
        await db.admin_users.insert_one({
            "id": gen_id(),
            "email": u["email"],
            "name": u["name"],
            "password_hash": hash_password(seed_temp_password),
            "temp_password_plain": seed_temp_password,
            "must_change_password": True,
            "role": "admin",
            "is_super_admin": u["is_super_admin"],
            "created_at": now_iso(),
            "last_login_at": None,
        })
        seeded += 1
    if seeded:
        print(f"[startup] Seeded {seeded} admin users with temp password '{seed_temp_password}'")

    # Load Resend API key override from app_settings
    try:
        settings_doc = await db.app_settings.find_one({"_id": SETTINGS_DOC_ID})
        if settings_doc and settings_doc.get("resend_api_key"):
            resend.api_key = settings_doc["resend_api_key"]
            print("[startup] Loaded Resend API key from app_settings override")
    except Exception as e:  # noqa: BLE001
        print(f"[startup] could not load app_settings: {e}")

    # Legacy ADMIN_USERNAME/ADMIN_PASSWORD seed (backwards-compat)
    if ADMIN_PASSWORD:
        existing = await db.admin_users.find_one({"username": ADMIN_USERNAME})
        if existing is None:
            await db.admin_users.insert_one({
                "username": ADMIN_USERNAME,
                "password_hash": hash_password(ADMIN_PASSWORD),
                "role": "admin",
                "must_change_password": False,
                "created_at": now_iso(),
            })
            print(f"[startup] Seeded legacy admin user '{ADMIN_USERNAME}'")
        elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
            await db.admin_users.update_one(
                {"username": ADMIN_USERNAME},
                {"$set": {"password_hash": hash_password(ADMIN_PASSWORD), "updated_at": now_iso()}},
            )
            print(f"[startup] Rotated password for '{ADMIN_USERNAME}'")

    # ---- 3. Long-lived HTTP client used by the proxy route -----------------
    app.state.proxy_client = httpx.AsyncClient(
        base_url=SIDECAR_BASE,
        timeout=httpx.Timeout(60.0, connect=5.0),
    )

    yield

    # ---- Shutdown ----------------------------------------------------------
    try:
        await app.state.proxy_client.aclose()
    except Exception:  # noqa: BLE001
        pass
    try:
        sidecar_proc.send_signal(signal.SIGTERM)
        sidecar_proc.wait(timeout=5)
    except Exception:  # noqa: BLE001
        try:
            sidecar_proc.kill()
        except Exception:  # noqa: BLE001
            pass


app = FastAPI(title="Orgainse Consulting API", version="4.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)


@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
)
async def vercel_proxy(path: str, request: Request) -> Response:
    """Forward every /api/* request to the Node sidecar (Vercel dispatcher)."""
    target_path = f"/api/{path}"
    qs = request.url.query
    if qs:
        target_path = f"{target_path}?{qs}"

    fwd_headers = {
        k: v for k, v in request.headers.items()
        if k.lower() not in _HOP_BY_HOP
    }
    fwd_headers["x-forwarded-for"] = request.client.host if request.client else "unknown"
    fwd_headers["x-forwarded-proto"] = request.url.scheme

    body = await request.body()
    client: httpx.AsyncClient = request.app.state.proxy_client

    try:
        upstream = await client.request(
            request.method,
            target_path,
            headers=fwd_headers,
            content=body if body else None,
        )
    except httpx.RequestError as e:
        return Response(
            content=f'{{"error":"sidecar unreachable","message":"{type(e).__name__}: {e}"}}',
            status_code=502,
            media_type="application/json",
        )

    resp_headers = {
        k: v for k, v in upstream.headers.items()
        if k.lower() not in _HOP_BY_HOP
    }
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=resp_headers,
        media_type=upstream.headers.get("content-type"),
    )
