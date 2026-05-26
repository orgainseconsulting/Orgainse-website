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

const SERVICE_TYPES = [
  'AI Project Management Service (PMaaS)',
  'Digital Transformation Consulting',
  'AI Operational Optimization',
  'Business Strategy Development',
  'Healthcare Revenue Intelligence Advisory',
  'Risk Management & Compliance',
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 mb-6 mx-auto">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              Consultation Request Received!
            </h1>
            <p className="text-lg text-slate-600">
              Our team will contact you within 24 hours to confirm.
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
                  <div className="mt-1"><Badge className="bg-green-100 text-green-700">Pending Confirmation</Badge></div>
                </div>
              </div>
              {result.message && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-slate-600">Your Message</label>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-lg mt-1">{result.message}</p>
                </div>
              )}
              <div className="mt-6 p-4 bg-orange-50 rounded-xl text-sm text-slate-700">
                <strong>Reference ID:</strong>{' '}
                <span data-testid="consultation-id" className="font-mono">{result.consultation_id}</span>
              </div>
            </CardHeader>
          </Card>

          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl text-center">
            <h3 className="text-2xl font-bold mb-4 text-slate-800">Want a guaranteed slot now?</h3>
            <p className="text-slate-600 mb-6">
              Pick a time directly from our Google Calendar:
            </p>
            <button
              data-testid="consultation-book-google-btn"
              onClick={openCalendly}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition transform hover:scale-105 inline-flex items-center"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
            Book Your AI Consultation
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-4">
            Schedule a free 30-minute consultation with our AI transformation experts.
          </p>
          <div className="inline-flex items-center justify-center gap-3 bg-white/80 rounded-full px-6 py-2 shadow">
            <span className="text-sm text-slate-600">Prefer to pick a slot yourself?</span>
            <button
              type="button"
              data-testid="consultation-google-link"
              onClick={openCalendly}
              className="text-orange-600 hover:text-orange-700 font-semibold text-sm inline-flex items-center"
            >
              Open Google booking <ExternalLink className="ml-1 h-3 w-3" />
            </button>
          </div>
        </div>

        <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl mb-4 text-center">Consultation Details</CardTitle>
            <CardDescription className="text-center mb-6">
              Fill in your details and we'll confirm your slot within 24 hours.
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
                <select data-testid="consultation-service-select" value={form.service_type} onChange={(e) => setField('service_type', e.target.value)} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none">
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
                  <select data-testid="consultation-tz-select" value={form.timezone} onChange={(e) => setField('timezone', e.target.value)} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none">
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
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none inline-flex items-center"
                >
                  {loading ? 'Submitting...' : 'Request Consultation'}
                  {!loading && <Calendar className="ml-2 h-5 w-5" />}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
                What You'll Get From This Consultation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PerkRow icon={Brain} color="orange" label="AI Readiness Assessment" />
                <PerkRow icon={Target} color="green" label="Custom Strategy Roadmap" />
                <PerkRow icon={Award} color="blue" label="ROI Projections" />
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
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      {children}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-600">{label}</label>
      <p className="text-lg font-semibold text-slate-800">{value || '—'}</p>
    </div>
  );
}

function PerkRow({ icon: Icon, color, label }) {
  const bg = { orange: 'bg-orange-100 text-orange-600', green: 'bg-green-100 text-green-600', blue: 'bg-blue-100 text-blue-600' }[color];
  return (
    <div className="text-center">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${bg} mb-2`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-slate-700 font-medium">{label}</p>
    </div>
  );
}
