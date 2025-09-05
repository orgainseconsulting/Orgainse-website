const fs = require('fs');
const path = require('path');

// Blog posts data - sync with BlogSystem.js
const blogPosts = [
  { slug: 'ai-transformation-success-stories-roi', date: '2025-01-15' },
  { slug: 'ai-strategy-guide-mid-market-companies', date: '2025-01-12' },
  { slug: 'ai-roi-calculator-measuring-investment-returns', date: '2025-01-10' },
  { slug: 'digital-transformation-roadmap-legacy-to-ai', date: '2025-01-08' },
  { slug: 'process-optimization-ai-manufacturing-case-study', date: '2025-01-05' },
  { slug: 'ai-training-upskilling-workforce-future', date: '2025-01-03' }
];

const generateSitemap = () => {
  const baseUrl = 'https://www.orgainse.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Main Pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/services</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Interactive Tools -->
  <url>
    <loc>${baseUrl}/ai-assessment</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/roi-calculator</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/smart-calendar</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Blog System -->
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Blog Articles -->`;

  blogPosts.forEach(post => {
    sitemap += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  });

  sitemap += `
  
  <!-- Service-Specific Landing Pages -->
  <url>
    <loc>${baseUrl}/services/ai-strategy-consulting</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/services/digital-transformation</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/services/process-optimization</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/services/data-analytics-ai</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/services/technology-integration</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/services/ai-training-education</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Legal Pages -->
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
</urlset>`;

  // Write sitemap to public directory
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  
  console.log('✅ Sitemap generated successfully at:', sitemapPath);
  console.log(`📄 Generated ${blogPosts.length + 15} URLs`);
};

// Generate robots.txt as well
const generateRobots = () => {
  const robots = `User-agent: *
Allow: /

# Important pages
Allow: /about
Allow: /services  
Allow: /contact
Allow: /blog
Allow: /ai-assessment
Allow: /roi-calculator

# Block admin area
Disallow: /admin

# Sitemaps
Sitemap: https://www.orgainse.com/sitemap.xml

# Crawl-delay
Crawl-delay: 1`;

  const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');
  fs.writeFileSync(robotsPath, robots, 'utf8');
  console.log('✅ Robots.txt updated successfully');
};

if (require.main === module) {
  generateSitemap();
  generateRobots();
}

module.exports = { generateSitemap, generateRobots };