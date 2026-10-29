// Post-build: renders each public route to static HTML so crawlers get real content + per-page head tags.
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUILD = path.join(ROOT, "build");
const SITE = "https://www.orgainse.com";
const DEFAULT_OG = `${SITE}/orgainse-logo-v2.png`;

export const ROUTES = [
  { path: "/", file: "index.html", priority: "1.0", changefreq: "weekly" },
  { path: "/services", file: "services.html", priority: "0.95", changefreq: "monthly" },
  { path: "/products", file: "products.html", priority: "0.95", changefreq: "weekly" },
  { path: "/about", file: "about.html", priority: "0.85", changefreq: "monthly" },
  { path: "/contact", file: "contact.html", priority: "0.85", changefreq: "monthly" },
  { path: "/ai-assessment", file: "ai-assessment.html", priority: "0.8", changefreq: "monthly" },
  { path: "/roi-calculator", file: "roi-calculator.html", priority: "0.8", changefreq: "monthly" },
  { path: "/smart-calendar", file: "smart-calendar.html", priority: "0.75", changefreq: "monthly" },
  { path: "/blog", file: "blog.html", priority: "0.8", changefreq: "weekly" },
  { path: "/newsletter", file: "newsletter.html", priority: "0.7", changefreq: "weekly" },
  { path: "/careers", file: "careers.html", priority: "0.7", changefreq: "weekly" },
  { path: "/privacy", file: "privacy.html", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", file: "terms.html", priority: "0.3", changefreq: "yearly" },
];

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const setMeta = (html, attr, key, value) => {
  const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*/?>`);
  const tag = `<meta ${attr}="${key}" content="${esc(value)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `${tag}</head>`);
};

const ldScript = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;

function applyHead(template, seo, routePath) {
  const url = seo.canonical || `${SITE}${routePath === "/" ? "/" : routePath}`;
  let html = template;
  if (seo.title) {
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(seo.title)}</title>`);
    html = setMeta(html, "property", "og:title", seo.title);
    html = setMeta(html, "property", "twitter:title", seo.title);
  }
  if (seo.description) {
    html = setMeta(html, "name", "description", seo.description);
    html = setMeta(html, "property", "og:description", seo.description);
    html = setMeta(html, "property", "twitter:description", seo.description);
  }
  if (seo.keywords) html = setMeta(html, "name", "keywords", seo.keywords);
  html = setMeta(html, "name", "robots", seo.noindex
    ? "noindex, nofollow"
    : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "property", "twitter:url", url);
  html = setMeta(html, "property", "og:image", seo.ogImage || DEFAULT_OG);
  html = setMeta(html, "property", "twitter:image", seo.ogImage || DEFAULT_OG);
  if (seo.ogType) html = setMeta(html, "property", "og:type", seo.ogType);
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`);
  html = html.replace(/<link rel="alternate" hreflang="(en|x-default)" href="[^"]*"\s*\/?>/g,
    (_, lang) => `<link rel="alternate" hreflang="${lang}" href="${url}" />`);

  const schemas = [].concat(seo.structuredData || []).filter(Boolean);
  if (seo.breadcrumbs) {
    schemas.push({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: seo.breadcrumbs });
  }
  return html.replace("</head>", `${schemas.map(ldScript).join("")}</head>`);
}

function writeSitemap(today) {
  const urls = ROUTES.map((r) => `  <url>
    <loc>${SITE}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join("\n");
  fs.writeFileSync(path.join(BUILD, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  fs.writeFileSync(path.join(BUILD, "sitemap-index.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${SITE}/sitemap.xml</loc><lastmod>${today}</lastmod></sitemap>
  <sitemap><loc>${SITE}/sitemap-content.xml</loc><lastmod>${today}</lastmod></sitemap>
</sitemapindex>\n`);
}

async function main() {
  const cacheDir = path.join(ROOT, "node_modules", ".cache", "ssr");
  fs.mkdirSync(cacheDir, { recursive: true });
  const shellCopy = path.join(cacheDir, "shell.html");
  let template = fs.readFileSync(path.join(BUILD, "index.html"), "utf8");
  // Re-runs: build/index.html is already prerendered, so reuse the pristine shell saved earlier.
  if (template.includes('<div id="root"></div>')) fs.writeFileSync(shellCopy, template);
  else template = fs.readFileSync(shellCopy, "utf8");

  // Neutral shell for routes we do not prerender (newsletter issues, admin, 404 …).
  fs.writeFileSync(path.join(BUILD, "spa.html"),
    template.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, "")
      .replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*"\s*\/?>/g, ""));

  const outfile = path.join(cacheDir, "ssr.mjs");
  await build({
    entryPoints: [path.join(ROOT, "src", "ssr-entry.js")],
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    outfile,
    jsx: "automatic",
    loader: { ".js": "jsx", ".css": "empty", ".png": "empty", ".jpg": "empty", ".svg": "empty", ".webp": "empty" },
    alias: { "@": path.join(ROOT, "src") },
    define: {
      "process.env.NODE_ENV": '"production"',
      "process.env.REACT_APP_BACKEND_URL": JSON.stringify(process.env.REACT_APP_BACKEND_URL || ""),
    },
    banner: { js: "import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);" },
    logLevel: "error",
  });
  const { render } = await import(pathToFileURL(outfile).href);

  for (const route of ROUTES) {
    let seo = {};
    // First pass resolves React.lazy chunks; second pass emits them inline (no streaming placeholders).
    await render(route.path);
    globalThis.__SEO_COLLECT__ = (data) => { seo = data; };
    const body = await render(route.path);
    if (body.includes("<template id=\"B:")) console.warn(`  ! ${route.path} still has suspended segments`);
    globalThis.__SEO_COLLECT__ = null;
    const page = applyHead(template, seo, route.path).replace('<div id="root"></div>', `<div id="root">${body}</div>`);
    fs.writeFileSync(path.join(BUILD, route.file), page);
    console.log(`prerendered ${route.path.padEnd(16)} ${(body.length / 1024).toFixed(0)} KB  ${seo.title || "(no title)"}`);
  }
  writeSitemap(new Date().toISOString().slice(0, 10));
}

main().catch((err) => {
  // Never block a deploy: the SPA shell (spa.html) still serves every route.
  console.error("Prerender skipped:", err);
});
