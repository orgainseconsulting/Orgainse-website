"""
Orgainse Consulting — FastAPI backend (entrypoint).

This file is intentionally thin: it builds the FastAPI app, applies CORS, runs
the startup tasks (Mongo indexes + admin user seed) and includes the routers
that hold all of the actual endpoints.

All shared primitives (DB client, JWT, sanitisation, settings/host helpers,
super-admin gate, etc.) live in `/app/backend/deps.py`. Each router module
under `/app/backend/routers/` owns its own pydantic models and route handlers.

The Vercel deployment continues to use the per-route Node handlers under
`/app/api/*.js`; this Python tree powers the preview / Emergent workspace.
"""
from fastapi import FastAPI
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
from routers import admin_users, auth, blog, forms, newsletter, settings as settings_router

import os
import resend

app = FastAPI(title="Orgainse Consulting API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Startup — index creation + admin user seed + Resend key hydration
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup_event():
    # Drop legacy username_1 index if it lacks sparse=true (prevents IndexKeySpecsConflict)
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

    # ---- Seed @orgainse.com admin users with a temp password (idempotent) ----
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

    # ---- Load Resend API key override from app_settings ----
    try:
        settings_doc = await db.app_settings.find_one({"_id": SETTINGS_DOC_ID})
        if settings_doc and settings_doc.get("resend_api_key"):
            resend.api_key = settings_doc["resend_api_key"]
            print("[startup] Loaded Resend API key from app_settings override")
    except Exception as e:  # noqa: BLE001
        print(f"[startup] could not load app_settings: {e}")

    # ---- Legacy ADMIN_USERNAME/ADMIN_PASSWORD seed (backwards-compat) ----
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


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(forms.router)
app.include_router(auth.router)
app.include_router(admin_users.router)
app.include_router(settings_router.router)
app.include_router(blog.router)
app.include_router(newsletter.router)
