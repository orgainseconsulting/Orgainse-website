# Test Credentials

## Admin Dashboard (JWT-protected)

- **Login URL**: `/admin` (frontend) → calls `POST /api/admin-login`
- **Username**: `orgainse_admin`
- **Password**: `Org@iNs3-Adm!n-2026-x7P9qK`
- **JWT TTL**: 8 hours
- **Brute-force protection**: 5 failed attempts triggers a 15-minute IP+user lockout (429).

After a successful login, the frontend stores the JWT in `localStorage` (key consumed by `AuthContext`) and includes it as `Authorization: Bearer <token>` for:

- `GET  /api/admin`         — list leads (paginated: `?page=1&page_size=100`)
- `DELETE /api/admin-delete` — delete leads (`?deleteType=all|collection|single&...`)

## Test data endpoints (no auth)

Public POST endpoints used by site forms (no credentials required):

- `POST /api/contact`        — Contact form
- `POST /api/newsletter`     — Newsletter signup (auto-generates `unsubscribe_token`)
- `POST /api/ai-assessment`  — AI maturity scoring
- `POST /api/roi-calculator` — ROI projection
- `POST /api/consultation`   — Booking request (dedupes within 24h per email)
- `GET  /api/blog`           — Blog list / `?slug=` for single
- `GET  /api/newsletter-issues` — Newsletter archive / `?slug=` for single
- `GET  /api/unsubscribe?token=` — Check sub status (1-click unsubscribe target also accepts POST)

## Newsletter / Resend integration

- **Resend API key**: stored in `/app/backend/.env` as `RESEND_API_KEY`. Do **not** commit to git or share in chat.
- **Sender**: `info@orgainse.com` (verified Resend domain owned by user — DNS records added).
- **From header**: `Orgainse Consulting <info@orgainse.com>`
- **Test recipient**: only `info@orgainse.com` is guaranteed to deliver while the Resend account is on the free / unverified plan. To send to arbitrary recipients, ensure the domain is fully verified in the Resend dashboard.
- **One-click unsubscribe**: implemented per RFC 8058 — `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers added on every send. Frontend route: `/unsubscribe?token=<urlsafe-token>`.

## Environment

- Local FastAPI mirror runs at `http://localhost:8001` (also reachable via the public preview URL through the ingress)
- MongoDB: local instance at `mongodb://localhost:27017` (Atlas hostname is NXDOMAIN in this env — do not switch back without verifying Atlas)
- JWT secret: set in `/app/backend/.env` (`JWT_SECRET`)
