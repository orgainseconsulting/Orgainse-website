import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, User as UserIcon } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import StayTunedBanner from '../components/StayTunedBanner';
import { blogApi } from '../lib/blogApi';
import { api } from '../lib/api';

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
};

const PLACEHOLDER_GRADIENTS = [
  'from-orange-400 via-rose-400 to-pink-500',
  'from-sky-400 via-cyan-400 to-blue-500',
  'from-emerald-400 via-teal-400 to-cyan-500',
  'from-violet-400 via-purple-400 to-fuchsia-500',
  'from-amber-400 via-orange-400 to-red-500',
  'from-slate-500 via-slate-700 to-slate-900',
];

const CoverImage = ({ post }) => {
  if (post.cover_image_url) {
    return (
      <img
        src={post.cover_image_url}
        alt={post.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    );
  }
  const grad = PLACEHOLDER_GRADIENTS[(post.title || '').length % PLACEHOLDER_GRADIENTS.length];
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${grad} flex items-center justify-center p-6`}>
      <span className="text-3xl font-black text-white/95 text-center leading-tight line-clamp-3">
        {post.title}
      </span>
    </div>
  );
};

const BlogCard = ({ post }) => (
  <article
    className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all duration-300"
    data-testid={`blog-card-${post.slug}`}
  >
    <Link to={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-slate-100">
      <CoverImage post={post} />
      {post.category && (
        <span className="absolute top-3 left-3 inline-block bg-white/95 backdrop-blur-sm text-orange-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
          {post.category}
        </span>
      )}
    </Link>
    <div className="flex flex-col flex-1 p-5">
      <Link to={`/blog/${post.slug}`} className="block">
        <h2 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug line-clamp-2 mb-2">
          {post.title}
        </h2>
      </Link>
      {post.excerpt && (
        <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
      )}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <UserIcon className="h-3 w-3" />
            {post.author || 'Orgainse'}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.reading_minutes || 1} min
          </span>
        </div>
        <span className="text-xs font-medium text-slate-500 inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(post.published_at)}
        </span>
      </div>
    </div>
  </article>
);

const BlogIndexPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [launchIso, setLaunchIso] = useState('');
  const pageSize = 12;

  // Pre-fetch the admin-configured "next blog launch" target for the
  // Stay-Tuned countdown. Failure is silent; the banner falls back to its
  // own rolling 30-day default.
  useEffect(() => {
    let alive = true;
    api.appSettingsPublic()
      .then((res) => { if (alive) setLaunchIso(res?.settings?.next_blog_launch_at || ''); })
      .catch(() => { /* silent */ });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    blogApi.list(page, pageSize)
      .then((res) => {
        if (!alive) return;
        setPosts(res.posts || []);
        setTotal(res.pagination?.total ?? 0);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err.message || 'Failed to load posts');
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEOHead
        title="Blog — Orgainse Consulting | AI Strategy, PMaaS & Digital Transformation Insights"
        description="Practical, vendor-neutral guides on AI-native project management, digital transformation, and revenue intelligence — from the team building Orgainse Consulting."
        keywords="AI consulting blog, project management blog, digital transformation insights, PMaaS, RCM advisory"
        canonical="https://www.orgainse.com/blog"
      />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-10">
        <div className="max-w-3xl">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-orange-600 mb-3">
            Insights & Perspectives
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
            From the Orgainse <span className="text-orange-500">desk</span>
          </h1>
          <p className="text-base text-slate-600 mt-4 max-w-2xl">
            Field-tested perspectives on AI-native project management, digital transformation, healthcare revenue intelligence and the long-term shape of work.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="blog-loading">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-xl overflow-hidden">
                <div className="aspect-[16/10] bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded" />
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20" data-testid="blog-error">
            <p className="text-slate-600 mb-2">We couldn't load the blog right now.</p>
            <p className="text-xs text-slate-400">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <StayTunedBanner kind="blog" targetIso={launchIso} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="blog-grid">
            {posts.map((p) => <BlogCard key={p.id} post={p} />)}
          </div>
        )}

        {totalPages > 1 && !loading && !error && (
          <div className="flex justify-center items-center gap-3 mt-12" data-testid="blog-pagination">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default BlogIndexPage;
