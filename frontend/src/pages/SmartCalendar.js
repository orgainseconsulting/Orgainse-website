import React, { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle, Calendar, Brain, Target, Award, ExternalLink, Mail, Users } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { api } from '../lib/api';
import { BOOKING_URL } from '../lib/booking';
import { useCalendly } from '../context/CalendlyContext';
import SEOHead from '../components/SEOHead';

const SERVICE_TYPES = [
  'Project Management as a Service (PMaaS)',
  'Artificial Intelligence & Workflow Transformation',
  'Delivery & Operational Governance',
  'ORQYNE Implementation & Adoption',
  'Artificial Intelligence Strategy & Readiness',
  'Healthcare Revenue Intelligence Advisory',
  'General Consultation',
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT)' },
];

export default function SmartCalendar() {
  const { openCalendly } = useCalendly();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '',
    service_type: '', preferred_datetime: '',
    timezone: 'America/New_York', message: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const setField = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.consultation(form);
      setResult({ ...res, ...form });
      toast.success('Consultation request received!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12">
        <SEOHead
          title="Book a Discovery Call | Orgainse"
          description="Schedule a focused 30-minute discovery call with an Orgainse consultant to review one execution problem and agree the most practical next step."
          canonical="https://orgainse.com/smart-calendar"
          keywords="book a discovery call, delivery consulting appointment, project governance consultation"
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 mb-6 mx-auto">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="font-outfit text-3xl sm:text-4xl font-bold mb-4 tracking-[-0.02em] text-slate-900">
              Discovery Call Request Received
            </h1>
            <p className="text-base text-slate-600">
              Our team will contact you within one business day to confirm.
            </p>
          </div>

          <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl mb-10">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl mb-6 text-center">Booking Confirmation</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailRow label="Name" value={result.name} />
                <DetailRow label="Email" value={result.email} />
                <DetailRow label="Service Type" value={result.service_type} />
                <DetailRow label="Preferred Time" value={result.preferred_datetime || 'Flexible'} />
                <DetailRow label="Timezone" value={TIMEZONES.find((t) => t.value === result.timezone)?.label || result.timezone} />
                <div>
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  <div className="mt-1"><Badge className="bg-blue-100 text-blue-700">Pending Confirmation</Badge></div>
                </div>
              </div>
              {result.message && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-slate-600">Your Message</label>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg mt-1">{result.message}</p>
                </div>
              )}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-slate-700">
                <strong>Reference ID:</strong>{' '}
                <span data-testid="consultation-id" className="font-mono">{result.consultation_id}</span>
              </div>
            </CardHeader>
          </Card>

          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl text-center">
            <h3 className="text-2xl font-bold mb-4 text-slate-800">Prefer to pick a time yourself?</h3>
            <p className="text-slate-600 mb-6">
              Pick a time directly from our Google Calendar:
            </p>
            <button
              data-testid="consultation-book-google-btn"
              onClick={openCalendly}
              className="px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full shadow-[0_12px_34px_-14px_rgba(15,23,42,0.6)] transition-colors duration-200 inline-flex items-center"
            >
              <Calendar className="mr-2 h-5 w-5" /> Book Instantly with Google Calendar
              <ExternalLink className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12">
      <SEOHead
        title="Book a Discovery Call | Orgainse"
        description="Schedule a focused 30-minute discovery call with an Orgainse consultant to review one execution problem and agree the most practical next step."
        canonical="https://orgainse.com/smart-calendar"
        keywords="book a discovery call, delivery consulting appointment, project governance consultation"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="font-outfit text-3xl sm:text-4xl font-bold mb-4 tracking-[-0.02em] text-slate-900">
            Book a Discovery Call
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto mb-4">
            A focused 30-minute conversation about one execution problem — where status becomes unclear,
            which hand-offs slip, and who owns the decisions.
          </p>
          <div className="inline-flex items-center justify-center gap-3 bg-white/80 rounded-full px-6 py-2 shadow">
            <span className="text-sm text-slate-600">Prefer to pick a time yourself?</span>
            <button
              type="button"
              data-testid="consultation-google-link"
              onClick={openCalendly}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm inline-flex items-center"
            >
              Open Google booking <ExternalLink className="ml-1 h-3 w-3" />
            </button>
          </div>
        </div>

        <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl mb-4 text-center">Your Details</CardTitle>
            <CardDescription className="text-center mb-6">
              Fill in your details and we'll confirm your slot within one business day.
            </CardDescription>
            <form onSubmit={submit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name *">
                  <Input data-testid="consultation-name-input" value={form.name} onChange={(e) => setField('name', e.target.value)} required minLength={2} />
                </Field>
                <Field label="Email Address *">
                  <Input data-testid="consultation-email-input" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} required />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Phone (Optional)">
                  <Input data-testid="consultation-phone-input" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
                </Field>
                <Field label="Company">
                  <Input data-testid="consultation-company-input" value={form.company} onChange={(e) => setField('company', e.target.value)} />
                </Field>
              </div>

              <Field label="Service Type *">
                <select data-testid="consultation-service-select" value={form.service_type} onChange={(e) => setField('service_type', e.target.value)} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none">
                  <option value="">Select service type</option>
                  {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Preferred Date & Time">
                  <Input
                    data-testid="consultation-datetime-input"
                    type="datetime-local"
                    value={form.preferred_datetime}
                    onChange={(e) => setField('preferred_datetime', e.target.value)}
                  />
                </Field>
                <Field label="Timezone *">
                  <select data-testid="consultation-tz-select" value={form.timezone} onChange={(e) => setField('timezone', e.target.value)} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none">
                    {TIMEZONES.map((tz) => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Additional Message (Optional)">
                <Textarea
                  data-testid="consultation-message-input"
                  value={form.message}
                  onChange={(e) => setField('message', e.target.value)}
                  placeholder="Tell us about your specific needs or challenges..."
                  rows={4}
                />
              </Field>

              <div className="flex justify-center pt-6">
                <button
                  data-testid="consultation-submit-btn"
                  type="submit"
                  disabled={loading || !form.name || !form.email || !form.service_type}
                  className="px-7 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-full shadow-[0_12px_34px_-14px_rgba(0,0,0,0.5)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none inline-flex items-center"
                >
                  {loading ? 'Submitting...' : 'Request Consultation'}
                  {!loading && <Calendar className="ml-2 h-5 w-5" />}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
                What This Discovery Call Covers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PerkRow icon={Brain} color="blue" label="A read on execution readiness" />
                <PerkRow icon={Target} color="blue" label="A scoped, practical next step" />
                <PerkRow icon={Award} color="blue" label="An honest read on fit" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <SEOHead
        title="Book a Discovery Call | Orgainse"
        description="Schedule a focused 30-minute discovery call with an Orgainse consultant to review one execution problem and agree the most practical next step."
        canonical="https://orgainse.com/smart-calendar"
        keywords="book a discovery call, delivery consulting appointment, project governance consultation"
      />
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      {children}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <SEOHead
        title="Book a Discovery Call | Orgainse"
        description="Schedule a focused 30-minute discovery call with an Orgainse consultant to review one execution problem and agree the most practical next step."
        canonical="https://orgainse.com/smart-calendar"
        keywords="book a discovery call, delivery consulting appointment, project governance consultation"
      />
      <label className="text-sm font-medium text-slate-600">{label}</label>
      <p className="text-lg font-semibold text-slate-800">{value || '—'}</p>
    </div>
  );
}

function PerkRow({ icon: Icon, color, label }) {
  const bg = { orange: 'bg-blue-100 text-blue-600', green: 'bg-blue-100 text-blue-600', blue: 'bg-blue-100 text-blue-600' }[color];
  return (
    <div className="text-center">
      <SEOHead
        title="Book a Discovery Call | Orgainse"
        description="Schedule a focused 30-minute discovery call with an Orgainse consultant to review one execution problem and agree the most practical next step."
        canonical="https://orgainse.com/smart-calendar"
        keywords="book a discovery call, delivery consulting appointment, project governance consultation"
      />
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${bg} mb-2`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-slate-700 font-medium">{label}</p>
    </div>
  );
}
