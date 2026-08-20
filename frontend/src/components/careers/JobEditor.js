import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Save, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { careersApi } from '../../lib/careersApi';
import {
  LAYERS, DEPARTMENTS, EMPLOYMENT_TYPES, WORK_TYPES, EXPERIENCE_LEVELS, HIRING_STAGES,
} from '../../lib/careersTaxonomy';

const CUSTOM_DEPT = '__custom__';

const EMPTY = {
  title: '', slug: '', department: '', layer: 'Associates', location: '', work_type: 'Remote',
  employment_type: 'Full-Time', hiring_stage: 'Open Role',
  experience_level: 'Mid level', experience_range: '',
  compensation: '', summary: '', about_role: '',
  responsibilities: '', requirements: '', nice_to_have: '', what_we_offer: '',
  application_deadline: '', status: 'draft', seo_title: '', seo_description: '',
};

const slugify = (s) => String(s || '').toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/['"]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

const Label = ({ children }) => (
  <span className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500 mb-2">{children}</span>
);

const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none';

const JobEditor = ({ jobId, onBack, onSaved, onDeleted }) => {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!!jobId);
  const [saving, setSaving] = useState(false);
  const isNew = !jobId;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const load = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const res = await careersApi.adminGet(jobId);
      const j = res.job || {};
      setForm({
        ...EMPTY,
        ...j,
        responsibilities: (j.responsibilities || []).join('\n'),
        requirements: (j.requirements || []).join('\n'),
        nice_to_have: (j.nice_to_have || []).join('\n'),
        what_we_offer: (j.what_we_offer || []).join('\n'),
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load role');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { load(); }, [load]);

  const save = async (statusOverride) => {
    const status = statusOverride || form.status;
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.location.trim()) { toast.error('Location is required'); return; }
    if (!form.about_role.trim()) { toast.error('About the role is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        status,
        slug: form.slug ? slugify(form.slug) : slugify(form.title),
        responsibilities: form.responsibilities.split('\n'),
        requirements: form.requirements.split('\n'),
        nice_to_have: form.nice_to_have.split('\n'),
        what_we_offer: form.what_we_offer.split('\n'),
      };
      const res = isNew
        ? await careersApi.adminCreate(payload)
        : await careersApi.adminUpdate(jobId, payload);
      toast.success(status === 'published' ? 'Role published' : 'Role saved as draft');
      setForm((f) => ({ ...f, status, slug: res.job.slug }));
      onSaved?.(res.job);
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!jobId) return;
    // eslint-disable-next-line no-restricted-globals
    if (!window.confirm('Delete this role? This cannot be undone.')) return;
    try {
      await careersApi.adminDelete(jobId);
      toast.success('Role deleted');
      onDeleted?.();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-500 rounded-full mx-auto mb-3" />
        Loading role…
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="job-editor">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button" onClick={onBack} data-testid="job-editor-back"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to roles
        </button>
        <div className="flex items-center gap-2">
          {!isNew && form.status === 'published' && (
            <a
              href={`/careers/${form.slug}`} target="_blank" rel="noopener noreferrer"
              data-testid="job-editor-view-public"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View public page
            </a>
          )}
          {!isNew && (
            <button
              type="button" onClick={remove} data-testid="job-editor-delete"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
          <button
            type="button" onClick={() => save('draft')} disabled={saving} data-testid="job-editor-save-draft"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save draft
          </button>
          <button
            type="button" onClick={() => save('published')} disabled={saving} data-testid="job-editor-publish"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Publish
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">Role basics</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block md:col-span-2">
            <Label>Job title *</Label>
            <input data-testid="job-title-input" className={inputCls} value={form.title} onChange={set('title')} placeholder="Senior Delivery Lead" />
          </label>
          <label className="block">
            <Label>URL slug</Label>
            <input data-testid="job-slug-input" className={inputCls} value={form.slug} onChange={set('slug')} placeholder="auto-generated from title" />
            <span className="block mt-1.5 text-[11px] text-slate-400 font-mono">/careers/{form.slug || slugify(form.title) || '…'}</span>
          </label>
          <label className="block md:col-span-2">
            <Label>Department</Label>
            <select
              data-testid="job-department-select"
              className={inputCls}
              value={DEPARTMENTS.includes(form.department) || !form.department ? form.department : CUSTOM_DEPT}
              onChange={(e) => setForm((f) => ({
                ...f,
                department: e.target.value === CUSTOM_DEPT ? '' : e.target.value,
                _customDept: e.target.value === CUSTOM_DEPT,
              }))}
            >
              <option value="">Select a department…</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              <option value={CUSTOM_DEPT}>Other — type my own…</option>
            </select>
            {(form._customDept || (form.department && !DEPARTMENTS.includes(form.department))) && (
              <input
                data-testid="job-department-input"
                className={`${inputCls} mt-2`}
                value={form.department}
                onChange={set('department')}
                placeholder="Custom department name"
              />
            )}
          </label>
          <label className="block">
            <Label>Layer</Label>
            <select data-testid="job-layer-select" className={inputCls} value={form.layer} onChange={set('layer')}>
              {LAYERS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <label className="block">
            <Label>Hiring stage</Label>
            <select data-testid="job-hiring-stage-select" className={inputCls} value={form.hiring_stage} onChange={set('hiring_stage')}>
              {HIRING_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="block mt-1.5 text-[11px] text-slate-400">
              Shown as a badge on the role. “On Hold” and “Role Closed” stop new applications.
            </span>
          </label>
          <label className="block">
            <Label>Location *</Label>
            <input data-testid="job-location-input" className={inputCls} value={form.location} onChange={set('location')} placeholder="Bengaluru, India / Remote" />
          </label>
          <label className="block">
            <Label>Work type</Label>
            <select data-testid="job-work-type-select" className={inputCls} value={form.work_type} onChange={set('work_type')}>
              {WORK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="block">
            <Label>Employment type</Label>
            <select data-testid="job-employment-type-select" className={inputCls} value={form.employment_type} onChange={set('employment_type')}>
              {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="block">
            <Label>Experience level</Label>
            <select data-testid="job-experience-level-select" className={inputCls} value={form.experience_level} onChange={set('experience_level')}>
              {EXPERIENCE_LEVELS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="block">
            <Label>Experience range</Label>
            <input data-testid="job-experience-range-input" className={inputCls} value={form.experience_range} onChange={set('experience_range')} placeholder="5–8 years" />
          </label>
          <label className="block">
            <Label>Compensation (optional)</Label>
            <input data-testid="job-compensation-input" className={inputCls} value={form.compensation} onChange={set('compensation')} placeholder="Competitive, based on experience" />
          </label>
          <label className="block">
            <Label>Application deadline (optional)</Label>
            <input data-testid="job-deadline-input" type="date" className={inputCls} value={form.application_deadline} onChange={set('application_deadline')} />
          </label>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">Role detail</h3>
        <label className="block">
          <Label>Card summary</Label>
          <textarea data-testid="job-summary-input" rows={2} maxLength={400} className={inputCls} value={form.summary} onChange={set('summary')} placeholder="One or two lines shown on the job card and in link previews." />
        </label>
        <label className="block">
          <Label>About the role *</Label>
          <textarea data-testid="job-about-input" rows={7} className={inputCls} value={form.about_role} onChange={set('about_role')} placeholder="What the role is for, who it works with, and what success looks like." />
        </label>
        {[
          { key: 'responsibilities', label: "What you'll do", testid: 'job-responsibilities-input' },
          { key: 'requirements', label: "What we're looking for", testid: 'job-requirements-input' },
          { key: 'nice_to_have', label: 'Nice to have', testid: 'job-nice-to-have-input' },
          { key: 'what_we_offer', label: 'What we offer', testid: 'job-offer-input' },
        ].map(({ key, label, testid }) => (
          <label className="block" key={key}>
            <Label>{label} — one per line</Label>
            <textarea data-testid={testid} rows={5} className={inputCls} value={form[key]} onChange={set(key)} placeholder="One bullet per line" />
          </label>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">Search &amp; sharing</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <Label>SEO title</Label>
            <input data-testid="job-seo-title-input" className={inputCls} value={form.seo_title} onChange={set('seo_title')} placeholder="Defaults to the job title" />
          </label>
          <label className="block">
            <Label>SEO description</Label>
            <input data-testid="job-seo-description-input" className={inputCls} value={form.seo_description} onChange={set('seo_description')} placeholder="Defaults to the card summary" />
          </label>
        </div>
        <p className="text-xs text-slate-500">
          Sharing the role on LinkedIn or anywhere else uses <span className="font-mono">/careers/{form.slug || slugify(form.title) || '…'}</span>,
          which opens the site with this role's popup already open.
        </p>
      </div>
    </div>
  );
};

export default JobEditor;
