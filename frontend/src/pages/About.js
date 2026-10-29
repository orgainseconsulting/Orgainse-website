import React from "react";
import {
  Award,
  Brain,
  CheckCircle,
  Globe,
  Shield,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import SEOHead from "../components/SEOHead";
import OrbitDiagram from "../components/brand/OrbitDiagram";

const About = () => {
  const values = [
    {
      title: "Collaborative",
      description: "We work as an extension of your team, inside your operating rhythm, with clear ownership and shared visibility rather than parallel reporting.",
      icon: Users,
      gradient: "from-blue-400 to-blue-500"
    },
    {
      title: "Outcomes-focused", 
      description: "Success measures are agreed before work begins and reviewed through the engagement. We do not publish guaranteed percentages.",
      icon: Target,
      gradient: "from-blue-400 to-blue-500"
    },
    {
      title: "Reliable",
      description: "A consistent operating cadence across time zones, with risks, decisions and delivery health reviewed on a defined schedule.",
      icon: Shield,
      gradient: "from-blue-400 to-blue-500"
    },
    {
      title: "Excellence",
      description: "Technology is introduced only where it improves the operating model, and material decisions retain appropriate human review.",
      icon: Award,
      gradient: "from-violet-400 to-violet-500"
    },
  ];

  return (
    <div className="min-h-screen">
      <SEOHead
        title="About Orgainse | Execution, Governance and Practical AI"
        description="Orgainse is an execution partner for IT services firms, software teams, startups and growing businesses — combining consulting, Project Management as a Service, workflow transformation and the ORQYNE delivery-governance platform."
        canonical="https://orgainse.com/about"
        keywords="about Orgainse, delivery execution partner, PMaaS firm, delivery governance consultancy, ORQYNE, Austin Bengaluru consulting"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About Orgainse",
          url: "https://orgainse.com/about",
          mainEntity: {
            "@type": "Organization",
            name: "Orgainse",
            url: "https://orgainse.com/",
            foundingDate: "2025",
            slogan: "Turn Fragmented Work Into Visible, Governed Execution",
            address: [
              { "@type": "PostalAddress", addressLocality: "Austin", addressRegion: "TX", addressCountry: "US" },
              { "@type": "PostalAddress", addressLocality: "Bengaluru", addressRegion: "Karnataka", addressCountry: "IN" }
            ],
            owns: { "@type": "SoftwareApplication", name: "ORQYNE", url: "https://orgainse.live" }
          }
        }}
      />

      {/* Hero Section with SEO */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 lg:py-16 overflow-hidden">
        {/* Optimized Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-slate-50 via-white to-blue-50 rounded-full blur-3xl animate-pulse will-change-transform"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-slate-50 via-white to-blue-50 rounded-full blur-3xl animate-pulse will-change-transform animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/4 w-6 h-16 bg-blue-300 rounded-full animate-pulse opacity-40"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="animate-fade-in">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                <span className="text-slate-900">About </span>
                <span className="text-blue-600">Orgainse</span>
              </h1>
              
              <h2 className="text-base md:text-lg font-semibold text-slate-700 mb-5 max-w-2xl leading-relaxed">
                An execution partner for organisations that need visibility, governance, and practical
                Artificial Intelligence adoption.
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4 max-w-2xl">
                Orgainse helps Information Technology services companies, software teams, startups, and
                growing businesses move from disconnected tools and reactive reporting to structured, accountable
                execution. We combine business consulting, Project Management as a Service, workflow transformation,
                and ORQYNE — our delivery-governance platform — so that ownership, governance, reporting and
                decisions become easier to see and manage.
              </p>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 max-w-2xl">
                We work across India, the United States, the United Kingdom, the United Arab Emirates, Australia,
                New Zealand, and South Africa. Technology is introduced only where it improves the operating model.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-slate-700 text-sm">Founded in 2025. <span className="text-blue-600 font-semibold">Headquartered in Austin, Texas, USA</span>, with our corporate office in Bengaluru, India.</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-slate-700 text-sm">A <span className="text-blue-600 font-semibold">service-backed model</span>: advisory, implementation, and operating support — not recommendations alone.</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-slate-700 text-sm">Human-governed Artificial Intelligence, with <span className="text-violet-600 font-semibold">approval points designed in</span> from the start.</span>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in animation-delay-500">
              <OrbitDiagram
                coreLabel="Orgainse"
                coreSub="Execution partner"
                coreIcon={Brain}
                innerChips={["Consulting", "PMaaS", "ORQYNE"]}
                outerChips={["Governance", "Visibility", "AI readiness", "Adoption", "Reporting", "Decisions"]}
                caption="Illustration of the Orgainse engagement model. No client data is shown."
                testId="about-orbit-diagram"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Creative Leadership Ecosystem Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Optimized Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl animate-pulse float-animation will-change-transform"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-blue-400 rounded-full blur-2xl animate-pulse float-animation animation-delay-2000 will-change-transform"></div>
          <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-blue-400 rounded-full blur-3xl animate-pulse float-animation animation-delay-500 will-change-transform"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Enhanced Header Section with SEO */}
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] mb-6 text-slate-900">
              How Orgainse Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Four connected stages that take an organisation from a business problem to an operating system with
              defined owners, controls, reporting, and measurable outcomes.
            </p>
            
            {/* Visual Connection Lines */}
            <div className="relative w-32 h-8 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 rounded-full opacity-30 animate-pulse"></div>
              <div className="absolute inset-1 bg-white rounded-full"></div>
              <div className="absolute inset-2 bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 rounded-full"></div>
            </div>
          </div>

          {/* Creative Central Hub Design */}
          <div className="relative">
            {/* Central Connection Point */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-violet-600 rounded-full shadow-2xl flex items-center justify-center animate-spin-slow will-change-transform">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Optimized Connection Lines */}
            <svg className="absolute inset-0 w-full h-full z-10 will-change-transform" viewBox="0 0 800 600">
              <defs>
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.6"/>
                  <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#475569" stopOpacity="0.6"/>
                </linearGradient>
              </defs>
              <path d="M 200 150 Q 400 200 600 150" stroke="url(#connectionGradient)" strokeWidth="3" fill="none" strokeDasharray="10,5" className="animate-pulse"/>
              <path d="M 200 450 Q 400 400 600 450" stroke="url(#connectionGradient)" strokeWidth="3" fill="none" strokeDasharray="10,5" className="animate-pulse"/>
              <path d="M 150 200 Q 200 300 150 400" stroke="url(#connectionGradient)" strokeWidth="3" fill="none" strokeDasharray="10,5" className="animate-pulse"/>
              <path d="M 650 200 Q 600 300 650 400" stroke="url(#connectionGradient)" strokeWidth="3" fill="none" strokeDasharray="10,5" className="animate-pulse"/>
            </svg>

            {/* The Four Pillars - Creative Positioned Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-16 relative z-20">
              
              {/* The Foundation - Top Left */}
              <div className="relative animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="absolute -top-4 -left-4 w-full h-full bg-gradient-to-br from-blue-600 to-violet-600 rounded-3xl transform rotate-0 opacity-20"></div>
                <Card className="relative bg-gradient-to-br from-blue-600 to-violet-600 text-white border-none shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 hover:rotate-0 group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full transform -translate-x-4 translate-y-4"></div>
                  
                  <CardContent className="p-6 sm:p-6 md:p-8 relative z-10">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                        <Target className="h-8 w-8 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold">Diagnose</h3>
                        <p className="text-blue-100 font-medium">Stage one</p>
                      </div>
                    </div>
                    
                    <p className="text-sm leading-relaxed text-blue-50">
                      Clarify the desired outcome, the current workflow, the decision owners, the operating
                      constraints, the risks, and the measurable sources of leakage — before anything is designed
                      or bought.
                    </p>
                    
                    <div className="mt-6 flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full animate-pulse" style={{width: '85%'}}></div>
                      </div>
                      <span className="text-xs text-blue-100 font-semibold">Output · Agreed problem statement</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* The Engine - Top Right */}
              <div className="relative animate-fade-in" style={{ animationDelay: '400ms' }}>
                <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-blue-600 to-violet-600 rounded-3xl transform rotate-0 opacity-20"></div>
                <Card className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-violet-600 text-white border-none shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 hover:rotate-0 group overflow-hidden">
                  <div className="absolute top-0 left-0 w-28 h-28 bg-white opacity-10 rounded-full transform -translate-x-4 -translate-y-4"></div>
                  <div className="absolute bottom-0 right-0 w-36 h-36 bg-white opacity-10 rounded-full transform translate-x-6 translate-y-6"></div>
                  
                  <CardContent className="p-6 sm:p-6 md:p-8 relative z-10">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:-rotate-12 transition-transform duration-500">
                        <Zap className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white">Design</h3>
                        <p className="text-blue-100 font-medium">Stage two</p>
                      </div>
                    </div>
                    
                    <p className="text-sm leading-relaxed text-blue-50">
                      Create the target workflow, the governance model, the reporting rhythm, the roles, the
                      controls, and the success measures — including where Artificial Intelligence genuinely
                      improves decision quality and where a human approval point belongs.
                    </p>
                    
                    <div className="mt-6 flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full animate-pulse" style={{width: '95%'}}></div>
                      </div>
                      <span className="text-xs text-blue-100 font-semibold">Output · Target operating model</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* The Compass - Bottom Left */}
              <div className="relative animate-fade-in" style={{ animationDelay: '600ms' }}>
                <div className="absolute -bottom-4 -left-4 w-full h-full bg-gradient-to-br from-blue-600 to-violet-600 rounded-3xl transform rotate-0 opacity-20"></div>
                <Card className="relative bg-gradient-to-br from-blue-600 to-violet-600 text-white border-none shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 hover:rotate-0 group overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-300 opacity-20 rounded-full transform translate-x-10 -translate-y-10"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-300 opacity-20 rounded-full transform -translate-x-6 translate-y-6"></div>
                  
                  <CardContent className="p-6 sm:p-6 md:p-8 relative z-10">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-180 transition-transform duration-700">
                        <Globe className="h-8 w-8 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold">Implement</h3>
                        <p className="text-blue-100 font-medium">Stage three</p>
                      </div>
                    </div>
                    
                    <p className="text-sm leading-relaxed text-blue-50">
                      Configure the process, the ORQYNE workspace, the templates, the integrations, and the
                      operating cadence. Existing work is imported and validated before it becomes part of the
                      live workspace.
                    </p>
                    
                    <div className="mt-6 flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full animate-pulse" style={{width: '88%'}}></div>
                      </div>
                      <span className="text-xs text-blue-100 font-semibold">Output · Configured workspace</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* The Spark - Bottom Right */}
              <div className="relative animate-fade-in" style={{ animationDelay: '800ms' }}>
                <div className="absolute -bottom-4 -right-4 w-full h-full bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl transform rotate-0 opacity-20"></div>
                <Card className="relative bg-gradient-to-br from-slate-900 to-blue-950 text-white border-none shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 hover:rotate-0 group overflow-hidden">
                  <div className="absolute top-0 left-0 w-44 h-44 bg-slate-500 opacity-10 rounded-full transform -translate-x-12 -translate-y-12"></div>
                  <div className="absolute bottom-0 right-0 w-28 h-28 bg-slate-400 opacity-10 rounded-full transform translate-x-8 translate-y-8"></div>
                  
                  <CardContent className="p-6 sm:p-6 md:p-8 relative z-10">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-[1.03] transition-transform duration-500">
                        <Users className="h-8 w-8 text-slate-700" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold">Govern</h3>
                        <p className="text-slate-300 font-medium">Stage four</p>
                      </div>
                    </div>
                    
                    <p className="text-sm leading-relaxed text-slate-200">
                      Review adoption, risks, decisions, delivery health, and measurable outcomes on a defined
                      schedule — so the operating model keeps working after the engagement, not just during it.
                    </p>
                    
                    <div className="mt-6 flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-slate-400 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full animate-pulse" style={{width: '95%'}}></div>
                      </div>
                      <span className="text-xs text-slate-300 font-semibold">Output · Reviewed delivery health</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Interactive Elements */}
            <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '1000ms' }}>
              <div className="inline-flex items-center space-x-4 bg-white rounded-full px-8 py-4 shadow-2xl">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse animation-delay-300"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse animation-delay-500"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse animation-delay-700"></div>
                </div>
                <span className="text-slate-600 font-medium">One continuous operating loop</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Mission & Vision with Creative Design */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full blur-3xl animate-pulse will-change-transform"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full blur-3xl animate-pulse animation-delay-2000 will-change-transform"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-6 animate-fade-in">
              <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] mb-6 text-white">Our Mission</h2>
              <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
                To give growing organisations the <span className="text-blue-300 font-semibold">execution certainty</span> that
                usually only large enterprises can afford — clear ownership, dependable governance, honest reporting,
                and Artificial Intelligence applied where it genuinely improves a decision. We deliver advisory,
                implementation and operating support together, so a recommendation becomes a
                <span className="text-blue-300 font-semibold"> working operating model</span> rather than a document.
              </p>
            </div>

            <div className="space-y-6 animate-fade-in animation-delay-300">
              <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] mb-6 text-white">Our Vision</h2>
              <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
                A world where delivery is <span className="text-blue-300 font-semibold">visible by default</span> — where every team
                knows what is on track, what is blocked, who decides, and what it costs, and where Artificial
                Intelligence is adopted with governance rather than guesswork. We are building that operating
                standard through consulting, Project Management as a Service, and
                <span className="text-violet-300 font-semibold"> ORQYNE</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* C.O.R.E. Values Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #2563eb 0%, transparent 50%), radial-gradient(circle at 75% 75%, #7c3aed 0%, transparent 50%)`
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] mb-6 text-slate-900">Our C.O.R.E. Values</h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto">
              The four principles that shape how every Orgainse engagement is scoped, run, and reviewed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Floating Background */}
                <div className={`absolute -inset-2 bg-gradient-to-r ${value.gradient} rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000`}></div>
                
                {/* Main Card */}
                <Card className="relative text-center hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 bg-white/90 backdrop-blur-lg border-0 shadow-2xl rounded-3xl overflow-hidden h-full flex flex-col">
                  {/* Top Gradient Bar */}
                  <div className={`h-2 bg-gradient-to-r ${value.gradient}`}></div>
                  
                  <CardHeader className="pb-6 flex-1 flex flex-col justify-between">
                    <div className="mx-auto p-4 bg-white rounded-2xl w-20 h-20 flex items-center justify-center mb-6 group-hover:scale-[1.03] group-hover:rotate-12 transition-all duration-500 shadow-lg">
                      <value.icon className="h-10 w-10 text-slate-600" />
                    </div>
                    <CardTitle className="text-xl mb-3 group-hover:text-blue-600 transition-colors">{value.title}</CardTitle>
                    <CardDescription className="leading-relaxed text-slate-600 group-hover:text-slate-700 transition-colors">
                      {value.description}
                    </CardDescription>
                  </CardHeader>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"></div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
