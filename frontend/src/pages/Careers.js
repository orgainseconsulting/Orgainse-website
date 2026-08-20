import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight, MapPin, Briefcase, Clock, Sparkles, Brain, Code2,
  LineChart, Megaphone, Handshake, Stethoscope, Mail,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import GridBackdrop from '../components/brand/GridBackdrop';
import JobPopup from '../components/careers/JobPopup';
import { careersApi } from '../lib/careersApi';
import { stageStyle } from '../lib/careersTaxonomy';

const DISCIPLINES = [
  { icon: Brain, title: 'AI & Machine Learning', body: 'Applied practitioners who can tell the difference between a demo and something a delivery team can depend on every day.' },
  { icon: Code2, title: 'Engineering', body: 'Full-stack, platform and integration engineers building ORQYNE and connecting it to the tools clients already run.' },
  { icon: LineChart, title: 'Delivery & Project Management', body: 'Delivery leads, programme managers and governance practitioners who run an operating rhythm rather than chase status.' },
  { icon: Megaphone, title: 'Marketing', body: 'Writers, product marketers and demand generation people who can explain a technical product without inflating it.' },
  { icon: Handshake, title: 'Sales & Partnerships', body: 'Consultative sellers who qualify honestly, scope carefully and would rather walk away than oversell.' },
  { icon: Stethoscope, title: 'Revenue Cycle & Data Analysis', body: 'Analysts with United States healthcare revenue cycle depth for our Revenue Intelligence Advisory work.' },
];

const PRINCIPLES = [
  'We scope work around one measurable problem, then agree how success will be judged before we start.',
  'Ownership is explicit. Every risk, action and decision has a name against it — including ours.',
  'We say no to work we are not the right fit for, and we say it early.',
  'Remote-first across India, the United States and the wider markets we serve, with a real overlap window rather than always-on expectations.',
];

const Chip = ({ icon: Icon, children }) => (children ? (
  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
    <Icon className="h-3 w-3 text-blue-600" />
    {children}
  </span>
) : null);

export default function Careers() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deptFilter, setDeptFilter] = useState('All');

  const departments = ['All', ...Array.from(new Set(jobs.map((j) => j.department).filter(Boolean)))];
  const visibleJobs = deptFilter === 'All' ? jobs : jobs.filter((j) => j.department === deptFilter);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await careersApi.list();
        if (alive) setJobs(res.jobs || []);
      } catch {
        if (alive) setJobs([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Deep link: /careers/:slug opens that role's popup (and fetches it directly
  // so a shared LinkedIn link works even before the list resolves).
  useEffect(() => {
    if (!slug) { setSelected(null); return; }
    let alive = true;
    (async () => {
      try {
        const res = await careersApi.get(slug);
        if (alive) setSelected(res.job);
      } catch {
        if (alive) navigate('/careers', { replace: true });
      }
    })();
    return () => { alive = false; };
  }, [slug, navigate]);

  const openJob = useCallback((job) => navigate(`/careers/${job.slug}`), [navigate]);
  const closeJob = useCallback(() => navigate('/careers'), [navigate]);

  const seoTitle = selected
    ? `${selected.seo_title || selected.title} | Careers at Orgainse Consulting`
    : 'Careers at Orgainse Consulting | Open Roles';
  const seoDescription = selected
    ? (selected.seo_description || selected.summary || `${selected.title} — ${selected.location}. Apply to join Orgainse Consulting.`)
    : 'Join Orgainse Consulting — a delivery-execution partner helping IT services firms, software teams and growing businesses turn fragmented work into visible, governed execution. Open roles across AI, engineering, delivery, marketing, sales and revenue analysis.';

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonical={selected ? `https://orgainse.com/careers/${selected.slug}` : 'https://orgainse.com/careers'}
        keywords="Orgainse Consulting careers, delivery governance jobs, project management jobs, AI engineering jobs, ORQYNE careers, remote consulting jobs"
        ogType="website"
        structuredData={selected ? {
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: selected.title,
          description: selected.about_role,
          datePosted: selected.published_at,
          employmentType: (selected.employment_type || '').toUpperCase().replace(/[^A-Z]/g, '_') || 'FULL_TIME',
          hiringOrganization: {
            '@type': 'Organization',
            name: 'Orgainse Consulting',
            sameAs: 'https://orgainse.com',
          },
          jobLocation: {
            '@type': 'Place',
            address: { '@type': 'PostalAddress', addressLocality: selected.location },
          },
          ...(selected.application_deadline ? { validThrough: selected.application_deadline } : {}),
        } : {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Open roles at Orgainse Consulting',
          itemListElement: jobs.map((j, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: j.title,
            url: `https://orgainse.com/careers/${j.slug}`,
          })),
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white pt-16 pb-16 sm:pt-24 sm:pb-20">
        <GridBackdrop />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3.5 py-1.5">
            <Sparkles className="h-3 w-3" /> Careers at Orgainse
          </span>
          <h1 className="mt-6 font-outfit text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-[-0.03em] leading-[1.05] max-w-3xl">
            Build the practice that makes execution visible
          </h1>
          <p className="mt-6 text-base text-slate-600 leading-relaxed max-w-2xl">
            Orgainse Consulting is a delivery-execution partner for Information Technology services
            firms, software teams, startups and growing businesses. We work on one operating condition:
            service-led, cross-functional work that needs stronger execution visibility and governance.
            That happens through consulting, Project Management as a Service, workflow transformation
            and ORQYNE — the delivery-governance workspace we build and implement ourselves.
          </p>
          <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-2xl">
            We are always open to specialists, whether or not a matching role is listed below.
            The people who do well here are subject-matter experts who like a clear problem, a named
            owner and an honest conversation about scope — across Artificial Intelligence and Machine
            Learning, engineering, delivery and project management, marketing, sales, and revenue
            analysis.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#open-roles"
              data-testid="careers-view-roles-btn"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors shadow-[0_12px_34px_-14px_rgba(15,23,42,0.6)]"
            >
              See open roles <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="mailto:info@orgainse.com?subject=General%20interest%20—%20Orgainse%20Consulting"
              data-testid="careers-general-interest-btn"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white border border-slate-300 hover:border-slate-400 text-slate-900 text-sm font-semibold transition-colors"
            >
              <Mail className="h-4 w-4" /> Send a general application
            </a>
          </div>
        </div>
      </section>

      {/* Disciplines */}
      <section className="bg-slate-50 border-y border-slate-200 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-outfit text-2xl sm:text-3xl font-bold text-slate-900 tracking-[-0.02em]">
            Who we look for
          </h2>
          <p className="mt-3 text-base text-slate-600 max-w-2xl">
            Depth in one discipline, and the willingness to work inside someone else's delivery reality.
          </p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DISCIPLINES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                data-testid={`careers-discipline-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`}
                className="bg-white rounded-2xl border border-slate-200 p-6 org-hover-lift"
              >
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-blue-50 border border-blue-100">
                  <Icon className="h-4 w-4 text-blue-600" />
                </span>
                <h3 className="mt-5 font-outfit text-lg font-bold text-slate-900 tracking-[-0.01em]">{title}</h3>
                <p className="mt-3 text-[13px] text-slate-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-12">
          <div>
            <h2 className="font-outfit text-2xl sm:text-3xl font-bold text-slate-900 tracking-[-0.02em]">
              How we work
            </h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              We are a small, senior team operating from Austin, Texas and Bengaluru, India, serving
              clients across India, the United States, the United Kingdom, the United Arab Emirates,
              Australia, New Zealand and South Africa. There is no layer between you and the work.
            </p>
          </div>
          <ul className="space-y-4">
            {PRINCIPLES.map((p, i) => (
              <li key={i} className="flex items-start gap-3 bg-white rounded-2xl border border-slate-200 p-5">
                <span className="grid place-items-center h-7 w-7 shrink-0 rounded-lg bg-slate-900 text-white text-xs font-bold">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">{p}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Open roles */}
      <section id="open-roles" className="bg-slate-50 border-t border-slate-200 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-outfit text-2xl sm:text-3xl font-bold text-slate-900 tracking-[-0.02em]">
                Open roles
              </h2>
              <p className="mt-3 text-base text-slate-600">
                {loading ? 'Loading roles…' : `${visibleJobs.length} open ${visibleJobs.length === 1 ? 'role' : 'roles'}${deptFilter !== 'All' ? ` in ${deptFilter}` : ''}`}
              </p>
            </div>
          </div>

          {!loading && departments.length > 2 && (
            <div className="mt-7 flex flex-wrap gap-2" data-testid="careers-department-filter">
              {departments.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDeptFilter(d)}
                  data-testid={`careers-filter-${d.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  className={`text-xs font-semibold rounded-full px-3.5 py-2 border transition-colors ${
                    deptFilter === d
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="careers-loading">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-56 rounded-2xl bg-white border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div
              data-testid="careers-empty-state"
              className="mt-10 rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center"
            >
              <span className="grid place-items-center w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 mx-auto">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </span>
              <h3 className="mt-5 font-outfit text-xl font-bold text-slate-900">No roles open right now</h3>
              <p className="mt-3 text-sm text-slate-600 max-w-md mx-auto">
                We still want to hear from specialists. Send your resume and a short note about the work
                you want to do and we will keep it on file for the next opening.
              </p>
              <a
                href="mailto:info@orgainse.com?subject=General%20interest%20—%20Orgainse%20Consulting"
                data-testid="careers-empty-email-btn"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
              >
                <Mail className="h-4 w-4" /> Email info@orgainse.com
              </a>
            </div>
          ) : (
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="careers-jobs-grid">
              {visibleJobs.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => openJob(job)}
                  data-testid={`job-card-${job.slug}`}
                  className="group text-left bg-white rounded-2xl border border-slate-200 hover:border-blue-300 p-6 flex flex-col transition-colors org-hover-lift"
                >
                  <div className="flex items-start justify-between gap-3">
                    {job.department ? (
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700 leading-snug">
                        {job.department}
                      </span>
                    ) : <span />}
                    {job.hiring_stage && (
                      <span
                        data-testid={`job-card-${job.slug}-stage`}
                        className={`shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] rounded-full border px-2.5 py-1 ${stageStyle(job.hiring_stage)}`}
                      >
                        {job.hiring_stage}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-outfit text-lg font-bold text-slate-900 tracking-[-0.01em] group-hover:text-blue-700 transition-colors">
                    {job.title}
                  </h3>
                  {job.layer && (
                    <span className="mt-1.5 text-[11px] font-semibold text-slate-500">{job.layer}</span>
                  )}
                  {job.summary && (
                    <p className="mt-3 text-[13px] text-slate-600 leading-relaxed line-clamp-3 flex-1">
                      {job.summary}
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Chip icon={MapPin}>{job.location}</Chip>
                    <Chip icon={Briefcase}>{job.work_type}</Chip>
                    <Chip icon={Clock}>{job.employment_type}</Chip>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                    View role <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {selected && <JobPopup job={selected} onClose={closeJob} />}
    </div>
  );
}
