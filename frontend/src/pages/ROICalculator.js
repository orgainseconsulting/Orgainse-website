import React, { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, TrendingUp, Award, Calendar, Target, CheckCircle } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { api } from '../lib/api';
import { openBookingPage } from '../lib/booking';

const INDUSTRIES = [
  'IT Services & Software',
  'Healthcare Revenue Intelligence Advisory',
  'Other / Industry-Agnostic',
];

const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

const SERVICES = [
  'AI Project Management', 'Digital Transformation', 'Operational Optimization',
  'Business Strategy Development', 'Healthcare Revenue Intelligence Advisory', 'Risk Management & Compliance',
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
              Your ROI Analysis Report
            </h1>
            <p className="text-lg text-slate-600">
              Personalized projections for {result.company_name}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <MetricCard icon={TrendingUp} title="ROI Percentage" value={`${result.roi_percentage}%`} color="from-green-500 to-emerald-600" testId="roi-pct" />
            <MetricCard icon={Award} title="Annual Savings" value={fmtCurrency(result.potential_savings, sym)} color="from-blue-500 to-green-500" testId="roi-savings" />
            <MetricCard icon={Calendar} title="Payback Period" value={`${result.payback_period_months} mo`} color="from-purple-500 to-blue-500" testId="roi-payback" />
            <MetricCard icon={Target} title="Investment" value={fmtCurrency(result.estimated_project_cost, sym)} color="from-orange-500 to-red-500" testId="roi-investment" />
          </div>

          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl mb-10">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Projected Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ImpactRow label="Efficiency gain" value={`${result.efficiency_gain_percent}%`} />
              <ImpactRow label="Cost reduction" value={`${result.cost_reduction_percent}%`} />
              <ImpactRow label="Revenue boost" value={`${result.revenue_boost_percent}%`} />
            </div>
          </div>

          {result.recommended_services?.length > 0 && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">Recommended Services</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {result.recommended_services.map((svc, i) => (
                  <Card key={i} className="bg-white/90 backdrop-blur-lg border-0 shadow-lg rounded-xl">
                    <CardHeader className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <CardTitle className="text-lg text-slate-800">{svc.name}</CardTitle>
                        <Badge className="bg-green-100 text-green-700">{svc.duration}</Badge>
                      </div>
                      <CardDescription className="text-slate-700 mb-4">{svc.description}</CardDescription>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-orange-600">{fmtCurrency(Math.round(svc.price), sym)}</span>
                        <div className="flex items-center text-sm text-slate-600">
                          <CheckCircle className="h-4 w-4 mr-1 text-green-500" /> ROI focused
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="text-center bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold mb-4 text-slate-800">Ready to Achieve These Results?</h3>
            <p className="text-slate-600 mb-6">Book a strategy session to discuss implementation.</p>
            <button
              data-testid="roi-book-btn"
              onClick={openBookingPage}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition transform hover:scale-105 inline-flex items-center"
            >
              Schedule Strategy Session <ArrowRight className="ml-2 h-5 w-5" />
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
            ROI Calculator
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Calculate your potential return on investment from AI transformation services.
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
                  <select data-testid="roi-industry-select" value={form.industry} onChange={(e) => setField('industry', e.target.value)} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none">
                    <option value="">Select your industry</option>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Company Size *">
                  <select data-testid="roi-size-select" value={form.company_size} onChange={(e) => setField('company_size', e.target.value)} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none">
                    <option value="">Select company size</option>
                    {SIZES.map((s) => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                </Field>
                <Field label="Region (for currency) *">
                  <select data-testid="roi-region-select" value={form.user_region} onChange={(e) => setField('user_region', e.target.value)} required className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-orange-400 focus:outline-none">
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
                  <Badge className="bg-orange-100 text-orange-700 ml-2">{form.current_efficiency_rating}</Badge>
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
                        className={`p-3 rounded-lg border-2 text-left transition ${checked ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 hover:border-orange-300'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded border-2 ${checked ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}`}>
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
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none inline-flex items-center"
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
      <div className="text-sm text-slate-600 mb-1">{label}</div>
      <div className="text-2xl font-bold text-orange-600">{value}</div>
    </div>
  );
}
