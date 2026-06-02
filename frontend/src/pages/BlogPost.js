import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User as UserIcon, Tag } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { blogApi } from '../lib/blogApi';

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
};

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setNotFound(false);
    blogApi.getBySlug(slug)
      .then((res) => {
        if (!alive) return;
        setPost(res.post || null);
      })
      .catch((err) => {
        if (!alive) return;
        if (err.status === 404) setNotFound(true);
        else setNotFound(true);
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  const structuredData = useMemo(() => {
    if (!post) return null;
    const canonical = `https://www.orgainse.com/blog/${post.slug}`;
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.seo_description || post.excerpt || '',
      datePublished: post.published_at,
      dateModified: post.updated_at || post.published_at,
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
      url: canonical,
      author: { '@type': 'Person', name: post.author || 'Orgainse Consulting' },
      publisher: {
        '@type': 'Organization',
        name: 'Orgainse Consulting',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.orgainse.com/orgainse-logo.png',
        },
      },
      image: post.og_image_url || post.cover_image_url || undefined,
      keywords: Array.isArray(post.tags) ? post.tags.join(', ') : '',
      articleSection: post.category || undefined,
      wordCount: (post.content_html || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length,
    };
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20" data-testid="blog-post-loading">
          <div className="animate-pulse space-y-6">
            <div className="h-3 bg-slate-200 rounded w-1/4" />
            <div className="h-10 bg-slate-200 rounded" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
            <div className="aspect-[16/9] bg-slate-200 rounded-xl" />
            <div className="h-4 bg-slate-200 rounded" />
            <div className="h-4 bg-slate-200 rounded w-11/12" />
            <div className="h-4 bg-slate-200 rounded w-10/12" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center" data-testid="blog-post-not-found">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">404 · Blog</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Post not found</h1>
          <p className="text-slate-600 mb-8">The post you’re looking for doesn’t exist or hasn’t been published yet.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600">
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  const canonical = `https://www.orgainse.com/blog/${post.slug}`;
  const ogImage = post.og_image_url || post.cover_image_url || undefined;

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={`${post.seo_title || post.title} — Orgainse Consulting Blog`}
        description={post.seo_description || post.excerpt || ''}
        keywords={Array.isArray(post.tags) ? post.tags.join(', ') : ''}
        canonical={canonical}
        ogImage={ogImage}
        ogType="article"
        structuredData={structuredData}
      />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16" data-testid="blog-post-article">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-orange-600 mb-8"
          data-testid="blog-post-back"
        >
          <ArrowLeft className="h-4 w-4" />
          All posts
        </Link>

        <header className="mb-8">
          {post.category && (
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600 mb-4">
              {post.category}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-5">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-slate-600 leading-relaxed">{post.excerpt}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-6 pt-6 border-t border-slate-100">
            <span className="inline-flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5" />
              {post.author || 'Orgainse Consulting'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.published_at)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {post.reading_minutes || 1} min read
            </span>
          </div>
        </header>

        {post.cover_image_url && (
          <figure className="mb-10 -mx-4 sm:-mx-0">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-auto sm:rounded-xl object-cover"
              data-testid="blog-post-cover"
            />
          </figure>
        )}

        <div
          className="prose prose-slate prose-lg max-w-none prose-headings:font-extrabold prose-headings:text-slate-900 prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-l-4 prose-blockquote:border-orange-400 prose-blockquote:bg-orange-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:hidden prose-code:after:hidden"
          dangerouslySetInnerHTML={{ __html: post.content_html || '' }}
          data-testid="blog-post-body"
        />

        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <footer className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
              {post.tags.map((t) => (
                <span key={t} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 sm:p-8 text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Found this useful?</h3>
              <p className="text-sm text-slate-600 mb-4">Talk to our team about how this applies to your business.</p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
              >
                Book a free consultation
              </Link>
            </div>
          </footer>
        )}
      </article>
    </div>
  );
};

export default BlogPostPage;
