/**
 * GET /api/newsletter-issues          → list published+sent issues (paginated)
 * GET /api/newsletter-issues?slug=    → single full issue
 */
import { getDb, issueToPublicShape } from './_newsletter-utils.js';
import { securityHeaders, rateLimit } from './middleware/security.js';

export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res, { max: 120, windowMs: 15 * 60 * 1000 })) return;

  try {
    const db = await getDb();
    const col = db.collection('newsletter_issues');
    const { slug } = req.query;

    if (slug) {
      const doc = await col.findOne({ slug, status: { $in: ['published', 'sent'] } }, { projection: { _id: 0 } });
      if (!doc) return res.status(404).json({ error: 'Issue not found' });
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
      return res.status(200).json({ success: true, issue: issueToPublicShape(doc, true) });
    }

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.page_size || '12', 10)));
    const filter = { status: { $in: ['published', 'sent'] } };
    if (req.query.category) filter.category = req.query.category;

    const rows = await col.find(filter, { projection: { _id: 0 } })
      .sort({ published_at: -1 }).skip((page - 1) * pageSize).limit(pageSize).toArray();
    const total = await col.countDocuments(filter);

    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    return res.status(200).json({
      success: true,
      pagination: { page, page_size: pageSize, total },
      issues: rows.map((r) => issueToPublicShape(r, false)),
    });
  } catch (e) {
    console.error('newsletter-issues error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
