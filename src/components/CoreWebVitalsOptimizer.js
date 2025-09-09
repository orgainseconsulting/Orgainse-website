import React, { useEffect, useState } from 'react';

const CoreWebVitalsOptimizer = () => {
  const [vitals, setVitals] = useState({
    lcp: null,
    fid: null,
    cls: null,
    inp: null
  });

  useEffect(() => {
    // Initialize Core Web Vitals monitoring
    initializeVitalsMonitoring();
    
    // Optimize images for LCP
    optimizeImages();
    
    // Optimize JavaScript for FID/INP
    optimizeJavaScript();
    
    // Optimize layout for CLS
    optimizeLayout();
    
  }, []);

  const initializeVitalsMonitoring = () => {
    // Monitor LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      setVitals(prev => ({ ...prev, lcp: lastEntry.startTime }));
      
      // Send to analytics if performance is poor
      if (lastEntry.startTime > 2500) {
        console.warn('Poor LCP performance:', lastEntry.startTime);
        if (window.gtag) {
          window.gtag('event', 'poor_lcp', {
            'custom_parameter': lastEntry.startTime
          });
        }
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fid = entry.processingStart - entry.startTime;
        setVitals(prev => ({ ...prev, fid }));
        
        if (fid > 100) {
          console.warn('Poor FID performance:', fid);
          if (window.gtag) {
            window.gtag('event', 'poor_fid', {
              'custom_parameter': fid
            });
          }
        }
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Monitor INP (Interaction to Next Paint)
    let inpValue = 0;
    const inpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.interactionId) {
          inpValue = Math.max(inpValue, entry.duration);
          setVitals(prev => ({ ...prev, inp: inpValue }));
          
          if (inpValue > 200) {
            console.warn('Poor INP performance:', inpValue);
          }
        }
      });
    });
    inpObserver.observe({ entryTypes: ['event'] });

    // Monitor CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          setVitals(prev => ({ ...prev, cls: clsValue }));
          
          if (clsValue > 0.1) {
            console.warn('Poor CLS performance:', clsValue);
            if (window.gtag) {
              window.gtag('event', 'poor_cls', {
                'custom_parameter': clsValue
              });
            }
          }
        }
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  };

  const optimizeImages = () => {
    // Lazy load images that are not above the fold
    const images = document.querySelectorAll('img');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Add loading optimization
          if (!img.hasAttribute('loading')) {
            const rect = img.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // If image is likely above the fold, load eagerly
            if (rect.top < viewportHeight) {
              img.loading = 'eager';
            } else {
              img.loading = 'lazy';
            }
          }
          
          // Add aspect ratio if missing
          if (!img.style.aspectRatio && img.width && img.height) {
            img.style.aspectRatio = `${img.width} / ${img.height}`;
          }
          
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));

    // Preload critical images
    const criticalImages = document.querySelectorAll('img[data-critical="true"], .hero img, .banner img');
    criticalImages.forEach(img => {
      if (img.src) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src;
        document.head.appendChild(link);
      }
    });
  };

  const optimizeJavaScript = () => {
    // Defer non-critical scripts
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
        // Check if script is critical
        const src = script.src;
        const isCritical = src.includes('analytics') || src.includes('gtag') || 
                          script.hasAttribute('data-critical');
        
        if (!isCritical) {
          script.defer = true;
        }
      }
    });

    // Break up long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.duration > 50) {
          console.warn('Long task detected:', entry.duration, 'ms');
          
          // Try to break up the task (implementation would depend on specific code)
          if (window.scheduler && window.scheduler.postTask) {
            window.scheduler.postTask(() => {
              // Reschedule part of the work
            }, { priority: 'background' });
          }
        }
      });
    });
    
    if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    }

    // Optimize event handlers
    const optimizeEventHandlers = () => {
      // Use passive listeners for scroll and touch events
      const passiveEvents = ['scroll', 'touchstart', 'touchmove', 'wheel'];
      passiveEvents.forEach(eventType => {
        document.addEventListener(eventType, (e) => {
          // Throttle scroll events
          if (eventType === 'scroll') {
            if (!window.scrollTimeout) {
              window.scrollTimeout = setTimeout(() => {
                window.scrollTimeout = null;
                // Handle scroll
              }, 16); // ~60fps
            }
          }
        }, { passive: true });
      });
    };

    optimizeEventHandlers();
  };

  const optimizeLayout = () => {
    // Reserve space for dynamic content
    const dynamicContainers = document.querySelectorAll('[data-dynamic]');
    dynamicContainers.forEach(container => {
      if (!container.style.minHeight) {
        container.style.minHeight = '200px'; // Reserve space
      }
    });

    // Add aspect ratios to prevent layout shift
    const mediaElements = document.querySelectorAll('img, video, iframe');
    mediaElements.forEach(element => {
      if (!element.style.aspectRatio) {
        const width = element.width || element.getAttribute('width');
        const height = element.height || element.getAttribute('height');
        
        if (width && height) {
          element.style.aspectRatio = `${width} / ${height}`;
        }
      }
    });

    // Optimize font loading to prevent FOUT/FOIT
    if (document.fonts) {
      // Preload critical fonts
      const criticalFonts = [
        'Inter',
        'system-ui'
      ];

      criticalFonts.forEach(fontFamily => {
        document.fonts.load(`1em ${fontFamily}`).then(() => {
          document.body.classList.add(`font-${fontFamily.toLowerCase()}-loaded`);
        });
      });
    }

    // Optimize third-party content
    const thirdPartyContainers = document.querySelectorAll('[data-third-party]');
    thirdPartyContainers.forEach(container => {
      // Add loading placeholder
      if (!container.querySelector('.loading-placeholder')) {
        const placeholder = document.createElement('div');
        placeholder.className = 'loading-placeholder bg-gray-200 animate-pulse';
        placeholder.style.height = container.dataset.expectedHeight || '200px';
        container.appendChild(placeholder);
      }
    });
  };

  // Performance debugging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const logVitals = () => {
        console.table({
          'LCP (ms)': vitals.lcp?.toFixed(0) || 'Not measured',
          'FID (ms)': vitals.fid?.toFixed(0) || 'Not measured',
          'CLS': vitals.cls?.toFixed(3) || 'Not measured',
          'INP (ms)': vitals.inp?.toFixed(0) || 'Not measured'
        });
      };

      const intervalId = setInterval(logVitals, 5000);
      return () => clearInterval(intervalId);
    }
  }, [vitals]);

  return null; // This component doesn't render anything
};

export default CoreWebVitalsOptimizer;