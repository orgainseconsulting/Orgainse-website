"""
admin_users router — /api/admin-users CRUD + reset-password.
Super-admin only.
"""
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field

from deps import (
    db,
    admin_user_shape,
    gen_id,
    hash_password,
    now_iso,
    require_super_admin,
    sanitize_input,
    verify_admin,
)

router = APIRouter()


# ---- Models ---------------------------------------------------------------
class AdminUserInviteIn(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=120)
    temp_password: str = Field(..., min_length=8, max_length=200)


class CustomFieldIn(BaseModel):
    label: str = Field("", max_length=60)
    value: str = Field("", max_length=300)


class AdminUserUpdateIn(BaseModel):
    name: Optional[str] = None
    designation: Optional[str] = None
    photo_url: Optional[str] = None
    initials: Optional[str] = None
    booking_url: Optional[str] = None
    show_as_host: Optional[bool] = None
    custom_fields: Optional[List[CustomFieldIn]] = None


class AdminUserResetIn(BaseModel):
    new_temp_password: str = Field(..., min_length=8, max_length=200)


# ---- Routes ---------------------------------------------------------------
@router.get("/api/admin-users")
async def admin_users_list(claims: Dict[str, Any] = Depends(verify_admin)):
    me = await require_super_admin(claims)
    rows = await db.admin_users.find({"email": {"$exists": True}}, {"_id": 0}).sort("created_at", 1).to_list(length=200)
    return {
        "success": True,
        "users": [admin_user_shape(r, include_temp_password=True) for r in rows],
        "me": admin_user_shape(me, include_temp_password=True),
    }


@router.post("/api/admin-users")
async def admin_user_invite(payload: AdminUserInviteIn, claims: Dict[str, Any] = Depends(verify_admin)):
    await require_super_admin(claims)
    email = payload.email.lower().strip()
    if not email.endswith("@orgainse.com"):
        raise HTTPException(400, "Only @orgainse.com emails may be invited")
    if await db.admin_users.find_one({"email": email}):
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
    return {"success": True, "user": admin_user_shape(doc, include_temp_password=True)}


@router.put("/api/admin-users")
async def admin_user_update(
    payload: AdminUserUpdateIn,
    id: str = Query(...),
    claims: Dict[str, Any] = Depends(verify_admin),
):
    await require_super_admin(claims)
    user = await db.admin_users.find_one({"id": id})
    if not user:
        raise HTTPException(404, "User not found")
    updates: Dict[str, Any] = {"updated_at": now_iso()}
    if payload.name is not None:
        updates["name"] = sanitize_input({"n": payload.name})["n"][:120]
    if payload.designation is not None:
        updates["designation"] = sanitize_input({"d": payload.designation})["d"][:160]
    if payload.photo_url is not None:
        updates["photo_url"] = sanitize_input({"p": payload.photo_url})["p"][:1000]
    if payload.initials is not None:
        updates["initials"] = sanitize_input({"i": payload.initials})["i"][:4].upper()
    if payload.booking_url is not None:
        updates["booking_url"] = sanitize_input({"b": payload.booking_url})["b"][:500]
    if payload.show_as_host is not None:
        updates["show_as_host"] = bool(payload.show_as_host)
    if payload.custom_fields is not None:
        cleaned: List[Dict[str, str]] = []
        for cf in payload.custom_fields:
            label = sanitize_input({"l": cf.label})["l"][:60]
            value = sanitize_input({"v": cf.value})["v"][:300]
            if label:
                cleaned.append({"label": label, "value": value})
        updates["custom_fields"] = cleaned
    await db.admin_users.update_one({"id": id}, {"$set": updates})
    updated = await db.admin_users.find_one({"id": id}, {"_id": 0})
    return {"success": True, "user": admin_user_shape(updated, include_temp_password=True)}


@router.post("/api/admin-users/reset-password")
async def admin_user_reset_password(
    payload: AdminUserResetIn,
    id: str = Query(...),
    claims: Dict[str, Any] = Depends(verify_admin),
):
    await require_super_admin(claims)
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
    return {"success": True, "user": admin_user_shape(updated, include_temp_password=True)}


@router.delete("/api/admin-users")
async def admin_user_delete(id: str = Query(...), claims: Dict[str, Any] = Depends(verify_admin)):
    me = await require_super_admin(claims)
    user = await db.admin_users.find_one({"id": id})
    if not user:
        raise HTTPException(404, "User not found")
    if user.get("id") == me.get("id") or user.get("is_super_admin"):
        raise HTTPException(400, "Cannot delete a super-admin or yourself")
    await db.admin_users.delete_one({"id": id})
    return {"success": True, "deleted": id}
