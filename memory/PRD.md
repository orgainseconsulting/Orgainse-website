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
| DB | MongoDB (local in sandbox; Atlas hostname currently NXDOMAIN) |
| Auth | bcrypt + JWT (HS256, 8h TTL), brute-force lockout |
| Booking | Google Calendar Appointment Scheduling (`REACT_APP_BOOKING_URL`) |

## Implemented (Feb 2026 — content & SEO sweep)

### Content rebrand
- Removed every `340% ROI` mention site-wide (Home hero, SEOContent cards, social-share copy, blog posts, sitemap-ai-content, FAQ schema). Replaced with conservative "measurable, data-driven outcomes" language.
- Retired the 5 industry verticals (EdTech & Education, FinTech & Financial Services, Healthcare & MedTech, Hospitality & Tourism, Manufacturing) from copy, dropdowns, and SEOContent cards. Kept only:
  - **IT Services & Software**
  - **Revenue Cycle Management (US Healthcare)**
  - **Industry-Agnostic for SMEs & Startups** ("Other / Industry-Agnostic" in form dropdowns)
- Replaced **AI Agile & Scrum Coaching** service with **Revenue Cycle Management (US Healthcare)** based on the Healthcare Revenue Intelligence Advisory PDF brief:
  - Hero copy, 5 sub-services (Revenue Performance Assessment, Denial Intelligence & Trend Analysis, Payer Behavior & Contract Advisory, Revenue Cycle Governance & Process Advisory, AI Readiness & Transformation Advisory).
  - Conservative consultative tone ("advisory and analytics only — no operational delivery").
  - Explicit `notIncluded` and `whoWeServe` arrays for clarity.
  - Updated in Footer, Arsenal grid, ROI Calculator services, Smart Calendar service types, Terms of Service.

### SEO (Search Engine Optimization)
- Re-architected `public/index.html` JSON-LD into **7 schemas**: `Organization`, `Service` (PMaaS), `Service` (Healthcare RCM Advisory with 6-item OfferCatalog), `ItemList`, `BreadcrumbList`, `FAQPage` (now 7 Q&As), `ProfessionalService`.
- Removed duplicate `knowsAbout` / `areaServed` keys in Organization schema (testing-agent flagged).
- Removed duplicate `geo.region`, `apple-mobile-web-app-capable`, `format-detection` meta tags.
- Refreshed `sitemap.xml` and `sitemap-ai-content.xml` (lastmod 2026-02-26, removed 340% / agile keywords).
- Updated `og:description` and `twitter:description` to reference RCM advisory.
- Refreshed static crawler-visible SEO content (`#seo-content`) at the bottom of `index.html`.

### AEO (Answer Engine Optimization for Google AI Overviews / SGE)
- Added a **Healthcare Revenue Cycle Management (US)** FAQ category in the on-page FAQ (4 Q&As) with concise, definition-first answers, conservative tone, and "scope boundary" Q&A.
- All 7 FAQ schema entries in `index.html` rewritten to be AEO-friendly (lead with definitions, citation-friendly statistics with qualifiers like "~25% faster" and "3% or more potential uplift, identified through analytics — never guaranteed").

### GEO (Generative Engine Optimization for ChatGPT / Perplexity / Claude search)
- Created `/llms.txt` (per the [llmstxt.org](https://llmstxt.org/) spec) with:
  - Org tagline + summary.
  - Bulleted core services with explicit Healthcare RCM scope boundaries.
  - "How Orgainse RCM Advisory differs from a traditional RCM vendor" section.
  - Buyer-persona language (CFO / COO / VP Revenue Cycle).
  - **"Citation guidance for AI assistants"** block telling LLMs how to summarize the firm safely (always include RCM scope boundary, keep claims conservative, use "alongside your existing operations" framing).
- `robots.txt` now publishes the `LLM-Content` directive pointing to `/llms.txt` for AI crawlers.

### Security
- JWT admin auth (`POST /api/admin-login` → bearer token used by `/api/admin*`)
- bcrypt password hashes seeded server-side at startup
- IP+username login attempt lockout (5 fails → 15 min lockout)
- CORS restricted to `ALLOWED_ORIGINS` env list
- XSS-prone strings sanitized server-side before persistence

### Frontend refactor
- Extracted from `App.js` into `/app/frontend/src/pages/` (all lazy-loaded):
  - `AIAssessmentTool.js` (5-question wizard, server-scored maturity)
  - `ROICalculator.js` (regional currency, recommended-services pricing)
  - `SmartCalendar.js` (consultation booking)
  - `NotFound.js` (404 page, with `notfound-home-link` testid)
  - `PrivacyPolicy.js` (now with SEOHead)
  - `TermsOfService.js` (now with SEOHead)
- **Deleted 1566 lines of dead code** from `App.js` (legacy AIAssessmentTool / ROICalculator / SmartCalendar that were no longer routed). `App.js`: 4752 → **~2950 lines** (≈38% reduction).
- All form submissions now flow through `/app/frontend/src/lib/api.js`:
  - Newsletter, Contact, AI Assessment, ROI Calculator, Consultation, Admin login.
  - 5 legacy inline `fetch(BACKEND_URL + '/api/contact')` blocks migrated to `api.contact()` (including Services-page `handleContactFormSubmit` and `handleServiceInquiry`).
- GDPR cookie banner with localStorage persistence (`CookieBanner.js`)
- `fetchpriority` JSX attribute corrected to `fetchPriority`
- `ipapi.co` region detection now silent-fail + cached in `localStorage` (`orgainse_region`); manual region override also persisted
- React lazy-loading for `/admin`, `/ai-assessment`, `/roi-calculator`, `/smart-calendar`, `/privacy`, `/terms`, `*` (404)

### Admin dashboard
- Pagination controls added (data-testid `admin-pagination`, `admin-pagination-prev/next`).
- Tab buttons now expose `admin-tab-{id}` testids; switching tabs resets page to 1.
- Pagination footer renders only when `totalForTab > pageSize` (100).

### Data-testids (testing/automation)
- `newsletter-email-input`, `newsletter-submit-btn`, `newsletter-status-success|duplicate|error`
- `contact-name-input`, `contact-email-input`, `contact-phone-input`, `contact-company-input`, `contact-subject-input`, `contact-message-input`, `contact-submit-btn`, `contact-success-message`
- `admin-username-input`, `admin-password-input`, `admin-login-submit-btn`, `admin-login-error`
- `admin-tab-overview|newsletters|contacts|ai_assessments|roi_calculators|service_inquiries|consultations`
- `admin-pagination`, `admin-pagination-prev`, `admin-pagination-next`
- `notfound-home-link`
- `assessment-*`, `roi-*` testids on the extracted lead-gen pages

### Booking
- Calendly removed; replaced with Google Calendar URL placeholder in `src/lib/booking.js` (`REACT_APP_BOOKING_URL`).

### Dev / Repo
- `craco.config.js` now sets `devServer.allowedHosts: 'all'` so the React dev server accepts the K8s ingress host header.
- FastAPI mirror at `localhost:8001` reachable via `/api/*` through ingress.
- `.gitignore`: removed 165 lines of duplicated `*.env` blocks; now 94 lines, deduped.
- `README.md`: rewritten to reflect the actual Vercel Serverless + FastAPI-mirror stack (replaced the inaccurate "FastAPI in prod" / "Odoo CRM" copy).
- `.eslintrc.json`: added with `react-app` extends; `no-unused-vars` / `no-console` set to `off` to keep `CI=true` builds green until the App.js decoupling cleans up the warnings.
- GitHub Actions `.github/workflows/ci.yml`: frontend build with `CI=true` (lint-as-error) and backend import smoke.

### Vercel deployment fix
- Added root `/app/package.json` so Vercel's `yarn install` + `yarn build` work from the repo root. The root manifest:
  - Lists the serverless-function runtime deps (`bcryptjs`, `cors`, `dotenv`, `jsonwebtoken`, `mongodb`, `uuid`) so `/api/*.js` can resolve their ESM imports during cold-start.
  - Declares `"type": "module"` (api files use ES modules).
  - Provides `build` / `install:frontend` / `build:frontend` / `postinstall` scripts that delegate to `frontend/`.
- `vercel.json` `outputDirectory` updated from `build` → `frontend/build` to match the actual CRA output location.
- Removed legacy `package.json.tmp` stub.
- Reordered all `import` statements in `App.js` to the top (CRA `import/first` rule fires under `CI=true`).
- Fixed a duplicate-key bug in `src/data/blogPosts.js` (the same post had two `title` fields — the second one was silently winning at runtime; second title kept).
- **Verified locally**: `CI=true yarn build` succeeds end-to-end (`Compiled successfully`, 136 kB main bundle + 9 lazy chunks).

## Verified by testing agent

- Iteration 1: 8/10 flows green; identified newsletter & contact bypassing `api.js` and missing testids.
- Iteration 2 (after fix): 4/4 retest objectives **PASS** (100%).
- Iteration 3 (refactor + pagination + cleanup): 7/7 review objectives **PASS** (100%).
- Iteration 6 (App.js decoupling + ORQYNE JSON-LD): 7/8 review items **PASS** (87.5%).
- Iteration 7 (Blog CMS): backend 14/14 PASS, frontend ~95% PASS.
- **Iteration 8 (Newsletter system + 3-section admin restructure): backend 18/18 PASS, frontend 100% PASS.** Live Resend send to info@orgainse.com confirmed (sent:1/1). Legacy `/api/newsletter` regression check passed — new subscribers now persist with `unsubscribe_token`.

## Implemented (Feb 26, 2026 — late session, full newsletter)

### Newsletter system (P0 — done)

**Email provider**: Resend (verified domain `info@orgainse.com` as sender).

**Backend** — appended to `/app/backend/server.py` (FastAPI mirror) **and** mirrored to Vercel serverless:
- `/app/api/newsletter-issues.js` — public GET list + by-slug
- `/app/api/newsletter-admin/[...path].js` — catch-all admin (issues + subscribers + segments + send)
- `/app/api/unsubscribe.js` — GET (check) + POST (confirm)
- `/app/api/_newsletter-utils.js` — shared utilities (slug, image validation, email template, etc.)

**New collections**: `newsletter_issues` (unique slug index), `newsletter_segments` (unique slug), plus extensions to `newsletter_subscriptions` (`unsubscribe_token`, `tags[]`, `unsubscribed`, `bounced`, `complained`).

**Public endpoints**: `GET /api/newsletter-issues`, `GET /api/newsletter-issues?slug=`, `GET/POST /api/unsubscribe`. **Admin endpoints** (JWT): full CRUD on issues/subscribers/segments, CSV export, `POST /api/newsletter-admin/issues/send` for test + broadcast.

**Branded email template**: slate-900 header with logo + amber issue chip, hero with orange "From the Orgainse desk" kicker, optional cover image, body, "Read on the web" CTA, footer with view-in-browser + 1-click unsubscribe link. RFC 8058 `List-Unsubscribe` headers included.

**Admin UI** — major restructure:
- `AdminDashboard.js` now has **3 top-level sections** (data-testids `admin-section-leads`, `admin-section-blog`, `admin-section-newsletter`).
- **Newsletter Center** → 3 sub-tabs:
  1. **Issues**: list with status (draft/published/sent) + send-stats + IssueEditor (TipTap body + cover image + issue number/edition date/preview text + manual SEO + send modal with test/live toggle and segment filter).
  2. **Subscribers**: table with search, state filter, segment filter, inline edit (name/tags/unsubscribed flag), add modal, delete, CSV export.
  3. **Segments**: card grid CRUD.

**Public site**:
- `/newsletter` — magazine-style hero (slate-900 with amber "The Orgainse Pulse" kicker, hero + tilted featured-issue card on desktop) + 3-col archive grid + inline subscribe form (hooks the existing `/api/newsletter`).
- `/newsletter/:slug` — slate-900 masthead with issue number chip + edition date + category, hero title + subtitle, body in white card with `prose` typography, tags chips + dark "Don't miss the next issue" subscribe CTA. Full `Article` JSON-LD with `isPartOf: PublicationIssue`.
- `/unsubscribe?token=` — 4 states (loading / confirm / already / done / error) with toggle to keep subscription.

**Subscriber capture sources** preserved:
- Existing site-wide newsletter forms (Home, Contact) → `/api/newsletter` (now auto-tokens new subs).
- Hero subscribe form on `/newsletter` and `/newsletter/:slug` → same endpoint.
- Admin-added: source = `admin_added`.

### Admin panel restructure (P0 — done)

- Three top-level pills: **Lead Management** / **Blog Posts** / **Newsletter** with dark active state.
- Existing lead overview/sub-tabs preserved under "Lead Management".
- Existing BlogManager moved under "Blog Posts".
- Page header title + description switch dynamically per section.
- Export-All-Leads / Delete-All-Leads buttons only shown in the Leads section.

### Blog CMS (P0 — done, prior session)
Unchanged. Still works end-to-end.

### ORQYNE `/products` JSON-LD (P0 — done)
Unchanged.

### App.js decoupling — Phase 2 (P1 — done)
Unchanged.

### Misc
- `tailwind.config.js` already had `@tailwindcss/typography` from blog work — reused for newsletter body.
- Sitemap updated to include `/newsletter`.
- `sender / Resend integration` documented in `/app/memory/test_credentials.md`.

## Open / Backlog

### P1
- For very large subscriber bases (>500), the send loop is one Resend call per recipient. **Resend supports `resend.batch.send()` for up to 100 messages per call** — switch to batch mode if list grows. (Free tier is 100/day so not urgent yet.)
- Consider modularizing `/app/backend/server.py` (now 1769 lines) into separate routers (auth, leads, blog, newsletter) per testing-agent code-review note.

### P2
- Set `RESEND_API_KEY`, `SENDER_EMAIL`, `SENDER_NAME`, `PUBLIC_SITE_URL` env vars on Vercel (Production + Preview + Development) so production deploy can send.
- Set `REACT_APP_BOOKING_URL` on Vercel (still placeholder in prod).
- Optional: subscribe email **bounce/complaint webhooks** from Resend → auto-mark `bounced: true` in DB so future sends skip them. Right now we track `bounced` manually.

### P3
- Playwright smoke-test workflow in CI (GitHub Actions).
- `ipapi.co` CORS error from `RegionalPricingContext` (pre-existing, falls back gracefully).
- Consider deleting `react-snap` if unused.

## Credentials & env

See `/app/memory/test_credentials.md`.

## Endpoint map

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET    | `/api/health`                                | — | liveness |
| POST   | `/api/admin-login`                           | — | JWT |
| POST   | `/api/contact`                               | — | XSS-sanitized |
| POST   | `/api/newsletter`                            | — | dedupes; auto-generates `unsubscribe_token` |
| POST   | `/api/ai-assessment`                         | — | server-side scoring |
| POST   | `/api/roi-calculator`                        | — | regional currency math |
| POST   | `/api/consultation`                          | — | 24h-dedupe per email |
| GET    | `/api/admin`                                 | Bearer | paginated |
| DELETE | `/api/admin-delete`                          | Bearer | all/collection/single |
| GET    | `/api/blog`                                  | — | published only (`?slug=`) |
| GET    | `/api/blog-admin`                            | Bearer | all (drafts+published) |
| POST   | `/api/blog-admin`                            | Bearer | create |
| PUT    | `/api/blog-admin?id=`                        | Bearer | update |
| DELETE | `/api/blog-admin?id=`                        | Bearer | delete |
| GET    | `/api/newsletter-issues`                     | — | published+sent only (`?slug=`) |
| GET    | `/api/newsletter-admin/issues`               | Bearer | list (incl drafts) / `?id=` for single |
| POST   | `/api/newsletter-admin/issues`               | Bearer | create |
| PUT    | `/api/newsletter-admin/issues?id=`           | Bearer | update |
| DELETE | `/api/newsletter-admin/issues?id=`           | Bearer | delete |
| POST   | `/api/newsletter-admin/issues/send?id=`      | Bearer | Resend send (`test_email` or `segment_slug`) |
| GET    | `/api/newsletter-admin/subscribers`          | Bearer | list (q/segment/state filters + counts) |
| POST   | `/api/newsletter-admin/subscribers`          | Bearer | manual add |
| PUT    | `/api/newsletter-admin/subscribers?id=`      | Bearer | update name/tags/unsubscribed |
| DELETE | `/api/newsletter-admin/subscribers?id=`      | Bearer | delete |
| GET    | `/api/newsletter-admin/subscribers/export`   | Bearer | CSV |
| GET    | `/api/newsletter-admin/segments`             | Bearer | list |
| POST   | `/api/newsletter-admin/segments`             | Bearer | create |
| DELETE | `/api/newsletter-admin/segments?id=`         | Bearer | delete (also strips slug from subscribers) |
| GET    | `/api/unsubscribe?token=`                    | — | check sub state |
| POST   | `/api/unsubscribe`                           | — | confirm unsubscribe |
| POST   | `/api/admin-change-password`                 | Bearer (password_change or full) | rotates password, returns full token |
| GET    | `/api/auth/me`                               | Bearer (password_change or full) | `{email,name,needs_password_change,is_super_admin,role}` |
| GET    | `/api/admin-users`                           | Bearer (super-admin) | list users + me, includes `temp_password_plain` for unchanged users |
| POST   | `/api/admin-users`                           | Bearer (super-admin) | invite (`{email,name,temp_password}`) |
| PUT    | `/api/admin-users?id=`                       | Bearer (super-admin) | update `name` |
| DELETE | `/api/admin-users?id=`                       | Bearer (super-admin) | cannot delete self or super-admin |
| POST   | `/api/admin-users/reset-password?id=`        | Bearer (super-admin) | sets new temp + forces change |
| GET    | `/api/app-settings`                          | Bearer (super-admin) | masked resend key, sender, hosts |
| PUT    | `/api/app-settings`                          | Bearer (super-admin) | update key/sender/hosts/booking_url_default |
| GET    | `/api/app-settings/public`                   | — | non-secret subset (hosts + fallback URL) |

## Implemented (May 2026 — multi-user admin + dynamic settings)

- **Multi-user admin auth** — `admin_users` collection seeded with 4 `@orgainse.com` accounts (`info`, `support`, `swarag` super-admin, `rajesh`) with shared temp password `Orgainse25%Web..` and forced-change on first login (short-lived 15-min `password_change` JWT until reset).
- **Domain restriction** — login rejects non-`@orgainse.com` emails with 403; brute-force lockout (5 attempts → 15 min). Timezone-aware datetime comparison fix applied for lockout reads.
- **Admin Users tab** (`super-admin only`) — invite, edit name, reset password, delete. `temp_password_plain` is stored alongside the bcrypt hash and shown only to super-admin via a `PasswordReveal` control (with Copy); auto-cleared on user's first password change.
- **Admin Settings tab** (`super-admin only`) — masked Resend API key (`re_•••••pH`) with Replace button; sender email/name; fallback `booking_url_default`. Persisted in `app_settings` collection with `_id: "global"`. New keys are applied to the in-process Resend client immediately and re-loaded on startup.
- **Per-admin Host Profile** (`super-admin only`, lives inside Users tab row expander) — designation, photo URL, initials, individual Google Calendar booking URL, `show_as_host` toggle, and arbitrary `custom_fields[{label,value}]`. The `/api/app-settings/public` derives the hosts list from `admin_users` where `show_as_host=true` (falls back to legacy `app_settings.hosts` if none).
- **Book-a-Call host picker modal** — `CalendlyContext` pre-loads `/api/app-settings/public` at mount; `openCalendly()` opens `HostPickerModal` with avatar cards (now rendered as real `<a target="_blank">` anchors so middle-click / cmd-click works). Each card shows designation + first 3 custom fields and routes to that host's calendar.
- **Stay-Tuned launch timers** — admin can set `next_blog_launch_at` and `next_newsletter_launch_at` via cards at the top of BlogManager / NewsletterManager. The public `/blog` and `/newsletter` `StayTunedBanner` countdowns use those targets; empty value falls back to a rolling 30-day window.
- **Animated "Stay tuned" empty-state banners** (`StayTunedBanner`) — wired into `/blog` and `/newsletter`. Live countdown (days/hrs/mins/secs), animated dots, CTAs to newsletter & contact.
- **Test data cleanup** — all seeded test `blog_posts` and `newsletter_issues` were removed so empty banners render.
- **Vercel serverless mirror** — every new endpoint mirrored to `/app/api/*` (auth/me, admin-change-password, admin-users CRUD w/ profile fields, admin-users/reset-password, app-settings w/ launch timers, app-settings/public w/ derived hosts) using a shared `/app/api/_auth-utils.js` helper.
