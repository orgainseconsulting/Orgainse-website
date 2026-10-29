/**
 * POST /api/careers-apply
 *
 * Job application intake. The resume is NEVER persisted — it is streamed in as
 * base64 chunks (to stay under the serverless body limit), reassembled in
 * memory, attached to a Resend email to the careers inbox, and the staged
 * chunks are deleted immediately afterwards.
 *
 * Two actions:
 *   { action: 'chunk',  upload_id, index, total, chunk }
 *   { action: 'submit', upload_id, job_slug, full_name, email, phone,
 *                       portfolio_url, why, filename, mime }
 */
import { MongoClient } from 'mongodb';
import { randomUUID } from 'crypto';
import { Resend } from 'resend';
import { securityHeaders, rateLimit, sanitizeInput } from '../_middleware/security.js';

let cachedClient = null;
async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGO_URL);
    await cachedClient.connect();
  }
  return cachedClient.db(process.env.DB_NAME || 'orgainse-consulting');
}

export const CAREERS_INBOX = process.env.CAREERS_EMAIL || 'info@orgainse.com';
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const MAX_CHUNK_CHARS = 700 * 1024;
const MAX_CHUNKS = 20;
const WHY_MAX = 500;
const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const EXT_BY_MIME = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || '');
const nowIso = () => new Date().toISOString();
const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return await new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 1.2 * 1024 * 1024) req.destroy(); });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function buildEmailHtml({ job, full_name, email, phone, portfolio_url, why, filename }) {
  const row = (label, value) => value
    ? `<tr><td style="padding:8px 12px;font:600 12px/1.4 Arial,sans-serif;color:#475569;background:#f8fafc;border:1px solid #e2e8f0;width:170px">${esc(label)}</td><td style="padding:8px 12px;font:400 13px/1.5 Arial,sans-serif;color:#0f172a;border:1px solid #e2e8f0">${value}</td></tr>`
    : '';

  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f1f5f9">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
  <tr><td style="background:#0f172a;padding:20px 24px">
    <div style="font:700 11px/1 Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#93c5fd">Orgainse · Careers</div>
    <div style="font:700 20px/1.3 Arial,sans-serif;color:#ffffff;margin-top:8px">New application received</div>
  </td></tr>
  <tr><td style="padding:24px">
    <p style="font:400 14px/1.6 Arial,sans-serif;color:#334155;margin:0 0 18px">
      <strong>${esc(full_name)}</strong> has applied for
      <strong>${esc(job?.title || 'a role')}</strong>${job?.location ? ` (${esc(job.location)})` : ''}.
      The resume is attached to this email.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse">
      ${row('Role', esc(job?.title || '—'))}
      ${row('Layer', esc(job?.layer || ''))}
      ${row('Hiring stage', esc(job?.hiring_stage || ''))}
      ${row('Job link', job?.slug ? `<a href="https://orgainse.com/careers/${esc(job.slug)}" style="color:#2563eb">/careers/${esc(job.slug)}</a>` : '')}
      ${row('Department', esc(job?.department || ''))}
      ${row('Location', esc(job?.location || ''))}
      ${row('Candidate', esc(full_name))}
      ${row('Email', `<a href="mailto:${esc(email)}" style="color:#2563eb">${esc(email)}</a>`)}
      ${row('Phone', esc(phone || ''))}
      ${row('Portfolio', portfolio_url ? `<a href="${esc(portfolio_url)}" style="color:#2563eb">${esc(portfolio_url)}</a>` : '')}
      ${row('Resume', esc(filename))}
      ${row('Received', esc(nowIso()))}
    </table>
    <div style="margin-top:22px">
      <div style="font:700 11px/1 Arial,sans-serif;letter-spacing:1.6px;text-transform:uppercase;color:#475569;margin-bottom:8px">Why this role</div>
      <div style="font:400 14px/1.7 Arial,sans-serif;color:#0f172a;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;white-space:pre-wrap">${esc(why)}</div>
    </div>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:14px 24px;border-top:1px solid #e2e8f0;font:400 11px/1.5 Arial,sans-serif;color:#64748b">
    Sent automatically from the Orgainse careers page. Reply directly to reach the candidate.
  </td></tr>
</table></body></html>`;
}

export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!rateLimit(req, res, { max: 60, windowMs: 15 * 60 * 1000 })) return;

  try {
    const db = await getDb();
    const chunks = db.collection('career_upload_chunks');
    const body = await readJsonBody(req);
    const action = body.action === 'submit' ? 'submit' : 'chunk';

    // ---------------------------------------------------------------- chunk
    if (action === 'chunk') {
      const uploadId = /^[a-f0-9-]{10,60}$/i.test(String(body.upload_id || '')) ? String(body.upload_id) : null;
      const index = Number(body.index);
      const total = Number(body.total);
      const chunk = String(body.chunk || '');

      if (!uploadId) return res.status(400).json({ error: 'Invalid upload_id' });
      if (!Number.isInteger(index) || index < 0 || index >= MAX_CHUNKS) return res.status(400).json({ error: 'Invalid chunk index' });
      if (!Number.isInteger(total) || total < 1 || total > MAX_CHUNKS) return res.status(400).json({ error: 'Invalid chunk total' });
      if (!chunk || chunk.length > MAX_CHUNK_CHARS) return res.status(400).json({ error: 'Invalid chunk size' });
      if (!/^[A-Za-z0-9+/=]+$/.test(chunk)) return res.status(400).json({ error: 'Chunk must be base64' });

      await chunks.updateOne(
        { upload_id: uploadId, index },
        { $set: { upload_id: uploadId, index, total, data: chunk, created_at: nowIso() } },
        { upsert: true },
      );
      // Staged chunks are transient — sweep anything abandoned for over an hour.
      await chunks.deleteMany({ created_at: { $lt: new Date(Date.now() - 3600000).toISOString() } });
      return res.status(200).json({ success: true, received: index, total });
    }

    // --------------------------------------------------------------- submit
    const clean = sanitizeInput({
      full_name: String(body.full_name || '').trim().slice(0, 120),
      email: String(body.email || '').trim().toLowerCase().slice(0, 160),
      phone: String(body.phone || '').trim().slice(0, 40),
      portfolio_url: String(body.portfolio_url || '').trim().slice(0, 300),
      why: String(body.why || '').trim().slice(0, WHY_MAX),
      job_slug: String(body.job_slug || '').trim().slice(0, 120),
      filename: String(body.filename || 'resume').replace(/[^\w.\- ]/g, '_').slice(0, 120),
    });
    const mime = String(body.mime || '').toLowerCase();
    const uploadId = /^[a-f0-9-]{10,60}$/i.test(String(body.upload_id || '')) ? String(body.upload_id) : null;

    if (!clean.full_name || clean.full_name.length < 2) return res.status(400).json({ error: 'Full name is required' });
    if (!isEmail(clean.email)) return res.status(400).json({ error: 'A valid email address is required' });
    if (!clean.why || clean.why.length < 20) return res.status(400).json({ error: 'Please tell us why you are applying (at least 20 characters)' });
    if (clean.portfolio_url && !/^https?:\/\/\S+$/i.test(clean.portfolio_url)) {
      return res.status(400).json({ error: 'Portfolio link must start with http:// or https://' });
    }
    if (!ALLOWED_MIME.has(mime)) return res.status(400).json({ error: 'Resume must be a PDF, DOC or DOCX file' });
    if (!uploadId) return res.status(400).json({ error: 'Resume upload is required' });

    const job = clean.job_slug
      ? await db.collection('job_postings').findOne(
        { slug: clean.job_slug, status: 'published' },
        { projection: { _id: 0, slug: 1, title: 1, department: 1, location: 1, layer: 1, hiring_stage: 1 } },
      )
      : null;
    if (clean.job_slug && !job) return res.status(404).json({ error: 'This role is no longer open' });
    if (job && ['Role Closed', 'On Hold'].includes(job.hiring_stage)) {
      return res.status(409).json({ error: 'This role is not accepting applications right now.' });
    }

    const parts = await chunks.find({ upload_id: uploadId }).sort({ index: 1 }).toArray();
    if (!parts.length) return res.status(400).json({ error: 'Resume upload expired — please attach the file again' });
    const expected = parts[0].total;
    if (parts.length !== expected) return res.status(400).json({ error: 'Resume upload incomplete — please try again' });

    const b64 = parts.map((p) => p.data).join('');
    const buffer = Buffer.from(b64, 'base64');
    if (!buffer.length) return res.status(400).json({ error: 'Resume file is empty' });
    if (buffer.length > MAX_RESUME_BYTES) return res.status(400).json({ error: 'Resume exceeds the 5 MB limit' });

    const settings = await db.collection('app_settings').findOne({ _id: 'global' });
    const key = (settings?.resend_api_key && settings.resend_api_key.trim()) || process.env.RESEND_API_KEY;
    if (!key) return res.status(500).json({ error: 'Email delivery is not configured. Please email us directly.' });
    const senderEmail = settings?.sender_email || process.env.SENDER_EMAIL || 'info@orgainse.com';
    const senderName = settings?.sender_name || process.env.SENDER_NAME || 'Orgainse';

    const ext = EXT_BY_MIME[mime];
    const filename = clean.filename.toLowerCase().endsWith(`.${ext}`)
      ? clean.filename
      : `${clean.filename.replace(/\.[^.]*$/, '')}.${ext}`;

    const resend = new Resend(key);
    const sendResult = await resend.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: [CAREERS_INBOX],
      replyTo: clean.email,
      subject: `Application — ${job?.title || 'General interest'} — ${clean.full_name}`,
      html: buildEmailHtml({ ...clean, job, filename }),
      text: [
        `New application received`,
        `Role: ${job?.title || 'General interest'}`,
        job?.location ? `Location: ${job.location}` : '',
        `Candidate: ${clean.full_name}`,
        `Email: ${clean.email}`,
        clean.phone ? `Phone: ${clean.phone}` : '',
        clean.portfolio_url ? `Portfolio: ${clean.portfolio_url}` : '',
        `Resume: ${filename} (attached)`,
        '',
        'Why this role:',
        clean.why,
      ].filter(Boolean).join('\n'),
      attachments: [{ filename, content: buffer.toString('base64'), contentType: mime }],
    });

    if (sendResult?.error) {
      console.error('careers-apply resend error:', sendResult.error);
      await chunks.deleteMany({ upload_id: uploadId });
      return res.status(502).json({ error: 'We could not deliver your application right now. Please email info@orgainse.com directly.' });
    }

    // Resume is never retained — drop the staged chunks plus anything stale.
    await chunks.deleteMany({ upload_id: uploadId });
    await chunks.deleteMany({ created_at: { $lt: new Date(Date.now() - 3600000).toISOString() } });

    return res.status(200).json({
      success: true,
      message: `Thanks ${clean.full_name.split(' ')[0]} — your application is with our team. We review every application and will reach out if there is a fit.`,
      application_id: randomUUID(),
    });
  } catch (err) {
    console.error('careers-apply error:', err);
    return res.status(500).json({ error: 'We could not submit your application. Please try again or email info@orgainse.com.' });
  }
}
