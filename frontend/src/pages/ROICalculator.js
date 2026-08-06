import React, { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, TrendingUp, Award, Calendar, Target, CheckCircle } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { api } from '../lib/api';
import { openBookingPage } from '../lib/booking';
import { useCalendly } from '../context/CalendlyContext';
import SEOHead from '../components/SEOHead';

const INDUSTRIES = [
  'IT Services & Software',
  'Healthcare Revenue Intelligence Advisory',
  'Other / Industry-Agnostic',
];

const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

const SERVICES = [
  'Project Management as a Service (PMaaS)',
  'AI & Workflow Transformation',
  'Delivery & Operational Governance',
  'ORQYNE Implementation & Adoption',
  'AI Strategy & Readiness',
  'Healthcare Revenue Intelligence Advisory',
];

const REGIONS = [
  { code: 'US', name: 'United States ($)' },
  { code: 'IN', name: 'India (₹)' },
  { code: 'GB', name: 'United Kingdom (£)' },
  { code: 'AE', name: 'UAE (AED)' },
  { code: 'AU', name: 'Australia (A$)' },
  { code: 'NZ', name: 'New Zealand (NZ$)' },
  { code: 'ZA', name: 'South Africa (R)' },
  { code: 'EU', name: 'Europe (€)' },
];

function fmtCurrency(amount, symbol) {
  if (amount == null || isNaN(amount)) return `${symbol}0`;
  return `${symbol}${Number(amount).toLocaleString()}`;
}

export default function ROICalculator() {
  const { openCalendly } = useCalendly();
  const [form, setForm] = useState({
    company_name: '', email: '', phone: '',
    industry: '', company_size: '',
    current_project_cost: '', project_duration_months: '',
    current_efficiency_rating: 5,
    desired_services: [],
    user_region: 'US',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const setField = (k, v) => setForm({ ...form, [k]: v });
  const toggleService = (s) =>
    setField('desired_services', form.desired_services.includes(s)
      ? form.desired_services.filter((x) => x !== s)
      : [...form.desired_services, s]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        current_project_cost: parseFloat(form.current_project_cost),
        project_duration_months: parseInt(form.project_duration_months, 10),
        current_efficiency_rating: parseInt(form.current_efficiency_rating, 10),
      };
      const res = await api.roiCalculator(payload);
      setResult(res);
      toast.success('ROI calculation ready!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const sym = result.currency_symbol || '$';
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12">
        <SEOHead
          title="Return on Investment Calculator | Orgainse Consulting"
          description="Model potential time, capacity, cost and operating effects using assumptions specific to your organisation. A planning scenario, not a guarantee of results."
          canonical="https://orgainse.com/roi-calculator"
          keywords="ROI calculator, project management ROI, delivery efficiency modelling, AI investment scenario"
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="font-outfit text-3xl sm:text-4xl font-bold mb-4 tracking-[-0.02em] text-slate-900">
              Your Modelled Scenario
            </h1>
            <p className="text-base text-slate-600">
              Based on the assumptions you entered for {result.company_name}
            </p>
            <p data-testid="roi-scenario-disclaimer" className="mt-4 text-sm text-slate-600 max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              These figures are a planning scenario generated from your own inputs. They are not a
              forecast, a promise, or a guarantee of results. Actual outcomes depend on scope, data
              quality, leadership decisions, adoption and operating conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <MetricCard icon={TrendingUp} title="Modelled Return" value={`${result.roi_percentage}%`} color="from-blue-500 to-blue-600" testId="roi-pct" />
            <MetricCard icon={Award} title="Modelled Annual Effect" value={fmtCurrency(result.potential_savings, sym)} color="from-blue-500 to-blue-500" testId="roi-savings" />
            <MetricCard icon={Calendar} title="Indicative Payback" value={`${result.payback_period_months} mo`} color="from-violet-500 to-blue-500" testId="roi-payback" />
            <MetricCard icon={Target} title="Indicative Investment" value={fmtCurrency(result.estimated_project_cost, sym)} color="from-blue-500 to-blue-500" testId="roi-investment" />
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl mb-10">
            <h3 className="font-outfit text-xl font-bold text-slate-900 mb-4">Modelled Effects</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ImpactRow label="Modelled efficiency effect" value={`${result.efficiency_gain_percent}%`} />
              <ImpactRow label="Modelled cost effect" value={`${result.cost_reduction_percent}%`} />
              <ImpactRow label="Modelled capacity effect" value={`${result.revenue_boost_percent}%`} />
            </div>
          </div>

          {result.recommended_services?.length > 0 && (
            <div className="mb-10">
              <h2 className="font-outfit text-2xl font-bold mb-6 text-slate-900">Services That Fit This Scenario</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {result.recommended_services.map((svc, i) => (
                  <Card key={i} className="bg-white/90 backdrop-blur-lg border-0 shadow-lg rounded-xl">
                    <CardHeader className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <CardTitle className="text-lg text-slate-800">{svc.name}</CardTitle>
                        <Badge className="bg-blue-100 text-blue-700">{svc.duration}</Badge>
                      </div>
                      <CardDescription className="text-slate-700 mb-4">{svc.description}</CardDescription>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">{fmtCurrency(Math.round(svc.price), sym)}</span>
                        <div className="flex items-center text-sm text-slate-600">
                          <CheckCircle className="h-4 w-4 mr-1 text-blue-500" /> Indicative
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="text-center bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
            <h3 className="font-outfit text-2xl font-bold mb-4 text-slate-900">Want to pressure-test these assumptions?</h3>
            <p className="text-slate-600 mb-6">Book a free 30-minute discovery call and we will review them with you honestly.</p>
            <button
              data-testid="roi-book-btn"
              onClick={openCalendly}
              className="px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full shadow-[0_12px_34px_-14px_rgba(15,23,42,0.6)] transition-colors duration-200 inline-flex items-center"
            >
              Book a Discovery Call <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12">
      <SEOHead
        title="Return on Investment Calculator | Orgainse Consulting"
        description="Model potential time, capacity, cost and operating effects using assumptions specific to your organisation. A planning scenario, not a guarantee of results."
        canonical="https://orgainse.com/roi-calculator"
        keywords="ROI calculator, project management ROI, delivery efficiency modelling, AI investment scenario"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            ROI Calculator
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Model potential time, capacity and cost effects using your own assumptions. A planning scenario, not a guarantee of results.
          </p>
        </div>

        <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl mb-4 text-center">Business Information</CardTitle>
            <form onSubmit={submit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Company Name *">
                  <Input data-testid="roi-company-input" value={form.company_name} onChange={(e) => setField('company_name', e.target.value)} required />
                </Field>
                <Field label="Email Address *">
                  <Input data-testid="roi-email-input" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} required />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Phone (Optional)">
                  <Input data-testid="roi-phone-input" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
                </Field>
                <Field label="Industry *">
                  <select data-testid="roi-industry-select" value={form.industry} onChange={(e) => setField('industry', e.target.value)} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none">
                    <option value="">Select your industry</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Company Size *">
                  <select data-testid="roi-size-select" value={form.company_size} onChange={(e) => setField('company_size', e.target.value)} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none">
                    <option value="">Select company size</option>
                    {SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                </Field>
                <Field label="Region (for currency) *">
                  <select data-testid="roi-region-select" value={form.user_region} onChange={(e) => setField('user_region', e.target.value)} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none">
                    {REGIONS.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Current Project Cost (annual) *">
                  <Input data-testid="roi-cost-input" type="number" min="1000" value={form.current_project_cost} onChange={(e) => setField('current_project_cost', e.target.value)} required placeholder="50000" />
                </Field>
                <Field label="Project Duration (months) *">
                  <Input data-testid="roi-duration-input" type="number" min="1" max="60" value={form.project_duration_months} onChange={(e) => setField('project_duration_months', e.target.value)} required placeholder="6" />
                </Field>
              </div>

              <Field label="Current Efficiency Rating (1-10)">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600">1</span>
                  <input data-testid="roi-efficiency-slider" type="range" min="1" max="10" value={form.current_efficiency_rating} onChange={(e) => setField('current_efficiency_rating', e.target.value)} className="flex-1 h-2 bg-slate-200 rounded-lg cursor-pointer" />
                  <span className="text-sm text-slate-600">10</span>
                  <Badge className="bg-blue-100 text-blue-700 ml-2">{form.current_efficiency_rating}</Badge>
                </div>
              </Field>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Services of Interest</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SERVICES.map((s) => {
                    const checked = form.desired_services.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        data-testid={`roi-service-${s.replace(/\W+/g, '-').toLowerCase()}`}
                        onClick={() => toggleService(s)}
                        className={`p-3 rounded-lg border-2 text-left transition ${checked ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded border-2 ${checked ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                            {checked && <CheckCircle className="h-3 w-3 text-white" />}
                          </div>
                          <span className="text-sm font-medium">{s}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <button
                  data-testid="roi-submit-btn"
                  type="submit"
                  disabled={loading || !form.company_name || !form.email || !form.industry || !form.company_size || !form.current_project_cost || !form.project_duration_months}
                  className="px-7 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-full shadow-[0_12px_34px_-14px_rgba(0,0,0,0.5)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none inline-flex items-center"
                >
                  {loading ? 'Calculating...' : 'Calculate My ROI'}
                  {!loading && <TrendingUp className="ml-2 h-5 w-5" />}
                </button>
              </div>
            </form>
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
        title="Return on Investment Calculator | Orgainse Consulting"
        description="Model potential time, capacity, cost and operating effects using assumptions specific to your organisation. A planning scenario, not a guarantee of results."
        canonical="https://orgainse.com/roi-calculator"
        keywords="ROI calculator, project management ROI, delivery efficiency modelling, AI investment scenario"
      />
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      {children}
    </div>
  );
}

function MetricCard({ icon: Icon, title, value, color, testId }) {
  return (
    <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl">
      <CardHeader className="text-center p-6">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${color} mb-3 mx-auto`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-lg mb-1">{title}</CardTitle>
        <CardDescription data-testid={testId} className="text-2xl font-bold text-slate-900">
          {value}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function ImpactRow({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 text-center">
      <SEOHead
        title="Return on Investment Calculator | Orgainse Consulting"
        description="Model potential time, capacity, cost and operating effects using assumptions specific to your organisation. A planning scenario, not a guarantee of results."
        canonical="https://orgainse.com/roi-calculator"
        keywords="ROI calculator, project management ROI, delivery efficiency modelling, AI investment scenario"
      />
      <div className="text-sm text-slate-600 mb-1">{label}</div>
      <div className="text-2xl font-bold text-blue-600">{value}</div>
    </div>
  );
}
