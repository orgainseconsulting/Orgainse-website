import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEOCanonical = () => {
  const location = useLocation();

  useEffect(() => {
    // Get current path without query parameters
    const canonicalPath = location.pathname;
    
    // Base canonical URL - always use www version
    const baseUrl = 'https://www.orgainse.com';
    
    // Construct canonical URL
    const canonicalUrl = `${baseUrl}${canonicalPath === '/' ? '' : canonicalPath}`;
    
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
    
    // Cleanup function
    return () => {
      // Keep canonical tag for SEO (don't remove on unmount)
    };
  }, [location]);

  return null; // This component doesn't render anything
};

export default SEOCanonical;