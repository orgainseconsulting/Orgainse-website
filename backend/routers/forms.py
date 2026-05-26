"""
forms router — public lead-capture endpoints + admin dashboard + health.

Routes:
  GET    /api/health                health probe
  POST   /api/contact               contact form
  POST   /api/newsletter            newsletter signup (auto unsubscribe token)
  POST   /api/ai-assessment         AI maturity scoring + recommendations
  POST   /api/roi-calculator        ROI projection
  POST   /api/consultation          consultation booking (24h dedupe)
  GET    /api/admin                 admin dashboard (auth)
  DELETE /api/admin-delete          delete leads (auth)
"""
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, EmailStr, Field

from deps import (
    VALID_COLLECTIONS,
    client_ip,
    db,
    gen_id,
    is_email,
    is_phone,
    now_iso,
    sanitize_input,
    verify_admin,
)

router = APIRouter()


# ---- Models ---------------------------------------------------------------
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


# ---- Health ---------------------------------------------------------------
@router.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": now_iso(),
        "service": "Orgainse Consulting API",
        "version": "3.0.0",
    }


# ---- Contact --------------------------------------------------------------
@router.post("/api/contact")
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


# ---- Newsletter signup ----------------------------------------------------
@router.post("/api/newsletter")
async def newsletter(payload: NewsletterIn, request: Request):
    data = sanitize_input(payload.model_dump())
    email = data["email"].lower()
    if not is_email(email):
        raise HTTPException(400, "Invalid email format")

    existing = await db.newsletter_subscriptions.find_one({"email": email})
    if existing:
        return {"message": "You are already subscribed to our newsletter!", "status": "already_subscribed"}

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


# ---- AI Assessment --------------------------------------------------------
def _calculate_maturity_score(responses: List[AssessmentResponse]) -> int:
    if not responses:
        return 0
    avg = sum(r.score for r in responses) / len(responses)
    return round(avg * 10)


def _score_label(score: int) -> str:
    if score >= 80: return "AI Advanced"
    if score >= 60: return "AI Ready"
    if score >= 40: return "AI Developing"
    return "AI Beginner"


def _generate_recommendations(score: int) -> List[Dict[str, str]]:
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


@router.post("/api/ai-assessment")
async def ai_assessment(payload: AssessmentIn, request: Request):
    data = sanitize_input(payload.model_dump())
    score = _calculate_maturity_score(payload.responses)
    recs = _generate_recommendations(score)

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
        "score_label": _score_label(score),
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


# ---- ROI Calculator -------------------------------------------------------
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


def _base_cost_from_size(size: str) -> float:
    return {"1-10": 15000, "11-50": 25000, "51-200": 45000, "201-500": 75000, "500+": 120000, "200+": 75000}.get(size, 25000)


@router.post("/api/roi-calculator")
async def roi_calculator(payload: ROIIn, request: Request):
    data = sanitize_input(payload.model_dump())
    region = REGION_CONFIG.get(payload.user_region, REGION_CONFIG["US"])
    project_cost = payload.current_project_cost
    duration = payload.project_duration_months
    efficiency = payload.current_efficiency_rating
    efficiency_gain_pct = (10 - efficiency) * 5 + 25
    cost_reduction_pct = (10 - efficiency) * 3 + 20
    revenue_boost_pct = 15
    annualized_cost = project_cost * (12 / max(duration, 1))
    annual_savings = annualized_cost * (cost_reduction_pct / 100)
    revenue_increase = annualized_cost * (revenue_boost_pct / 100)
    total_annual_benefit = annual_savings + revenue_increase
    implementation_cost = _base_cost_from_size(payload.company_size) * region["pppMultiplier"]
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


# ---- Consultation booking -------------------------------------------------
@router.post("/api/consultation")
async def consultation(payload: ConsultationIn, request: Request):
    data = sanitize_input(payload.model_dump())
    email = data["email"].lower()
    if payload.phone and not is_phone(payload.phone):
        raise HTTPException(400, "Invalid phone number")

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


# ---- Admin lead dashboard -------------------------------------------------
async def _fetch_collection(name: str, page: int, page_size: int):
    cursor = db[name].find({}, {"_id": 0}).sort([("submitted_at", -1), ("subscribed_at", -1)]).skip((page - 1) * page_size).limit(page_size)
    return await cursor.to_list(length=page_size)


@router.get("/api/admin")
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


@router.delete("/api/admin-delete")
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
