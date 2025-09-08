import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEOCanonical = () => {
  const location = useLocation();

  useEffect(() => {
    // Get current path without query parameters
    const canonicalPath = location.pathname;
    
    // Base canonical URL - always use www version
    const baseUrl = 'https://www.orgainse.com';
    
    // Construct canonical URL (without query parameters)
    const canonicalUrl = canonicalPath === '/' ? baseUrl : `${baseUrl}${canonicalPath}`;
    
    // Check if current URL has query parameters
    const hasQueryParams = location.search && location.search.length > 0;
    
    // Remove existing canonical tag if present
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }
    
    // Create new canonical tag
    const canonicalTag = document.createElement('link');
    canonicalTag.rel = 'canonical';
    canonicalTag.href = canonicalUrl;
    
    // Add to head
    document.head.appendChild(canonicalTag);
    
    // Handle meta robots for query parameters
    let existingRobots = document.querySelector('meta[name="robots"]');
    if (hasQueryParams) {
      // If URL has query parameters, tell robots to not index this specific URL
      if (existingRobots) {
        existingRobots.setAttribute('content', 'noindex, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
      } else {
        const robotsTag = document.createElement('meta');
        robotsTag.setAttribute('name', 'robots');
        robotsTag.setAttribute('content', 'noindex, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
        document.head.appendChild(robotsTag);
      }
    } else {
      // Clean URL without parameters - allow indexing
      if (existingRobots) {
        existingRobots.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
      } else {
        const robotsTag = document.createElement('meta');
        robotsTag.setAttribute('name', 'robots');
        robotsTag.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
        document.head.appendChild(robotsTag);
      }
    }
    
    // Update Open Graph URL to match canonical
    const existingOgUrl = document.querySelector('meta[property="og:url"]');
    if (existingOgUrl) {
      existingOgUrl.setAttribute('content', canonicalUrl);
    } else {
      const ogUrlTag = document.createElement('meta');
      ogUrlTag.setAttribute('property', 'og:url');
      ogUrlTag.setAttribute('content', canonicalUrl);
      document.head.appendChild(ogUrlTag);
    }
    
    // Update Twitter URL to match canonical
    const existingTwitterUrl = document.querySelector('meta[property="twitter:url"]');
    if (existingTwitterUrl) {
      existingTwitterUrl.setAttribute('content', canonicalUrl);
    } else {
      const twitterUrlTag = document.createElement('meta');
      twitterUrlTag.setAttribute('property', 'twitter:url');
      twitterUrlTag.setAttribute('content', canonicalUrl);
      document.head.appendChild(twitterUrlTag);
    }
    
    // Update page title for better SEO if it's a parameterized page
    if (hasQueryParams && canonicalPath === '/services') {
      const existingTitle = document.querySelector('title');
      if (existingTitle && !existingTitle.textContent.includes('(Filtered)')) {
        existingTitle.textContent = existingTitle.textContent + ' (Filtered)';
      }
    }
    
    // Cleanup function
    return () => {
      // Keep canonical tag and meta robots for SEO (don't remove on unmount)
    };
  }, [location]);

  return null; // This component doesn't render anything
};

export default SEOCanonical;