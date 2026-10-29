import React from 'react';
import { CheckCircle, TrendingUp, Users, Globe, Zap, Target } from 'lucide-react';

const SEOContent = () => {
  return (
    <div className="py-16 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden" data-testid="seo-content-section">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-slate-50 via-white to-blue-50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-slate-50 via-white to-blue-50 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">

          {/* Introduction */}
          <div className="max-w-none mb-12 relative">
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 rounded-full mb-8"></div>

            <h1 className="font-outfit text-3xl sm:text-4xl font-bold mb-8 leading-tight tracking-[-0.02em] text-slate-900">
              Delivery consulting, Project Management as a Service and delivery governance
            </h1>

            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200">
                <p className="text-lg text-slate-700 leading-relaxed">
                  <strong>Orgainse</strong> is a delivery-execution partner for
                  <strong> Information Technology services firms</strong>, <strong>software teams</strong>,
                  startups and growing businesses. We work on one operating condition: service-led,
                  cross-functional work that needs stronger <strong>execution visibility</strong> and
                  <strong> governance</strong>. Engagements combine consulting,
                  <strong> Project Management as a Service</strong>, workflow transformation and
                  implementation of <strong>ORQYNE</strong>, our delivery-governance workspace.
                </p>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full mt-4"></div>
              </div>

              <div className="bg-gradient-to-r from-slate-50 via-white to-blue-50 rounded-xl p-6 shadow-lg border border-slate-200">
                <p className="text-base text-slate-700 leading-relaxed">
                  The problem we work on is narrow and specific: work is spread across disconnected tools,
                  status is reconstructed manually, ownership is unclear, risks surface late, and decisions
                  are made without a reliable view of delivery health. Our role is to replace that with
                  structured operating rhythms — named owners, tracked risks and actions, agreed reporting
                  cadence and a single view leadership can rely on.
                </p>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full mt-4"></div>
              </div>

              <div className="bg-gradient-to-r from-slate-50 via-white to-blue-50 rounded-xl p-6 shadow-lg border border-slate-200">
                <p className="text-base text-slate-700 leading-relaxed">
                  Orgainse was founded in <strong>2025</strong> and operates from Austin, Texas
                  (headquarters) and Bengaluru, India (corporate office). We do not publish guaranteed
                  percentages, savings figures or delivery improvements. Success measures are agreed in
                  writing before work begins and reviewed through the engagement.
                </p>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full mt-4"></div>
              </div>
            </div>
          </div>

          {/* Why work with Orgainse */}
          <div className="mb-12 relative">
            <div className="mb-10">
              <h2 className="font-outfit text-2xl sm:text-3xl font-bold mb-3 tracking-[-0.02em] text-slate-900">
                How we work
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8 relative z-10">
              <div className="group bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-3 rounded-full shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Agreed measures, not promises</h3>
                    <p className="text-slate-700 leading-relaxed text-sm">
                      Every engagement is scoped around measures both sides agree on up front — delivery
                      health, decision turnaround, forecast reliability — reviewed at an agreed cadence.
                    </p>
                  </div>
                </div>
                <div className="mt-4 w-full h-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full opacity-30"></div>
              </div>

              <div className="group bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-3 rounded-full shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2" data-testid="seo-measurable-delivery-title">
                      Visible, governed execution
                    </h3>
                    <p className="text-slate-700 leading-relaxed text-sm">
                      Risks, actions, dependencies and owners are tracked in one place, so status is a
                      by-product of the work instead of a weekly reporting exercise.
                    </p>
                  </div>
                </div>
                <div className="mt-4 w-full h-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full opacity-30"></div>
              </div>

              <div className="group bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-3 rounded-full shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Practitioners, not observers</h3>
                    <p className="text-slate-700 leading-relaxed text-sm">
                      Delivery leads and governance practitioners who sit inside the operating rhythm,
                      run the cadence and hand it back to your team as a repeatable standard.
                    </p>
                  </div>
                </div>
                <div className="mt-4 w-full h-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full opacity-30"></div>
              </div>

              <div className="group bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-3 rounded-full shadow-lg">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Where we work</h3>
                    <p className="text-slate-700 leading-relaxed text-sm">
                      Offices in Austin, Texas and Bengaluru, India, working a hybrid model and serving
                      clients globally.
                    </p>
                  </div>
                </div>
                <div className="mt-4 w-full h-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full opacity-30"></div>
              </div>
            </div>
          </div>

          {/* What the engagements cover */}
          <div className="mb-12 relative">
            <div className="mb-8">
              <h2 className="font-outfit text-2xl sm:text-3xl font-bold mb-3 tracking-[-0.02em] text-slate-900">
                What engagements cover
              </h2>
              <div className="w-32 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 rounded-full"></div>
            </div>

            <div className="bg-gradient-to-r from-slate-50 via-white to-blue-50 rounded-2xl p-8 shadow-xl border border-slate-200 mb-8 relative z-10">
              <p className="text-base text-slate-700 leading-relaxed">
                Work is scoped to a defined execution problem rather than a broad transformation
                programme. A typical engagement moves through four stages — <strong>Diagnose</strong>,
                <strong> Design</strong>, <strong>Implement</strong> and <strong>Govern</strong> — and
                stops where the agreed scope stops.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-8 relative z-10">
              <div className="group bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-4 rounded-full mb-4 w-14 h-14 flex items-center justify-center shadow-lg">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Project leadership and governance</h3>
                <p className="text-slate-700 leading-relaxed text-sm">
                  Structured project leadership, reporting cadence, risk and dependency management and
                  executive visibility — without immediately building a full internal Project
                  Management Office.
                </p>
              </div>

              <div className="group bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-4 rounded-full mb-4 w-14 h-14 flex items-center justify-center shadow-lg">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Workflow transformation</h3>
                <p className="text-slate-700 leading-relaxed text-sm">
                  Process mapping, hand-off redesign, ownership definition and adoption support, with
                  Artificial Intelligence applied only where it removes a specific manual step.
                </p>
              </div>

              <div className="group bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-4 rounded-full mb-4 w-14 h-14 flex items-center justify-center shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">ORQYNE implementation</h3>
                <p className="text-slate-700 leading-relaxed text-sm">
                  Configuring ORQYNE as the shared delivery workspace — portfolios, registers, reporting
                  and operating rhythm — with service-backed rollout and adoption.
                </p>
              </div>
            </div>
          </div>

          {/* Who we work with */}
          <div className="mb-12 relative">
            <div className="mb-8">
              <h2 className="font-outfit text-2xl sm:text-3xl font-bold mb-3 tracking-[-0.02em] text-slate-900">
                Who we work with
              </h2>
              <div className="w-40 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 rounded-full"></div>
            </div>

            <div className="bg-gradient-to-r from-slate-50 via-white to-blue-50 rounded-2xl p-8 shadow-xl border border-slate-200 mb-8 relative z-10">
              <p className="text-base text-slate-700 leading-relaxed">
                We do not organise around industry verticals. The common condition across our clients is
                service-led, cross-functional delivery where multiple teams, vendors or clients depend on
                each other and execution visibility is the constraint.
              </p>
            </div>

            <div className="relative z-10">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="group bg-gradient-to-r from-slate-50 via-white to-blue-50 rounded-lg p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start space-x-3">
                    <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-2 rounded-full shadow-md">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-slate-900 font-bold text-left mb-2">
                        Information Technology services &amp; software
                      </h4>
                      <p className="text-slate-700 leading-relaxed text-left text-sm">
                        Multi-client delivery portfolios, distributed squads and commitments that need
                        reliable status, capacity and risk visibility.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-r from-slate-50 via-white to-blue-50 rounded-lg p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start space-x-3">
                    <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-2 rounded-full shadow-md">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-slate-900 font-bold text-left mb-2">
                        Healthcare Revenue Intelligence Advisory
                      </h4>
                      <p className="text-slate-700 leading-relaxed text-left text-sm">
                        A separately scoped advisory and analytics engagement: denial trend analysis,
                        payer behaviour insight and revenue-cycle governance advisory.
                      </p>
                      <div
                        data-testid="seo-hria-scope-note"
                        className="mt-3 text-[11px] leading-snug text-blue-900 bg-blue-50 border border-blue-200 rounded-md px-2.5 py-2"
                      >
                        <strong className="text-blue-700">Right fit:</strong> organisations with revenue
                        cycle operations already in place that need an independent view of revenue
                        performance and governance.
                        <br />
                        <strong className="text-violet-700">Not the right fit:</strong> outsourced billing,
                        coding, accounts-receivable follow-up, claims processing or operational revenue
                        cycle delivery — Orgainse does not provide these services.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group bg-gradient-to-r from-slate-50 via-white to-blue-50 rounded-lg p-4 shadow-md border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start space-x-3">
                    <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-2 rounded-full shadow-md">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-slate-900 font-bold text-left mb-2">
                        Startups &amp; growing businesses
                      </h4>
                      <p className="text-slate-700 leading-relaxed text-left text-sm">
                        Teams that have outgrown informal coordination and need delivery ownership,
                        governance and reporting before headcount.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-slate-50 via-white to-blue-50 rounded-2xl p-8 border border-slate-200">
            <h2 className="font-outfit text-2xl sm:text-3xl font-bold text-slate-900 mb-4 tracking-[-0.02em]">
              Start with one execution problem
            </h2>
            <p className="text-base text-slate-700 mb-6">
              A focused 30-minute discovery call clarifies the desired outcome, the current workflow, the
              decision owners, the operating constraints and the most practical next step. The
              recommendation may be consulting, Project Management as a Service, ORQYNE, a short
              diagnostic — or no immediate engagement.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-500 shrink-0" />
                <span className="text-slate-700 text-sm">30-minute discovery call</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-500 shrink-0" />
                <span className="text-slate-700 text-sm">Directional readiness view</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-500 shrink-0" />
                <span className="text-slate-700 text-sm">Scenario modelling, not promises</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-500 shrink-0" />
                <span className="text-slate-700 text-sm">Scoped next step</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOContent;
