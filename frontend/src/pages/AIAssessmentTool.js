import React, { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { api } from '../lib/api';
import { useCalendly } from '../context/CalendlyContext';

const QUESTIONS = [
  {
    id: 'ai_readiness',
    title: 'AI Readiness & Current State',
    question: "How would you describe your organization's current AI adoption level?",
    options: [
      { text: 'No AI implementation - completely traditional processes', score: 1 },
      { text: 'Aware of AI potential but no concrete plans', score: 3 },
      { text: 'Basic automation tools in use (Excel macros, simple workflows)', score: 5 },
      { text: 'Some AI tools implemented (chatbots, basic analytics)', score: 7 },
      { text: 'Advanced AI integration across multiple departments', score: 9 },
      { text: 'AI-native organization with comprehensive AI strategy', score: 10 },
    ],
  },
  {
    id: 'data_management',
    title: 'Data Infrastructure & Management',
    question: 'How effectively does your organization collect, store, and analyze data?',
    options: [
      { text: 'Manual data collection with limited storage systems', score: 1 },
      { text: 'Basic spreadsheet-based data management', score: 3 },
      { text: 'Database systems with some automated collection', score: 5 },
      { text: 'Integrated data platforms with analytics capabilities', score: 7 },
      { text: 'Advanced data lakes/warehouses with real-time analytics', score: 9 },
      { text: 'AI-powered data management with predictive analytics', score: 10 },
    ],
  },
  {
    id: 'team_skills',
    title: 'Team Capabilities & Skills',
    question: "What is your team's current AI and technology skill level?",
    options: [
      { text: 'Limited technical skills - primarily traditional business roles', score: 1 },
      { text: 'Basic computer literacy with willingness to learn', score: 3 },
      { text: 'Some team members with technical backgrounds', score: 5 },
      { text: 'Dedicated IT/tech team with AI awareness', score: 7 },
      { text: 'AI specialists and data scientists on staff', score: 9 },
      { text: 'AI-first organization with comprehensive AI expertise', score: 10 },
    ],
  },
  {
    id: 'budget_allocation',
    title: 'Budget & Investment Readiness',
    question: 'How prepared is your organization to invest in AI transformation?',
    options: [
      { text: 'Very limited budget - looking for low-cost solutions', score: 1 },
      { text: 'Small budget allocated for technology improvements', score: 3 },
      { text: 'Moderate budget with approval for proven ROI solutions', score: 5 },
      { text: 'Significant budget allocated for digital transformation', score: 7 },
      { text: 'Substantial investment ready for comprehensive AI implementation', score: 9 },
      { text: 'Enterprise-level budget with dedicated AI transformation fund', score: 10 },
    ],
  },
  {
    id: 'strategic_vision',
    title: 'Strategic Vision & Leadership Support',
    question: 'How committed is your leadership to AI transformation?',
    options: [
      { text: 'Leadership is skeptical about AI benefits', score: 1 },
      { text: 'Leadership is curious but cautious about AI', score: 3 },
      { text: 'Leadership supports AI initiatives with proper business case', score: 5 },
      { text: 'Leadership actively champions AI transformation', score: 7 },
      { text: 'Leadership has comprehensive AI strategy for next 3 years', score: 9 },
      { text: 'Leadership views AI as core competitive advantage', score: 10 },
    ],
  },
];

const scoreColor = (s) =>
  s >= 80 ? 'from-green-500 to-emerald-600'
  : s >= 60 ? 'from-yellow-500 to-orange-500'
  : s >= 40 ? 'from-orange-500 to-red-500'
  : 'from-red-500 to-red-600';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
              Your AI Readiness Report
            </h1>
            <p className="text-lg text-slate-600">Personalized AI transformation roadmap</p>
          </div>

          <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl mb-10">
            <CardHeader className="text-center p-8">
              <div data-testid="assessment-score-badge" className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r ${scoreColor(result.maturity_score)} mb-4 mx-auto`}>
                <span className="text-4xl font-bold text-white">{result.maturity_score}</span>
              </div>
              <CardTitle className="text-2xl mb-2">AI Maturity Score: {result.score_label}</CardTitle>
              <CardDescription className="text-lg">You scored {result.maturity_score} out of 100</CardDescription>
            </CardHeader>
          </Card>

          <h2 className="text-2xl font-bold mb-6 text-slate-800">Personalized Recommendations</h2>
          <div className="grid gap-4 mb-10">
            {result.recommendations.map((rec, i) => (
              <Card key={i} className="bg-white/90 backdrop-blur-lg border-0 shadow-lg rounded-xl">
                <CardHeader className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg shrink-0">
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg mb-1">{rec.title}</CardTitle>
                      <CardDescription className="text-slate-700 mb-2">{rec.description}</CardDescription>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge className="bg-orange-100 text-orange-700">Priority: {rec.priority}</Badge>
                        <Badge className="bg-blue-100 text-blue-700">Timeline: {rec.timeline}</Badge>
                        <Badge className="bg-green-100 text-green-700">{rec.category}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold mb-4 text-slate-800">Ready to Transform Your Business?</h3>
            <p className="text-slate-600 mb-6">Book a free consultation to discuss implementation.</p>
            <button
              data-testid="assessment-book-btn"
              onClick={openCalendly}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition transform hover:scale-105 inline-flex items-center"
            >
              Book Free Consultation <ArrowRight className="ml-2 h-5 w-5" />
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
            AI Readiness Assessment
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover your AI maturity level and get a personalized roadmap in 5 minutes.
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
              className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / (QUESTIONS.length + 1)) * 100}%` }}
            />
          </div>
        </div>

        {step === 0 && (
          <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl mb-4 text-center">Let's Get Started</CardTitle>
              <CardDescription className="text-center mb-6">
                Please provide your information to receive personalized recommendations
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
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none inline-flex items-center"
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
                <Badge className="bg-orange-100 text-orange-700 mb-4">{QUESTIONS[step - 1].title}</Badge>
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
                      className={`w-full text-left p-4 rounded-xl border-2 transition ${selected ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-300'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${selected ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}`}>
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
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none inline-flex items-center"
                  >
                    {loading ? 'Analyzing...' : 'Get My Results'}
                    {!loading && <Target className="ml-2 h-4 w-4" />}
                  </button>
                ) : (
                  <button
                    data-testid="assessment-next-btn"
                    onClick={() => setStep(step + 1)}
                    disabled={!responses[QUESTIONS[step - 1].id]}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none inline-flex items-center"
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
