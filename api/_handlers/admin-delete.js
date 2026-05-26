/**
 * DELETE /api/admin-delete
 * Bulk/single deletion. Requires admin JWT.
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
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  if (!rateLimit(req, res, { max: 20, windowMs: 15 * 60 * 1000 })) return;

  const auth = requireAdmin(req, res);
  if (!auth) return;

  try {
    const db = await getDb();
    const { deleteType, collection, leadId } = req.query;

    if (deleteType === 'all') {
      let total = 0;
      const breakdown = {};
      for (const name of VALID_COLLECTIONS) {
        try {
          const r = await db.collection(name).deleteMany({});
          breakdown[name] = r.deletedCount;
          total += r.deletedCount;
        } catch (e) {
          console.error(`delete ${name} failed:`, e);
          breakdown[name] = 0;
        }
      }
      return res.status(200).json({
        success: true, message: `Deleted ${total} leads`, deletedCount: total,
        breakdown, timestamp: new Date().toISOString(), operation: 'all',
      });
    }

    if (deleteType === 'collection') {
      if (!collection || !VALID_COLLECTIONS.includes(collection)) {
        return res.status(400).json({ error: 'Invalid collection', validCollections: VALID_COLLECTIONS });
      }
      const r = await db.collection(collection).deleteMany({});
      return res.status(200).json({
        success: true, message: `Deleted ${r.deletedCount} leads from ${collection}`,
        deletedCount: r.deletedCount, collection,
        timestamp: new Date().toISOString(), operation: 'collection',
      });
    }

    if (deleteType === 'single') {
      if (!collection || !VALID_COLLECTIONS.includes(collection) || !leadId) {
        return res.status(400).json({ error: 'Invalid request' });
      }
      const r = await db.collection(collection).deleteOne({ id: leadId });
      if (r.deletedCount === 0) {
        return res.status(200).json({
          success: false, message: `Lead ${leadId} not found in ${collection}`,
          deletedCount: 0, timestamp: new Date().toISOString(), operation: 'single',
        });
      }
      return res.status(200).json({
        success: true, message: `Deleted ${leadId} from ${collection}`,
        deletedCount: 1, collection, leadId,
        timestamp: new Date().toISOString(), operation: 'single',
      });
    }

    return res.status(400).json({
      error: 'Invalid deleteType. Use all/collection/single.',
      examples: {
        deleteAll: '?deleteType=all',
        deleteCollection: '?deleteType=collection&collection=newsletter_subscriptions',
        deleteSingle: '?deleteType=single&collection=contact_messages&leadId=12345',
      },
    });
  } catch (err) {
    console.error('admin-delete error:', err);
    return res.status(500).json({ error: 'Internal server error', success: false });
  }
}
