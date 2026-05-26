"""
auth router — /api/admin-login, /api/admin-change-password, /api/auth/me.

Implements multi-user MongoDB-backed admin auth restricted to @orgainse.com.
Forced password change on first login uses a short-lived (15 min) JWT with
purpose='password_change'.
"""
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field

from deps import (
    db,
    JWT_TTL_HOURS,
    client_ip,
    create_access_token,
    hash_password,
    now_iso,
    verify_admin_any_purpose,
    verify_password,
)

router = APIRouter()


# ---- Models ---------------------------------------------------------------
class AdminLoginIn(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str = Field(..., min_length=1, max_length=200)


class AdminChangePasswordIn(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=200)
    new_password: str = Field(..., min_length=8, max_length=200)


# ---- Routes ---------------------------------------------------------------
@router.post("/api/admin-login")
async def admin_login(payload: AdminLoginIn, request: Request):
    ip = client_ip(request)
    raw_email = (payload.email or payload.username or "").strip().lower()
    if not raw_email:
        raise HTTPException(status_code=400, detail="Email is required")
    is_email_input = "@" in raw_email
    if is_email_input and not raw_email.endswith("@orgainse.com"):
        raise HTTPException(status_code=403, detail="Only @orgainse.com accounts may sign in")
    identifier = f"{ip}:{raw_email}"
    now = datetime.now(timezone.utc)

    # Lockout check (timezone-aware comparison)
    lockout = await db.login_attempts.find_one({"_id": identifier})
    locked_until = lockout.get("locked_until") if lockout else None
    if locked_until is not None and locked_until.tzinfo is None:
        locked_until = locked_until.replace(tzinfo=timezone.utc)
    if locked_until and locked_until > now:
        remaining = int((locked_until - now).total_seconds())
        raise HTTPException(status_code=429, detail=f"Too many failed attempts. Try again in {remaining}s.")

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
        await db.admin_users.update_one({"_id": user["_id"]}, {"$set": {"last_login_at": now_iso()}})

    return {
        "success": True,
        "token": token,
        "expires_in": ttl_seconds,
        "email": user_email,
        "username": user_email,
        "name": user.get("name") or "",
        "must_change_password": must_change,
        "is_super_admin": bool(user.get("is_super_admin")),
    }


@router.post("/api/admin-change-password")
async def admin_change_password(
    payload: AdminChangePasswordIn,
    claims: Dict[str, Any] = Depends(verify_admin_any_purpose),
):
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


@router.get("/api/auth/me")
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
