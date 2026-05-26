# Orgainse Consulting — Product Requirements

## Original problem statement

Comprehensive deep-test + fix of the Orgainse Consulting site (GitHub: `orgainseconsulting/Orgainse-website`) across:
Architecture, Security, Frontend UX, Backend, SEO, Performance, Documentation, Deployment.

Key directives:
- Replace insecure client-side admin auth with JWT.
- Decouple the 4800-line monolithic `App.js`.
- Wire unused dedicated API endpoints.
- Add a GDPR cookie banner.
- Replace Calendly with Google Workspace Calendar Appointment Scheduling.

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19 + craco + Tailwind + shadcn/ui (lazy-loaded routes) |
| Backend (prod) | Vercel Node.js Serverless Functions in `/app/api/*.js` |
| Backend (dev mirror) | FastAPI in `/app/backend/server.py` (mirrors `/api/*` for in-pod E2E testing) |
| DB | MongoDB (local in this sandbox; Atlas hostname currently NXDOMAIN) |
| Auth | bcrypt + JWT (HS256, 8h TTL), brute-force lockout |
| Booking | Google Calendar Appointment Scheduling (`REACT_APP_BOOKING_URL`) |

## Implemented (this fork — Feb 2026)

### Security
- JWT admin auth (`POST /api/admin-login` → bearer token used by `/api/admin*`)
- bcrypt password hashes seeded server-side at startup
- IP+username login attempt lockout (5 fails → 15 min lockout)
- CORS restricted to `ALLOWED_ORIGINS` env list
- XSS-prone strings sanitized server-side before persistence

### Frontend refactor
- Extracted from `App.js` into `/app/frontend/src/pages/`:
  - `AIAssessmentTool.js` (5-question wizard, server-scored maturity)
  - `ROICalculator.js` (regional currency, recommended-services pricing)
  - `SmartCalendar.js` (consultation booking)
- All 5 lead-capture forms now flow through `/app/frontend/src/lib/api.js` (Newsletter & Contact refactored this fork)
- GDPR cookie banner with localStorage persistence (`CookieBanner.js`)
- `fetchpriority` JSX attribute corrected to `fetchPriority`
- `ipapi.co` region detection now silent-fail + cached in `localStorage` (`orgainse_region`)
- React lazy-loading for `/admin`, `/ai-assessment`, `/roi-calculator`, `/smart-calendar`

### Data-testids added (testing/automation)
- `newsletter-email-input`, `newsletter-submit-btn`, `newsletter-status-success|duplicate|error`
- `contact-name-input`, `contact-email-input`, `contact-phone-input`, `contact-company-input`, `contact-subject-input`, `contact-message-input`, `contact-submit-btn`, `contact-success-message`
- `admin-username-input`, `admin-password-input`, `admin-login-submit-btn`, `admin-login-error`
- `assessment-*`, `roi-*` test IDs on the extracted pages

### Booking
- Calendly removed; replaced with Google Calendar URL placeholder in `src/lib/booking.js` (`REACT_APP_BOOKING_URL`).

### Dev environment
- `craco.config.js` now sets `devServer.allowedHosts: 'all'` so the React dev server accepts the K8s ingress host header.
- FastAPI mirror at `localhost:8001` reachable via `/api/*` through ingress.

## Verified by testing agent

- Iteration 1: 8/10 flows green; identified newsletter & contact bypassing `api.js` and missing testids.
- Iteration 2 (after fix): 4/4 retest objectives **PASS** (100%). Admin counts: Newsletter=3, Contact=2, AI Assessment=2, ROI=2, Consultations=2.

## Open / Backlog

### P1 — Decouple App.js
`App.js` is still ~4752 lines. Sections to extract into `/app/frontend/src/pages/` and `/app/frontend/src/components/`:
- `Home`, `About`, `Services`, `Contact`, `PrivacyPolicy`, `TermsOfService`, `NotFound`
- `Navigation`, `Footer`, `RegionalPricingProvider`, `CalendlyProvider`
- Remove the ~5 leftover raw `fetch(BACKEND_URL + '/api/contact')` blocks (lines ~1989, 2042, 3083, 3531, 4073) — these belong to inline contact forms inside Home/About/Services and should also use `api.contact()`.

### P2 — Cleanup
- Delete dead files: `GoogleCalendarBooking.js`, `CalendlyBooking.js`, `/api/ai-assessment-simple.js`, `/api/test-uuid.js` (if still present in repo)
- Clean duplicated env-file block in `.gitignore` (~30 dupes)
- Review `<link rel="preload">` tags causing "preloaded but not used" warnings

### P3 — Quality / DX
- ESLint + GitHub Actions CI + Playwright smoke test
- Rewrite `README.md` to reflect the actual Vercel/Node stack (not FastAPI)
- Pagination UI in admin dashboard (backend already supports `?page=&page_size=`)

## Credentials & env

See `/app/memory/test_credentials.md`.

## Endpoint map

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET    | `/api/health`          | — | liveness |
| POST   | `/api/admin-login`     | — | returns JWT |
| POST   | `/api/contact`         | — | XSS-sanitized; routes to specific collection by `leadType` |
| POST   | `/api/newsletter`      | — | dedupes by email |
| POST   | `/api/ai-assessment`   | — | server-side maturity scoring |
| POST   | `/api/roi-calculator`  | — | regional currency math |
| POST   | `/api/consultation`    | — | 24h-dedupe per email |
| GET    | `/api/admin`           | Bearer | paginated |
| DELETE | `/api/admin-delete`    | Bearer | all / collection / single |
