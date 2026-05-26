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
- `POST /api/newsletter`     — Newsletter signup
- `POST /api/ai-assessment`  — AI maturity scoring
- `POST /api/roi-calculator` — ROI projection
- `POST /api/consultation`   — Booking request (dedupes within 24h per email)

## Environment

- Local FastAPI mirror runs at `http://localhost:8001` (also reachable via the public preview URL through the ingress)
- MongoDB: local instance at `mongodb://localhost:27017` (Atlas hostname is NXDOMAIN in this env — do not switch back without verifying Atlas)
- JWT secret: set in `/app/backend/.env` (`JWT_SECRET`)
