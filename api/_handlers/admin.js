/**
 * GET /api/admin
 * Admin dashboard data. Requires a valid admin JWT (Authorization: Bearer ...).
 * Paginated via ?page=&page_size=.
 */
import { MongoClient } from 'mongodb';
import { securityHeaders, rateLimit } from '../_middleware/security.js';
import { requireAdmin } from '../_middleware/verify-admin.js';

const VALID_COLLECTIONS = [
  'newsletter_subscriptions',
  'contact_messages',
  'ai_assessment_leads',
  'roi_calculator_leads',
  'service_inquiries',
  'consultation_leads',
];

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
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!rateLimit(req, res, { max: 60, windowMs: 15 * 60 * 1000 })) return;

  const auth = requireAdmin(req, res);
  if (!auth) return;

  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const pageSize = Math.min(500, Math.max(1, parseInt(req.query.page_size || '100', 10)));

    const db = await getDb();
    const data = {};
    const counts = {};
    let totalLeads = 0;

    for (const name of VALID_COLLECTIONS) {
      try {
        const docs = await db.collection(name)
          .find({}, { projection: { _id: 0 } })
          .sort({ submitted_at: -1, subscribed_at: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .toArray();
        const total = await db.collection(name).countDocuments({});
        data[name] = docs;
        counts[name] = total;
        totalLeads += total;
      } catch (e) {
        console.error(`fetch ${name} failed:`, e);
        data[name] = [];
        counts[name] = 0;
      }
    }

    const summary = {
      total_leads: totalLeads,
      total_newsletters: counts.newsletter_subscriptions,
      total_contacts: counts.contact_messages,
      total_ai_assessments: counts.ai_assessment_leads,
      total_roi_calculators: counts.roi_calculator_leads,
      total_service_inquiries: counts.service_inquiries,
      total_consultations: counts.consultation_leads,
      last_updated: new Date().toISOString(),
      breakdown: {
        newsletters: counts.newsletter_subscriptions,
        contact_messages: counts.contact_messages,
        ai_assessments: counts.ai_assessment_leads,
        roi_calculators: counts.roi_calculator_leads,
        service_inquiries: counts.service_inquiries,
        consultations: counts.consultation_leads,
      },
    };

    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    return res.status(200).json({
      success: true,
      pagination: { page, page_size: pageSize },
      summary,
      data: {
        newsletters: data.newsletter_subscriptions,
        contact_messages: data.contact_messages,
        ai_assessment_leads: data.ai_assessment_leads,
        roi_calculator_leads: data.roi_calculator_leads,
        service_inquiries: data.service_inquiries,
        consultation_leads: data.consultation_leads,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('admin error:', err);
    return res.status(500).json({ error: 'Internal server error', success: false });
  }
}
