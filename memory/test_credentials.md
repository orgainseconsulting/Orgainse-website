# Test Credentials

## Admin Dashboard (Multi-user JWT-protected)

- **Login URL**: `/admin` (frontend) → calls `POST /api/admin-login`
- **Domain restriction**: Only `@orgainse.com` emails may sign in.
- **JWT TTL**: 8 hours after password is set; 15 minutes while user must change their password.
- **Brute-force protection**: 5 failed attempts triggers a 15-minute IP+email lockout (429).

### Seeded admin users (initial temp password — change on first login)

| Email | Role | Name |
| --- | --- | --- |
| `info@orgainse.com`    | Admin       | Orgainse Admin |
| `support@orgainse.com` | Admin       | Orgainse Support |
| `swarag@orgainse.com`  | Super Admin | Swarag |
| `rajesh@orgainse.com`  | Admin       | Rajesh |

- **Temporary password (all 4 seed users)**: `Orgainse25%Web..`
- On first login each user is forced to set a new password via `POST /api/admin-change-password`.
- Once the user changes their password, `temp_password_plain` is unset on their record (no longer visible in the Users tab).
- **Super-admin (`swarag@orgainse.com`)** is the only user who can:
  - See unchanged temporary passwords for other admins under Admin Portal → Users.
  - Invite new admins (`POST /api/admin-users`).
  - Reset another admin's password (`POST /api/admin-users/reset-password?id=...`).
  - Edit admin display names.
  - Update Resend API key & sender identity under Admin Portal → Settings.
  - Configure Book-a-Call hosts list.

### Auth endpoints

- `POST /api/admin-login` — `{ email, password }` → `{ token, must_change_password, is_super_admin, ... }`
- `POST /api/admin-change-password` — `{ current_password, new_password }` (Bearer required)
- `GET  /api/auth/me` — returns `{ email, name, needs_password_change, is_super_admin, role }`
- `GET/POST/PUT/DELETE /api/admin-users` — super-admin CRUD (PUT/DELETE take `?id=`)
- `POST /api/admin-users/reset-password?id=...` — set new temp password
- `GET  /api/app-settings` (super-admin) | `PUT /api/app-settings` (super-admin)
- `GET  /api/app-settings/public` — non-secret subset (hosts list + fallback booking URL)

After a successful login, the frontend stores the JWT + email + name + must_change_password +
is_super_admin in `sessionStorage` (key `orgainse_admin_auth`) and sends it as
`Authorization: Bearer <token>` for all `/api/admin*` and `/api/auth/me` calls.

## Lead-management endpoints (auth required)

- `GET    /api/admin`            — list leads (paginated: `?page=1&page_size=100`)
- `DELETE /api/admin-delete`     — delete leads (`?deleteType=all|collection|single&...`)

## Public form endpoints (no auth)

- `POST /api/contact`             — Contact form
- `POST /api/newsletter`          — Newsletter signup (auto-generates `unsubscribe_token`)
- `POST /api/ai-assessment`       — AI maturity scoring
- `POST /api/roi-calculator`      — ROI projection
- `POST /api/consultation`        — Booking request (24h-dedupe per email)
- `GET  /api/blog`                — Blog list / `?slug=` for single
- `GET  /api/newsletter-issues`   — Newsletter archive / `?slug=` for single
- `GET  /api/unsubscribe?token=`  — Check sub status (1-click unsubscribe also accepts POST)

## Newsletter / Resend integration

- **Resend API key**: stored in `/app/backend/.env` as `RESEND_API_KEY` (env-level fallback) and
  also overridable from Admin Portal → Settings (persisted in `app_settings` collection).
- **Sender**: `info@orgainse.com` (verified Resend domain).
- **Test recipient**: only `info@orgainse.com` is guaranteed to deliver while the Resend account
  is on the free / unverified plan.
- **One-click unsubscribe**: RFC 8058 (`List-Unsubscribe` + `List-Unsubscribe-Post` headers).

## Environment

- Local FastAPI mirror runs at `http://localhost:8001`
- MongoDB: local instance at `mongodb://localhost:27017`
- JWT secret: `/app/backend/.env` (`JWT_SECRET`)
- Frontend booking URL fallback: `REACT_APP_BOOKING_URL` (overridden by `app_settings.booking_url_default`)
