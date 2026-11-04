/**
 * Server meta shim for shared blog posts and newsletter issues.
 * vercel.json rewrites /blog/:slug and /newsletter/:slug here so link-preview
 * crawlers (LinkedIn, WhatsApp, X, Slack) get the item's own title, summary
 * and share card. The SPA shell is returned so the React app still boots.
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

const SITE = 'https://www.orgainse.com';
const esc = (s) => String(s || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const clamp = (s, n) => {
  const t = String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return t.length <= n ? t : `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…`;
};

export function replaceMeta(html, attr, name, content) {
  const re = new RegExp(`<meta\\s+${attr}=["']${name}["'][^>]*>`, 'i');
  const tag = `<meta ${attr}="${name}" content="${content}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `  ${tag}\n</head>`);
}

export async function loadShell(req) {
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  try {
    // `/spa` is the neutral shell; `/index.html` is the prerendered home page.
    const r = await fetch(`${proto}://${host}/spa`, { headers: { 'User-Agent': 'orgainse-share-shim' } });
    const html = r.ok ? await r.text() : '';
    return html.includes('</head>') ? html : '';
  } catch (e) {
    console.error('share shim: could not load shell', e?.message);
    return '';
  }
}

/** Swap title / description / canonical / OG / Twitter tags in the shell. */
export function applyShareMeta(html, { title, description, url, image, imageAlt, type = 'article', noindex = false }) {
  let out = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  const d = esc(description);
  out = replaceMeta(out, 'name', 'description', d);
  for (const p of ['og', 'twitter']) {
    out = replaceMeta(out, 'property', `${p}:title`, esc(title));
    out = replaceMeta(out, 'property', `${p}:description`, d);
    out = replaceMeta(out, 'property', `${p}:url`, esc(url));
    out = replaceMeta(out, 'property', `${p}:image`, esc(image));
  }
  out = replaceMeta(out, 'property', 'og:type', type);
  out = replaceMeta(out, 'property', 'og:image:width', '1200');
  out = replaceMeta(out, 'property', 'og:image:height', '630');
  out = replaceMeta(out, 'property', 'og:image:alt', esc(imageAlt || title));
  out = out.replace(/<link\s+rel=["']canonical["'][^>]*>/i, '');
  out = out.replace('</head>', `  <link rel="canonical" href="${esc(url)}" />\n</head>`);
  if (noindex) out = replaceMeta(out, 'name', 'robots', 'noindex, follow');
  return out;
}

const KINDS = {
  blog: { col: 'blog_posts', filter: { status: 'published' }, label: 'Blog', type: 'blog' },
  newsletter: { col: 'newsletter_issues', filter: { status: { $in: ['published', 'sent'] } }, label: 'Orgainse Pulse', type: 'newsletter' },
};

export default async function handler(req, res) {
  const parts = (req.url || '').split('?')[0].split('/').filter(Boolean);
  const kind = KINDS[parts[0]];
  const slug = decodeURIComponent(parts[1] || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  const section = `/${parts[0]}`;

  const shell = await loadShell(req);
  if (!shell || !kind) {
    res.setHeader('Location', section);
    return res.status(302).end();
  }

  let doc = null;
  try {
    if (slug) {
      doc = await getDb().then((db) => db.collection(kind.col).findOne({ slug, ...kind.filter }, {
        projection: { _id: 0, title: 1, seo_title: 1, seo_description: 1, excerpt: 1, subtitle: 1, preview_text: 1, author: 1, author_name: 1, published_at: 1, updated_at: 1 },
      }));
    }
  } catch (e) {
    console.error('content-share db error:', e?.message);
  }

  const url = `${SITE}${section}/${slug}`;
  const title = doc ? clamp(`${doc.seo_title || doc.title} | ${kind.label === 'Blog' ? 'Orgainse Blog' : 'Orgainse Pulse'}`, 90) : `${kind.label} | Orgainse`;
  const description = doc
    ? clamp(doc.seo_description || doc.excerpt || doc.subtitle || doc.preview_text || doc.title, 200)
    : 'Field notes on delivery execution, governance practice and practical AI from Orgainse.';
  const image = doc ? `${SITE}/api/og?type=${kind.type}&slug=${slug}` : `${SITE}/og/${parts[0]}.jpg?v=2`;

  let html = applyShareMeta(shell, { title, description, url, image, noindex: !doc });
  if (doc) {
    const ld = {
      '@context': 'https://schema.org',
      '@type': kind.type === 'blog' ? 'BlogPosting' : 'Article',
      headline: clamp(doc.title, 110),
      description,
      image,
      url,
      mainEntityOfPage: url,
      datePublished: doc.published_at,
      dateModified: doc.updated_at || doc.published_at,
      author: { '@type': 'Organization', name: doc.author_name || doc.author || 'Orgainse' },
      publisher: { '@id': `${SITE}/#organization` },
    };
    html = html.replace('</head>', `  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>\n</head>`);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=600');
  return res.status(doc ? 200 : 404).send(html);
}
