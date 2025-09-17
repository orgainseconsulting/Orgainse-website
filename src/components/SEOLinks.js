import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight } from 'lucide-react';

const SEOLinks = () => {
  const internalLinks = [
    {
      to: "/about",
      text: "About Our AI Consulting Team",
      description: "Learn about our AI transformation experts"
    },
    {
      to: "/services", 
      text: "AI Project Management Services",
      description: "Explore our PMaaS offerings across industries"
    },
    {
      to: "/ai-assessment",
      text: "Free AI Readiness Assessment",
      description: "Evaluate your business AI potential"
    },
    {
      to: "/roi-calculator",
      text: "AI ROI Calculator Tool",
      description: "Calculate your AI transformation ROI"
    },
    {
      to: "/contact",
      text: "Contact AI Experts",
      description: "Get free consultation from our team"
    },
    {
      to: "/smart-calendar",
      text: "Book Strategy Session",
      description: "Schedule your AI transformation planning"
    },
    {
      to: "/services",
      text: "Digital Transformation Consulting",
      description: "Enterprise AI transformation services"
    },
    {
      to: "/services",
      text: "GPT-Powered PMaaS Solutions",
      description: "Automated project management systems"
    },
    {
      to: "/ai-assessment",
      text: "AI Maturity Assessment",
      description: "Comprehensive business readiness evaluation"
    },
    {
      to: "/roi-calculator",
      text: "PMaaS Investment Calculator",
      description: "Business case development tools"
    },
    {
      to: "/contact",
      text: "Schedule Free Consultation",
      description: "Expert AI strategy discussion"
    },
    {
      to: "/about",
      text: "AI Innovation Methodology",
      description: "Our proven transformation approach"
    }
  ];

  const externalLinks = [
    {
      href: "https://www.gartner.com/en/newsroom/press-releases/2023-03-23-gartner-survey-finds-organizations-are-slow-to-advance-in-ai-maturity",
      text: "Gartner AI Maturity Research",
      description: "Latest insights on AI adoption in enterprise"
    },
    {
      href: "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai-in-2023-generative-ais-breakout-year",
      text: "McKinsey State of AI 2024",
      description: "Comprehensive AI transformation report"
    },
    {
      href: "https://www.projectmanagement.org/",
      text: "Project Management Institute",
      description: "Global project management standards and best practices"
    },
    {
      href: "https://openai.com/enterprise",
      text: "OpenAI Enterprise Solutions", 
      description: "Enterprise AI tools and capabilities"
    }
  ];

  return (
    <div className="py-12 bg-gradient-to-br from-slate-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Explore AI Transformation Resources
          </h2>
          <p className="text-lg text-slate-700 max-w-3xl mx-auto">
            Discover comprehensive AI project management solutions, expert insights, and industry-leading resources to accelerate your digital transformation journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Internal Links Section */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <ArrowRight className="h-6 w-6 mr-3 text-orange-500" />
              Our AI Services & Tools
            </h3>
            <div className="space-y-4">
              {internalLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 group"
                >
                  <h4 className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {link.text}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    {link.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* External Links Section */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <ExternalLink className="h-6 w-6 mr-3 text-green-500" />
              Industry Resources & Research
            </h3>
            <div className="space-y-4">
              {externalLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-white rounded-lg border border-slate-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 group"
                >
                  <h4 className="font-semibold text-slate-900 group-hover:text-green-600 transition-colors flex items-center">
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

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Start Your AI Transformation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/ai-assessment"
              className="inline-flex items-center px-8 py-3 bg-white border-2 border-orange-500 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-all"
            >
              Take Free Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOLinks;