import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AdvancedSEO = () => {
  const location = useLocation();

  useEffect(() => {
    // Page-specific SEO optimizations
    const currentPath = location.pathname;
    
    // Update page title with location-specific optimization
    updatePageTitle(currentPath);
    
    // Update meta description dynamically
    updateMetaDescription(currentPath);
    
    // Add structured data for current page
    addStructuredData(currentPath);
    
    // Optimize for Core Web Vitals
    optimizePerformance();
    
    // Add AI search optimization signals
    addAISearchSignals(currentPath);
    
  }, [location]);

  const updatePageTitle = (path) => {
    const titleMap = {
      '/': 'AI Project Management Service | PMaaS for Startups | 25% Faster Delivery | Orgainse Consulting',
      '/about': 'About Orgainse Consulting | AI-Native Digital Transformation Leaders Since 2025',
      '/services': 'AI-Powered Business Services | PMaaS, Digital Transformation | 340% ROI | Orgainse',
      '/ai-assessment': 'Free AI Readiness Assessment | Discover Your AI Maturity Score | Orgainse Consulting',
      '/roi-calculator': 'AI Transformation ROI Calculator | Calculate 340% ROI | Regional Pricing | Orgainse',
      '/smart-calendar': 'Book Free AI Strategy Session | Expert Consultation | Orgainse Consulting',
      '/contact': 'Contact AI Consulting Experts | Global Offices | India, USA, UK, UAE | Orgainse'
    };

    const title = titleMap[path] || 'AI Business Transformation | Orgainse Consulting';
    document.title = title;
  };

  const updateMetaDescription = (path) => {
    const descriptionMap = {
      '/': 'Leading AI project management service provider offering GPT-powered PMaaS for startups & SMEs. 25% faster delivery, 340% ROI across India, USA, UK, UAE, Australia. Expert AI digital transformation consulting since 2025.',
      '/about': 'Orgainse Consulting: AI-native digital transformation leaders founded in 2025. Serving startups across India, USA, UK, UAE, Australia with GPT-powered project management and 340% ROI guarantee.',
      '/services': 'Comprehensive AI-powered business services: PMaaS, digital transformation, operational optimization, agile coaching, strategy development, risk management. 340% ROI across 6 industries.',
      '/ai-assessment': 'Free AI readiness assessment tool. Discover your company AI maturity score in 5 minutes. Get personalized AI transformation roadmap. No signup required, instant results.',
      '/roi-calculator': 'Calculate your AI transformation ROI with regional pricing. See potential 340% ROI, cost savings, payback period. PPP-adjusted pricing for India, USA, UK, UAE, Australia.',
      '/smart-calendar': 'Book free AI strategy session with experts. Personalized consultation for startups and SMEs. Available across India, USA, UK, UAE, Australia. Schedule instantly.',
      '/contact': 'Contact Orgainse Consulting AI experts. Global offices in Bangalore, Austin. Phone: +91-9740384683. Serving India, USA, UK, UAE, Australia, New Zealand, South Africa.'
    };

    const description = descriptionMap[path] || 'AI-native business transformation consulting with GPT-powered solutions for startups and SMEs.';
    
    // Update existing meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    } else {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      metaDesc.content = description;
      document.head.appendChild(metaDesc);
    }
  };

  const addStructuredData = (path) => {
    // Remove existing structured data to avoid duplicates
    const existingStructuredData = document.querySelectorAll('script[type="application/ld+json"]');
    existingStructuredData.forEach(script => {
      if (script.dataset.dynamic === 'true') {
        script.remove();
      }
    });

    const baseUrl = 'https://www.orgainse.com';
    const currentUrl = `${baseUrl}${path}`;

    let structuredData = [];

    // Page-specific structured data
    switch (path) {
      case '/':
        structuredData = [
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Orgainse Consulting",
            "alternateName": ["OrgAInse Consulting", "Orgainse", "OrgAInse"],
            "url": baseUrl,
            "logo": `${baseUrl}/logo-orgainse-consulting.png`,
            "description": "Leading AI project management service provider offering GPT-powered PMaaS for startups and SMEs with 340% ROI across 7 countries.",
            "foundingDate": "2025",
            "slogan": "AI-Native Business & Digital Transformation",
            "address": [
              {
                "@type": "PostalAddress",
                "streetAddress": "Koramangala",
                "addressLocality": "Bangalore",
                "addressRegion": "Karnataka",
                "postalCode": "560034",
                "addressCountry": "IN"
              }
            ],
            "contactPoint": [
              {
                "@type": "ContactPoint",
                "telephone": "+91-9740384683",
                "contactType": "customer service",
                "availableLanguage": ["en", "hi"],
                "areaServed": ["IN", "US", "GB", "AE", "AU", "NZ", "ZA"]
              }
            ],
            "sameAs": [
              "https://www.linkedin.com/company/orgainse-consulting",
              "https://twitter.com/orgainseconsult"
            ],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "AI Business Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "AI Project Management Service (PMaaS)",
                    "description": "GPT-powered Project Management as a Service for startups"
                  }
                }
              ]
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Orgainse Consulting",
            "url": baseUrl,
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${baseUrl}/search?q={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          }
        ];
        break;

      case '/services':
        structuredData = [
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "AI Project Management Service (PMaaS)",
            "description": "GPT-powered Project Management as a Service delivering 25% faster project completion and 340% ROI for startups and SMEs.",
            "provider": {
              "@type": "Organization",
              "name": "Orgainse Consulting",
              "url": baseUrl
            },
            "serviceType": "Business Consulting",
            "category": "Project Management",
            "areaServed": ["India", "USA", "UK", "UAE", "Australia", "New Zealand", "South Africa"],
            "audience": {
              "@type": "Audience",
              "audienceType": "Startups and SMEs"
            },
            "offers": {
              "@type": "Offer",
              "description": "Comprehensive AI project management solutions",
              "availability": "https://schema.org/InStock"
            }
          }
        ];
        break;

      case '/ai-assessment':
        structuredData = [
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "AI Readiness Assessment Tool",
            "description": "Free AI maturity assessment tool providing personalized recommendations in 5 minutes",
            "url": currentUrl,
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "AI Maturity Scoring",
              "Personalized Recommendations", 
              "Implementation Roadmap",
              "Instant Results"
            ]
          }
        ];
        break;

      case '/contact':
        structuredData = [
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact Orgainse Consulting",
            "description": "Contact AI consulting experts with global offices in India and USA",
            "url": currentUrl,
            "mainEntity": {
              "@type": "Organization",
              "name": "Orgainse Consulting",
              "contactPoint": [
                {
                  "@type": "ContactPoint",
                  "telephone": "+91-9740384683",
                  "contactType": "customer service",
                  "areaServed": ["IN", "US", "GB", "AE", "AU", "NZ", "ZA"],
                  "availableLanguage": ["en", "hi"]
                }
              ],
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Koramangala",
                "addressLocality": "Bangalore",
                "addressRegion": "Karnataka",
                "postalCode": "560034",
                "addressCountry": "IN"
              }
            }
          }
        ];
        break;
    }

    // Add FAQ structured data for all pages
    const faqData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is AI Project Management as a Service (PMaaS)?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PMaaS is our GPT-powered project management service that delivers 25% faster project completion through AI-driven task assignment, milestone prediction, and resource optimization for startups and SMEs."
          }
        },
        {
          "@type": "Question", 
          "name": "What ROI can I expect from AI transformation?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our clients typically achieve 340% ROI through improved efficiency, cost reduction, and revenue growth. Use our free ROI calculator to see specific projections for your business."
          }
        },
        {
          "@type": "Question",
          "name": "Which countries does Orgainse Consulting serve?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We serve startups and SMEs across 7 countries: India, USA, UK, UAE, Australia, New Zealand, and South Africa with offices in Bangalore and Austin."
          }
        }
      ]
    };

    structuredData.push(faqData);

    // Create and append structured data script
    structuredData.forEach((data, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.dynamic = 'true';
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    });
  };

  const optimizePerformance = () => {
    // Preload critical resources
    const criticalResources = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      '/logo-orgainse-consulting.png'
    ];

    criticalResources.forEach(resource => {
      const existingLink = document.querySelector(`link[href="${resource}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'preload';
        if (resource.includes('fonts')) {
          link.as = 'style';
        } else if (resource.includes('.png') || resource.includes('.jpg')) {
          link.as = 'image';
        }
        link.href = resource;
        document.head.appendChild(link);
      }
    });

    // Add performance monitoring
    if ('performance' in window) {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            console.log('FID:', entry.processingStart - entry.startTime);
          }
          if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
            console.log('CLS:', entry.value);
          }
        });
      });

      observer.observe({entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift']});
    }
  };

  const addAISearchSignals = (path) => {
    // Add AI-specific meta tags for better LLM understanding
    const aiMeta = [
      { name: 'topic', content: 'AI project management, digital transformation, business consulting' },
      { name: 'audience', content: 'startups, SMEs, business owners, CTOs, project managers' },
      { name: 'expertise-area', content: 'artificial intelligence, project management, business automation' },
      { name: 'content-type', content: 'business service information' },
      { name: 'geographic-coverage', content: 'India, USA, UK, UAE, Australia, New Zealand, South Africa' }
    ];

    aiMeta.forEach(meta => {
      let existingMeta = document.querySelector(`meta[name="${meta.name}"]`);
      if (existingMeta) {
        existingMeta.setAttribute('content', meta.content);
      } else {
        const metaTag = document.createElement('meta');
        metaTag.name = meta.name;
        metaTag.content = meta.content;
        document.head.appendChild(metaTag);
      }
    });

    // Add page-specific entity information for better AI understanding
    const entityMap = {
      '/': 'AI project management, PMaaS, digital transformation, GPT-powered solutions',
      '/about': 'Orgainse Consulting, founded 2025, Bangalore India, Austin USA',
      '/services': 'AI services, project management, agile coaching, risk management',
      '/ai-assessment': 'AI assessment tool, maturity score, readiness evaluation',
      '/roi-calculator': 'ROI calculator, investment returns, cost savings analysis',
      '/contact': 'contact information, global offices, customer service, technical support'
    };

    const entities = entityMap[path] || 'AI consulting, business transformation';
    let entityMeta = document.querySelector('meta[name="entities"]');
    if (entityMeta) {
      entityMeta.setAttribute('content', entities);
    } else {
      const metaTag = document.createElement('meta');
      metaTag.name = 'entities';
      metaTag.content = entities;
      document.head.appendChild(metaTag);
    }
  };

  return null; // This component doesn't render anything
};

export default AdvancedSEO;