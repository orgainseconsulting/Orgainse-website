/**
 * Single Vercel serverless dispatcher.
 *
 * Why this exists:
 *   The Vercel Hobby plan caps a deployment at 12 serverless functions, but the
 *   Orgainse API has ~21 endpoints. We collapse them into ONE function by:
 *     1. Moving every handler into /api/_handlers/** (the underscore prefix
 *        excludes the folder from Vercel's function discovery).
 *     2. Importing each handler statically here and dispatching by request path.
 *
 * The public URLs (`/api/contact`, `/api/admin-login`, `/api/auth/me`, ...) are
 * unchanged — Vercel's optional catch-all routing maps every `/api/*` request
 * through this file.
 */

// Public (no-auth) handlers
import healthHandler from './_handlers/health.js';
import geoHandler from './_handlers/geo.js';
import contactHandler from './_handlers/contact.js';
import newsletterHandler from './_handlers/newsletter.js';
import aiAssessmentHandler from './_handlers/ai-assessment.js';
import roiCalculatorHandler from './_handlers/roi-calculator.js';
import consultationHandler from './_handlers/consultation.js';
import blogHandler from './_handlers/blog.js';
import newsletterIssuesHandler from './_handlers/newsletter-issues.js';
import unsubscribeHandler from './_handlers/unsubscribe.js';
import appSettingsPublicHandler from './_handlers/app-settings/public.js';

// Admin handlers
import adminLoginHandler from './_handlers/admin-login.js';
import adminChangePasswordHandler from './_handlers/admin-change-password.js';
import adminHandler from './_handlers/admin.js';
import adminDeleteHandler from './_handlers/admin-delete.js';
import adminUsersHandler from './_handlers/admin-users.js';
import adminUsersResetPasswordHandler from './_handlers/admin-users/reset-password.js';
import authMeHandler from './_handlers/auth/me.js';
import appSettingsHandler from './_handlers/app-settings.js';
import blogAdminHandler from './_handlers/blog-admin.js';
import newsletterAdminHandler from './_handlers/newsletter-admin/index.js';

// Vercel function config:
// - maxDuration: newsletter sends can take >10s when fanning out to Resend.
// - bodyParser.sizeLimit: blog/newsletter editors POST base64 cover images
//   (~1.5 MB raw → ~2 MB encoded) on top of HTML, so the default 1 MB cap
//   would silently drop large saves.
export const config = {
  maxDuration: 60,
  api: {
    bodyParser: { sizeLimit: '4mb' },
  },
};

function notFound(res, path) {
  return res.status(404).json({ error: 'Not found', path });
}

export default async function handler(req, res) {
  // Resolve route segments.
  //
  // We try TWO sources in priority order, because Vercel's runtime behaviour
  // for `[[...slug]].js` is inconsistent across regions / build versions:
  //   1. req.query.slug — populated by Vercel's catch-all matcher. This is the
  //      authoritative path the matcher saw. Always an array when present.
  //   2. req.url — the original request URL. Used as a fallback (and for
  //      local Node tests where req.query is mocked).
  //
  // Using req.query.slug first avoids edge cases where Vercel rewrites
  // req.url to `/api/[[...slug]]` (without the real segments) under certain
  // optimization passes.
  let segments;
  if (Array.isArray(req.query?.slug) && req.query.slug.length) {
    segments = req.query.slug.filter(Boolean);
  } else if (typeof req.query?.slug === 'string' && req.query.slug) {
    segments = [req.query.slug];
  } else {
    const rawPath = (req.url || '').split('?')[0] || '';
    const cleanPath = rawPath.replace(/^\/+/, '').replace(/^api\/?/, '');
    segments = cleanPath.split('/').filter(Boolean);
  }
  const first = segments[0] || '';
  const second = segments[1] || '';

  // Two-segment routes first (most specific).
  if (first === 'admin-users' && second === 'reset-password') {
    return adminUsersResetPasswordHandler(req, res);
  }
  if (first === 'auth' && second === 'me') {
    return authMeHandler(req, res);
  }
  if (first === 'app-settings' && second === 'public') {
    return appSettingsPublicHandler(req, res);
  }
  if (first === 'newsletter-admin') {
    // The newsletter-admin handler does its own internal sub-routing (issues
    // / subscribers / segments / send / export) and reads `req.query.path`
    // (from the original `[...path].js` shape). Inject that here so the
    // handler picks up the right resource/action even when Vercel routes
    // via the top-level slug catch-all.
    req.query.path = segments.slice(1);
    return newsletterAdminHandler(req, res);
  }

  // Single-segment routes.
  switch (first) {
    case 'health': return healthHandler(req, res);
    case 'geo': return geoHandler(req, res);
    case 'contact': return contactHandler(req, res);
    case 'newsletter': return newsletterHandler(req, res);
    case 'ai-assessment': return aiAssessmentHandler(req, res);
    case 'roi-calculator': return roiCalculatorHandler(req, res);
    case 'consultation': return consultationHandler(req, res);
    case 'blog': return blogHandler(req, res);
    case 'newsletter-issues': return newsletterIssuesHandler(req, res);
    case 'unsubscribe': return unsubscribeHandler(req, res);
    case 'admin-login': return adminLoginHandler(req, res);
    case 'admin-change-password': return adminChangePasswordHandler(req, res);
    case 'admin': return adminHandler(req, res);
    case 'admin-delete': return adminDeleteHandler(req, res);
    case 'admin-users': return adminUsersHandler(req, res);
    case 'app-settings': return appSettingsHandler(req, res);
    case 'blog-admin': return blogAdminHandler(req, res);
    default: return notFound(res, rawPath);
  }
}
