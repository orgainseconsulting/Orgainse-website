import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Mail } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { newsletterApi } from '../lib/newsletterApi';
import { api } from '../lib/api';
import { toast } from 'sonner';

const fmt = (iso) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return iso; }
};

const NewsletterIssuePage = () => {
  const { slug } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [subEmail, setSubEmail] = useState('');
  const [subbing, setSubbing] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true); setNotFound(false);
    newsletterApi.getBySlug(slug)
      .then((r) => { if (!alive) return; setIssue(r.issue || null); })
      .catch(() => { if (alive) setNotFound(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  const structuredData = useMemo(() => {
    if (!issue) return null;
    const canonical = `https://www.orgainse.com/newsletter/${issue.slug}`;
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: issue.title,
      description: issue.seo_description || issue.excerpt || '',
      datePublished: issue.published_at,
      dateModified: issue.updated_at || issue.published_at,
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      url: canonical,
      author: { '@type': 'Organization', name: 'Orgainse Consulting' },
      publisher: { '@type': 'Organization', name: 'Orgainse Consulting' },
      image: issue.og_image_url || issue.cover_image_url || undefined,
      isPartOf: { '@type': 'PublicationIssue', issueNumber: issue.issue_number, name: 'The Orgainse Pulse' },
    };
  }, [issue]);

  const subscribe = async (e) => {
    e.preventDefault();
    if (!subEmail.trim()) return;
    setSubbing(true);
    try {
      await api.newsletter({ email: subEmail.trim() });
      toast.success('Subscribed! Future issues will arrive in your inbox.');
      setSubEmail('');
    } catch (err) { toast.error(err.message || 'Subscription failed'); }
    finally { setSubbing(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f5f1]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-pulse space-y-6">
            <div className="h-3 bg-slate-300 rounded w-1/4" />
            <div className="h-10 bg-slate-300 rounded" />
            <div className="h-4 bg-slate-300 rounded w-2/3" />
            <div className="aspect-[16/9] bg-slate-300 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !issue) {
    return (
      <div className="min-h-screen bg-[#f6f5f1] flex items-center justify-center px-4">
        <div className="text-center" data-testid="newsletter-issue-not-found">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">404 · Issue</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Issue not found</h1>
          <p className="text-slate-600 mb-8">The issue you're looking for hasn't been published yet.</p>
          <Link to="/newsletter" className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600">
            <ArrowLeft className="h-4 w-4" />Back to archive
          </Link>
        </div>
      </div>
    );
  }

  const canonical = `https://www.orgainse.com/newsletter/${issue.slug}`;
  const ogImage = issue.og_image_url || issue.cover_image_url || undefined;

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <SEOHead
        title={`${issue.seo_title || issue.title} — Orgainse Pulse`}
        description={issue.seo_description || issue.excerpt || ''}
        keywords={Array.isArray(issue.tags) ? issue.tags.join(', ') : ''}
        canonical={canonical}
        ogImage={ogImage}
        ogType="article"
        structuredData={structuredData}
      />

      {/* Magazine masthead */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Link to="/newsletter" data-testid="issue-back-link"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-amber-300 mb-8">
            <ArrowLeft className="h-4 w-4" />The Orgainse Pulse
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-xs font-black uppercase tracking-[0.24em] text-amber-300 mb-6">
            {issue.issue_number && <span>Issue #{String(issue.issue_number).padStart(2, '0')}</span>}
            {issue.edition_date && <><span className="text-slate-600">·</span><span className="text-slate-400">{fmt(issue.edition_date)}</span></>}
            {issue.category && <><span className="text-slate-600">·</span><span className="text-slate-400">{issue.category}</span></>}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] mb-5">{issue.title}</h1>
          {issue.subtitle && <p className="text-xl text-slate-300 leading-relaxed italic">{issue.subtitle}</p>}
          <div className="flex items-center gap-5 text-xs text-slate-400 mt-8 pt-6 border-t border-slate-700">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{issue.reading_minutes || 1} min read</span>
            {issue.published_at && <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Published {fmt(issue.published_at)}</span>}
          </div>
        </div>
      </header>

      {/* Cover image */}
      {issue.cover_image_url && (
        <div className="bg-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mb-16 sm:-mb-24 relative z-10">
            <img src={issue.cover_image_url} alt={issue.title}
              className="w-full h-auto rounded-2xl shadow-2xl object-cover" data-testid="issue-cover" />
          </div>
          <div className="h-16 sm:h-24 bg-[#f6f5f1]" />
        </div>
      )}

      {/* Body */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="newsletter-issue-article">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-sm">
          <div
            className="prose prose-slate prose-lg max-w-none prose-headings:font-extrabold prose-headings:text-slate-900 prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-l-4 prose-blockquote:border-orange-400 prose-blockquote:bg-orange-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:hidden prose-code:after:hidden"
            dangerouslySetInnerHTML={{ __html: issue.content_html || '' }}
            data-testid="newsletter-issue-body"
          />
        </div>

        {/* Tags */}
        {Array.isArray(issue.tags) && issue.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-10">
            {issue.tags.map((t) => <span key={t} className="text-xs bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded-full">{t}</span>)}
          </div>
        )}

        {/* Subscribe CTA */}
        <div className="mt-12 bg-slate-900 text-white rounded-2xl p-8 sm:p-10 text-center">
          <Mail className="h-8 w-8 text-amber-300 mx-auto mb-3" />
          <h3 className="text-2xl font-extrabold mb-2">Don't miss the next issue.</h3>
          <p className="text-slate-300 mb-6">Get The Orgainse Pulse delivered to your inbox.</p>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" value={subEmail} onChange={(e) => setSubEmail(e.target.value)} required
              placeholder="you@company.com"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:bg-white/15 focus:border-orange-400 focus:outline-none" />
            <button type="submit" disabled={subbing}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50">
              {subbing ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
          <p className="text-xs text-slate-500 mt-3">Unsubscribe anytime · No spam, ever</p>
        </div>
      </article>
    </div>
  );
};

export default NewsletterIssuePage;
