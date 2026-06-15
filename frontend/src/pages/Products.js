import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Sparkles,
  Database,
  Search,
  Shield,
  FileSpreadsheet,
  Bot,
  Layers,
  Globe,
  Lock,
  Cpu,
  Workflow,
  MessageSquare,
  ChevronDown,
  ExternalLink,
  Zap,
  Users,
  Award,
  Brain,
  KeyRound,
  Server,
  Code2,
} from "lucide-react";
import SEOHead from "../components/SEOHead";
import { OrqyneLogo, OrqyneMark } from "../components/OrqyneLogo";

const SIGNUP_URL = "https://orgainse.live/signup";

// ---------- DATA ---------------------------------------------------------

const HERO_STATS = [
  { key: "agents", value: "25", label: "RAG-grounded AI agents" },
  { key: "cockpits", value: "8", label: "PMI cockpit tabs per project" },
  { key: "integrations", value: "40+", label: "Live MCP integrations" },
  { key: "byok", value: "BYOK", label: "OpenAI · Anthropic · Gemini" },
];

const COCKPITS = [
  {
    id: "it",
    name: "IT Services & Software",
    accent: "from-blue-500 to-indigo-600",
    tag: "Most chosen for engineering teams",
    headline: "A RAG-grounded AI sprint team that already knows your codebase.",
    bullets: [
      "AI Sprint Planner trained on your own backlog, retrospectives, and ADRs",
      "Six platform agents on day one — Delivery, Risk, Quality, Comms, Knowledge, Planner",
      "Tribes / Squads / Chapters org model + on-call rotations",
      "40+ engineering connectors (GitHub, GitLab, Jira, Azure DevOps, PagerDuty…)",
      "Engineering Excellence Scorecard with industry benchmarks",
    ],
  },
  {
    id: "canvas",
    name: "Canvas",
    accent: "from-emerald-500 to-teal-600",
    tag: "Customizable for any industry",
    headline: "A blank cockpit that learns your industry from your data.",
    bullets: [
      "Define your own object model — projects, milestones, KPIs",
      "Same 7 canonical agents, retuned with your own RAG corpus",
      "Mix and match templates from IT, Healthcare, or build from scratch",
      "Ideal for consulting practices and multi-vertical SMEs",
      "Marketplace-ready: package your playbook as a sellable agent",
    ],
  },
  {
    id: "rcm",
    name: "US Healthcare Analytics",
    accent: "from-purple-500 to-pink-600",
    tag: "Built for revenue intelligence",
    headline: "AR leakage, denial trends, and payer behavior — surfaced in 90 seconds.",
    bullets: [
      "Healthcare-specific agents for denial intelligence and payer analytics",
      "Closed-loop audit log for every PHI access, export, and AI prompt",
      "HIPAA-modelled BAA template + region-locked US data residency",
      "Aligns with our Healthcare Revenue Intelligence Advisory engagement",
      "Strictly advisory + analytics — never operational billing or coding",
    ],
  },
];

const PLATFORM_AGENTS = [
  { name: "Strategic Advisor", desc: "Portfolio-level outcomes, OKR alignment, exec narratives.", icon: Brain },
  { name: "Sprint Planner", desc: "Sprint planning, capacity, and dependency resolution.", icon: Workflow },
  { name: "Delivery Ops", desc: "Standup synthesis, blocker triage, daily progress.", icon: Zap },
  { name: "Risk & RAID", desc: "Predictive risk + What-If forecasting on your data.", icon: Shield },
  { name: "Communications", desc: "Stakeholder updates, release notes, exec briefings.", icon: MessageSquare },
  { name: "Quality Guardian", desc: "Quality trends, code-health, retro analysis.", icon: Award },
  { name: "Knowledge / Runbook", desc: "Runbook-aware AI tutor for onboarding & search.", icon: Database },
];

const RAG_STEPS = [
  { step: "1", name: "Index", desc: "Your docs + runbooks + history embedded per tenant.", icon: Database },
  { step: "2", name: "Retrieve", desc: "Top-k passages pulled before any token is generated.", icon: Search },
  { step: "3", name: "Ground", desc: "Model writes ONLY from the retrieved context.", icon: Lock },
  { step: "4", name: "Cite", desc: "Every answer points back at the source paragraph.", icon: CheckCircle },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Download the engineering template", desc: "Epics + stories + owners + capacity. Three sheets, five minutes." },
  { step: "2", title: "Upload & validate", desc: "We extract every row, parse story points, and surface dependency loops before commit." },
  { step: "3", title: "Board + delivery agents", desc: "Scrum / Kanban board, owners, on-call rota, and 7 canonical agents — auto-provisioned." },
  { step: "4", title: "Live industry cockpit", desc: "Smart Briefing, sprint velocity, productivity score — running on real data." },
];

const INTEGRATIONS = [
  "GitHub", "GitLab", "Bitbucket", "Jira", "Azure DevOps", "Linear",
  "Asana", "Monday", "ClickUp", "Jenkins", "CircleCI", "Confluence",
  "Notion", "Slack", "Microsoft Teams", "Discord", "PagerDuty", "Sentry",
  "DataDog", "Splunk", "Snowflake",
];

const SECURITY = [
  { icon: Lock, title: "AES-256 at rest", desc: "TLS 1.3 in transit. Customer-managed keys on Enterprise." },
  { icon: Layers, title: "Multi-tenant isolation", desc: "Physical collection prefix + logical tenant scoping. Cross-tenant reads physically impossible." },
  { icon: KeyRound, title: "BYOK or managed", desc: "Use our managed AI key or bring your own provider keys per workspace." },
  { icon: Shield, title: "Closed-loop audit", desc: "Every PHI access, export, integration mutation, and AI prompt logged with full context." },
  { icon: Globe, title: "Choose your region", desc: "US · EU · India residency. Pick at signup, locked at provision time." },
  { icon: Server, title: "BYO compliance template", desc: "HIPAA-modelled BAA, GDPR DPA, SOC2-aligned report templates — generate and adapt." },
];

const TIERS = [
  {
    name: "Starter",
    audience: "1 – 10 users",
    sub: "Single-team programmes ready to ship faster.",
    highlight: false,
    items: [
      "Projects · epics · tasks · subtasks",
      "Scrum & Kanban boards",
      "AI Planner + Delivery Ops + Comms agents",
      "Team Chat — 5 public channels + 1-on-1 DMs",
      "Knowledge base (1 space)",
      "GitHub + 1 issue tracker connector",
      "Email/password + 2FA",
      "30-day audit retention",
      "Managed AI key included",
    ],
  },
  {
    name: "Professional",
    audience: "11 – 50 users",
    sub: "Multi-team portfolios with cross-industry visibility.",
    highlight: true,
    items: [
      "Everything in Starter +",
      "Portfolio + cross-team views",
      "All 7 canonical AI agents incl. Risk & RAID + Knowledge",
      "Full Industry Cockpit (IT · Canvas · RCM Analytics)",
      "Team Chat — unlimited channels, threads, reactions",
      "@orqyne AI in chat (5/day) — grounded in Project / Sprint / Epic",
      "40+ engineering connectors",
      "SSO (Google / Microsoft)",
      "5 RBAC roles · 90-day audit retention",
      "Region choice (US · EU · India)",
      "BYOK at workspace level",
    ],
  },
  {
    name: "Enterprise",
    audience: "51+ users",
    sub: "Regulated industries, custom agents, dedicated infra.",
    highlight: false,
    items: [
      "Everything in Professional +",
      "Predictive risk + What-If forecast",
      "Custom AI Agent Builder + Agent Studio",
      "Unlimited @orqyne AI · 500MB files · custom retention",
      "Marketplace publishing rights",
      "SAML / SCIM SSO",
      "1+ year audit + SIEM export",
      "Dedicated infrastructure option",
      "Customer-managed encryption keys",
      "BYO compliance template (BAA · DPA · SOC2)",
    ],
  },
  {
    name: "Custom",
    audience: "Talk to us",
    sub: "Air-gapped, sovereign-cloud, or unique scopes.",
    highlight: false,
    items: [
      "Everything in Enterprise +",
      "Air-gapped or sovereign-cloud deployment",
      "Custom AI agents built by our team",
      "Industry-specific cockpit co-development",
      "White-glove migration & training",
      "Dedicated CSM + 24×7 priority support",
      "Negotiated SLAs",
    ],
  },
];

const FAQS = [
  {
    q: "How is ORQYNE different from Jira, Linear, or Azure DevOps?",
    a: "Those are tracking tools. ORQYNE is a Service-as-a-Platform with an AI delivery workforce. 25 RAG-grounded agents actively plan sprints from your backlog, surface delivery risks before standup, draft stakeholder updates, and score quality trends. Tracking tools log what already happened — ORQYNE drives what happens next.",
  },
  {
    q: 'What does "RAG-grounded" actually mean?',
    a: "Retrieval-Augmented Generation. Every ORQYNE agent runs over a per-tenant index of your repos, runbooks, ADRs, retrospectives, and project history. The model is only allowed to generate from retrieved context, and every answer cites the line of code or document it came from. Hallucinations are blocked by design.",
  },
  {
    q: "How do I start? Can I just upload a spreadsheet?",
    a: "Yes. Use our universal template (or your own). ORQYNE parses tasks, owners, dependencies and milestones, lets you rewrite terminology to fit your domain (Sprint → Cycle, Project → Campaign), and provisions a tailored workspace + the 25 RAG-grounded agents — typically in 180 seconds.",
  },
  {
    q: "Who owns the AI? Can I bring my own keys?",
    a: "Both modes are first-class. Use our managed AI key for zero key management and predictable cost, or plug in your own AI-provider keys (OpenAI, Anthropic, Gemini) at the workspace or project level (BYOK). We never see your BYOK traffic.",
  },
  {
    q: "How do you handle compliance?",
    a: "TLS 1.3 in transit, AES-256 at rest, multi-tenant isolation (physical + logical), and a closed-loop audit trail you can export to your SIEM. HIPAA-modelled BAA, GDPR DPA, and SOC2 report templates are generated from your workspace settings and adaptable to your regulator. Region residency (US/EU/India) is locked at provision time.",
  },
  {
    q: "What is the AI Agent Marketplace?",
    a: "Every PM has a hard-won playbook. The ORQYNE Agent Marketplace lets you turn yours into a packaged AI agent — system prompt, input fields, runner — and ship it to thousands of teams via a tier-gated Custom Agent Builder. Build for your team first; sell to the world second. Curated for prompt-injection safety + grounding hygiene before listing.",
  },
];

// ---------- COMPONENT ---------------------------------------------------

const ProductsPage = () => {
  const [activeCockpit, setActiveCockpit] = useState("it");
  const [openFaq, setOpenFaq] = useState(null);
  const current = COCKPITS.find((c) => c.id === activeCockpit);

  // -------- Page-scoped JSON-LD (SoftwareApplication + FAQPage + SoftwareSourceCode) --------
  const structuredData = React.useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "ORQYNE",
        "alternateName": ["Orqyne AI", "Orqyne PMaaS", "ORQYNE by Orgainse"],
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Project Management",
        "operatingSystem": "Web",
        "url": "https://orgainse.live",
        "sameAs": [
          "https://orgainse.live",
          "https://www.orgainse.com/products"
        ],
        "image": "https://www.orgainse.com/orqyne/long-1200.png",
        "logo": "https://www.orgainse.com/orqyne/mark-400.png",
        "description":
          "ORQYNE is Orgainse's first Service-as-a-Platform (SaaP). Productised consulting outcomes, 25 RAG-grounded AI agents, an 8-tab PMI project cockpit, and 40+ live MCP integrations. Pre-built playbooks for IT Services & Software, Canvas (any industry), and US Healthcare Revenue Cycle. BYOK or managed AI key.",
        "softwareVersion": "2026.1",
        "brand": { "@type": "Brand", "name": "ORQYNE" },
        "creator": {
          "@type": "Organization",
          "name": "Orgainse Consulting",
          "url": "https://www.orgainse.com"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Orgainse Consulting",
          "url": "https://www.orgainse.com"
        },
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "USD",
          "offerCount": "4",
          "lowPrice": "0",
          "highPrice": "0",
          "availability": "https://schema.org/InStock",
          "url": "https://www.orgainse.com/contact?product=orqyne",
          "description": "Four tiers: Starter (1-10 users), Professional (11-50 users), Enterprise (51+ users), Custom. Contact sales for region- and team-specific pricing."
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "bestRating": "5",
          "ratingCount": "42"
        },
        "featureList": [
          "25 RAG-grounded AI agents per workspace (7 canonical + 12 RCM specialist + 6 universal library)",
          "8-tab PMI project cockpit (Dashboard, Planning, Sprints, Backlog, RAID, Resources, Time, Cost, Communications, Closure)",
          "3 industry-native cockpits: IT Services & Software, Canvas (any industry), US Healthcare Revenue Cycle",
          "Spreadsheet-to-workspace customisation in 180 seconds",
          "7 canonical platform agents: Strategic Advisor, Sprint Planner, Delivery Ops, Risk & RAID, Communications, Quality Guardian, Knowledge / Runbook",
          "Team Chat with @orqyne AI grounded in Project / Sprint / Epic",
          "Tier-gated Custom Agent Builder + ORQYNE Agent Marketplace publishing rights",
          "40+ live MCP integrations (GitHub, GitLab, Bitbucket, Jira, Azure DevOps, Linear, Asana, Monday, ClickUp, Jenkins, CircleCI, Confluence, Notion, Slack, Microsoft Teams, Discord, PagerDuty, Sentry, DataDog, Splunk, Snowflake)",
          "BYOK (OpenAI, Anthropic, Gemini) or managed AI key",
          "TLS 1.3 in transit, AES-256 at rest, multi-tenant isolation",
          "Region choice (US / EU / India) locked at provision time",
          "SSO (Google, Microsoft, SAML, SCIM)",
          "HIPAA-modelled BAA, GDPR DPA, SOC2-aligned audit report templates"
        ],
        "audience": {
          "@type": "BusinessAudience",
          "audienceType": [
            "Software engineering teams",
            "IT services and consulting firms",
            "US healthcare revenue cycle leaders",
            "PMO and delivery management",
            "Startups and SMEs"
          ]
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": "https://www.orgainse.com/products#faq",
        "mainEntity": FAQS.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a }
        }))
      },
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "How ORQYNE Provisions a RAG-Grounded AI Workspace From a Spreadsheet",
        "description":
          "Technical overview: ORQYNE — Orgainse's first Service-as-a-Platform — parses an industry-agnostic project spreadsheet, builds per-tenant RAG indexes over your repos, runbooks, ADRs, retrospectives, and project history, provisions an 8-tab PMI cockpit (Dashboard, Planning, Sprints, Backlog, RAID, Resources, Time, Cost, Communications, Closure), and hires 25 RAG-grounded AI agents — workspace customisable in 180 seconds.",
        "keywords":
          "RAG, retrieval-augmented generation, AI project management, PMaaS, multi-tenant SaaS, BYOK AI, healthcare revenue cycle analytics",
        "proficiencyLevel": "Expert",
        "dependencies":
          "OpenAI / Anthropic / Google AI compatible LLM providers; PostgreSQL or MongoDB-compatible datastore; OIDC/SAML SSO for identity",
        "about": [
          { "@type": "Thing", "name": "Retrieval-Augmented Generation (RAG)" },
          { "@type": "Thing", "name": "AI Agents" },
          { "@type": "Thing", "name": "Multi-tenant SaaS architecture" }
        ],
        "author": {
          "@type": "Organization",
          "name": "Orgainse Consulting",
          "url": "https://www.orgainse.com"
        }
      }
    ],
    []
  );

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="ORQYNE — Service-as-a-Platform by Orgainse Consulting"
        description="ORQYNE is Orgainse's first Service-as-a-Platform: productised consulting outcomes, 25 RAG-grounded AI agents, an 8-tab PMI project cockpit, 40+ live MCP integrations, BYOK keys, and pre-built playbooks for IT Services & Software, Canvas (any industry), and US Healthcare Revenue Cycle. No setup calls. No 90-day onboarding."
        canonical="https://orgainse.com/products"
        keywords="ORQYNE, Service-as-a-Platform, SaaP, AI project management, PMaaS, RAG-grounded AI agents, AI sprint planner, US healthcare analytics, BYOK AI, agent marketplace, MCP integrations"
        structuredData={structuredData}
      />

      {/* ─────────────────────────────────── HERO ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/40 pt-20 pb-24 lg:pt-28 lg:pb-32">
        {/* Soft background bloom */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-br from-orange-300/30 via-blue-300/20 to-purple-300/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-blue-100 shadow-sm mb-6">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-600">
                Orgainse&apos;s first Service-as-a-Platform · Built by Orgainse Consulting
              </span>
            </div>

            <div className="flex justify-center mb-10" data-testid="orqyne-logo-hero">
              <OrqyneLogo className="h-20 sm:h-24 lg:h-28" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.1]">
              Stop renting software.{" "}
              <span className="bg-gradient-to-r from-orange-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Start owning outcomes.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              ORQYNE is Orgainse&apos;s first <strong>Service-as-a-Platform</strong> — productised consulting outcomes, RAG-grounded AI agents, and a complete project lifecycle cockpit. One platform that becomes your engineering team, your revenue ops team, or your branded delivery workspace.
              <span className="block mt-3 text-base text-slate-500">
                <strong>No setup calls. No 90-day onboarding. No false promises.</strong>
              </span>
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                data-testid="hero-cta-sales"
                to="/contact?product=orqyne"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105 transition-all"
              >
                Talk to Sales
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                data-testid="hero-cta-pilot"
                href={SIGNUP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white border-2 border-slate-200 text-slate-800 font-bold shadow-md hover:border-blue-300 hover:text-blue-700 hover:scale-105 transition-all"
              >
                Start 7-day free pilot
                <ExternalLink className="h-4 w-4 opacity-70 group-hover:opacity-100" />
              </a>
            </div>

            <p className="mt-6 text-xs uppercase tracking-wider text-slate-500">
              Trusted by IT leaders, healthcare operators, and PMOs that ship outcomes
            </p>
          </div>

          {/* Stat row */}
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {HERO_STATS.map((s) => (
              <div
                key={s.key}
                data-testid={`stat-${s.key}`}
                className="bg-white/70 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-br from-blue-600 to-orange-500 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────── INDUSTRY COCKPITS ──────────────────────────── */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-wider uppercase text-orange-600 mb-3">
              Choose your cockpit
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900">
              One platform.{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Industry-native by design.
              </span>
            </h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              Click an industry. Everything below — narrative, screenshots, outcomes —
              re-renders for that cockpit only.
            </p>
          </div>

          {/* Cockpit selector */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {COCKPITS.map((c) => (
              <button
                key={c.id}
                data-testid={`cockpit-tab-${c.id}`}
                onClick={() => setActiveCockpit(c.id)}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${
                  activeCockpit === c.id
                    ? `bg-gradient-to-r ${c.accent} text-white shadow-lg scale-105`
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Active cockpit */}
          {current && (
            <div
              data-testid={`cockpit-panel-${current.id}`}
              className="grid lg:grid-cols-2 gap-10 items-center bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 p-8 lg:p-12 shadow-sm"
            >
              <div>
                <div className={`inline-block text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-gradient-to-r ${current.accent} text-white mb-4`}>
                  {current.tag}
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-5 leading-tight">
                  {current.headline}
                </h3>
                <ul className="space-y-3">
                  {current.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-slate-700">
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/contact?product=orqyne&cockpit=${current.id}`}
                  className={`mt-7 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${current.accent} text-white font-semibold hover:scale-105 transition-transform shadow`}
                >
                  Talk to sales about {current.name}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Schematic preview block */}
              <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${current.accent} p-1 shadow-2xl`}>
                <div className="bg-slate-900 rounded-xl p-6 font-mono text-xs sm:text-sm text-slate-300">
                  <div className="flex items-center gap-1.5 mb-4">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-3 text-slate-500">orqyne · cockpit · {current.id}</span>
                  </div>
                  <div className="space-y-2 leading-relaxed">
                    <div><span className="text-emerald-400">$</span> orqyne provision --industry={current.id}</div>
                    <div className="text-slate-400">→ Parsing rows… <span className="text-emerald-300">every row</span></div>
                    <div className="text-slate-400">→ Mapping owners… <span className="text-emerald-300">auto</span></div>
                    <div className="text-slate-400">→ Building dependency graph… <span className="text-emerald-300">conflicts flagged</span></div>
                    <div className="text-slate-400">→ Hiring AI agents… <span className="text-orange-300">25 RAG-grounded</span></div>
                    <div className="text-slate-400">→ Indexing knowledge base… <span className="text-blue-300">per-tenant</span></div>
                    <div className="mt-3 text-emerald-300">✓ Workspace ready · 180s</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────── HOW IT WORKS ─────────────────────────────── */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-orange-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-wider uppercase text-blue-600 mb-3">
              Starts with a spreadsheet. Ships with a delivery AI.
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 max-w-3xl mx-auto leading-tight">
              Drop your sprint sheet. We launch the{" "}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                AI delivery team.
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((s, i) => (
              <div
                key={s.step}
                data-testid={`how-step-${s.step}`}
                className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="absolute -top-4 -left-2">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 text-white font-bold flex items-center justify-center shadow-lg">
                    {s.step}
                  </div>
                </div>
                <div className="pt-5">
                  <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="h-5 w-5 text-orange-500" />
                    <h3 className="font-bold text-slate-900 text-base lg:text-lg leading-snug">
                      {s.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────── RAG EXPLAINER ─────────────────────────────── */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-purple-600 mb-3">
                RAG-first for engineering teams
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
                AI agents that already{" "}
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  read your codebase.
                </span>
              </h2>
              <p className="mt-5 text-slate-600 leading-relaxed">
                Every ORQYNE agent runs on a RAG pipeline indexed over your repos,
                runbooks, ADRs, retrospectives, and Jira history. Outputs cite the line
                of code or the doc they came from. Hallucinations are blocked by design.
              </p>

              <div className="mt-7 grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-center">
                  <div className="text-2xl font-bold text-purple-600">isolated</div>
                  <div className="text-xs text-slate-600 mt-1">Per-tenant index</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-center">
                  <div className="text-2xl font-bold text-blue-600">100%</div>
                  <div className="text-xs text-slate-600 mt-1">Source-citation</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-center">
                  <div className="text-2xl font-bold text-orange-600">every run</div>
                  <div className="text-xs text-slate-600 mt-1">Audit trail</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {RAG_STEPS.map((s) => (
                <div
                  key={s.name}
                  className="flex gap-4 bg-gradient-to-r from-slate-50 to-white rounded-2xl p-5 border border-slate-200"
                >
                  <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold flex items-center justify-center text-lg">
                    {s.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <s.icon className="h-4 w-4 text-purple-600" />
                      <h3 className="font-bold text-slate-900">{s.name}</h3>
                    </div>
                    <p className="text-sm text-slate-600">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7 canonical platform agents */}
          <div className="mt-20">
            <div className="text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                7 canonical agents.{" "}
                <span className="bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                  Hired on day one.
                </span>
              </h3>
              <p className="mt-3 text-sm text-slate-500 max-w-2xl mx-auto">
                Plus 12 RCM specialist agents in the Healthcare cockpit and an opt-in Universal Library — 25 RAG-grounded agents across the platform.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLATFORM_AGENTS.map((a) => (
                <div
                  key={a.name}
                  data-testid={`agent-${a.name.toLowerCase()}`}
                  className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all"
                >
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <a.icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">{a.name}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────── INTEGRATIONS ────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 mb-2">
              Plugs into your stack
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              <span className="text-orange-500">40+</span> engineering connectors out of the box.
            </h3>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {INTEGRATIONS.map((i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center gap-2"
              >
                <Code2 className="h-3.5 w-3.5 text-blue-500" />
                {i}
              </span>
            ))}
            <span className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-orange-400" />
              + 28 more
            </span>
          </div>
        </div>
      </section>

      {/* ────────────────────────────── TEAM CHAT ────────────────────────────── */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-emerald-600 mb-3">
                Works where your projects live
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Team Chat with an{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
                  AI teammate
                </span>{" "}
                that reads your project.
              </h2>
              <p className="mt-5 text-slate-600 leading-relaxed">
                No more flipping between Slack and your PM tool. Channels, DMs, threads —
                and an embedded AI you can ground in a specific Project, Sprint, or Epic.
                Strictly tenant-scoped — only your organisation can see it.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-700">
                {["@orqyne AI in chat — grounded answers, no tab switching",
                  "One click attaches a Project / Sprint / Epic",
                  "Public + private channels, threaded replies, reactions, pins",
                  "Files & uploads — limits scale with your plan",
                  "Strictly tenant-scoped — cross-tenant access is physically impossible"].map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {x}
                    </li>
                  ))}
              </ul>
            </div>

            {/* Chat mock */}
            <div className="rounded-2xl bg-slate-900 p-5 shadow-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-slate-200">#delivery-standup</span>
                  <span className="text-xs text-slate-500">· 12 members</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-emerald-400">Enterprise plan</span>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">SR</div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-slate-200 font-semibold">Sarah Reyes</span>
                      <span className="text-xs text-slate-500">10:14 AM</span>
                    </div>
                    <div className="text-slate-300 mt-0.5">@orqyne what tasks are blocked in Sprint 12?</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-blue-300 font-semibold">Orqyne AI</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300 uppercase tracking-wider">grounded · sprint 12</span>
                    </div>
                    <div className="text-slate-300 mt-0.5 leading-relaxed">
                      Sprint 12 has <span className="font-bold text-white">2 blocked tasks</span>:{" "}
                      <span className="text-orange-300">RCM-LEAK-1</span> (AR Leakage recovery, $157,577) blocked on payer remit reconciliation, and{" "}
                      <span className="text-orange-300">WEB-204</span> awaiting API contract from the partner team. Capacity is at 78%.
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-lg bg-slate-800/60 border border-slate-700 p-3 text-xs text-slate-500 flex items-center justify-between">
                  <span>Cmd+J to open · @orqyne to ask AI</span>
                  <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────── PRICING ────────────────────────────── */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-wider uppercase text-orange-600 mb-3">
              Find your fit
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900">
              Four tiers.{" "}
              <span className="bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                One conversation away.
              </span>
            </h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              We size every deployment to your team and industry. Tell us about your
              workspace and we&apos;ll match you with the right tier — usually within the same
              business day.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIERS.map((t) => (
              <div
                key={t.name}
                data-testid={`tier-${t.name.toLowerCase()}`}
                className={`relative rounded-3xl p-6 border-2 transition-all hover:-translate-y-1 ${
                  t.highlight
                    ? "border-orange-300 bg-white shadow-2xl shadow-orange-500/10"
                    : "border-slate-200 bg-white shadow-sm hover:shadow-lg"
                }`}
              >
                {t.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold uppercase tracking-wider shadow">
                    Most chosen
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-900">{t.name}</h3>
                <div className="text-xs uppercase tracking-wider font-semibold text-orange-600 mt-1">
                  {t.audience}
                </div>
                <p className="text-sm text-slate-600 mt-3 min-h-[40px]">{t.sub}</p>
                <ul className="mt-5 space-y-2.5 text-sm text-slate-700">
                  {t.items.map((i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  data-testid={`tier-cta-${t.name.toLowerCase()}`}
                  to={`/contact?product=orqyne&tier=${t.name.toLowerCase()}`}
                  className={`mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    t.highlight
                      ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:scale-105 shadow-lg"
                      : "bg-slate-900 text-white hover:bg-slate-700"
                  }`}
                >
                  Contact Sales
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────── SECURITY ────────────────────────────── */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-wider uppercase text-purple-600 mb-3">
              Technology that earns trust
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 max-w-3xl mx-auto leading-tight">
              Security primitives engineering teams{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                actually need.
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SECURITY.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all"
              >
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center mb-4">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* BYOK callout */}
          <div className="mt-12 grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-7 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <Cpu className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Managed AI key</h3>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                We provide the AI. You provide the data. Generous usage included in every
                plan — no per-token billing surprise. Best for teams that want zero key management.
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-white p-7 border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-3">
                <KeyRound className="h-6 w-6 text-orange-600" />
                <h3 className="text-lg font-bold text-slate-900">Bring your own keys (BYOK)</h3>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                Plug in your own AI provider keys at the workspace or project level.
                We never see your traffic. Best for regulated industries, procurement-locked
                orgs, or teams with negotiated provider contracts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────── FAQ ────────────────────────────── */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-orange-50/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-wider uppercase text-orange-600 mb-3">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900">
              Common questions,{" "}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                straight answers.
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={f.q}
                  data-testid={`faq-${i}`}
                  className={`rounded-2xl border transition-all ${
                    open ? "border-orange-300 bg-white shadow-lg" : "border-slate-200 bg-white"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-semibold text-slate-900">{f.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 flex-shrink-0 transition-transform ${open ? "rotate-180 text-orange-500" : ""}`}
                    />
                  </button>
                  {open && (
                    <div className="px-6 pb-5 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-4">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────────────────────── FINAL CTA ────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(249,115,22,0.15),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.15),transparent_60%)] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col items-center gap-3 mb-6">
            <OrqyneMark className="h-14 w-14 sm:h-16 sm:w-16" />
            <div className="text-2xl sm:text-3xl font-extrabold tracking-[0.12em] bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 bg-clip-text text-transparent">
              ORQYNE
            </div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-medium flex items-center gap-2">
              <span className="text-purple-400">✦</span>
              A product of Orgainse Consulting
              <span className="text-purple-400">✦</span>
            </div>
          </div>
          <p className="text-xs font-semibold tracking-wider uppercase text-orange-300 mb-3">
            Ready to ship outcomes
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
            Stop tracking work.{" "}
            <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
              Start shipping outcomes.
            </span>
          </h2>
          <p className="mt-5 text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Tell us about your team. We&apos;ll show you the workspace you&apos;d have if AI was
            actually doing the project management.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              data-testid="final-cta-sales"
              to="/contact?product=orqyne"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold shadow-xl hover:scale-105 transition-all"
            >
              Talk to Sales
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              data-testid="final-cta-pilot"
              href={SIGNUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold hover:bg-white/20 hover:scale-105 transition-all"
            >
              Start 7-day free pilot
              <ExternalLink className="h-4 w-4 opacity-80 group-hover:opacity-100" />
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Reply within one business day</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Personalised demo</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> ROI estimate</span>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Users className="h-3.5 w-3.5" />
            ORQYNE is an Orgainse Consulting product ·
            <a href="https://orgainse.live" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">
              orgainse.live
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
