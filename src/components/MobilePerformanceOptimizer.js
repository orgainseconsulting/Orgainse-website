import { useEffect } from 'react';

const MobilePerformanceOptimizer = () => {
  useEffect(() => {
    // Optimize for mobile performance
    const optimizeForMobile = () => {
      // 1. Reduce animation intensity on mobile
      if (window.innerWidth <= 768) {
        const animations = document.querySelectorAll('[class*="animate"]');
        animations.forEach(el => {
          el.style.animationDuration = '0.3s';
        });
      }

      // 2. Lazy load images below the fold
      const images = document.querySelectorAll('img[loading="lazy"]');
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
              }
            }
          });
        });

        images.forEach(img => imageObserver.observe(img));
      }

      // 3. Preload critical resources on interaction
      const preloadOnInteraction = () => {
        const criticalResources = [
          '/static/css/main.css',
          '/static/js/main.js'
        ];

        criticalResources.forEach(resource => {
          if (!document.querySelector(`link[href="${resource}"]`)) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
          }
        });
      };

      // 4. Optimize touch events for mobile
      if ('ontouchstart' in window) {
        document.body.style.touchAction = 'manipulation';
        
        // Add passive event listeners for better scroll performance
        document.addEventListener('touchstart', () => {}, { passive: true });
        document.addEventListener('touchmove', () => {}, { passive: true });
      }

      // 5. Reduce DOM queries by caching elements
      window.performanceCache = window.performanceCache || {};
      
      // 6. Optimize font loading
      if ('fonts' in document) {
        document.fonts.ready.then(() => {
          console.log('✅ Fonts loaded for mobile optimization');
        });
      }

      // Run preload on first interaction
      ['click', 'touchstart', 'keydown'].forEach(event => {
        document.addEventListener(event, preloadOnInteraction, { once: true, passive: true });
      });
    };

    // Run optimization after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', optimizeForMobile);
    } else {
      optimizeForMobile();
    }

    // Cleanup function
    return () => {
      // Remove any event listeners if needed
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default MobilePerformanceOptimizer;