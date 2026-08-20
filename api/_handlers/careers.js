/**
 * Public careers endpoints.
 *
 * GET /api/careers              → list published job postings
 * GET /api/careers?slug=<slug>  → single published posting (increments view_count)
 */
import { MongoClient } from 'mongodb';
import { securityHeaders, rateLimit } from '../_middleware/security.js';

let cachedClient = null;
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGO_URL);
    await cachedClient.connect();
  }
  return cachedClient.db(process.env.DB_NAME || 'orgainse-consulting');
}

const list = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);

export const reshapeJob = (doc) => {
  if (!doc) return null;
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title || '',
    department: doc.department || '',
    layer: doc.layer || '',
    hiring_stage: doc.hiring_stage || 'Open Role',
    location: doc.location || '',
    work_type: doc.work_type || '',
    employment_type: doc.employment_type || '',
    experience_level: doc.experience_level || '',
    experience_range: doc.experience_range || '',
    compensation: doc.compensation || '',
    summary: doc.summary || '',
    about_role: doc.about_role || '',
    responsibilities: list(doc.responsibilities),
    requirements: list(doc.requirements),
    nice_to_have: list(doc.nice_to_have),
    what_we_offer: list(doc.what_we_offer),
    application_deadline: doc.application_deadline || '',
    seo_title: doc.seo_title || doc.title || '',
    seo_description: doc.seo_description || doc.summary || '',
    published_at: doc.published_at || null,
    updated_at: doc.updated_at || null,
  };
};

const publicProjection = { _id: 0, view_count: 0 };

export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res, { max: 120, windowMs: 15 * 60 * 1000 })) return;

  try {
    const db = await getDb();
    const col = db.collection('job_postings');
    const { slug } = req.query;

    if (slug) {
      const result = await col.findOneAndUpdate(
        { slug, status: 'published' },
        { $inc: { view_count: 1 } },
        { projection: publicProjection, returnDocument: 'after' },
      );
      const doc = result?.value ?? result;
      if (!doc) return res.status(404).json({ error: 'Job posting not found' });
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
      return res.status(200).json({ success: true, job: reshapeJob(doc) });
    }

    const rows = await col
      .find({ status: 'published' }, { projection: publicProjection })
      .sort({ published_at: -1 })
      .limit(100)
      .toArray();

    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    return res.status(200).json({
      success: true,
      total: rows.length,
      jobs: rows.map(reshapeJob),
    });
  } catch (err) {
    console.error('careers list error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
