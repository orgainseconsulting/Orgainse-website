/**
 * Shared security middleware for /api/* handlers.
 * - Strict CORS allowlist (no wildcard with credentials)
 * - Tight CSP for API responses (no asset fetches needed)
 * - In-memory token-bucket rate limiter (best-effort across cold starts)
 * - Input sanitization + email/phone validation
 * - Request-size validation
 */

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const DEFAULT_ALLOWED = [
  'http://localhost:3000',
  'https://www.orgainse.com',
  'https://orgainse.com',
  'https://orgainse-consulting.vercel.app',
  'https://orgainse-website.vercel.app',
];

function effectiveAllowedOrigins() {
  return ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : DEFAULT_ALLOWED;
}

export const securityHeaders = (req, res) => {
  // API CSP: no resource loading allowed.
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()'
  );
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');

  // CORS — explicit allowlist; no wildcard when credentials may be in play.
  const allowed = effectiveAllowedOrigins();
  const origin = req.headers.origin;
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
};

// ---------------------------------------------------------------------------
// Rate limiting (in-memory; best-effort under serverless cold starts)
// ---------------------------------------------------------------------------
const rateLimitStore = new Map();

export const rateLimit = (req, res, options = {}) => {
  const { windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests, please try again later.' } = options;
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.headers['x-real-ip']
    || req.connection?.remoteAddress
    || 'unknown';

  const now = Date.now();
  const windowStart = now - windowMs;
  const recent = (rateLimitStore.get(ip) || []).filter((t) => t > windowStart);

  if (recent.length >= max) {
    res.status(429).json({ error: message, retryAfter: Math.ceil(windowMs / 1000) });
    return false;
  }
  recent.push(now);
  rateLimitStore.set(ip, recent);
  res.setHeader('X-RateLimit-Limit', String(max));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - recent.length)));
  res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
  return true;
};

// ---------------------------------------------------------------------------
// Input sanitization
// ---------------------------------------------------------------------------
const SCRIPT_RE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const JS_PROTOCOL_RE = /javascript:/gi;
const EVENT_HANDLER_RE = /on\w+\s*=/gi;

export const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return data
      .trim()
      .replace(SCRIPT_RE, '')
      .replace(JS_PROTOCOL_RE, '')
      .replace(EVENT_HANDLER_RE, '')
      .substring(0, 10000);
  }
  if (Array.isArray(data)) return data.map(sanitizeInput);
  if (data && typeof data === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(data)) out[k] = sanitizeInput(v);
    return out;
  }
  return data;
};

export const validateEmail = (email) =>
  typeof email === 'string' &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
  email.length <= 254;

export const validateRequestSize = (req, res, maxSize = 1024 * 1024) => {
  const len = parseInt(req.headers['content-length'] || '0', 10);
  if (len > maxSize) {
    res.status(413).json({ error: 'Request payload too large', maxSize: `${maxSize / 1024 / 1024}MB` });
    return false;
  }
  return true;
};

// Periodic GC of the rate-limit store (best-effort)
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  for (const [ip, ts] of rateLimitStore.entries()) {
    const recent = ts.filter((t) => t > now - windowMs);
    if (recent.length === 0) rateLimitStore.delete(ip);
    else rateLimitStore.set(ip, recent);
  }
}, 5 * 60 * 1000).unref?.();
