/**
 * GET /api/auth/me
 * Returns the current user's profile based on the bearer token.
 * Allows password_change purpose so the forced-change screen can read user info.
 */
import { securityHeaders } from '../middleware/security.js';
import { requireAdmin } from '../middleware/verify-admin.js';
import { getDb } from '../_auth-utils.js';

export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const claims = requireAdmin(req, res, { allowPasswordChange: true });
  if (!claims) return;

  try {
    const db = await getDb();
    const email = (claims.email || claims.sub || '').toLowerCase();
    let user = await db.collection('admin_users').findOne({ email });
    if (!user) user = await db.collection('admin_users').findOne({ username: email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({
      success: true,
      email: user.email || user.username || email,
      name: user.name || '',
      needs_password_change: !!user.must_change_password,
      is_super_admin: !!user.is_super_admin,
      role: user.role || 'admin',
    });
  } catch (err) {
    console.error('auth/me error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
