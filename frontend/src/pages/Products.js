import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bot,
  Boxes,
  Check,
  ChevronDown,
  CircuitBoard,
  ClipboardList,
  Database,
  FileSpreadsheet,
  Fingerprint,
  GitBranch,
  Landmark,
  Layers,
  Lock,
  MessageSquare,
  Network,
  PanelsTopLeft,
  Radar,
  ScrollText,
  Server,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { api } from "../lib/api";
import SEOHead from "../components/SEOHead";
import GridBackdrop from "../components/brand/GridBackdrop";
import OrbitDiagram from "../components/brand/OrbitDiagram";
import UiMockPanel from "../components/brand/UiMockPanel";
import { OrqyneLogo } from "../components/OrqyneLogo";
import { useCalendly } from "../context/CalendlyContext";

const ORQYNE_SITE = "https://orgainse.live";

const CAPABILITY_MARKERS = [
  { icon: Layers, label: "Two Industry-Native Experiences" },
  { icon: Boxes, label: "Tenant-Aware Architecture" },
  { icon: Database, label: "AI Grounded in Approved Knowledge" },
  { icon: ShieldCheck, label: "Service-Backed Implementation" },
];

const EXPERIENCES = {
  it_services: {
    id: "it_services",
    tab: "IT Services and Software",
    icon: CircuitBoard,
    accent: "37, 99, 235",
    headline: "Run Delivery With One View of Work, Risk, Resources, Cost, and Outcomes.",
    intro:
      "ORQYNE for Information Technology Services and Software supports structured delivery across projects and portfolios.",
    bullets: [
      "Projects, portfolios, backlogs, sprints, and delivery boards.",
      "Epics, stories, tasks, sub-tasks, bugs, incidents, spikes, and change requests.",
      "Configurable work-item numbering.",
      "Risk, Assumption, Issue, and Dependency registers.",
      "Decisions, approvals, compliance records, and audit visibility.",
      "Resource, time, cost, vendor, stakeholder, and communication management.",
      "Project health, portfolio reporting, Earned Value Management, and engineering delivery metrics.",
      "Information Technology-focused Artificial Intelligence agents grounded in approved project and knowledge sources.",
    ],
    cta: "Explore the IT Services Experience",
    coreLabel: "IT Services",
    coreSub: "Tenant-aware core",
    innerChips: ["Projects", "Portfolios", "Work items"],
    outerChips: ["Risks", "Dependencies", "Decisions", "Resources", "Costs", "Vendors"],
  },
  canvas: {
    id: "canvas",
    tab: "Canvas Business Management",
    icon: PanelsTopLeft,
    accent: "124, 58, 237",
    headline: "Turn Cross-Functional Priorities Into Visible Business Execution.",
    intro:
      "Canvas is designed for operating teams, departments, and business owners that need a shared model for managing work across functions.",
    bullets: [
      "Department-owned stories and cross-functional work.",
      "Configurable boards, priorities, owners, and dependencies.",
      "Business Pulse, Business Health, and money-impact views.",
      "Documents, templates, knowledge, and decision records.",
      "Workflows, automations, and approval queues.",
      "Organisation, team, access, and module visibility controls.",
      "Business-function Artificial Intelligence agent catalogue for operations, sales, marketing, finance, people, legal, procurement, and delivery.",
    ],
    cta: "Explore Canvas Business Management",
    coreLabel: "Canvas",
    coreSub: "Business execution core",
    innerChips: ["Departments", "Stories", "Owners"],
    outerChips: ["Approvals", "Automations", "Business Pulse", "Documents", "Money impact", "Access"],
  },
};

const IMPLEMENTATION_STEPS = [
  { title: "Map the Workflow", body: "Document the work types, ownership, handoffs, decisions, governance, reporting, and success measures." },
  { title: "Configure the Experience", body: "Select the relevant ORQYNE experience and configure terminology, roles, modules, workflows, templates, and controls." },
  { title: "Import and Validate Work", body: "Use structured imports or templates to move existing projects and work items into the platform. Data is reviewed before it becomes part of the operating workspace." },
  { title: "Operate and Improve", body: "Run work through ORQYNE, review adoption and delivery health, and refine the operating model using real usage and outcome data." },
];

const RAG_STEPS = [
  { title: "Index", body: "Approved documents and work records are added to the tenant knowledge environment.", icon: Database },
  { title: "Retrieve", body: "Relevant passages are selected based on the user's request and access permissions.", icon: Radar },
  { title: "Generate", body: "The configured model uses the retrieved context to prepare an answer, summary, recommendation, or draft.", icon: Bot },
  { title: "Review", body: "Users review important outputs before decisions, external communication, or system actions are completed.", icon: BadgeCheck },
];

const AGENTS = [
  { name: "Project Advisor", body: "Supports schedule, scope, Earned Value Management interpretation, forecasting, and project reporting using available tenant context.", icon: ClipboardList },
  { name: "RAID Analyst", body: "Helps organise and review Risks, Assumptions, Issues, and Dependencies, including scoring, ownership, staleness, and mitigation context.", icon: Radar },
  { name: "Vendor Intelligence", body: "Supports vendor scorecards, renewal visibility, bid evaluation, total-cost analysis, and contract-related operating context.", icon: Landmark },
  { name: "Governance Copilot", body: "Supports policy, control, audit-evidence, approval, and governance workflows as a starting point for qualified professional review.", icon: ScrollText },
  { name: "Site Reliability Engineering and Incident Assistant", body: "Supports incident triage, runbook retrieval, service-level context, incident analysis, and post-incident documentation.", icon: Server },
  { name: "Canvas Business-Function Agents", body: "Canvas provides an agent catalogue designed around delivery, operations, finance, marketing, sales, people, legal, procurement, and portfolio management.", icon: PanelsTopLeft },
];

const CONNECTORS = [
  { name: "Source Control", body: "Connect relevant repository and development signals where supported.", icon: GitBranch },
  { name: "Project Management", body: "Import, synchronise, or reference work-management records according to connector capability.", icon: ClipboardList },
  { name: "IT Service Management", body: "Bring incidents, service requests, changes, and operating records into delivery context.", icon: Workflow },
  { name: "Observability", body: "Use supported monitoring and incident signals to strengthen project and service visibility.", icon: Radar },
  { name: "Communications", body: "Connect relevant collaboration channels and notifications according to approved access.", icon: MessageSquare },
  { name: "Business Systems", body: "Use supported customer, finance, human resources, legal, and procurement connections for cross-functional workflows.", icon: Network },
];

const PLANS = [
  { name: "Guided Pilot", body: "Best for organisations evaluating one live workflow or project. Includes success-measure definition, initial configuration, structured import, user onboarding, and an executive review.", featured: false },
  { name: "Startup", body: "Best for small teams that need one structured environment for projects, knowledge, and governance.", featured: false },
  { name: "Small and Medium-Sized Business", body: "Best for organisations managing multiple teams, projects, departments, integrations, or reporting requirements.", featured: true },
  { name: "Enterprise", body: "Best for organisations requiring advanced access controls, Single Sign-On, optional physical data segregation, custom implementation, or formal security review.", featured: false },
];

const SECURITY = [
  { name: "Role-Based Access Control", body: "Role-Based Access Control, custom roles, and permission matrices help restrict access according to responsibilities.", icon: Users },
  { name: "Tenant-Aware Data Model", body: "Tenant-scoped records and optional physical collection segregation support different customer isolation requirements.", icon: Layers },
  { name: "Identity Controls", body: "Multi-Factor Authentication is enforced for platform administration. Tenant-level Single Sign-On options are supported.", icon: Fingerprint },
  { name: "Audit and Secret Management", body: "Audit records, environment-based secrets management, encryption services, and administrative controls support traceability and operational security.", icon: Lock },
  { name: "Environment Separation", body: "Development, staging, and production environments are independently deployed and operated.", icon: Server },
  { name: "Artificial Intelligence Governance", body: "Provider configuration, agent autonomy, approval gates, and access controls support governed use of Artificial Intelligence workflows.", icon: Bot },
];

const FAQS = [
  { q: "What is ORQYNE?", a: "ORQYNE is a multi-tenant delivery-governance platform by Orgainse. It brings projects, workflows, knowledge, decisions, governance, analytics, and Artificial Intelligence-assisted execution into one operating environment." },
  { q: "Is ORQYNE a replacement for Jira, Asana, monday.com, or ClickUp?", a: "Not necessarily. ORQYNE can operate as the primary workspace for selected teams or complement existing systems through imports and connectors. The decision depends on workflow complexity, governance requirements, migration effort, and integration availability." },
  { q: "Who is ORQYNE designed for?", a: "The primary experience is designed for Information Technology services and software-delivery organisations. Canvas Business Management supports cross-functional operating teams and business departments." },
  { q: "How does ORQYNE use customer data for Artificial Intelligence?", a: "Approved tenant content can be indexed and retrieved to provide context for Artificial Intelligence-assisted outputs. Access and provider configuration are controlled at the workspace level." },
  { q: "Can customers use their own Artificial Intelligence provider?", a: "ORQYNE supports Bring Your Own Key configurations for supported providers, subject to plan and implementation scope. A platform-managed model configuration may also be available." },
  { q: "Which integrations are available?", a: "ORQYNE has a growing catalogue of connectors. Production availability, authentication, read or write capability, and commercial inclusion should be confirmed for each required integration." },
  { q: "Is ORQYNE compliant with the Health Insurance Portability and Accountability Act, System and Organization Controls 2, or International Organization for Standardization 27001?", a: "Orgainse does not claim certification or legal compliance unless it has been formally established and independently verified. ORQYNE includes security and governance controls that may support a customer's compliance programme when combined with appropriate configuration, contracts, processes, and customer controls." },
  { q: "How should a company start?", a: "Start with one live project or workflow, define measurable success criteria, configure the relevant experience, and assess usage and operating value before expanding." },
];

const Products = () => {
  const { openCalendly } = useCalendly();
  const [activeExp, setActiveExp] = useState("it_services");
  const [openFaq, setOpenFaq] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const exp = EXPERIENCES[activeExp];

  const handlePilotSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.contact({
        name: form.name,
        email: form.email,
        company: form.company,
        service_type: "ORQYNE Guided Pilot",
        message: `[ORQYNE Guided Pilot request · ${exp.tab}] ${form.message}`,
        leadType: "orqyne_pilot",
      });
      setSubmitted(true);
      setForm({ name: "", email: "", company: "", message: "" });
      toast.success("Request received. Orgainse will be in touch shortly.");
    } catch (err) {
      toast.error(err.message || "Could not send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "ORQYNE",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Delivery Governance Platform",
      operatingSystem: "Web",
      url: "https://www.orgainse.com/products",
      sameAs: ORQYNE_SITE,
      description:
        "ORQYNE is a service-backed, multi-tenant delivery-governance platform connecting projects, workflows, governance, knowledge, analytics, and Artificial Intelligence assistance for Information Technology delivery and business operations.",
      publisher: { "@type": "Organization", name: "Orgainse", url: "https://www.orgainse.com/" },
      offers: { "@type": "AggregateOffer", priceCurrency: "USD", availability: "https://schema.org/InStock", offerCount: PLANS.length },
      featureList: [
        "Projects, portfolios, backlogs, sprints, and delivery boards",
        "Risk, Assumption, Issue, and Dependency registers",
        "Earned Value Management and engineering delivery metrics",
        "Retrieval-Augmented Generation grounded in approved tenant knowledge",
        "Industry-scoped Artificial Intelligence agents",
        "Role-Based Access Control and tenant-aware data model",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How ORQYNE Is Implemented",
      step: IMPLEMENTATION_STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.body })),
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-manrope antialiased" data-testid="products-page">
      <SEOHead
        title="ORQYNE Delivery Governance Software | Orgainse"
        description="Explore ORQYNE, a service-backed platform connecting projects, workflows, governance, knowledge, analytics, and Artificial Intelligence assistance for Information Technology delivery and business operations."
        canonical="https://www.orgainse.com/products"
        keywords="ORQYNE, delivery governance platform, project portfolio governance, RAID registers, Earned Value Management, RAG AI agents, Canvas business management, PMaaS platform"
        structuredData={structuredData}
      />

      {/* ── SECTION 1 · Product Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 lg:pt-24 pb-16" data-testid="product-hero">
        <GridBackdrop />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white/70 backdrop-blur-sm text-[11px] uppercase tracking-[0.2em] text-slate-500 shadow-sm" data-testid="product-eyebrow">
                <Layers className="h-3 w-3 text-blue-600" />
                ORQYNE · A Product by Orgainse
              </span>

              <div className="mt-7">
                <OrqyneLogo className="h-11 sm:h-14" />
              </div>

              <h1 data-testid="product-headline" className="mt-7 font-outfit font-bold text-4xl sm:text-5xl lg:text-[58px] leading-[1.06] text-slate-900">
                Delivery Governance for Teams That Have{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-blue-600">Outgrown Task Tracking</span>
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-1.5 h-3 bg-blue-100 rounded-sm" />
                </span>
              </h1>

              <p className="mt-7 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                ORQYNE is a service-backed, multi-tenant platform that connects project execution, portfolio visibility, governance, team knowledge, decisions, and Artificial Intelligence-assisted workflows. It is designed for Information Technology services and software delivery teams as well as cross-functional business operations that need more than lists of tasks. ORQYNE helps establish a shared operating environment where work, ownership, risks, costs, decisions, and business context can be viewed together.
              </p>
              <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                Orgainse supports configuration, implementation, workflow design, governance, and adoption. The product and service model work together so customers are not left to configure a complex operating system alone.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#pilot"
                  data-testid="product-pilot-btn"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-[background,transform] duration-200 hover:-translate-y-[1px] shadow-[0_10px_40px_-10px_rgba(15,23,42,0.4)]"
                >
                  Request a Guided ORQYNE Pilot
                  <ArrowRight className="h-[15px] w-[15px] transition-transform duration-200 group-hover:translate-x-1" />
                </a>
                <a
                  href={ORQYNE_SITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="product-site-btn"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors"
                >
                  Open the ORQYNE Website
                  <ArrowUpRight className="h-[15px] w-[15px]" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <UiMockPanel
                title="Governed delivery workspace"
                rows={[
                  { icon: ClipboardList, label: "Portfolio review · Q3 delivery" },
                  { icon: Radar, label: "RAID register · 4 items need an owner" },
                  { icon: Bot, label: "Project Advisor drafted the status summary" },
                  { icon: ScrollText, label: "Decision log updated and approved" },
                ]}
                chips={["Tenant-aware", "Role-aware access", "Human review"]}
                testId="product-hero-panel"
              />
            </div>
          </div>

          <div className="mt-16 border-t border-slate-200 pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="product-capability-markers">
            {CAPABILITY_MARKERS.map((m) => (
              <div key={m.label} className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center shrink-0">
                  <m.icon className="h-[15px] w-[15px] text-blue-600" />
                </span>
                <p className="font-outfit font-semibold text-slate-900 text-[15px] leading-snug pt-1.5">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2 · Choose Your Experience ─────────────────────── */}
      <section id="experiences" className="scroll-mt-28 py-24 bg-slate-50 border-y border-slate-200" data-testid="experience-picker">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Choose your experience</p>
          <h2 className="mt-4 font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-3xl text-slate-900">
            One Platform. <span className="text-slate-400">Two Purpose-Built Experiences.</span>
          </h2>

          <div className="mt-10 flex flex-wrap items-center gap-2 mb-10">
            {Object.values(EXPERIENCES).map((e) => (
              <button
                key={e.id}
                data-testid={`experience-tab-${e.id}`}
                onClick={() => setActiveExp(e.id)}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full border transition-colors text-sm font-semibold ${
                  activeExp === e.id
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                }`}
              >
                <e.icon className="h-[15px] w-[15px]" style={{ color: activeExp === e.id ? `rgb(${e.accent})` : undefined }} />
                {e.tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" data-testid={`experience-block-${exp.id}`}>
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-8 lg:p-10 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)] relative overflow-hidden">
              <div aria-hidden="true" className="absolute -top-32 -right-32 w-72 h-72 rounded-full blur-3xl opacity-40" style={{ backgroundColor: `rgba(${exp.accent},0.15)` }} />
              <div className="relative">
                <p className="text-[11px] uppercase tracking-[0.22em] font-bold" style={{ color: `rgb(${exp.accent})` }}>
                  {exp.tab}
                </p>
                <h3 className="mt-4 font-outfit text-2xl sm:text-3xl font-bold text-slate-900 tracking-[-0.03em] leading-[1.12] max-w-xl">{exp.headline}</h3>
                <p className="mt-5 text-sm sm:text-base text-slate-600 leading-relaxed">{exp.intro}</p>
                <ul className="mt-8 space-y-3">
                  {exp.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm text-slate-800 leading-relaxed">
                      <span className="mt-0.5 w-5 h-5 rounded-full grid place-items-center shrink-0" style={{ backgroundColor: `rgba(${exp.accent},0.10)` }}>
                        <Check className="h-[11px] w-[11px]" style={{ color: `rgb(${exp.accent})` }} />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
                <a
                  href="#pilot"
                  data-testid={`experience-cta-${exp.id}`}
                  className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-[1px]"
                  style={{ backgroundColor: `rgb(${exp.accent})` }}
                >
                  {exp.cta}
                  <ArrowRight className="h-[13px] w-[13px]" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 lg:sticky lg:top-32">
              <OrbitDiagram
                coreLabel={exp.coreLabel}
                coreSub={exp.coreSub}
                coreIcon={exp.icon}
                innerChips={exp.innerChips}
                outerChips={exp.outerChips}
                accent={exp.accent}
                caption={`Illustration of the ${exp.tab} module vocabulary. No tenant data is shown.`}
                testId="experience-visual"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 · How ORQYNE Is Implemented ──────────────────── */}
      <section className="py-24" data-testid="product-implementation">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-3xl text-slate-900">
            Start With the Operating Model, <span className="text-slate-400">Not a Blank Tool</span>
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {IMPLEMENTATION_STEPS.map((s, i) => (
              <div key={s.title} data-testid={`implementation-step-${i}`} className="org-hover-lift bg-white rounded-2xl border border-slate-200 p-7">
                <span className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center">
                  <span className="font-outfit text-[13px] font-bold text-blue-600">{i + 1}</span>
                </span>
                <p className="mt-5 font-outfit font-bold text-slate-900 text-base tracking-[-0.02em]">{s.title}</p>
                <p className="mt-2 text-[13px] text-slate-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4 · AI and Knowledge ───────────────────────────── */}
      <section className="py-24 bg-slate-50 border-y border-slate-200" data-testid="product-rag">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-3xl text-slate-900">
            Artificial Intelligence Assistance Grounded in the Knowledge Your Team Approves
          </h2>
          <p className="mt-6 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            ORQYNE can use Retrieval-Augmented Generation (RAG) to retrieve relevant information from approved tenant documents, project records, decisions, and operating knowledge before producing an Artificial Intelligence-assisted response. This gives Artificial Intelligence workflows more organisational context than a generic chatbot. Access, model selection, approvals, and data sources remain governed by the customer's workspace configuration.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {RAG_STEPS.map((s, i) => (
              <div key={s.title} data-testid={`rag-step-${i}`} className="org-hover-lift bg-white rounded-2xl border border-slate-200 p-7">
                <span className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center">
                  <s.icon className="h-4 w-4 text-blue-600" />
                </span>
                <p className="mt-5 font-outfit font-bold text-slate-900 text-base tracking-[-0.02em]">{s.title}</p>
                <p className="mt-2 text-[13px] text-slate-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-start gap-3 rounded-2xl border border-slate-300 bg-white p-6 max-w-4xl" data-testid="ai-governance-statement">
            <ShieldCheck className="h-[17px] w-[17px] text-slate-500 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-700 leading-relaxed">
              Artificial Intelligence output may be incomplete or incorrect. Material operational, financial, legal, security, healthcare, or employment decisions must retain appropriate human review.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 5 · Industry-Scoped Agents ─────────────────────── */}
      <section className="py-24" data-testid="product-agents">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-3xl text-slate-900">
            Industry-Scoped Agents for Delivery and Operations
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENTS.map((a, i) => (
              <div key={a.name} data-testid={`agent-card-${i}`} className="org-hover-lift bg-white rounded-2xl border border-slate-200 p-7">
                <span className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center">
                  <a.icon className="h-4 w-4 text-blue-600" />
                </span>
                <p className="mt-5 font-outfit font-bold text-slate-900 text-base tracking-[-0.02em] leading-snug">{a.name}</p>
                <p className="mt-2 text-[13px] text-slate-600 leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 max-w-4xl" data-testid="custom-agent-builder">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-bold">Custom agent builder</p>
            <p className="mt-3 text-sm text-slate-700 leading-relaxed">
              Where enabled, customers can configure agent instructions, inputs, data access, triggers, autonomy levels, and approval requirements.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={ORQYNE_SITE}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="agents-capabilities-btn"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                See ORQYNE AI Capabilities
                <ArrowUpRight className="h-[14px] w-[14px]" />
              </a>
              <button
                onClick={openCalendly}
                data-testid="agents-governance-btn"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                Discuss Agent Governance
                <ArrowRight className="h-[14px] w-[14px]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6 · Connectors ─────────────────────────────────── */}
      <section className="py-24 bg-slate-50 border-y border-slate-200" data-testid="product-connectors">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-3xl text-slate-900">
            Connect the Systems That Already Hold Your Delivery Signals
          </h2>
          <p className="mt-6 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            ORQYNE includes a growing connector catalogue spanning source control, project management, Information Technology service management, observability, communications, customer systems, finance, human resources, and business operations. Connector availability, direction of data flow, authentication method, and production status vary by integration. Required integrations should be confirmed during the pilot or implementation scope.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONNECTORS.map((c, i) => (
              <div key={c.name} data-testid={`connector-card-${i}`} className="org-hover-lift bg-white rounded-2xl border border-slate-200 p-7">
                <span className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center">
                  <c.icon className="h-4 w-4 text-blue-600" />
                </span>
                <p className="mt-5 font-outfit font-bold text-slate-900 text-[15px] tracking-[-0.01em]">{c.name}</p>
                <p className="mt-2 text-[13px] text-slate-600 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 7 · Team Collaboration ─────────────────────────── */}
      <section className="py-24" data-testid="product-collaboration">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-slate-900 max-w-lg">
              Keep Delivery Conversations Closer to the Work
            </h2>
            <p className="mt-6 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              ORQYNE supports project and team collaboration through channels, direct messages, mentions, notifications, presence, comments, and agent-assisted conversations. Teams can connect discussions to the relevant project, work item, sprint, document, or decision so that operating context is easier to retain.
            </p>
            <p className="mt-4 text-sm text-slate-500 leading-relaxed max-w-xl">
              Advanced retention, threaded discussions, compliance exports, and administrative controls vary by plan and current product availability.
            </p>
            <div className="mt-8 flex flex-wrap gap-2" data-testid="collaboration-highlights">
              {["Project-linked conversations", "Direct messages and channels", "Mentions and notifications", "Agent-assisted discussions", "Role-aware access"].map((h) => (
                <span key={h} className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {h}
                </span>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6">
            <UiMockPanel
              title="Project channel"
              rows={[
                { icon: MessageSquare, label: "#delivery-portfolio · 3 mentions" },
                { icon: Users, label: "Stakeholder update drafted for review" },
                { icon: Bot, label: "RAID Analyst flagged a stale dependency" },
                { icon: ScrollText, label: "Decision linked to work item DEL-1284" },
              ]}
              chips={["Work-linked context", "Role-aware access"]}
              testId="collaboration-panel"
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 8 · Plans and Evaluation ───────────────────────── */}
      <section id="plans" className="scroll-mt-28 py-24 bg-slate-50 border-y border-slate-200" data-testid="product-plans">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-3xl text-slate-900">
            Choose the Operating Support Your Team Needs
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((p) => (
              <div
                key={p.name}
                data-testid={`plan-${p.name.toLowerCase().replace(/\s+/g, "-")}`}
                className={`relative rounded-3xl border p-8 flex flex-col ${
                  p.featured
                    ? "border-slate-900 bg-slate-900 text-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.5)]"
                    : "border-slate-200 bg-white org-hover-lift"
                }`}
              >
                <p className={`font-outfit font-bold text-xl tracking-[-0.02em] leading-snug ${p.featured ? "text-white" : "text-slate-900"}`}>{p.name}</p>
                <p className={`mt-4 text-sm leading-relaxed flex-1 ${p.featured ? "text-slate-300" : "text-slate-600"}`}>{p.body}</p>
                <a
                  href="#pilot"
                  data-testid={`plan-cta-${p.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`mt-8 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-colors ${
                    p.featured ? "bg-white text-slate-900 hover:bg-slate-100" : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  Talk to Orgainse
                  <ArrowRight className="h-[13px] w-[13px]" />
                </a>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 max-w-4xl" data-testid="pricing-statement">
            <p className="text-sm text-slate-700 leading-relaxed">
              Pricing is determined by users, enabled modules, implementation requirements, Artificial Intelligence usage model, integration scope, and support requirements. Final scope and commercial terms are confirmed before implementation.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={openCalendly}
                data-testid="plans-discuss-btn"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Discuss the Right ORQYNE Plan
                <ArrowRight className="h-[14px] w-[14px]" />
              </button>
              <a
                href="#pilot"
                data-testid="plans-pilot-btn"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                Request a Guided Pilot
                <ArrowUpRight className="h-[14px] w-[14px]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 9 · Security and Governance ────────────────────── */}
      <section className="py-24" data-testid="product-security">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-3xl text-slate-900">
            Built With Tenant Awareness and Operational Safeguards
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECURITY.map((s, i) => (
              <div key={s.name} data-testid={`security-card-${i}`} className="org-hover-lift bg-white rounded-2xl border border-slate-200 p-7">
                <span className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center">
                  <s.icon className="h-4 w-4 text-blue-600" />
                </span>
                <p className="mt-5 font-outfit font-semibold text-slate-900 text-[15px] tracking-[-0.01em]">{s.name}</p>
                <p className="mt-2 text-[13px] text-slate-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-start gap-3 rounded-2xl border border-slate-300 bg-slate-50 p-6 max-w-4xl" data-testid="compliance-disclaimer">
            <BadgeCheck className="h-[17px] w-[17px] text-slate-500 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-700 leading-relaxed">
              These controls do not represent an independent certification or a guarantee of compliance. Applicability to the Health Insurance Portability and Accountability Act, General Data Protection Regulation, System and Organization Controls 2, International Organization for Standardization 27001, or other requirements depends on configuration, contracts, operating procedures, customer responsibilities, and independent professional review.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 10 · FAQ ──────────────────────────────────────── */}
      <section className="py-24 bg-slate-50 border-y border-slate-200" data-testid="product-faq">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 mb-3">Answers</p>
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-slate-900">Frequently Asked Questions</h2>
            <p className="mt-6 text-sm text-slate-600 leading-relaxed">
              Still evaluating? Write to{" "}
              <a href="mailto:support@orgainse.com" className="font-semibold text-blue-700 hover:underline">
                support@orgainse.com
              </a>{" "}
              or request a guided pilot.
            </p>
            <button
              onClick={openCalendly}
              data-testid="product-faq-cta-btn"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors"
            >
              Schedule a Product Discussion
              <ArrowUpRight className="h-[14px] w-[14px]" />
            </button>
          </div>
          <div className="lg:col-span-8 min-w-0" data-testid="product-faq-accordion">
            {FAQS.map((f, i) => (
              <div key={f.q} className="border-b border-slate-200 last:border-b-0">
                <button
                  type="button"
                  data-testid={`product-faq-question-${i}`}
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-6 text-left font-outfit text-base sm:text-lg font-semibold tracking-[-0.01em] text-slate-900"
                >
                  <span className="flex-1 min-w-0 break-words">{f.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <p data-testid={`product-faq-answer-${i}`} className="pb-6 text-sm text-slate-600 leading-relaxed">
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 11 · Final CTA + pilot form ───────────────────── */}
      <section id="pilot" className="scroll-mt-28 py-24" data-testid="product-final-cta">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 lg:p-14 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)]">
            <div aria-hidden="true" className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.25), transparent 60%)" }} />
            <div className="relative">
              <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-2xl text-slate-900">Evaluate ORQYNE on Real Work</h2>
              <p className="mt-6 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                Bring one active project, delivery workflow, or cross-functional operating problem. Orgainse will help define the success measures, configure an initial ORQYNE workspace, import relevant work, and evaluate whether the platform improves visibility, governance, and adoption before a wider rollout.
              </p>

              <form onSubmit={handlePilotSubmit} className="mt-10" data-testid="pilot-form">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-bold">Your request</p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-900" data-testid="pilot-intent">
                  <Check className="h-[14px] w-[14px] text-blue-600" />
                  Request a Guided Pilot
                  <span className="text-slate-400 font-normal">· {exp.tab}</span>
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    data-testid="pilot-name-input"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="rounded-2xl border-slate-300 h-12 text-sm focus-visible:ring-blue-600"
                  />
                  <Input
                    data-testid="pilot-email-input"
                    type="email"
                    placeholder="Work email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="rounded-2xl border-slate-300 h-12 text-sm focus-visible:ring-blue-600"
                  />
                  <Input
                    data-testid="pilot-company-input"
                    placeholder="Organisation"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="rounded-2xl border-slate-300 h-12 text-sm focus-visible:ring-blue-600 sm:col-span-2"
                  />
                </div>
                <Textarea
                  data-testid="pilot-message-input"
                  rows={3}
                  placeholder="Which project, workflow, or reporting problem should the pilot cover?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  className="mt-3 rounded-2xl border-slate-300 text-sm resize-none focus-visible:ring-blue-600"
                />
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    data-testid="pilot-submit-btn"
                    className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-[background,transform] duration-200 hover:-translate-y-[1px] shadow-[0_10px_40px_-10px_rgba(15,23,42,0.4)] disabled:opacity-50"
                  >
                    {submitting ? "Sending…" : "Request a Guided Pilot"}
                    <ArrowRight className="h-[14px] w-[14px] transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                  <button
                    type="button"
                    onClick={openCalendly}
                    data-testid="pilot-book-discussion-btn"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors"
                  >
                    Book a Product Discussion
                    <ArrowUpRight className="h-[14px] w-[14px]" />
                  </button>
                </div>
                {submitted && (
                  <p data-testid="pilot-success-message" className="mt-4 text-sm font-semibold text-blue-700">
                    Request received. An Orgainse consultant will respond with next steps.
                  </p>
                )}
              </form>

              <p className="mt-8 text-xs text-slate-500">
                Prefer to browse first? Open the{" "}
                <a href={ORQYNE_SITE} target="_blank" rel="noopener noreferrer" className="text-slate-900 font-semibold hover:underline">
                  ORQYNE product site
                </a>{" "}
                or read about{" "}
                <Link to="/services" className="text-slate-900 font-semibold hover:underline">
                  Orgainse services
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
