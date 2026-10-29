/**
 * Server-rendered meta shim for shared job links.
 *
 * `vercel.json` rewrites `/careers/:slug` to this handler so link-preview
 * crawlers (LinkedIn, X, Slack, WhatsApp, Google) receive per-role
 * title / description / Open Graph / JobPosting structured data instead of the
 * site-wide defaults. The response is the normal CRA `index.html` with those
 * tags swapped in, so the React app still boots and takes over for humans.
 */
import { MongoClient } from 'mongodb';

let cachedClient = null;
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGO_URL);
    await cachedClient.connect();
  }
  return cachedClient.db(process.env.DB_NAME || 'orgainse-consulting');
}

const esc = (s) => String(s || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const clamp = (s, n) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length <= n ? t : `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…`;
};

function replaceMeta(html, attr, name, content) {
  const re = new RegExp(`<meta\\s+${attr}=["']${name}["'][^>]*>`, 'i');
  const tag = `<meta ${attr}="${name}" content="${content}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `  ${tag}\n</head>`);
}

export default async function handler(req, res) {
  const rawPath = (req.url || '').split('?')[0] || '';
  const slug = decodeURIComponent(rawPath.split('/').filter(Boolean).pop() || '')
    .toLowerCase().replace(/[^a-z0-9-]/g, '');

  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = `${proto}://${host}`;

  let baseHtml = '';
  try {
    // `/spa` is the neutral shell; `/index.html` is the prerendered home page.
    const r = await fetch(`${origin}/spa`, { headers: { 'User-Agent': 'orgainse-share-shim' } });
    if (r.ok) baseHtml = await r.text();
  } catch (e) {
    console.error('careers-share: could not load base html', e?.message);
  }
  // Never break the page — fall back to the careers list if the shell is unavailable.
  if (!baseHtml || !baseHtml.includes('</head>')) {
    res.setHeader('Location', '/careers');
    return res.status(302).end();
  }

  let job = null;
  try {
    if (slug) {
      job = await getDb().then((db) => db.collection('job_postings').findOne(
        { slug, status: 'published' },
        { projection: { _id: 0 } },
      ));
    }
  } catch (e) {
    console.error('careers-share db error:', e?.message);
  }

  const url = `https://www.orgainse.com/careers/${slug}`;
  const title = job
    ? clamp(`${job.seo_title || job.title} | Careers at Orgainse`, 90)
    : 'Careers at Orgainse | Open Roles';
  const description = job
    ? clamp(job.seo_description || job.summary || job.about_role, 200)
    : 'Open roles at Orgainse — a delivery-execution partner helping teams turn fragmented work into visible, governed execution.';

  let html = baseHtml;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  html = replaceMeta(html, 'name', 'description', esc(description));
  html = replaceMeta(html, 'property', 'og:title', esc(title));
  html = replaceMeta(html, 'property', 'og:description', esc(description));
  html = replaceMeta(html, 'property', 'og:url', esc(url));
  html = replaceMeta(html, 'property', 'og:type', 'article');
  html = replaceMeta(html, 'property', 'twitter:title', esc(title));
  html = replaceMeta(html, 'property', 'twitter:description', esc(description));
  html = replaceMeta(html, 'property', 'twitter:url', esc(url));
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, '');
  html = html.replace('</head>', `  <link rel="canonical" href="${esc(url)}" />\n</head>`);
  if (!job) html = replaceMeta(html, 'name', 'robots', 'noindex, follow');

  if (job) {
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: job.about_role,
      datePosted: job.published_at,
      employmentType: String(job.employment_type || 'Full-Time').toUpperCase().replace(/[^A-Z]+/g, '_'),
      hiringOrganization: { '@type': 'Organization', name: 'Orgainse', sameAs: 'https://www.orgainse.com' },
      jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.location } },
      ...(job.department ? { industry: job.department } : {}),
      ...(job.application_deadline ? { validThrough: job.application_deadline } : {}),
      directApply: true,
      url,
    };
    html = html.replace(
      '</head>',
      `  <script type="application/ld+json" data-job-posting="${esc(slug)}">${JSON.stringify(ld)}</script>\n</head>`,
    );
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=600');
  return res.status(job ? 200 : 404).send(html);
}
