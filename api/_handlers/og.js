/**
 * GET /api/og?type=blog|newsletter|career&slug=<slug>
 * Share-card image for a single item. Uses the item's own OG/cover image when
 * the admin uploaded one; otherwise renders the branded headline card.
 */
import { MongoClient } from 'mongodb';
import { renderCard } from '../_og-card.js';

let cachedClient = null;
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGO_URL);
    await cachedClient.connect();
  }
  return cachedClient.db(process.env.DB_NAME || 'orgainse-consulting');
}

const SOURCES = {
  blog: { col: 'blog_posts', filter: { status: 'published' }, kicker: (d) => (d.category ? `Blog · ${d.category}` : 'The Orgainse Blog') },
  newsletter: { col: 'newsletter_issues', filter: { status: { $in: ['published', 'sent'] } }, kicker: (d) => (d.issue_number ? `Orgainse Pulse · Issue ${d.issue_number}` : 'Orgainse Pulse') },
  career: { col: 'job_postings', filter: { status: 'published' }, kicker: (d) => ['Careers', d.location].filter(Boolean).join(' · '), subtitle: (d) => d.department },
};

export default async function handler(req, res) {
  const type = String(req.query?.type || '');
  const slug = String(req.query?.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 160);
  const src = SOURCES[type];
  if (!src || !slug) return res.status(400).json({ error: 'type and slug required' });

  let doc = null;
  try {
    const db = await getDb();
    doc = await db.collection(src.col).findOne({ slug, ...src.filter }, {
      projection: { _id: 0, title: 1, category: 1, issue_number: 1, department: 1, location: 1, og_image_b64: 1, og_image_mime: 1, cover_image_b64: 1, cover_image_mime: 1 },
    });
  } catch (e) {
    console.error('og db error:', e?.message);
  }
  if (!doc) return res.status(404).json({ error: 'Not found' });

  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
  const own = doc.og_image_b64 ? [doc.og_image_mime, doc.og_image_b64] : doc.cover_image_b64 ? [doc.cover_image_mime, doc.cover_image_b64] : null;
  if (own) {
    res.setHeader('Content-Type', own[0] || 'image/jpeg');
    return res.status(200).send(Buffer.from(own[1], 'base64'));
  }
  const png = await renderCard({ kicker: src.kicker(doc), title: doc.title, subtitle: src.subtitle?.(doc) });
  res.setHeader('Content-Type', 'image/png');
  return res.status(200).send(png);
}
