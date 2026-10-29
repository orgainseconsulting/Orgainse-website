import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight } from 'lucide-react';

const SEOLinks = () => {
  const internalLinks = [
    {
      to: "/about",
      text: "About Orgainse",
      description: "How we work, who we work with, and what we deliberately do not claim"
    },
    {
      to: "/services",
      text: "Project Management as a Service",
      description: "Structured project leadership, governance, reporting cadence and executive visibility"
    },
    {
      to: "/services",
      text: "Delivery and workflow transformation",
      description: "Process mapping, ownership definition, governance design and adoption support"
    },
    {
      to: "/services",
      text: "Delivery and operational governance",
      description: "Operating rhythms, risk and action registers, reporting your leadership can rely on"
    },
    {
      to: "/products",
      text: "ORQYNE delivery-governance workspace",
      description: "Portfolios, registers, reporting and operating rhythm in one shared workspace"
    },
    {
      to: "/services",
      text: "Healthcare Revenue Intelligence Advisory",
      description: "Advisory and analytics only — no billing, coding or operational revenue cycle delivery"
    },
    {
      to: "/ai-assessment",
      text: "Execution readiness assessment",
      description: "A directional view of governance, data and adoption readiness — not a certification"
    },
    {
      to: "/roi-calculator",
      text: "Delivery scenario calculator",
      description: "Model potential time, capacity and cost effects using your own assumptions"
    },
    {
      to: "/smart-calendar",
      text: "Book a discovery call",
      description: "Bring one execution problem to a focused 30-minute conversation"
    },
    {
      to: "/contact",
      text: "Contact Orgainse",
      description: "Austin, Texas (headquarters) and Bengaluru, India (corporate office)"
    },
    {
      to: "/blog",
      text: "Delivery governance insights",
      description: "Vendor-neutral notes on execution visibility and governance practice"
    },
    {
      to: "/newsletter",
      text: "The Orgainse Pulse",
      description: "Fortnightly briefings on delivery execution and governance"
    }
  ];

  const externalLinks = [
    {
      href: "https://www.pmi.org/",
      text: "Project Management Institute",
      description: "Global project management standards and practice guidance"
    },
    {
      href: "https://www.axelos.com/certifications/propath/prince2-project-management",
      text: "PRINCE2 project governance",
      description: "Stage-gated project governance and controlled delivery method"
    },
    {
      href: "https://www.iso.org/standard/50003.html",
      text: "ISO 21500 project management guidance",
      description: "International guidance on project management concepts and processes"
    },
    {
      href: "https://www.scaledagileframework.com/",
      text: "Scaled Agile Framework",
      description: "Coordination patterns for multi-team delivery at scale"
    },
    {
      href: "https://www.gartner.com/en/information-technology",
      text: "Gartner IT research",
      description: "Independent research on delivery, portfolio and technology operations"
    },
    {
      href: "https://www.mckinsey.com/capabilities/operations/how-we-help-clients",
      text: "McKinsey operations insights",
      description: "Published research on operating models and execution performance"
    },
    {
      href: "https://www.forrester.com/research/",
      text: "Forrester research library",
      description: "Analyst perspectives on technology and delivery operations"
    },
    {
      href: "https://www.nist.gov/itl/ai-risk-management-framework",
      text: "NIST AI Risk Management Framework",
      description: "Reference framework for governing Artificial Intelligence use responsibly"
    },
    {
      href: "https://gdpr.eu/",
      text: "General Data Protection Regulation",
      description: "Reference material on European data protection obligations"
    },
    {
      href: "https://www.hhs.gov/hipaa/index.html",
      text: "HIPAA (US Department of Health & Human Services)",
      description: "Official reference for United States healthcare data obligations"
    },
    {
      href: "https://www.hfma.org/",
      text: "Healthcare Financial Management Association",
      description: "Revenue cycle and healthcare finance practice resources"
    },
    {
      href: "https://www.pmi.org/disciplined-agile",
      text: "Disciplined Agile toolkit",
      description: "Context-driven guidance for choosing a way of working"
    }
  ];

  return (
    <div className="py-12 bg-gradient-to-br from-slate-50 via-white to-blue-50" data-testid="seo-links-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="font-outfit text-2xl sm:text-3xl font-bold text-slate-900 mb-4 tracking-[-0.02em]">
            Explore delivery governance resources
          </h2>
          <p className="text-base text-slate-700 max-w-3xl">
            Our services, tools and reference material for teams working on execution visibility,
            delivery governance and practical Artificial Intelligence adoption.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="font-outfit text-xl font-bold text-slate-900 mb-6 flex items-center">
              <ArrowRight className="h-5 w-5 mr-3 text-blue-500" />
              Services &amp; tools
            </h3>
            <div className="space-y-4">
              {internalLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  data-testid={`seo-internal-link-${index}`}
                  className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
                >
                  <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {link.text}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    {link.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-outfit text-xl font-bold text-slate-900 mb-6 flex items-center">
              <ExternalLink className="h-5 w-5 mr-3 text-blue-500" />
              Standards &amp; independent research
            </h3>
            <div className="space-y-4">
              {externalLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`seo-external-link-${index}`}
                  className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
                >
                  <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center">
                    {link.text}
                    <ExternalLink className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    {link.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Link
              to="/contact"
              data-testid="seo-links-contact-cta"
              className="inline-flex items-center px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full shadow-[0_12px_34px_-14px_rgba(15,23,42,0.6)] transition-colors duration-200"
            >
              Book a discovery call
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/ai-assessment"
              data-testid="seo-links-assessment-cta"
              className="inline-flex items-center px-7 py-3.5 bg-white border border-slate-300 text-slate-900 font-semibold rounded-full hover:border-slate-400 transition-colors duration-200"
            >
              Take the readiness assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOLinks;
