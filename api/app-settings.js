/**
 * /api/app-settings   — GET (super-admin) | PUT (super-admin)
 *
 * Dynamic configuration: Resend API key (masked on read), sender identity,
 * Book-a-Call hosts list + fallback URL. Stored in `app_settings` collection
 * with a single document id "global".
 *
 * Public endpoint: /api/app-settings/public (no auth, no secrets).
 */
import { securityHeaders, validateRequestSize, sanitizeInput } from './middleware/security.js';
import { requireAdmin } from './middleware/verify-admin.js';
import { getDb, requireSuperAdmin, cryptoRandomId, maskSecret } from './_auth-utils.js';

const SETTINGS_ID = 'global';

function toAdminShape(doc) {
  doc = doc || {};
  return {
    resend_api_key_masked: maskSecret(doc.resend_api_key || process.env.RESEND_API_KEY || ''),
    resend_api_key_set: !!(doc.resend_api_key || process.env.RESEND_API_KEY),
    sender_email: doc.sender_email || process.env.SENDER_EMAIL || '',
    sender_name: doc.sender_name || process.env.SENDER_NAME || '',
    booking_url_default: doc.booking_url_default || '',
    hosts: Array.isArray(doc.hosts) ? doc.hosts : [],
    updated_at: doc.updated_at || null,
  };
}

export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!validateRequestSize(req, res, 32 * 1024)) return;

  const claims = requireAdmin(req, res);
  if (!claims) return;

  try {
    const db = await getDb();
    const me = await requireSuperAdmin(db, claims, res);
    if (!me) return;

    if (req.method === 'GET') {
      const doc = await db.collection('app_settings').findOne({ _id: SETTINGS_ID });
      return res.status(200).json({ success: true, settings: toAdminShape(doc) });
    }

    if (req.method === 'PUT') {
      const body = sanitizeInput(req.body || {});
      const updates = {};

      if (typeof body.resend_api_key === 'string') {
        const k = body.resend_api_key.trim();
        if (k && !k.startsWith('re_')) {
          return res.status(400).json({ error: "Resend API keys start with 're_'" });
        }
        updates.resend_api_key = k;
      }
      if (typeof body.sender_email === 'string') updates.sender_email = body.sender_email.slice(0, 120);
      if (typeof body.sender_name === 'string') updates.sender_name = body.sender_name.slice(0, 120);
      if (typeof body.booking_url_default === 'string') {
        updates.booking_url_default = body.booking_url_default.slice(0, 500);
      }
      if (Array.isArray(body.hosts)) {
        updates.hosts = body.hosts
          .filter((h) => h && h.name && h.booking_url)
          .map((h) => ({
            id: h.id || cryptoRandomId(),
            name: String(h.name).slice(0, 80),
            role: String(h.role || '').slice(0, 120),
            photo_url: String(h.photo_url || '').slice(0, 1000),
            initials: String(h.initials || '').slice(0, 4).toUpperCase(),
            booking_url: String(h.booking_url).slice(0, 500),
          }));
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No changes' });
      }
      updates.updated_at = new Date().toISOString();

      await db.collection('app_settings').updateOne(
        { _id: SETTINGS_ID },
        { $set: updates, $setOnInsert: { created_at: new Date().toISOString() } },
        { upsert: true }
      );
      const doc = await db.collection('app_settings').findOne({ _id: SETTINGS_ID });
      return res.status(200).json({ success: true, settings: toAdminShape(doc) });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('app-settings error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
