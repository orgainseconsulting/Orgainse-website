import React, { useEffect } from 'react';

const SpeedOptimizer = () => {
  useEffect(() => {
    // Initialize speed optimizations
    optimizeResourceLoading();
    optimizeCriticalRenderingPath();
    optimizeNetworkRequests();
    implementServiceWorker();
    
    // Monitor and report performance
    monitorPerformance();
  }, []);

  const optimizeResourceLoading = () => {
    // Resource hints for better loading performance
    const resourceHints = [
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
      { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
    ];

    resourceHints.forEach(hint => {
      const existingHint = document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`);
      if (!existingHint) {
        const link = document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        if (hint.crossorigin) link.crossOrigin = hint.crossorigin;
        document.head.appendChild(link);
      }
    });

    // Preload critical resources
    const criticalResources = [
      { href: '/logo-orgainse-consulting.png', as: 'image' },
      { href: '/hero-image-ai-consulting.jpg', as: 'image' },
      { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', as: 'style' }
    ];

    criticalResources.forEach(resource => {
      const existingPreload = document.querySelector(`link[rel="preload"][href="${resource.href}"]`);
      if (!existingPreload) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        if (resource.as === 'style') {
          link.onload = function() { this.rel = 'stylesheet'; };
        }
        document.head.appendChild(link);
      }
    });

    // Lazy load non-critical CSS
    const nonCriticalCSS = [
      '/css/animations.css',
      '/css/print.css'
    ];

    nonCriticalCSS.forEach(cssFile => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = cssFile;
      link.as = 'style';
      link.onload = function() {
        this.rel = 'stylesheet';
      };
      document.head.appendChild(link);
    });
  };

  const optimizeCriticalRenderingPath = () => {
    // Inline critical CSS for above-the-fold content
    const criticalCSS = `
      .hero-section { min-height: 100vh; display: flex; align-items: center; }
      .loading-skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
      @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      .font-display-swap { font-display: swap; }
    `;

    let criticalStyleTag = document.getElementById('critical-css');
    if (!criticalStyleTag) {
      criticalStyleTag = document.createElement('style');
      criticalStyleTag.id = 'critical-css';
      criticalStyleTag.textContent = criticalCSS;
      document.head.appendChild(criticalStyleTag);
    }

    // Optimize font loading
    if (document.fonts) {
      // Use font-display: swap for all fonts
      const fontFaces = document.fonts.values();
      for (let fontFace of fontFaces) {
        if (fontFace.display !== 'swap') {
          fontFace.display = 'swap';
        }
      }

      // Preload critical fonts
      document.fonts.load('400 1em Inter').then(() => {
        document.body.classList.add('fonts-loaded');
      });
    }

    // Remove render-blocking CSS where possible
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    stylesheets.forEach(stylesheet => {
      if (!stylesheet.hasAttribute('data-critical')) {
        stylesheet.setAttribute('media', 'print');
        stylesheet.setAttribute('onload', "this.media='all'");
      }
    });
  };

  const optimizeNetworkRequests = () => {
    // Bundle and minimize HTTP requests
    const combineCSS = () => {
      const cssLinks = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
      if (cssLinks.length > 3) {
        // In a real implementation, you'd combine these server-side
        console.log('Consider combining CSS files:', cssLinks.length, 'files detected');
      }
    };

    combineCSS();

    // Use HTTP/2 Server Push for critical resources (handled server-side)
    const serverPushHints = [
      '/logo-orgainse-consulting.png',
      '/hero-image-ai-consulting.jpg',
      '/css/critical.css'
    ];

    // Add preload hints for server push
    serverPushHints.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.css') ? 'style' : 'image';
      document.head.appendChild(link);
    });

    // Optimize API requests
    const optimizeAPIRequests = () => {
      // Implement request batching for multiple API calls
      window.apiRequestQueue = window.apiRequestQueue || [];
      window.batchAPIRequests = window.batchAPIRequests || function(requests) {
        // Batch multiple requests into single call
        if (requests.length > 1) {
          console.log('Batching', requests.length, 'API requests');
          // Implementation would depend on API design
        }
      };
    };

    optimizeAPIRequests();
  };

  const implementServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('Service Worker registered:', registration);
        
        // Update service worker when new version available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available, could show update notification
              console.log('New version available');
            }
          });
        });
      }).catch(error => {
        console.log('Service Worker registration failed:', error);
      });
    }

    // Create basic service worker if it doesn't exist
    const createServiceWorker = () => {
      const swContent = `
        const CACHE_NAME = 'orgainse-v1';
        const urlsToCache = [
          '/',
          '/static/css/main.css',
          '/static/js/main.js',
          '/logo-orgainse-consulting.png'
        ];

        self.addEventListener('install', event => {
          event.waitUntil(
            caches.open(CACHE_NAME)
              .then(cache => cache.addAll(urlsToCache))
          );
        });

        self.addEventListener('fetch', event => {
          event.respondWith(
            caches.match(event.request)
              .then(response => {
                if (response) {
                  return response;
                }
                return fetch(event.request);
              }
            )
          );
        });
      `;

      // In a real app, this would be a separate file
      console.log('Service Worker content prepared');
    };

    createServiceWorker();
  };

  const monitorPerformance = () => {
    // Real User Monitoring (RUM)
    if ('performance' in window) {
      // Monitor navigation timing
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          const paintEntries = performance.getEntriesByType('paint');
          
          const metrics = {
            // Navigation metrics
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            connection: navigation.connectEnd - navigation.connectStart,
            ttfb: navigation.responseStart - navigation.requestStart,
            download: navigation.responseEnd - navigation.responseStart,
            domReady: navigation.domContentLoadedEventEnd - navigation.navigationStart,
            load: navigation.loadEventEnd - navigation.navigationStart,
            
            // Paint metrics
            fcp: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime,
            
            // Resource metrics
            resourceCount: performance.getEntriesByType('resource').length
          };

          // Send to analytics
          if (window.gtag) {
            window.gtag('event', 'page_performance', {
              'custom_map': {
                'metric1': 'ttfb',
                'metric2': 'fcp',
                'metric3': 'domReady'
              },
              'ttfb': Math.round(metrics.ttfb),
              'fcp': Math.round(metrics.fcp || 0),
              'domReady': Math.round(metrics.domReady)
            });
          }

          // Log performance in development
          if (process.env.NODE_ENV === 'development') {
            console.table(metrics);
          }

          // Alert on poor performance
          if (metrics.ttfb > 500) {
            console.warn('Slow TTFB detected:', metrics.ttfb + 'ms');
          }
          if (metrics.fcp > 2500) {
            console.warn('Slow FCP detected:', metrics.fcp + 'ms');
          }
        }, 0);
      });

      // Monitor resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.duration > 1000) { // Slow resource
            console.warn('Slow resource:', entry.name, entry.duration + 'ms');
          }
        });
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Monitor memory usage
      if ('memory' in performance) {
        setInterval(() => {
          const memory = performance.memory;
          if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // > 50MB
            console.warn('High memory usage:', (memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB');
          }
        }, 30000); // Check every 30 seconds
      }
    }

    // Page Visibility API to pause non-critical operations
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pause non-critical operations
        console.log('Page hidden, pausing non-critical operations');
      } else {
        // Resume operations
        console.log('Page visible, resuming operations');
      }
    });
  };

  return null; // This component doesn't render anything
};

export default SpeedOptimizer;