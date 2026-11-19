import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bot,
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
  { icon: Layers, label: "Two Industry Experiences" },
  { icon: ClipboardList, label: "Project and Portfolio Governance" },
  { icon: Database, label: "Tenant-Aware Knowledge" },
  { icon: Lock, label: "Bring Your Own Key" },
];

const PRINCIPLES = [
  { title: "Real Work, Not Demo Theatre", body: "Dashboards and reports are designed to use tenant data. Where usable data does not exist, ORQYNE uses an empty state rather than presenting fabricated performance.", icon: BadgeCheck },
  { title: "Industry-Native by Design", body: "Each tenant operates in one supported experience: Information Technology Services and Software or Canvas Business Management. Terminology, roles, modules, workflows, and analytics are separated by experience.", icon: Layers },
  { title: "Artificial Intelligence With Operating Boundaries", body: "Artificial Intelligence assistance can be grounded in approved tenant knowledge, governed through access controls, and combined with human review and approval requirements.", icon: ShieldCheck },
];

const EXPERIENCES = {
  it_services: {
    id: "it_services",
    tab: "IT Services and Software",
    icon: CircuitBoard,
    accent: "37, 99, 235",
    headline: "Operate Delivery From Project Plan to Portfolio Review.",
    intro:
      "Manage projects, portfolios, work-item hierarchies, sprints, backlogs, risks, dependencies, decisions, resources, costs, vendors, stakeholders, communications, engineering metrics, and executive reporting within one governed experience.",
    outcomesLabel: "Key outcomes",
    bullets: [
      "Clearer delivery ownership",
      "Earlier visibility into risk and dependency exposure",
      "Consistent project and portfolio reporting",
      "Stronger connection between work, cost, resources, and decisions",
      "Better reuse of project knowledge and operating history",
    ],
    cta: "Explore the IT Services Experience",
    coreLabel: "Delivery System",
    coreSub: "Tenant-aware core",
    innerChips: ["Projects", "Portfolios", "Work items"],
    outerChips: ["Risks", "Dependencies", "Decisions", "Resources", "Costs", "Vendors"],
  },
  canvas: {
    id: "canvas",
    tab: "Canvas Business Management",
    icon: PanelsTopLeft,
    accent: "124, 58, 237",
    headline: "One Governed Experience for Cross-Functional Business Operations.",
    intro:
      "Canvas Business Management is the second supported ORQYNE experience, for cross-functional business operations. It has its own terminology, roles, modules, workflows, and analytics, separate from the IT Services and Software experience.",
    outcomesLabel: "Function areas supported by Canvas agents",
    bullets: [
      "Operations and delivery",
      "Finance",
      "Sales and marketing",
      "People",
      "Legal and procurement",
      "Portfolio management",
    ],
    cta: "Explore Canvas Business Management",
    coreLabel: "Canvas",
    coreSub: "Business operations core",
    innerChips: ["Operations", "Delivery", "Finance"],
    outerChips: ["Sales", "Marketing", "People", "Legal", "Procurement", "Portfolio"],
  },
};

const PILLARS = [
  { title: "Plan", body: "Structure projects, portfolios, departments, work items, priorities, dependencies, milestones, and methodologies.", icon: ClipboardList },
  { title: "Execute", body: "Run work through boards, workflows, assignments, resources, time, cost, communications, documents, and collaboration.", icon: Workflow },
  { title: "Understand", body: "Review project health, business health, portfolio status, delivery metrics, money impact, trends, and reports generated from available tenant data.", icon: Radar },
  { title: "Govern", body: "Manage risks, assumptions, issues, dependencies, approvals, decisions, stakeholders, access, compliance records, and audit visibility.", icon: ScrollText },
  { title: "Connect", body: "Bring together knowledge, Artificial Intelligence agents, workflows, connectors, notifications, team communication, and supported external systems.", icon: Network },
];

const IMPLEMENTATION_STEPS = [
  { title: "Prepare", body: "Use an ORQYNE template or map an existing supported file." },
  { title: "Validate", body: "Review required fields, owners, dependencies, project structure, and potential conflicts." },
  { title: "Configure", body: "Set the experience, terminology, roles, modules, workflow, and governance model." },
  { title: "Operate", body: "Launch the workspace, onboard users, and review adoption and visibility using real work." },
];

const RAG_STEPS = [
  { title: "Index", body: "Add approved operational knowledge to the tenant environment.", icon: Database },
  { title: "Retrieve", body: "Select relevant information according to the question and the user's access.", icon: Radar },
  { title: "Generate", body: "Use the configured model to prepare an answer, draft, summary, analysis, or proposed action.", icon: Bot },
  { title: "Review", body: "Require appropriate user review before important decisions or external actions.", icon: BadgeCheck },
];

const AGENTS = [
  { name: "Project Advisor", body: "Supports project planning, delivery interpretation, schedule and cost context, forecasting, and status reporting from available tenant data.", icon: ClipboardList },
  { name: "RAID Analyst", body: "Helps review Risks, Assumptions, Issues, and Dependencies with scoring, ownership, mitigation context, and staleness visibility.", icon: Radar },
  { name: "Vendor Intelligence", body: "Supports vendor scorecards, renewal awareness, bid evaluation, contract context, and total-cost analysis.", icon: Landmark },
  { name: "Governance Copilot", body: "Supports governance, control mapping, audit evidence, policy drafts, and approval workflows as a starting point for professional review.", icon: ScrollText },
  { name: "Site Reliability Engineering and Incident Assistant", body: "Supports incident triage, runbook retrieval, service-level context, incident analysis, and post-incident documentation.", icon: Server },
  { name: "Canvas Business-Function Agents", body: "Use function-focused agents for operations, delivery, finance, sales, marketing, people, legal, procurement, and portfolio management.", icon: PanelsTopLeft },
  { name: "Custom Agents", body: "Where enabled, create controlled agent workflows with defined instructions, approved data access, triggers, autonomy levels, and approval gates.", icon: Bot },
];

const CONNECTORS = [
  { name: "Development and Source Control", body: "Repository, issue, and delivery signals where supported.", icon: GitBranch },
  { name: "Project and Work Management", body: "Imports, references, or synchronisation according to connector capability.", icon: ClipboardList },
  { name: "Information Technology Service Management", body: "Incidents, requests, changes, service levels, and operating records.", icon: Workflow },
  { name: "Observability and Incident Response", body: "Monitoring, alerting, and incident signals for relevant workflows.", icon: Radar },
  { name: "Communications and Collaboration", body: "Approved communication, notification, and collaboration channels.", icon: MessageSquare },
  { name: "Business Operations", body: "Customer, finance, enterprise resource planning, people, legal, and procurement systems where supported.", icon: Network },
];

const PLANS = [
  { name: "Trial", body: "Evaluate the core workspace with a limited-time trial before selecting a paid plan.", featured: false },
  { name: "Startup", body: "For small teams that need structured projects, boards, knowledge, collaboration, and essential governance.", featured: false },
  { name: "Small and Medium-Sized Business", body: "For organisations managing multiple teams, projects, functions, reporting requirements, integrations, and administrative controls.", featured: true },
  { name: "Enterprise", body: "For organisations requiring advanced identity, security review, optional physical data segregation, custom implementation, or defined support requirements.", featured: false },
];

const SECURITY = [
  { name: "Access and Roles", body: "Role-based permissions, custom roles, and administrative controls support responsibility-based access.", icon: Users },
  { name: "Tenant Awareness", body: "Tenant-scoped data controls and optional physical collection segregation support different isolation requirements.", icon: Layers },
  { name: "Identity", body: "Multi-Factor Authentication for platform administration and supported Single Sign-On options for tenant environments.", icon: Fingerprint },
  { name: "Auditability", body: "Audit records, administrative history, and governed configuration support traceability.", icon: ScrollText },
  { name: "Secrets and Encryption Services", body: "Environment-based secret management and encryption services support secure configuration handling.", icon: Lock },
  { name: "Controlled Artificial Intelligence", body: "Provider settings, agent autonomy, approval gates, and access restrictions support governed Artificial Intelligence use.", icon: Bot },
];

// Answers drafted strictly from orgainse.live wording (swap for the official answers when supplied).
const FAQS = [
  { q: "What is ORQYNE?", a: "ORQYNE is service-backed delivery governance software by Orgainse. It brings project execution, portfolio visibility, business workflows, knowledge, decisions, governance, and Artificial Intelligence assistance into one tenant-aware platform for Information Technology services, software delivery, and cross-functional business operations." },
  { q: "Which operating experiences does ORQYNE support?", a: "Two: Information Technology Services and Software, and Canvas Business Management. Each tenant operates in one supported experience, with terminology, roles, modules, workflows, and analytics separated by experience." },
  { q: "How is ORQYNE different from a task-management tool?", a: "ORQYNE helps teams move beyond disconnected task tracking. Projects, portfolios, risks, dependencies, decisions, resources, costs, knowledge, and governance are managed together, so teams operate with clearer ownership, stronger reporting, and better decision context." },
  { q: "Can ORQYNE work with tools we already use?", a: "The ORQYNE connector catalogue covers categories such as source control, project management, Information Technology service management, observability, communications, customer systems, finance, enterprise resource planning, human resources, legal, and procurement. Connector availability, supported actions, authentication, and plan eligibility should be confirmed before purchase." },
  { q: "What does Retrieval-Augmented Generation mean in ORQYNE?", a: "ORQYNE can retrieve relevant information from tenant-approved documents, projects, decisions, work items, and knowledge sources before generating an Artificial Intelligence-assisted response, while retaining user permissions, provider configuration, approval controls, and human accountability. Artificial Intelligence-generated output may contain errors." },
  { q: "Can we use our own Artificial Intelligence provider keys?", a: "ORQYNE supports Bring Your Own Key and configurable Artificial Intelligence providers. Provider settings, agent autonomy, approval gates, and access restrictions support governed Artificial Intelligence use." },
  { q: "Does ORQYNE provide security and compliance certifications?", a: "Product controls alone do not establish regulatory compliance or certification. ORQYNE includes controls such as tenant-aware data controls, role-based permissions, administrative authentication, audit capabilities, and secret management. Customers must assess their own legal, security, privacy, contractual, and operational responsibilities." },
  { q: "How should we evaluate ORQYNE?", a: "Services and delivery organisations can use a guided pilot on one live project, multi-team workflow, or reporting problem, with Orgainse supporting workflow mapping, configuration, import, onboarding, governance, and executive review. Scope, data handling, responsibilities, and success criteria are agreed before the pilot begins." },
  { q: "Is a trial available?", a: "Yes. Individual project leaders and small teams can start a 7-day trial or entry plan, configure a focused workspace, and expand only after the operating model proves useful." },
];

const Products = () => {
  const { openCalendly } = useCalendly();
  const [activeExp, setActiveExp] = useState("it_services");
  const [openFaq, setOpenFaq] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", company: "", team_size: "1 – 10", message: "" });
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
        service_type: "ORQYNE Pilot",
        team_size: form.team_size,
        operating_experience: exp.tab,
        message: `[ORQYNE Pilot · ${exp.tab} · Team size ${form.team_size}] ${form.message}`,
        leadType: "orqyne_pilot",
      });
      setSubmitted(true);
      setForm({ name: "", email: "", company: "", team_size: "1 – 10", message: "" });
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
      applicationSubCategory: "AI Project Management and Delivery Governance Software",
      operatingSystem: "Web",
      url: "https://www.orgainse.com/products",
      sameAs: [ORQYNE_SITE],
      mainEntityOfPage: ORQYNE_SITE,
      brand: { "@type": "Brand", name: "ORQYNE" },
      provider: { "@id": "https://www.orgainse.com/#organization" },
      description:
        "AI project management and delivery governance software for IT services, software teams and business workflows, with AI agents and governed RAG knowledge. ORQYNE brings project execution, portfolio visibility, business workflows, knowledge, decisions, governance, and Artificial Intelligence assistance into one tenant-aware platform.",
      publisher: { "@type": "Organization", name: "Orgainse", url: "https://www.orgainse.com/" },
      offers: PLANS.map((p) => ({ "@type": "Offer", name: `ORQYNE ${p.name}`, description: p.body, url: `${ORQYNE_SITE}/#pricing`, availability: "https://schema.org/InStock" })),
      featureList: [
        "Two operating experiences: IT Services and Software, and Canvas Business Management",
        "Projects, portfolios, work-item hierarchies, sprints and backlogs",
        "Risk, Assumption, Issue and Dependency (RAID) management, decisions and approvals",
        "Resources, costs, vendors, stakeholders and executive reporting",
        "Retrieval-Augmented Generation grounded in approved tenant knowledge",
        "AI agents: Project Advisor, RAID Analyst, Vendor Intelligence, Governance Copilot, SRE and Incident Assistant, Canvas Business-Function Agents, Custom Agents",
        "Connector catalogue, team channels and direct messages",
        "Role-based permissions, audit records, Bring Your Own Key and optional physical data segregation",
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
      name: "Move From Existing Project Data to a Governed ORQYNE Workspace",
      step: IMPLEMENTATION_STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.body })),
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-manrope antialiased" data-testid="products-page">
      <SEOHead
        title="ORQYNE: AI Project Management and Delivery Governance"
        description="ORQYNE by Orgainse: AI project management and delivery governance software for IT services, software teams and business workflows, with AI agents and governed RAG knowledge."
        canonical="https://www.orgainse.com/products"
        keywords="ORQYNE, AI project management software, delivery governance software, project portfolio governance, RAID management, AI agents for project management, RAG knowledge, Canvas Business Management, guided pilot"
        structuredData={structuredData}
      />

      {/* ── SECTION 1 · Product Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 lg:pt-24 pb-16" data-testid="product-hero">
        <GridBackdrop />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <h1 className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white/70 backdrop-blur-sm text-[11px] font-normal uppercase tracking-[0.2em] text-slate-500 shadow-sm" data-testid="product-eyebrow">
                <Layers className="h-3 w-3 text-blue-600" />
                ORQYNE · Project Portfolio and Delivery Governance Software by Orgainse
              </h1>

              <div className="mt-7">
                <OrqyneLogo className="h-11 sm:h-14" />
              </div>

              <h2 data-testid="product-headline" className="mt-7 font-outfit font-bold text-4xl sm:text-5xl lg:text-[58px] leading-[1.06] text-slate-900">
                See the Work. Govern the Delivery.{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-blue-600">Move With Confidence.</span>
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-1.5 h-3 bg-blue-100 rounded-sm" />
                </span>
              </h2>

              <p className="mt-7 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                <span className="block text-[11px] uppercase tracking-[0.2em] font-bold text-blue-700 mb-3" data-testid="product-positioning">Service-Backed Delivery Governance by Orgainse</span>
                ORQYNE brings project execution, portfolio visibility, business workflows, knowledge, decisions, governance, and Artificial Intelligence assistance into one tenant-aware platform. Built for Information Technology services, software delivery, and cross-functional business operations, ORQYNE helps teams move beyond disconnected task tracking and operate with clearer ownership, stronger reporting, and better decision context.
              </p>
              <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                Orgainse supports workflow mapping, configuration, import, onboarding, governance, and executive review, so customers are not left to configure a complex operating system alone.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="#pilot"
                  data-testid="product-pilot-btn"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-[background,transform] duration-200 hover:-translate-y-[1px] shadow-[0_10px_40px_-10px_rgba(15,23,42,0.4)]"
                >
                  Request a Guided Pilot
                  <ArrowRight className="h-[15px] w-[15px] transition-transform duration-200 group-hover:translate-x-1" />
                </a>
                <a
                  href={ORQYNE_SITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="product-trial-btn"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors"
                >
                  Start a 7-Day Trial
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

      {/* ── Principles ── */}
      <section className="py-20" data-testid="product-principles">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRINCIPLES.map((pr, i) => (
            <div key={pr.title} data-testid={`principle-${i}`} className="org-hover-lift bg-white rounded-2xl border border-slate-200 p-7">
              <span className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center">
                <pr.icon className="h-[18px] w-[18px] text-blue-600" />
              </span>
              <h3 className="mt-5 font-outfit font-bold text-slate-900 text-lg tracking-[-0.02em]">{pr.title}</h3>
              <p className="mt-2 text-[13px] text-slate-600 leading-relaxed">{pr.body}</p>
            </div>
          ))}
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
                <p className="mt-7 text-[11px] uppercase tracking-[0.2em] font-bold text-slate-500">{exp.outcomesLabel}</p>
                <ul className="mt-4 space-y-3">
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

      {/* ── Five pillars ── */}
      <section id="pillars" className="scroll-mt-28 py-24" data-testid="product-pillars">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-3xl text-slate-900">
            Plan, Execute, Understand, Govern, <span className="text-slate-400">and Connect</span>
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PILLARS.map((pl) => (
              <div key={pl.title} data-testid={`pillar-${pl.title.toLowerCase()}`} className="org-hover-lift bg-white rounded-2xl border border-slate-200 p-6">
                <span className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center">
                  <pl.icon className="h-[16px] w-[16px] text-blue-600" />
                </span>
                <p className="mt-5 font-outfit font-bold text-slate-900 text-base tracking-[-0.02em]">{pl.title}</p>
                <p className="mt-2 text-[13px] text-slate-600 leading-relaxed">{pl.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3 · How ORQYNE Is Implemented ──────────────────── */}
      <section className="py-24 bg-slate-50 border-y border-slate-200" data-testid="product-implementation">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-3xl text-slate-900">
            Move From Existing Project Data <span className="text-slate-400">to a Governed Workspace</span>
          </h2>
          <p className="mt-6 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            Use structured templates or supported spreadsheet imports to bring projects, work items, owners, dependencies, milestones, and related data into ORQYNE. The import process is designed to validate data and allow review before records are committed to the workspace.
          </p>
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
            Ground Artificial Intelligence in Your Approved Operating Knowledge
          </h2>
          <p className="mt-6 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            ORQYNE can retrieve relevant information from tenant-approved documents, projects, decisions, work items, and knowledge sources before generating an Artificial Intelligence-assisted response. The objective is to make Artificial Intelligence more context-aware while retaining user permissions, provider configuration, approval controls, and human accountability. Artificial Intelligence-generated output may contain errors. Users remain responsible for reviewing material recommendations and actions.
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
            Artificial Intelligence Agents Designed Around the Work
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
            Connect ORQYNE to the Systems Your Teams Already Use
          </h2>
          <p className="mt-6 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            The ORQYNE connector catalogue covers categories such as source control, project management, Information Technology service management, observability, communications, customer systems, finance, enterprise resource planning, human resources, legal, and procurement. Not every catalogue entry has the same production status or capability. Connector availability, supported actions, authentication, and plan eligibility should be confirmed before purchase.
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
              Keep the Conversation Connected to the Work
            </h2>
            <p className="mt-6 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Use channels, direct messages, mentions, comments, notifications, presence, and agent-assisted conversations to maintain context around projects, work items, documents, and decisions.
            </p>
            <p className="mt-4 text-sm text-slate-500 leading-relaxed max-w-xl">
              Advanced threads, retention, export, and compliance administration are available according to product tier and current feature status.
            </p>
            <div className="mt-8 flex flex-wrap gap-2" data-testid="collaboration-highlights">
              {["Channels and direct messages", "Mentions and notifications", "Work-linked context", "Agent-assisted conversations", "Role-aware access"].map((h) => (
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
            Start With the Evaluation Path That Matches Your Team
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="evaluation-paths">
            <div className="rounded-3xl border border-slate-200 bg-white p-8">
              <h3 className="font-outfit font-bold text-xl text-slate-900 tracking-[-0.02em]">For Services and Delivery Organisations</h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">Use a guided pilot to evaluate one live project, multi-team workflow, or reporting problem. Orgainse supports workflow mapping, configuration, import, onboarding, governance, and executive review.</p>
              <a href="#pilot" data-testid="path-pilot-btn" className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors">Request a Guided Pilot <ArrowRight className="h-[13px] w-[13px]" /></a>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-8">
              <h3 className="font-outfit font-bold text-xl text-slate-900 tracking-[-0.02em]">For Individual Project Leaders and Small Teams</h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">Start with an available trial or entry plan, configure a focused workspace, and expand only after the operating model proves useful.</p>
              <a href={ORQYNE_SITE} target="_blank" rel="noopener noreferrer" data-testid="path-trial-btn" className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full border border-slate-300 text-slate-900 text-sm font-semibold hover:bg-slate-50 transition-colors">Start a 7-Day Trial <ArrowUpRight className="h-[13px] w-[13px]" /></a>
            </div>
          </div>
          <h2 className="mt-20 font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-3xl text-slate-900">
            Choose the Level of Control, Scale, and Support You Need
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
                  Contact Sales
                  <ArrowRight className="h-[13px] w-[13px]" />
                </a>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 max-w-4xl" data-testid="pricing-statement">
            <p className="text-sm text-slate-700 leading-relaxed">
              Pricing depends on users, enabled modules, Artificial Intelligence usage, integrations, implementation scope, and support requirements. Final commercial terms are confirmed before purchase. Contact sales at{" "}
              <a href="mailto:support@orgainse.com" className="font-semibold text-blue-700 hover:underline">support@orgainse.com</a>.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={openCalendly}
                data-testid="plans-discuss-btn"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Discuss the Right Plan
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
            Operational Controls for Business-Critical Work
          </h2>
          <p className="mt-6 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            ORQYNE includes tenant-aware data controls, role-based permissions, administrative authentication, audit capabilities, secret management, environment separation, configurable Artificial Intelligence providers, and optional physical data segregation. Enterprise requirements such as Single Sign-On, data handling, contractual controls, deployment architecture, and security review are assessed during commercial and implementation scoping.
          </p>
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
                {/* Always in the HTML (crawlers, AI); collapsed visually. */}
                <p data-testid={`product-faq-answer-${i}`} hidden={openFaq !== i} className="pb-6 text-sm text-slate-600 leading-relaxed">
                  {f.a}
                </p>
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
              <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] max-w-2xl text-slate-900">Bring One Live Project, Not a Generic Demo</h2>
              <p className="mt-6 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                A guided ORQYNE pilot starts with one real project or workflow. Together, we define the success measures, configure the operating model, import relevant work, onboard the required users, and evaluate whether ORQYNE improves visibility, governance, and execution before any wider commitment.
              </p>

              <p className="mt-4 text-xs text-slate-500 max-w-2xl leading-relaxed" data-testid="pilot-no-guarantee">
                No guaranteed savings, delivery improvements, or compliance outcomes are assumed. Scope, data handling, responsibilities, and success criteria are agreed before the pilot begins.
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
                    className="rounded-2xl border-slate-300 h-12 text-sm focus-visible:ring-blue-600"
                  />
                  <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Team size" data-testid="pilot-team-size">
                    <span className="text-xs text-slate-500 mr-1">Team size</span>
                    {["1 – 10", "11 – 50", "51 – 200", "200+"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        role="radio"
                        aria-checked={form.team_size === t}
                        data-testid={`pilot-team-size-${t.replace(/\D+/g, "-").replace(/^-|-$/g, "") || "200-plus"}`}
                        onClick={() => setForm({ ...form, team_size: t })}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${form.team_size === t ? "bg-slate-900 text-white border-slate-900" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2" data-testid="pilot-experience">
                  <span className="text-xs text-slate-500 mr-1">Operating experience</span>
                  {Object.values(EXPERIENCES).map((x) => (
                    <button
                      key={x.id}
                      type="button"
                      data-testid={`pilot-experience-${x.id}`}
                      onClick={() => setActiveExp(x.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${activeExp === x.id ? "bg-blue-600 text-white border-blue-600" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}
                    >
                      {x.tab}
                    </button>
                  ))}
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
                Or{" "}
                <a href={ORQYNE_SITE} target="_blank" rel="noopener noreferrer" className="text-slate-900 font-semibold hover:underline" data-testid="pilot-trial-link">
                  start a 7-day trial
                </a>
                . Reach us directly at{" "}
                <a href="mailto:support@orgainse.com" className="text-slate-900 font-semibold hover:underline">support@orgainse.com</a>, or read about{" "}
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
