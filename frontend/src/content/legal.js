/**
 * Single source of truth for Orgainse Consulting legal copy.
 * Rendered both in the footer popups and on the /privacy and /terms routes.
 */

export const LEGAL_UPDATED = "June 2026";

export const CONTACT_BLOCK = {
  heading: "How to Contact Orgainse Consulting",
  paragraphs: [
    "Questions, requests, or complaints relating to this document can be sent to the addresses below. We aim to acknowledge written requests within five business days.",
  ],
  bullets: [
    "General enquiries: info@orgainse.com",
    "Support and data requests: support@orgainse.com",
    "Headquarters: Austin, Texas, United States of America",
    "Corporate Office: Bengaluru, Karnataka, India",
    "Telephone (Corporate Office): +91 97403 84683 · +91 97403 94863",
  ],
};

export const PRIVACY_POLICY = {
  id: "privacy",
  title: "Privacy Policy",
  intro:
    "Orgainse Consulting provides business consulting, Project Management as a Service (PMaaS), delivery and workflow transformation, Artificial Intelligence readiness advisory, and implementation support for the ORQYNE platform. This Privacy Policy explains what information we collect through www.orgainse.com, why we collect it, how it is used, who it is shared with, how long it is retained, and the choices available to you.",
  sections: [
    {
      heading: "1. Scope of This Policy",
      paragraphs: [
        "This policy applies to the Orgainse Consulting corporate website, our marketing communications, our lead-capture tools (contact forms, newsletter subscription, Artificial Intelligence readiness assessment, Return on Investment calculator, and consultation booking), and to information exchanged during pre-sales conversations.",
        "Client project environments, contracted engagements, and the ORQYNE platform are governed by the separate agreements, data processing terms, and configuration decisions applicable to those engagements. Where the two overlap, the engagement contract prevails.",
      ],
    },
    {
      heading: "2. Information We Collect",
      paragraphs: ["We collect only what is required to respond to you and to operate the website."],
      bullets: [
        "Information you provide directly: name, business email address, telephone number, organisation name, role, region, service interest, and the content of your message or enquiry.",
        "Assessment and calculator inputs: the answers and assumptions you submit so that we can return a directional result and, where requested, discuss it with you.",
        "Subscription data: your email address, subscription source, subscription state, and any tags used to segment editorial content.",
        "Technical data: internet protocol address, approximate region derived from it, browser and device type, referring page, and pages visited. This is used for security, performance, and aggregate analytics.",
        "Cookie and consent data: your cookie preference and the date it was recorded.",
      ],
      note:
        "We do not intentionally collect special category data, payment card data, government identifiers, or health information through this website. Please do not submit such information through our web forms.",
    },
    {
      heading: "3. Why We Process Your Information",
      bullets: [
        "To respond to enquiries, prepare proposals, and arrange discovery or consultation calls.",
        "To deliver the resource, assessment result, or calculator scenario you requested.",
        "To send the Orgainse newsletter and related editorial content where you have subscribed.",
        "To operate, secure, and improve the website, including abuse prevention and rate limiting.",
        "To meet legal, regulatory, accounting, and contractual obligations.",
      ],
      paragraphs: [
        "Our legal bases, where the General Data Protection Regulation or comparable law applies, are: your consent (newsletter and non-essential cookies), our legitimate interests (responding to business enquiries, securing our systems), performance of a contract, and compliance with legal obligations.",
      ],
    },
    {
      heading: "4. Artificial Intelligence and Automated Processing",
      paragraphs: [
        "Orgainse advises on Artificial Intelligence adoption and implements the ORQYNE platform. In relation to this website specifically, the Artificial Intelligence readiness assessment and Return on Investment calculator apply deterministic scoring and arithmetic to the values you enter. They do not make decisions about you, and they produce directional planning output only.",
        "We do not use website enquiry content to train third-party foundation models. Where an engagement requires Artificial Intelligence processing of client material, the permitted data sources, model providers, retention, and human review points are defined in that engagement's contract and configuration.",
      ],
    },
    {
      heading: "5. Sharing and Disclosure",
      paragraphs: [
        "We do not sell, rent, or trade personal information. We share it only where necessary and under contract.",
      ],
      bullets: [
        "Service providers: website hosting and content delivery, database hosting, email delivery for transactional and newsletter messages, calendar scheduling, and product analytics.",
        "Professional advisers: legal, accounting, insurance, and audit advisers where required.",
        "Legal and regulatory recipients: where disclosure is required by law, court order, or to protect our rights, users, or systems.",
        "Corporate transactions: in the event of a reorganisation, merger, or acquisition, subject to equivalent protection of your information.",
      ],
    },
    {
      heading: "6. International Transfers",
      paragraphs: [
        "Orgainse operates from the United States of America and India and serves clients across India, the United States, the United Kingdom, the United Arab Emirates, Australia, New Zealand, and South Africa. Your information may therefore be processed outside your country of residence. Where required, we rely on appropriate safeguards such as standard contractual clauses and equivalent contractual protections with our processors.",
      ],
    },
    {
      heading: "7. Retention",
      bullets: [
        "Enquiry and consultation records: retained for up to 36 months from the last interaction, unless a contract requires longer.",
        "Newsletter subscriptions: retained until you unsubscribe, plus a suppression record so we do not contact you again in error.",
        "Assessment and calculator submissions: retained for up to 24 months to support follow-up discussions.",
        "Technical and security logs: retained for a short operational period consistent with security requirements.",
      ],
    },
    {
      heading: "8. Security",
      paragraphs: [
        "We apply administrative and technical measures proportionate to the sensitivity of the information we hold. These include transport encryption, hashed administrative credentials, role-based administrative access, brute-force protection with lockout, restricted cross-origin access, server-side sanitisation of submitted content, environment-based secret management, and separation of development and production environments.",
        "No method of transmission or storage is completely secure. We do not represent that our controls constitute certification under any standard, and we ask that you avoid sending confidential material through web forms.",
      ],
    },
    {
      heading: "9. Your Rights and Choices",
      bullets: [
        "Access, correction, deletion, restriction, objection, and portability, to the extent provided by applicable law.",
        "Withdrawal of consent at any time, including one-click unsubscribe in every newsletter email.",
        "Cookie choices through the consent banner presented on your first visit.",
        "Complaint to your local supervisory authority where you consider your rights have not been respected.",
      ],
      paragraphs: [
        "To exercise a right, write to support@orgainse.com with enough detail for us to identify your records. We may ask you to verify your identity before acting on a request.",
      ],
    },
    {
      heading: "10. Cookies and Similar Technologies",
      paragraphs: [
        "We use strictly necessary cookies for site operation and security, a preference cookie to remember your region and consent choice, and limited analytics to understand aggregate usage and performance. Non-essential cookies are set only after consent. You may clear or block cookies through your browser, although parts of the site may then behave differently.",
      ],
    },
    {
      heading: "11. Children",
      paragraphs: [
        "Our website and services are directed to businesses and professional users. We do not knowingly collect information from individuals under the age of 16. If you believe a child has provided information to us, contact support@orgainse.com and we will remove it.",
      ],
    },
    {
      heading: "12. Changes to This Policy",
      paragraphs: [
        "We may update this policy to reflect changes in our services, technology, or legal obligations. The revision date at the top of the document indicates the current version. Material changes will be highlighted on this page.",
      ],
    },
    CONTACT_BLOCK,
  ],
};

export const TERMS_OF_SERVICE = {
  id: "terms",
  title: "Terms of Service",
  intro:
    "These Terms of Service govern your use of the Orgainse Consulting website and the informational tools published on it. They also describe the general framework within which Orgainse provides consulting, Project Management as a Service, workflow transformation, Artificial Intelligence readiness advisory, and ORQYNE implementation support. Paid engagements are always governed by a separate signed agreement, statement of work, or order form.",
  sections: [
    {
      heading: "1. Acceptance",
      paragraphs: [
        "By accessing www.orgainse.com, submitting a form, subscribing to our newsletter, or using our assessment, calculator, or booking tools, you agree to these terms. If you are accepting on behalf of an organisation, you confirm that you are authorised to do so.",
      ],
    },
    {
      heading: "2. What Orgainse Provides",
      bullets: [
        "Project Management as a Service (PMaaS): structured project leadership, governance, reporting cadence, risk and dependency management, stakeholder communication, and executive visibility.",
        "Artificial Intelligence and workflow transformation: process mapping, opportunity identification, human approval design, and a sequenced implementation roadmap.",
        "Delivery and operational governance: portfolio visibility, escalation paths, decision records, resource and cost oversight, and executive reporting.",
        "ORQYNE implementation and adoption: workspace design, roles and access, workflow configuration, imports, templates, governance controls, integrations, onboarding, and adoption reviews.",
        "Artificial Intelligence strategy and readiness: prioritisation, maturity assessment, data and governance review, and a phased plan.",
        "Healthcare Revenue Intelligence Advisory: advisory and analytics on revenue performance, denial patterns, payer behaviour, controls, and executive reporting. This service is advisory only and expressly excludes operational medical billing, coding, collections, and claim submission.",
      ],
    },
    {
      heading: "3. Website Tools Are Informational",
      paragraphs: [
        "The Artificial Intelligence readiness assessment, the Return on Investment calculator, published checklists, guides, articles, and newsletter content are provided for general information and planning. They are directional, depend entirely on the assumptions and answers you supply, and are not a certification, an audit, a detailed assessment, or professional advice for your specific circumstances.",
        "You should not act on website output alone. Material operational, financial, legal, security, healthcare, employment, or compliance decisions require appropriate professional review.",
      ],
    },
    {
      heading: "4. No Guarantee of Outcomes",
      paragraphs: [
        "Orgainse does not guarantee delivery improvement, cost reduction, revenue uplift, timeline compression, Return on Investment, or compliance outcomes. Results depend on engagement scope, data quality, leadership decisions, user adoption, integration availability, operating conditions, and the customer's own responsibilities. Success measures, assumptions, and review points are agreed in writing before work begins and are reviewed during the engagement.",
      ],
    },
    {
      heading: "5. Your Responsibilities",
      bullets: [
        "Provide accurate, current, and complete information when you contact us or submit a form.",
        "Use the website and any provided materials lawfully and in accordance with these terms.",
        "Keep any credentials issued to you confidential and notify us promptly of suspected misuse.",
        "Do not attempt to probe, scan, overload, reverse engineer, scrape at scale, or gain unauthorised access to any part of our systems.",
        "Do not submit unlawful, infringing, malicious, or confidential third-party content through our forms.",
      ],
    },
    {
      heading: "6. Engagements, Scope, and Commercial Terms",
      paragraphs: [
        "Nothing on this website constitutes an offer capable of acceptance, a fixed price, or a commitment to provide services. Fees, deliverables, timelines, acceptance criteria, dependencies, data handling, confidentiality, and termination rights are defined exclusively in the executed engagement documents. Where those documents conflict with these terms, the engagement documents prevail for that engagement.",
      ],
    },
    {
      heading: "7. Intellectual Property",
      paragraphs: [
        "The Orgainse Consulting name, the ORQYNE name, our logos, website content, frameworks, templates, methodologies, and tooling are owned by Orgainse Consulting or its licensors. You may view and share published content with attribution for internal, non-commercial purposes.",
        "You may not resell, republish as your own, or create derivative commercial products from our materials without written permission. Rights granted in a client engagement are defined in that engagement's agreement; ownership of our underlying methodologies and platform remains with Orgainse.",
      ],
    },
    {
      heading: "8. Third-Party Services and Links",
      paragraphs: [
        "The website references and integrates third-party services, including calendar scheduling, email delivery, analytics, and the ORQYNE product site. Those services are governed by their own terms and privacy notices. Orgainse is not responsible for third-party content, availability, or practices.",
      ],
    },
    {
      heading: "9. Availability",
      paragraphs: [
        "We aim to keep the website available and accurate but provide it on an \"as available\" basis. We may modify, suspend, or discontinue any part of the website or its tools without notice, and we may correct content at any time.",
      ],
    },
    {
      heading: "10. Disclaimers",
      paragraphs: [
        "To the maximum extent permitted by law, the website and its informational tools are provided without warranties of any kind, whether express or implied, including implied warranties of merchantability, fitness for a particular purpose, accuracy, and non-infringement.",
      ],
    },
    {
      heading: "11. Limitation of Liability",
      paragraphs: [
        "To the maximum extent permitted by law, Orgainse Consulting shall not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost revenue, lost data, or business interruption, arising from use of the website or its informational tools.",
        "For paid engagements, Orgainse's aggregate liability is limited to the amounts paid for the specific services giving rise to the claim, as further defined in the applicable engagement agreement. Nothing in these terms excludes liability that cannot lawfully be excluded.",
      ],
    },
    {
      heading: "12. Confidentiality of Pre-Sales Discussions",
      paragraphs: [
        "Information exchanged during discovery conversations is treated as commercially sensitive and shared internally only with those who need it to evaluate fit. Where either party requires formal protection before disclosure, a mutual non-disclosure agreement should be executed first.",
      ],
    },
    {
      heading: "13. Governing Law and Disputes",
      paragraphs: [
        "These terms are governed by the laws applicable in the jurisdiction of the contracting Orgainse entity: the State of Texas, United States of America, or Karnataka, India, as identified in the relevant engagement documents. The parties will first attempt to resolve any dispute in good faith through senior-level discussion. Unresolved disputes will be submitted to arbitration or to the competent courts of that jurisdiction, as specified in the engagement documents.",
      ],
    },
    {
      heading: "14. Changes to These Terms",
      paragraphs: [
        "We may update these terms to reflect changes in our services or legal requirements. The revision date at the top indicates the current version, and continued use of the website after publication constitutes acceptance.",
      ],
    },
    CONTACT_BLOCK,
  ],
};

export const LEGAL_DOCS = { privacy: PRIVACY_POLICY, terms: TERMS_OF_SERVICE };
