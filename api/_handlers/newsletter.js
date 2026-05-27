/**
 * POST /api/newsletter — public newsletter signup.
 *
 * Mirrors the FastAPI version (routers/forms.py). Every new subscriber gets:
 *   - id (uuid)
 *   - email (lowercased, validated)
 *   - first_name / name
 *   - unsubscribe_token (so the 1-click unsubscribe always works)
 *   - tags: [] (empty so segment filters & broadcasts include them)
 *   - bounced / complained / unsubscribed flags
 *   - source = page that submitted (referer) so admins can trace where the
 *     subscriber came from in the Newsletter Manager → Subscribers tab.
 *
 * Subscribers from ANY public form (Home hero, /newsletter hero, individual
 * newsletter issue page, blog stay-tuned CTA) flow through this endpoint and
 * therefore all show up in `newsletter_subscriptions`, which is the source
 * of truth for the Newsletter Manager.
 */
import { randomUUID, randomBytes } from 'crypto';
import { MongoClient } from 'mongodb';
import {
  securityHeaders, rateLimit, sanitizeInput, validateEmail, validateRequestSize,
} from '../_middleware/security.js';

let cachedClient = null;
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGO_URL);
    await cachedClient.connect();
  }
  return cachedClient.db(process.env.DB_NAME || 'orgainse-consulting');
}

export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!rateLimit(req, res, { max: 100, windowMs: 15 * 60 * 1000 })) return;
    if (!validateRequestSize(req, res, 5 * 1024)) return;

    const body = sanitizeInput(req.body || {});
    const { email, first_name, name } = body;

    if (!email) return res.status(400).json({ error: 'Email is required', required: ['email'] });
    if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
    if ((first_name && first_name.length > 50) || (name && name.length > 100)) {
      return res.status(400).json({ error: 'Name field length exceeded limits' });
    }

    const db = await getDb();
    const lowerEmail = String(email).toLowerCase();

    const existing = await db.collection('newsletter_subscriptions').findOne({ email: lowerEmail });
    if (existing) {
      // Backfill unsubscribe_token / tags for legacy rows so they don't get
      // skipped by future broadcasts or 1-click unsubscribe.
      const patch = {};
      if (!existing.unsubscribe_token) patch.unsubscribe_token = randomBytes(24).toString('base64url');
      if (!Array.isArray(existing.tags)) patch.tags = [];
      if (typeof existing.unsubscribed !== 'boolean') patch.unsubscribed = false;
      if (typeof existing.bounced !== 'boolean') patch.bounced = false;
      if (typeof existing.complained !== 'boolean') patch.complained = false;
      if (Object.keys(patch).length) {
        await db.collection('newsletter_subscriptions').updateOne({ email: lowerEmail }, { $set: patch });
      }
      return res.status(200).json({
        message: 'You are already subscribed to our newsletter!',
        status: 'already_subscribed',
      });
    }

    const nowIso = new Date().toISOString();
    const doc = {
      id: randomUUID(),
      email: lowerEmail,
      first_name: first_name || '',
      name: name || first_name || '',
      leadType: 'Newsletter Subscription',
      source: req.headers.referer || 'Direct',
      subscribed_at: nowIso,
      ip_address: (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown',
      user_agent: req.headers['user-agent'] || 'unknown',
      status: 'active',
      timestamp: nowIso,
      confirmed: false,
      // Newsletter-manager fields (mirrors FastAPI shape):
      unsubscribed: false,
      unsubscribed_at: null,
      unsubscribe_token: randomBytes(24).toString('base64url'),
      tags: [],
      bounced: false,
      complained: false,
    };

    await db.collection('newsletter_subscriptions').insertOne(doc);

    return res.status(200).json({
      message: 'Successfully subscribed to newsletter!',
      subscription_id: doc.id,
      email: doc.email,
      timestamp: doc.timestamp,
      status: doc.status,
    });
  } catch (err) {
    console.error('Newsletter API Error:', err);
    return res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
}
