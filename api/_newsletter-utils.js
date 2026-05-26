/**
 * Shared utilities for newsletter Vercel handlers.
 */
import { MongoClient } from 'mongodb';
import { randomUUID, randomBytes } from 'crypto';

let cachedClient = null;
export async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGO_URL);
    await cachedClient.connect();
  }
  return cachedClient.db(process.env.DB_NAME || 'orgainse-consulting');
}

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
export const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;
export const MAX_HTML_BYTES = 800 * 1024;
export const PUBLIC_SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://www.orgainse.com').replace(/\/$/, '');
export const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
export const SENDER_NAME = process.env.SENDER_NAME || 'Orgainse Consulting';
export const LOGO_URL = 'https://customer-assets.emergentagent.com/job_digital-presence-29/artifacts/xx6a5zd7_Copy%20of%20OrgAInse%20Consulting%20%28Website%29.png';

export function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function nowIso() { return new Date().toISOString(); }
export function genId() { return randomUUID(); }
export function genToken() { return randomBytes(24).toString('base64url'); }
export function isEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || ''); }

export function parseDataUrl(s) {
  if (typeof s !== 'string' || !s.startsWith('data:')) return null;
  const m = /^data:([^;]+);base64,(.+)$/.exec(s);
  if (!m) return null;
  return { mime: m[1].toLowerCase(), b64: m[2] };
}

export function validateImage(field, value) {
  if (!value) return { ok: true };
  const p = parseDataUrl(value);
  if (!p) return { ok: false, error: `${field}: invalid data URL` };
  if (!ALLOWED_MIME.has(p.mime)) return { ok: false, error: `${field}: unsupported (${p.mime})` };
  const bytes = Math.floor((p.b64.length * 3) / 4);
  if (bytes > MAX_IMAGE_BYTES) return { ok: false, error: `${field}: image too large` };
  return { ok: true, mime: p.mime, b64: p.b64 };
}

export function stripUnsafeHtml(html) {
  return String(html || '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '');
}

export function buildExcerpt(html, max = 220) {
  const t = String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

export function estimateReadingMinutes(html) {
  const t = String(html || '').replace(/<[^>]*>/g, ' ').trim();
  const w = t.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(w / 220));
}

export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return await new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 5 * 1024 * 1024) req.destroy(); });
    req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

export function issueToAdminShape(d) {
  if (!d) return null;
  return {
    id: d.id, slug: d.slug, title: d.title,
    subtitle: d.subtitle || '', issue_number: d.issue_number, edition_date: d.edition_date,
    preview_text: d.preview_text || '', content_html: d.content_html || '', excerpt: d.excerpt || '',
    cover_image_url: d.cover_image_mime && d.cover_image_b64 ? `data:${d.cover_image_mime};base64,${d.cover_image_b64}` : null,
    og_image_url: d.og_image_mime && d.og_image_b64 ? `data:${d.og_image_mime};base64,${d.og_image_b64}` : null,
    category: d.category || '', tags: d.tags || [],
    seo_title: d.seo_title || '', seo_description: d.seo_description || '',
    reading_minutes: d.reading_minutes || 1, status: d.status || 'draft',
    send_stats: d.send_stats || { total_recipients: 0, sent: 0, failed: 0, skipped: 0 },
    created_at: d.created_at, updated_at: d.updated_at,
    published_at: d.published_at, sent_at: d.sent_at,
  };
}

export function issueToPublicShape(d, full = false) {
  if (!d) return null;
  const out = {
    id: d.id, slug: d.slug, title: d.title, subtitle: d.subtitle || '',
    issue_number: d.issue_number, edition_date: d.edition_date,
    excerpt: d.excerpt || '', category: d.category || '', tags: d.tags || [],
    reading_minutes: d.reading_minutes || 1,
    cover_image_url: d.cover_image_mime && d.cover_image_b64 ? `data:${d.cover_image_mime};base64,${d.cover_image_b64}` : null,
    og_image_url: d.og_image_mime && d.og_image_b64 ? `data:${d.og_image_mime};base64,${d.og_image_b64}` : null,
    seo_title: d.seo_title || d.title,
    seo_description: d.seo_description || d.excerpt || '',
    published_at: d.published_at, updated_at: d.updated_at,
  };
  if (full) out.content_html = d.content_html || '';
  return out;
}

export function subToShape(d) {
  if (!d) return null;
  return {
    id: d.id, email: d.email, name: d.name || d.first_name || '',
    tags: d.tags || [], source: d.source || '',
    subscribed_at: d.subscribed_at || d.timestamp,
    unsubscribed: !!d.unsubscribed, unsubscribed_at: d.unsubscribed_at || null,
    bounced: !!d.bounced, complained: !!d.complained,
    status: d.unsubscribed ? 'unsubscribed' : (d.bounced ? 'bounced' : 'active'),
  };
}

export function buildIssueDoc(input, existing, dbCheckSlug) {
  // dbCheckSlug is (slug)=>Promise<bool>; unused inside but we hoist slug validity here.
  const html = stripUnsafeHtml(input.content_html || '');
  if (html.length > MAX_HTML_BYTES) throw new Error(`content_html too large`);
  const cover = validateImage('cover_image_url', input.cover_image_url);
  if (!cover.ok) throw new Error(cover.error);
  const og = validateImage('og_image_url', input.og_image_url);
  if (!og.ok) throw new Error(og.error);

  let slug = String(input.slug || '').toLowerCase().trim();
  slug = slug ? slugify(slug) : slugify(input.title || '');
  if (!slug) throw new Error('slug or title required');
  if (!SLUG_RE.test(slug)) throw new Error('invalid slug format');

  const tags = (Array.isArray(input.tags) ? input.tags : String(input.tags || '').split(','))
    .map((t) => String(t).trim().slice(0, 40)).filter(Boolean).slice(0, 12);

  const status_in = input.status || 'draft';
  const status = ['draft', 'published', 'sent'].includes(status_in) ? status_in : 'draft';

  const explicit_clear_cover = input.cover_image_url === '';
  const explicit_clear_og = input.og_image_url === '';

  const excerpt = buildExcerpt(html);
  const reading_minutes = estimateReadingMinutes(html);

  let issue_number = input.issue_number;
  if (issue_number !== undefined && issue_number !== null && typeof issue_number !== 'number') {
    const n = Number(issue_number); issue_number = Number.isFinite(n) ? n : null;
  }

  const doc = {
    id: existing?.id || genId(),
    slug,
    title: String(input.title || '').slice(0, 250),
    subtitle: String(input.subtitle || '').slice(0, 250),
    issue_number: issue_number ?? existing?.issue_number ?? null,
    edition_date: (input.edition_date || '').trim() || existing?.edition_date || null,
    preview_text: String(input.preview_text || '').slice(0, 200),
    content_html: html,
    excerpt,
    cover_image_b64: cover.b64 ?? (explicit_clear_cover ? null : existing?.cover_image_b64 ?? null),
    cover_image_mime: cover.mime ?? (explicit_clear_cover ? null : existing?.cover_image_mime ?? null),
    og_image_b64: og.b64 ?? (explicit_clear_og ? null : existing?.og_image_b64 ?? null),
    og_image_mime: og.mime ?? (explicit_clear_og ? null : existing?.og_image_mime ?? null),
    category: String(input.category || '').slice(0, 80),
    tags,
    seo_title: String(input.seo_title || '').slice(0, 250) || String(input.title || '').slice(0, 250),
    seo_description: String(input.seo_description || '').slice(0, 320) || excerpt,
    reading_minutes,
    status,
    created_at: existing?.created_at || nowIso(),
    updated_at: nowIso(),
    published_at: status === 'draft'
      ? null
      : (existing?.published_at && ['published', 'sent'].includes(existing?.status) ? existing.published_at : nowIso()),
    sent_at: existing?.sent_at || null,
    send_stats: existing?.send_stats || { total_recipients: 0, sent: 0, failed: 0, skipped: 0 },
  };
  return doc;
}

export function renderEmailHtml(issue, token) {
  const unsubscribeUrl = `${PUBLIC_SITE_URL}/unsubscribe?token=${token}`;
  const viewUrl = `${PUBLIC_SITE_URL}/newsletter/${issue.slug}`;
  const cover = issue.cover_image_mime && issue.cover_image_b64
    ? `data:${issue.cover_image_mime};base64,${issue.cover_image_b64}` : null;
  const chip = issue.issue_number
    ? `Issue #${issue.issue_number} · ${issue.edition_date || (issue.published_at || '').slice(0, 10)}`
    : (issue.edition_date || 'Newsletter');
  const subtitle = issue.subtitle
    ? `<p style="margin:0;font-size:16px;line-height:1.55;color:#475569;">${issue.subtitle}</p>` : '';
  const coverHtml = cover
    ? `<tr><td><img src="${cover}" alt="" width="600" style="display:block;width:100%;height:auto;border:0;"></td></tr>` : '';

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${issue.title || ''}</title></head>
<body style="margin:0;padding:0;background:#f6f5f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
<div style="display:none;font-size:1px;color:#f6f5f1;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${issue.preview_text || issue.excerpt || ''}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f5f1;padding:24px 12px;"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 30px rgba(15,23,42,0.06);">
<tr><td style="background:#0f172a;padding:18px 28px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="left" style="vertical-align:middle;"><img src="${LOGO_URL}" alt="Orgainse Consulting" width="160" style="display:block;background:#ffffff;border-radius:8px;padding:6px 10px;max-width:160px;height:auto;"></td>
<td align="right" style="vertical-align:middle;color:#fbbf24;font-size:11px;letter-spacing:1.2px;font-weight:700;text-transform:uppercase;">${chip}</td>
</tr></table></td></tr>${coverHtml}
<tr><td style="padding:36px 32px 8px 32px;"><p style="margin:0 0 10px 0;font-size:11px;letter-spacing:1.5px;color:#f97316;font-weight:700;text-transform:uppercase;">From the Orgainse desk</p>
<h1 style="margin:0 0 12px 0;font-size:30px;line-height:1.2;color:#0f172a;font-weight:800;">${issue.title || ''}</h1>${subtitle}</td></tr>
<tr><td style="padding:24px 32px 12px 32px;font-size:16px;line-height:1.7;color:#1f2937;"><div>${issue.content_html || ''}</div></td></tr>
<tr><td align="center" style="padding:16px 32px 32px 32px;"><a href="${viewUrl}" style="display:inline-block;background:#f97316;color:#ffffff;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;">Read on the web →</a></td></tr>
<tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #e2e8f0;margin:0;"></td></tr>
<tr><td style="padding:24px 32px 28px 32px;font-size:12px;line-height:1.6;color:#64748b;text-align:center;">
<p style="margin:0 0 6px 0;"><strong style="color:#0f172a;">Orgainse Consulting</strong> · AI-native consulting for ambitious businesses.</p>
<p style="margin:0 0 12px 0;">Bangalore (HQ) · Austin · <a href="${PUBLIC_SITE_URL}" style="color:#64748b;text-decoration:underline;">orgainse.com</a></p>
<p style="margin:0;"><a href="${viewUrl}" style="color:#64748b;text-decoration:underline;">View in browser</a> · <a href="${unsubscribeUrl}" style="color:#64748b;text-decoration:underline;">Unsubscribe</a></p>
</td></tr></table>
<p style="margin:18px 0 0 0;font-size:11px;color:#94a3b8;">© ${new Date().getUTCFullYear()} Orgainse Consulting. All rights reserved.</p>
</td></tr></table></body></html>`;
}

export function renderEmailText(issue, token) {
  const unsubUrl = `${PUBLIC_SITE_URL}/unsubscribe?token=${token}`;
  const viewUrl = `${PUBLIC_SITE_URL}/newsletter/${issue.slug}`;
  const text = String(issue.content_html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return `${issue.title || ''}\n${'='.repeat((issue.title || '').length)}\n\n${issue.subtitle ? issue.subtitle + '\n\n' : ''}${text}\n\nRead on the web: ${viewUrl}\n\n---\nOrgainse Consulting · orgainse.com\nUnsubscribe: ${unsubUrl}\n`;
}
