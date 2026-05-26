import React from 'react';
import { Calendar, User, ArrowRight, Clock, Tags } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from './SEOHead';

const BlogPost = ({ post }) => {
  if (!post) return null;

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEOHead 
        title={`${post.title} | Orgainse Consulting Blog`}
        description={post.excerpt}
        canonical={`https://orgainse.com/blog/${post.slug}`}
      />
      
      {/* Blog Header */}
      <header className="mb-8">
        <div className="flex items-center text-sm text-slate-600 mb-4">
          <Calendar className="h-4 w-4 mr-2" />
          <time dateTime={post.publishDate}>{post.publishDateFormatted}</time>
          <span className="mx-3">•</span>
          <Clock className="h-4 w-4 mr-2" />
          <span>{post.readTime} min read</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
          {post.title}
        </h1>
        
        <p className="text-xl text-slate-700 leading-relaxed mb-6">
          {post.excerpt}
        </p>
        
        {/* Author & Tags */}
        <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-slate-500" />
            <span className="text-sm font-medium text-slate-900">{post.author}</span>
          </div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tags className="h-4 w-4 text-slate-500" />
              {post.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>
      
      {/* Blog Content */}
      <div 
        className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      {/* Call to Action */}
      <div className="mt-12 p-8 bg-gradient-to-r from-orange-50 to-green-50 rounded-2xl border border-orange-100">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">
          Ready to Transform Your Business with AI?
        </h3>
        <p className="text-slate-700 mb-6">
          Get expert AI consulting and project management services tailored to your industry needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/contact"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Get Free Consultation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link 
            to="/ai-assessment"
            className="inline-flex items-center px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-all"
          >
            Take AI Assessment
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogPost;