import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { X, MapPin, Briefcase, Clock, TrendingUp, Wallet, CalendarClock, Link2, Linkedin, ArrowRight, Layers } from 'lucide-react';
import ApplyForm from './ApplyForm';
import { stageStyle, STAGES_NOT_ACCEPTING } from '../../lib/careersTaxonomy';

const Meta = ({ icon: Icon, label, value }) => (value ? (
  <div className="flex items-start gap-2.5">
    <Icon className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  </div>
) : null);

const Bullets = ({ title, items, testid }) => (items?.length ? (
  <div data-testid={testid}>
    <h4 className="font-outfit text-base font-bold text-slate-900 mb-3">{title}</h4>
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
          <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
          {it}
        </li>
      ))}
    </ul>
  </div>
) : null);

export const JobPopup = ({ job, onClose }) => {
  const [applying, setApplying] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [applying]);

  if (!job) return null;

  const shareUrl = `${window.location.origin}/careers/${job.slug}`;
  const accepting = !STAGES_NOT_ACCEPTING.includes(job.hiring_stage);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Job link copied');
    } catch {
      toast.error('Could not copy the link');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6" data-testid="job-popup">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <button
          type="button"
          onClick={onClose}
          data-testid="job-popup-close"
          aria-label="Close"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors"
        >
          <X className="h-5 w-5 text-slate-700" />
        </button>

        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 px-6 sm:px-8 py-7 pr-16">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {job.department && (
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200 bg-white/10 border border-white/15 rounded-full px-3 py-1">
                {job.department}
              </span>
            )}
            {job.employment_type && (
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200 bg-white/10 border border-white/15 rounded-full px-3 py-1">
                {job.employment_type}
              </span>
            )}
            {job.hiring_stage && (
              <span
                data-testid="job-popup-stage"
                className={`text-[10px] font-bold uppercase tracking-[0.12em] rounded-full border px-3 py-1 ${stageStyle(job.hiring_stage)}`}
              >
                {job.hiring_stage}
              </span>
            )}
          </div>
          <h2 className="font-outfit text-2xl sm:text-3xl font-bold text-white tracking-[-0.02em]" data-testid="job-popup-title">
            {job.title}
          </h2>
          {job.summary && <p className="mt-3 text-sm text-blue-100 leading-relaxed max-w-2xl">{job.summary}</p>}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto org-scroll-slim px-6 sm:px-8 py-7">
          {!applying ? (
            <div className="space-y-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-6 border-b border-slate-200">
                <Meta icon={MapPin} label="Location" value={job.location} />
                <Meta icon={Layers} label="Layer" value={job.layer} />
                <Meta icon={Briefcase} label="Work type" value={job.work_type} />
                <Meta icon={Clock} label="Employment" value={job.employment_type} />
                <Meta icon={TrendingUp} label="Experience" value={[job.experience_level, job.experience_range].filter(Boolean).join(' · ')} />
                <Meta icon={Wallet} label="Compensation" value={job.compensation} />
                <Meta icon={CalendarClock} label="Apply by" value={job.application_deadline} />
              </div>

              <div data-testid="job-popup-about">
                <h4 className="font-outfit text-base font-bold text-slate-900 mb-3">About the role</h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{job.about_role}</p>
              </div>

              <Bullets title="What you'll do" items={job.responsibilities} testid="job-popup-responsibilities" />
              <Bullets title="What we're looking for" items={job.requirements} testid="job-popup-requirements" />
              <Bullets title="Nice to have" items={job.nice_to_have} testid="job-popup-nice-to-have" />
              <Bullets title="What we offer" items={job.what_we_offer} testid="job-popup-offer" />

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button" onClick={copyLink} data-testid="job-popup-copy-link"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:border-slate-400 transition-colors"
                >
                  <Link2 className="h-3.5 w-3.5" /> Copy job link
                </button>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noopener noreferrer" data-testid="job-popup-share-linkedin"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:border-slate-400 transition-colors"
                >
                  <Linkedin className="h-3.5 w-3.5" /> Share on LinkedIn
                </a>
              </div>
            </div>
          ) : (
            <div>
              <button
                type="button" onClick={() => setApplying(false)} data-testid="job-popup-back-to-details"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 mb-5"
              >
                ← Back to role details
              </button>
              <h3 className="font-outfit text-xl font-bold text-slate-900 mb-1">Apply for {job.title}</h3>
              <p className="text-sm text-slate-600 mb-6">Attach your resume and tell us briefly why this role fits you.</p>
              <ApplyForm job={job} />
            </div>
          )}
        </div>

        {!applying && (
          <div className="border-t border-slate-200 bg-slate-50 px-6 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500 text-center sm:text-left">
              {accepting
                ? 'Resumes go straight to our hiring inbox — nothing is stored on this site.'
                : `This role is currently marked “${job.hiring_stage}” and is not accepting new applications.`}
            </p>
            <button
              type="button" onClick={() => setApplying(true)} data-testid="job-popup-apply-btn"
              disabled={!accepting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-[0_12px_34px_-14px_rgba(15,23,42,0.6)]"
            >
              {accepting ? <>Apply Now <ArrowRight className="h-4 w-4" /></> : 'Applications closed'}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default JobPopup;
