import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Save, Send, Trash2, Image as ImageIcon, X, Mail } from 'lucide-react';
import TipTapEditor from '../blog/TipTapEditor';
import { newsletterApi } from '../../lib/newsletterApi';

const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_COVER_BYTES = 1.4 * 1024 * 1024;

const slugify = (s) =>
  String(s || '')
    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').slice(0, 80);

const fileToDataUrl = (file) =>
  new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = () => rej(fr.error || new Error('read failed'));
    fr.readAsDataURL(file);
  });

const empty = {
  id: null,
  slug: '',
  title: '',
  subtitle: '',
  issue_number: '',
  edition_date: new Date().toISOString().slice(0, 10),
  preview_text: '',
  content_html: '',
  cover_image_url: '',
  og_image_url: '',
  category: '',
  tags: '',
  status: 'draft',
  seo_title: '',
  seo_description: '',
};

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
    {children}
    {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
  </div>
);

const ImageUpload = ({ label, value, onChange, testId }) => {
  const fileRef = useRef(null);
  const pick = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!ALLOWED_MIMES.includes(f.type)) return toast.error(`Unsupported (${f.type})`);
    if (f.size > MAX_COVER_BYTES) return toast.error(`Too large (max ${(MAX_COVER_BYTES / 1024).toFixed(0)} KB)`);
    onChange(await fileToDataUrl(f));
  };
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt={label} className="h-32 w-auto rounded-lg border border-slate-200 object-cover" />
          <button type="button" onClick={() => onChange('')} className="absolute -top-2 -right-2 h-6 w-6 inline-flex items-center justify-center rounded-full bg-white border border-slate-300 shadow text-slate-600 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()} data-testid={`${testId}-pick`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-dashed border-slate-300 text-slate-600 hover:border-orange-300 hover:text-orange-600">
          <ImageIcon className="h-4 w-4" /><span className="text-sm">Choose image</span>
        </button>
      )}
      <input ref={fileRef} type="file" accept={ALLOWED_MIMES.join(',')} onChange={pick} className="hidden" />
      <p className="text-xs text-slate-500 mt-1">PNG / JPEG / WebP / GIF · max ~1.4 MB</p>
    </div>
  );
};

const IssueEditor = ({ issueId, onBack, onSaved, onDeleted }) => {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(!!issueId);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [segments, setSegments] = useState([]);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendForm, setSendForm] = useState({ test_email: '', segment_slug: '', mode: 'test' });

  useEffect(() => {
    newsletterApi.adminSegmentsList().then((d) => setSegments(d.segments || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!issueId) { setForm(empty); return; }
    setLoading(true);
    let alive = true;
    newsletterApi.adminIssueGet(issueId)
      .then((d) => {
        if (!alive) return;
        const p = d.issue || {};
        setForm({
          id: p.id || null,
          slug: p.slug || '',
          title: p.title || '',
          subtitle: p.subtitle || '',
          issue_number: p.issue_number ?? '',
          edition_date: (p.edition_date || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
          preview_text: p.preview_text || '',
          content_html: p.content_html || '',
          cover_image_url: p.cover_image_url || '',
          og_image_url: p.og_image_url || '',
          category: p.category || '',
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
          status: p.status || 'draft',
          seo_title: p.seo_title || '',
          seo_description: p.seo_description || '',
        });
        setSlugTouched(true);
      })
      .catch((e) => toast.error(e.message || 'Failed to load issue'))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [issueId]);

  useEffect(() => {
    if (slugTouched) return;
    setForm((f) => ({ ...f, slug: slugify(f.title) }));
  }, [form.title, slugTouched]);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const buildPayload = (overrideStatus) => ({
    title: form.title.trim(),
    slug: form.slug.trim(),
    subtitle: form.subtitle.trim(),
    issue_number: form.issue_number === '' ? null : Number(form.issue_number),
    edition_date: form.edition_date,
    preview_text: form.preview_text.trim(),
    content_html: form.content_html,
    cover_image_url: form.cover_image_url,
    og_image_url: form.og_image_url,
    category: form.category.trim(),
    tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    status: overrideStatus || form.status,
    seo_title: form.seo_title.trim(),
    seo_description: form.seo_description.trim(),
  });

  const validate = () => {
    if (!form.title.trim()) return toast.error('Title is required') && false;
    if (!form.content_html || form.content_html.replace(/<[^>]*>/g, '').trim().length === 0)
      return toast.error('Body is required') && false;
    if (form.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug))
      return toast.error('Invalid slug format') && false;
    return true;
  };

  const save = async (publish = false) => {
    if (!validate()) return;
    const payload = buildPayload(publish ? 'published' : form.status);
    setSaving(true);
    try {
      const r = form.id
        ? await newsletterApi.adminIssueUpdate(form.id, payload)
        : await newsletterApi.adminIssueCreate(payload);
      toast.success(publish ? 'Published to /newsletter' : (form.id ? 'Saved' : 'Created'));
      onSaved?.(r.issue);
    } catch (e) { toast.error(e.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!form.id) return;
    if (!window.confirm(`Delete "${form.title || 'this issue'}"?`)) return;
    try {
      await newsletterApi.adminIssueDelete(form.id);
      toast.success('Deleted');
      onDeleted?.(form.id);
    } catch (e) { toast.error(e.message || 'Delete failed'); }
  };

  const doSend = async () => {
    if (!form.id) return toast.error('Save the issue first');
    if (sendForm.mode === 'test') {
      if (!sendForm.test_email.trim()) return toast.error('Enter a test email');
    }
    setSending(true);
    try {
      const r = await newsletterApi.adminIssueSend(form.id, {
        test_email: sendForm.mode === 'test' ? sendForm.test_email.trim() : null,
        segment_slug: sendForm.mode === 'live' && sendForm.segment_slug ? sendForm.segment_slug : null,
      });
      if (r.is_test) toast.success(`Test sent · ${r.sent}/${r.total_recipients}`);
      else toast.success(`Sent · ${r.sent}/${r.total_recipients} delivered (${r.failed} failed)`);
      setSendOpen(false);
      if (!r.is_test) onSaved?.({ ...form, status: 'sent' });
    } catch (e) { toast.error(e.message || 'Send failed'); }
    finally { setSending(false); }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500">
        <div className="animate-spin h-10 w-10 border-b-2 border-orange-500 rounded-full mx-auto mb-3" />
        Loading issue…
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="newsletter-issue-editor">
      <div className="flex flex-wrap items-center justify-between gap-3 sticky top-0 bg-white py-3 -mx-6 px-6 border-b border-slate-200 z-10">
        <button type="button" onClick={onBack} data-testid="issue-editor-back"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /><span className="text-sm font-medium">Back to issues</span>
        </button>
        <div className="flex items-center gap-2">
          {form.id && (
            <button type="button" onClick={remove} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 className="h-4 w-4" />Delete
            </button>
          )}
          <button type="button" onClick={() => save(false)} disabled={saving} data-testid="issue-editor-save"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <Save className="h-4 w-4" />Save draft
          </button>
          <button type="button" onClick={() => save(true)} disabled={saving} data-testid="issue-editor-publish"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50">
            Publish to web
          </button>
          <button type="button" onClick={() => setSendOpen(true)} disabled={!form.id} data-testid="issue-editor-send"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50">
            <Send className="h-4 w-4" />Send email
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Field label="Title">
            <input value={form.title} onChange={(e) => update({ title: e.target.value })} data-testid="issue-editor-title"
              placeholder="Orgainse Pulse — Issue 01"
              className="w-full px-4 py-3 text-2xl font-bold border border-slate-200 rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-300 focus:outline-none" />
          </Field>
          <Field label="Subtitle / kicker" hint="Short tagline shown under the title in the email + web view.">
            <input value={form.subtitle} onChange={(e) => update({ subtitle: e.target.value })}
              placeholder="AI-native consulting briefings, delivered fortnightly"
              className="w-full px-3 py-2 text-base border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none" />
          </Field>
          <Field label="Slug" hint={form.slug ? `Public URL: /newsletter/${form.slug}` : 'Auto-generated from title'}>
            <input value={form.slug} onChange={(e) => { setSlugTouched(true); update({ slug: e.target.value.toLowerCase() }); }}
              className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none" />
          </Field>
          <Field label="Preview text" hint="Inbox preview / pre-header text. Up to ~150 chars.">
            <input value={form.preview_text} maxLength={200} onChange={(e) => update({ preview_text: e.target.value })}
              placeholder="A line that previews this issue in subscribers' inboxes…"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none" />
          </Field>
          <Field label="Body">
            <TipTapEditor value={form.content_html} onChange={(html) => update({ content_html: html })}
              placeholder="Write your newsletter…" onImageError={(m) => toast.error(m)} />
          </Field>
        </div>

        <div className="lg:col-span-1 space-y-5">
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Issue meta</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Issue #">
                <input type="number" value={form.issue_number} onChange={(e) => update({ issue_number: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none" />
              </Field>
              <Field label="Edition date">
                <input type="date" value={form.edition_date} onChange={(e) => update({ edition_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none" />
              </Field>
            </div>
            <Field label="Status">
              <select value={form.status} onChange={(e) => update({ status: e.target.value })} data-testid="issue-editor-status"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:border-orange-400 focus:outline-none">
                <option value="draft">Draft</option>
                <option value="published">Published (web only)</option>
                <option value="sent">Sent</option>
              </select>
            </Field>
            <Field label="Category"><input value={form.category} onChange={(e) => update({ category: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none" /></Field>
            <Field label="Tags" hint="Comma-separated"><input value={form.tags} onChange={(e) => update({ tags: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none" /></Field>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Cover image</h3>
            <ImageUpload label="Cover image" value={form.cover_image_url} onChange={(v) => update({ cover_image_url: v })} testId="issue-cover" />
          </div>

          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">SEO</h3>
            <Field label="SEO title"><input value={form.seo_title} onChange={(e) => update({ seo_title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none" /></Field>
            <Field label="Meta description"><textarea rows={3} value={form.seo_description} onChange={(e) => update({ seo_description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none" /></Field>
            <ImageUpload label="OG / social image" value={form.og_image_url} onChange={(v) => update({ og_image_url: v })} testId="issue-og" />
          </div>

          {form.id && (
            <div className="border border-slate-200 rounded-lg p-4 bg-emerald-50/40">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-2">Send history</h3>
              <p className="text-xs text-slate-600">Use <strong>Send email</strong> above to test or broadcast this issue via Resend.</p>
            </div>
          )}
        </div>
      </div>

      {/* Send modal */}
      {sendOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSendOpen(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()} data-testid="issue-editor-send-modal">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-bold text-slate-900">Send issue</h3>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button type="button" onClick={() => setSendForm((s) => ({ ...s, mode: 'test' }))}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md ${sendForm.mode === 'test' ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}>
                  Send test
                </button>
                <button type="button" onClick={() => setSendForm((s) => ({ ...s, mode: 'live' }))}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md ${sendForm.mode === 'live' ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}>
                  Send to subscribers
                </button>
              </div>
              {sendForm.mode === 'test' ? (
                <Field label="Test recipient email">
                  <input type="email" value={sendForm.test_email} onChange={(e) => setSendForm((s) => ({ ...s, test_email: e.target.value }))}
                    data-testid="issue-send-test-email"
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none" />
                </Field>
              ) : (
                <>
                  <Field label="Segment (optional)" hint="Leave blank to send to ALL active subscribers.">
                    <select value={sendForm.segment_slug} onChange={(e) => setSendForm((s) => ({ ...s, segment_slug: e.target.value }))}
                      data-testid="issue-send-segment"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:border-orange-400 focus:outline-none">
                      <option value="">All active subscribers</option>
                      {segments.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                    </select>
                  </Field>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    ⚠️ This will send the email to <strong>every active matching subscriber</strong> immediately. Test first.
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setSendOpen(false)}
                className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={doSend} disabled={sending} data-testid="issue-send-confirm"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50">
                <Send className="h-4 w-4" />{sending ? 'Sending…' : (sendForm.mode === 'test' ? 'Send test' : 'Send now')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueEditor;
