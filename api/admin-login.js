/**
 * POST /api/admin-login
 *
 * Validates admin username/password against env-stored bcrypt hash and issues
 * an 8-hour HS256 JWT. Implements per-IP+username brute-force protection
 * backed by a MongoDB TTL collection (so it survives serverless cold starts).
 */
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { securityHeaders, validateRequestSize, sanitizeInput } from './middleware/security.js';

let cachedClient = null;
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGO_URL);
    await cachedClient.connect();
  }
  return cachedClient.db(process.env.DB_NAME || 'orgainse-consulting');
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_MIN = 15;
const TOKEN_TTL_HOURS = 8;

export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!validateRequestSize(req, res, 4 * 1024)) return;

  try {
    const body = sanitizeInput(req.body || {});
    const username = (body.username || '').toString();
    const password = (body.password || '').toString();
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
      || req.connection?.remoteAddress
      || 'unknown';
    const identifier = `${ip}:${username.toLowerCase()}`;
    const now = new Date();

    const db = await getDb();
    // Ensure TTL index exists (idempotent)
    await db.collection('login_attempts').createIndex(
      { expires_at: 1 },
      { expireAfterSeconds: 0 }
    ).catch(() => {});

    const attempt = await db.collection('login_attempts').findOne({ _id: identifier });
    if (attempt?.locked_until && new Date(attempt.locked_until) > now) {
      const remaining = Math.ceil((new Date(attempt.locked_until) - now) / 1000);
      return res.status(429).json({ error: `Too many failed attempts. Try again in ${remaining}s.` });
    }

    // Compare against env-stored credentials
    const envUser = process.env.ADMIN_USERNAME;
    const envHash = process.env.ADMIN_PASSWORD_HASH;
    const envPlain = process.env.ADMIN_PASSWORD; // dev fallback only

    let ok = false;
    if (envUser && username === envUser) {
      if (envHash) {
        ok = await bcrypt.compare(password, envHash);
      } else if (envPlain) {
        ok = password === envPlain;
      }
    }

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
        { _id: identifier },
        { $set: update },
        { upsert: true }
      );
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Success — clear attempts and issue token
    await db.collection('login_attempts').deleteOne({ _id: identifier });
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Server misconfigured: JWT_SECRET not set' });
    }
    const token = jwt.sign(
      { sub: username, role: 'admin' },
      secret,
      { algorithm: 'HS256', expiresIn: `${TOKEN_TTL_HOURS}h` }
    );

    return res.status(200).json({
      success: true,
      token,
      expires_in: TOKEN_TTL_HOURS * 3600,
      username,
    });
  } catch (err) {
    console.error('admin-login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
