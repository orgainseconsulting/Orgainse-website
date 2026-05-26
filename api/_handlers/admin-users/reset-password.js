/**
 * POST /api/admin-users/reset-password?id=...
 * Super-admin only. Sets a new temporary password & forces change on next login.
 */
import { securityHeaders, validateRequestSize, sanitizeInput } from '../../_middleware/security.js';
import { requireAdmin } from '../../_middleware/verify-admin.js';
import { getDb, hashPassword, requireSuperAdmin, adminUserShape } from '../../_auth-utils.js';

export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!validateRequestSize(req, res, 4 * 1024)) return;

  const claims = requireAdmin(req, res);
  if (!claims) return;

  try {
    const db = await getDb();
    const me = await requireSuperAdmin(db, claims, res);
    if (!me) return;

    const { id } = req.query || {};
    if (!id) return res.status(400).json({ error: 'id required' });

    const body = sanitizeInput(req.body || {});
    const newTemp = (body.new_temp_password || '').toString();
    if (newTemp.length < 8) {
      return res.status(400).json({ error: 'Temp password must be at least 8 chars' });
    }

    const user = await db.collection('admin_users').findOne({ id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await db.collection('admin_users').updateOne(
      { id },
      {
        $set: {
          password_hash: hashPassword(newTemp),
          temp_password_plain: newTemp,
          must_change_password: true,
          updated_at: new Date().toISOString(),
        },
      }
    );
    const updated = await db.collection('admin_users').findOne({ id });
    return res.status(200).json({ success: true, user: adminUserShape(updated, { includeTempPassword: true }) });
  } catch (err) {
    console.error('admin-users reset error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
