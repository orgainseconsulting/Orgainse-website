/**
 * Public blog endpoints.
 *
 * GET  /api/blog                 → list published posts (paginated; cover thumb only, no full body)
 * GET  /api/blog?slug=<slug>     → single published post (full content)
 *
 * Bodies/payloads are kept lean for list view — `content_html` is omitted, and
 * the cover image is shipped as `cover_image_url` (a data: URL) so the public
 * pages can render it without a second round-trip.
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

const toDataUrl = (mime, b64) => (mime && b64 ? `data:${mime};base64,${b64}` : null);

const publicProjection = (full = false) => ({
  _id: 0,
  id: 1,
  slug: 1,
  title: 1,
  excerpt: 1,
  cover_image_b64: 1,
  cover_image_mime: 1,
  author: 1,
  category: 1,
  tags: 1,
  reading_minutes: 1,
  seo_title: 1,
  seo_description: 1,
  og_image_b64: 1,
  og_image_mime: 1,
  published_at: 1,
  updated_at: 1,
  ...(full ? { content_html: 1 } : {}),
});

const reshape = (doc, full = false) => {
  if (!doc) return null;
  const out = {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt || '',
    author: doc.author || 'Orgainse Consulting',
    category: doc.category || '',
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    reading_minutes: doc.reading_minutes || 1,
    cover_image_url: toDataUrl(doc.cover_image_mime, doc.cover_image_b64),
    og_image_url: toDataUrl(doc.og_image_mime, doc.og_image_b64),
    seo_title: doc.seo_title || doc.title,
    seo_description: doc.seo_description || doc.excerpt || '',
    published_at: doc.published_at,
    updated_at: doc.updated_at,
  };
  if (full) out.content_html = doc.content_html || '';
  return out;
};

export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!rateLimit(req, res, { max: 120, windowMs: 15 * 60 * 1000 })) return;

  try {
    const db = await getDb();
    const { slug } = req.query;

    if (slug) {
      // Atomically increment view_count when a single post is fetched.
      // This is the cheapest "page view" we can capture without a separate
      // beacon endpoint; CDN cache (s-maxage=300) means we slightly undercount
      // in 5-minute windows, which is acceptable for admin analytics.
      const result = await db.collection('blog_posts').findOneAndUpdate(
        { slug, status: 'published' },
        { $inc: { view_count: 1 } },
        { projection: publicProjection(true), returnDocument: 'after' }
      );
      const doc = result?.value ?? result; // driver-version safety
      if (!doc) return res.status(404).json({ error: 'Post not found' });
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
      return res.status(200).json({ success: true, post: reshape(doc, true) });
    }

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.page_size || '12', 10)));
    const category = req.query.category;
    const tag = req.query.tag;

    const filter = { status: 'published' };
    if (category) filter.category = category;
    if (tag) filter.tags = tag;

    const cursor = db.collection('blog_posts')
      .find(filter, { projection: publicProjection(false) })
      .sort({ published_at: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const rows = await cursor.toArray();
    const total = await db.collection('blog_posts').countDocuments(filter);

    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    return res.status(200).json({
      success: true,
      pagination: { page, page_size: pageSize, total },
      posts: rows.map((r) => reshape(r, false)),
    });
  } catch (err) {
    console.error('blog list error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
