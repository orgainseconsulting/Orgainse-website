/**
 * /api/admin-users        — GET list, POST invite, PUT update, DELETE
 * /api/admin-users/reset-password?id=...  — POST (handled by the explicit
 *                                            file at /api/admin-users/reset-password.js)
 *
 * Super-admin only. Mirrors FastAPI admin-users CRUD.
 */
import { securityHeaders, validateRequestSize, sanitizeInput } from '../_middleware/security.js';
import { requireAdmin } from '../_middleware/verify-admin.js';
import {
  getDb,
  hashPassword,
  requireSuperAdmin,
  adminUserShape,
  cryptoRandomId,
} from '../_auth-utils.js';

export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!validateRequestSize(req, res, 64 * 1024)) return;

  const claims = requireAdmin(req, res);
  if (!claims) return;

  try {
    const db = await getDb();
    const me = await requireSuperAdmin(db, claims, res);
    if (!me) return;

    const { id } = req.query || {};

    // ---- GET: list users ----
    if (req.method === 'GET') {
      const rows = await db.collection('admin_users')
        .find({ email: { $exists: true } })
        .sort({ created_at: 1 })
        .toArray();
      return res.status(200).json({
        success: true,
        users: rows.map((r) => adminUserShape(r, { includeTempPassword: true })),
        me: adminUserShape(me, { includeTempPassword: true }),
      });
    }

    // ---- POST: invite new admin ----
    if (req.method === 'POST') {
      const body = sanitizeInput(req.body || {});
      const email = (body.email || '').toString().trim().toLowerCase();
      const name = (body.name || '').toString().trim();
      const tempPassword = (body.temp_password || '').toString();
      if (!email || !email.endsWith('@orgainse.com')) {
        return res.status(400).json({ error: 'Only @orgainse.com emails may be invited' });
      }
      if (!name) return res.status(400).json({ error: 'Name is required' });
      if (tempPassword.length < 8) {
        return res.status(400).json({ error: 'Temp password must be at least 8 chars' });
      }
      const existing = await db.collection('admin_users').findOne({ email });
      if (existing) return res.status(400).json({ error: 'User with this email already exists' });
      const doc = {
        id: cryptoRandomId(),
        email,
        name: name.slice(0, 120),
        password_hash: hashPassword(tempPassword),
        temp_password_plain: tempPassword,
        must_change_password: true,
        role: 'admin',
        is_super_admin: false,
        created_at: new Date().toISOString(),
        last_login_at: null,
      };
      await db.collection('admin_users').insertOne(doc);
      return res.status(200).json({ success: true, user: adminUserShape(doc, { includeTempPassword: true }) });
    }

    // ---- PUT: update user (name + host profile) ----
    if (req.method === 'PUT') {
      if (!id) return res.status(400).json({ error: 'id required' });
      const body = sanitizeInput(req.body || {});
      const updates = { updated_at: new Date().toISOString() };
      if (typeof body.name === 'string') updates.name = body.name.slice(0, 120);
      if (typeof body.designation === 'string') updates.designation = body.designation.slice(0, 160);
      if (typeof body.photo_url === 'string') updates.photo_url = body.photo_url.slice(0, 1000);
      if (typeof body.initials === 'string') updates.initials = body.initials.slice(0, 4).toUpperCase();
      if (typeof body.booking_url === 'string') updates.booking_url = body.booking_url.slice(0, 500);
      if (typeof body.show_as_host === 'boolean') updates.show_as_host = body.show_as_host;
      if (Array.isArray(body.custom_fields)) {
        updates.custom_fields = body.custom_fields
          .filter((cf) => cf && typeof cf.label === 'string' && cf.label.trim())
          .map((cf) => ({
            label: String(cf.label).slice(0, 60),
            value: String(cf.value || '').slice(0, 300),
          }));
      }
      const user = await db.collection('admin_users').findOne({ id });
      if (!user) return res.status(404).json({ error: 'User not found' });
      await db.collection('admin_users').updateOne({ id }, { $set: updates });
      const updated = await db.collection('admin_users').findOne({ id });
      return res.status(200).json({ success: true, user: adminUserShape(updated, { includeTempPassword: true }) });
    }

    // ---- DELETE: remove admin ----
    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'id required' });
      const user = await db.collection('admin_users').findOne({ id });
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.id === me.id || user.is_super_admin) {
        return res.status(400).json({ error: 'Cannot delete a super-admin or yourself' });
      }
      await db.collection('admin_users').deleteOne({ id });
      return res.status(200).json({ success: true, deleted: id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('admin-users error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
