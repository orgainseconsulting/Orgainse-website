// Copied verbatim from orgainse.live (Layers of Intelligence).
export const PRODUCT_LABELS = { it: "IT Services", canvas: "Canvas", both: "Both products", shared: "Both products" };

export const LAYERS = [
  {
    "id": "delivery",
    "t": "Delivery Intelligence",
    "d": "Knows how the work is going and what is likely to happen next.",
    "features": [
      {
        "t": "Projects, sprints and RAID",
        "d": "Cited answers across projects, sprints, risks, assumptions, issues and dependencies (RAID), change requests, vendors and earned value.",
        "p": "it"
      },
      {
        "t": "Client status pack",
        "d": "An agent gathers tasks, RAID, change requests and earned value and drafts the monthly pack for the project manager to approve.",
        "p": "it",
        "deep": true
      },
      {
        "t": "RAID clean-up",
        "d": "An agent finds entries with no owner, past their target date or untouched for weeks, and prepares fixes for each owner to approve.",
        "p": "it",
        "deep": true
      },
      {
        "t": "Change-request impact pack",
        "d": "An agent drafts the effect of a change request on scope, dates and cost.",
        "p": "it",
        "deep": true
      },
      {
        "t": "Stories, goals and decisions",
        "d": "Cited answers across stories, goals, decisions and the people working on them.",
        "p": "canvas"
      },
      {
        "t": "Story triage",
        "d": "An agent finds stories with no owner, overdue or stalled, and prepares fixes for approval.",
        "p": "canvas",
        "deep": true
      }
    ],
    "terms": [
      {
        "t": "RAID log",
        "d": "A register of Risks, Assumptions, Issues and Dependencies for a project or programme.",
        "p": "it"
      },
      {
        "t": "Earned value",
        "d": "A method that compares planned work, completed work and actual cost to measure project performance.",
        "p": "it"
      },
      {
        "t": "Schedule performance index (SPI)",
        "d": "Earned value divided by planned value; below 1 means the project is behind schedule.",
        "p": "it"
      },
      {
        "t": "Sprint scope",
        "d": "The work, usually in story points, committed to a sprint.",
        "p": "it"
      },
      {
        "t": "Velocity",
        "d": "The amount of work a team completes in a sprint, used to plan future sprints.",
        "p": "it"
      },
      {
        "t": "Change request",
        "d": "A formal proposal to change a project's scope, schedule or cost.",
        "p": "it"
      },
      {
        "t": "Delivery governance",
        "d": "The rules, roles and reviews that keep delivery on track, visible and accountable.",
        "p": "shared"
      },
      {
        "t": "Portfolio management",
        "d": "Managing a group of projects and programmes together to meet business goals.",
        "p": "shared"
      },
      {
        "t": "Project management office (PMO)",
        "d": "The team that sets standards and oversees projects across an organisation.",
        "p": "shared"
      }
    ]
  },
  {
    "id": "money",
    "t": "Money Intelligence",
    "d": "Connects the work to budgets, cost, revenue and value.",
    "features": [
      {
        "t": "Cost and margin",
        "d": "Earned value, cost performance and estimate at completion for each project.",
        "p": "it"
      },
      {
        "t": "Vendor renewal brief",
        "d": "An agent drafts a brief for vendor contracts renewing in the next 60 days.",
        "p": "it",
        "deep": true
      },
      {
        "t": "Budgets and verified value",
        "d": "Each unit's budget shown next to the value its people have verified, with units that are over-allocated flagged.",
        "p": "canvas"
      },
      {
        "t": "Value and budget review",
        "d": "An agent drafts the monthly value and budget review and its follow-up requests.",
        "p": "canvas",
        "deep": true
      }
    ],
    "terms": [
      {
        "t": "Cost performance index (CPI)",
        "d": "Earned value divided by actual cost; below 1 means the project is over budget.",
        "p": "it"
      },
      {
        "t": "Estimate at completion (EAC)",
        "d": "The forecast total cost of a project when it finishes.",
        "p": "it"
      },
      {
        "t": "Rate card",
        "d": "The agreed prices for roles or services, used for time-and-materials billing.",
        "p": "it"
      },
      {
        "t": "Time and materials",
        "d": "A contract where the client pays for time spent and materials used.",
        "p": "it"
      },
      {
        "t": "Verified value",
        "d": "Value from people's contributions that reviewers have checked and confirmed.",
        "p": "canvas"
      }
    ]
  },
  {
    "id": "people",
    "t": "People Intelligence",
    "d": "Understands who contributes what, and who has room for more.",
    "features": [
      {
        "t": "Ownership and time",
        "d": "Ask who owns which tasks, risks and actions, and see the time logged on each project.",
        "p": "it"
      },
      {
        "t": "People and Value",
        "d": "Contribution claims, verification and scoring, disputes and calibration, goals and recognition, appraisal packs and a Value Map.",
        "p": "canvas"
      },
      {
        "t": "Capacity forecasts",
        "d": "People-time available set against planned work.",
        "p": "canvas"
      },
      {
        "t": "Self-service profiles",
        "d": "People update their own profile details, and each change waits for approval.",
        "p": "canvas"
      }
    ],
    "terms": [
      {
        "t": "Value Map",
        "d": "A view of where verified value comes from across the organisation.",
        "p": "canvas"
      },
      {
        "t": "Capacity forecast",
        "d": "A projection of the people-time available against planned work.",
        "p": "canvas"
      }
    ]
  },
  {
    "id": "organisational",
    "t": "Organisational Intelligence",
    "d": "Knows how the organisation is structured and who decides.",
    "features": [
      {
        "t": "Owners and approvers",
        "d": "Changes and agent drafts go to the record owner or a workspace admin, as each workspace chooses.",
        "p": "it"
      },
      {
        "t": "Organisation Structure",
        "d": "Units, positions, people, reporting and dotted lines, history, imports and legal entities.",
        "p": "canvas"
      },
      {
        "t": "Approval routing",
        "d": "Requests routed by decision rights and spending limits, with escalation and temporary covers when an approver is away.",
        "p": "canvas"
      },
      {
        "t": "Future plans and health checks",
        "d": "Future structure plans and organisation health checks.",
        "p": "canvas"
      },
      {
        "t": "Organisation health action plan",
        "d": "An agent turns health-check findings into an action plan for approval.",
        "p": "canvas",
        "deep": true
      }
    ],
    "terms": [
      {
        "t": "Approval routing",
        "d": "Sending each request to the person with the right decision rights and spending limit.",
        "p": "canvas"
      },
      {
        "t": "Spending limit",
        "d": "The largest amount a role can approve before a request goes higher.",
        "p": "canvas"
      },
      {
        "t": "Temporary cover",
        "d": "A person who takes an approver's decisions for a set period.",
        "p": "canvas"
      },
      {
        "t": "Dotted-line reporting",
        "d": "A secondary reporting relationship alongside a person's main manager.",
        "p": "canvas"
      },
      {
        "t": "Organisation health check",
        "d": "Automatic checks for gaps such as empty positions, wide spans of control or missing approvers.",
        "p": "canvas"
      },
      {
        "t": "Legal entity",
        "d": "A registered company within a group, used to separate budgets and approvals.",
        "p": "canvas"
      }
    ]
  },
  {
    "id": "knowledge",
    "t": "Knowledge Intelligence",
    "d": "Finds the right information and answers with sources.",
    "features": [
      {
        "t": "Where to ask",
        "d": "Ask from the IT agents hub or from any project.",
        "p": "it"
      },
      {
        "t": "Canvas Copilot",
        "d": "Ask across stories, departments, organisation structure, files, meetings and chat.",
        "p": "canvas"
      },
      {
        "t": "Cited answers",
        "d": "Plain-language questions answered with links to their sources, searching by meaning and exact words, using only records the person may see, and saying when information is missing, out of date or contradictory. Follow-up questions keep their context.",
        "p": "both"
      },
      {
        "t": "Project files",
        "d": "Any file type up to 100 MB, folders, version history and in-browser previews of PDFs and images, with file contents searchable.",
        "p": "both"
      },
      {
        "t": "Company Brain",
        "d": "Answers follow links between related records, show the path they took and check every claim and number against the sources.",
        "p": "both",
        "deep": true
      },
      {
        "t": "Outside tools",
        "d": "Agents read connected tools such as Slack, Teams, Notion, Jira and GitHub.",
        "p": "both",
        "deep": true
      },
      {
        "t": "Learns per workspace",
        "d": "Team terms, corrections and house styles. An admin approves each one and can undo it. Nothing is shared between customers.",
        "p": "both",
        "deep": true
      }
    ],
    "terms": [
      {
        "t": "Retrieval-augmented generation (RAG)",
        "d": "An AI method that finds relevant records first and then writes an answer based on them, with sources.",
        "p": "shared"
      },
      {
        "t": "Cited answer",
        "d": "An AI answer where each statement links to the source it came from.",
        "p": "shared"
      },
      {
        "t": "Access-aware retrieval",
        "d": "Searching only the records a person is allowed to see before the AI answers.",
        "p": "shared"
      }
    ]
  },
  {
    "id": "decision",
    "t": "Decision Intelligence",
    "d": "Shows the effect of a choice before anyone makes it.",
    "deep": true,
    "features": [
      {
        "t": "What-ifs",
        "d": "A project slips, a vendor is lost, sprint scope changes, prices or revenue change, or the rate card changes.",
        "p": "it",
        "deep": true
      },
      {
        "t": "Goal planning",
        "d": "Plan towards a margin target or a finish date, comparing options such as raising prices, cutting delivery cost or renegotiating the lowest-margin work.",
        "p": "it",
        "deep": true
      },
      {
        "t": "What-ifs",
        "d": "Someone moves to another unit, a budget changes, an approver is away, a reorganisation from a future structure plan, a hiring plan, or prices change.",
        "p": "canvas",
        "deep": true
      },
      {
        "t": "Goal planning",
        "d": "Plan towards a value target, such as reaching 1.2M in value with no new hires.",
        "p": "canvas",
        "deep": true
      },
      {
        "t": "Read-only previews",
        "d": "Save several scenarios and compare them side by side. Nothing changes until someone turns a result into a draft for approval.",
        "p": "both",
        "deep": true
      }
    ],
    "terms": [
      {
        "t": "What-if simulation",
        "d": "A read-only preview of how a change would affect plans, people or money.",
        "p": "shared"
      },
      {
        "t": "Goal planning",
        "d": "Comparing ways to reach a target, such as a value, margin or finish date.",
        "p": "shared"
      }
    ]
  },
  {
    "id": "signal",
    "t": "Signal Intelligence",
    "d": "Spots problems early and tells the right person.",
    "features": [
      {
        "t": "IT Signals",
        "d": "Project slipping, sprint at risk, RAID entry without an owner, scope creep and vendor renewal due.",
        "p": "it"
      },
      {
        "t": "Canvas Signals",
        "d": "Story at risk, person overloaded, approval bottleneck, budget ahead of value, conflicting decisions and organisation health issues.",
        "p": "canvas"
      },
      {
        "t": "Digests and reports",
        "d": "Each person can mute Signal types, with a weekly digest and scheduled reports.",
        "p": "both"
      },
      {
        "t": "Watch agents",
        "d": "When a new Signal appears, a watch agent prepares its fix and waits for approval. Workspace admins choose which Signal types are watched.",
        "p": "both",
        "deep": true
      }
    ],
    "terms": [
      {
        "t": "Signal",
        "d": "An early warning about a problem, such as a project slipping or an approval waiting too long.",
        "p": "shared"
      },
      {
        "t": "Watch agent",
        "d": "An AI agent that picks up a new warning and prepares its fix for approval.",
        "p": "shared"
      }
    ]
  },
  {
    "id": "meeting",
    "t": "Meeting & Voice Intelligence",
    "d": "Brings answers into the conversation.",
    "features": [
      {
        "t": "Meeting transcripts",
        "d": "Recorded meetings are transcribed with the workspace AI key and become searchable sources.",
        "p": "both"
      },
      {
        "t": "Voice Ask",
        "d": "Hold to speak a question and get a cited answer.",
        "p": "both",
        "deep": true
      },
      {
        "t": "Live meeting answers",
        "d": "ORQYNE listens to the whole meeting and answers the questions it hears, with sources.",
        "p": "both",
        "deep": true
      }
    ],
    "terms": [
      {
        "t": "Voice Ask",
        "d": "Asking ORQYNE a question by speaking instead of typing, with a cited answer.",
        "p": "shared"
      }
    ]
  },
  {
    "id": "agentic",
    "t": "Governed Agentic Intelligence",
    "d": "Agents that prepare the work and wait for a person to approve it.",
    "features": [
      {
        "t": "Ready-made IT agents",
        "d": "Monthly client status pack, RAID clean-up, change-request impact pack, vendor renewal brief and board pack.",
        "p": "it",
        "deep": true
      },
      {
        "t": "Ready-made Canvas agents",
        "d": "Monthly value and budget review, story triage, organisation health action plan and board pack.",
        "p": "canvas",
        "deep": true
      },
      {
        "t": "Draft, then approve",
        "d": "The AI prepares changes as drafts. Nothing happens until an authorised person approves.",
        "p": "both"
      },
      {
        "t": "Your own AI key",
        "d": "Use your own AI key. ORQYNE's backup AI is used only if you allow it.",
        "p": "both"
      },
      {
        "t": "Custom agents",
        "d": "Workspace admins build their own jobs.",
        "p": "both",
        "deep": true
      },
      {
        "t": "Approvals anywhere",
        "d": "Approve from the Approvals inbox, an email or a notification, after signing in.",
        "p": "both",
        "deep": true
      },
      {
        "t": "Outside-tool posts",
        "d": "Posts that agents prepare for Slack, Teams, Notion, Jira or GitHub wait for an admin's approval.",
        "p": "both",
        "deep": true
      }
    ],
    "terms": [
      {
        "t": "Draft-then-approve",
        "d": "A way of working where AI prepares a change and a person must approve it before it happens.",
        "p": "shared"
      },
      {
        "t": "Job agent",
        "d": "An AI agent that runs a defined job, such as a status pack, and prepares drafts for approval.",
        "p": "shared"
      },
      {
        "t": "Bring your own key (BYOK)",
        "d": "Using your own AI provider key instead of the vendor's.",
        "p": "shared"
      }
    ]
  }
];

export const LAYER_FAQS = [
  {
    "q": "Can ORQYNE answer questions with sources?",
    "a": "Yes. ORQYNE Intelligence answers plain-language questions with links to the records and files it used, and says when information is missing, out of date or contradictory.",
    "p": "shared",
    "layer": "knowledge"
  },
  {
    "q": "What are the Layers of Intelligence in ORQYNE?",
    "a": "ORQYNE Intelligence is organised in nine layers: Delivery, Money, People, Organisational, Knowledge, Decision, Signal, Meeting & Voice, and Governed Agentic Intelligence. Each layer works in both IT Services and Canvas Business Management, with features that fit each product.",
    "p": "shared",
    "layer": "knowledge"
  },
  {
    "q": "Can AI agents change data without approval?",
    "a": "No. Agents prepare drafts. Nothing changes until an authorised person approves it, and posts to outside tools wait for an admin's approval.",
    "p": "shared",
    "layer": "agentic"
  },
  {
    "q": "Does ORQYNE only use records a person is allowed to see?",
    "a": "Yes. Every search and every linked record is checked against that person's access before it is used in an answer.",
    "p": "shared",
    "layer": "knowledge"
  },
  {
    "q": "Can we use our own AI key?",
    "a": "Yes. Customers can use their own AI key. ORQYNE's backup AI is used only if the customer allows it.",
    "p": "shared",
    "layer": "agentic"
  },
  {
    "q": "Is our data used to train other customers' AI?",
    "a": "No. Learning such as team terms, corrections and house styles stays inside one workspace and is never shared between customers.",
    "p": "shared",
    "layer": "knowledge"
  },
  {
    "q": "What is Deep Intelligence?",
    "a": "Deep Intelligence is part of ORQYNE. It adds the Company Brain, workspace learning, Decision Intelligence (what-if previews and goal planning), job and watch agents, outside-tool agents and Voice Ask. Contact Sales for access.",
    "p": "shared",
    "layer": "knowledge"
  },
  {
    "q": "Can ORQYNE answer questions during a meeting?",
    "a": "Yes. With Voice Ask, people can hold to speak a question, or let ORQYNE listen during a recorded meeting and answer questions live with sources.",
    "p": "shared",
    "layer": "meeting"
  },
  {
    "q": "Does ORQYNE warn us about problems early?",
    "a": "Yes. Signals flag problems such as a project slipping, a sprint at risk, a story at risk or an approval bottleneck, and send them to the people who need to act.",
    "p": "shared",
    "layer": "signal"
  },
  {
    "q": "Can ORQYNE keep a RAID log tidy automatically?",
    "a": "The RAID clean-up agent finds entries with no owner, past their target date or untouched for weeks, and prepares fixes that each owner approves.",
    "p": "it",
    "layer": "delivery"
  },
  {
    "q": "Can ORQYNE show the effect of a project slipping before it happens?",
    "a": "Yes. The project slip what-if shows the new finish date, tasks pushed past it, cost of extra time and contracts ending before the new date, without changing any data.",
    "p": "it",
    "layer": "decision"
  },
  {
    "q": "Does ORQYNE prepare client status reports?",
    "a": "Yes. The monthly client status pack agent gathers tasks, risks, changes and earned value and drafts the pack for the project manager to approve.",
    "p": "it",
    "layer": "delivery"
  },
  {
    "q": "Can ORQYNE plan towards a margin target?",
    "a": "Yes. Goal planning compares options such as raising prices, cutting delivery cost or renegotiating the lowest-margin work, using earned-value forecasts.",
    "p": "it",
    "layer": "decision"
  },
  {
    "q": "Does ORQYNE support approval routing by spending limit?",
    "a": "Yes. Canvas routes approvals by decision rights and spending limits through the organisation structure, with escalation and temporary covers when an approver is away.",
    "p": "canvas",
    "layer": "organisational"
  },
  {
    "q": "Can ORQYNE compare budgets with verified value?",
    "a": "Yes. Canvas shows each unit's budget next to the value its people have verified, and flags units that are over-allocated.",
    "p": "canvas",
    "layer": "money"
  },
  {
    "q": "Can we test a reorganisation before publishing it?",
    "a": "Yes. Future structure plans can be previewed as a what-if that shows moves, manager changes, re-routed approvals and problems in the plan.",
    "p": "canvas",
    "layer": "decision"
  },
  {
    "q": "How does Canvas measure contribution?",
    "a": "People record contribution claims that are verified and scored, with disputes and calibration, goals, recognition, appraisal packs and a Value Map.",
    "p": "canvas",
    "layer": "people"
  }
];
