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
"""
from dotenv import load_dotenv
load_dotenv()

import os
import re
import uuid
import bcrypt
import jwt as pyjwt
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Request, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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


def create_access_token(username: str) -> str:
    payload = {
        "sub": username,
        "role": "admin",
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_TTL_HOURS),
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
    await db.admin_users.create_index("username", unique=True)
    await db.login_attempts.create_index("expires_at", expireAfterSeconds=0)
    await db.newsletter_subscriptions.create_index("email", unique=False)
    await db.blog_posts.create_index("slug", unique=True)
    await db.blog_posts.create_index([("status", 1), ("published_at", -1)])

    if not ADMIN_PASSWORD:
        print("[startup] WARNING: ADMIN_PASSWORD not set; admin login disabled")
        return

    existing = await db.admin_users.find_one({"username": ADMIN_USERNAME})
    if existing is None:
        await db.admin_users.insert_one({
            "username": ADMIN_USERNAME,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "created_at": now_iso(),
        })
        print(f"[startup] Seeded admin user '{ADMIN_USERNAME}'")
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
    username: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1, max_length=200)


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
    identifier = f"{ip}:{payload.username.lower()}"
    now = datetime.now(timezone.utc)

    # Check lockout
    lockout = await db.login_attempts.find_one({"_id": identifier})
    if lockout and lockout.get("locked_until") and lockout["locked_until"] > now:
        remaining = int((lockout["locked_until"] - now).total_seconds())
        raise HTTPException(
            status_code=429,
            detail=f"Too many failed attempts. Try again in {remaining}s.",
        )

    user = await db.admin_users.find_one({"username": payload.username})
    if not user or not verify_password(payload.password, user["password_hash"]):
        # Increment attempts
        attempts = (lockout or {}).get("attempts", 0) + 1
        update = {"attempts": attempts, "last_attempt": now}
        if attempts >= 5:
            update["locked_until"] = now + timedelta(minutes=15)
            update["expires_at"] = now + timedelta(minutes=20)
        else:
            update["expires_at"] = now + timedelta(minutes=15)
        await db.login_attempts.update_one({"_id": identifier}, {"$set": update}, upsert=True)
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Success: clear attempts
    await db.login_attempts.delete_one({"_id": identifier})
    token = create_access_token(payload.username)
    return {
        "success": True,
        "token": token,
        "expires_in": JWT_TTL_HOURS * 3600,
        "username": payload.username,
    }


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
