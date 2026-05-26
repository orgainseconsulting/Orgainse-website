/**
 * POST /api/admin-login
 *
 * MongoDB-backed multi-user admin login (mirrors FastAPI server.py).
 *  - Restricts to @orgainse.com emails.
 *  - 15-min lockout after 5 failed attempts per IP+email.
 *  - Returns a short-lived (15 min, purpose=password_change) token when
 *    must_change_password=true; otherwise a full 8-hour token.
 */
import { securityHeaders, validateRequestSize, sanitizeInput } from './middleware/security.js';
import { getDb, signToken, verifyPassword, ensureSeedUsers } from './_auth-utils.js';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MIN = 15;

export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!validateRequestSize(req, res, 4 * 1024)) return;

  try {
    const body = sanitizeInput(req.body || {});
    const rawEmail = ((body.email || body.username) || '').toString().trim().toLowerCase();
    const password = (body.password || '').toString();
    if (!rawEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (rawEmail.includes('@') && !rawEmail.endsWith('@orgainse.com')) {
      return res.status(403).json({ error: 'Only @orgainse.com accounts may sign in' });
    }

    const db = await getDb();
    await ensureSeedUsers(db);

    // TTL index (idempotent)
    await db.collection('login_attempts').createIndex(
      { expires_at: 1 }, { expireAfterSeconds: 0 }
    ).catch(() => {});

    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
      || req.connection?.remoteAddress || 'unknown';
    const identifier = `${ip}:${rawEmail}`;
    const now = new Date();

    const attempt = await db.collection('login_attempts').findOne({ _id: identifier });
    const lockedUntilRaw = attempt?.locked_until;
    const lockedUntil = lockedUntilRaw ? new Date(lockedUntilRaw) : null;
    if (lockedUntil && lockedUntil > now) {
      const remaining = Math.ceil((lockedUntil - now) / 1000);
      return res.status(429).json({ error: `Too many failed attempts. Try again in ${remaining}s.` });
    }

    let user = await db.collection('admin_users').findOne({ email: rawEmail });
    if (!user) user = await db.collection('admin_users').findOne({ username: rawEmail });

    const ok = !!user && await verifyPassword(password, user.password_hash);

    if (!ok) {
      const attempts = (attempt?.attempts || 0) + 1;
      const update = {
        attempts,
        last_attempt: now,
        expires_at: new Date(now.getTime() + 20 * 60 * 1000),
      };
      if (attempts >= MAX_ATTEMPTS) {
        update.locked_until = new Date(now.getTime() + LOCKOUT_MIN * 60 * 1000);
      }
      await db.collection('login_attempts').updateOne(
        { _id: identifier }, { $set: update }, { upsert: true }
      );
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await db.collection('login_attempts').deleteOne({ _id: identifier });

    const userEmail = user.email || user.username || rawEmail;
    const mustChange = !!user.must_change_password;
    const purpose = mustChange ? 'password_change' : 'full';
    const token = signToken(userEmail, purpose);
    const ttl = mustChange ? 15 * 60 : 8 * 3600;

    if (!mustChange) {
      await db.collection('admin_users').updateOne(
        { _id: user._id },
        { $set: { last_login_at: now.toISOString() } }
      );
    }

    return res.status(200).json({
      success: true,
      token,
      expires_in: ttl,
      email: userEmail,
      username: userEmail,
      name: user.name || '',
      must_change_password: mustChange,
      is_super_admin: !!user.is_super_admin,
    });
  } catch (err) {
    console.error('admin-login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
