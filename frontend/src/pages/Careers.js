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
  'We work a hybrid model — time together in the office where it helps, and focused time wherever you work best.',
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
    ? `${selected.seo_title || selected.title} | Careers at Orgainse`
    : 'Careers at Orgainse | Open Roles';
  const seoDescription = selected
    ? (selected.seo_description || selected.summary || `${selected.title} — ${selected.location}. Apply to join Orgainse.`)
    : 'Join Orgainse — a delivery-execution partner helping IT services firms, software teams and growing businesses turn fragmented work into visible, governed execution. Open roles across AI, engineering, delivery, marketing, sales and revenue analysis.';

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonical={selected ? `https://www.orgainse.com/careers/${selected.slug}` : 'https://www.orgainse.com/careers'}
        keywords="Orgainse careers, delivery governance jobs, project management jobs, AI engineering jobs, ORQYNE careers, hybrid consulting jobs"
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
            name: 'Orgainse',
            sameAs: 'https://www.orgainse.com',
          },
          jobLocation: {
            '@type': 'Place',
            address: { '@type': 'PostalAddress', addressLocality: selected.location },
          },
          ...(selected.application_deadline ? { validThrough: selected.application_deadline } : {}),
        } : {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Open roles at Orgainse',
          itemListElement: jobs.map((j, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: j.title,
            url: `https://www.orgainse.com/careers/${j.slug}`,
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
            Orgainse is a delivery-execution partner for Information Technology services
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
              href="mailto:info@orgainse.com?subject=General%20interest%20—%20Orgainse"
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
              We are a small, senior team with offices in Austin, Texas and Bengaluru, India, serving
              clients globally. We work a hybrid model — time together in the office where it helps,
              and focused time wherever you do your best work. There is no layer between you and the work.
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
                {loading
                  ? 'Loading roles…'
                  : jobs.length === 0
                    ? 'Nothing posted at the moment — introductions still welcome'
                    : `${visibleJobs.length} open ${visibleJobs.length === 1 ? 'role' : 'roles'}${deptFilter !== 'All' ? ` in ${deptFilter}` : ''}`}
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
              className="mt-10 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-6 sm:px-12 py-14 sm:py-16"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.18]"
                style={{ backgroundImage: 'radial-gradient(circle at 18% 20%, #3b82f6 0%, transparent 42%), radial-gradient(circle at 82% 78%, #7c3aed 0%, transparent 45%)' }}
              />
              <div className="relative max-w-3xl">
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200 bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5">
                  <Sparkles className="h-3 w-3" /> Always reading
                </span>
                <h3 className="mt-6 font-outfit text-3xl sm:text-4xl font-bold text-white tracking-[-0.02em] leading-[1.1]">
                  No roles posted today.<br />
                  <span className="text-blue-300">That has never stopped a good introduction.</span>
                </h3>
                <p className="mt-6 text-[15px] text-blue-100/90 leading-relaxed">
                  We are a small team, so we hire when we meet someone we cannot stop thinking about —
                  not when a requisition opens. If you are strong at what you do and the work here
                  sounds like your kind of problem, write to us anyway. Every note reaches a person,
                  and the good ones stay on our desk until there is a role worth calling you about.
                </p>

                <div className="mt-9 grid sm:grid-cols-3 gap-4">
                  {[
                    { t: 'Tell us the problem you want', d: 'Not your job title — the kind of work you want to be handed on a Monday.' },
                    { t: 'Show us something real', d: 'A project, a repo, a process you fixed, a deck you would defend.' },
                    { t: 'We reply either way', d: 'A clear yes, not yet, or no. Never silence.' },
                  ].map((c) => (
                    <div key={c.t} className="rounded-2xl bg-white/[0.07] border border-white/10 p-5 backdrop-blur-sm">
                      <p className="font-outfit text-sm font-bold text-white">{c.t}</p>
                      <p className="mt-2 text-xs text-blue-100/80 leading-relaxed">{c.d}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <a
                    href="mailto:info@orgainse.com?subject=Introduction%20—%20I%20want%20to%20work%20at%20Orgainse&body=Hi%20Orgainse%20team%2C%0A%0AThe%20work%20I%20want%20to%20be%20doing%3A%0A%0AWhat%20I%20have%20built%20or%20fixed%20that%20I%20am%20proud%20of%3A%0A%0AMy%20resume%20is%20attached.%0A%0AThanks%2C%0A"
                    data-testid="careers-empty-email-btn"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-blue-50 text-slate-900 text-sm font-semibold transition-colors"
                  >
                    <Mail className="h-4 w-4" /> Introduce yourself
                  </a>
                  <a
                    href="/about"
                    data-testid="careers-empty-about-btn"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-white/25 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                  >
                    See what we actually do <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <p className="mt-5 text-[11px] text-blue-200/70">
                  Attach a resume and a few lines on why. That is genuinely enough to start.
                </p>
              </div>
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
