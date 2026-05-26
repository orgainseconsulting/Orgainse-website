"""
Orgainse Consulting — FastAPI backend.

This file mirrors the Vercel serverless functions in /app/api/*.js so the site
can be developed and tested end-to-end inside the Emergent workspace. In
production on Vercel, the equivalent JS handlers in /app/api/*.js are used.

Endpoints:
    POST /api/admin-login         issue JWT (admin only, brute-force protected)
    GET  /api/admin               list all leads (admin JWT required, paginated)
    DELETE /api/admin-delete      delete leads (admin JWT required)
    POST /api/contact             contact form
    POST /api/newsletter          newsletter signup
    POST /api/ai-assessment       AI maturity assessment (server-side scoring)
    POST /api/roi-calculator      ROI projection
    POST /api/consultation        consultation booking
    GET  /api/health              health probe

    GET    /api/blog                 public list / by-slug
    *      /api/blog-admin           JWT CRUD on blog posts

    GET    /api/newsletter-issues       public list / by-slug
    *      /api/newsletter-admin/...    JWT CRUD on issues, subscribers, segments
    POST   /api/newsletter-send         JWT send issue via Resend
    *      /api/unsubscribe            public 1-click unsubscribe (GET + POST)
"""
from dotenv import load_dotenv
load_dotenv()

import os
import re
import uuid
import asyncio
import secrets
import csv
import io
import bcrypt
import jwt as pyjwt
import resend
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Request, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse, HTMLResponse
from pydantic import BaseModel, EmailStr, Field
from motor.motor_asyncio import AsyncIOMotorClient

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ.get("DB_NAME", "orgainse-consulting")
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"
JWT_TTL_HOURS = 8
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "orgainse_admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip()]

# ---------------------------------------------------------------------------
# Resend / email config
# ---------------------------------------------------------------------------
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
SENDER_NAME = os.environ.get("SENDER_NAME", "Orgainse Consulting")
PUBLIC_SITE_URL = os.environ.get("PUBLIC_SITE_URL", "https://www.orgainse.com").rstrip("/")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

VALID_COLLECTIONS = [
    "newsletter_subscriptions",
    "contact_messages",
    "ai_assessment_leads",
    "roi_calculator_leads",
    "service_inquiries",
    "consultation_leads",
]

# ---------------------------------------------------------------------------
# Blog post constants
# ---------------------------------------------------------------------------
ALLOWED_IMAGE_MIME = {"image/png", "image/jpeg", "image/webp", "image/gif"}
MAX_IMAGE_BYTES = int(1.5 * 1024 * 1024)   # 1.5 MB raw bytes
MAX_HTML_BYTES = 800 * 1024
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

# ---------------------------------------------------------------------------
# App + DB
# ---------------------------------------------------------------------------
app = FastAPI(title="Orgainse Consulting API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
bearer_scheme = HTTPBearer(auto_error=False)

# ---------------------------------------------------------------------------
# Utilities
# ---------------------------------------------------------------------------
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PHONE_RE = re.compile(r"^[\+]?[1-9][\d]{0,15}$")
SCRIPT_RE = re.compile(r"<script\b[^<]*(?:(?!</script>)<[^<]*)*</script>", re.IGNORECASE)
JS_PROTOCOL_RE = re.compile(r"javascript:", re.IGNORECASE)
EVENT_HANDLER_RE = re.compile(r"on\w+\s*=", re.IGNORECASE)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def sanitize_str(s: str) -> str:
    if not isinstance(s, str):
        return s
    s = s.strip()
    s = SCRIPT_RE.sub("", s)
    s = JS_PROTOCOL_RE.sub("", s)
    s = EVENT_HANDLER_RE.sub("", s)
    return s[:10000]


def sanitize_input(data: Any) -> Any:
    if isinstance(data, str):
        return sanitize_str(data)
    if isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    if isinstance(data, list):
        return [sanitize_input(v) for v in data]
    return data


def is_email(email: str) -> bool:
    return isinstance(email, str) and bool(EMAIL_RE.match(email)) and len(email) <= 254


def is_phone(phone: Optional[str]) -> bool:
    if not phone:
        return True
    cleaned = re.sub(r"[\s\-\(\)]", "", phone)
    return bool(PHONE_RE.match(cleaned))


def gen_id() -> str:
    return str(uuid.uuid4())


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(email: str, purpose: str = "full", ttl_hours: Optional[float] = None) -> str:
    """Build a JWT.
    purpose="full" → normal 8h admin token.
    purpose="password_change" → short-lived (15 min) token that may only call /api/admin-change-password.
    """
    hours = ttl_hours if ttl_hours is not None else (0.25 if purpose == "password_change" else JWT_TTL_HOURS)
    payload = {
        "sub": email,
        "email": email,
        "role": "admin",
        "purpose": purpose,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=hours),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def verify_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Dict[str, Any]:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Missing bearer token")
    try:
        payload = pyjwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALG])
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not an admin token")
    if payload.get("purpose") not in (None, "full"):
        raise HTTPException(status_code=403, detail="Token purpose insufficient")
    return payload


async def verify_admin_any_purpose(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> Dict[str, Any]:
    """Like verify_admin but also accepts purpose=password_change. Used by /api/admin-change-password."""
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Missing bearer token")
    try:
        payload = pyjwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALG])
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not an admin token")
    return payload


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# ---------------------------------------------------------------------------
# Startup: indexes + admin seed
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup_event():
    # Drop legacy username_1 index if it lacks sparse=true (causes IndexKeySpecsConflict on restart)
    try:
        existing_indexes = await db.admin_users.index_information()
        if "username_1" in existing_indexes and not existing_indexes["username_1"].get("sparse"):
            await db.admin_users.drop_index("username_1")
    except Exception as e:
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
            # Backfill is_super_admin flag for swarag if missing (idempotent migration)
            if u["is_super_admin"] and not existing.get("is_super_admin"):
                await db.admin_users.update_one(
                    {"_id": existing["_id"]},
                    {"$set": {"is_super_admin": True}},
                )
            continue
        await db.admin_users.insert_one({
            "id": gen_id(),
            "email": u["email"],
            "name": u["name"],
            "password_hash": hash_password(seed_temp_password),
            # Plaintext temp password is retained ONLY until the user changes it.
            # Visible only to super-admin via the Admin Users tab. Cleared on password change.
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

    # ---- Load app_settings overrides (Resend API key) at runtime ----
    try:
        settings_doc = await db.app_settings.find_one({"_id": SETTINGS_DOC_ID})
        if settings_doc and settings_doc.get("resend_api_key"):
            resend.api_key = settings_doc["resend_api_key"]
            print("[startup] Loaded Resend API key from app_settings override")
    except Exception as e:
        print(f"[startup] could not load app_settings: {e}")

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
# Models
# ---------------------------------------------------------------------------
class AdminLoginIn(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str = Field(..., min_length=1, max_length=200)


class AdminChangePasswordIn(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=200)
    new_password: str = Field(..., min_length=8, max_length=200)


class ContactIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=5000)
    company: Optional[str] = ""
    phone: Optional[str] = ""
    service_type: Optional[str] = ""
    subject: Optional[str] = ""
    leadType: Optional[str] = "Contact Inquiry"


class NewsletterIn(BaseModel):
    email: EmailStr
    first_name: Optional[str] = ""
    name: Optional[str] = ""


class AssessmentResponse(BaseModel):
    question_id: str
    answer: str
    score: float


class AssessmentIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    company: Optional[str] = ""
    phone: Optional[str] = ""
    industry: Optional[str] = ""
    company_size: Optional[str] = ""
    responses: List[AssessmentResponse]


class ROIIn(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    phone: Optional[str] = ""
    industry: Optional[str] = ""
    company_size: Optional[str] = "11-50"
    current_project_cost: float = Field(..., gt=0)
    project_duration_months: int = Field(..., ge=1, le=60)
    current_efficiency_rating: int = Field(..., ge=1, le=10)
    desired_services: List[str] = []
    user_region: str = "US"


class ConsultationIn(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    company: Optional[str] = ""
    phone: Optional[str] = ""
    service_type: str = Field(..., min_length=1)
    preferred_datetime: Optional[str] = ""
    timezone: Optional[str] = "America/New_York"
    message: Optional[str] = ""
    industry: Optional[str] = ""


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": now_iso(),
        "service": "Orgainse Consulting API",
        "version": "3.0.0",
    }


# ---------------------------------------------------------------------------
# Admin login (brute-force protected)
# ---------------------------------------------------------------------------
@app.post("/api/admin-login")
async def admin_login(payload: AdminLoginIn, request: Request):
    ip = client_ip(request)
    # Accept either email (new) or username (legacy)
    raw_email = (payload.email or payload.username or "").strip().lower()
    if not raw_email:
        raise HTTPException(status_code=400, detail="Email is required")
    # Restrict admin access to @orgainse.com emails (legacy username allowed below)
    is_email_input = "@" in raw_email
    if is_email_input and not raw_email.endswith("@orgainse.com"):
        raise HTTPException(status_code=403, detail="Only @orgainse.com accounts may sign in")
    identifier = f"{ip}:{raw_email}"
    now = datetime.now(timezone.utc)

    # Check lockout
    lockout = await db.login_attempts.find_one({"_id": identifier})
    locked_until = lockout.get("locked_until") if lockout else None
    if locked_until is not None and locked_until.tzinfo is None:
        locked_until = locked_until.replace(tzinfo=timezone.utc)
    if locked_until and locked_until > now:
        remaining = int((locked_until - now).total_seconds())
        raise HTTPException(
            status_code=429,
            detail=f"Too many failed attempts. Try again in {remaining}s.",
        )

    # Look up by email (new users) OR username (legacy fallback)
    user = await db.admin_users.find_one({"email": raw_email})
    if not user:
        user = await db.admin_users.find_one({"username": raw_email})

    if not user or not verify_password(payload.password, user["password_hash"]):
        attempts = (lockout or {}).get("attempts", 0) + 1
        update = {"attempts": attempts, "last_attempt": now}
        if attempts >= 5:
            update["locked_until"] = now + timedelta(minutes=15)
            update["expires_at"] = now + timedelta(minutes=20)
        else:
            update["expires_at"] = now + timedelta(minutes=15)
        await db.login_attempts.update_one({"_id": identifier}, {"$set": update}, upsert=True)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await db.login_attempts.delete_one({"_id": identifier})

    user_email = user.get("email") or user.get("username") or raw_email
    must_change = bool(user.get("must_change_password"))
    purpose = "password_change" if must_change else "full"
    token = create_access_token(user_email, purpose=purpose)
    ttl_seconds = int(0.25 * 3600) if must_change else JWT_TTL_HOURS * 3600

    if not must_change:
        await db.admin_users.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login_at": now_iso()}},
        )

    return {
        "success": True,
        "token": token,
        "expires_in": ttl_seconds,
        "email": user_email,
        "username": user_email,  # legacy clients
        "name": user.get("name") or "",
        "must_change_password": must_change,
        "is_super_admin": bool(user.get("is_super_admin")),
    }


@app.post("/api/admin-change-password")
async def admin_change_password(payload: AdminChangePasswordIn, claims: Dict[str, Any] = Depends(verify_admin_any_purpose)):
    email = (claims.get("email") or claims.get("sub") or "").lower()
    if not email:
        raise HTTPException(400, "Token missing email")

    user = await db.admin_users.find_one({"email": email})
    if not user:
        user = await db.admin_users.find_one({"username": email})
    if not user:
        raise HTTPException(404, "User not found")

    if not verify_password(payload.current_password, user["password_hash"]):
        raise HTTPException(401, "Current password is incorrect")

    if payload.new_password == payload.current_password:
        raise HTTPException(400, "New password must be different from current password")
    if len(payload.new_password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")

    await db.admin_users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "password_hash": hash_password(payload.new_password),
            "must_change_password": False,
            "password_changed_at": now_iso(),
            "last_login_at": now_iso(),
        },
         "$unset": {"temp_password_plain": ""}},
    )

    user_email = user.get("email") or user.get("username") or email
    new_token = create_access_token(user_email, purpose="full")
    return {
        "success": True,
        "token": new_token,
        "expires_in": JWT_TTL_HOURS * 3600,
        "email": user_email,
        "name": user.get("name") or "",
        "must_change_password": False,
        "is_super_admin": bool(user.get("is_super_admin")),
    }


# ---------------------------------------------------------------------------
# /api/auth/me — return current user info
# ---------------------------------------------------------------------------
@app.get("/api/auth/me")
async def auth_me(claims: Dict[str, Any] = Depends(verify_admin_any_purpose)):
    email = (claims.get("email") or claims.get("sub") or "").lower()
    user = await db.admin_users.find_one({"email": email})
    if not user:
        user = await db.admin_users.find_one({"username": email})
    if not user:
        raise HTTPException(404, "User not found")
    return {
        "success": True,
        "email": user.get("email") or user.get("username") or email,
        "name": user.get("name") or "",
        "needs_password_change": bool(user.get("must_change_password")),
        "is_super_admin": bool(user.get("is_super_admin")),
        "role": user.get("role") or "admin",
    }


# ---------------------------------------------------------------------------
# /api/admin-users — super-admin only (CRUD + reset + invite)
# ---------------------------------------------------------------------------
async def _require_super_admin(claims: Dict[str, Any]) -> Dict[str, Any]:
    email = (claims.get("email") or claims.get("sub") or "").lower()
    user = await db.admin_users.find_one({"email": email})
    if not user or not user.get("is_super_admin"):
        raise HTTPException(403, "Super-admin access required")
    return user


def _admin_user_shape(doc: dict, include_temp_password: bool = False) -> dict:
    return {
        "id": doc.get("id"),
        "email": doc.get("email") or doc.get("username") or "",
        "name": doc.get("name") or "",
        "role": doc.get("role") or "admin",
        "is_super_admin": bool(doc.get("is_super_admin")),
        "must_change_password": bool(doc.get("must_change_password")),
        "temp_password_plain": doc.get("temp_password_plain") if include_temp_password else None,
        "created_at": doc.get("created_at"),
        "last_login_at": doc.get("last_login_at"),
        "password_changed_at": doc.get("password_changed_at"),
    }


class AdminUserInviteIn(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=120)
    temp_password: str = Field(..., min_length=8, max_length=200)


class AdminUserUpdateIn(BaseModel):
    name: Optional[str] = None


class AdminUserResetIn(BaseModel):
    new_temp_password: str = Field(..., min_length=8, max_length=200)


@app.get("/api/admin-users")
async def admin_users_list(claims: Dict[str, Any] = Depends(verify_admin)):
    me = await _require_super_admin(claims)
    rows = await db.admin_users.find({"email": {"$exists": True}}, {"_id": 0}).sort("created_at", 1).to_list(length=200)
    return {
        "success": True,
        "users": [_admin_user_shape(r, include_temp_password=True) for r in rows],
        "me": _admin_user_shape(me, include_temp_password=True),
    }


@app.post("/api/admin-users")
async def admin_user_invite(payload: AdminUserInviteIn, claims: Dict[str, Any] = Depends(verify_admin)):
    await _require_super_admin(claims)
    email = payload.email.lower().strip()
    if not email.endswith("@orgainse.com"):
        raise HTTPException(400, "Only @orgainse.com emails may be invited")
    existing = await db.admin_users.find_one({"email": email})
    if existing:
        raise HTTPException(400, "User with this email already exists")
    name = sanitize_input({"n": payload.name})["n"][:120]
    doc = {
        "id": gen_id(),
        "email": email,
        "name": name,
        "password_hash": hash_password(payload.temp_password),
        "temp_password_plain": payload.temp_password,
        "must_change_password": True,
        "role": "admin",
        "is_super_admin": False,
        "created_at": now_iso(),
        "last_login_at": None,
    }
    await db.admin_users.insert_one(doc)
    return {"success": True, "user": _admin_user_shape(doc, include_temp_password=True)}


@app.put("/api/admin-users")
async def admin_user_update(payload: AdminUserUpdateIn, id: str = Query(...), claims: Dict[str, Any] = Depends(verify_admin)):
    await _require_super_admin(claims)
    user = await db.admin_users.find_one({"id": id})
    if not user:
        raise HTTPException(404, "User not found")
    updates: Dict[str, Any] = {"updated_at": now_iso()}
    if payload.name is not None:
        updates["name"] = sanitize_input({"n": payload.name})["n"][:120]
    await db.admin_users.update_one({"id": id}, {"$set": updates})
    updated = await db.admin_users.find_one({"id": id}, {"_id": 0})
    return {"success": True, "user": _admin_user_shape(updated, include_temp_password=True)}


@app.post("/api/admin-users/reset-password")
async def admin_user_reset_password(payload: AdminUserResetIn, id: str = Query(...), claims: Dict[str, Any] = Depends(verify_admin)):
    await _require_super_admin(claims)
    user = await db.admin_users.find_one({"id": id})
    if not user:
        raise HTTPException(404, "User not found")
    await db.admin_users.update_one(
        {"id": id},
        {"$set": {
            "password_hash": hash_password(payload.new_temp_password),
            "temp_password_plain": payload.new_temp_password,
            "must_change_password": True,
            "updated_at": now_iso(),
        }},
    )
    updated = await db.admin_users.find_one({"id": id}, {"_id": 0})
    return {"success": True, "user": _admin_user_shape(updated, include_temp_password=True)}


@app.delete("/api/admin-users")
async def admin_user_delete(id: str = Query(...), claims: Dict[str, Any] = Depends(verify_admin)):
    me = await _require_super_admin(claims)
    user = await db.admin_users.find_one({"id": id})
    if not user:
        raise HTTPException(404, "User not found")
    if user.get("id") == me.get("id") or user.get("is_super_admin"):
        raise HTTPException(400, "Cannot delete a super-admin or yourself")
    await db.admin_users.delete_one({"id": id})
    return {"success": True, "deleted": id}


# ---------------------------------------------------------------------------
# /api/app-settings — dynamic configuration (Resend key, booking hosts)
# ---------------------------------------------------------------------------
SETTINGS_DOC_ID = "global"


def _mask_secret(value: Optional[str]) -> str:
    if not value:
        return ""
    if len(value) <= 6:
        return "•" * len(value)
    return value[:3] + "•" * 8 + value[-2:]


class HostIn(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=80)
    role: Optional[str] = ""
    photo_url: Optional[str] = ""
    booking_url: str = Field(..., min_length=8, max_length=500)
    initials: Optional[str] = ""


class AppSettingsIn(BaseModel):
    resend_api_key: Optional[str] = None       # new value or null
    sender_email: Optional[str] = None
    sender_name: Optional[str] = None
    booking_url_default: Optional[str] = None  # legacy single URL fallback
    hosts: Optional[List[HostIn]] = None


def _settings_to_admin_shape(doc: Optional[dict]) -> Dict[str, Any]:
    doc = doc or {}
    return {
        "resend_api_key_masked": _mask_secret(doc.get("resend_api_key") or RESEND_API_KEY),
        "resend_api_key_set": bool(doc.get("resend_api_key") or RESEND_API_KEY),
        "sender_email": doc.get("sender_email") or SENDER_EMAIL,
        "sender_name": doc.get("sender_name") or SENDER_NAME,
        "booking_url_default": doc.get("booking_url_default") or "",
        "hosts": doc.get("hosts") or [],
        "updated_at": doc.get("updated_at"),
    }


def _settings_to_public_shape(doc: Optional[dict]) -> Dict[str, Any]:
    """Public-safe settings for the front-end (no secrets)."""
    doc = doc or {}
    return {
        "booking_url_default": doc.get("booking_url_default") or "",
        "hosts": doc.get("hosts") or [],
    }


async def _get_settings_doc() -> Dict[str, Any]:
    return await db.app_settings.find_one({"_id": SETTINGS_DOC_ID}) or {}


async def _save_settings(updates: Dict[str, Any]) -> Dict[str, Any]:
    updates["updated_at"] = now_iso()
    await db.app_settings.update_one(
        {"_id": SETTINGS_DOC_ID},
        {"$set": updates, "$setOnInsert": {"created_at": now_iso()}},
        upsert=True,
    )
    return await _get_settings_doc()


def _apply_resend_key_runtime(new_key: Optional[str]):
    if new_key:
        resend.api_key = new_key


@app.get("/api/app-settings")
async def app_settings_get(claims: Dict[str, Any] = Depends(verify_admin)):
    await _require_super_admin(claims)
    doc = await _get_settings_doc()
    return {"success": True, "settings": _settings_to_admin_shape(doc)}


@app.put("/api/app-settings")
async def app_settings_update(payload: AppSettingsIn, claims: Dict[str, Any] = Depends(verify_admin)):
    await _require_super_admin(claims)
    updates: Dict[str, Any] = {}

    if payload.resend_api_key is not None:
        new_key = payload.resend_api_key.strip()
        if new_key and not new_key.startswith("re_"):
            raise HTTPException(400, "Resend API keys start with 're_'")
        updates["resend_api_key"] = new_key
        _apply_resend_key_runtime(new_key or None)

    if payload.sender_email is not None:
        updates["sender_email"] = sanitize_input({"e": payload.sender_email})["e"][:120]

    if payload.sender_name is not None:
        updates["sender_name"] = sanitize_input({"n": payload.sender_name})["n"][:120]

    if payload.booking_url_default is not None:
        updates["booking_url_default"] = sanitize_input({"u": payload.booking_url_default})["u"][:500]

    if payload.hosts is not None:
        cleaned_hosts = []
        for h in payload.hosts:
            cleaned_hosts.append({
                "id": h.id or gen_id(),
                "name": sanitize_input({"n": h.name})["n"][:80],
                "role": sanitize_input({"r": h.role or ""})["r"][:120],
                "photo_url": sanitize_input({"p": h.photo_url or ""})["p"][:1000],
                "initials": sanitize_input({"i": h.initials or ""})["i"][:4].upper(),
                "booking_url": sanitize_input({"b": h.booking_url})["b"][:500],
            })
        updates["hosts"] = cleaned_hosts

    if not updates:
        raise HTTPException(400, "No changes")

    doc = await _save_settings(updates)
    return {"success": True, "settings": _settings_to_admin_shape(doc)}


@app.get("/api/app-settings/public")
async def app_settings_public():
    doc = await _get_settings_doc()
    return {"success": True, "settings": _settings_to_public_shape(doc)}


# ---------------------------------------------------------------------------
# Contact
# ---------------------------------------------------------------------------
@app.post("/api/contact")
async def submit_contact(payload: ContactIn, request: Request):
    data = sanitize_input(payload.model_dump())
    if not is_email(data["email"]):
        raise HTTPException(400, "Invalid email format")

    lead_type = data.get("leadType") or "Contact Inquiry"
    collection_map = {
        "AI Assessment": "ai_assessment_leads",
        "ROI Calculator": "roi_calculator_leads",
        "Service Inquiry": "service_inquiries",
        "Consultation": "consultation_leads",
        "Newsletter Subscription": "newsletter_subscriptions",
    }
    collection_name = collection_map.get(lead_type, "contact_messages")

    doc = {
        "id": gen_id(),
        "name": data["name"],
        "email": data["email"].lower(),
        "company": data.get("company") or "",
        "phone": data.get("phone") or "",
        "service_type": data.get("service_type") or "",
        "subject": data.get("subject") or "",
        "message": data["message"],
        "leadType": lead_type,
        "source": request.headers.get("referer", "Direct"),
        "submitted_at": now_iso(),
        "ip_address": client_ip(request),
        "user_agent": request.headers.get("user-agent", "unknown"),
        "status": "new",
        "timestamp": now_iso(),
    }
    await db[collection_name].insert_one(doc)
    return {
        "message": "Thank you for your inquiry. We will contact you soon.",
        "id": doc["id"],
        "timestamp": doc["timestamp"],
        "leadType": lead_type,
    }


# ---------------------------------------------------------------------------
# Newsletter
# ---------------------------------------------------------------------------
@app.post("/api/newsletter")
async def newsletter(payload: NewsletterIn, request: Request):
    data = sanitize_input(payload.model_dump())
    email = data["email"].lower()
    if not is_email(email):
        raise HTTPException(400, "Invalid email format")

    existing = await db.newsletter_subscriptions.find_one({"email": email})
    if existing:
        return {
            "message": "You are already subscribed to our newsletter!",
            "status": "already_subscribed",
        }

    doc = {
        "id": gen_id(),
        "email": email,
        "first_name": data.get("first_name") or "",
        "name": data.get("name") or data.get("first_name") or "",
        "leadType": "Newsletter Subscription",
        "source": request.headers.get("referer", "Direct"),
        "subscribed_at": now_iso(),
        "ip_address": client_ip(request),
        "user_agent": request.headers.get("user-agent", "unknown"),
        "status": "active",
        "timestamp": now_iso(),
        "confirmed": False,
        "unsubscribed": False,
        "unsubscribed_at": None,
        "unsubscribe_token": secrets.token_urlsafe(24),
        "tags": [],
        "bounced": False,
        "complained": False,
    }
    await db.newsletter_subscriptions.insert_one(doc)
    return {
        "message": "Successfully subscribed to newsletter!",
        "subscription_id": doc["id"],
        "email": email,
        "status": "active",
        "timestamp": doc["timestamp"],
    }


# ---------------------------------------------------------------------------
# AI Assessment
# ---------------------------------------------------------------------------
def calculate_maturity_score(responses: List[AssessmentResponse]) -> int:
    if not responses:
        return 0
    # responses score 1..10 → scale to 100
    total = sum(r.score for r in responses)
    avg = total / len(responses)
    return round(avg * 10)


def generate_recommendations(score: int) -> List[Dict[str, str]]:
    if score < 25:
        return [
            {"title": "AI Foundation Building", "description": "Start with basic AI tools and team training to build fundamental AI capabilities", "priority": "High", "timeline": "3-6 months", "category": "Foundation"},
            {"title": "Data Infrastructure Setup", "description": "Implement proper data collection and management systems as the foundation for AI", "priority": "High", "timeline": "2-4 months", "category": "Infrastructure"},
        ]
    if score < 50:
        return [
            {"title": "Process Automation Implementation", "description": "Implement AI-powered workflow automation to improve efficiency", "priority": "High", "timeline": "6-12 months", "category": "Automation"},
            {"title": "Team AI Training Program", "description": "Comprehensive AI training for your team to maximize adoption", "priority": "Medium", "timeline": "3-6 months", "category": "Training"},
        ]
    if score < 75:
        return [
            {"title": "Advanced AI Integration", "description": "Implement sophisticated AI solutions for predictive analytics and decision support", "priority": "High", "timeline": "6-18 months", "category": "Advanced AI"},
            {"title": "AI Governance Framework", "description": "Establish proper AI governance and ethics guidelines for responsible AI use", "priority": "Medium", "timeline": "3-6 months", "category": "Governance"},
        ]
    return [
        {"title": "AI Innovation Leadership", "description": "Lead industry innovation with cutting-edge AI research and development", "priority": "Strategic", "timeline": "12+ months", "category": "Innovation"},
        {"title": "AI Center of Excellence", "description": "Establish an AI Center of Excellence to drive organization-wide AI initiatives", "priority": "Medium", "timeline": "6-12 months", "category": "Strategic"},
    ]


def score_label(score: int) -> str:
    if score >= 80:
        return "AI Advanced"
    if score >= 60:
        return "AI Ready"
    if score >= 40:
        return "AI Developing"
    return "AI Beginner"


@app.post("/api/ai-assessment")
async def ai_assessment(payload: AssessmentIn, request: Request):
    data = sanitize_input(payload.model_dump())
    score = calculate_maturity_score(payload.responses)
    recs = generate_recommendations(score)

    doc = {
        "assessment_id": gen_id(),
        "user_info": {
            "name": data["name"],
            "email": data["email"].lower(),
            "company": data.get("company") or "",
            "phone": data.get("phone") or "",
            "industry": data.get("industry") or "",
            "company_size": data.get("company_size") or "",
        },
        "responses": [r.model_dump() for r in payload.responses],
        "maturity_score": score,
        "score_label": score_label(score),
        "recommendations": recs,
        "leadType": "AI Assessment",
        "source": request.headers.get("referer", "Direct"),
        "submitted_at": now_iso(),
        "ip_address": client_ip(request),
    }
    await db.ai_assessment_leads.insert_one(doc)
    return {
        "success": True,
        "assessment_id": doc["assessment_id"],
        "maturity_score": score,
        "score_label": doc["score_label"],
        "recommendations": recs,
        "message": "AI assessment completed successfully",
        "timestamp": doc["submitted_at"],
    }


# ---------------------------------------------------------------------------
# ROI Calculator
# ---------------------------------------------------------------------------
REGION_CONFIG = {
    "US": {"pppMultiplier": 1.0,  "currency": "USD", "symbol": "$"},
    "IN": {"pppMultiplier": 5.5,  "currency": "INR", "symbol": "₹"},
    "GB": {"pppMultiplier": 0.85, "currency": "GBP", "symbol": "£"},
    "AE": {"pppMultiplier": 0.75, "currency": "AED", "symbol": "AED"},
    "AU": {"pppMultiplier": 0.90, "currency": "AUD", "symbol": "A$"},
    "NZ": {"pppMultiplier": 0.85, "currency": "NZD", "symbol": "NZ$"},
    "ZA": {"pppMultiplier": 0.35, "currency": "ZAR", "symbol": "R"},
    "EU": {"pppMultiplier": 0.90, "currency": "EUR", "symbol": "€"},
}


def base_cost_from_size(size: str) -> float:
    return {"1-10": 15000, "11-50": 25000, "51-200": 45000, "201-500": 75000, "500+": 120000, "200+": 75000}.get(size, 25000)


@app.post("/api/roi-calculator")
async def roi_calculator(payload: ROIIn, request: Request):
    data = sanitize_input(payload.model_dump())
    region = REGION_CONFIG.get(payload.user_region, REGION_CONFIG["US"])

    project_cost = payload.current_project_cost
    duration = payload.project_duration_months
    efficiency = payload.current_efficiency_rating

    # Efficiency gap → bigger gains for less efficient orgs
    efficiency_gain_pct = (10 - efficiency) * 5 + 25  # 25%..70%
    cost_reduction_pct = (10 - efficiency) * 3 + 20   # 20%..47%
    revenue_boost_pct = 15

    # Annualize
    annualized_cost = project_cost * (12 / max(duration, 1))
    annual_savings = annualized_cost * (cost_reduction_pct / 100)
    revenue_increase = annualized_cost * (revenue_boost_pct / 100)
    total_annual_benefit = annual_savings + revenue_increase

    implementation_cost = base_cost_from_size(payload.company_size) * region["pppMultiplier"]
    roi_pct = ((total_annual_benefit - implementation_cost) / max(implementation_cost, 1)) * 100
    payback_months = max(1, round(implementation_cost / max(total_annual_benefit / 12, 1)))

    recommended_services = [
        {"name": s, "duration": "3-6 months", "description": f"Tailored {s.lower()} solution", "price": implementation_cost / max(len(payload.desired_services), 1)}
        for s in (payload.desired_services or ["AI Project Management", "Digital Transformation"])
    ]

    metrics = {
        "potential_savings": round(total_annual_benefit),
        "roi_percentage": round(roi_pct),
        "payback_period_months": payback_months,
        "estimated_project_cost": round(implementation_cost),
        "monthly_savings": round(total_annual_benefit / 12),
        "regional_currency": region["currency"],
        "currency_symbol": region["symbol"],
        "efficiency_gain_percent": round(efficiency_gain_pct),
        "cost_reduction_percent": round(cost_reduction_pct),
        "revenue_boost_percent": revenue_boost_pct,
        "recommended_services": recommended_services,
    }

    doc = {
        "calculation_id": gen_id(),
        "business_inputs": data,
        "calculated_metrics": metrics,
        "leadType": "ROI Calculator",
        "source": request.headers.get("referer", "Direct"),
        "submitted_at": now_iso(),
        "ip_address": client_ip(request),
    }
    await db.roi_calculator_leads.insert_one(doc)
    return {
        "success": True,
        "calculation_id": doc["calculation_id"],
        "company_name": payload.company_name,
        **metrics,
        "message": "ROI calculation completed successfully",
        "timestamp": doc["submitted_at"],
    }


# ---------------------------------------------------------------------------
# Consultation
# ---------------------------------------------------------------------------
@app.post("/api/consultation")
async def consultation(payload: ConsultationIn, request: Request):
    data = sanitize_input(payload.model_dump())
    email = data["email"].lower()
    if payload.phone and not is_phone(payload.phone):
        raise HTTPException(400, "Invalid phone number")

    # Dedupe within 24h
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    existing = await db.consultation_leads.find_one({
        "consultation_details.email": email,
        "submitted_at": {"$gte": cutoff},
    })
    if existing:
        raise HTTPException(status_code=409, detail="You already submitted a consultation request in the last 24 hours. We will contact you soon.")

    doc = {
        "consultation_id": gen_id(),
        "consultation_details": {
            "full_name": data["name"],
            "email": email,
            "company": data.get("company") or "",
            "phone": data.get("phone") or "",
            "consultation_type": data["service_type"],
            "industry": data.get("industry") or "",
            "requirements": data.get("message") or "",
        },
        "preferred_datetime": payload.preferred_datetime or None,
        "timezone": payload.timezone or "America/New_York",
        "status": "pending",
        "leadType": "Consultation Request",
        "source": request.headers.get("referer", "smart_calendar"),
        "submitted_at": now_iso(),
        "ip_address": client_ip(request),
    }
    await db.consultation_leads.insert_one(doc)
    return {
        "success": True,
        "consultation_id": doc["consultation_id"],
        "message": "Thank you for booking a consultation! We will contact you within 24 hours to confirm.",
        "details": {
            "service_type": payload.service_type,
            "preferred_datetime": payload.preferred_datetime,
            "timezone": payload.timezone,
            "status": "pending",
        },
        "timestamp": doc["submitted_at"],
    }


# ---------------------------------------------------------------------------
# Admin (auth required)
# ---------------------------------------------------------------------------
async def _fetch_collection(name: str, page: int, page_size: int):
    cursor = db[name].find({}, {"_id": 0}).sort([("submitted_at", -1), ("subscribed_at", -1)]).skip((page - 1) * page_size).limit(page_size)
    return await cursor.to_list(length=page_size)


@app.get("/api/admin")
async def admin_dashboard(
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=500),
    _user = Depends(verify_admin),
):
    data: Dict[str, list] = {}
    counts: Dict[str, int] = {}
    for name in VALID_COLLECTIONS:
        data[name] = await _fetch_collection(name, page, page_size)
        counts[name] = await db[name].count_documents({})

    total_leads = sum(counts.values())
    return {
        "success": True,
        "pagination": {"page": page, "page_size": page_size},
        "summary": {
            "total_leads": total_leads,
            "total_newsletters": counts["newsletter_subscriptions"],
            "total_contacts": counts["contact_messages"],
            "total_ai_assessments": counts["ai_assessment_leads"],
            "total_roi_calculators": counts["roi_calculator_leads"],
            "total_service_inquiries": counts["service_inquiries"],
            "total_consultations": counts["consultation_leads"],
            "last_updated": now_iso(),
            "breakdown": {
                "newsletters": counts["newsletter_subscriptions"],
                "contact_messages": counts["contact_messages"],
                "ai_assessments": counts["ai_assessment_leads"],
                "roi_calculators": counts["roi_calculator_leads"],
                "service_inquiries": counts["service_inquiries"],
                "consultations": counts["consultation_leads"],
            },
        },
        "data": {
            "newsletters": data["newsletter_subscriptions"],
            "contact_messages": data["contact_messages"],
            "ai_assessment_leads": data["ai_assessment_leads"],
            "roi_calculator_leads": data["roi_calculator_leads"],
            "service_inquiries": data["service_inquiries"],
            "consultation_leads": data["consultation_leads"],
        },
        "timestamp": now_iso(),
    }


@app.delete("/api/admin-delete")
async def admin_delete(
    deleteType: str = Query(...),
    collection: Optional[str] = Query(None),
    leadId: Optional[str] = Query(None),
    _user = Depends(verify_admin),
):
    if deleteType == "all":
        total = 0
        breakdown: Dict[str, int] = {}
        for name in VALID_COLLECTIONS:
            res = await db[name].delete_many({})
            breakdown[name] = res.deleted_count
            total += res.deleted_count
        return {"success": True, "message": f"Deleted {total} leads", "deletedCount": total, "breakdown": breakdown, "timestamp": now_iso(), "operation": "all"}

    if deleteType == "collection":
        if not collection or collection not in VALID_COLLECTIONS:
            raise HTTPException(400, "Invalid collection")
        res = await db[collection].delete_many({})
        return {"success": True, "message": f"Deleted {res.deleted_count} leads from {collection}", "deletedCount": res.deleted_count, "collection": collection, "timestamp": now_iso(), "operation": "collection"}

    if deleteType == "single":
        if not collection or collection not in VALID_COLLECTIONS or not leadId:
            raise HTTPException(400, "Invalid request")
        res = await db[collection].delete_one({"id": leadId})
        if res.deleted_count == 0:
            return {"success": False, "message": f"Lead {leadId} not found in {collection}", "deletedCount": 0, "timestamp": now_iso(), "operation": "single"}
        return {"success": True, "message": f"Deleted {leadId} from {collection}", "deletedCount": 1, "collection": collection, "leadId": leadId, "timestamp": now_iso(), "operation": "single"}

    raise HTTPException(400, "Invalid deleteType. Use all/collection/single.")


# ===========================================================================
# Blog
# ===========================================================================
import base64 as _b64
import unicodedata


def slugify(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = text.lower()
    text = re.sub(r"['\"]", "", text)
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text[:80]


def parse_data_url(value: Optional[str]):
    if not value or not isinstance(value, str) or not value.startswith("data:"):
        return None
    m = re.match(r"^data:([^;]+);base64,(.+)$", value)
    if not m:
        return None
    return {"mime": m.group(1).lower(), "b64": m.group(2)}


def validate_image_field(field: str, value: Optional[str]):
    if not value:
        return None
    parsed = parse_data_url(value)
    if not parsed:
        raise HTTPException(400, f"{field}: invalid data URL")
    if parsed["mime"] not in ALLOWED_IMAGE_MIME:
        raise HTTPException(400, f"{field}: unsupported image type ({parsed['mime']})")
    approx_bytes = (len(parsed["b64"]) * 3) // 4
    if approx_bytes > MAX_IMAGE_BYTES:
        raise HTTPException(400, f"{field}: image too large (max {MAX_IMAGE_BYTES // 1024} KB)")
    return parsed


def strip_unsafe_html(html: str) -> str:
    html = re.sub(r"<script\b[^<]*(?:(?!</script>)<[^<]*)*</script>", "", html, flags=re.IGNORECASE)
    html = re.sub(r"javascript:", "", html, flags=re.IGNORECASE)
    html = re.sub(r"\son\w+\s*=\s*\"[^\"]*\"", "", html, flags=re.IGNORECASE)
    html = re.sub(r"\son\w+\s*=\s*'[^']*'", "", html, flags=re.IGNORECASE)
    return html


def estimate_reading_minutes(html: str) -> int:
    text = re.sub(r"<[^>]*>", " ", html or "")
    words = len([w for w in text.split() if w])
    return max(1, round(words / 220))


def build_excerpt(html: str, max_chars: int = 220) -> str:
    text = re.sub(r"<[^>]*>", " ", html or "")
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= max_chars:
        return text
    return text[: max_chars - 1].rsplit(" ", 1)[0] + "…"


class BlogPostIn(BaseModel):
    title: str = Field(..., min_length=1, max_length=250)
    slug: Optional[str] = ""
    excerpt: Optional[str] = ""
    content_html: str = Field(..., min_length=1)
    cover_image_url: Optional[str] = None  # data: URL or null/""
    og_image_url: Optional[str] = None
    author: Optional[str] = "Orgainse Consulting"
    category: Optional[str] = ""
    tags: Optional[List[str]] = []
    status: Optional[str] = "draft"  # "draft" | "published"
    seo_title: Optional[str] = ""
    seo_description: Optional[str] = ""


def _build_post_doc(input_obj: dict, existing: Optional[dict]) -> dict:
    cleaned = sanitize_input({
        "title": (input_obj.get("title") or "")[:250],
        "excerpt": (input_obj.get("excerpt") or "")[:500],
        "author": (input_obj.get("author") or "Orgainse Consulting")[:100],
        "category": (input_obj.get("category") or "")[:80],
        "seo_title": (input_obj.get("seo_title") or "")[:250],
        "seo_description": (input_obj.get("seo_description") or "")[:320],
    })

    html = input_obj.get("content_html") or ""
    if len(html.encode("utf-8")) > MAX_HTML_BYTES:
        raise HTTPException(400, f"content_html too large (>{MAX_HTML_BYTES // 1024} KB)")
    html = strip_unsafe_html(html)

    raw_tags = input_obj.get("tags") or []
    if isinstance(raw_tags, str):
        raw_tags = raw_tags.split(",")
    tags = [str(t).strip()[:40] for t in raw_tags if str(t).strip()][:12]

    status_in = input_obj.get("status") or "draft"
    post_status = "published" if status_in == "published" else "draft"

    cover = validate_image_field("cover_image_url", input_obj.get("cover_image_url"))
    og_img = validate_image_field("og_image_url", input_obj.get("og_image_url"))

    slug_raw = (input_obj.get("slug") or "").strip().lower()
    slug = slugify(slug_raw) if slug_raw else slugify(cleaned["title"])
    if not slug:
        raise HTTPException(400, "slug or title required to derive slug")
    if not SLUG_RE.match(slug):
        raise HTTPException(400, "slug must be lowercase letters, digits, hyphens")

    excerpt = cleaned["excerpt"] or build_excerpt(html)
    reading_minutes = estimate_reading_minutes(html)

    explicit_clear_cover = input_obj.get("cover_image_url") == ""
    explicit_clear_og = input_obj.get("og_image_url") == ""

    doc = {
        "id": (existing or {}).get("id") or gen_id(),
        "slug": slug,
        "title": cleaned["title"],
        "excerpt": excerpt,
        "content_html": html,
        "cover_image_b64": (cover or {}).get("b64") if cover else (None if explicit_clear_cover else (existing or {}).get("cover_image_b64")),
        "cover_image_mime": (cover or {}).get("mime") if cover else (None if explicit_clear_cover else (existing or {}).get("cover_image_mime")),
        "og_image_b64": (og_img or {}).get("b64") if og_img else (None if explicit_clear_og else (existing or {}).get("og_image_b64")),
        "og_image_mime": (og_img or {}).get("mime") if og_img else (None if explicit_clear_og else (existing or {}).get("og_image_mime")),
        "author": cleaned["author"],
        "category": cleaned["category"],
        "tags": tags,
        "seo_title": cleaned["seo_title"] or cleaned["title"],
        "seo_description": cleaned["seo_description"] or excerpt,
        "status": post_status,
        "reading_minutes": reading_minutes,
        "created_at": (existing or {}).get("created_at") or now_iso(),
        "updated_at": now_iso(),
        "published_at": (
            now_iso() if post_status == "published" and not (
                (existing or {}).get("published_at") and (existing or {}).get("status") == "published"
            ) else (existing or {}).get("published_at")
        ),
    }
    if post_status != "published":
        doc["published_at"] = None
    return doc


def _to_admin_shape(doc: dict) -> dict:
    if not doc:
        return None
    cover = f"data:{doc['cover_image_mime']};base64,{doc['cover_image_b64']}" if doc.get("cover_image_mime") and doc.get("cover_image_b64") else None
    og = f"data:{doc['og_image_mime']};base64,{doc['og_image_b64']}" if doc.get("og_image_mime") and doc.get("og_image_b64") else None
    return {
        "id": doc.get("id"),
        "slug": doc.get("slug"),
        "title": doc.get("title"),
        "excerpt": doc.get("excerpt") or "",
        "content_html": doc.get("content_html") or "",
        "cover_image_url": cover,
        "og_image_url": og,
        "author": doc.get("author") or "",
        "category": doc.get("category") or "",
        "tags": doc.get("tags") or [],
        "status": doc.get("status") or "draft",
        "reading_minutes": doc.get("reading_minutes") or 1,
        "seo_title": doc.get("seo_title") or "",
        "seo_description": doc.get("seo_description") or "",
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
        "published_at": doc.get("published_at"),
    }


def _to_public_shape(doc: dict, full: bool = False) -> dict:
    if not doc:
        return None
    cover = f"data:{doc['cover_image_mime']};base64,{doc['cover_image_b64']}" if doc.get("cover_image_mime") and doc.get("cover_image_b64") else None
    og = f"data:{doc['og_image_mime']};base64,{doc['og_image_b64']}" if doc.get("og_image_mime") and doc.get("og_image_b64") else None
    out = {
        "id": doc.get("id"),
        "slug": doc.get("slug"),
        "title": doc.get("title"),
        "excerpt": doc.get("excerpt") or "",
        "author": doc.get("author") or "Orgainse Consulting",
        "category": doc.get("category") or "",
        "tags": doc.get("tags") or [],
        "reading_minutes": doc.get("reading_minutes") or 1,
        "cover_image_url": cover,
        "og_image_url": og,
        "seo_title": doc.get("seo_title") or doc.get("title"),
        "seo_description": doc.get("seo_description") or doc.get("excerpt") or "",
        "published_at": doc.get("published_at"),
        "updated_at": doc.get("updated_at"),
    }
    if full:
        out["content_html"] = doc.get("content_html") or ""
    return out


# ---------- Public blog endpoints ----------
@app.get("/api/blog")
async def blog_list(
    slug: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    category: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
):
    if slug:
        doc = await db.blog_posts.find_one({"slug": slug, "status": "published"}, {"_id": 0})
        if not doc:
            raise HTTPException(404, "Post not found")
        return {"success": True, "post": _to_public_shape(doc, full=True)}

    filt: Dict[str, Any] = {"status": "published"}
    if category:
        filt["category"] = category
    if tag:
        filt["tags"] = tag

    cursor = db.blog_posts.find(filt, {"_id": 0}).sort("published_at", -1).skip((page - 1) * page_size).limit(page_size)
    rows = await cursor.to_list(length=page_size)
    total = await db.blog_posts.count_documents(filt)
    return {
        "success": True,
        "pagination": {"page": page, "page_size": page_size, "total": total},
        "posts": [_to_public_shape(r, full=False) for r in rows],
    }


# ---------- Admin blog endpoints ----------
@app.get("/api/blog-admin")
async def blog_admin_list(
    id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    _user = Depends(verify_admin),
):
    if id:
        doc = await db.blog_posts.find_one({"id": id}, {"_id": 0})
        if not doc:
            raise HTTPException(404, "Post not found")
        return {"success": True, "post": _to_admin_shape(doc)}
    cursor = db.blog_posts.find({}, {"_id": 0, "content_html": 0, "cover_image_b64": 0, "og_image_b64": 0}).sort("updated_at", -1).skip((page - 1) * page_size).limit(page_size)
    rows = await cursor.to_list(length=page_size)
    total = await db.blog_posts.count_documents({})
    return {
        "success": True,
        "pagination": {"page": page, "page_size": page_size, "total": total},
        "posts": [_to_admin_shape({**r, "content_html": "", "cover_image_b64": None, "og_image_b64": None}) for r in rows],
    }


@app.post("/api/blog-admin")
async def blog_admin_create(payload: BlogPostIn, _user = Depends(verify_admin)):
    data = payload.model_dump()
    doc = _build_post_doc(data, existing=None)
    # Slug uniqueness
    existing = await db.blog_posts.find_one({"slug": doc["slug"]}, {"_id": 1})
    if existing:
        raise HTTPException(400, "slug already in use")
    await db.blog_posts.insert_one(doc)
    return {"success": True, "post": _to_admin_shape(doc)}


@app.put("/api/blog-admin")
async def blog_admin_update(
    payload: BlogPostIn,
    id: str = Query(...),
    _user = Depends(verify_admin),
):
    existing = await db.blog_posts.find_one({"id": id})
    if not existing:
        raise HTTPException(404, "Post not found")
    data = payload.model_dump()
    doc = _build_post_doc(data, existing=existing)
    # Slug uniqueness (excluding self)
    dup = await db.blog_posts.find_one({"slug": doc["slug"], "id": {"$ne": doc["id"]}}, {"_id": 1})
    if dup:
        raise HTTPException(400, "slug already in use")
    await db.blog_posts.replace_one({"id": id}, doc)
    return {"success": True, "post": _to_admin_shape(doc)}


@app.delete("/api/blog-admin")
async def blog_admin_delete(
    id: str = Query(...),
    _user = Depends(verify_admin),
):
    r = await db.blog_posts.delete_one({"id": id})
    if r.deleted_count == 0:
        raise HTTPException(404, "Post not found")
    return {"success": True, "deleted": id}


# ===========================================================================
# Newsletter — Issues, Subscribers, Segments, Send, Unsubscribe
# ===========================================================================
LOGO_URL = "https://customer-assets.emergentagent.com/job_digital-presence-29/artifacts/xx6a5zd7_Copy%20of%20OrgAInse%20Consulting%20%28Website%29.png"


class NewsletterIssueIn(BaseModel):
    title: str = Field(..., min_length=1, max_length=250)
    slug: Optional[str] = ""
    subtitle: Optional[str] = ""
    issue_number: Optional[int] = None
    edition_date: Optional[str] = ""
    content_html: str = Field(..., min_length=1)
    cover_image_url: Optional[str] = None
    og_image_url: Optional[str] = None
    category: Optional[str] = ""
    tags: Optional[List[str]] = []
    status: Optional[str] = "draft"
    seo_title: Optional[str] = ""
    seo_description: Optional[str] = ""
    preview_text: Optional[str] = ""


class ManualSubscriberIn(BaseModel):
    email: EmailStr
    name: Optional[str] = ""
    tags: Optional[List[str]] = []


class SubscriberUpdateIn(BaseModel):
    name: Optional[str] = None
    tags: Optional[List[str]] = None
    unsubscribed: Optional[bool] = None
    bounced: Optional[bool] = None


class SegmentIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    slug: Optional[str] = ""
    description: Optional[str] = ""


class SendIssueIn(BaseModel):
    segment_slug: Optional[str] = None
    test_email: Optional[EmailStr] = None


def _build_issue_doc(input_obj: dict, existing: Optional[dict]) -> dict:
    cleaned = sanitize_input({
        "title": (input_obj.get("title") or "")[:250],
        "subtitle": (input_obj.get("subtitle") or "")[:250],
        "category": (input_obj.get("category") or "")[:80],
        "seo_title": (input_obj.get("seo_title") or "")[:250],
        "seo_description": (input_obj.get("seo_description") or "")[:320],
        "preview_text": (input_obj.get("preview_text") or "")[:200],
    })

    html = input_obj.get("content_html") or ""
    if len(html.encode("utf-8")) > MAX_HTML_BYTES:
        raise HTTPException(400, f"content_html too large (>{MAX_HTML_BYTES // 1024} KB)")
    html = strip_unsafe_html(html)

    raw_tags = input_obj.get("tags") or []
    if isinstance(raw_tags, str):
        raw_tags = raw_tags.split(",")
    tags = [str(t).strip()[:40] for t in raw_tags if str(t).strip()][:12]

    status_in = input_obj.get("status") or "draft"
    post_status = status_in if status_in in ("draft", "published", "sent") else "draft"

    cover = validate_image_field("cover_image_url", input_obj.get("cover_image_url"))
    og_img = validate_image_field("og_image_url", input_obj.get("og_image_url"))

    slug_raw = (input_obj.get("slug") or "").strip().lower()
    slug = slugify(slug_raw) if slug_raw else slugify(cleaned["title"])
    if not slug:
        raise HTTPException(400, "slug or title required to derive slug")
    if not SLUG_RE.match(slug):
        raise HTTPException(400, "slug must be lowercase letters, digits, hyphens")

    excerpt = build_excerpt(html)
    reading_minutes = estimate_reading_minutes(html)

    issue_number = input_obj.get("issue_number")
    if issue_number is not None and not isinstance(issue_number, int):
        try:
            issue_number = int(issue_number)
        except (TypeError, ValueError):
            issue_number = None

    edition_date = (input_obj.get("edition_date") or "").strip() or None

    explicit_clear_cover = input_obj.get("cover_image_url") == ""
    explicit_clear_og = input_obj.get("og_image_url") == ""

    doc = {
        "id": (existing or {}).get("id") or gen_id(),
        "slug": slug,
        "title": cleaned["title"],
        "subtitle": cleaned["subtitle"],
        "issue_number": issue_number if issue_number is not None else (existing or {}).get("issue_number"),
        "edition_date": edition_date or (existing or {}).get("edition_date"),
        "preview_text": cleaned["preview_text"],
        "content_html": html,
        "excerpt": excerpt,
        "cover_image_b64": (cover or {}).get("b64") if cover else (None if explicit_clear_cover else (existing or {}).get("cover_image_b64")),
        "cover_image_mime": (cover or {}).get("mime") if cover else (None if explicit_clear_cover else (existing or {}).get("cover_image_mime")),
        "og_image_b64": (og_img or {}).get("b64") if og_img else (None if explicit_clear_og else (existing or {}).get("og_image_b64")),
        "og_image_mime": (og_img or {}).get("mime") if og_img else (None if explicit_clear_og else (existing or {}).get("og_image_mime")),
        "category": cleaned["category"],
        "tags": tags,
        "seo_title": cleaned["seo_title"] or cleaned["title"],
        "seo_description": cleaned["seo_description"] or excerpt,
        "reading_minutes": reading_minutes,
        "status": post_status,
        "created_at": (existing or {}).get("created_at") or now_iso(),
        "updated_at": now_iso(),
        "published_at": now_iso() if post_status in ("published", "sent") and not (
            (existing or {}).get("published_at") and (existing or {}).get("status") in ("published", "sent")
        ) else (existing or {}).get("published_at"),
        "sent_at": (existing or {}).get("sent_at"),
        "send_stats": (existing or {}).get("send_stats") or {"total_recipients": 0, "sent": 0, "failed": 0, "skipped": 0},
    }
    if post_status == "draft":
        doc["published_at"] = None
    return doc


def _issue_to_admin_shape(doc: dict) -> dict:
    if not doc:
        return None
    cover = f"data:{doc['cover_image_mime']};base64,{doc['cover_image_b64']}" if doc.get("cover_image_mime") and doc.get("cover_image_b64") else None
    og = f"data:{doc['og_image_mime']};base64,{doc['og_image_b64']}" if doc.get("og_image_mime") and doc.get("og_image_b64") else None
    return {
        "id": doc.get("id"),
        "slug": doc.get("slug"),
        "title": doc.get("title"),
        "subtitle": doc.get("subtitle") or "",
        "issue_number": doc.get("issue_number"),
        "edition_date": doc.get("edition_date"),
        "preview_text": doc.get("preview_text") or "",
        "content_html": doc.get("content_html") or "",
        "excerpt": doc.get("excerpt") or "",
        "cover_image_url": cover,
        "og_image_url": og,
        "category": doc.get("category") or "",
        "tags": doc.get("tags") or [],
        "seo_title": doc.get("seo_title") or "",
        "seo_description": doc.get("seo_description") or "",
        "reading_minutes": doc.get("reading_minutes") or 1,
        "status": doc.get("status") or "draft",
        "send_stats": doc.get("send_stats") or {"total_recipients": 0, "sent": 0, "failed": 0, "skipped": 0},
        "created_at": doc.get("created_at"),
        "updated_at": doc.get("updated_at"),
        "published_at": doc.get("published_at"),
        "sent_at": doc.get("sent_at"),
    }


def _issue_to_public_shape(doc: dict, full: bool = False) -> dict:
    if not doc:
        return None
    cover = f"data:{doc['cover_image_mime']};base64,{doc['cover_image_b64']}" if doc.get("cover_image_mime") and doc.get("cover_image_b64") else None
    og = f"data:{doc['og_image_mime']};base64,{doc['og_image_b64']}" if doc.get("og_image_mime") and doc.get("og_image_b64") else None
    out = {
        "id": doc.get("id"),
        "slug": doc.get("slug"),
        "title": doc.get("title"),
        "subtitle": doc.get("subtitle") or "",
        "issue_number": doc.get("issue_number"),
        "edition_date": doc.get("edition_date"),
        "excerpt": doc.get("excerpt") or "",
        "category": doc.get("category") or "",
        "tags": doc.get("tags") or [],
        "reading_minutes": doc.get("reading_minutes") or 1,
        "cover_image_url": cover,
        "og_image_url": og,
        "seo_title": doc.get("seo_title") or doc.get("title"),
        "seo_description": doc.get("seo_description") or doc.get("excerpt") or "",
        "published_at": doc.get("published_at"),
        "updated_at": doc.get("updated_at"),
    }
    if full:
        out["content_html"] = doc.get("content_html") or ""
    return out


# ---------- Public newsletter endpoints ----------
@app.get("/api/newsletter-issues")
async def newsletter_issues_list(
    slug: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    category: Optional[str] = Query(None),
):
    if slug:
        doc = await db.newsletter_issues.find_one(
            {"slug": slug, "status": {"$in": ["published", "sent"]}}, {"_id": 0}
        )
        if not doc:
            raise HTTPException(404, "Issue not found")
        return {"success": True, "issue": _issue_to_public_shape(doc, full=True)}

    filt: Dict[str, Any] = {"status": {"$in": ["published", "sent"]}}
    if category:
        filt["category"] = category

    cursor = db.newsletter_issues.find(filt, {"_id": 0}).sort("published_at", -1).skip((page - 1) * page_size).limit(page_size)
    rows = await cursor.to_list(length=page_size)
    total = await db.newsletter_issues.count_documents(filt)
    return {
        "success": True,
        "pagination": {"page": page, "page_size": page_size, "total": total},
        "issues": [_issue_to_public_shape(r, full=False) for r in rows],
    }


# ---------- Admin: Issues ----------
@app.get("/api/newsletter-admin/issues")
async def admin_issues_list(
    id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    _user = Depends(verify_admin),
):
    if id:
        doc = await db.newsletter_issues.find_one({"id": id}, {"_id": 0})
        if not doc:
            raise HTTPException(404, "Issue not found")
        return {"success": True, "issue": _issue_to_admin_shape(doc)}
    cursor = db.newsletter_issues.find(
        {}, {"_id": 0, "content_html": 0, "cover_image_b64": 0, "og_image_b64": 0}
    ).sort("updated_at", -1).skip((page - 1) * page_size).limit(page_size)
    rows = await cursor.to_list(length=page_size)
    total = await db.newsletter_issues.count_documents({})
    return {
        "success": True,
        "pagination": {"page": page, "page_size": page_size, "total": total},
        "issues": [_issue_to_admin_shape({**r, "content_html": "", "cover_image_b64": None, "og_image_b64": None}) for r in rows],
    }


@app.post("/api/newsletter-admin/issues")
async def admin_issue_create(payload: NewsletterIssueIn, _user = Depends(verify_admin)):
    doc = _build_issue_doc(payload.model_dump(), existing=None)
    existing = await db.newsletter_issues.find_one({"slug": doc["slug"]}, {"_id": 1})
    if existing:
        raise HTTPException(400, "slug already in use")
    await db.newsletter_issues.insert_one(doc)
    return {"success": True, "issue": _issue_to_admin_shape(doc)}


@app.put("/api/newsletter-admin/issues")
async def admin_issue_update(
    payload: NewsletterIssueIn,
    id: str = Query(...),
    _user = Depends(verify_admin),
):
    existing = await db.newsletter_issues.find_one({"id": id})
    if not existing:
        raise HTTPException(404, "Issue not found")
    doc = _build_issue_doc(payload.model_dump(), existing=existing)
    dup = await db.newsletter_issues.find_one({"slug": doc["slug"], "id": {"$ne": doc["id"]}}, {"_id": 1})
    if dup:
        raise HTTPException(400, "slug already in use")
    await db.newsletter_issues.replace_one({"id": id}, doc)
    return {"success": True, "issue": _issue_to_admin_shape(doc)}


@app.delete("/api/newsletter-admin/issues")
async def admin_issue_delete(id: str = Query(...), _user = Depends(verify_admin)):
    r = await db.newsletter_issues.delete_one({"id": id})
    if r.deleted_count == 0:
        raise HTTPException(404, "Issue not found")
    return {"success": True, "deleted": id}


# ---------- Admin: Segments ----------
@app.get("/api/newsletter-admin/segments")
async def admin_segments_list(_user = Depends(verify_admin)):
    rows = await db.newsletter_segments.find({}, {"_id": 0}).sort("name", 1).to_list(length=200)
    return {"success": True, "segments": rows}


@app.post("/api/newsletter-admin/segments")
async def admin_segment_create(payload: SegmentIn, _user = Depends(verify_admin)):
    name = sanitize_input({"name": payload.name})["name"]
    slug_in = (payload.slug or "").strip().lower()
    slug = slugify(slug_in) if slug_in else slugify(name)
    if not slug or not SLUG_RE.match(slug):
        raise HTTPException(400, "Invalid segment slug")
    existing = await db.newsletter_segments.find_one({"slug": slug}, {"_id": 1})
    if existing:
        raise HTTPException(400, "Segment slug already in use")
    doc = {
        "id": gen_id(),
        "name": name,
        "slug": slug,
        "description": sanitize_input({"d": payload.description or ""})["d"][:250],
        "created_at": now_iso(),
    }
    await db.newsletter_segments.insert_one(doc)
    return {"success": True, "segment": {k: v for k, v in doc.items() if k != "_id"}}


@app.delete("/api/newsletter-admin/segments")
async def admin_segment_delete(id: str = Query(...), _user = Depends(verify_admin)):
    seg = await db.newsletter_segments.find_one({"id": id})
    if not seg:
        raise HTTPException(404, "Segment not found")
    await db.newsletter_segments.delete_one({"id": id})
    await db.newsletter_subscriptions.update_many({"tags": seg["slug"]}, {"$pull": {"tags": seg["slug"]}})
    return {"success": True, "deleted": id}


# ---------- Admin: Subscribers ----------
def _sub_to_shape(doc: dict) -> dict:
    if not doc:
        return None
    return {
        "id": doc.get("id"),
        "email": doc.get("email"),
        "name": doc.get("name") or doc.get("first_name") or "",
        "tags": doc.get("tags") or [],
        "source": doc.get("source") or "",
        "subscribed_at": doc.get("subscribed_at") or doc.get("timestamp"),
        "unsubscribed": bool(doc.get("unsubscribed")),
        "unsubscribed_at": doc.get("unsubscribed_at"),
        "bounced": bool(doc.get("bounced")),
        "complained": bool(doc.get("complained")),
        "status": "unsubscribed" if doc.get("unsubscribed") else ("bounced" if doc.get("bounced") else "active"),
    }


@app.get("/api/newsletter-admin/subscribers")
async def admin_subs_list(
    q: Optional[str] = Query(None),
    segment: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    _user = Depends(verify_admin),
):
    filt: Dict[str, Any] = {}
    if q:
        regex = {"$regex": re.escape(q.strip()), "$options": "i"}
        filt["$or"] = [{"email": regex}, {"name": regex}, {"first_name": regex}]
    if segment:
        filt["tags"] = segment
    if state == "active":
        filt["unsubscribed"] = {"$ne": True}
        filt["bounced"] = {"$ne": True}
    elif state == "unsubscribed":
        filt["unsubscribed"] = True
    elif state == "bounced":
        filt["bounced"] = True

    cursor = db.newsletter_subscriptions.find(filt, {"_id": 0}).sort("subscribed_at", -1).skip((page - 1) * page_size).limit(page_size)
    rows = await cursor.to_list(length=page_size)
    total = await db.newsletter_subscriptions.count_documents(filt)
    active = await db.newsletter_subscriptions.count_documents({"unsubscribed": {"$ne": True}, "bounced": {"$ne": True}})
    unsubscribed = await db.newsletter_subscriptions.count_documents({"unsubscribed": True})
    bounced = await db.newsletter_subscriptions.count_documents({"bounced": True})

    return {
        "success": True,
        "pagination": {"page": page, "page_size": page_size, "total": total},
        "counts": {"active": active, "unsubscribed": unsubscribed, "bounced": bounced},
        "subscribers": [_sub_to_shape(r) for r in rows],
    }


@app.post("/api/newsletter-admin/subscribers")
async def admin_sub_create(payload: ManualSubscriberIn, _user = Depends(verify_admin)):
    email = payload.email.lower().strip()
    if not is_email(email):
        raise HTTPException(400, "Invalid email")
    existing = await db.newsletter_subscriptions.find_one({"email": email})
    if existing:
        raise HTTPException(400, "Email already subscribed")
    tags = [str(t).strip()[:40] for t in (payload.tags or []) if str(t).strip()][:20]
    doc = {
        "id": gen_id(),
        "email": email,
        "name": (payload.name or "").strip()[:120],
        "first_name": (payload.name or "").strip()[:120],
        "leadType": "Newsletter Subscription",
        "source": "admin_added",
        "subscribed_at": now_iso(),
        "timestamp": now_iso(),
        "status": "active",
        "tags": tags,
        "unsubscribed": False,
        "unsubscribed_at": None,
        "unsubscribe_token": secrets.token_urlsafe(24),
        "bounced": False,
        "complained": False,
        "confirmed": True,
    }
    await db.newsletter_subscriptions.insert_one(doc)
    return {"success": True, "subscriber": _sub_to_shape(doc)}


@app.put("/api/newsletter-admin/subscribers")
async def admin_sub_update(
    payload: SubscriberUpdateIn,
    id: str = Query(...),
    _user = Depends(verify_admin),
):
    existing = await db.newsletter_subscriptions.find_one({"id": id})
    if not existing:
        raise HTTPException(404, "Subscriber not found")
    update: Dict[str, Any] = {}
    if payload.name is not None:
        update["name"] = payload.name.strip()[:120]
        update["first_name"] = update["name"]
    if payload.tags is not None:
        update["tags"] = [str(t).strip()[:40] for t in payload.tags if str(t).strip()][:20]
    if payload.unsubscribed is not None:
        update["unsubscribed"] = bool(payload.unsubscribed)
        update["unsubscribed_at"] = now_iso() if payload.unsubscribed else None
    if payload.bounced is not None:
        update["bounced"] = bool(payload.bounced)
    if update:
        await db.newsletter_subscriptions.update_one({"id": id}, {"$set": update})
    doc = await db.newsletter_subscriptions.find_one({"id": id}, {"_id": 0})
    return {"success": True, "subscriber": _sub_to_shape(doc)}


@app.delete("/api/newsletter-admin/subscribers")
async def admin_sub_delete(id: str = Query(...), _user = Depends(verify_admin)):
    r = await db.newsletter_subscriptions.delete_one({"id": id})
    if r.deleted_count == 0:
        raise HTTPException(404, "Subscriber not found")
    return {"success": True, "deleted": id}


@app.get("/api/newsletter-admin/subscribers/export")
async def admin_subs_export_csv(
    segment: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    _user = Depends(verify_admin),
):
    filt: Dict[str, Any] = {}
    if segment:
        filt["tags"] = segment
    if state == "active":
        filt["unsubscribed"] = {"$ne": True}
        filt["bounced"] = {"$ne": True}
    elif state == "unsubscribed":
        filt["unsubscribed"] = True
    elif state == "bounced":
        filt["bounced"] = True

    rows = await db.newsletter_subscriptions.find(filt, {"_id": 0}).sort("subscribed_at", -1).to_list(length=100000)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["email", "name", "tags", "source", "subscribed_at", "status"])
    for r in rows:
        shape = _sub_to_shape(r)
        writer.writerow([
            shape["email"],
            shape["name"],
            ",".join(shape["tags"] or []),
            shape["source"],
            shape["subscribed_at"] or "",
            shape["status"],
        ])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="orgainse-subscribers-{datetime.now(timezone.utc).strftime("%Y-%m-%d")}.csv"'},
    )


# ---------- Email rendering ----------
def render_newsletter_email_html(issue: dict, recipient_token: str, recipient_email: str) -> str:
    unsubscribe_url = f"{PUBLIC_SITE_URL}/unsubscribe?token={recipient_token}"
    view_in_browser_url = f"{PUBLIC_SITE_URL}/newsletter/{issue['slug']}"
    cover = None
    if issue.get("cover_image_mime") and issue.get("cover_image_b64"):
        cover = f"data:{issue['cover_image_mime']};base64,{issue['cover_image_b64']}"
    issue_number = issue.get("issue_number")
    edition_date = issue.get("edition_date") or (issue.get("published_at") or "")[:10]
    title = issue.get("title") or ""
    subtitle = issue.get("subtitle") or ""
    preview = issue.get("preview_text") or issue.get("excerpt") or ""
    body_html = issue.get("content_html") or ""

    issue_chip = f"Issue #{issue_number} · {edition_date}" if issue_number else (edition_date or "Newsletter")
    cover_block = f'<tr><td><img src="{cover}" alt="" width="600" style="display:block;width:100%;height:auto;border:0;"></td></tr>' if cover else ""
    subtitle_block = f'<p style="margin:0;font-size:16px;line-height:1.55;color:#475569;">{subtitle}</p>' if subtitle else ""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#f6f5f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
  <div style="display:none;font-size:1px;color:#f6f5f1;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">{preview}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f5f1;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 30px rgba(15,23,42,0.06);">
          <tr>
            <td style="background:#0f172a;padding:18px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <img src="{LOGO_URL}" alt="Orgainse Consulting" width="160" style="display:block;background:#ffffff;border-radius:8px;padding:6px 10px;max-width:160px;height:auto;">
                  </td>
                  <td align="right" style="vertical-align:middle;color:#fbbf24;font-size:11px;letter-spacing:1.2px;font-weight:700;text-transform:uppercase;">
                    {issue_chip}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          {cover_block}
          <tr>
            <td style="padding:36px 32px 8px 32px;">
              <p style="margin:0 0 10px 0;font-size:11px;letter-spacing:1.5px;color:#f97316;font-weight:700;text-transform:uppercase;">From the Orgainse desk</p>
              <h1 style="margin:0 0 12px 0;font-size:30px;line-height:1.2;color:#0f172a;font-weight:800;">{title}</h1>
              {subtitle_block}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 12px 32px;font-size:16px;line-height:1.7;color:#1f2937;">
              <div>{body_html}</div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:16px 32px 32px 32px;">
              <a href="{view_in_browser_url}" style="display:inline-block;background:#f97316;color:#ffffff;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;">Read on the web →</a>
            </td>
          </tr>
          <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #e2e8f0;margin:0;"></td></tr>
          <tr>
            <td style="padding:24px 32px 28px 32px;font-size:12px;line-height:1.6;color:#64748b;text-align:center;">
              <p style="margin:0 0 6px 0;"><strong style="color:#0f172a;">Orgainse Consulting</strong> · AI-native consulting for ambitious businesses.</p>
              <p style="margin:0 0 12px 0;">Bangalore (HQ) · Austin · <a href="{PUBLIC_SITE_URL}" style="color:#64748b;text-decoration:underline;">orgainse.com</a></p>
              <p style="margin:0 0 4px 0;">You're receiving this because you subscribed at <a href="{PUBLIC_SITE_URL}" style="color:#64748b;">orgainse.com</a>.</p>
              <p style="margin:0;">
                <a href="{view_in_browser_url}" style="color:#64748b;text-decoration:underline;">View in browser</a>
                &nbsp;·&nbsp;
                <a href="{unsubscribe_url}" style="color:#64748b;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:18px 0 0 0;font-size:11px;color:#94a3b8;">© {datetime.now(timezone.utc).year} Orgainse Consulting. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>"""


def render_newsletter_email_text(issue: dict, recipient_token: str) -> str:
    unsubscribe_url = f"{PUBLIC_SITE_URL}/unsubscribe?token={recipient_token}"
    view_url = f"{PUBLIC_SITE_URL}/newsletter/{issue['slug']}"
    title = issue.get("title") or ""
    subtitle = issue.get("subtitle") or ""
    body_text = re.sub(r"<[^>]+>", " ", issue.get("content_html") or "")
    body_text = re.sub(r"\s+", " ", body_text).strip()
    header = f"{title}\n{'=' * len(title)}\n\n"
    sub = f"{subtitle}\n\n" if subtitle else ""
    return (
        f"{header}{sub}{body_text}\n\n"
        f"Read on the web: {view_url}\n\n"
        f"---\nOrgainse Consulting · orgainse.com\n"
        f"Unsubscribe: {unsubscribe_url}\n"
    )


# ---------- Admin: Send ----------
def _resend_send_one(params: dict):
    return resend.Emails.send(params)


@app.post("/api/newsletter-admin/issues/send")
async def admin_send_issue(
    payload: SendIssueIn,
    id: str = Query(...),
    _user = Depends(verify_admin),
):
    if not RESEND_API_KEY:
        raise HTTPException(500, "RESEND_API_KEY not configured")

    issue = await db.newsletter_issues.find_one({"id": id})
    if not issue:
        raise HTTPException(404, "Issue not found")

    if payload.test_email:
        recipients = [{
            "email": payload.test_email.lower(),
            "name": "Test recipient",
            "unsubscribe_token": "test-token-no-record",
        }]
        is_test = True
    else:
        sub_filter: Dict[str, Any] = {
            "unsubscribed": {"$ne": True},
            "bounced": {"$ne": True},
        }
        if payload.segment_slug:
            sub_filter["tags"] = payload.segment_slug
        subs_cursor = db.newsletter_subscriptions.find(
            sub_filter,
            {"_id": 0, "email": 1, "name": 1, "first_name": 1, "unsubscribe_token": 1},
        )
        recipients = []
        async for s in subs_cursor:
            email = (s.get("email") or "").lower()
            if not is_email(email):
                continue
            token = s.get("unsubscribe_token")
            if not token:
                token = secrets.token_urlsafe(24)
                await db.newsletter_subscriptions.update_one(
                    {"email": email}, {"$set": {"unsubscribe_token": token}}
                )
            recipients.append({
                "email": email,
                "name": s.get("name") or s.get("first_name") or "",
                "unsubscribe_token": token,
            })
        is_test = False

    if not recipients:
        raise HTTPException(400, "No recipients matched the selected criteria")

    sent = 0
    failed = 0
    failures: List[Dict[str, str]] = []
    from_addr = f"{SENDER_NAME} <{SENDER_EMAIL}>"

    for r in recipients:
        token = r["unsubscribe_token"]
        unsub_url = f"{PUBLIC_SITE_URL}/unsubscribe?token={token}"
        html = render_newsletter_email_html(issue, token, r["email"])
        text = render_newsletter_email_text(issue, token)
        params = {
            "from": from_addr,
            "to": [r["email"]],
            "subject": issue.get("title") or "Orgainse Newsletter",
            "html": html,
            "text": text,
            "headers": {
                "List-Unsubscribe": f"<{unsub_url}>, <mailto:{SENDER_EMAIL}?subject=Unsubscribe>",
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
            "reply_to": SENDER_EMAIL,
            "tags": [{"name": "campaign", "value": issue.get("slug", "newsletter")}],
        }
        try:
            await asyncio.to_thread(_resend_send_one, params)
            sent += 1
        except Exception as e:
            failed += 1
            failures.append({"email": r["email"], "error": str(e)[:200]})

    if not is_test:
        new_status = "sent" if sent > 0 else issue.get("status", "draft")
        await db.newsletter_issues.update_one(
            {"id": id},
            {"$set": {
                "status": new_status,
                "sent_at": now_iso(),
                "updated_at": now_iso(),
                "send_stats": {
                    "total_recipients": len(recipients),
                    "sent": sent,
                    "failed": failed,
                    "skipped": 0,
                },
                "published_at": issue.get("published_at") or now_iso(),
            }},
        )

    return {
        "success": True,
        "is_test": is_test,
        "total_recipients": len(recipients),
        "sent": sent,
        "failed": failed,
        "failures": failures[:10],
    }


# ---------- Unsubscribe (public) ----------
@app.get("/api/unsubscribe")
async def unsubscribe_get(token: str = Query(...)):
    sub = await db.newsletter_subscriptions.find_one({"unsubscribe_token": token}, {"_id": 0})
    if not sub:
        raise HTTPException(404, "Invalid or expired unsubscribe link")
    return {
        "success": True,
        "email": sub.get("email"),
        "already_unsubscribed": bool(sub.get("unsubscribed")),
    }


@app.post("/api/unsubscribe")
async def unsubscribe_post(payload: Dict[str, Any]):
    token = (payload.get("token") or "").strip() if isinstance(payload, dict) else ""
    if not token:
        raise HTTPException(400, "Token required")
    sub = await db.newsletter_subscriptions.find_one({"unsubscribe_token": token})
    if not sub:
        raise HTTPException(404, "Invalid or expired unsubscribe link")
    await db.newsletter_subscriptions.update_one(
        {"unsubscribe_token": token},
        {"$set": {"unsubscribed": True, "unsubscribed_at": now_iso(), "status": "unsubscribed"}},
    )
    return {"success": True, "email": sub.get("email")}

