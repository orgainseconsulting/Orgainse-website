/**
 * GET /sitemap-content.xml → live sitemap of published blog posts, newsletter
 * issues and open roles, so admin-created content is discoverable without a redeploy.
 */
import { MongoClient } from 'mongodb';

const SITE = 'https://www.orgainse.com';
let cachedClient = null;
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGO_URL);
    await cachedClient.connect();
  }
  return cachedClient.db(process.env.DB_NAME);
}

const xmlEsc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const day = (d) => {
  const t = d ? new Date(d) : null;
  return t && !Number.isNaN(t.getTime()) ? t.toISOString().slice(0, 10) : null;
};

export default async function handler(req, res) {
  const entries = [];
  try {
    const db = await getDb();
    const opts = { projection: { _id: 0, slug: 1, updated_at: 1, published_at: 1 } };
    const [posts, issues, jobs] = await Promise.all([
      db.collection('blog_posts').find({ status: 'published' }, opts).limit(5000).toArray(),
      db.collection('newsletter_issues').find({ status: { $in: ['published', 'sent'] } }, opts).limit(5000).toArray(),
      db.collection('job_postings').find({ status: 'published', hiring_stage: { $ne: 'Role Closed' } }, opts).limit(1000).toArray(),
    ]);
    posts.forEach((d) => entries.push({ loc: `/blog/${d.slug}`, mod: day(d.updated_at || d.published_at), freq: 'monthly', pri: '0.7' }));
    issues.forEach((d) => entries.push({ loc: `/newsletter/${d.slug}`, mod: day(d.updated_at || d.published_at), freq: 'monthly', pri: '0.6' }));
    jobs.forEach((d) => entries.push({ loc: `/careers/${d.slug}`, mod: day(d.updated_at || d.published_at), freq: 'weekly', pri: '0.6' }));
  } catch (e) {
    console.error('sitemap-content db error:', e?.message);
  }

  const body = entries.filter((e) => e.loc && !e.loc.endsWith('/undefined')).map((e) => `  <url>
    <loc>${xmlEsc(SITE + e.loc)}</loc>${e.mod ? `\n    <lastmod>${e.mod}</lastmod>` : ''}
    <changefreq>${e.freq}</changefreq>
    <priority>${e.pri}</priority>
  </url>`).join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
}
