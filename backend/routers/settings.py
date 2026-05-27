"""
settings router — /api/app-settings (admin GET/PUT + public GET) + /api/geo.

App settings are stored in the `app_settings` collection with id="global" and
hold the Resend API key (masked on read), sender identity, fallback booking
URL and the Stay-Tuned launch timer values for the blog & newsletter pages.

Hosts on the public endpoint are derived from `admin_users` where
`show_as_host` is true, falling back to the legacy `app_settings.hosts` list.
"""
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from deps import (
    apply_resend_key_runtime,
    db,
    gen_id,
    get_settings_doc,
    hosts_from_admin_users,
    require_super_admin,
    sanitize_input,
    save_settings,
    settings_to_admin_shape,
    settings_to_public_shape,
    verify_admin,
)

router = APIRouter()


# ---- Models ---------------------------------------------------------------
class HostIn(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=80)
    role: Optional[str] = ""
    photo_url: Optional[str] = ""
    booking_url: str = Field(..., min_length=8, max_length=500)
    initials: Optional[str] = ""


class AppSettingsIn(BaseModel):
    resend_api_key: Optional[str] = None
    sender_email: Optional[str] = None
    sender_name: Optional[str] = None
    booking_url_default: Optional[str] = None
    hosts: Optional[List[HostIn]] = None
    next_blog_launch_at: Optional[str] = None
    next_newsletter_launch_at: Optional[str] = None


# ---- App settings ---------------------------------------------------------
@router.get("/api/app-settings")
async def app_settings_get(claims: Dict[str, Any] = Depends(verify_admin)):
    await require_super_admin(claims)
    doc = await get_settings_doc()
    return {"success": True, "settings": settings_to_admin_shape(doc)}


@router.put("/api/app-settings")
async def app_settings_update(payload: AppSettingsIn, claims: Dict[str, Any] = Depends(verify_admin)):
    await require_super_admin(claims)
    updates: Dict[str, Any] = {}

    if payload.resend_api_key is not None:
        new_key = payload.resend_api_key.strip()
        if new_key and not new_key.startswith("re_"):
            raise HTTPException(400, "Resend API keys start with 're_'")
        updates["resend_api_key"] = new_key
        apply_resend_key_runtime(new_key or None)

    if payload.sender_email is not None:
        updates["sender_email"] = sanitize_input({"e": payload.sender_email})["e"][:120]
    if payload.sender_name is not None:
        updates["sender_name"] = sanitize_input({"n": payload.sender_name})["n"][:120]
    if payload.booking_url_default is not None:
        updates["booking_url_default"] = sanitize_input({"u": payload.booking_url_default})["u"][:500]
    if payload.next_blog_launch_at is not None:
        updates["next_blog_launch_at"] = sanitize_input({"d": payload.next_blog_launch_at})["d"][:60]
    if payload.next_newsletter_launch_at is not None:
        updates["next_newsletter_launch_at"] = sanitize_input({"d": payload.next_newsletter_launch_at})["d"][:60]

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

    doc = await save_settings(updates)
    return {"success": True, "settings": settings_to_admin_shape(doc)}


@router.get("/api/app-settings/public")
async def app_settings_public(request: Request):
    doc = await get_settings_doc()
    derived = await hosts_from_admin_users()
    response = JSONResponse({"success": True, "settings": settings_to_public_shape(doc, hosts=derived)})
    response.headers["Cache-Control"] = "no-store, max-age=0, must-revalidate"
    return response


# ---- Geo proxy ------------------------------------------------------------
# Cache lifetime: 6h per IP (in-memory dict keyed by client IP).
_GEO_CACHE: Dict[str, Dict[str, Any]] = {}
_GEO_CACHE_TTL = 6 * 60 * 60


def _client_public_ip(request: Request) -> str:
    fwd = (request.headers.get("x-forwarded-for") or "").split(",")[0].strip()
    if fwd:
        return fwd
    return (request.client.host if request.client else "") or ""


@router.get("/api/geo")
async def geo_lookup(request: Request):
    ip = _client_public_ip(request)
    now_ts = datetime.now(timezone.utc).timestamp()

    cached = _GEO_CACHE.get(ip)
    if cached and (now_ts - cached.get("_ts", 0)) < _GEO_CACHE_TTL:
        return cached["data"]

    fallback = {"country_code": "", "country": "", "region": "", "city": "", "timezone": ""}
    try:
        async with httpx.AsyncClient(timeout=4.0) as http:
            url = f"https://ipapi.co/{ip}/json/" if ip and ip not in ("127.0.0.1", "::1") else "https://ipapi.co/json/"
            r = await http.get(url, headers={"User-Agent": "OrgainseGeoProxy/1.0"})
            if r.status_code == 200:
                j = r.json() or {}
                data = {
                    "country_code": (j.get("country_code") or "").upper(),
                    "country": j.get("country_name") or "",
                    "region": j.get("region") or "",
                    "city": j.get("city") or "",
                    "timezone": j.get("timezone") or "",
                }
                _GEO_CACHE[ip] = {"_ts": now_ts, "data": data}
                return data
    except Exception as e:  # noqa: BLE001
        print(f"[geo] lookup failed: {e}")
    return fallback
