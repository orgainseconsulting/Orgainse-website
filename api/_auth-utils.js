/**
 * Shared helpers for admin auth handlers.
 *
 * - getDb()             cached Mongo client
 * - signToken(...)      mirror of FastAPI create_access_token (purpose=full|password_change)
 * - hashPassword(p)     bcrypt hash
 * - verifyPassword()    bcrypt compare
 */
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

let cachedClient = null;
export async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGO_URL);
    await cachedClient.connect();
  }
  return cachedClient.db(process.env.DB_NAME || 'orgainse-consulting');
}

const JWT_ALG = 'HS256';
const JWT_TTL_HOURS = 8;
const PASSWORD_CHANGE_TTL_MIN = 15;

export function signToken(email, purpose = 'full') {
  const secret = process.env.JWT_SECRET;
  const hours = purpose === 'password_change' ? PASSWORD_CHANGE_TTL_MIN / 60 : JWT_TTL_HOURS;
  return jwt.sign(
    { sub: email, email, role: 'admin', purpose },
    secret,
    { algorithm: JWT_ALG, expiresIn: `${Math.round(hours * 3600)}s` }
  );
}

export function hashPassword(p) {
  return bcrypt.hashSync(p, bcrypt.genSaltSync(10));
}

export async function verifyPassword(p, hash) {
  if (!hash) return false;
  try { return await bcrypt.compare(p, hash); } catch { return false; }
}

export const SEED_TEMP_PASSWORD = process.env.ADMIN_SEED_TEMP_PASSWORD || 'Orgainse25%Web..';

export const SEED_USERS = [
  { email: 'info@orgainse.com',    name: 'Orgainse Admin',   is_super_admin: false },
  { email: 'support@orgainse.com', name: 'Orgainse Support', is_super_admin: false },
  { email: 'swarag@orgainse.com',  name: 'Swarag',           is_super_admin: true  },
  { email: 'rajesh@orgainse.com',  name: 'Rajesh',           is_super_admin: false },
];

/** Idempotent admin-users seed; runs at the top of each Vercel cold start. */
export async function ensureSeedUsers(db) {
  for (const u of SEED_USERS) {
    const existing = await db.collection('admin_users').findOne({ email: u.email });
    if (existing) {
      if (u.is_super_admin && !existing.is_super_admin) {
        await db.collection('admin_users').updateOne(
          { _id: existing._id },
          { $set: { is_super_admin: true } }
        );
      }
      continue;
    }
    await db.collection('admin_users').insertOne({
      id: cryptoRandomId(),
      email: u.email,
      name: u.name,
      password_hash: hashPassword(SEED_TEMP_PASSWORD),
      temp_password_plain: SEED_TEMP_PASSWORD,
      must_change_password: true,
      role: 'admin',
      is_super_admin: u.is_super_admin,
      created_at: new Date().toISOString(),
      last_login_at: null,
    });
  }
}

export function cryptoRandomId() {
  // simple uuid v4 without external deps
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (Math.random() * 16) >> (c / 4)).toString(16)
  );
}

export function adminUserShape(doc, { includeTempPassword = false } = {}) {
  return {
    id: doc.id,
    email: doc.email || doc.username || '',
    name: doc.name || '',
    role: doc.role || 'admin',
    is_super_admin: !!doc.is_super_admin,
    must_change_password: !!doc.must_change_password,
    temp_password_plain: includeTempPassword ? (doc.temp_password_plain || null) : null,
    created_at: doc.created_at,
    last_login_at: doc.last_login_at,
    password_changed_at: doc.password_changed_at,
  };
}

export async function requireSuperAdmin(db, claims, res) {
  const email = (claims.email || claims.sub || '').toLowerCase();
  const user = await db.collection('admin_users').findOne({ email });
  if (!user || !user.is_super_admin) {
    res.status(403).json({ error: 'Super-admin access required' });
    return null;
  }
  return user;
}

export function maskSecret(value) {
  if (!value) return '';
  if (value.length <= 6) return '•'.repeat(value.length);
  return value.slice(0, 3) + '•'.repeat(8) + value.slice(-2);
}
