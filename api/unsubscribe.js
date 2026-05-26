/**
 * GET /api/unsubscribe?token=  → returns email + already_unsubscribed
 * POST /api/unsubscribe { token } → marks unsubscribed
 */
import { getDb, nowIso } from './_newsletter-utils.js';
import { securityHeaders, rateLimit } from './middleware/security.js';

export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!rateLimit(req, res, { max: 30, windowMs: 15 * 60 * 1000 })) return;

  try {
    const db = await getDb();
    const col = db.collection('newsletter_subscriptions');

    if (req.method === 'GET') {
      const token = req.query.token;
      if (!token) return res.status(400).json({ error: 'Token required' });
      const sub = await col.findOne({ unsubscribe_token: token }, { projection: { _id: 0, email: 1, unsubscribed: 1 } });
      if (!sub) return res.status(404).json({ error: 'Invalid or expired unsubscribe link' });
      return res.status(200).json({ success: true, email: sub.email, already_unsubscribed: !!sub.unsubscribed });
    }

    if (req.method === 'POST') {
      const body = req.body && typeof req.body === 'object' ? req.body : await new Promise((r) => {
        let s = ''; req.on('data', (c) => { s += c; }); req.on('end', () => { try { r(JSON.parse(s || '{}')); } catch { r({}); } });
      });
      const token = String(body.token || '').trim();
      if (!token) return res.status(400).json({ error: 'Token required' });
      const sub = await col.findOne({ unsubscribe_token: token });
      if (!sub) return res.status(404).json({ error: 'Invalid or expired unsubscribe link' });
      await col.updateOne(
        { unsubscribe_token: token },
        { $set: { unsubscribed: true, unsubscribed_at: nowIso(), status: 'unsubscribed' } }
      );
      return res.status(200).json({ success: true, email: sub.email });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('unsubscribe error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
