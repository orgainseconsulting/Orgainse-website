import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, Mail } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import StayTunedBanner from '../components/StayTunedBanner';
import { newsletterApi } from '../lib/newsletterApi';
import { api } from '../lib/api';
import { toast } from 'sonner';

const fmt = (iso) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return iso; }
};

const COVER_GRADS = [
  'from-orange-500 via-amber-500 to-rose-500',
  'from-sky-500 via-cyan-500 to-blue-600',
  'from-emerald-500 via-teal-500 to-cyan-600',
  'from-violet-500 via-purple-500 to-fuchsia-600',
];

const IssueCard = ({ issue }) => {
  const grad = COVER_GRADS[(issue.issue_number || 0) % COVER_GRADS.length];
  return (
    <article className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300"
      data-testid={`issue-card-${issue.slug}`}>
      <Link to={`/newsletter/${issue.slug}`} className="block relative aspect-[16/10] overflow-hidden">
        {issue.cover_image_url ? (
          <img src={issue.cover_image_url} alt={issue.title} loading="lazy"
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${grad} flex flex-col justify-between p-6`}>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-white/90">
              {issue.issue_number ? `Issue #${String(issue.issue_number).padStart(2, '0')}` : 'Issue'}
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-white leading-tight line-clamp-3">{issue.title}</h3>
              {issue.edition_date && <p className="text-xs font-medium text-white/80 mt-2">{fmt(issue.edition_date)}</p>}
            </div>
          </div>
        )}
      </Link>
      <div className="flex flex-col flex-1 p-6">
        {issue.issue_number && (
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600 mb-2">
            Issue #{String(issue.issue_number).padStart(2, '0')}
          </span>
        )}
        <Link to={`/newsletter/${issue.slug}`}>
          <h2 className="text-xl font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors leading-tight line-clamp-2 mb-2">
            {issue.title}
          </h2>
        </Link>
        {issue.subtitle && <p className="text-sm text-slate-500 italic mb-2 line-clamp-2">{issue.subtitle}</p>}
        {issue.excerpt && <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">{issue.excerpt}</p>}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{issue.reading_minutes || 1} min</span>
          {issue.edition_date && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{fmt(issue.edition_date)}</span>}
        </div>
      </div>
    </article>
  );
};

const NewsletterIndex = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [subEmail, setSubEmail] = useState('');
  const [subbing, setSubbing] = useState(false);
  const [launchIso, setLaunchIso] = useState('');

  useEffect(() => {
    let alive = true;
    api.appSettingsPublic()
      .then((res) => { if (alive) setLaunchIso(res?.settings?.next_newsletter_launch_at || ''); })
      .catch(() => { /* silent */ });
    return () => { alive = false; };
  }, []);
  const pageSize = 12;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    newsletterApi.list(page, pageSize)
      .then((r) => { if (!alive) return; setIssues(r.issues || []); setTotal(r.pagination?.total ?? 0); })
      .catch((e) => { if (!alive) return; setError(e.message || 'Failed to load'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [page]);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!subEmail.trim()) return;
    setSubbing(true);
    try {
      await api.newsletter({ email: subEmail.trim() });
      toast.success('You are subscribed! Watch for the next issue.');
      setSubEmail('');
    } catch (err) { toast.error(err.message || 'Subscription failed'); }
    finally { setSubbing(false); }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const featured = issues[0];
  const rest = issues.slice(1);

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <SEOHead
        title="Orgainse Pulse — Newsletter | AI-native consulting briefings"
        description="The Orgainse Pulse newsletter: fortnightly briefings on AI-native project management, digital transformation and revenue intelligence — straight from the desk that ships the work."
        keywords="Orgainse newsletter, AI strategy newsletter, PMaaS newsletter, AI-native consulting"
        canonical="https://www.orgainse.com/newsletter"
      />

      {/* Hero / Masthead */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <span className="inline-block text-[11px] font-black uppercase tracking-[0.24em] text-amber-300 mb-4">
                The Orgainse Pulse
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] mb-5">
                Briefings from the<br /><span className="text-orange-400">AI-native</span> desk.
              </h1>
              <p className="text-lg text-slate-300 max-w-xl leading-relaxed mb-8">
                Fortnightly, sharp, vendor-neutral. Field-tested perspectives on AI-native project management, digital transformation and revenue intelligence.
              </p>
              <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3 max-w-md" data-testid="newsletter-hero-subscribe">
                <input type="email" value={subEmail} onChange={(e) => setSubEmail(e.target.value)} required
                  placeholder="you@company.com"
                  data-testid="newsletter-hero-email"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:bg-white/15 focus:border-orange-400 focus:outline-none" />
                <button type="submit" disabled={subbing} data-testid="newsletter-hero-submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50">
                  <Mail className="h-4 w-4" />{subbing ? 'Subscribing…' : 'Subscribe'}
                </button>
              </form>
              <p className="text-xs text-slate-400 mt-3">Unsubscribe anytime · No spam, ever · ~2-min read per issue</p>
            </div>
            <div className="lg:col-span-5 hidden lg:block">
              <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 p-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white/95 rounded-xl h-full p-6 flex flex-col">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-orange-600 mb-2">Latest issue</div>
                  <h3 className="text-2xl font-extrabold text-slate-900 leading-tight line-clamp-3 flex-1">
                    {featured?.title || 'Subscribe to read the next issue.'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-4">{featured?.edition_date ? fmt(featured.edition_date) : 'Coming soon'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Archive grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900">Past issues</h2>
          <span className="text-sm text-slate-500">{total} {total === 1 ? 'issue' : 'issues'}</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="aspect-[16/10] bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded" />
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-slate-500">{error}</div>
        ) : issues.length === 0 ? (
          <StayTunedBanner kind="newsletter" targetIso={launchIso} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="newsletter-grid">
            {(featured ? [featured, ...rest] : issues).map((i) => <IssueCard key={i.id} issue={i} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-12">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40">Previous</button>
            <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40">Next</button>
          </div>
        )}
      </section>
    </div>
  );
};

export default NewsletterIndex;
