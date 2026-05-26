/**
 * Admin blog endpoints. JWT (admin role) required.
 *
 * GET    /api/blog-admin                 → list all posts (drafts + published)
 * GET    /api/blog-admin?id=<id>         → fetch single post (any status, includes raw base64)
 * POST   /api/blog-admin                 → create a new post
 * PUT    /api/blog-admin?id=<id>         → update existing post
 * DELETE /api/blog-admin?id=<id>         → delete a post
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024; // 1.5 MB raw → ~2 MB base64
const MAX_HTML_BYTES = 800 * 1024;          // 800 KB body

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

function nowIso() {
  return new Date().toISOString();
}

function parseDataUrl(s) {
  if (typeof s !== 'string' || !s.startsWith('data:')) return null;
  const m = /^data:([^;]+);base64,(.+)$/.exec(s);
  if (!m) return null;
  return { mime: m[1].toLowerCase(), b64: m[2] };
}

function validateImage(field, dataUrl) {
  if (!dataUrl) return { ok: true };
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return { ok: false, error: `${field}: invalid data URL` };
  if (!ALLOWED_MIME.has(parsed.mime)) {
    return { ok: false, error: `${field}: unsupported image type (${parsed.mime})` };
  }
  const approxBytes = Math.floor((parsed.b64.length * 3) / 4);
  if (approxBytes > MAX_IMAGE_BYTES) {
    return { ok: false, error: `${field}: image too large (max ${Math.round(MAX_IMAGE_BYTES / 1024)} KB)` };
  }
  return { ok: true, mime: parsed.mime, b64: parsed.b64 };
}

function estimateReadingMinutes(html) {
  const text = String(html || '').replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function buildExcerpt(html, max = 220) {
  const text = String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return await new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 5 * 1024 * 1024) req.destroy(); });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

async function buildPostDoc(input, existing, db) {
  // existing is the prior doc (for PUT). For POST it's null.
  const cleaned = sanitizeInput({
    title: String(input.title || '').slice(0, 250),
    excerpt: String(input.excerpt || '').slice(0, 500),
    author: String(input.author || 'Orgainse Consulting').slice(0, 100),
    category: String(input.category || '').slice(0, 80),
    seo_title: String(input.seo_title || '').slice(0, 250),
    seo_description: String(input.seo_description || '').slice(0, 320),
  });

  // Content HTML — DO NOT sanitize aggressively (would strip TipTap formatting).
  // We strip <script> tags and event handlers in `sanitizeInput`'s string path
  // anyway, but for HTML body we apply a targeted filter.
  let html = String(input.content_html || '');
  if (html.length > MAX_HTML_BYTES) {
    throw new Error(`content_html too large (>${Math.round(MAX_HTML_BYTES / 1024)} KB)`);
  }
  html = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '');

  // Tags
  let tags = Array.isArray(input.tags)
    ? input.tags
    : typeof input.tags === 'string'
      ? input.tags.split(',')
      : [];
  tags = tags.map((t) => String(t).trim().slice(0, 40)).filter(Boolean).slice(0, 12);

  // Status
  const status = input.status === 'published' ? 'published' : 'draft';

  // Cover image
  const cover = validateImage('cover_image_url', input.cover_image_url);
  if (!cover.ok) throw new Error(cover.error);
  const ogImg = validateImage('og_image_url', input.og_image_url);
  if (!ogImg.ok) throw new Error(ogImg.error);

  // Slug
  let slug = String(input.slug || '').toLowerCase().trim();
  slug = slug ? slugify(slug) : slugify(cleaned.title);
  if (!slug) throw new Error('slug or title required to derive slug');
  if (!SLUG_RE.test(slug)) throw new Error('slug must be lowercase letters, digits, hyphens');

  // Slug uniqueness (excluding self for updates)
  const dupQuery = existing ? { slug, id: { $ne: existing.id } } : { slug };
  const dup = await db.collection('blog_posts').findOne(dupQuery, { projection: { _id: 1 } });
  if (dup) throw new Error('slug already in use');

  const excerpt = cleaned.excerpt || buildExcerpt(html);
  const reading_minutes = estimateReadingMinutes(html);

  const doc = {
    id: existing?.id || randomUUID(),
    slug,
    title: cleaned.title,
    excerpt,
    content_html: html,
    cover_image_b64: cover.b64 ?? existing?.cover_image_b64 ?? null,
    cover_image_mime: cover.mime ?? existing?.cover_image_mime ?? null,
    og_image_b64: ogImg.b64 ?? existing?.og_image_b64 ?? null,
    og_image_mime: ogImg.mime ?? existing?.og_image_mime ?? null,
    author: cleaned.author,
    category: cleaned.category,
    tags,
    seo_title: cleaned.seo_title || cleaned.title,
    seo_description: cleaned.seo_description || excerpt,
    status,
    reading_minutes,
    created_at: existing?.created_at || nowIso(),
    updated_at: nowIso(),
    published_at: status === 'published'
      ? (existing?.published_at && existing.status === 'published' ? existing.published_at : nowIso())
      : null,
  };

  // Allow explicit reset of cover/og when client sends empty string
  if (input.cover_image_url === '') { doc.cover_image_b64 = null; doc.cover_image_mime = null; }
  if (input.og_image_url === '')    { doc.og_image_b64    = null; doc.og_image_mime    = null; }

  return doc;
}

const adminProjection = { _id: 0 };

const toAdminShape = (doc) => {
  if (!doc) return null;
  const cover = doc.cover_image_mime && doc.cover_image_b64
    ? `data:${doc.cover_image_mime};base64,${doc.cover_image_b64}`
    : null;
  const og = doc.og_image_mime && doc.og_image_b64
    ? `data:${doc.og_image_mime};base64,${doc.og_image_b64}`
    : null;
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt || '',
    content_html: doc.content_html || '',
    cover_image_url: cover,
    og_image_url: og,
    author: doc.author || '',
    category: doc.category || '',
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    status: doc.status || 'draft',
    reading_minutes: doc.reading_minutes || 1,
    seo_title: doc.seo_title || '',
    seo_description: doc.seo_description || '',
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    published_at: doc.published_at,
  };
};

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!rateLimit(req, res, { max: 60, windowMs: 15 * 60 * 1000 })) return;

  const auth = requireAdmin(req, res);
  if (!auth) return;

  const db = await getDb();
  const col = db.collection('blog_posts');

  try {
    if (req.method === 'GET') {
      const { id } = req.query;
      if (id) {
        const doc = await col.findOne({ id }, { projection: adminProjection });
        if (!doc) return res.status(404).json({ error: 'Post not found' });
        return res.status(200).json({ success: true, post: toAdminShape(doc) });
      }
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const pageSize = Math.min(100, Math.max(1, parseInt(req.query.page_size || '50', 10)));
      const rows = await col
        .find({}, { projection: { ...adminProjection, content_html: 0, cover_image_b64: 0, og_image_b64: 0 } })
        .sort({ updated_at: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();
      const total = await col.countDocuments({});
      return res.status(200).json({
        success: true,
        pagination: { page, page_size: pageSize, total },
        posts: rows.map((r) => ({
          ...toAdminShape({ ...r, content_html: '', cover_image_b64: null, og_image_b64: null }),
        })),
      });
    }

    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      const doc = await buildPostDoc(body, null, db);
      await col.insertOne(doc);
      return res.status(201).json({ success: true, post: toAdminShape(doc) });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id query param required' });
      const existing = await col.findOne({ id });
      if (!existing) return res.status(404).json({ error: 'Post not found' });
      const body = await readJsonBody(req);
      const doc = await buildPostDoc(body, existing, db);
      await col.replaceOne({ id }, doc);
      return res.status(200).json({ success: true, post: toAdminShape(doc) });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id query param required' });
      const r = await col.deleteOne({ id });
      if (r.deletedCount === 0) return res.status(404).json({ error: 'Post not found' });
      return res.status(200).json({ success: true, deleted: id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('blog-admin error:', err);
    const msg = err?.message || 'Internal server error';
    return res.status(400).json({ error: msg });
  }
}
