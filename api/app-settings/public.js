/**
 * GET /api/app-settings/public
 *
 * Returns the non-secret subset of app_settings (hosts list + fallback
 * booking URL). Consumed by the front-end Book-a-Call modal.
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
    return res.status(200).json({
      success: true,
      settings: {
        booking_url_default: doc?.booking_url_default || '',
        hosts: Array.isArray(doc?.hosts) ? doc.hosts : [],
      },
    });
  } catch (err) {
    console.error('app-settings/public error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
