"""
deps.py — shared primitives used by every router.

Holds:
  * config (env vars, JWT, Resend, allowed collections)
  * MongoDB client & db
  * JWT helpers & FastAPI bearer dependencies (verify_admin / verify_admin_any_purpose)
  * Sanitisation + validation utilities
  * Shared "shape" / settings helpers (admin_user_shape, settings shapes, host derivation)

Routers in /app/backend/routers/*.py import everything they need from here so we
have a single source of truth. server.py is then just FastAPI app wiring +
startup + leaves the legacy form/lead routes that haven't been split out yet.
"""
from dotenv import load_dotenv
load_dotenv()

import os
import re
import uuid
import bcrypt
import jwt as pyjwt
import resend
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any

from fastapi import HTTPException, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient

# ---------------------------------------------------------------------------
# Config (env)
# ---------------------------------------------------------------------------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ.get("DB_NAME", "orgainse-consulting")
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"
JWT_TTL_HOURS = 8
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "orgainse_admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip()]

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
SENDER_NAME = os.environ.get("SENDER_NAME", "Orgainse Consulting")
PUBLIC_SITE_URL = os.environ.get("PUBLIC_SITE_URL", "https://www.orgainse.com").rstrip("/")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

SETTINGS_DOC_ID = "global"

VALID_COLLECTIONS = [
    "newsletter_subscriptions",
    "contact_messages",
    "ai_assessment_leads",
    "roi_calculator_leads",
    "service_inquiries",
    "consultation_leads",
]

# Blog post constants
ALLOWED_IMAGE_MIME = {"image/png", "image/jpeg", "image/webp", "image/gif"}
MAX_IMAGE_BYTES = int(1.5 * 1024 * 1024)
MAX_HTML_BYTES = 800 * 1024
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

# ---------------------------------------------------------------------------
# DB
# ---------------------------------------------------------------------------
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
bearer_scheme = HTTPBearer(auto_error=False)

# ---------------------------------------------------------------------------
# Validation / sanitisation
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
    """Build a JWT. purpose='full' → 8h. purpose='password_change' → 15 min."""
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
    """Like verify_admin but also accepts purpose=password_change."""
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
# Super-admin gate & admin_users shape
# ---------------------------------------------------------------------------
async def require_super_admin(claims: Dict[str, Any]) -> Dict[str, Any]:
    email = (claims.get("email") or claims.get("sub") or "").lower()
    user = await db.admin_users.find_one({"email": email})
    if not user or not user.get("is_super_admin"):
        raise HTTPException(403, "Super-admin access required")
    return user


def admin_user_shape(doc: dict, include_temp_password: bool = False) -> dict:
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
        "designation": doc.get("designation") or "",
        "photo_url": doc.get("photo_url") or "",
        "initials": (doc.get("initials") or "").upper(),
        "booking_url": doc.get("booking_url") or "",
        "show_as_host": bool(doc.get("show_as_host")),
        "custom_fields": doc.get("custom_fields") or [],
    }


# ---------------------------------------------------------------------------
# Settings helpers
# ---------------------------------------------------------------------------
def mask_secret(value: Optional[str]) -> str:
    if not value:
        return ""
    if len(value) <= 6:
        return "•" * len(value)
    return value[:3] + "•" * 8 + value[-2:]


def settings_to_admin_shape(doc: Optional[dict]) -> Dict[str, Any]:
    doc = doc or {}
    return {
        "resend_api_key_masked": mask_secret(doc.get("resend_api_key") or RESEND_API_KEY),
        "resend_api_key_set": bool(doc.get("resend_api_key") or RESEND_API_KEY),
        "sender_email": doc.get("sender_email") or SENDER_EMAIL,
        "sender_name": doc.get("sender_name") or SENDER_NAME,
        "booking_url_default": doc.get("booking_url_default") or "",
        "hosts": doc.get("hosts") or [],
        "next_blog_launch_at": doc.get("next_blog_launch_at") or "",
        "next_newsletter_launch_at": doc.get("next_newsletter_launch_at") or "",
        "updated_at": doc.get("updated_at"),
    }


async def hosts_from_admin_users() -> List[Dict[str, Any]]:
    """Return host cards derived from admin_users where show_as_host=True and a booking_url is set."""
    cursor = db.admin_users.find(
        {"show_as_host": True, "booking_url": {"$exists": True, "$ne": ""}},
        {"_id": 0},
    ).sort("created_at", 1)
    hosts: List[Dict[str, Any]] = []
    async for u in cursor:
        if not u.get("booking_url"):
            continue
        hosts.append({
            "id": u.get("id"),
            "name": u.get("name") or u.get("email") or "Host",
            "role": u.get("designation") or "",
            "photo_url": u.get("photo_url") or "",
            "initials": (u.get("initials") or "").upper(),
            "booking_url": u.get("booking_url") or "",
            "custom_fields": u.get("custom_fields") or [],
            "email": u.get("email") or "",
        })
    return hosts


def settings_to_public_shape(doc: Optional[dict], hosts: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    doc = doc or {}
    final_hosts = hosts if hosts else (doc.get("hosts") or [])
    return {
        "booking_url_default": doc.get("booking_url_default") or "",
        "hosts": final_hosts,
        "next_blog_launch_at": doc.get("next_blog_launch_at") or "",
        "next_newsletter_launch_at": doc.get("next_newsletter_launch_at") or "",
    }


async def get_settings_doc() -> Dict[str, Any]:
    return await db.app_settings.find_one({"_id": SETTINGS_DOC_ID}) or {}


async def save_settings(updates: Dict[str, Any]) -> Dict[str, Any]:
    updates["updated_at"] = now_iso()
    await db.app_settings.update_one(
        {"_id": SETTINGS_DOC_ID},
        {"$set": updates, "$setOnInsert": {"created_at": now_iso()}},
        upsert=True,
    )
    return await get_settings_doc()


def apply_resend_key_runtime(new_key: Optional[str]):
    if new_key:
        resend.api_key = new_key
