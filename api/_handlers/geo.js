/**
 * GET /api/geo
 *
 * Server-side proxy for visitor geo-IP lookup. Mirrors the FastAPI handler in
 * /app/backend/server.py (route /api/geo) so the SPA can use the same URL
 * whether it's running against the local FastAPI or the Vercel deployment.
 *
 * Why a proxy? Calling ipapi.co directly from the browser triggers a CORS
 * preflight error on some networks. Proxying server-side eliminates it and
 * lets us swap providers without a SPA redeploy.
 */
import { securityHeaders } from '../_middleware/security.js';

// Module-scoped cache survives between warm invocations on Vercel.
const CACHE = new Map(); // ip -> { ts, data }
const TTL_MS = 6 * 60 * 60 * 1000;

const FALLBACK = { country_code: '', country: '', region: '', city: '', timezone: '' };

export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const ip = ((req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.connection?.remoteAddress || '').replace(/^::ffff:/, '');

  const now = Date.now();
  const cached = CACHE.get(ip);
  if (cached && (now - cached.ts) < TTL_MS) {
    return res.status(200).json(cached.data);
  }

  try {
    const url = ip && ip !== '127.0.0.1' && ip !== '::1'
      ? `https://ipapi.co/${ip}/json/`
      : 'https://ipapi.co/json/';

    const upstream = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'OrgainseGeoProxy/1.0' },
    });
    if (upstream.ok) {
      const j = await upstream.json();
      const data = {
        country_code: (j.country_code || '').toUpperCase(),
        country: j.country_name || '',
        region: j.region || '',
        city: j.city || '',
        timezone: j.timezone || '',
      };
      CACHE.set(ip, { ts: now, data });
      return res.status(200).json(data);
    }
  } catch (err) {
    console.error('[geo] lookup failed:', err.message);
  }

  return res.status(200).json(FALLBACK);
}
