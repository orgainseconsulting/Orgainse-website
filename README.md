# Orgainse Consulting — Website

AI-native consulting marketing site with lead-capture tools (AI maturity assessment, ROI calculator, regional pricing, consultation booking) and a JWT-protected admin dashboard.

Deployed on **Vercel** (frontend + Node.js Serverless Functions) backed by **MongoDB**. A FastAPI mirror in `/backend` exists purely for local end-to-end testing inside dev sandboxes.

---

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19 + craco + Tailwind CSS + shadcn/ui (Radix primitives) |
| Backend (prod) | Vercel Node.js Serverless Functions in `/api/*.js` |
| Backend (dev mirror) | FastAPI in `/backend/server.py` — exposes the same `/api/*` routes for in-pod testing |
| Database | MongoDB (Atlas in prod, local in dev) |
| Auth | bcrypt + HS256 JWT (8h TTL) with IP+username brute-force lockout |
| Booking | Google Calendar Appointment Scheduling (set `REACT_APP_BOOKING_URL`) |
| Analytics | `@vercel/analytics`, `@vercel/speed-insights` |

---

## Repo layout

```
.
├── api/                       # Vercel Serverless Functions (production backend)
│   ├── middleware/            #   security.js, verify-admin.js
│   ├── admin-login.js
│   ├── admin.js
│   ├── admin-delete.js
│   ├── contact.js
│   ├── newsletter.js
│   ├── ai-assessment.js
│   ├── roi-calculator.js
│   ├── consultation.js
│   └── health.js
├── backend/                   # Dev-only FastAPI mirror of the /api functions
│   └── server.py
├── frontend/                  # React SPA
│   ├── public/
│   └── src/
│       ├── App.js             # Root + router (Home/About/Services/Contact still inline — backlog)
│       ├── components/        # AdminDashboard, AdminLogin, AuthContext, CookieBanner, SEOHead, …
│       ├── pages/             # AIAssessmentTool, ROICalculator, SmartCalendar, NotFound, PrivacyPolicy, TermsOfService
│       └── lib/               # api.js (axios wrapper), booking.js (Google Calendar URL), utils.js
├── memory/                    # Local agent memory (PRD.md, test_credentials.md)
└── vercel.json                # Vercel routing + cron jobs
```

---

## Local development

> Frontend dev server is `craco start` on port 3000; backend mirror is `uvicorn` on 8001.

```bash
# Frontend
cd frontend
yarn install
yarn start            # http://localhost:3000

# Backend mirror (only needed for end-to-end testing locally)
cd ../backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Required env vars

| Variable | Where | Purpose |
| --- | --- | --- |
| `REACT_APP_BACKEND_URL` | `frontend/.env` | Origin used by `src/lib/api.js` for all `/api/*` calls |
| `REACT_APP_BOOKING_URL` | `frontend/.env` | Google Calendar Appointment Scheduling URL |
| `MONGO_URL` | `backend/.env` / Vercel project env | Mongo connection string |
| `DB_NAME` | `backend/.env` / Vercel project env | Mongo database name |
| `JWT_SECRET` | `backend/.env` / Vercel project env | HS256 signing key |
| `ADMIN_USERNAME` | `backend/.env` / Vercel project env | Admin login user |
| `ADMIN_PASSWORD` | `backend/.env` / Vercel project env | Plaintext password (hashed at boot — never persisted) |
| `ALLOWED_ORIGINS` | `backend/.env` / Vercel project env | Comma-separated CORS allowlist |

---

## API endpoints

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET    | `/api/health`         | — | Liveness |
| POST   | `/api/admin-login`    | — | Returns `{ token, expires_in }` |
| POST   | `/api/contact`        | — | XSS-sanitized; routes to specific collection by `leadType` |
| POST   | `/api/newsletter`     | — | Dedupes by email |
| POST   | `/api/ai-assessment`  | — | Server-side maturity scoring + recommendations |
| POST   | `/api/roi-calculator` | — | Regional-currency ROI projection |
| POST   | `/api/consultation`   | — | 24h dedupe per email |
| GET    | `/api/admin`          | Bearer | Paginated (`?page=&page_size=`) |
| DELETE | `/api/admin-delete`   | Bearer | `?deleteType=all|collection|single&...` |

---

## Deployment

`vercel.json` routes `/api/*` to Node functions and the rest to the React SPA. Pushing to `main` triggers a Vercel build. Ensure all env vars above are set in the Vercel project dashboard.

---

## Testing

- Manual / curl: see `/memory/test_credentials.md` for admin creds and example flows.
- Automated regression: invoke the platform's testing agent — it consumes the data-testids documented in `/memory/PRD.md`.

---

## Backlog (P1 → P3)

See `/memory/PRD.md` for the full prioritized backlog. Highlights:

- **P1** — Finish decoupling `App.js`: extract `Home`, `About`, `Services`, `Contact`, `Navigation`, `Footer` into dedicated files. Three pages and three legacy components are already extracted.
- **P2** — Wire `REACT_APP_BOOKING_URL` to a real Google Calendar Appointment Scheduling URL.
- **P3** — ESLint + GitHub Actions CI + Playwright smoke test.
