import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  Building2,
  ChevronDown,
  ClipboardList,
  Compass,
  Eye,
  FileText,
  GitBranch,
  Layers,
  LayoutDashboard,
  Mail,
  Network,
  Radar,
  ShieldCheck,
  Split,
  Target,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { api } from "../lib/api";
import SEOHead from "../components/SEOHead";
import SocialShare from "../components/SocialShare";
import GridBackdrop from "../components/brand/GridBackdrop";
import OrbitDiagram from "../components/brand/OrbitDiagram";
import { useCalendly } from "../context/CalendlyContext";

const PROBLEMS = [
  { icon: Eye, title: "Poor Visibility", body: "Leaders cannot quickly see what is on track, what is blocked, what requires a decision, or where delivery is drifting." },
  { icon: UserCog, title: "Weak Ownership", body: "Responsibilities are spread across people, chats, spreadsheets, and tools without one accountable operating model." },
  { icon: LayoutDashboard, title: "Reactive Reporting", body: "Status updates consume time but still fail to provide reliable decision context." },
  { icon: Split, title: "Workflow Leakage", body: "Handoffs, approvals, dependencies, and follow-ups are missed because the process is not visible or governed." },
  { icon: Building2, title: "Founder Overload", body: "Founders and senior leaders become the operating system because the business has not built one." },
  { icon: Radar, title: "Low Execution Certainty", body: "Plans exist, but teams lack the cadence, controls, and evidence required to deliver with confidence." },
];

const SERVICES = [
  {
    icon: ClipboardList,
    title: "Project Management as a Service (PMaaS)",
    body: "Add structured project leadership without building a full internal Project Management Office. Orgainse supports planning, governance, reporting cadence, risk and dependency management, stakeholder communication, and executive visibility. ORQYNE can be configured as the shared delivery workspace for the engagement.",
  },
  {
    icon: Brain,
    title: "Artificial Intelligence and Workflow Transformation",
    body: "Identify where Artificial Intelligence, automation, and workflow redesign can remove friction or improve decision quality. We map current processes, identify high-value opportunities, define human approval points, and establish a practical implementation roadmap before technology is introduced.",
  },
  {
    icon: ShieldCheck,
    title: "Delivery and Operational Governance",
    body: "Create a consistent operating rhythm across projects, teams, and business functions. This includes portfolio visibility, responsibilities, escalation paths, risks, assumptions, issues, dependencies, decisions, resource visibility, cost oversight, and executive reporting.",
  },
  {
    icon: Layers,
    title: "ORQYNE Implementation and Adoption",
    body: "Configure ORQYNE around the way your organisation actually operates. We support workspace design, roles and access, workflow configuration, work import, templates, governance controls, integrations, onboarding, and adoption reviews.",
  },
  {
    icon: Compass,
    title: "Artificial Intelligence Strategy and Readiness",
    body: "Determine where Artificial Intelligence can create value before committing significant budget. Orgainse assesses business priorities, process maturity, data availability, operating risk, governance requirements, and adoption readiness to develop a sequenced implementation plan.",
  },
  {
    icon: TrendingUp,
    title: "Healthcare Revenue Intelligence Advisory",
    body: "Improve visibility into revenue performance, denial patterns, payer behaviour, operating controls, and executive reporting. Each engagement is separately scoped for data handling, regulatory considerations, and advisory boundaries. Orgainse does not position this service as operational medical billing or coding.",
  },
];

const STEPS = [
  { label: "Diagnose", icon: Compass, description: "Clarify the desired outcome, current workflow, decision owners, constraints, risks, and measurable sources of leakage." },
  { label: "Design", icon: GitBranch, description: "Create the target workflow, governance model, reporting rhythm, roles, controls, and success measures." },
  { label: "Implement", icon: Layers, description: "Configure the process, ORQYNE workspace, templates, integrations, and operating cadence." },
  { label: "Govern", icon: ClipboardList, description: "Review adoption, risks, decisions, delivery health, and measurable outcomes on a defined schedule." },
];

const AUDIENCES = [
  { icon: Network, title: "Information Technology Services Firms", body: "Improve delivery visibility across client projects, portfolios, risks, resources, costs, vendors, and executive reporting." },
  { icon: GitBranch, title: "Software Delivery Teams", body: "Connect planning, work items, engineering delivery signals, governance, knowledge, and stakeholder communication." },
  { icon: Target, title: "Startups and Growing Businesses", body: "Reduce founder dependency by creating clearer ownership, operating cadence, decision records, and cross-functional visibility." },
  { icon: Users, title: "Cross-Functional Operating Teams", body: "Bring sales, marketing, finance, operations, people, legal, procurement, and delivery work into a shared execution model." },
];

const RESOURCES = [
  { icon: Brain, title: "Artificial Intelligence Implementation Guide", body: "A structured approach for moving from Artificial Intelligence opportunity identification to controlled implementation." },
  { icon: ClipboardList, title: "Project Management as a Service Evaluation Checklist", body: "Questions to assess whether an internal hire, consulting engagement, or managed project service is the right option." },
  { icon: FileText, title: "Workflow Visibility Checklist", body: "A practical review of ownership, handoffs, reporting, risks, decisions, and operational leakage." },
];

const FAQS = [
  {
    q: "What does Orgainse do?",
    a: "Orgainse helps organisations improve project delivery, workflow visibility, operational governance, and practical Artificial Intelligence adoption. Services include Project Management as a Service, delivery and workflow transformation, ORQYNE implementation, Artificial Intelligence readiness, and separately scoped advisory engagements.",
  },
  {
    q: "What is Project Management as a Service?",
    a: "Project Management as a Service (PMaaS) gives an organisation access to structured project leadership, governance, reporting, risk management, stakeholder communication, and delivery support without immediately building a full Internal Project Management Office.",
  },
  {
    q: "How is Orgainse different from a conventional consulting firm?",
    a: "Orgainse combines advisory, implementation, operating support, and ORQYNE. The engagement is designed to move from recommendation to an operating workflow with defined owners, controls, reporting, and adoption support.",
  },
  {
    q: "Who is Orgainse designed to support?",
    a: "Orgainse primarily supports Information Technology services firms, software teams, startups, small and medium-sized enterprises, and cross-functional operating teams that need better visibility, governance, and execution discipline.",
  },
  {
    q: "Does Orgainse guarantee delivery improvement or Return on Investment?",
    a: "No. Timing and outcomes depend on scope, data quality, leadership decisions, adoption, integrations, operating conditions, and customer responsibilities. Success measures are agreed before work begins and reviewed through the engagement.",
  },
  {
    q: "Can Orgainse support a company that already uses Jira, Asana, monday.com, or another work-management platform?",
    a: "Yes. Orgainse can improve the operating model around an existing tool, introduce ORQYNE for selected workflows, or assess whether consolidation is justified. The recommendation is based on business fit rather than forced replacement.",
  },
];

const TRUST_STRIP = [
  "Outcome-Led Engagements",
  "Human-Governed Artificial Intelligence",
  "Service-Backed Implementation",
  "Built Around Real Business Work",
];

const Home = () => {
  const { openCalendly } = useCalendly();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("");
  const [isNewsletterLoading, setIsNewsletterLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsNewsletterLoading(true);
    setNewsletterStatus("");
    try {
      const res = await api.newsletter({ email: newsletterEmail });
      setNewsletterStatus(res?.status === "already_subscribed" ? "duplicate" : "success");
      setNewsletterEmail("");
      setTimeout(() => setNewsletterStatus(""), 5000);
    } catch (error) {
      toast.error(error.message || "Subscription failed. Please try again.");
      setNewsletterStatus("error");
      setTimeout(() => setNewsletterStatus(""), 5000);
    } finally {
      setIsNewsletterLoading(false);
    }
  };

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: "Project Management as a Service (PMaaS)",
      name: "Project Management as a Service",
      provider: { "@type": "Organization", name: "Orgainse", url: "https://www.orgainse.com/" },
      description:
        "Structured project leadership, governance, reporting cadence, risk and dependency management, stakeholder communication, and executive visibility without building a full internal Project Management Office.",
      areaServed: ["United States", "India", "United Kingdom", "Ireland", "Germany", "France", "Netherlands", "United Arab Emirates", "Saudi Arabia", "Qatar", "Australia", "New Zealand", "South Africa"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Orgainse Services",
        itemListElement: SERVICES.map((s) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: s.title, description: s.body },
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "From Business Problem to Operating System",
      description: "How Orgainse moves an organisation from a business problem to a governed operating model.",
      step: STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.label, text: s.description })),
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-manrope antialiased" data-testid="home-page">
      <SEOHead
        title="Orgainse | Delivery Governance Consulting and PMaaS"
        description="Delivery consulting, Project Management as a Service (PMaaS) and the ORQYNE platform that turn fragmented work into governed execution. Serving the US, India, UK, Europe, the Middle East and Australia."
        canonical="https://www.orgainse.com/"
        keywords="delivery consulting, Project Management as a Service, PMaaS, delivery governance, execution visibility, workflow transformation, ORQYNE, AI readiness, healthcare revenue intelligence advisory"
        structuredData={structuredData}
      />

      {/* ── SECTION 1 · Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 lg:pt-24 pb-16" data-testid="home-hero">
        <GridBackdrop />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <span
                data-testid="hero-eyebrow"
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white/70 backdrop-blur-sm text-[11px] uppercase tracking-[0.18em] text-slate-500 shadow-sm"
              >
                <Layers className="h-3 w-3 text-blue-600" />
                Delivery Consulting · PMaaS · ORQYNE-Enabled Delivery
              </span>

              <h1 data-testid="hero-headline" className="mt-6 font-outfit font-bold text-4xl sm:text-5xl lg:text-[60px] leading-[1.05] text-slate-900">
                <span className="block">Turn Fragmented Work Into</span>
                <span className="relative inline-block">
                  <span className="relative z-10 text-blue-600">Visible, Governed Execution</span>
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-1.5 h-3 bg-blue-100 rounded-sm" />
                </span>
              </h1>

              <h2 className="mt-7 text-base md:text-lg text-slate-700 font-semibold max-w-2xl leading-relaxed">
                Build stronger delivery systems, improve operational visibility, and apply Artificial Intelligence where it creates measurable business value.
              </h2>

              <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                Orgainse helps Information Technology services companies, software teams, startups, and growing businesses move from disconnected tools and reactive reporting to structured, accountable execution. We combine business consulting, Project Management as a Service (PMaaS), workflow transformation, and ORQYNE to help teams establish clearer ownership, stronger governance, reliable reporting, and better-informed decisions.
              </p>
              <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                Whether the starting point is one critical project, a growing delivery portfolio, or an organisation-wide workflow problem, we help define the operating model, configure the right systems, and support adoption through execution.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <button
                  data-testid="hero-discovery-btn"
                  onClick={openCalendly}
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-[background,transform] duration-200 hover:-translate-y-[1px] shadow-[0_10px_40px_-10px_rgba(15,23,42,0.4)]"
                >
                  Book an Execution Discovery Call
                  <ArrowRight className="h-[15px] w-[15px] transition-transform duration-200 group-hover:translate-x-1" />
                </button>
                <Link
                  to="/products"
                  data-testid="hero-explore-orqyne-btn"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors"
                >
                  Explore ORQYNE
                  <ArrowUpRight className="h-[15px] w-[15px]" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <OrbitDiagram
                coreLabel="Operating System"
                coreSub="The Orgainse method"
                coreIcon={Network}
                innerChips={STEPS.map((s, i) => ({ label: s.label, badge: i + 1 }))}
                caption="The Orgainse method — diagnose, design, implement, govern."
                testId="hero-method-diagram"
              />
            </div>
          </div>

          <div className="mt-16 border-t border-slate-200 pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="hero-trust-strip">
            {TRUST_STRIP.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center shrink-0">
                  <ShieldCheck className="h-[15px] w-[15px] text-blue-600" />
                </span>
                <p className="font-outfit font-semibold text-slate-900 text-[15px] leading-snug pt-1.5">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2 · Problem and Outcome ─────────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50 py-20" data-testid="home-problem-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-3xl text-slate-900">
            Strategy Is Not the Problem. <span className="text-slate-400">Execution Usually Is.</span>
          </h2>
          <p className="mt-6 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            Most growing organisations do not suffer from a shortage of ideas, tools, or meetings. They struggle because work is fragmented, ownership is unclear, risks surface late, reporting is inconsistent, and leaders spend too much time reconstructing what is happening. Orgainse helps create an execution system that makes priorities, responsibilities, dependencies, decisions, progress, and risks easier to see and manage.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROBLEMS.map((p) => (
              <div key={p.title} data-testid={`problem-card-${p.title.toLowerCase().replace(/\s+/g, "-")}`} className="org-hover-lift bg-white rounded-2xl border border-slate-200 p-7">
                <span className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center">
                  <p.icon className="h-4 w-4 text-blue-600" />
                </span>
                <p className="mt-5 font-outfit font-bold text-slate-900 text-lg tracking-[-0.02em]">{p.title}</p>
                <p className="mt-2 text-[13px] text-slate-600 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-slate-300 bg-white p-6 max-w-3xl" data-testid="outcome-statement">
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-semibold">
              The objective is not to add another tool. The objective is to create greater execution certainty.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 · Services ────────────────────────────────────── */}
      <section className="py-24" data-testid="home-services-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">What we do</p>
          <h2 className="mt-4 font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-3xl text-slate-900">
            Services Built Around Execution, <span className="text-slate-400">Not Activity</span>
          </h2>
          <p className="mt-6 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            Start with the business outcome that matters most. Orgainse combines focused advisory, implementation, and operating support so that strategy is translated into visible, repeatable execution.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((s, i) => (
              <div key={s.title} data-testid={`home-service-card-${i}`} className="org-hover-lift bg-white rounded-2xl border border-slate-200 p-8 flex flex-col">
                <span className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center">
                  <s.icon className="h-4 w-4 text-blue-600" />
                </span>
                <h3 className="mt-6 font-outfit font-bold text-slate-900 text-lg tracking-[-0.02em] leading-snug">{s.title}</h3>
                <p className="mt-3 text-[13px] text-slate-600 leading-relaxed flex-1">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              to="/services"
              data-testid="services-explore-btn"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-[background,transform] duration-200 hover:-translate-y-[1px] shadow-[0_10px_40px_-10px_rgba(15,23,42,0.4)]"
            >
              Explore Orgainse Services
              <ArrowRight className="h-[14px] w-[14px] transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              data-testid="services-discuss-btn"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors"
            >
              Discuss Your Priority
              <ArrowUpRight className="h-[14px] w-[14px]" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 4 · How Orgainse Works ──────────────────────────── */}
      <section className="py-24 bg-slate-50 border-y border-slate-200" data-testid="home-how-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">How Orgainse works</p>
            <h2 className="mt-4 font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-slate-900 max-w-md">
              From Business Problem to Operating System
            </h2>
            <div className="mt-10 space-y-4">
              {STEPS.map((s, i) => (
                <div key={s.label} data-testid={`how-step-${i}`} className="org-hover-lift bg-white rounded-2xl border border-slate-200 p-6 flex gap-4">
                  <span className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center shrink-0">
                    <span className="font-outfit text-[13px] font-bold text-blue-600">{i + 1}</span>
                  </span>
                  <div>
                    <p className="font-outfit font-bold text-slate-900 text-base tracking-[-0.02em]">{s.label}</p>
                    <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-slate-700 leading-relaxed max-w-lg" data-testid="how-supporting-statement">
              Technology is introduced only where it improves the operating model. The objective is not to deploy more tools; it is to create greater execution certainty.
            </p>
          </div>

          <div className="lg:col-span-6 lg:sticky lg:top-32">
            <OrbitDiagram
              coreLabel="Execution System"
              coreSub="Governed operating model"
              coreIcon={Network}
              innerChips={["Ownership", "Cadence", "Decisions"]}
              outerChips={["Risks", "Dependencies", "Reporting", "Costs", "Resources", "Adoption"]}
              caption="Illustration of the Orgainse operating model. No client data is shown."
              testId="how-orbit-diagram"
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 5 · Who We Help ─────────────────────────────────── */}
      <section className="py-24" data-testid="home-audience-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-3xl text-slate-900">
            Built for Teams That Need More Control <span className="text-slate-400">Without More Complexity</span>
          </h2>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AUDIENCES.map((a, i) => (
              <div key={a.title} data-testid={`audience-card-${i}`} className="org-hover-lift bg-white rounded-2xl border border-slate-200 p-7 flex flex-col">
                <span className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center">
                  <a.icon className="h-4 w-4 text-blue-600" />
                </span>
                <h3 className="mt-6 font-outfit font-bold text-slate-900 text-base tracking-[-0.02em] leading-snug">{a.title}</h3>
                <p className="mt-3 text-[13px] text-slate-600 leading-relaxed flex-1">{a.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 max-w-4xl" data-testid="buyer-statement">
            <p className="text-sm text-slate-700 leading-relaxed">
              Orgainse typically works with founders, Chief Executive Officers, Chief Operating Officers, delivery leaders, project leaders, operations heads, and business owners who need a clearer view of execution.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 6 · Accelerate Your AI Transformation ───────────── */}
      <section className="py-24 bg-slate-50 border-y border-slate-200" data-testid="home-accelerate-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-3xl text-slate-900">
            Accelerate Your AI Transformation
          </h2>
          <p className="mt-6 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            Use practical insights and objective tools to evaluate where Artificial Intelligence can improve your organisation before committing significant time or budget.
          </p>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Newsletter */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col org-hover-lift">
              <span className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center">
                <Mail className="h-4 w-4 text-blue-600" />
              </span>
              <h3 className="mt-6 font-outfit text-xl font-bold text-slate-900 tracking-[-0.02em]">AI Strategy Newsletter</h3>
              <p className="mt-4 text-[13px] text-slate-600 leading-relaxed flex-1">
                Receive practical briefings on Artificial Intelligence adoption, project delivery, workflow design, operating governance, and implementation risk. The newsletter is written for founders, executives, delivery leaders, and business owners who need decisions rather than hype.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="mt-6 space-y-3">
                <Input
                  data-testid="newsletter-email-input"
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Work email address"
                  required
                  disabled={isNewsletterLoading}
                  className="rounded-2xl border-slate-300 h-11 text-sm focus-visible:ring-blue-600"
                />
                <button
                  data-testid="newsletter-submit-btn"
                  type="submit"
                  disabled={isNewsletterLoading || !newsletterEmail.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {isNewsletterLoading ? "Subscribing…" : "Subscribe for Practical AI Insights"}
                  {!isNewsletterLoading && <ArrowRight className="h-[13px] w-[13px]" />}
                </button>
                {newsletterStatus === "success" && (
                  <p data-testid="newsletter-status-success" className="text-[12px] text-blue-700 font-semibold text-center">
                    Subscribed. Look out for the next briefing.
                  </p>
                )}
                {newsletterStatus === "duplicate" && (
                  <p data-testid="newsletter-status-duplicate" className="text-[12px] text-slate-600 font-semibold text-center">
                    This address is already subscribed.
                  </p>
                )}
                {newsletterStatus === "error" && (
                  <p data-testid="newsletter-status-error" className="text-[12px] text-red-600 font-semibold text-center">
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>
            </div>

            {/* Assessment */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col org-hover-lift">
              <span className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center">
                <Brain className="h-4 w-4 text-blue-600" />
              </span>
              <h3 className="mt-6 font-outfit text-xl font-bold text-slate-900 tracking-[-0.02em]">Free Execution Readiness Assessment</h3>
              <p className="mt-4 text-[13px] text-slate-600 leading-relaxed flex-1">
                Five questions covering how status is known today, how reliable your delivery reporting is, how clearly ownership is defined, investment readiness, and leadership commitment. The result is a directional view of strengths, gaps and priorities. It is not a certification or a substitute for a detailed assessment.
              </p>
              <Link
                to="/ai-assessment"
                data-testid="assessment-cta-btn"
                className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Start the Free Assessment
                <ArrowRight className="h-[13px] w-[13px]" />
              </Link>
              <p className="mt-3 text-[11px] text-slate-500 text-center">No payment required · Immediate directional results</p>
            </div>

            {/* ROI */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col org-hover-lift">
              <span className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </span>
              <h3 className="mt-6 font-outfit text-xl font-bold text-slate-900 tracking-[-0.02em]">Return on Investment Calculator</h3>
              <p className="mt-4 text-[13px] text-slate-600 leading-relaxed flex-1">
                Model potential time, capacity, cost, and operating effects using assumptions specific to your organisation. The calculator provides a business scenario for planning purposes. Actual outcomes depend on implementation scope, adoption, data quality, and operating conditions.
              </p>
              <Link
                to="/roi-calculator"
                data-testid="roi-cta-btn"
                className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Build an ROI Scenario
                <ArrowRight className="h-[13px] w-[13px]" />
              </Link>
              <p className="mt-3 text-[11px] text-slate-500 text-center">Use your assumptions · Review multiple scenarios</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7 · Consultation CTA ────────────────────────────── */}
      <section className="py-24" data-testid="home-consultation-section">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 lg:p-14 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)]">
            <div
              aria-hidden="true"
              className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(37,99,235,0.25), transparent 60%)" }}
            />
            <div className="relative">
              <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-2xl text-slate-900">
                Bring One Important Execution Problem
              </h2>
              <p className="mt-6 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                In a focused discovery session, we will clarify the desired business outcome, current workflow, decision owners, operating constraints, and the most practical next step. The recommendation may involve consulting, Project Management as a Service, ORQYNE, a short diagnostic, or no immediate engagement. The objective is to determine fit before scope expands.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  data-testid="consultation-book-btn"
                  onClick={openCalendly}
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-[background,transform] duration-200 hover:-translate-y-[1px] shadow-[0_10px_40px_-10px_rgba(15,23,42,0.4)]"
                >
                  Book a 30-Minute Discovery Call
                  <ArrowRight className="h-[14px] w-[14px] transition-transform duration-200 group-hover:translate-x-1" />
                </button>
                <Link
                  to="/contact"
                  data-testid="consultation-contact-btn"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors"
                >
                  Contact Orgainse
                  <ArrowUpRight className="h-[14px] w-[14px]" />
                </Link>
              </div>
              <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-slate-500 font-semibold">
                Focused business discussion · No commitment required · Global scheduling available
              </p>
              <div className="mt-8">
                <SocialShare
                  url="https://www.orgainse.com/"
                  title="Orgainse | Delivery Governance Consulting and PMaaS"
                  description="Orgainse helps IT services firms, software teams, startups, and growing businesses turn fragmented work into visible, governed execution."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 8 · Resources ───────────────────────────────────── */}
      <section className="py-24 bg-slate-50 border-y border-slate-200" data-testid="home-resources-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-3xl text-slate-900">
            Practical Resources for Better Execution
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {RESOURCES.map((r, i) => (
              <div key={r.title} data-testid={`resource-card-${i}`} className="org-hover-lift bg-white rounded-2xl border border-slate-200 p-8">
                <span className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center">
                  <r.icon className="h-4 w-4 text-blue-600" />
                </span>
                <h3 className="mt-6 font-outfit font-bold text-slate-900 text-base tracking-[-0.02em] leading-snug">{r.title}</h3>
                <p className="mt-3 text-[13px] text-slate-600 leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-sm text-slate-700">
            Subscribe to the Orgainse newsletter to receive current guides, frameworks, and implementation resources.{" "}
            <Link to="/newsletter" data-testid="resources-newsletter-link" className="font-semibold text-blue-700 hover:underline">
              Visit the newsletter archive
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── SECTION 9 · FAQ ────────────────────────────────────────── */}
      <section className="py-24" data-testid="home-faq-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-3">Answers</p>
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-slate-900">Frequently Asked Questions</h2>
            <p className="mt-6 text-sm text-slate-600 leading-relaxed">
              Still evaluating? Write to{" "}
              <a href="mailto:info@orgainse.com" className="font-semibold text-blue-700 hover:underline">
                info@orgainse.com
              </a>{" "}
              or book a discovery call.
            </p>
            <button
              data-testid="faq-cta-btn"
              onClick={openCalendly}
              className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors"
            >
              Schedule a Discovery Call
              <ArrowUpRight className="h-[14px] w-[14px]" />
            </button>
          </div>

          <div className="lg:col-span-8 min-w-0" data-testid="faq-accordion">
            {FAQS.map((f, i) => (
              <div key={f.q} className="border-b border-slate-200 last:border-b-0">
                <button
                  type="button"
                  data-testid={`faq-question-${i}`}
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-6 text-left font-outfit text-base sm:text-lg font-semibold tracking-[-0.01em] text-slate-900"
                >
                  <span className="flex-1 min-w-0 break-words">{f.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <p data-testid={`faq-answer-${i}`} className="pb-6 text-sm text-slate-600 leading-relaxed">
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
