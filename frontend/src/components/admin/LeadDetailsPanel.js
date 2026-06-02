import React, { useState } from 'react';
import {
  User, Mail, Phone, Building2, MessageSquare, Calendar, ChevronDown,
  Code2, Sparkles, Calculator, LayoutList, Star, Clock, Activity,
} from 'lucide-react';

/**
 * LeadDetailsPanel — human-readable expanded view for an admin lead row.
 *
 * Replaces the raw JSON dump with a structured breakdown:
 *   • Contact Information
 *   • Submission Details (shape-aware per lead type)
 *   • Metadata
 *   • Technical Fields (collapsed by default — IDs, tokens, IPs)
 *
 * Props:
 *   - lead   : raw document from /api/admin
 *   - tabKey : one of 'newsletters' | 'contacts' | 'ai_assessments'
 *              | 'roi_calculators' | 'service_inquiries' | 'consultations'
 */

const PII_PATHS = new Set([
  'name', 'first_name', 'last_name', 'email', 'phone', 'company',
  'user_info.name', 'user_info.email', 'user_info.phone', 'user_info.company',
  'user_info.industry', 'user_info.company_size',
  'business_inputs.company_name', 'business_inputs.email', 'business_inputs.phone',
  'business_inputs.industry', 'business_inputs.company_size',
  'consultation_details.full_name', 'consultation_details.email',
  'consultation_details.phone', 'consultation_details.company',
  'consultation_details.industry', 'consultation_details.consultation_type',
  'consultation_details.requirements',
]);

const TECHNICAL_KEYS = new Set([
  'id', 'assessment_id', 'calculation_id', 'consultation_id',
  'unsubscribe_token', 'ip_address', 'user_agent', 'timestamp',
  'tags', 'bounced', 'complained', 'confirmed',
]);

const formatValue = (v) => {
  if (v === null || v === undefined || v === '') return '—';
  if (Array.isArray(v)) return v.map((x) => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(', ');
  if (typeof v === 'object') return JSON.stringify(v);
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return String(v);
};

const formatDate = (iso) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); }
  catch { return iso; }
};

const Row = ({ icon: Icon, label, value, testid }) => (
  <div className="flex items-start gap-3 py-1.5" data-testid={testid}>
    {Icon && <Icon className="h-3.5 w-3.5 text-slate-400 mt-1 flex-shrink-0" />}
    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-1 sm:gap-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-sm text-slate-800 break-words whitespace-pre-wrap">{value}</div>
    </div>
  </div>
);

const Section = ({ title, icon: Icon, children, defaultOpen = true, testid }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden" data-testid={testid}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-700">
          {Icon && <Icon className="h-3.5 w-3.5 text-orange-500" />}
          {title}
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && <div className="px-4 py-2.5 divide-y divide-slate-100">{children}</div>}
    </div>
  );
};

const ContactBlock = ({ lead, tabKey }) => {
  const ui = lead.user_info || {};
  const bi = lead.business_inputs || {};
  const cd = lead.consultation_details || {};
  const name = lead.name || lead.first_name || ui.name || cd.full_name || bi.company_name || '—';
  const email = lead.email || ui.email || bi.email || cd.email || '—';
  const phone = lead.phone || ui.phone || bi.phone || cd.phone || '—';
  const company = lead.company || ui.company || cd.company || bi.company_name || '—';
  const industry = lead.industry || ui.industry || bi.industry || cd.industry || '';
  const companySize = ui.company_size || bi.company_size || '';

  return (
    <Section title="Contact information" icon={User} testid={`lead-section-contact-${tabKey}`}>
      <Row icon={User} label="Name" value={name} />
      <Row icon={Mail} label="Email" value={
        email && email !== '—' ? <a href={`mailto:${email}`} className="text-blue-600 hover:underline">{email}</a> : '—'
      } />
      <Row icon={Phone} label="Phone" value={
        phone && phone !== '—' ? <a href={`tel:${phone}`} className="text-blue-600 hover:underline">{phone}</a> : '—'
      } />
      <Row icon={Building2} label="Company" value={company} />
      {(industry || companySize) && (
        <Row icon={Building2} label="Industry / Size" value={[industry, companySize].filter(Boolean).join(' · ') || '—'} />
      )}
    </Section>
  );
};

const SubmissionBlock = ({ lead, tabKey }) => {
  if (tabKey === 'contacts' || tabKey === 'service_inquiries') {
    return (
      <Section title="Submission" icon={MessageSquare} testid={`lead-section-submission-${tabKey}`}>
        {lead.subject && <Row icon={LayoutList} label="Subject" value={lead.subject} />}
        {lead.service_type && <Row icon={LayoutList} label="Service" value={lead.service_type} />}
        <Row icon={MessageSquare} label="Message" value={lead.message || '—'} />
      </Section>
    );
  }

  if (tabKey === 'ai_assessments') {
    const recs = Array.isArray(lead.recommendations) ? lead.recommendations : [];
    const resp = Array.isArray(lead.responses) ? lead.responses : [];
    return (
      <Section title="AI Assessment" icon={Sparkles} testid={`lead-section-submission-${tabKey}`}>
        <Row icon={Star} label="Maturity score" value={
          lead.maturity_score != null
            ? <span><strong className="text-orange-600 text-base">{lead.maturity_score}/100</strong>{lead.score_label ? <span className="ml-2 text-slate-500">({lead.score_label})</span> : null}</span>
            : '—'
        } />
        {recs.length > 0 && (
          <Row icon={LayoutList} label="Top recommendations" value={
            <ul className="list-disc pl-4 space-y-0.5">
              {recs.map((r, i) => (
                <li key={i}>
                  <strong>{r.title || '—'}</strong>
                  {r.priority && <span className="ml-1 text-xs text-slate-500">[{r.priority}]</span>}
                  {r.timeline && <span className="ml-1 text-xs text-slate-500">· {r.timeline}</span>}
                  {r.description && <div className="text-xs text-slate-500">{r.description}</div>}
                </li>
              ))}
            </ul>
          } />
        )}
        {resp.length > 0 && (
          <Row icon={LayoutList} label="Question responses" value={
            <div className="space-y-1 text-xs">
              {resp.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="font-semibold text-slate-600 min-w-[140px]">{r.question_id || `Q${i + 1}`}</span>
                  <span className="flex-1">{r.answer || '—'} <span className="text-slate-400">(score: {r.score ?? '—'})</span></span>
                </div>
              ))}
            </div>
          } />
        )}
      </Section>
    );
  }

  if (tabKey === 'roi_calculators') {
    const m = lead.calculated_metrics || {};
    const bi = lead.business_inputs || {};
    const sym = m.currency_symbol || '';
    return (
      <Section title="ROI Calculation" icon={Calculator} testid={`lead-section-submission-${tabKey}`}>
        {bi.current_project_cost != null && <Row icon={Calculator} label="Project cost" value={`${sym}${Number(bi.current_project_cost).toLocaleString()}`} />}
        {bi.project_duration_months != null && <Row icon={Clock} label="Duration" value={`${bi.project_duration_months} months`} />}
        {bi.current_efficiency_rating != null && <Row icon={Activity} label="Current efficiency" value={`${bi.current_efficiency_rating} / 10`} />}
        {Array.isArray(bi.desired_services) && bi.desired_services.length > 0 && (
          <Row icon={LayoutList} label="Desired services" value={bi.desired_services.join(', ')} />
        )}
        {m.potential_savings != null && <Row icon={Calculator} label="Potential savings" value={`${sym}${Number(m.potential_savings).toLocaleString()}/yr`} />}
        {m.roi_percentage != null && <Row icon={Calculator} label="ROI" value={`${m.roi_percentage}%`} />}
        {m.payback_period_months != null && <Row icon={Clock} label="Payback" value={`${m.payback_period_months} months`} />}
        {bi.user_region && <Row icon={Building2} label="Region" value={bi.user_region} />}
      </Section>
    );
  }

  if (tabKey === 'consultations') {
    const cd = lead.consultation_details || {};
    return (
      <Section title="Consultation" icon={Calendar} testid={`lead-section-submission-${tabKey}`}>
        {cd.consultation_type && <Row icon={LayoutList} label="Type" value={cd.consultation_type} />}
        {(lead.preferred_date || lead.preferred_time) && (
          <Row icon={Calendar} label="Preferred slot" value={
            `${lead.preferred_date || '—'} ${lead.preferred_time ? `· ${lead.preferred_time}` : ''}`.trim()
          } />
        )}
        {lead.timezone && <Row icon={Clock} label="Timezone" value={lead.timezone} />}
        {cd.requirements && <Row icon={MessageSquare} label="Notes / Requirements" value={cd.requirements} />}
      </Section>
    );
  }

  // newsletters
  return (
    <Section title="Newsletter subscription" icon={Mail} testid={`lead-section-submission-${tabKey}`}>
      <Row icon={Activity} label="Status" value={
        lead.unsubscribed ? <span className="text-rose-600 font-semibold">Unsubscribed</span> :
        lead.bounced ? <span className="text-amber-600 font-semibold">Bounced</span> :
        <span className="text-emerald-600 font-semibold">Active</span>
      } />
      <Row icon={Calendar} label="Confirmed" value={lead.confirmed ? 'Yes' : 'No'} />
      {Array.isArray(lead.tags) && lead.tags.length > 0 && (
        <Row icon={LayoutList} label="Tags / Segments" value={lead.tags.join(', ')} />
      )}
    </Section>
  );
};

const MetaBlock = ({ lead, tabKey }) => (
  <Section title="Metadata" icon={Clock} testid={`lead-section-meta-${tabKey}`}>
    <Row icon={Calendar} label="Submitted at" value={formatDate(lead.submitted_at || lead.subscribed_at || lead.timestamp)} />
    {lead.status && <Row icon={Activity} label="Status" value={lead.status} />}
    {lead.leadType && <Row icon={LayoutList} label="Lead type" value={lead.leadType} />}
    {lead.source && <Row icon={LayoutList} label="Source" value={lead.source} />}
  </Section>
);

// Walk the document and collect every (path, value) pair *not* already shown
const collectAllPaths = (obj, prefix = '', out = []) => {
  if (!obj || typeof obj !== 'object') return out;
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) collectAllPaths(v, path, out);
    else out.push([path, v]);
  }
  return out;
};

const TechnicalBlock = ({ lead, tabKey }) => {
  const paths = collectAllPaths(lead);
  // Show only technical / non-PII / non-shown rows
  const shown = paths.filter(([p]) => {
    const lastKey = p.split('.').pop();
    if (PII_PATHS.has(p)) return false;
    if (lastKey === 'recommendations' || lastKey === 'responses' || lastKey === 'message' || lastKey === 'subject') return false;
    if (lastKey === 'service_type' || lastKey === 'requirements' || lastKey === 'consultation_type') return false;
    if (lastKey === 'maturity_score' || lastKey === 'score_label') return false;
    if (lastKey === 'roi_percentage' || lastKey === 'potential_savings' || lastKey === 'payback_period_months') return false;
    if (lastKey === 'submitted_at' || lastKey === 'subscribed_at' || lastKey === 'leadType' || lastKey === 'source' || lastKey === 'status') return false;
    if (lastKey === 'preferred_date' || lastKey === 'preferred_time' || lastKey === 'timezone' || lastKey === 'preferred_datetime') return false;
    if (lastKey === 'tags' || lastKey === 'confirmed' || lastKey === 'unsubscribed' || lastKey === 'bounced') return false;
    return true;
  });

  return (
    <Section title="Technical fields" icon={Code2} testid={`lead-section-tech-${tabKey}`} defaultOpen={false}>
      <div className="text-[11px] text-slate-500 mb-2 py-1">
        Internal identifiers, tokens, and request metadata. Usually only needed for debugging or compliance.
      </div>
      {shown.length === 0 ? (
        <div className="text-xs text-slate-400 italic py-1">No additional technical fields.</div>
      ) : (
        <div className="font-mono text-[11px] text-slate-700 space-y-1">
          {shown.map(([p, v]) => (
            <div key={p} className="flex items-start gap-2">
              <span className="font-semibold text-slate-500 min-w-[160px] truncate">{p}</span>
              <span className={`flex-1 break-all ${TECHNICAL_KEYS.has(p.split('.').pop()) ? 'text-slate-400' : 'text-slate-800'}`}>
                {formatValue(v)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
};

const LeadDetailsPanel = ({ lead, tabKey }) => {
  if (!lead) return null;
  return (
    <div className="space-y-3" data-testid={`lead-details-${tabKey}`}>
      <ContactBlock lead={lead} tabKey={tabKey} />
      <SubmissionBlock lead={lead} tabKey={tabKey} />
      <MetaBlock lead={lead} tabKey={tabKey} />
      <TechnicalBlock lead={lead} tabKey={tabKey} />
    </div>
  );
};

export default LeadDetailsPanel;
