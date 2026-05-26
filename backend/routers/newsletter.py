"""
newsletter router — issues, subscribers, segments, send, public list, unsubscribe.

Public:
  GET    /api/newsletter-issues            list + slug detail
  GET    /api/unsubscribe                  check by token
  POST   /api/unsubscribe                  process one-click unsubscribe

Admin (JWT):
  *      /api/newsletter-admin/issues
  *      /api/newsletter-admin/segments
  *      /api/newsletter-admin/subscribers (+ /export)
  POST   /api/newsletter-admin/issues/send (Resend)
"""
import asyncio
import csv
import io
import re
import secrets
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

import resend
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr, Field

from deps import (
    MAX_HTML_BYTES,
    PUBLIC_SITE_URL,
    RESEND_API_KEY,
    SENDER_EMAIL,
    SENDER_NAME,
    SLUG_RE,
    db,
    gen_id,
    is_email,
    now_iso,
    sanitize_input,
    verify_admin,
)
from routers.blog import (
    build_excerpt,
    estimate_reading_minutes,
    slugify,
    strip_unsafe_html,
    validate_image_field,
)

router = APIRouter()

LOGO_URL = "https://customer-assets.emergentagent.com/job_digital-presence-29/artifacts/xx6a5zd7_Copy%20of%20OrgAInse%20Consulting%20%28Website%29.png"


# ---- Models ---------------------------------------------------------------
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


# ---- Issue doc builder + shapes -------------------------------------------
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


def _issue_to_admin_shape(doc: dict) -> Optional[dict]:
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


def _issue_to_public_shape(doc: dict, full: bool = False) -> Optional[dict]:
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


def _sub_to_shape(doc: dict) -> Optional[dict]:
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


# ---- Public newsletter ----------------------------------------------------
@router.get("/api/newsletter-issues")
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


# ---- Admin: Issues --------------------------------------------------------
@router.get("/api/newsletter-admin/issues")
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


@router.post("/api/newsletter-admin/issues")
async def admin_issue_create(payload: NewsletterIssueIn, _user = Depends(verify_admin)):
    doc = _build_issue_doc(payload.model_dump(), existing=None)
    if await db.newsletter_issues.find_one({"slug": doc["slug"]}, {"_id": 1}):
        raise HTTPException(400, "slug already in use")
    await db.newsletter_issues.insert_one(doc)
    return {"success": True, "issue": _issue_to_admin_shape(doc)}


@router.put("/api/newsletter-admin/issues")
async def admin_issue_update(payload: NewsletterIssueIn, id: str = Query(...), _user = Depends(verify_admin)):
    existing = await db.newsletter_issues.find_one({"id": id})
    if not existing:
        raise HTTPException(404, "Issue not found")
    doc = _build_issue_doc(payload.model_dump(), existing=existing)
    dup = await db.newsletter_issues.find_one({"slug": doc["slug"], "id": {"$ne": doc["id"]}}, {"_id": 1})
    if dup:
        raise HTTPException(400, "slug already in use")
    await db.newsletter_issues.replace_one({"id": id}, doc)
    return {"success": True, "issue": _issue_to_admin_shape(doc)}


@router.delete("/api/newsletter-admin/issues")
async def admin_issue_delete(id: str = Query(...), _user = Depends(verify_admin)):
    r = await db.newsletter_issues.delete_one({"id": id})
    if r.deleted_count == 0:
        raise HTTPException(404, "Issue not found")
    return {"success": True, "deleted": id}


# ---- Admin: Segments ------------------------------------------------------
@router.get("/api/newsletter-admin/segments")
async def admin_segments_list(_user = Depends(verify_admin)):
    rows = await db.newsletter_segments.find({}, {"_id": 0}).sort("name", 1).to_list(length=200)
    return {"success": True, "segments": rows}


@router.post("/api/newsletter-admin/segments")
async def admin_segment_create(payload: SegmentIn, _user = Depends(verify_admin)):
    name = sanitize_input({"name": payload.name})["name"]
    slug_in = (payload.slug or "").strip().lower()
    slug = slugify(slug_in) if slug_in else slugify(name)
    if not slug or not SLUG_RE.match(slug):
        raise HTTPException(400, "Invalid segment slug")
    if await db.newsletter_segments.find_one({"slug": slug}, {"_id": 1}):
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


@router.delete("/api/newsletter-admin/segments")
async def admin_segment_delete(id: str = Query(...), _user = Depends(verify_admin)):
    seg = await db.newsletter_segments.find_one({"id": id})
    if not seg:
        raise HTTPException(404, "Segment not found")
    await db.newsletter_segments.delete_one({"id": id})
    await db.newsletter_subscriptions.update_many({"tags": seg["slug"]}, {"$pull": {"tags": seg["slug"]}})
    return {"success": True, "deleted": id}


# ---- Admin: Subscribers ---------------------------------------------------
@router.get("/api/newsletter-admin/subscribers")
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


@router.post("/api/newsletter-admin/subscribers")
async def admin_sub_create(payload: ManualSubscriberIn, _user = Depends(verify_admin)):
    email = payload.email.lower().strip()
    if not is_email(email):
        raise HTTPException(400, "Invalid email")
    if await db.newsletter_subscriptions.find_one({"email": email}):
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


@router.put("/api/newsletter-admin/subscribers")
async def admin_sub_update(payload: SubscriberUpdateIn, id: str = Query(...), _user = Depends(verify_admin)):
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


@router.delete("/api/newsletter-admin/subscribers")
async def admin_sub_delete(id: str = Query(...), _user = Depends(verify_admin)):
    r = await db.newsletter_subscriptions.delete_one({"id": id})
    if r.deleted_count == 0:
        raise HTTPException(404, "Subscriber not found")
    return {"success": True, "deleted": id}


@router.get("/api/newsletter-admin/subscribers/export")
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
            shape["email"], shape["name"], ",".join(shape["tags"] or []),
            shape["source"], shape["subscribed_at"] or "", shape["status"],
        ])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="orgainse-subscribers-{datetime.now(timezone.utc).strftime("%Y-%m-%d")}.csv"'},
    )


# ---- Email rendering ------------------------------------------------------
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


# ---- Send via Resend ------------------------------------------------------
def _resend_send_one(params: dict):
    return resend.Emails.send(params)


@router.post("/api/newsletter-admin/issues/send")
async def admin_send_issue(payload: SendIssueIn, id: str = Query(...), _user = Depends(verify_admin)):
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
        sub_filter: Dict[str, Any] = {"unsubscribed": {"$ne": True}, "bounced": {"$ne": True}}
        if payload.segment_slug:
            sub_filter["tags"] = payload.segment_slug
        subs_cursor = db.newsletter_subscriptions.find(
            sub_filter, {"_id": 0, "email": 1, "name": 1, "first_name": 1, "unsubscribe_token": 1}
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
        except Exception as e:  # noqa: BLE001
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


# ---- Unsubscribe (public) -------------------------------------------------
@router.get("/api/unsubscribe")
async def unsubscribe_get(token: str = Query(...)):
    sub = await db.newsletter_subscriptions.find_one({"unsubscribe_token": token}, {"_id": 0})
    if not sub:
        raise HTTPException(404, "Invalid or expired unsubscribe link")
    return {
        "success": True,
        "email": sub.get("email"),
        "already_unsubscribed": bool(sub.get("unsubscribed")),
    }


@router.post("/api/unsubscribe")
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
