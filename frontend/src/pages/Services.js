import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  Brain,
  CheckCircle,
  Globe,
  Minus,
  Plus,
  Shield,
  Target,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { api } from "../lib/api";
import ServicePopup from "../components/ServicePopup";
import SocialShare from "../components/SocialShare";
import SEOLinks from "../components/SEOLinks";
import SEOContent from "../components/SEOContent";
import SEOHead from "../components/SEOHead";
import GridBackdrop from "../components/brand/GridBackdrop";
import { useCalendly } from "../context/CalendlyContext";

const BACKEND_URL = (typeof window !== 'undefined' && window.location?.origin)
  ? window.location.origin
  : (process.env.REACT_APP_BACKEND_URL || "");

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const { openCalendly } = useCalendly();

  // Backend URL for API calls (same-origin to avoid stale Vercel aliases)
  const BACKEND_URL = (typeof window !== 'undefined' && window.location?.origin)
    ? window.location.origin
    : (process.env.REACT_APP_BACKEND_URL || '');

  const services = [
    {
      id: 'pmaas',
      title: "Project Management as a Service (PMaaS)",
      description: "Add structured project leadership without building a full internal Project Management Office. Orgainse supports planning, governance, reporting cadence, risk and dependency management, stakeholder communication, and executive visibility. ORQYNE can be configured as the shared delivery workspace for the engagement.",
      features: [
        "Planning, governance and reporting cadence",
        "Risk, assumption, issue and dependency management",
        "Stakeholder communication and executive visibility",
        "ORQYNE configured as the shared delivery workspace"
      ],
      icon: Target,
      keywords: "Project Management as a Service, PMaaS, delivery governance, project leadership, executive reporting",
      gradient: "from-blue-600 to-violet-600",
      detailedInfo: {
        whatItDoes: "Orgainse provides the project leadership layer your delivery needs without you having to stand up a full internal Project Management Office. We take responsibility for planning, the reporting rhythm, risk and dependency management, stakeholder communication, and the executive view of delivery health.",
        whyChooseUs: "The engagement is designed to move from recommendation to an operating workflow. Owners, controls, reporting and escalation paths are defined and then actually run, rather than handed over as a document.",
        whatYouGet: "An agreed operating model with defined roles and responsibilities, a reporting cadence, RAID registers, decision and approval records, resource and cost visibility, and an executive view of delivery health. Where useful, ORQYNE is configured as the shared workspace for the engagement.",
        benefits: [
          "Structured project leadership without a permanent hire",
          "One reporting rhythm across projects and stakeholders",
          "Risks, assumptions, issues and dependencies tracked with owners",
          "Decisions and approvals recorded rather than remembered",
          "Clearer resource, cost and vendor visibility",
          "Executive reporting that supports decisions"
        ],
        industries: ["Information Technology Services Firms", "Software Delivery Teams", "Startups and Growing Businesses"]
      },
      productLink: {
        href: "/products",
        label: "Delivered with ORQYNE",
        tagline: "Run the engagement in a governed workspace with projects, RAID registers, decisions and reporting in one place. See the platform →"
      }
    },
    {
      id: 'ai-workflow-transformation',
      title: "Artificial Intelligence and Workflow Transformation",
      description: "Identify where Artificial Intelligence, automation, and workflow redesign can remove friction or improve decision quality. We map current processes, identify high-value opportunities, define human approval points, and establish a practical implementation roadmap before technology is introduced.",
      features: [
        "Current-state process and handoff mapping",
        "High-value opportunity identification",
        "Human approval points and governance design",
        "Practical, sequenced implementation roadmap"
      ],
      icon: Brain,
      keywords: "AI workflow transformation, process redesign, automation opportunity assessment, human in the loop governance",
      gradient: "from-blue-600 to-violet-600",
      detailedInfo: {
        whatItDoes: "We map how work actually moves through your organisation, then identify where Artificial Intelligence, automation, or plain workflow redesign would remove friction or improve the quality of a decision. Technology is introduced only where it improves the operating model.",
        whyChooseUs: "The starting point is the business outcome and the workflow, not the tool. Human approval points, data boundaries, and review responsibilities are designed in from the beginning rather than retrofitted after an incident.",
        whatYouGet: "A current-state process map, a prioritised list of opportunities with the reasoning behind each, the target workflow with defined approval points, and a sequenced implementation roadmap with success measures agreed before build begins.",
        benefits: [
          "Clear view of where work leaks time and quality",
          "Opportunities prioritised by business value, not novelty",
          "Human review retained for material decisions",
          "Target workflow with named owners",
          "Sequenced roadmap instead of a big-bang programme",
          "Success measures agreed before implementation"
        ],
        industries: ["Information Technology Services Firms", "Cross-Functional Operating Teams", "Startups and Growing Businesses"]
      }
    },
    {
      id: 'delivery-governance',
      title: "Delivery and Operational Governance",
      description: "Create a consistent operating rhythm across projects, teams, and business functions. This includes portfolio visibility, responsibilities, escalation paths, risks, assumptions, issues, dependencies, decisions, resource visibility, cost oversight, and executive reporting.",
      features: [
        "Portfolio visibility and delivery health reporting",
        "Responsibilities, escalation paths and decision rights",
        "RAID registers with owners and review cadence",
        "Resource, cost and vendor oversight"
      ],
      icon: Shield,
      keywords: "delivery governance, portfolio visibility, RAID management, operating cadence, executive reporting",
      gradient: "from-blue-600 to-violet-600",
      detailedInfo: {
        whatItDoes: "We establish one operating rhythm across projects, teams, and business functions so that leaders can see what is on track, what is blocked, what needs a decision, and where delivery is drifting.",
        whyChooseUs: "Most reporting consumes time without producing reliable decision context. We design the smallest governance model that produces trustworthy information, then run it until it is habit.",
        whatYouGet: "A defined governance model covering portfolio visibility, responsibilities, escalation paths, RAID registers, decision records, resource and cost oversight, and an executive reporting pack with an agreed review schedule.",
        benefits: [
          "One view of portfolio and delivery health",
          "Clear ownership and escalation paths",
          "Risks and dependencies surfaced earlier",
          "Decisions recorded with context",
          "Cost and resource visibility for leadership",
          "Reporting that shortens meetings rather than filling them"
        ],
        industries: ["Information Technology Services Firms", "Software Delivery Teams", "Cross-Functional Operating Teams"]
      }
    },
    {
      id: 'orqyne-implementation',
      title: "ORQYNE Implementation and Adoption",
      description: "Configure ORQYNE around the way your organisation actually operates. We support workspace design, roles and access, workflow configuration, work import, templates, governance controls, integrations, onboarding, and adoption reviews.",
      features: [
        "Workspace design, roles and access",
        "Workflow configuration, templates and governance controls",
        "Structured work import and validation",
        "Onboarding, integrations and adoption reviews"
      ],
      icon: Zap,
      keywords: "ORQYNE implementation, delivery governance platform rollout, workspace configuration, adoption support",
      gradient: "from-blue-600 to-violet-600",
      detailedInfo: {
        whatItDoes: "We configure ORQYNE around your operating model rather than handing over an empty platform: terminology, roles and access, modules, workflows, templates, imports, integrations, and the governance controls that keep the workspace trustworthy.",
        whyChooseUs: "Product and service work together. Customers are not left to configure a complex operating system alone, and adoption is reviewed against real usage rather than assumed after go-live.",
        whatYouGet: "A configured workspace, validated imports of existing work, templates and workflows that match how your teams operate, connected systems where supported, onboarding for each role, and scheduled adoption reviews.",
        benefits: [
          "Configuration that matches how your teams actually work",
          "Existing work imported and reviewed before go-live",
          "Roles, access and governance controls set up correctly",
          "Onboarding tailored to each role",
          "Integrations confirmed during scoping, not assumed",
          "Adoption reviewed on a defined schedule"
        ],
        industries: ["Information Technology Services Firms", "Software Delivery Teams", "Cross-Functional Operating Teams"]
      },
      productLink: {
        href: "/products",
        label: "About ORQYNE",
        tagline: "Two purpose-built experiences: IT Services and Software, and Canvas Business Management. See the platform →"
      }
    },
    {
      id: 'ai-strategy-readiness',
      title: "Artificial Intelligence Strategy and Readiness",
      description: "Determine where Artificial Intelligence can create value before committing significant budget. Orgainse assesses business priorities, process maturity, data availability, operating risk, governance requirements, and adoption readiness to develop a sequenced implementation plan.",
      features: [
        "Business priority and process maturity assessment",
        "Data availability and operating risk review",
        "Governance and adoption readiness review",
        "Sequenced implementation plan with success measures"
      ],
      icon: Globe,
      keywords: "AI readiness assessment, AI strategy consulting, data readiness, AI governance, adoption readiness",
      gradient: "from-blue-600 to-violet-600",
      detailedInfo: {
        whatItDoes: "We assess where Artificial Intelligence would create value for your organisation and, just as importantly, where it would not — reviewing business priorities, process maturity, data availability, operating risk, governance requirements, and adoption readiness.",
        whyChooseUs: "The output is a decision, not a demonstration. You get a clear view of what is worth funding now, what should wait, and what needs to be fixed in the process or the data first.",
        whatYouGet: "A readiness view across strategy, process, data, governance, technology and adoption; a prioritised opportunity list; the risks and controls that apply; and a sequenced implementation plan with defined success measures.",
        benefits: [
          "Evidence before budget commitment",
          "Priorities separated from experiments",
          "Data and process gaps identified early",
          "Governance requirements defined up front",
          "Adoption risk assessed alongside technology",
          "A plan sequenced by value and readiness"
        ],
        industries: ["Startups and Growing Businesses", "Information Technology Services Firms", "Cross-Functional Operating Teams"]
      }
    },
    {
      id: 'healthcare-revenue-intelligence',
      title: "Healthcare Revenue Intelligence Advisory",
      description: "Improve visibility into revenue performance, denial patterns, payer behaviour, operating controls, and executive reporting. Each engagement is separately scoped for data handling, regulatory considerations, and advisory boundaries. Orgainse does not position this service as operational medical billing or coding.",
      features: [
        "Revenue performance assessment",
        "Denial pattern and trend analysis",
        "Payer behaviour and contract advisory",
        "Revenue governance, controls and executive reporting"
      ],
      icon: Shield,
      keywords: "healthcare revenue intelligence advisory, denial pattern analysis, payer behaviour analytics, revenue governance advisory",
      gradient: "from-blue-600 to-violet-600",
      detailedInfo: {
        whatItDoes: "Revenue performance depends on visibility as much as on billing accuracy. This service provides an independent advisory and analytics layer over your existing operations: where revenue performance is weakening, how denial patterns are shifting, how payer behaviour is affecting outcomes, and which controls and reports leadership is missing.",
        whyChooseUs: "Independence is the point. Orgainse is not a billing or coding vendor, so the analysis is not shaped by an operational contract. We work alongside your internal teams and existing vendors rather than in place of them.",
        whatYouGet: "Executive-ready deliverables across revenue performance assessment, denial intelligence, payer and contract advisory, governance and process advisory, Artificial Intelligence readiness, and vendor oversight. Each engagement is separately scoped for data handling, regulatory considerations, and advisory boundaries.",
        rightFit: "Organisations that already have revenue cycle operations in place — internal or outsourced — and need an independent view of what those operations are delivering, and where performance can be strengthened through better governance, analytics, or technology readiness.",
        notRightFit: "Organisations seeking outsourced billing, coding, accounts receivable follow-up, claims processing, or operational revenue cycle delivery. Orgainse does not provide these services.",
        benefits: [
          "Independent visibility into revenue performance",
          "Denial pattern analysis with practical next steps",
          "Payer behaviour and contract performance insight",
          "Executive reporting and key performance indicator design",
          "Artificial Intelligence readiness view for revenue operations",
          "Vendor oversight and accountability advisory"
        ],
        notIncluded: [
          "Medical billing or claims submission",
          "Medical coding or clinical documentation",
          "Accounts receivable follow-up or collections",
          "Denial follow-up or appeal submission",
          "Payment posting or remittance processing",
          "Patient billing or collections",
          "Onshore or offshore revenue cycle staffing",
          "Outsourced revenue cycle operations of any kind"
        ],
        whoWeServe: [
          "Physician groups and multi-specialty practices",
          "Regional hospital systems and health networks",
          "Ambulatory surgical centres and clinical laboratories",
          "Independent practice associations and accountable care organisations",
          "Value-based care and risk-bearing organisations",
          "Healthcare technology companies and health plans with provider analytics requirements"
        ],
        industries: ["Healthcare Revenue Intelligence Advisory", "Hospital Systems and Physician Groups", "Value-Based Care Organisations"]
      }
    },
  ];

  // Enhanced scroll management for popup
  const [scrollPosition, setScrollPosition] = useState(0);

  const openServicePopup = (service) => {
    console.log('Opening popup for service:', service.title, 'ID:', service.id); // Debug log
    setSelectedService(service);
    setIsPopupOpen(true);
    setShowContactForm(false);
    setIsSubmitted(false);
    // No scroll lock - let page scroll naturally and popup moves with it
  };

  const closeServicePopup = () => {
    setIsPopupOpen(false);
    setSelectedService(null);
    setShowContactForm(false);
    setIsSubmitted(false);
    setFormData({ name: '', email: '', phone: '', company: '', message: '' });
    // No scroll restoration needed
  };

  const handleContactFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.contact({
        leadType: 'Service Inquiry',
        service_name: selectedService?.title || 'Unknown Service',
        name: formData.name || '',
        email: formData.email || '',
        company: formData.company || '',
        phone: formData.phone || '',
        message: formData.message || `Interested in ${selectedService?.title || 'a service'}`,
        source: window.location.origin + '/services',
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting service inquiry:', error);
      toast.error(error.message || 'Error submitting inquiry. Please try again.');
    }
  };

  // Service-specific inquiry tracking (popup CTA)
  const handleServiceInquiry = async (serviceId, serviceName) => {
    try {
      await api.contact({
        leadType: 'Service Inquiry',
        service_name: serviceName,
        name: 'Service Interest',
        email: '',
        company: '',
        phone: '',
        message: `Interested in ${serviceName} service`,
        source: window.location.origin + '/services-popup',
      });
    } catch (error) {
      console.error('Error tracking service inquiry:', error);
    } finally {
      window.location.href = `/smart-calendar?service=${encodeURIComponent(serviceName)}`;
    }
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        title="PMaaS, PMO and Delivery Governance Services | Orgainse"
        description="Outsourced project management (PMaaS), PMO setup, delivery and operational governance, workflow transformation, AI readiness and ORQYNE implementation, scoped for teams worldwide."
        canonical="https://www.orgainse.com/services"
        keywords="Project Management as a Service, PMaaS, delivery governance, workflow transformation, ORQYNE implementation, AI readiness, healthcare revenue intelligence advisory"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            serviceType: "Delivery consulting and Project Management as a Service",
            provider: { "@type": "Organization", name: "Orgainse", url: "https://www.orgainse.com/" },
            areaServed: ["United States", "India", "United Kingdom", "Ireland", "Germany", "France", "Netherlands", "United Arab Emirates", "Saudi Arabia", "Qatar", "Australia", "New Zealand", "South Africa"],
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Orgainse Services",
              itemListElement: services.map((s) => ({
                "@type": "Offer",
                itemOffered: { "@type": "Service", name: s.title, description: s.description }
              }))
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              { "@type": "Question", name: "What is Project Management as a Service?", acceptedAnswer: { "@type": "Answer", text: "Project Management as a Service (PMaaS) gives an organisation access to structured project leadership, governance, reporting, risk management, stakeholder communication, and delivery support without immediately building a full internal Project Management Office." } },
              { "@type": "Question", name: "How does an Orgainse engagement start?", acceptedAnswer: { "@type": "Answer", text: "With a focused discovery session on one important execution problem, clarifying the desired outcome, current workflow, decision owners, operating constraints, and the most practical next step." } },
              { "@type": "Question", name: "Does Orgainse guarantee delivery improvement or Return on Investment?", acceptedAnswer: { "@type": "Answer", text: "No. Outcomes depend on scope, data quality, leadership decisions, adoption, integrations, operating conditions, and customer responsibilities. Success measures are agreed before work begins and reviewed through the engagement." } },
              { "@type": "Question", name: "What is included in Healthcare Revenue Intelligence Advisory?", acceptedAnswer: { "@type": "Answer", text: "Advisory and analytics on revenue performance, denial patterns, payer behaviour, operating controls, and executive reporting. It excludes medical billing, coding, accounts receivable follow-up, claims processing, collections and revenue cycle staffing." } },
              { "@type": "Question", name: "Can Orgainse work with our existing tools?", acceptedAnswer: { "@type": "Answer", text: "Yes. Orgainse can improve the operating model around an existing tool such as Jira, Asana or monday.com, introduce ORQYNE for selected workflows, or assess whether consolidation is justified." } },
              { "@type": "Question", name: "How is pricing determined?", acceptedAnswer: { "@type": "Answer", text: "Pricing depends on scope, engagement duration, services involved, operating support required and, where ORQYNE is included, users, enabled modules, implementation requirements, AI usage model and integration scope. Terms are confirmed in writing before work begins." } }
            ]
          }
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden py-16 lg:py-24" data-testid="services-hero">
        <GridBackdrop />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 animate-fade-in">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white/70 backdrop-blur-sm text-[11px] uppercase tracking-[0.18em] text-slate-500 shadow-sm">
            Consulting · PMaaS · ORQYNE-Enabled Delivery
          </span>

          <h1 className="mt-6 font-outfit text-4xl sm:text-5xl font-bold leading-[1.06] tracking-[-0.03em] max-w-3xl">
            <span className="text-slate-900">Services Built Around Execution, </span>
            <span className="text-slate-400">Not Activity</span>
          </h1>

          <h2 className="mt-6 text-base md:text-lg font-semibold text-slate-700 max-w-2xl leading-relaxed">
            Start with the business outcome that matters most.
          </h2>

          <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Orgainse combines focused advisory, implementation, and operating support so that strategy is
            translated into visible, repeatable execution. Engagements are scoped around one measurable
            problem — a critical project, a growing delivery portfolio, or an organisation-wide workflow issue —
            and success measures are agreed before work begins.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button
              onClick={openCalendly}
              data-testid="services-hero-book-btn"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors duration-200 shadow-[0_12px_34px_-14px_rgba(15,23,42,0.6)]"
            >
              Book an Execution Discovery Call
              <ArrowRight className="h-[15px] w-[15px] transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <Link
              to="/products"
              data-testid="services-hero-orqyne-btn"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors"
            >
              Explore ORQYNE
            </Link>
          </div>

          <div className="mt-14 border-t border-slate-200 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              "Information Technology Services and Software",
              "Startups, Small and Medium-Sized Enterprises",
              "Healthcare Revenue Intelligence Advisory",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center shrink-0">
                  <CheckCircle className="h-[14px] w-[14px] text-blue-600" />
                </span>
                <p className="font-outfit font-semibold text-slate-900 text-[15px] leading-snug pt-1.5">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Services Grid Layout */}
      <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] mb-6 text-slate-900">
              Six ways we improve execution
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Each service can run on its own or as part of a wider engagement. Select any service to see what it
              covers, what you receive, and where the scope boundaries sit.
            </p>
          </div>

          {/* Responsive Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service, index) => (
              <div 
                key={service.id || index} 
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Service Card - Responsive */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-100 h-full flex flex-col">
                  
                  {/* Card Header - Responsive */}
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
                    <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-r ${service.gradient} shadow-md self-start`}>
                      <service.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">
                      {service.title}
                    </h3>
                  </div>

                  {/* Service Description */}
                  <p className="text-slate-600 leading-relaxed mb-4 sm:mb-6 flex-1 text-sm sm:text-base">
                    {service.description}
                  </p>

                  {/* Key Features */}
                  <div className="space-y-2 mb-5 mt-auto">
                    {service.features.slice(0, 3).map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-2">
                        <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-slate-600 leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Learn More Button - Responsive */}
                  <button 
                    onClick={() => openServicePopup(service)}
                    className="w-full px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full shadow-[0_10px_30px_-14px_rgba(15,23,42,0.6)] transition-colors duration-200 text-sm"
                  >
                    <span className="flex items-center justify-center">
                      Learn More
                      <ArrowRight className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Import and use the new ServicePopup component */}
          <ServicePopup
            isOpen={isPopupOpen}
            service={selectedService}
            showContactForm={showContactForm}
            setShowContactForm={setShowContactForm}
            isSubmitted={isSubmitted}
            formData={formData}
            setFormData={setFormData}
            onClose={closeServicePopup}
            onSubmit={handleContactFormSubmit}
            openCalendly={openCalendly}
          />
        </div>

        {/* Creative Section Separator */}
        <div className="mt-20 mb-16">
          <div className="max-w-6xl mx-auto">
            {/* AI-Themed Compact Separator */}
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center space-x-2">
                {/* AI Circuit Pattern */}
                <div className="w-4 h-0.5 bg-gradient-to-r from-blue-600 to-violet-600"></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-0.5 bg-gradient-to-r from-blue-600 to-violet-600"></div>
                
                {/* AI Brain Icon */}
                <div className="relative">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-violet-600 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-gradient-to-br from-blue-600 to-violet-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                
                {/* AI Circuit Pattern */}
                <div className="w-2 h-0.5 bg-gradient-to-r from-blue-600 to-violet-600"></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse animation-delay-500"></div>
                <div className="w-4 h-0.5 bg-gradient-to-r from-blue-600 to-violet-600"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* FAQ Section for SEO */}
        <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto">
                Scope, engagement model, boundaries, and how pricing is determined.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  category: "Scope and Engagement",
                  questions: [
                    {
                      question: "What does Orgainse actually do?",
                      answer: "Orgainse helps organisations improve project delivery, workflow visibility, operational governance, and practical Artificial Intelligence adoption. Services include Project Management as a Service, Artificial Intelligence and workflow transformation, delivery and operational governance, ORQYNE implementation and adoption, Artificial Intelligence strategy and readiness, and separately scoped Healthcare Revenue Intelligence Advisory."
                    },
                    {
                      question: "What is Project Management as a Service?",
                      answer: "Project Management as a Service (PMaaS) gives an organisation access to structured project leadership, governance, reporting, risk management, stakeholder communication, and delivery support without immediately building a full internal Project Management Office. It can be scoped to one critical project or to a delivery portfolio."
                    },
                    {
                      question: "How is Orgainse different from a conventional consulting firm?",
                      answer: "Orgainse combines advisory, implementation, operating support, and ORQYNE. The engagement is designed to move from recommendation to an operating workflow with defined owners, controls, reporting, and adoption support, rather than ending at a deck."
                    },
                    {
                      question: "Who does Orgainse work with?",
                      answer: "Primarily Information Technology services firms, software delivery teams, startups, small and medium-sized enterprises, and cross-functional operating teams. Typical buyers are founders, Chief Executive Officers, Chief Operating Officers, delivery leaders, project leaders, operations heads, and business owners."
                    }
                  ]
                },
                {
                  category: "How Engagements Run",
                  questions: [
                    {
                      question: "How does an engagement start?",
                      answer: "It starts with a focused discovery session on one important execution problem. We clarify the desired outcome, current workflow, decision owners, operating constraints, and the most practical next step. The recommendation may involve consulting, Project Management as a Service, ORQYNE, a short diagnostic, or no immediate engagement."
                    },
                    {
                      question: "What are the four stages of delivery?",
                      answer: "Diagnose: clarify the desired outcome, current workflow, decision owners, constraints, risks, and measurable sources of leakage. Design: create the target workflow, governance model, reporting rhythm, roles, controls, and success measures. Implement: configure the process, ORQYNE workspace, templates, integrations, and operating cadence. Govern: review adoption, risks, decisions, delivery health, and measurable outcomes on a defined schedule."
                    },
                    {
                      question: "Can Orgainse work with our existing tools?",
                      answer: "Yes. Orgainse can improve the operating model around an existing tool such as Jira, Asana or monday.com, introduce ORQYNE for selected workflows, or assess whether consolidation is justified. The recommendation is based on business fit rather than forced replacement, and integration availability is confirmed during scoping."
                    },
                    {
                      question: "How is Artificial Intelligence introduced safely?",
                      answer: "We map the process first, identify where Artificial Intelligence improves decision quality or removes friction, and define human approval points before anything is built. Artificial Intelligence output may be incomplete or incorrect, so material operational, financial, legal, security, healthcare, or employment decisions retain appropriate human review."
                    }
                  ]
                },
                {
                  category: "Healthcare Revenue Intelligence Advisory",
                  questions: [
                    {
                      question: "What is Healthcare Revenue Intelligence Advisory?",
                      answer: "It is an advisory and analytics service that improves visibility into revenue performance, denial patterns, payer behaviour, operating controls, and executive reporting. It works alongside your existing revenue cycle operations and vendors rather than replacing them. Each engagement is separately scoped for data handling, regulatory considerations, and advisory boundaries."
                    },
                    {
                      question: "Who is the right fit for this service?",
                      answer: "Organisations that already have revenue cycle operations in place, internally or through a third party, and need an independent view of what those operations are delivering and where performance can be strengthened through better governance, analytics, or technology readiness."
                    },
                    {
                      question: "What is explicitly not included?",
                      answer: "Orgainse does not provide medical billing or claims submission, medical coding or clinical documentation, accounts receivable follow-up or collections, denial follow-up or appeal submission, payment posting or remittance processing, patient billing, or onshore and offshore revenue cycle staffing. The scope is strictly advisory, analytics, and governance."
                    }
                  ]
                },
                {
                  category: "Pricing, Outcomes and Data",
                  questions: [
                    {
                      question: "How is pricing determined?",
                      answer: "Pricing depends on scope, engagement duration, the services involved, the operating support required, and — where ORQYNE is included — users, enabled modules, implementation requirements, Artificial Intelligence usage model, and integration scope. Final scope and commercial terms are confirmed in writing before work begins."
                    },
                    {
                      question: "Does Orgainse guarantee delivery improvement or Return on Investment?",
                      answer: "No. Timing and outcomes depend on scope, data quality, leadership decisions, adoption, integrations, operating conditions, and customer responsibilities. Success measures are agreed before work begins and reviewed through the engagement, and we deliberately do not publish guaranteed percentages."
                    },
                    {
                      question: "Are the assessment and calculator on this site an audit?",
                      answer: "No. The Artificial Intelligence readiness assessment and the Return on Investment calculator are directional planning aids based entirely on the answers and assumptions you supply. They are not a certification, an audit, or professional advice for your specific circumstances."
                    },
                    {
                      question: "How is our data handled?",
                      answer: "Data handling, access, retention, and confidentiality are defined in the engagement agreement, and Healthcare engagements are separately scoped for regulatory considerations. Orgainse does not claim certification or legal compliance under any standard unless it has been formally established and independently verified."
                    }
                  ]
                }
              ].map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">{categoryIndex + 1}</span>
                    </div>
                    {category.category}
                  </h3>
                  
                  {category.questions.map((faq, faqIndex) => (
                    <div key={faqIndex} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                      <details className="group">
                        <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50 transition-colors">
                          <h4 className="text-lg font-semibold text-slate-900 pr-4">
                            {faq.question}
                          </h4>
                          <div className="flex-shrink-0">
                            <Plus className="h-5 w-5 text-blue-600 group-open:hidden transition-transform" />
                            <Minus className="h-5 w-5 text-blue-600 hidden group-open:block transition-transform" />
                          </div>
                        </summary>
                        <div className="px-6 pb-6">
                          <p className="text-slate-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-3xl p-8 text-white">
                <h3 className="font-outfit text-3xl font-bold tracking-[-0.02em] mb-4">Still evaluating?</h3>
                <p className="text-base mb-6 text-blue-100 max-w-2xl mx-auto">
                  Bring one execution problem to a focused 30-minute discovery call. We will clarify the outcome,
                  the workflow, the decision owners, and the most practical next step.
                </p>
                <Button 
                  onClick={openCalendly}
                  className="bg-white text-slate-900 hover:bg-blue-100 px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                >
                  Book a Discovery Call
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content Section - Rich Content for Search Engines */}
        <SEOContent />

        {/* SEO Links Section - Internal and External Links */}
        <SEOLinks />

        {/* Social Share Component */}
        <div className="py-8 bg-gradient-to-r from-slate-50 via-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="font-outfit text-2xl font-bold tracking-[-0.02em] text-slate-900 mb-4">
                Share this with your delivery leaders
              </h3>
              <p className="text-slate-600 mb-6">
                Practical execution, governance and Artificial Intelligence adoption for teams that need visibility.
              </p>
              <SocialShare 
                title="PMaaS, PMO and Delivery Governance Services | Orgainse"
                description="Project Management as a Service, workflow transformation, delivery governance, ORQYNE implementation, AI readiness, and Healthcare Revenue Intelligence Advisory."
                hashtags="ProjectManagement,PMaaS,DeliveryGovernance,ORQYNE,AIAdoption"
              />
            </div>
          </div>
        </div>
    </div>
  );
};

export default Services;
