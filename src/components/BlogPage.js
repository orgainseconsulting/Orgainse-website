import React from 'react';
import BlogSystem from './BlogSystem';

// Wrapper component for better routing
const BlogPage = () => {
  return (
    <div className="blog-page">
      <BlogSystem />
    </div>
  );
};

export default BlogPage;