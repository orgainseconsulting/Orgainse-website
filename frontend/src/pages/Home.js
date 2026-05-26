import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  Brain,
  Calendar,
  CheckCircle,
  ExternalLink,
  Globe,
  Mail,
  Shield,
  Target,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { api } from "../lib/api";
import SEOHead from "../components/SEOHead";
import SocialShare from "../components/SocialShare";
import RegionSelector from "../components/RegionSelector";
import { useCalendly } from "../context/CalendlyContext";
import { useRegionalPricing } from "../context/RegionalPricingContext";

const Home = () => {
  const { getRegionalPrice, regionConfig } = useRegionalPricing();
  const { openCalendly } = useCalendly();
  
  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("");
  const [isNewsletterLoading, setIsNewsletterLoading] = useState(false);

  // Base prices for resources (in USD)
  const resourceBasePrices = {
    aiGuide: 197,    // Back to original values
    roiTemplate: 97,  // Back to original values
    checklist: 127    // Back to original values
  };

  // Calculate total value
  const totalValue = resourceBasePrices.aiGuide + resourceBasePrices.roiTemplate + resourceBasePrices.checklist;

  // Lead generation tracking state
  const [leadActions, setLeadActions] = useState({
    assessment: false,
    consultation: false,
    resources: []
  });

  // Newsletter subscription handler
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsNewsletterLoading(true);
    setNewsletterStatus("");

    try {
      const res = await api.newsletter({ email: newsletterEmail });
      if (res?.status === "already_subscribed") {
        setNewsletterStatus("duplicate");
      } else {
        setNewsletterStatus("success");
        trackLeadAction("newsletter_signup");
      }
      setNewsletterEmail("");
      setTimeout(() => setNewsletterStatus(""), 4000);
    } catch (error) {
      console.error("Newsletter submission error:", error);
      toast.error(error.message || "Subscription failed. Please try again.");
      setNewsletterStatus("error");
      setTimeout(() => setNewsletterStatus(""), 4000);
    } finally {
      setIsNewsletterLoading(false);
    }
  };

  // AI Assessment handler
  const handleAIAssessment = () => {
    // Track engagement
    trackLeadAction('ai_assessment_click');
    // Navigate to AI Assessment Tool
    window.location.href = '/ai-assessment';
  };

  // Free Consultation handler
  const handleFreeConsultation = () => {
    // Track engagement
    trackLeadAction('consultation_click');
    // Scroll to contact form or open booking modal
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Lead action tracking
  const trackLeadAction = (action) => {
    console.log(`Lead action tracked: ${action}`);
    // This could be enhanced to send to analytics
  };

  const stats = [
    { value: "25%", label: "Faster Project Delivery", color: "from-orange-400 to-orange-600" },
    { value: "45%", label: "Cost Reduction in Operations", color: "from-green-400 to-green-600" },
    { value: "4.6★", label: "Client Satisfaction Rating", color: "from-yellow-400 to-yellow-600" }, // Updated 2025-01-09
    { value: "90", label: "Days Average Implementation", color: "from-purple-400 to-purple-600" },
  ];

  const services = [
    {
      title: "AI Project Management Service (PMaaS)",
      description: "GPT-powered project planning and intelligent PMaaS for startups and SMEs",
      icon: Target,
      keywords: "AI project management service, PMaaS for startups, GPT-powered project planning",
      gradient: "from-orange-400 to-red-500",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      title: "Digital Transformation Consulting", 
      description: "AI-native digital transformation consulting with multi-agent orchestration platforms",
      icon: Zap,
      keywords: "AI-native digital transformation, GPT implementation roadmap, digital transformation UAE SMEs",
      gradient: "from-yellow-400 to-orange-500",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600"
    },
    {
      title: "AI Operational Optimization",
      description: "AI-driven workflow automation and predictive maintenance solutions",
      icon: TrendingUp,
      keywords: "AI operational optimization consulting, reduce OPEX with AI, GPT process mining",
      gradient: "from-green-400 to-emerald-500",
      iconBg: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Healthcare Revenue Intelligence Advisory",
      description: "AI-powered advisory for US healthcare revenue performance — denial intelligence, payer behavior analytics, and governance frameworks",
      icon: Shield,
      keywords: "healthcare revenue cycle management consulting, RCM advisory, AI revenue intelligence US healthcare",
      gradient: "from-blue-400 to-indigo-500",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Business Strategy Development",
      description: "AI-driven business strategy consulting with automated market intelligence",
      icon: Globe,
      keywords: "AI-driven business strategy consulting, GPT competitive analysis, strategy development India SMEs",
      gradient: "from-purple-400 to-pink-500",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      title: "AI Risk Management & Compliance",
      description: "AI risk management consulting with real-time compliance monitoring",
      icon: Shield,
      keywords: "AI risk management consulting, GPT-based risk co-pilot, predictive risk analytics SMEs",
      gradient: "from-slate-400 to-slate-600",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600"
    },
  ];

  return (
    <div className="min-h-screen">
      <SEOHead 
        title="Orgainse Consulting - AI Project Management Service & Digital Transformation | PMaaS for Startups"
        description="AI-native consulting firm offering GPT-powered project management, digital transformation, and operational optimization for startups & SMEs in India, USA, UK, UAE, Australia. Get 25% faster delivery with AI PMaaS."
        canonical="https://orgainse.com/"
      />
      
      {/* Hero Section with Professional AI-Themed Background */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-8 sm:py-12 lg:py-16 overflow-hidden">
        {/* Mobile-Optimized Background Elements */}
        <div className="absolute inset-0">
          {/* AI Neural Network Background */}
          <div className="absolute top-10 left-5 sm:left-10 w-48 h-48 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-gradient-to-r from-orange-200 to-yellow-200 rounded-full blur-3xl opacity-20 sm:opacity-30 animate-pulse float-animation"></div>
          <div className="absolute top-20 right-5 sm:right-20 w-40 h-40 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-gradient-to-r from-green-200 to-blue-200 rounded-full blur-3xl opacity-20 sm:opacity-30 animate-pulse float-animation animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/4 w-32 h-32 sm:w-56 sm:h-56 lg:w-72 lg:h-72 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20 sm:opacity-30 animate-pulse float-animation animation-delay-500"></div>
          
          {/* VISIBLE AI ROBOTS */}
          <div className="hidden sm:block absolute top-1/4 left-1/3">
            {/* Robot 1 */}
            <div className="w-12 h-16 bg-gradient-to-b from-orange-400 to-orange-500 rounded-lg opacity-60 animate-bounce shadow-lg">
              {/* Robot Head */}
              <div className="w-8 h-8 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full mx-auto mb-1 relative">
                <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full animate-ping animation-delay-300"></div>
              </div>
              {/* Robot Body */}
              <div className="w-10 h-6 bg-gradient-to-b from-orange-400 to-orange-500 rounded-md mx-auto relative">
                <div className="absolute inset-x-3 top-1 h-0.5 bg-white rounded-full opacity-80"></div>
                <div className="absolute inset-x-3 bottom-1 h-0.5 bg-white rounded-full opacity-80"></div>
              </div>
            </div>
          </div>
          
          {/* Robot 2 */}
          <div className="hidden sm:block absolute top-3/4 right-1/4">
            <div className="w-10 h-14 bg-gradient-to-b from-green-400 to-green-500 rounded-lg opacity-60 animate-pulse shadow-lg">
              {/* Robot Head */}
              <div className="w-7 h-7 bg-gradient-to-br from-green-300 to-green-400 rounded-full mx-auto mb-1 relative">
                <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-white rounded-full animate-ping"></div>
                <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-white rounded-full animate-ping animation-delay-500"></div>
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-white rounded-full"></div>
              </div>
              {/* Robot Body */}
              <div className="w-8 h-5 bg-gradient-to-b from-green-400 to-green-500 rounded-md mx-auto relative">
                <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full animate-pulse animation-delay-200"></div>
              </div>
            </div>
          </div>
          
          {/* Robot 3 */}
          <div className="hidden lg:block absolute top-1/2 left-1/5">
            <div className="w-8 h-12 bg-gradient-to-b from-blue-400 to-blue-500 rounded-lg opacity-50 animate-bounce animation-delay-1000 shadow-lg">
              {/* Robot Head */}
              <div className="w-6 h-6 bg-gradient-to-br from-blue-300 to-blue-400 rounded-full mx-auto mb-1 relative">
                <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full animate-ping animation-delay-700"></div>
                <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full animate-ping animation-delay-900"></div>
              </div>
              {/* Robot Body */}
              <div className="w-6 h-4 bg-gradient-to-b from-blue-400 to-blue-500 rounded-md mx-auto"></div>
            </div>
          </div>
          
          {/* LARGE AI CIRCUIT PATTERNS */}
          <div className="hidden lg:block absolute bottom-1/4 left-1/3">
            <div className="relative w-20 h-20 opacity-40">
              {/* Circuit Lines */}
              <div className="absolute top-0 left-1/2 w-1 h-10 bg-gradient-to-b from-cyan-400 to-transparent rounded-full animate-pulse"></div>
              <div className="absolute bottom-0 left-1/2 w-1 h-10 bg-gradient-to-t from-orange-400 to-transparent rounded-full animate-pulse animation-delay-500"></div>
              <div className="absolute top-1/2 left-0 w-10 h-1 bg-gradient-to-r from-green-400 to-transparent rounded-full animate-pulse animation-delay-200"></div>
              <div className="absolute top-1/2 right-0 w-10 h-1 bg-gradient-to-l from-purple-400 to-transparent rounded-full animate-pulse animation-delay-700"></div>
              {/* Central Processor */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-orange-400 to-green-400 rounded-lg animate-spin-slow shadow-lg">
                <div className="absolute inset-1 bg-white rounded-lg opacity-60"></div>
                <div className="absolute inset-2 bg-gradient-to-br from-orange-500 to-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* AI DATA STREAMS */}
          <div className="hidden lg:block absolute top-1/3 right-1/3">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-1 bg-cyan-400 rounded-full animate-ping"></div>
                <div className="w-2 h-1 bg-blue-500 rounded-full animate-ping animation-delay-200"></div>
                <div className="w-4 h-1 bg-green-400 rounded-full animate-ping animation-delay-400"></div>
                <div className="w-2 h-1 bg-orange-400 rounded-full animate-ping animation-delay-600"></div>
              </div>
              <div className="flex items-center space-x-1 animation-delay-300">
                <div className="w-2 h-1 bg-purple-400 rounded-full animate-ping animation-delay-800"></div>
                <div className="w-3 h-1 bg-pink-400 rounded-full animate-ping animation-delay-1000"></div>
                <div className="w-2 h-1 bg-indigo-400 rounded-full animate-ping animation-delay-1200"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="animate-fade-in text-center lg:text-left">
              <div className="mb-4 sm:mb-6">
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight">
                  <span className="block text-slate-800">Let Us Plan</span>
                  <span className="block bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient-text text-4xl sm:text-5xl lg:text-7xl">
                    Your SUCCESS!!
                  </span>
                </h1>
              </div>
              
              <div className="relative mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl text-orange-600 font-bold mb-2 sm:mb-3">
                  AI-Native Business & Digital Transformation
                </h2>
                <div className="hidden lg:block absolute -left-4 top-0 w-2 h-full bg-gradient-to-b from-orange-500 to-green-500 rounded-full animate-pulse"></div>
              </div>
              
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-4 sm:mb-6 max-w-2xl mx-auto lg:mx-0 text-justify">
                <strong>AI-native business consulting</strong> with comprehensive digital transformation solutions for 
                <span className="text-orange-600 font-bold"> startups</span> and <span className="text-green-600 font-bold">SMEs </span>  
                across India, USA, UK, UAE, Australia, New Zealand, and South Africa.
              </p>
              
              <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 max-w-xl mx-auto lg:mx-0 text-justify">
                <strong>Comprehensive consulting services</strong> including project management, digital transformation,
                AI strategy, risk management, revenue cycle intelligence, and operational optimization for IT Services,
                Healthcare Revenue Intelligence Advisory, and SMEs across industries. Built for <strong>measurable, data-driven outcomes</strong>
                and <strong>faster delivery</strong>.
              </p>

              {/* External Links for SEO Authority */}
              <div className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6 max-w-2xl mx-auto lg:mx-0">
                Learn more about industry standards: 
                <a href="https://www.pmi.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium ml-1 mr-2">
                  PMI.org
                </a>
                |
                <a href="https://www.mckinsey.com/capabilities/operations/our-insights" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium ml-2 mr-2">
                  McKinsey Insights
                </a>
                |
                <a href="https://www.gartner.com/en/information-technology" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium ml-2">
                  Gartner Research
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 items-center">
                <button 
                  onClick={openCalendly}
                  className="group relative px-4 sm:px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden w-full sm:w-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center text-sm sm:text-base">
                    Book Free AI Consultation
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                
                {/* Share Button replacing View Success Stories */}
                <div className="w-full sm:w-auto">
                  <SocialShare 
                    url="https://orgainse.com/"
                    title="AI Business Consulting | Digital Transformation | Orgainse Consulting"
                  description="Transform your business with comprehensive consulting services delivering measurable, data-driven outcomes. AI-powered digital transformation consulting across India, USA, UK, UAE, Australia."
                  />
                </div>
              </div>

              {/* Internal Links for SEO */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Link to="/services" className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium border-b border-orange-200 hover:border-orange-400 transition-colors">
                  Our Services
                </Link>
                <span className="text-xs sm:text-sm text-slate-400">•</span>
                <Link to="/ai-assessment" className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium border-b border-green-200 hover:border-green-400 transition-colors">
                  AI Assessment
                </Link>
                <span className="text-xs sm:text-sm text-slate-400">•</span>
                <Link to="/roi-calculator" className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium border-b border-blue-200 hover:border-blue-400 transition-colors">
                  ROI Calculator
                </Link>
                <span className="text-xs sm:text-sm text-slate-400">•</span>
                <Link to="/about" className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium border-b border-purple-200 hover:border-purple-400 transition-colors">
                  About Us
                </Link>
                <span className="text-xs sm:text-sm text-slate-400">•</span>
                <Link to="/contact" className="text-xs sm:text-sm text-slate-600 hover:text-slate-700 font-medium border-b border-slate-200 hover:border-slate-400 transition-colors">
                  Contact
                </Link>
              </div>

              {/* Mobile-Optimized Stats Display */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="group relative transform hover:scale-105 transition-all duration-500 animate-fade-in"
                    style={{ animationDelay: `${index * 200 + 1000}ms` }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-xl opacity-20 group-hover:opacity-30 transition-opacity blur-sm`}></div>
                    <div className="relative bg-white/90 backdrop-blur-lg rounded-xl p-3 sm:p-4 border border-white/40 hover:border-orange-300 transition-all duration-300 shadow-lg h-20 sm:h-24 flex flex-col items-center justify-center text-center">
                      <div className={`text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent animate-counter mb-1`}>
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-xs text-slate-700 font-medium leading-tight max-w-full">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in animation-delay-500 mt-6 lg:mt-0">
              {/* Mobile-Optimized Image Container */}
              <div className="relative group">
                <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 rounded-2xl sm:rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
                <img
                  src="https://images.unsplash.com/photo-1644088379091-d574269d422f?w=800&h=600&fit=crop"
                  alt="AI Neural Network Visualization - Advanced neural network connections representing intelligent automation and cross-industry AI implementation for IT Services & Software, Healthcare Revenue Intelligence Advisory, and SMEs of all sizes"
                  className="relative rounded-xl sm:rounded-2xl w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover transform group-hover:scale-105 transition-all duration-700 shadow-2xl"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  width="800"
                  height="500"
                />
                
                {/* AI-Enhanced Floating UI Elements */}
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full p-2 sm:p-3 animate-bounce ai-robot-element">
                  <Brain className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
                
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full p-2 sm:p-3 animate-pulse ai-neural-node">
                  <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-ping animation-delay-500"></div>
                </div>
                
                <div className="hidden sm:block absolute top-1/2 -right-2 sm:-right-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full p-3 sm:p-4 transform rotate-12 animate-spin-slow ai-circuit-element">
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-pink-400 rounded-full animate-pulse animation-delay-1000"></div>
                </div>
                
                {/* AI Data Streams */}
                <div className="hidden lg:block absolute top-1/4 left-4">
                  <div className="flex flex-col space-y-1 ai-data-particle">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
                    <div className="w-6 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animation-delay-200"></div>
                    <div className="w-4 h-0.5 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animation-delay-400"></div>
                  </div>
                </div>
                
                {/* AI Circuit Connections */}
                <div className="hidden lg:block absolute bottom-1/4 right-4">
                  <div className="relative w-8 h-8 ai-neural-node">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full"></div>
                    <div className="absolute inset-1 bg-white rounded-full opacity-80"></div>
                    <div className="absolute inset-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Services Preview */}
      <section className="py-12 bg-gradient-to-br from-slate-50 via-white to-orange-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-slate-800 via-orange-600 to-green-600 bg-clip-text text-transparent">
                Our AI-Native
              </span>
              <span className="text-slate-800"> Consulting Arsenal</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto text-center">
              Transforming businesses with GPT-powered solutions across key industries.
            </p>
          </div>

          {/* Compact Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={index} className="block">
                <div 
                  className="group relative animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="relative bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 group overflow-hidden rounded-2xl flex flex-col cursor-pointer">
                    <div className={`h-1 bg-gradient-to-r ${service.gradient}`}></div>
                    
                    <CardHeader className="p-4 flex-1">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className={`p-2 ${service.iconBg} rounded-xl group-hover:scale-105 group-hover:rotate-6 transition-all duration-500 shadow-md`}>
                          <service.icon className={`h-5 w-5 ${service.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base group-hover:text-orange-600 transition-colors leading-tight">
                            {service.title}
                          </CardTitle>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors opacity-0 group-hover:opacity-100" />
                      </div>
                      <CardDescription className="text-slate-600 group-hover:text-slate-700 transition-colors leading-relaxed text-sm">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            ))}
          </div>

          {/* Compact CTA Section */}
          <div className="text-center mt-10 animate-fade-in">
            <Link 
              to="/services"
              className="group relative inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center">
                Explore Our AI Arsenal
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Revolutionary Lead Generation Hub */}
      <section className="py-12 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-80 h-80 bg-gradient-to-r from-orange-200 to-yellow-200 rounded-full blur-3xl opacity-20 animate-pulse float-animation"></div>
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-gradient-to-r from-green-200 to-blue-200 rounded-full blur-3xl opacity-20 animate-pulse float-animation animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/3 w-4 h-12 bg-yellow-300 rounded-full animate-pulse opacity-30"></div>
          <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-orange-300 rotate-45 animate-spin-slow opacity-30"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Section */}
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="text-slate-800">Accelerate Your </span>
              <span className="bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 bg-clip-text text-transparent animate-gradient-text">
                AI Transformation
              </span>
            </h2>
            <p className="text-lg text-slate-700 max-w-3xl mx-auto mb-6 leading-relaxed text-justify">
              Get exclusive insights, free resources, and expert guidance to transform your business with 
              <span className="text-orange-600 font-bold"> AI-native solutions</span>. Join us to accelerate and write your own success story.
            </p>
          </div>

          {/* Lead Generation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            
            {/* Newsletter Subscription Card */}
            <div className="group relative animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 overflow-hidden rounded-2xl flex flex-col">
                <div className="h-1 bg-gradient-to-r from-orange-400 to-yellow-500"></div>
                <CardHeader className="p-5 flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-orange-100 rounded-lg group-hover:scale-105 group-hover:rotate-6 transition-all duration-500 shadow-md">
                      <Mail className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base text-slate-800 group-hover:text-orange-600 transition-colors leading-tight">
                        AI Strategy Newsletter
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-slate-700 group-hover:text-slate-800 transition-colors leading-relaxed mb-4 text-sm">
                    Weekly insights on AI project management, digital transformation trends, and exclusive case studies.
                  </CardDescription>
                  
                  {/* Newsletter Form */}
                  <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                    <Input 
                      data-testid="newsletter-email-input"
                      type="email" 
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500 focus:border-orange-400 focus:ring-orange-400 h-10"
                      required
                      disabled={isNewsletterLoading}
                    />
                    <button 
                      data-testid="newsletter-submit-btn"
                      type="submit"
                      disabled={isNewsletterLoading || !newsletterEmail.trim()}
                      className="w-full group relative px-4 py-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10 flex items-center justify-center">
                        {isNewsletterLoading ? "Subscribing..." : "Get Free AI Insights"}
                        {!isNewsletterLoading && <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />}
                      </span>
                    </button>
                    
                    {/* Status Messages */}
                    {newsletterStatus === "success" && (
                      <p data-testid="newsletter-status-success" className="text-green-600 text-xs text-center font-medium">
                        🎉 Welcome! Check your email for resources.
                      </p>
                    )}
                    {newsletterStatus === "duplicate" && (
                      <p data-testid="newsletter-status-duplicate" className="text-yellow-600 text-xs text-center font-medium">
                        📧 Already subscribed! Check your email.
                      </p>
                    )}
                    {newsletterStatus === "error" && (
                      <p data-testid="newsletter-status-error" className="text-red-500 text-xs text-center font-medium">
                        ❌ Something went wrong. Try again.
                      </p>
                    )}
                    
                    <p className="text-xs text-slate-600 text-center">
                      🎁 Free "AI Transformation Checklist" (worth {getRegionalPrice(297)})
                    </p>
                  </form>
                </CardHeader>
              </Card>
            </div>

            {/* Free AI Assessment Card */}
            <div className="group relative animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="absolute -inset-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 overflow-hidden rounded-2xl flex flex-col">
                <div className="h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
                <CardHeader className="p-5 flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:scale-105 group-hover:rotate-6 transition-all duration-500 shadow-md">
                      <Brain className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base text-slate-800 group-hover:text-green-600 transition-colors leading-tight">
                        Free AI Readiness Assessment
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-slate-700 group-hover:text-slate-800 transition-colors leading-relaxed mb-4 text-sm">
                    Discover your company's AI maturity score and get a personalized roadmap for digital transformation in just 5 minutes.
                  </CardDescription>
                  
                  <button 
                    onClick={() => window.location.href = '/ai-assessment'}
                    className="w-full group relative px-4 py-2.5 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 overflow-hidden mb-3 text-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center">
                      Start Free Assessment
                      <Target className="ml-2 h-3 w-3 group-hover:rotate-180 transition-transform duration-500" />
                    </span>
                  </button>
                  
                  <div className="flex items-center justify-center space-x-4 text-xs text-slate-600">
                    <span className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-green-500" /> No signup required</span>
                    <span className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-green-500" /> Instant results</span>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* ROI Calculator Card */}
            <div className="group relative animate-fade-in" style={{ animationDelay: '600ms' }}>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 overflow-hidden rounded-2xl flex flex-col">
                <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-500"></div>
                <CardHeader className="p-5 flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:scale-105 group-hover:rotate-6 transition-all duration-500 shadow-md">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base text-slate-800 group-hover:text-purple-600 transition-colors leading-tight">
                        ROI Calculator
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-slate-700 group-hover:text-slate-800 transition-colors leading-relaxed mb-4 text-sm">
                    Calculate your potential return on investment with region-specific pricing and see your transformation savings.
                  </CardDescription>
                  
                  <button 
                    onClick={() => window.location.href = '/roi-calculator'}
                    className="w-full group relative px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 overflow-hidden mb-3 text-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center">
                      Calculate ROI
                      <TrendingUp className="ml-2 h-3 w-3 group-hover:scale-110 transition-transform duration-500" />
                    </span>
                  </button>
                  
                  <div className="flex items-center justify-center space-x-4 text-xs text-slate-600">
                    <span className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-purple-500" /> Regional pricing</span>
                    <span className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-purple-500" /> PPP adjusted</span>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Smart Calendar Section */}
          <div className="text-center animate-fade-in mb-10" style={{ animationDelay: '800ms' }}>
            <div className="group relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-green-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden rounded-2xl">
                <div className="h-1 bg-gradient-to-r from-orange-400 to-green-500"></div>
                <CardHeader className="p-8">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-orange-100 to-green-100 rounded-xl">
                      <Calendar className="h-6 w-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-xl text-slate-800">
                      Ready for Your Free Strategy Session?
                    </CardTitle>
                  </div>
                  <CardDescription className="text-slate-700 mb-6 max-w-2xl mx-auto">
                    Book a personalized 30-minute consultation with our AI transformation experts. 
                    Discuss your specific challenges and get a custom roadmap for success.
                  </CardDescription>
                  
                  <button 
                    onClick={openCalendly}
                    className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden w-full sm:w-auto"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center text-sm sm:text-base">
                      Book Free Consultation
                      <Calendar className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                    </span>
                  </button>
                  
                  <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-slate-600">
                    <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-1 text-green-500" /> 30-minute session</span>
                    <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-1 text-green-500" /> Global timezones</span>
                    <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-1 text-green-500" /> No commitment</span>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Compact Resources Section */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '800ms' }}>
            <div className="text-center animate-fade-in mb-6" style={{ animationDelay: '750ms' }}>
              <RegionSelector />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-800 mb-6">
              <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                Free Resources
              </span>
              <span className="text-slate-800"> to Accelerate Growth</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6">
              {[
                {
                  title: "AI Implementation Guide",
                  description: "Step-by-step roadmap for AI adoption",
                  baseValue: resourceBasePrices.aiGuide,
                  icon: Target,
                  gradient: "from-orange-400 to-yellow-500"
                },
                {
                  title: "ROI Calculator Template",
                  description: "Calculate AI project ROI instantly",
                  baseValue: resourceBasePrices.roiTemplate,
                  icon: TrendingUp,
                  gradient: "from-green-400 to-blue-500"
                },
                {
                  title: "Digital Transformation Checklist",
                  description: "25-point transformation checklist",
                  baseValue: resourceBasePrices.checklist,
                  icon: CheckCircle,
                  gradient: "from-purple-400 to-pink-500"
                }
              ].map((resource, index) => (
                <div key={index} className="group relative">
                  <div className={`absolute -inset-1 bg-gradient-to-r ${resource.gradient} rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500`}></div>
                  <div className="relative bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-white/40 hover:border-orange-300 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <resource.icon className="h-5 w-5 text-slate-700" />
                      <Badge className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-bold text-xs">
                        Worth {getRegionalPrice(resource.baseValue)}
                      </Badge>
                    </div>
                    <h4 className="text-slate-800 font-semibold mb-1 text-sm">{resource.title}</h4>
                    <p className="text-slate-600 text-xs">{resource.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-slate-700 text-base">
              Join our newsletter and get instant access to all resources - 
              <span className="text-orange-600 font-bold"> FREE ({getRegionalPrice(totalValue)} value)</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
