/**
 * POST /api/admin-change-password
 *
 * Body: { current_password, new_password }
 *
 * Accepts the short-lived password_change token (or a full token) and rotates
 * the user's password. Clears must_change_password + temp_password_plain.
 */
import { securityHeaders, validateRequestSize, sanitizeInput } from './middleware/security.js';
import { requireAdmin } from './middleware/verify-admin.js';
import { getDb, hashPassword, verifyPassword, signToken } from './_auth-utils.js';

export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!validateRequestSize(req, res, 4 * 1024)) return;

  const claims = requireAdmin(req, res, { allowPasswordChange: true });
  if (!claims) return;

  try {
    const body = sanitizeInput(req.body || {});
    const currentPassword = (body.current_password || '').toString();
    const newPassword = (body.new_password || '').toString();
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'current_password and new_password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    const db = await getDb();
    const email = (claims.email || claims.sub || '').toLowerCase();
    let user = await db.collection('admin_users').findOne({ email });
    if (!user) user = await db.collection('admin_users').findOne({ username: email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const ok = await verifyPassword(currentPassword, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });

    const now = new Date().toISOString();
    await db.collection('admin_users').updateOne(
      { _id: user._id },
      {
        $set: {
          password_hash: hashPassword(newPassword),
          must_change_password: false,
          password_changed_at: now,
          last_login_at: now,
        },
        $unset: { temp_password_plain: '' },
      }
    );

    const userEmail = user.email || user.username || email;
    const newToken = signToken(userEmail, 'full');
    return res.status(200).json({
      success: true,
      token: newToken,
      expires_in: 8 * 3600,
      email: userEmail,
      name: user.name || '',
      must_change_password: false,
      is_super_admin: !!user.is_super_admin,
    });
  } catch (err) {
    console.error('admin-change-password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
