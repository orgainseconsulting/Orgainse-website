/**
 * Catch-all admin handler. Routes:
 *
 *   GET    /api/newsletter-admin/issues                  list
 *   GET    /api/newsletter-admin/issues?id=              single
 *   POST   /api/newsletter-admin/issues                  create
 *   PUT    /api/newsletter-admin/issues?id=              update
 *   DELETE /api/newsletter-admin/issues?id=              delete
 *   POST   /api/newsletter-admin/issues/send?id=         send via Resend
 *
 *   GET    /api/newsletter-admin/subscribers             list (q, segment, state, page, page_size)
 *   POST   /api/newsletter-admin/subscribers             create
 *   PUT    /api/newsletter-admin/subscribers?id=         update
 *   DELETE /api/newsletter-admin/subscribers?id=         delete
 *   GET    /api/newsletter-admin/subscribers/export      CSV
 *
 *   GET    /api/newsletter-admin/segments                list
 *   POST   /api/newsletter-admin/segments                create
 *   DELETE /api/newsletter-admin/segments?id=            delete
 */
import { Resend } from 'resend';
import {
  getDb, slugify, SLUG_RE, isEmail, genId, genToken, nowIso, readBody,
  buildIssueDoc, issueToAdminShape, subToShape,
  renderEmailHtml, renderEmailText, SENDER_EMAIL, SENDER_NAME, PUBLIC_SITE_URL,
} from '../../_newsletter-utils.js';
import { securityHeaders, rateLimit } from '../../_middleware/security.js';
import { requireAdmin } from '../../_middleware/verify-admin.js';

export const config = { maxDuration: 60 };

function getSegments(req) {
  // Vercel passes catch-all into req.query.path = ['issues'] or ['issues','send']
  const raw = req.query?.path;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') return raw.split('/').filter(Boolean);
  // Fallback: parse from URL
  const m = /\/api\/newsletter-admin\/(.+?)(?:\?|$)/.exec(req.url || '');
  return m ? m[1].split('/').filter(Boolean) : [];
}

export default async function handler(req, res) {
  securityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!rateLimit(req, res, { max: 60, windowMs: 15 * 60 * 1000 })) return;

  const auth = requireAdmin(req, res);
  if (!auth) return;

  const db = await getDb();
  const segments = getSegments(req);
  const resource = segments[0];
  const action = segments[1];

  try {
    if (resource === 'issues') {
      const col = db.collection('newsletter_issues');

      if (action === 'send' && req.method === 'POST') {
        return await sendIssue(req, res, db);
      }

      if (req.method === 'GET') {
        const { id } = req.query;
        if (id) {
          const doc = await col.findOne({ id }, { projection: { _id: 0 } });
          if (!doc) return res.status(404).json({ error: 'Issue not found' });
          return res.status(200).json({ success: true, issue: issueToAdminShape(doc) });
        }
        const page = Math.max(1, parseInt(req.query.page || '1', 10));
        const pageSize = Math.min(100, Math.max(1, parseInt(req.query.page_size || '50', 10)));
        const rows = await col.find({}, { projection: { _id: 0, content_html: 0, cover_image_b64: 0, og_image_b64: 0 } })
          .sort({ updated_at: -1 }).skip((page - 1) * pageSize).limit(pageSize).toArray();
        const total = await col.countDocuments({});
        return res.status(200).json({
          success: true,
          pagination: { page, page_size: pageSize, total },
          issues: rows.map((r) => issueToAdminShape({ ...r, content_html: '', cover_image_b64: null, og_image_b64: null })),
        });
      }

      if (req.method === 'POST') {
        const body = await readBody(req);
        const doc = buildIssueDoc(body, null);
        const dup = await col.findOne({ slug: doc.slug }, { projection: { _id: 1 } });
        if (dup) return res.status(400).json({ error: 'slug already in use' });
        await col.insertOne(doc);
        return res.status(201).json({ success: true, issue: issueToAdminShape(doc) });
      }

      if (req.method === 'PUT') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'id required' });
        const existing = await col.findOne({ id });
        if (!existing) return res.status(404).json({ error: 'Issue not found' });
        const body = await readBody(req);
        const doc = buildIssueDoc(body, existing);
        const dup = await col.findOne({ slug: doc.slug, id: { $ne: doc.id } }, { projection: { _id: 1 } });
        if (dup) return res.status(400).json({ error: 'slug already in use' });
        await col.replaceOne({ id }, doc);
        return res.status(200).json({ success: true, issue: issueToAdminShape(doc) });
      }

      if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'id required' });
        const r = await col.deleteOne({ id });
        if (r.deletedCount === 0) return res.status(404).json({ error: 'Issue not found' });
        return res.status(200).json({ success: true, deleted: id });
      }
    }

    if (resource === 'subscribers') {
      const col = db.collection('newsletter_subscriptions');

      if (action === 'export' && req.method === 'GET') {
        const filt = {};
        if (req.query.segment) filt.tags = req.query.segment;
        if (req.query.state === 'active') { filt.unsubscribed = { $ne: true }; filt.bounced = { $ne: true }; }
        else if (req.query.state === 'unsubscribed') filt.unsubscribed = true;
        else if (req.query.state === 'bounced') filt.bounced = true;
        const rows = await col.find(filt, { projection: { _id: 0 } }).sort({ subscribed_at: -1 }).limit(100000).toArray();
        const header = 'email,name,tags,source,subscribed_at,status\n';
        const csv = header + rows.map((r) => {
          const s = subToShape(r);
          const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
          return [esc(s.email), esc(s.name), esc((s.tags || []).join(',')), esc(s.source), esc(s.subscribed_at || ''), esc(s.status)].join(',');
        }).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="orgainse-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`);
        return res.status(200).send(csv);
      }

      if (req.method === 'GET') {
        const filt = {};
        if (req.query.q) {
          const regex = { $regex: String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
          filt.$or = [{ email: regex }, { name: regex }, { first_name: regex }];
        }
        if (req.query.segment) filt.tags = req.query.segment;
        if (req.query.state === 'active') { filt.unsubscribed = { $ne: true }; filt.bounced = { $ne: true }; }
        else if (req.query.state === 'unsubscribed') filt.unsubscribed = true;
        else if (req.query.state === 'bounced') filt.bounced = true;

        const page = Math.max(1, parseInt(req.query.page || '1', 10));
        const pageSize = Math.min(200, Math.max(1, parseInt(req.query.page_size || '50', 10)));
        const rows = await col.find(filt, { projection: { _id: 0 } })
          .sort({ subscribed_at: -1 }).skip((page - 1) * pageSize).limit(pageSize).toArray();
        const total = await col.countDocuments(filt);
        const active = await col.countDocuments({ unsubscribed: { $ne: true }, bounced: { $ne: true } });
        const unsubscribed = await col.countDocuments({ unsubscribed: true });
        const bounced = await col.countDocuments({ bounced: true });
        return res.status(200).json({
          success: true,
          pagination: { page, page_size: pageSize, total },
          counts: { active, unsubscribed, bounced },
          subscribers: rows.map(subToShape),
        });
      }

      if (req.method === 'POST') {
        const body = await readBody(req);
        const email = String(body.email || '').toLowerCase().trim();
        if (!isEmail(email)) return res.status(400).json({ error: 'Invalid email' });
        const exists = await col.findOne({ email });
        if (exists) return res.status(400).json({ error: 'Email already subscribed' });
        const tags = (Array.isArray(body.tags) ? body.tags : []).map((t) => String(t).trim().slice(0, 40)).filter(Boolean).slice(0, 20);
        const doc = {
          id: genId(), email, name: String(body.name || '').slice(0, 120), first_name: String(body.name || '').slice(0, 120),
          leadType: 'Newsletter Subscription', source: 'admin_added',
          subscribed_at: nowIso(), timestamp: nowIso(), status: 'active',
          tags, unsubscribed: false, unsubscribed_at: null, unsubscribe_token: genToken(),
          bounced: false, complained: false, confirmed: true,
        };
        await col.insertOne(doc);
        return res.status(201).json({ success: true, subscriber: subToShape(doc) });
      }

      if (req.method === 'PUT') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'id required' });
        const existing = await col.findOne({ id });
        if (!existing) return res.status(404).json({ error: 'Subscriber not found' });
        const body = await readBody(req);
        const update = {};
        if (body.name !== undefined) { update.name = String(body.name).slice(0, 120); update.first_name = update.name; }
        if (body.tags !== undefined) update.tags = (Array.isArray(body.tags) ? body.tags : []).map((t) => String(t).trim().slice(0, 40)).filter(Boolean).slice(0, 20);
        if (body.unsubscribed !== undefined) { update.unsubscribed = !!body.unsubscribed; update.unsubscribed_at = body.unsubscribed ? nowIso() : null; }
        if (body.bounced !== undefined) update.bounced = !!body.bounced;
        if (Object.keys(update).length) await col.updateOne({ id }, { $set: update });
        const doc = await col.findOne({ id }, { projection: { _id: 0 } });
        return res.status(200).json({ success: true, subscriber: subToShape(doc) });
      }

      if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'id required' });
        const r = await col.deleteOne({ id });
        if (r.deletedCount === 0) return res.status(404).json({ error: 'Subscriber not found' });
        return res.status(200).json({ success: true, deleted: id });
      }
    }

    if (resource === 'segments') {
      const col = db.collection('newsletter_segments');

      if (req.method === 'GET') {
        const rows = await col.find({}, { projection: { _id: 0 } }).sort({ name: 1 }).toArray();
        return res.status(200).json({ success: true, segments: rows });
      }

      if (req.method === 'POST') {
        const body = await readBody(req);
        const name = String(body.name || '').trim();
        if (!name) return res.status(400).json({ error: 'name required' });
        const slug_in = String(body.slug || '').toLowerCase().trim();
        const slug = slug_in ? slugify(slug_in) : slugify(name);
        if (!slug || !SLUG_RE.test(slug)) return res.status(400).json({ error: 'invalid slug' });
        const dup = await col.findOne({ slug }, { projection: { _id: 1 } });
        if (dup) return res.status(400).json({ error: 'Segment slug already in use' });
        const doc = { id: genId(), name, slug, description: String(body.description || '').slice(0, 250), created_at: nowIso() };
        await col.insertOne(doc);
        return res.status(201).json({ success: true, segment: { ...doc } });
      }

      if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'id required' });
        const seg = await col.findOne({ id });
        if (!seg) return res.status(404).json({ error: 'Segment not found' });
        await col.deleteOne({ id });
        await db.collection('newsletter_subscriptions').updateMany({ tags: seg.slug }, { $pull: { tags: seg.slug } });
        return res.status(200).json({ success: true, deleted: id });
      }
    }

    return res.status(404).json({ error: 'Unknown admin resource' });
  } catch (e) {
    console.error('newsletter-admin error:', e);
    return res.status(400).json({ error: e?.message || 'Internal server error' });
  }
}

async function sendIssue(req, res, db) {
  // Prefer the admin-saved key from app_settings over the env-var fallback.
  // This is what the "Resend API key" field in Admin → Settings is for: it
  // lets a super-admin rotate the key without redeploying.
  const settingsDoc = await db.collection('app_settings').findOne({ _id: 'global' });
  const effectiveKey = (settingsDoc?.resend_api_key && settingsDoc.resend_api_key.trim())
    || process.env.RESEND_API_KEY;
  if (!effectiveKey) return res.status(500).json({ error: 'Resend API key not configured (set it in Admin → Settings)' });
  const effectiveSenderEmail = settingsDoc?.sender_email || SENDER_EMAIL;
  const effectiveSenderName = settingsDoc?.sender_name || SENDER_NAME;
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id required' });
  const issue = await db.collection('newsletter_issues').findOne({ id });
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  const body = await readBody(req);

  let recipients = [];
  let isTest = false;
  if (body.test_email) {
    if (!isEmail(body.test_email)) return res.status(400).json({ error: 'Invalid test email' });
    isTest = true;
    recipients = [{ email: String(body.test_email).toLowerCase(), name: 'Test', unsubscribe_token: 'test-token-no-record' }];
  } else {
    const filt = { unsubscribed: { $ne: true }, bounced: { $ne: true } };
    if (body.segment_slug) filt.tags = body.segment_slug;
    const cursor = db.collection('newsletter_subscriptions').find(filt, {
      projection: { _id: 0, email: 1, name: 1, first_name: 1, unsubscribe_token: 1 },
    });
    for await (const s of cursor) {
      const email = (s.email || '').toLowerCase();
      if (!isEmail(email)) continue;
      let token = s.unsubscribe_token;
      if (!token) {
        token = genToken();
        await db.collection('newsletter_subscriptions').updateOne({ email }, { $set: { unsubscribe_token: token } });
      }
      recipients.push({ email, name: s.name || s.first_name || '', unsubscribe_token: token });
    }
  }

  if (!recipients.length) return res.status(400).json({ error: 'No recipients matched the selected criteria' });

  const resend = new Resend(effectiveKey);
  const fromAddr = `${effectiveSenderName} <${effectiveSenderEmail}>`;
  let sent = 0, failed = 0;
  const failures = [];

  for (const r of recipients) {
    const unsubUrl = `${PUBLIC_SITE_URL}/unsubscribe?token=${r.unsubscribe_token}`;
    try {
      await resend.emails.send({
        from: fromAddr,
        to: [r.email],
        subject: issue.title || 'Orgainse Newsletter',
        html: renderEmailHtml(issue, r.unsubscribe_token),
        text: renderEmailText(issue, r.unsubscribe_token),
        headers: {
          'List-Unsubscribe': `<${unsubUrl}>, <mailto:${effectiveSenderEmail}?subject=Unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        replyTo: effectiveSenderEmail,
        tags: [{ name: 'campaign', value: issue.slug || 'newsletter' }],
      });
      sent++;
    } catch (e) {
      failed++;
      failures.push({ email: r.email, error: String(e?.message || e).slice(0, 200) });
    }
  }

  if (!isTest) {
    await db.collection('newsletter_issues').updateOne(
      { id },
      { $set: {
        status: sent > 0 ? 'sent' : (issue.status || 'draft'),
        sent_at: nowIso(),
        updated_at: nowIso(),
        send_stats: { total_recipients: recipients.length, sent, failed, skipped: 0 },
        published_at: issue.published_at || nowIso(),
      } },
    );
  }

  return res.status(200).json({
    success: true, is_test: isTest, total_recipients: recipients.length, sent, failed, failures: failures.slice(0, 10),
  });
}
