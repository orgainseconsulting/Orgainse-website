/**
 * Admin careers endpoints. JWT (admin) required.
 *
 * GET    /api/careers-admin                    → list all postings (drafts + published)
 * GET    /api/careers-admin?action=analytics   → summary counters
 * GET    /api/careers-admin?id=<id>            → single posting
 * POST   /api/careers-admin                    → create
 * PUT    /api/careers-admin?id=<id>            → update
 * DELETE /api/careers-admin?id=<id>            → delete
 */
import { MongoClient } from 'mongodb';
import { randomUUID } from 'crypto';
import { securityHeaders, rateLimit, sanitizeInput } from '../_middleware/security.js';
import { requireAdmin } from '../_middleware/verify-admin.js';

let cachedClient = null;
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGO_URL);
    await cachedClient.connect();
  }
  return cachedClient.db(process.env.DB_NAME || 'orgainse-consulting');
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_ABOUT_BYTES = 40 * 1024;

function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const nowIso = () => new Date().toISOString();

function toList(v, maxItems = 25, maxLen = 300) {
  const arr = Array.isArray(v)
    ? v
    : typeof v === 'string'
      ? v.split('\n')
      : [];
  return arr.map((s) => String(s).trim().slice(0, maxLen)).filter(Boolean).slice(0, maxItems);
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return await new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 1 * 1024 * 1024) req.destroy(); });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

async function buildJobDoc(input, existing, db) {
  const cleaned = sanitizeInput({
    title: String(input.title || '').slice(0, 180),
    department: String(input.department || '').slice(0, 140),
    layer: String(input.layer || '').slice(0, 60),
    hiring_stage: String(input.hiring_stage || 'Open Role').slice(0, 40),
    location: String(input.location || '').slice(0, 120),
    work_type: String(input.work_type || '').slice(0, 40),
    employment_type: String(input.employment_type || '').slice(0, 40),
    experience_level: String(input.experience_level || '').slice(0, 60),
    experience_range: String(input.experience_range || '').slice(0, 60),
    compensation: String(input.compensation || '').slice(0, 160),
    summary: String(input.summary || '').slice(0, 400),
    about_role: String(input.about_role || '').slice(0, MAX_ABOUT_BYTES),
    application_deadline: String(input.application_deadline || '').slice(0, 40),
    seo_title: String(input.seo_title || '').slice(0, 200),
    seo_description: String(input.seo_description || '').slice(0, 320),
  });

  if (!cleaned.title) throw new Error('title is required');
  if (!cleaned.location) throw new Error('location is required');
  if (!cleaned.about_role) throw new Error('about_role is required');

  let slug = String(input.slug || '').toLowerCase().trim();
  slug = slug ? slugify(slug) : slugify(cleaned.title);
  if (!slug) throw new Error('slug or title required to derive slug');
  if (!SLUG_RE.test(slug)) throw new Error('slug must be lowercase letters, digits, hyphens');

  const dupQuery = existing ? { slug, id: { $ne: existing.id } } : { slug };
  const dup = await db.collection('job_postings').findOne(dupQuery, { projection: { _id: 1 } });
  if (dup) throw new Error('slug already in use');

  const status = input.status === 'published' ? 'published' : 'draft';

  return {
    id: existing?.id || randomUUID(),
    slug,
    ...cleaned,
    responsibilities: toList(input.responsibilities),
    requirements: toList(input.requirements),
    nice_to_have: toList(input.nice_to_have),
    what_we_offer: toList(input.what_we_offer),
    status,
    view_count: existing?.view_count || 0,
    created_at: existing?.created_at || nowIso(),
    updated_at: nowIso(),
    published_at: status === 'published'
      ? (existing?.published_at && existing.status === 'published' ? existing.published_at : nowIso())
      : null,
  };
}

const toAdminShape = (doc) => {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return rest;
};

export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!rateLimit(req, res, { max: 60, windowMs: 15 * 60 * 1000 })) return;

  const auth = requireAdmin(req, res);
  if (!auth) return;

  const db = await getDb();
  const col = db.collection('job_postings');

  try {
    if (req.method === 'GET') {
      const { id, action } = req.query;

      if (action === 'analytics') {
        const since30 = new Date(Date.now() - 30 * 86400000).toISOString();
        const [total, published, draft, viewsAgg, topJobs, publishedLast30] = await Promise.all([
          col.countDocuments({}),
          col.countDocuments({ status: 'published' }),
          col.countDocuments({ status: 'draft' }),
          col.aggregate([{ $group: { _id: null, total: { $sum: { $ifNull: ['$view_count', 0] } } } }]).toArray(),
          col.find({ status: 'published' }, {
            projection: { _id: 0, slug: 1, title: 1, view_count: 1, department: 1, published_at: 1 },
          }).sort({ view_count: -1, published_at: -1 }).limit(5).toArray(),
          col.countDocuments({ status: 'published', published_at: { $gte: since30 } }),
        ]);
        const totalViews = viewsAgg[0]?.total || 0;
        return res.status(200).json({
          success: true,
          analytics: {
            total_jobs: total,
            published_jobs: published,
            draft_jobs: draft,
            published_last_30d: publishedLast30,
            total_views: totalViews,
            avg_views_per_published: published ? Math.round(totalViews / published) : 0,
            top_jobs: topJobs.map((j) => ({
              slug: j.slug,
              title: j.title,
              view_count: j.view_count || 0,
              department: j.department || '',
              published_at: j.published_at,
            })),
            generated_at: nowIso(),
          },
        });
      }

      if (id) {
        const doc = await col.findOne({ id });
        if (!doc) return res.status(404).json({ error: 'Job posting not found' });
        return res.status(200).json({ success: true, job: toAdminShape(doc) });
      }

      const rows = await col.find({}).sort({ updated_at: -1 }).limit(200).toArray();
      return res.status(200).json({
        success: true,
        total: rows.length,
        jobs: rows.map(toAdminShape),
      });
    }

    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      const doc = await buildJobDoc(body, null, db);
      await col.insertOne(doc);
      return res.status(201).json({ success: true, job: toAdminShape(doc) });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id query param required' });
      const existing = await col.findOne({ id });
      if (!existing) return res.status(404).json({ error: 'Job posting not found' });
      const body = await readJsonBody(req);
      const doc = await buildJobDoc(body, existing, db);
      await col.replaceOne({ id }, doc);
      return res.status(200).json({ success: true, job: toAdminShape(doc) });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id query param required' });
      const r = await col.deleteOne({ id });
      if (r.deletedCount === 0) return res.status(404).json({ error: 'Job posting not found' });
      return res.status(200).json({ success: true, deleted: id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('careers-admin error:', err);
    return res.status(400).json({ error: err?.message || 'Internal server error' });
  }
}
