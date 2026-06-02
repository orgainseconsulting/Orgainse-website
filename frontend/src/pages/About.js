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

const About = () => {
  const values = [
    {
      title: "Collaborative",
      description: "We work as an extension of your team with AI-powered collaboration tools and GPT-powered project management",
      icon: Users,
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      title: "Outcomes-focused", 
      description: "Results that matter to your business with measurable AI-driven improvements and data-backed growth planning",
      icon: Target,
      gradient: "from-green-400 to-emerald-500"
    },
    {
      title: "Reliable",
      description: "Consistent delivery and 24/7 AI-powered support across global time zones with predictive maintenance",
      icon: Shield,
      gradient: "from-orange-400 to-red-500"
    },
    {
      title: "Excellence",
      description: "Best-in-class AI-native solutions and world-class service delivery with automated scenario modeling",
      icon: Award,
      gradient: "from-purple-400 to-pink-500"
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Revolutionary Hero Section with SEO */}
      <section className="relative bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 py-12 lg:py-16 overflow-hidden">
        {/* Optimized Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl animate-pulse will-change-transform"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl animate-pulse will-change-transform animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/4 w-6 h-16 bg-blue-300 rounded-full animate-pulse opacity-40"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
                <span className="text-slate-800">About </span>
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-text">
                  Orgainse Consulting
                </span>
              </h1>
              
              <h2 className="text-xl lg:text-2xl text-blue-600 font-bold mb-4">
                AI-Native Digital Transformation Leaders & GPT-Powered Project Management Experts
              </h2>
              
              <p className="text-lg text-slate-700 leading-relaxed mb-6 text-justify">
                We are an AI-native consulting firm specializing in <span className="text-orange-600 font-bold">GPT-powered project management</span>, 
                intelligent business strategy, and <span className="text-green-600 font-bold">automated operational optimization </span>  
                for startups and SMEs across India, USA, UK, UAE, Australia, New Zealand, and South Africa.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-slate-700 text-sm">Founded in 2025 with <span className="text-blue-600 font-semibold">AI-first approach</span> — headquartered in Austin, Texas, USA with our corporate office in Bengaluru, India, operational within 4 months.</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-slate-700 text-sm">Global operations: <span className="text-orange-600 font-semibold">AI project management service</span> across the globe. </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-slate-700 text-sm">AI-powered methodologies with <span className="text-purple-600 font-semibold">GPT implementation roadmap</span> integration.</span>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in animation-delay-500">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl blur opacity-60 group-hover:opacity-80 transition duration-1000 animate-pulse"></div>
                <img
                  src="https://images.unsplash.com/photo-1694903089438-bf28d4697d9a?w=600&h=400&fit=crop"
                  alt="AI Business Implementation - Professional human-AI interaction representing intelligent cross-industry automation and digital transformation across IT Services & Software, Healthcare Revenue Intelligence Advisory, and industry-agnostic SME and startup engagements"
                  className="relative rounded-2xl w-full h-[400px] object-cover transform group-hover:scale-105 transition-all duration-700 shadow-2xl"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  width="600"
                  height="400"
                />
                
                {/* SEO-Optimized Floating Elements */}
                <div className="absolute top-4 right-4 bg-blue-500 rounded-full p-3 animate-bounce will-change-transform">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="absolute bottom-4 left-4 bg-purple-500 rounded-full p-3 animate-pulse will-change-transform">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creative Leadership Ecosystem Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-orange-50 to-green-50 relative overflow-hidden">
        {/* Optimized Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-orange-400 rounded-full blur-3xl animate-pulse float-animation will-change-transform"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-green-400 rounded-full blur-2xl animate-pulse float-animation animation-delay-2000 will-change-transform"></div>
          <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-yellow-400 rounded-full blur-3xl animate-pulse float-animation animation-delay-500 will-change-transform"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Enhanced Header Section with SEO */}
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-500 via-green-500 to-slate-700 bg-clip-text text-transparent">
                The ORGAINSE
              </span>
              <br />
              <span className="text-slate-800">Ecosystem</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto mb-8 leading-relaxed text-justify">
              Four interconnected forces delivering <span className="font-bold text-orange-600">AI-driven business strategy consulting</span> and 
              <span className="font-bold text-green-600"> GPT-powered agile coaching </span>. Not hierarchy, but 
              <span className="font-bold text-slate-700"> predictive risk analytics. </span>.
            </p>
            
            {/* Visual Connection Lines */}
            <div className="relative w-32 h-8 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-green-500 to-blue-500 rounded-full opacity-30 animate-pulse"></div>
              <div className="absolute inset-1 bg-white rounded-full"></div>
              <div className="absolute inset-2 bg-gradient-to-r from-orange-500 via-green-500 to-blue-500 rounded-full"></div>
            </div>
          </div>

          {/* Creative Central Hub Design */}
          <div className="relative">
            {/* Central Connection Point */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-green-500 rounded-full shadow-2xl flex items-center justify-center animate-spin-slow will-change-transform">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-green-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Optimized Connection Lines */}
            <svg className="absolute inset-0 w-full h-full z-10 will-change-transform" viewBox="0 0 800 600">
              <defs>
                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F97316" stopOpacity="0.6"/>
                  <stop offset="50%" stopColor="#10B981" stopOpacity="0.6"/>
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
                <div className="absolute -top-4 -left-4 w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl transform rotate-3 opacity-20"></div>
                <Card className="relative bg-gradient-to-br from-orange-400 to-orange-600 text-white border-none shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-2 group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full transform -translate-x-4 translate-y-4"></div>
                  
                  <CardContent className="p-6 sm:p-6 md:p-8 relative z-10">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                        <Target className="h-8 w-8 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold">The Foundation</h3>
                        <p className="text-orange-100 font-medium">Strategy & Vision</p>
                      </div>
                    </div>
                    
                    <p className="text-sm leading-relaxed text-orange-50">
                      The bedrock of <span className="font-bold">AI-driven business strategy consulting</span>. Sets unwavering standards, builds 
                      strategic frameworks with <span className="font-bold">automated market intelligence GPT</span>, and ensures every engagement 
                      delivers measurable impact with crystal-clear alignment.
                    </p>
                    
                    <div className="mt-6 flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-orange-200 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full animate-pulse" style={{width: '85%'}}></div>
                      </div>
                      <span className="text-xs text-orange-100">Impact: 85%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* The Engine - Top Right */}
              <div className="relative animate-fade-in" style={{ animationDelay: '400ms' }}>
                <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-3xl transform -rotate-3 opacity-20"></div>
                <Card className="relative bg-gradient-to-br from-yellow-200 via-yellow-300 to-amber-400 text-slate-800 border-none shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 hover:-rotate-2 group overflow-hidden">
                  <div className="absolute top-0 left-0 w-28 h-28 bg-amber-500 opacity-20 rounded-full transform -translate-x-4 -translate-y-4"></div>
                  <div className="absolute bottom-0 right-0 w-36 h-36 bg-yellow-500 opacity-20 rounded-full transform translate-x-6 translate-y-6"></div>
                  
                  <CardContent className="p-6 sm:p-6 md:p-8 relative z-10">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:-rotate-12 transition-transform duration-500">
                        <Zap className="h-8 w-8 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold">The Engine</h3>
                        <p className="text-amber-800 font-medium">Innovation & Growth</p>
                      </div>
                    </div>
                    
                    <p className="text-sm leading-relaxed text-amber-900">
                      Pure momentum through <span className="font-bold">GPT-powered project planning</span>. Harnesses cutting-edge 
                      <span className="font-bold"> AI operational optimization </span>, breakthrough technologies, and 
                      revolutionary thinking to propel clients beyond their competition.
                    </p>
                    
                    <div className="mt-6 flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-amber-300 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-600 rounded-full animate-pulse" style={{width: '95%'}}></div>
                      </div>
                      <span className="text-xs text-amber-800">Power: 95%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* The Compass - Bottom Left */}
              <div className="relative animate-fade-in" style={{ animationDelay: '600ms' }}>
                <div className="absolute -bottom-4 -left-4 w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-3xl transform rotate-2 opacity-20"></div>
                <Card className="relative bg-gradient-to-br from-green-400 to-green-600 text-white border-none shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 group overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-300 opacity-20 rounded-full transform translate-x-10 -translate-y-10"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-300 opacity-20 rounded-full transform -translate-x-6 translate-y-6"></div>
                  
                  <CardContent className="p-6 sm:p-6 md:p-8 relative z-10">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-180 transition-transform duration-700">
                        <Globe className="h-8 w-8 text-green-500" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold">The Compass</h3>
                        <p className="text-green-100 font-medium">Navigation & Direction</p>
                      </div>
                    </div>
                    
                    <p className="text-sm leading-relaxed text-green-50">
                      Strategic navigation mastery with <span className="font-bold">data-driven agile transformation</span>. Guides intelligent 
                      decision-making through complex markets using <span className="font-bold">AI risk management consulting</span>, ensuring 
                      clients always stay ahead of industry curves.
                    </p>
                    
                    <div className="mt-6 flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-green-200 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full animate-pulse" style={{width: '88%'}}></div>
                      </div>
                      <span className="text-xs text-green-100">Accuracy: 88%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* The Spark - Bottom Right */}
              <div className="relative animate-fade-in" style={{ animationDelay: '800ms' }}>
                <div className="absolute -bottom-4 -right-4 w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 rounded-3xl transform -rotate-2 opacity-20"></div>
                <Card className="relative bg-gradient-to-br from-slate-700 to-slate-900 text-white border-none shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 hover:-rotate-1 group overflow-hidden">
                  <div className="absolute top-0 left-0 w-44 h-44 bg-slate-500 opacity-10 rounded-full transform -translate-x-12 -translate-y-12"></div>
                  <div className="absolute bottom-0 right-0 w-28 h-28 bg-slate-400 opacity-10 rounded-full transform translate-x-8 translate-y-8"></div>
                  
                  <CardContent className="p-6 sm:p-6 md:p-8 relative z-10">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                        <Users className="h-8 w-8 text-slate-700" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold">The Spark</h3>
                        <p className="text-slate-300 font-medium">Execution & Delivery</p>
                      </div>
                    </div>
                    
                    <p className="text-sm leading-relaxed text-slate-200">
                      Transformation catalyst with <span className="font-bold">GPT-based risk co-pilot</span>. Converts strategies into reality 
                      with surgical precision, optimizing performance through <span className="font-bold">predictive maintenance AI agent</span> 
                      and maximizing ROI for unprecedented client success.
                    </p>
                    
                    <div className="mt-6 flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-slate-400 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full animate-pulse" style={{width: '95%'}}></div>
                      </div>
                      <span className="text-xs text-slate-300">Delivery: 95%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Interactive Elements */}
            <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '1000ms' }}>
              <div className="inline-flex items-center space-x-4 bg-white rounded-full px-8 py-4 shadow-2xl">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse animation-delay-300"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse animation-delay-500"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse animation-delay-700"></div>
                </div>
                <span className="text-slate-600 font-medium">Working in Perfect Harmony</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Mission & Vision with Creative Design */}
      <section className="py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl animate-pulse will-change-transform"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-3xl animate-pulse animation-delay-2000 will-change-transform"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Our Mission</span>
              </h2>
              <p className="text-xl text-slate-200 leading-relaxed">
                To democratize access to world-class <span className="text-yellow-400 font-bold">AI-native digital transformation consulting</span> through  
                <span className="text-green-400 font-bold"> GPT-powered solutions</span>, enabling organizations of all sizes to achieve 
                breakthrough performance and sustainable growth with <span className="text-blue-400 font-bold">intelligent automation</span> and  
                <span className="text-purple-400 font-bold"> real-time compliance monitoring</span>.
              </p>
            </div>

            <div className="space-y-6 animate-fade-in animation-delay-300">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Our Vision</span>
              </h2>
              <p className="text-xl text-slate-200 leading-relaxed">
                To be the global leader in <span className="text-orange-400 font-bold">AI-native consulting</span>, setting the standard 
                for innovation, excellence, and measurable business outcomes through <span className="text-green-400 font-bold">cutting-edge GPT</span> and  
                <span className="text-blue-400 font-bold"> AI technologies</span> across all industries we serve with <span className="text-pink-400 font-bold">outcome-based AI strategy consulting</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Revolutionary C.O.R.E. Values Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-orange-50 to-green-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #f97316 0%, transparent 50%), radial-gradient(circle at 75% 75%, #10b981 0%, transparent 50%)`
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-500 via-green-500 to-purple-500 bg-clip-text text-transparent">
                Our C.O.R.E. Values
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              The AI-powered principles that guide our <span className="font-bold text-orange-600">multi-agent orchestration platform</span> approach
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
                <Card className="relative text-center hover:shadow-xl transition-all duration-500 transform hover:-translate-y-4 bg-white/90 backdrop-blur-lg border-0 shadow-2xl rounded-3xl overflow-hidden h-full flex flex-col">
                  {/* Top Gradient Bar */}
                  <div className={`h-2 bg-gradient-to-r ${value.gradient}`}></div>
                  
                  <CardHeader className="pb-6 flex-1 flex flex-col justify-between">
                    <div className="mx-auto p-4 bg-white rounded-2xl w-20 h-20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                      <value.icon className="h-10 w-10 text-slate-600" />
                    </div>
                    <CardTitle className="text-xl mb-3 group-hover:text-orange-600 transition-colors">{value.title}</CardTitle>
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
