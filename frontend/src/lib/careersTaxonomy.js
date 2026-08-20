/**
 * Careers taxonomy — the dropdown vocabularies used by the Admin job editor and
 * rendered on the public careers page. Department is a suggested list; the
 * editor also allows a custom free-text department.
 */
export const LAYERS = [
  'C-Suite',
  'First Line Management',
  'Second Line Management',
  'Associates',
  'Interns',
];

export const DEPARTMENTS = [
  'Artificial Intelligence (AI) Engineering and Agentic Systems',
  'Business Intelligence, Sales and Partnerships',
  'Customer Success and Support',
  'Delivery and Project Management Office (PMO)',
  'Finance and Commercials',
  'Knowledge and Enablement',
  'Leadership',
  'Legal, Risk and Compliance',
  'Marketing and Brand',
  'Operations and Revenue Cycle Management (RCM)',
  'People and Culture / Human Resources (HR)',
  'Product, Platform and Research and Development (R&D)',
  'Technology, Infrastructure and Security',
];

export const EMPLOYMENT_TYPES = [
  'Founder / Director',
  'Full-Time',
  'Future Full-Time',
  'Outsourced Partner',
  'External Advisor',
  'Contractor',
  'Intern',
  'Future',
  'Part-Time',
];

export const WORK_TYPES = ['Remote', 'Hybrid', 'On-site'];

export const EXPERIENCE_LEVELS = ['Entry level', 'Mid level', 'Senior', 'Lead', 'Principal'];

/** Hiring stage drives the badge on the card/popup and whether Apply is open. */
export const HIRING_STAGES = [
  'Open Role',
  'Receiving Profiles',
  'Shortlisting',
  'Interviewing',
  'Offer Stage',
  'On Hold',
  'Role Closed',
];

export const STAGE_CLOSED = 'Role Closed';
export const STAGES_NOT_ACCEPTING = [STAGE_CLOSED, 'On Hold'];

export const stageStyle = (stage) => {
  switch (stage) {
    case 'Open Role': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Receiving Profiles': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Shortlisting': return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'Interviewing': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Offer Stage': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'On Hold': return 'bg-slate-100 text-slate-600 border-slate-300';
    case STAGE_CLOSED: return 'bg-slate-200 text-slate-600 border-slate-300';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};
