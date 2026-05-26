"""
blog router — /api/blog (public) + /api/blog-admin (JWT) CRUD.

Posts are stored in the `blog_posts` collection with cover/og images base64-
encoded inline. HTML is stripped of <script>, javascript: and on* handlers.
"""
import re
import unicodedata
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from deps import (
    ALLOWED_IMAGE_MIME,
    MAX_HTML_BYTES,
    MAX_IMAGE_BYTES,
    SLUG_RE,
    db,
    gen_id,
    now_iso,
    sanitize_input,
    verify_admin,
)

router = APIRouter()


# ---- Models ---------------------------------------------------------------
class BlogPostIn(BaseModel):
    title: str = Field(..., min_length=1, max_length=250)
    slug: Optional[str] = ""
    excerpt: Optional[str] = ""
    content_html: str = Field(..., min_length=1)
    cover_image_url: Optional[str] = None
    og_image_url: Optional[str] = None
    author: Optional[str] = "Orgainse Consulting"
    category: Optional[str] = ""
    tags: Optional[List[str]] = []
    status: Optional[str] = "draft"
    seo_title: Optional[str] = ""
    seo_description: Optional[str] = ""


# ---- Helpers --------------------------------------------------------------
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


def _to_admin_shape(doc: dict) -> Optional[dict]:
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


def _to_public_shape(doc: dict, full: bool = False) -> Optional[dict]:
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


# ---- Public ---------------------------------------------------------------
@router.get("/api/blog")
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


# ---- Admin ----------------------------------------------------------------
@router.get("/api/blog-admin")
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
    cursor = db.blog_posts.find(
        {},
        {"_id": 0, "content_html": 0, "cover_image_b64": 0, "og_image_b64": 0},
    ).sort("updated_at", -1).skip((page - 1) * page_size).limit(page_size)
    rows = await cursor.to_list(length=page_size)
    total = await db.blog_posts.count_documents({})
    return {
        "success": True,
        "pagination": {"page": page, "page_size": page_size, "total": total},
        "posts": [_to_admin_shape({**r, "content_html": "", "cover_image_b64": None, "og_image_b64": None}) for r in rows],
    }


@router.post("/api/blog-admin")
async def blog_admin_create(payload: BlogPostIn, _user = Depends(verify_admin)):
    data = payload.model_dump()
    doc = _build_post_doc(data, existing=None)
    if await db.blog_posts.find_one({"slug": doc["slug"]}, {"_id": 1}):
        raise HTTPException(400, "slug already in use")
    await db.blog_posts.insert_one(doc)
    return {"success": True, "post": _to_admin_shape(doc)}


@router.put("/api/blog-admin")
async def blog_admin_update(payload: BlogPostIn, id: str = Query(...), _user = Depends(verify_admin)):
    existing = await db.blog_posts.find_one({"id": id})
    if not existing:
        raise HTTPException(404, "Post not found")
    data = payload.model_dump()
    doc = _build_post_doc(data, existing=existing)
    dup = await db.blog_posts.find_one({"slug": doc["slug"], "id": {"$ne": doc["id"]}}, {"_id": 1})
    if dup:
        raise HTTPException(400, "slug already in use")
    await db.blog_posts.replace_one({"id": id}, doc)
    return {"success": True, "post": _to_admin_shape(doc)}


@router.delete("/api/blog-admin")
async def blog_admin_delete(id: str = Query(...), _user = Depends(verify_admin)):
    r = await db.blog_posts.delete_one({"id": id})
    if r.deleted_count == 0:
        raise HTTPException(404, "Post not found")
    return {"success": True, "deleted": id}
