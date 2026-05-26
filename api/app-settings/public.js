/**
 * GET /api/app-settings/public
 *
 * Returns the non-secret subset of app_settings + the derived hosts list
 * (admin_users where show_as_host=true with a booking_url). Consumed by
 * the front-end Book-a-Call modal and the Stay-Tuned countdowns.
 */
import { securityHeaders } from '../middleware/security.js';
import { getDb } from '../_auth-utils.js';

const SETTINGS_ID = 'global';

export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db = await getDb();
    const doc = await db.collection('app_settings').findOne({ _id: SETTINGS_ID });

    const adminHosts = await db.collection('admin_users')
      .find({ show_as_host: true, booking_url: { $exists: true, $ne: '' } })
      .sort({ created_at: 1 })
      .toArray();

    const derivedHosts = adminHosts
      .filter((u) => u.booking_url)
      .map((u) => ({
        id: u.id,
        name: u.name || u.email || 'Host',
        role: u.designation || '',
        photo_url: u.photo_url || '',
        initials: (u.initials || '').toUpperCase(),
        booking_url: u.booking_url,
        custom_fields: u.custom_fields || [],
        email: u.email || '',
      }));

    const finalHosts = derivedHosts.length
      ? derivedHosts
      : (Array.isArray(doc?.hosts) ? doc.hosts : []);

    return res.status(200).json({
      success: true,
      settings: {
        booking_url_default: doc?.booking_url_default || '',
        hosts: finalHosts,
        next_blog_launch_at: doc?.next_blog_launch_at || '',
        next_newsletter_launch_at: doc?.next_newsletter_launch_at || '',
      },
    });
  } catch (err) {
    console.error('app-settings/public error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
