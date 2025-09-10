import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEOHead = ({ title, description, canonical, noindex = false }) => {
  const location = useLocation();
  
  // Generate breadcrumb data based on current path
  const generateBreadcrumbs = (pathname) => {
    const pathSegments = pathname.split('/').filter(segment => segment);
    const breadcrumbs = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://orgainse.com/"
      }
    ];
    
    const pathMap = {
      'about': 'About Us',
      'services': 'Our Services',
      'contact': 'Contact Us',
      'ai-assessment': 'AI Readiness Assessment',
      'roi-calculator': 'ROI Calculator',
      'smart-calendar': 'Book Consultation'
    };
    
    if (pathSegments.length > 0) {
      pathSegments.forEach((segment, index) => {
        const name = pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        const position = index + 2;
        const item = `https://orgainse.com/${pathSegments.slice(0, index + 1).join('/')}`;
        
        breadcrumbs.push({
          "@type": "ListItem",
          "position": position,
          "name": name,
          "item": item
        });
      });
    }
    
    return breadcrumbs;
  };
  
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.setAttribute('content', description);
    }
    
    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    
    const canonicalUrl = canonical || `https://orgainse.com${location.pathname}`;
    canonicalLink.href = canonicalUrl;
    
    // Update robots meta tag
    let robotsTag = document.querySelector('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement('meta');
      robotsTag.name = 'robots';
      document.head.appendChild(robotsTag);
    }
    
    robotsTag.content = noindex ? 'noindex, nofollow' : 'index, follow';
    
    // Update Open Graph URL
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', canonicalUrl);
    }
    
    // Update Twitter URL
    const twitterUrl = document.querySelector('meta[property="twitter:url"]');
    if (twitterUrl) {
      twitterUrl.setAttribute('content', canonicalUrl);
    }
    
    // Add breadcrumb structured data
    let breadcrumbScript = document.querySelector('script[data-breadcrumb]');
    if (breadcrumbScript) {
      breadcrumbScript.remove();
    }
    
    if (location.pathname !== '/') {
      breadcrumbScript = document.createElement('script');
      breadcrumbScript.type = 'application/ld+json';
      breadcrumbScript.setAttribute('data-breadcrumb', 'true');
      
      const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": generateBreadcrumbs(location.pathname)
      };
      
      breadcrumbScript.textContent = JSON.stringify(breadcrumbData);
      document.head.appendChild(breadcrumbScript);
    }
    
  }, [title, description, canonical, location.pathname, noindex]);
  
  return null; // This component doesn't render anything
};

export default SEOHead;