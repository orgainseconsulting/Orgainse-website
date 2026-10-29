import React, { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { api } from '../lib/api';
import { useCalendly } from '../context/CalendlyContext';
import SEOHead from '../components/SEOHead';

const QUESTIONS = [
  {
    id: 'ai_readiness',
    title: 'Current State of Delivery Visibility',
    question: "How is the status of your work known today?",
    options: [
      { text: 'Status is reconstructed manually before each review', score: 1 },
      { text: 'Owners keep their own trackers; reports are stitched together', score: 3 },
      { text: 'A shared tool exists but is updated inconsistently', score: 5 },
      { text: 'One shared view, updated on an agreed cadence', score: 7 },
      { text: 'Shared view plus tracked risks, actions and dependencies', score: 9 },
      { text: 'Status is a by-product of the work, with assistive automation in place', score: 10 },
    ],
  },
  {
    id: 'data_management',
    title: 'Delivery Data and Reporting',
    question: 'How reliable is the delivery data your leadership decides on?',
    options: [
      { text: 'Mostly spreadsheets, reconciled by hand', score: 1 },
      { text: 'Data exists but is inconsistent between teams', score: 3 },
      { text: 'Consistent fields in one tool, reporting still manual', score: 5 },
      { text: 'Reporting is generated from the working data', score: 7 },
      { text: 'Reporting is generated and reviewed on a defined cadence', score: 9 },
      { text: 'Trusted single source, with automated summaries reviewed by a human', score: 10 },
    ],
  },
  {
    id: 'team_skills',
    title: 'Ownership and Delivery Capability',
    question: 'How clearly is delivery ownership defined across your teams?',
    options: [
      { text: 'Ownership is unclear once work crosses teams', score: 1 },
      { text: 'Owners exist informally but change often', score: 3 },
      { text: 'Named owners for projects, not for risks and decisions', score: 5 },
      { text: 'Named owners for projects, risks, actions and decisions', score: 7 },
      { text: 'Dedicated delivery leads running a defined governance rhythm', score: 9 },
      { text: 'Governance practice is documented, repeatable and coached internally', score: 10 },
    ],
  },
  {
    id: 'budget_allocation',
    title: 'Investment Readiness',
    question: 'How prepared is your organisation to invest in fixing execution?',
    options: [
      { text: 'No budget identified for this yet', score: 1 },
      { text: 'Small budget for tooling improvements only', score: 3 },
      { text: 'Moderate budget available with an agreed business case', score: 5 },
      { text: 'Budget approved for a scoped delivery-governance engagement', score: 7 },
      { text: 'Budget approved for governance plus platform rollout and adoption', score: 9 },
      { text: 'Ongoing budget line for delivery governance as an operating capability', score: 10 },
    ],
  },
  {
    id: 'strategic_vision',
    title: 'Leadership Commitment',
    question: 'How committed is leadership to changing how execution is governed?',
    options: [
      { text: 'Leadership sees no problem to solve here', score: 1 },
      { text: 'Leadership is aware but has not prioritised it', score: 3 },
      { text: 'Leadership supports change with a clear business case', score: 5 },
      { text: 'Leadership actively sponsors the change', score: 7 },
      { text: 'Leadership reviews delivery health on a defined cadence', score: 9 },
      { text: 'Leadership treats execution visibility as an operating standard', score: 10 },
    ],
  },
];

const scoreColor = (s) =>
  s >= 80 ? 'from-blue-500 to-blue-600'
  : s >= 60 ? 'from-blue-500 to-blue-500'
  : s >= 40 ? 'from-blue-500 to-blue-500'
  : 'from-blue-500 to-blue-600';

export default function AIAssessmentTool() {
  const { openCalendly } = useCalendly();
  const [step, setStep] = useState(0);
  const [user, setUser] = useState({ name: '', email: '', company: '', phone: '' });
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...user,
        responses: Object.entries(responses).map(([qid, r]) => ({
          question_id: qid,
          answer: r.answer,
          score: r.score,
        })),
      };
      const res = await api.aiAssessment(payload);
      setResult(res);
      toast.success('Assessment completed!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Results view
  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12">
        <SEOHead
          title="Execution Readiness Assessment | Orgainse"
          description="A five-question directional view of how visible and governed your delivery is today — covering status, reporting reliability, ownership, investment readiness and leadership commitment. Not a certification."
          canonical="https://orgainse.com/ai-assessment"
          keywords="execution readiness assessment, delivery governance assessment, project visibility assessment, delivery health check"
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="font-outfit text-3xl sm:text-4xl font-bold mb-4 tracking-[-0.02em] text-slate-900">
              Your Execution Readiness Report
            </h1>
            <p className="text-base text-slate-600">A directional view of strengths, gaps and priorities — not a certification</p>
          </div>

          <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl mb-10">
            <CardHeader className="text-center p-8">
              <div data-testid="assessment-score-badge" className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r ${scoreColor(result.maturity_score)} mb-4 mx-auto`}>
                <span className="text-4xl font-bold text-white">{result.maturity_score}</span>
              </div>
              <CardTitle className="text-2xl mb-2">Readiness Level: {result.score_label}</CardTitle>
              <CardDescription className="text-lg">You scored {result.maturity_score} out of 100</CardDescription>
            </CardHeader>
          </Card>

          <h2 className="font-outfit text-2xl font-bold mb-6 text-slate-900">Suggested Priorities</h2>
          <div className="grid gap-4 mb-10">
            {result.recommendations.map((rec, i) => (
              <Card key={i} className="bg-white/90 backdrop-blur-lg border-0 shadow-lg rounded-xl">
                <CardHeader className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg mb-1">{rec.title}</CardTitle>
                      <CardDescription className="text-slate-700 mb-2">{rec.description}</CardDescription>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge className="bg-blue-100 text-blue-700">Priority: {rec.priority}</Badge>
                        <Badge className="bg-blue-100 text-blue-700">Timeline: {rec.timeline}</Badge>
                        <Badge className="bg-blue-100 text-blue-700">{rec.category}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
            <h3 className="font-outfit text-2xl font-bold mb-4 text-slate-900">Want to talk through these priorities?</h3>
            <p className="text-slate-600 mb-6">Book a free 30-minute discovery call to discuss the practical next step.</p>
            <button
              data-testid="assessment-book-btn"
              onClick={openCalendly}
              className="px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-full shadow-[0_12px_34px_-14px_rgba(15,23,42,0.6)] transition-colors duration-200 inline-flex items-center"
            >
              Book Free Discovery Call <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12">
      <SEOHead
        title="Execution Readiness Assessment | Orgainse"
        description="A five-question directional view of how visible and governed your delivery is today — covering status, reporting reliability, ownership, investment readiness and leadership commitment. Not a certification."
        canonical="https://orgainse.com/ai-assessment"
        keywords="execution readiness assessment, delivery governance assessment, project visibility assessment, delivery health check"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="font-outfit text-3xl sm:text-4xl font-bold mb-4 tracking-[-0.02em] text-slate-900">
            Execution Readiness Assessment
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            Five questions, about three minutes. You get a directional view of where execution visibility
            and governance are strong today and where the gaps are. It is not a certification or an audit.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Progress</span>
            <span className="text-sm text-slate-600">
              {step === 0 ? 'User Info' : `Question ${step}/${QUESTIONS.length}`}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-violet-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / (QUESTIONS.length + 1)) * 100}%` }}
            />
          </div>
        </div>

        {step === 0 && (
          <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl mb-4 text-center">Let's Get Started</CardTitle>
              <CardDescription className="text-center mb-6">
                Please provide your details so we can send your readiness summary
              </CardDescription>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                  <Input
                    data-testid="assessment-name-input"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                  <Input
                    data-testid="assessment-email-input"
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Company Name *</label>
                  <Input
                    data-testid="assessment-company-input"
                    value={user.company}
                    onChange={(e) => setUser({ ...user, company: e.target.value })}
                    placeholder="Your company"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone (Optional)</label>
                  <Input
                    data-testid="assessment-phone-input"
                    value={user.phone}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  data-testid="assessment-start-btn"
                  onClick={() => setStep(1)}
                  disabled={!user.name || !user.email || !user.company}
                  className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-full shadow-[0_12px_34px_-14px_rgba(0,0,0,0.5)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none inline-flex items-center"
                >
                  Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </CardHeader>
          </Card>
        )}

        {step > 0 && step <= QUESTIONS.length && (
          <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl">
            <CardHeader className="p-8">
              <div className="text-center mb-6">
                <Badge className="bg-blue-100 text-blue-700 mb-4">{QUESTIONS[step - 1].title}</Badge>
                <CardTitle className="text-2xl mb-4">{QUESTIONS[step - 1].question}</CardTitle>
              </div>
              <div className="space-y-3">
                {QUESTIONS[step - 1].options.map((opt, i) => {
                  const selected = responses[QUESTIONS[step - 1].id]?.answer === opt.text;
                  return (
                    <button
                      key={i}
                      data-testid={`assessment-option-${step}-${i}`}
                      onClick={() => setResponses({ ...responses, [QUESTIONS[step - 1].id]: { answer: opt.text, score: opt.score } })}
                      className={`w-full text-left p-4 rounded-xl border-2 transition ${selected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${selected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                          {selected && <div className="w-full h-full rounded-full bg-white scale-50" />}
                        </div>
                        <span className="flex-1 text-slate-700">{opt.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  className="px-6 py-3 border-2 border-slate-300 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition"
                >
                  Previous
                </button>
                {step === QUESTIONS.length ? (
                  <button
                    data-testid="assessment-submit-btn"
                    onClick={submit}
                    disabled={!responses[QUESTIONS[step - 1].id] || loading}
                    className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-full shadow-[0_12px_34px_-14px_rgba(0,0,0,0.5)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none inline-flex items-center"
                  >
                    {loading ? 'Analyzing...' : 'Get My Results'}
                    {!loading && <Target className="ml-2 h-4 w-4" />}
                  </button>
                ) : (
                  <button
                    data-testid="assessment-next-btn"
                    onClick={() => setStep(step + 1)}
                    disabled={!responses[QUESTIONS[step - 1].id]}
                    className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-full shadow-[0_12px_34px_-14px_rgba(0,0,0,0.5)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none inline-flex items-center"
                  >
                    Next Question <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                )}
              </div>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
