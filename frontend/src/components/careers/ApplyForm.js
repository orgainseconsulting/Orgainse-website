import React, { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { UploadCloud, FileText, X, Loader2, CheckCircle2 } from 'lucide-react';
import { careersApi, RESUME_ACCEPT, RESUME_MAX_BYTES, RESUME_MIMES, WHY_MAX_CHARS } from '../../lib/careersApi';

const fmtSize = (bytes) => (bytes > 1024 * 1024
  ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
  : `${Math.max(1, Math.round(bytes / 1024))} KB`);

export const ApplyForm = ({ job, onDone }) => {
  const fileRef = useRef(null);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', portfolio_url: '', why: '' });
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const whyLeft = useMemo(() => WHY_MAX_CHARS - form.why.length, [form.why]);

  const pickFile = (f) => {
    if (!f) return;
    if (!RESUME_MIMES.includes(f.type)) {
      toast.error('Please attach a PDF, DOC or DOCX file');
      return;
    }
    if (f.size > RESUME_MAX_BYTES) {
      toast.error('Resume must be 5 MB or smaller');
      return;
    }
    setFile(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please attach your resume');
      return;
    }
    setBusy(true);
    setProgress(2);
    try {
      const res = await careersApi.apply({ ...form, job_slug: job.slug, file }, setProgress);
      setDone(res.message || 'Application received.');
      toast.success('Application sent');
      onDone?.();
    } catch (err) {
      toast.error(err.message || 'Could not submit your application');
      setProgress(0);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-10" data-testid="apply-success">
        <span className="inline-grid place-items-center w-16 h-16 rounded-full bg-blue-50 border border-blue-100 mb-5">
          <CheckCircle2 className="h-8 w-8 text-blue-600" />
        </span>
        <h4 className="font-outfit text-xl font-bold text-slate-900 mb-2">Application received</h4>
        <p className="text-sm text-slate-600 max-w-md mx-auto">{done}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" data-testid="apply-form">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">Full name *</span>
          <input
            data-testid="apply-name-input"
            required minLength={2} value={form.full_name} onChange={set('full_name')}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            placeholder="Your full name"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">Email *</span>
          <input
            data-testid="apply-email-input"
            required type="email" value={form.email} onChange={set('email')}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">Phone</span>
          <input
            data-testid="apply-phone-input"
            value={form.phone} onChange={set('phone')}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            placeholder="Optional"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">Portfolio / LinkedIn</span>
          <input
            data-testid="apply-portfolio-input"
            type="url" value={form.portfolio_url} onChange={set('portfolio_url')}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            placeholder="Optional — https://…"
          />
        </label>
      </div>

      <div>
        <span className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">Resume *</span>
        {file ? (
          <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3" data-testid="apply-file-chip">
            <FileText className="h-5 w-5 text-blue-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
              <p className="text-[11px] text-slate-500">{fmtSize(file.size)}</p>
            </div>
            <button
              type="button" data-testid="apply-file-remove" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
              className="p-1.5 rounded-full hover:bg-white transition-colors" aria-label="Remove file"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            data-testid="apply-file-trigger"
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/40 px-4 py-8 text-center transition-colors"
          >
            <UploadCloud className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <span className="block text-sm font-semibold text-slate-800">Attach your resume</span>
            <span className="block text-[11px] text-slate-500 mt-1">PDF, DOC or DOCX · up to 5 MB</span>
          </button>
        )}
        <input
          ref={fileRef} type="file" accept={RESUME_ACCEPT} className="hidden"
          data-testid="apply-file-input"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
      </div>

      <label className="block">
        <span className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-slate-500 mb-2">
          <span>Why this role? *</span>
          <span data-testid="apply-why-counter" className={whyLeft < 0 ? 'text-red-600' : 'text-slate-400'}>
            {whyLeft} characters left
          </span>
        </span>
        <textarea
          data-testid="apply-why-input"
          required rows={5} maxLength={WHY_MAX_CHARS} value={form.why} onChange={set('why')}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm leading-relaxed focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
          placeholder="What draws you to this role, and what would you bring to it? (500 characters max)"
        />
      </label>

      {busy && (
        <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3" data-testid="apply-progress">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
            <span>Uploading your application…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <button
        type="submit"
        data-testid="apply-submit-btn"
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
      >
        {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : 'Submit application'}
      </button>
      <p className="text-[11px] text-slate-500 text-center">
        Your resume is emailed straight to our hiring inbox and is not stored on this website.
      </p>
    </form>
  );
};

export default ApplyForm;
