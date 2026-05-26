import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  Brain,
  CheckCircle,
  Globe,
  Minus,
  Plus,
  Shield,
  Target,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { api } from "../lib/api";
import ServicePopup from "../components/ServicePopup";
import SocialShare from "../components/SocialShare";
import SEOLinks from "../components/SEOLinks";
import SEOContent from "../components/SEOContent";
import SEOHead from "../components/SEOHead";
import { useCalendly } from "../context/CalendlyContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const { openCalendly } = useCalendly();

  // Backend URL for API calls
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  const services = [
    {
      id: 'ai-project-management',
      title: "AI Project Management Service (PMaaS)",
      description: "Comprehensive AI project management service with GPT-powered SOW auto-generation, intelligent project planning, and automated risk assessment for startups and SMEs across India, USA, UK, UAE, Australia, New Zealand, and South Africa.",
      features: ["GPT-powered Project Planning & SOW Auto-generation", "Automated Risk Assessment & Scenario Modeling", "AI Resource Allocation & Timeline Optimization", "Intelligent Performance Analytics & Reporting"],
      icon: Target,
      image: "https://images.pexels.com/photos/16053029/pexels-photo-16053029.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1",
      keywords: "AI project management service, PMaaS for startups, GPT-powered project planning",
      gradient: "from-orange-400 to-red-500",
      detailedInfo: {
        whatItDoes: "Our AI Project Management Service (PMaaS) revolutionizes how you manage projects by leveraging GPT-powered automation. We create intelligent SOWs, automate risk assessments, optimize resource allocation, and provide real-time analytics that increase project success rates by 45%.",
        whyChooseUs: "Unlike traditional project management, our AI-native approach reduces planning time by 60%, eliminates scope creep through intelligent boundary detection, and provides predictive insights that prevent 80% of common project failures before they occur.",
        whatYouGet: "Complete AI-powered project ecosystem including automated project planning, intelligent resource allocation, real-time risk monitoring, GPT-generated documentation, predictive analytics dashboard, and 24/7 AI project assistant.",
        benefits: ["60% reduction in project planning time", "45% increase in project success rates", "80% reduction in scope creep", "Real-time predictive insights", "Automated documentation generation", "24/7 AI project support"],
        industries: ["IT Services & Software", "Healthcare Revenue Intelligence Advisory", "Industry-Agnostic SMEs & Startups"]
      },
      productLink: {
        href: "/products",
        label: "Powered by ORQYNE",
        tagline: "Upload a spreadsheet → 20+ RAG-grounded AI agents running on your data in 90 seconds. See the product →"
      }
    },
    {
      id: 'digital-transformation',
      title: "AI-Native Digital Transformation",
      description: "Complete digital transformation consulting with AI maturity assessment, multi-agent orchestration platforms, and a GPT implementation roadmap — industry-agnostic for SMEs &amp; startups, with deep specialization in IT Services and Healthcare Revenue Intelligence Advisory.",
      features: ["AI Maturity Assessment & Digital Readiness Audit", "Multi-agent Orchestration Platform Setup", "GPT Implementation Roadmap & Integration", "Cloud-First Architecture with AI-Powered Analytics"],
      icon: Zap,
      image: "https://images.unsplash.com/photo-1530825894095-9c184b068fcb?crop=entropy&cs=srgb&fm=webp&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHw0fHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb258ZW58MHx8fGJsdWV8MTc1NDU4ODMwN3ww&ixlib=rb-4.1.0&q=75&w=400&h=300",
      keywords: "AI-native digital transformation, GPT implementation roadmap, digital transformation UAE SMEs",
      gradient: "from-yellow-400 to-orange-500",
      detailedInfo: {
        whatItDoes: "Transform your entire business operations with our AI-native digital transformation service. We conduct comprehensive AI maturity assessments, design multi-agent orchestration platforms, and create custom GPT implementation roadmaps that digitize and optimize every aspect of your business.",
        whyChooseUs: "Our transformations are 70% faster than traditional approaches because we use AI to design, implement, and optimize simultaneously. We don't just digitize - we intelligentize your operations with AI agents that continuously improve your processes.",
        whatYouGet: "Complete digital ecosystem transformation including AI maturity assessment, custom multi-agent platform, GPT integration roadmap, cloud-first architecture, AI-powered analytics suite, and ongoing optimization support.",
        benefits: ["70% faster transformation timeline", "50% reduction in operational costs", "300% improvement in process efficiency", "AI-powered continuous optimization", "Future-ready scalable architecture", "Real-time business intelligence"],
        industries: ["IT Services & Software", "Healthcare Revenue Intelligence Advisory", "Industry-Agnostic SMEs & Startups"]
      }
    },
    {
      id: 'operational-optimization',
      title: "AI Operational Optimization", 
      description: "Intelligent operational optimization using AI-driven workflow automation, predictive maintenance agents, and GPT process mining to reduce OPEX — for SMEs across IT Services, Healthcare Revenue Intelligence Advisory, and industry-agnostic engagements.",
      features: ["AI Workflow Automation & Process Intelligence", "Predictive Maintenance AI Agent & Monitoring", "GPT Process Mining & Bottleneck Detection", "Real-time Performance Analytics & Cost Optimization"],
      icon: TrendingUp,
      image: "https://images.pexels.com/photos/8728559/pexels-photo-8728559.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1",
      keywords: "AI operational optimization consulting, reduce OPEX with AI, GPT process mining",
      gradient: "from-green-400 to-emerald-500",
      detailedInfo: {
        whatItDoes: "Optimize your operations with AI agents that continuously monitor, analyze, and improve your business processes. Our system uses GPT-powered process mining to identify bottlenecks, implements predictive maintenance, and automates workflows to reduce operational expenses by up to 35%.",
        whyChooseUs: "Our AI optimization is proactive, not reactive. While others optimize after problems occur, our AI agents predict and prevent operational issues, resulting in 90% fewer disruptions and continuous cost savings that compound over time.",
        whatYouGet: "Comprehensive operational intelligence platform with AI workflow automation, predictive maintenance system, GPT process mining tools, real-time analytics dashboard, automated cost optimization, and performance monitoring suite.",
        benefits: ["35% reduction in operational costs", "90% fewer operational disruptions", "Automated process optimization", "Predictive maintenance alerts", "Real-time performance insights", "Continuous improvement automation"],
        industries: ["IT Services & Software", "Healthcare Revenue Intelligence Advisory", "Industry-Agnostic SMEs & Startups"]
      }
    },
    {
      id: 'revenue-cycle-management',
      title: "Healthcare Revenue Intelligence Advisory",
      description: "AI-powered strategy, analytics, and governance advisory for US healthcare organizations that need a clearer view of revenue performance — working alongside your existing operational teams and vendor relationships, not in place of them.",
      features: ["Revenue Performance Assessment", "Denial Intelligence & Trend Analysis", "Payer Behavior & Contract Advisory", "Revenue Cycle Governance & Process Advisory", "AI Readiness & Transformation Advisory"],
      icon: Shield,
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&h=300",
      keywords: "healthcare revenue cycle management consulting, RCM advisory, AI revenue intelligence US healthcare, denial intelligence, payer behavior analytics",
      gradient: "from-blue-400 to-indigo-500",
      detailedInfo: {
        whatItDoes: "Healthcare revenue performance depends on more than billing accuracy — it depends on visibility. Our Healthcare Revenue Intelligence Advisory delivers that visibility through strategic consulting, AI-powered analytics, and governance frameworks. We provide independent, unbiased insight into where revenue is being lost, how denial patterns are shifting, and how payer behavior is affecting financial outcomes — working alongside your existing RCM operations.",
        whyChooseUs: "Independence is the trust signal. We are not a billing or coding vendor — we are an advisory layer that helps CFOs, COOs, and VPs of Revenue Cycle interpret performance with disciplined, AI-driven analytics typically reserved for large health systems. First leadership deliverable within 30 days, with no system access or patient data required.",
        whatYouGet: "Executive-ready deliverables across six advisory areas: revenue performance assessment, denial intelligence, payer & contract advisory, governance & process advisory, AI readiness assessment, and vendor oversight & accountability advisory. Each engagement is available standalone or as part of a broader programme. Conservative financial guidance (e.g., '3% or more' uplift potential, never guaranteed).",
        benefits: [
          "Independent, unbiased visibility into revenue leakage",
          "AI-powered denial trend analytics and reduction strategy",
          "Strategic payer behavior and contract performance insight",
          "Executive dashboard design and KPI framework",
          "AI readiness assessment and transformation roadmap",
          "Vendor oversight, accountability, and transition advisory"
        ],
        notIncluded: [
          "Medical billing or claims submission",
          "Medical coding or clinical documentation",
          "AR follow-up or collections",
          "Denial follow-up or appeal submission",
          "Payment posting or remittance processing",
          "Patient billing or collections",
          "Offshore or onshore RCM staffing",
          "Outsourced revenue cycle operations of any kind"
        ],
        whoWeServe: [
          "Physician groups and multi-specialty practices",
          "Regional hospital systems and health networks",
          "Healthcare startups and MedTech companies",
          "Value-based care and risk-bearing organizations",
          "Ambulatory Surgical Centers (ASCs) and Clinical Laboratories",
          "Independent Practice Associations (IPAs) and ACOs",
          "Health plans with provider analytics requirements"
        ],
        industries: ["Healthcare Revenue Intelligence Advisory", "US Hospital Systems", "Physician Groups", "ASCs & Laboratories", "Value-Based Care Organizations", "Health Plans"]
      }
    },
    {
      id: 'business-strategy',
      title: "AI-Driven Business Strategy Development",
      description: "Advanced business strategy development using automated market intelligence GPT, competitive analysis AI, and scenario planning tools — industry-agnostic for SMEs and startups, with deep specialization in IT Services and Healthcare Revenue Intelligence Advisory.",
      features: ["Automated Market Intelligence & Competitor Analysis", "AI-Powered Competitive Strategy & Positioning", "Scenario Planning Tools & Market Forecasting", "Growth Strategy Optimization & ROI Modeling"],
      icon: Globe,
      image: "https://images.unsplash.com/photo-1573164574230-db1d5e960238?crop=entropy&cs=srgb&fm=webp&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxjb25zdWx0aW5nfGVufDB8fHxibHVlfDE3NTQ1ODg0NDR8MA&ixlib=rb-4.1.0&q=75&w=400&h=300",
      keywords: "AI-driven business strategy consulting, GPT competitive analysis, strategy development India SMEs",
      gradient: "from-purple-400 to-pink-500",
      detailedInfo: {
        whatItDoes: "Develop winning business strategies using AI-powered market intelligence, competitive analysis, and scenario planning. Our GPT-driven approach analyzes thousands of data points to create strategies that are 85% more likely to succeed than traditional consulting approaches.",
        whyChooseUs: "While traditional strategy consulting takes months and relies on historical data, our AI-driven approach delivers real-time insights and predictive strategies in weeks. We analyze 1000x more data points to identify opportunities others miss.",
        whatYouGet: "Comprehensive strategy development suite including automated market intelligence system, AI competitive analysis platform, scenario planning tools, growth optimization roadmap, ROI modeling dashboard, and strategic implementation support.",
        benefits: ["85% higher strategy success rate", "75% faster strategy development", "Real-time market intelligence", "Predictive opportunity identification", "Data-driven decision making", "Continuous strategy optimization"],
        industries: ["IT Services & Software", "Healthcare Revenue Intelligence Advisory", "Industry-Agnostic SMEs & Startups"]
      }
    },
    {
      id: 'risk-management',
      title: "AI Risk Management & Compliance",
      description: "Comprehensive AI risk management with GPT-based risk co-pilots, automated scenario modeling, and real-time compliance monitoring — industry-agnostic for SMEs and startups, with deep specialization in IT Services and Healthcare Revenue Intelligence Advisory.",
      features: ["GPT-Based Risk Assessment & Co-pilot Support", "Automated Scenario Modeling & Stress Testing", "Real-time Compliance Monitoring & Reporting", "Predictive Risk Analytics & Mitigation Planning"],
      icon: Shield,
      image: "https://images.unsplash.com/photo-1497409988347-cbfaac2f0b12?crop=entropy&cs=srgb&fm=webp&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxhZ2lsZSUyMHNjcnVtfGVufDB8fHxibHVlfDE3NTQ1ODg0Mzl8MA&ixlib=rb-4.1.0&q=75&w=400&h=300",
      keywords: "AI risk management consulting, GPT-based risk co-pilot, predictive risk analytics SMEs",
      gradient: "from-slate-400 to-slate-600",
      detailedInfo: {
        whatItDoes: "Protect your business with AI-powered risk management that predicts, prevents, and mitigates risks before they impact your operations. Our GPT-based risk co-pilot continuously monitors your business environment and provides real-time risk assessment and compliance monitoring.",
        whyChooseUs: "Traditional risk management is reactive and manual. Our AI approach is predictive and automated, identifying 95% of potential risks before they materialize and ensuring continuous compliance with changing regulations across multiple jurisdictions.",
        whatYouGet: "Complete risk intelligence platform including GPT-based risk co-pilot, automated scenario modeling system, real-time compliance monitoring dashboard, predictive risk analytics, automated reporting suite, and mitigation planning tools.",
        benefits: ["95% early risk detection rate", "80% reduction in compliance violations", "Real-time regulatory updates", "Automated risk reporting", "Predictive risk modeling", "24/7 compliance monitoring"],
        industries: ["IT Services & Software", "Healthcare Revenue Intelligence Advisory", "Industry-Agnostic SMEs & Startups"]
      }
    },
  ];

  // Enhanced scroll management for popup
  const [scrollPosition, setScrollPosition] = useState(0);

  const openServicePopup = (service) => {
    console.log('Opening popup for service:', service.title, 'ID:', service.id); // Debug log
    setSelectedService(service);
    setIsPopupOpen(true);
    setShowContactForm(false);
    setIsSubmitted(false);
    // No scroll lock - let page scroll naturally and popup moves with it
  };

  const closeServicePopup = () => {
    setIsPopupOpen(false);
    setSelectedService(null);
    setShowContactForm(false);
    setIsSubmitted(false);
    setFormData({ name: '', email: '', phone: '', company: '', message: '' });
    // No scroll restoration needed
  };

  const handleContactFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.contact({
        leadType: 'Service Inquiry',
        service_name: selectedService?.title || 'Unknown Service',
        name: formData.name || '',
        email: formData.email || '',
        company: formData.company || '',
        phone: formData.phone || '',
        message: formData.message || `Interested in ${selectedService?.title || 'a service'}`,
        source: window.location.origin + '/services',
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting service inquiry:', error);
      toast.error(error.message || 'Error submitting inquiry. Please try again.');
    }
  };

  // Service-specific inquiry tracking (popup CTA)
  const handleServiceInquiry = async (serviceId, serviceName) => {
    try {
      await api.contact({
        leadType: 'Service Inquiry',
        service_name: serviceName,
        name: 'Service Interest',
        email: '',
        company: '',
        phone: '',
        message: `Interested in ${serviceName} service`,
        source: window.location.origin + '/services-popup',
      });
    } catch (error) {
      console.error('Error tracking service inquiry:', error);
    } finally {
      window.location.href = `/smart-calendar?service=${encodeURIComponent(serviceName)}`;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Revolutionary Hero Section with SEO */}
      <section className="relative bg-gradient-to-br from-slate-50 via-orange-50 to-green-50 py-12 lg:py-16 overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 opacity-30">
          {/* AI Neural Network Backgrounds */}
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-orange-200 to-yellow-200 rounded-full blur-3xl animate-pulse float-animation will-change-transform"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-green-200 to-blue-200 rounded-full blur-3xl animate-pulse float-animation animation-delay-2000 will-change-transform"></div>
          
          {/* LARGE VISIBLE AI ROBOTS */}
          <div className="absolute top-1/4 left-1/3">
            {/* Advanced AI Robot */}
            <div className="w-16 h-20 bg-gradient-to-b from-yellow-300 to-orange-400 rounded-lg opacity-70 animate-bounce shadow-xl">
              {/* Robot Head */}
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full mx-auto mb-2 relative border-2 border-orange-400">
                <div className="absolute top-3 left-3 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                <div className="absolute top-3 right-3 w-2 h-2 bg-blue-400 rounded-full animate-ping animation-delay-500"></div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-gray-600 rounded-full"></div>
                {/* Antenna */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-orange-400 rounded-full"></div>
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              </div>
              {/* Robot Body */}
              <div className="w-14 h-6 bg-gradient-to-b from-orange-300 to-orange-400 rounded-md mx-auto relative border-2 border-orange-500">
                <div className="absolute top-1 left-2 w-2 h-1 bg-white rounded-full opacity-80"></div>
                <div className="absolute top-1 right-2 w-2 h-1 bg-white rounded-full opacity-80"></div>
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* AI Processing Hub */}
          <div className="absolute bottom-1/4 right-1/3">
            <div className="w-14 h-14 bg-gradient-to-br from-green-300 to-green-500 rotate-45 animate-spin-slow opacity-60 rounded-lg shadow-xl">
              <div className="absolute inset-2 bg-white rounded-lg opacity-80"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full animate-pulse"></div>
              {/* Circuit connections */}
              <div className="absolute -top-2 left-1/2 w-1 h-4 bg-green-400"></div>
              <div className="absolute -bottom-2 left-1/2 w-1 h-4 bg-green-400"></div>
              <div className="absolute -left-2 top-1/2 w-4 h-1 bg-green-400"></div>
              <div className="absolute -right-2 top-1/2 w-4 h-1 bg-green-400"></div>
            </div>
          </div>
          
          {/* AI Data Network */}
          <div className="absolute top-3/4 left-1/4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-80"></div>
              <div className="w-6 h-1 bg-gradient-to-r from-blue-400 to-green-400 animate-pulse"></div>
              <div className="w-4 h-4 bg-green-400 rounded-full animate-ping animation-delay-500 opacity-80"></div>
              <div className="w-6 h-1 bg-gradient-to-r from-green-400 to-orange-400 animate-pulse animation-delay-300"></div>
              <div className="w-4 h-4 bg-orange-400 rounded-full animate-ping animation-delay-1000 opacity-80"></div>
            </div>
          </div>
          
          {/* Mini Robot Swarm */}
          <div className="absolute top-1/2 right-1/4">
            <div className="grid grid-cols-2 gap-2">
              <div className="w-6 h-8 bg-gradient-to-b from-purple-300 to-purple-400 rounded opacity-60 animate-bounce">
                <div className="w-4 h-4 bg-purple-200 rounded-full mx-auto mb-1 relative">
                  <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full animate-ping"></div>
                  <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full animate-ping"></div>
                </div>
              </div>
              <div className="w-6 h-8 bg-gradient-to-b from-pink-300 to-pink-400 rounded opacity-60 animate-bounce animation-delay-300">
                <div className="w-4 h-4 bg-pink-200 rounded-full mx-auto mb-1 relative">
                  <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full animate-ping animation-delay-200"></div>
                  <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full animate-ping animation-delay-400"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-in">
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-slate-800">AI-Native </span>
            <span className="bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 bg-clip-text text-transparent animate-gradient-text">
              Consulting
            </span>
            <br />
            <span className="text-slate-800">Arsenal</span>
          </h1>
          
          <h2 className="text-2xl lg:text-3xl text-orange-600 font-bold mb-6">
            GPT-Powered Solutions for Digital Transformation & Project Management
          </h2>
          
          <p className="text-xl text-slate-700 max-w-4xl mx-auto mb-8 leading-relaxed">
            Comprehensive <span className="text-orange-600 font-bold">AI-native consulting services</span> designed to transform your business
            with <span className="text-green-600 font-bold">GPT-powered project management</span>, intelligent automation, and
            <span className="text-purple-600 font-bold"> AI-driven strategy</span> — industry-agnostic for SMEs &amp; startups, with deep specialization in IT Services and Healthcare Revenue Intelligence Advisory.
          </p>
          
          <div className="flex justify-center flex-wrap gap-4 mb-12">
            {[
              { name: "IT Services & Software", color: "from-orange-400 to-red-500" },
              { name: "Healthcare Revenue Intelligence Advisory", color: "from-purple-400 to-pink-500" },
              { name: "Industry-Agnostic for SMEs & Startups", color: "from-indigo-400 to-purple-500" },
            ].map((industry, index) => (
              <div 
                key={index}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${industry.color} rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity blur-sm`}></div>
                <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl px-4 py-2 border border-orange-200 hover:border-orange-400 transition-all duration-300 transform hover:scale-105 shadow-sm">
                  <span className="text-slate-700 font-medium text-sm">{industry.name}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Animated Divider */}
          <div className="flex justify-center">
            <div className="w-40 h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Modern Services Grid Layout */}
      <section className="py-16 bg-gradient-to-br from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-slate-800">Our </span>
              <span className="bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                AI-Powered Services
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive AI solutions designed to transform your business operations, optimize processes, and accelerate sustainable growth
            </p>
          </div>

          {/* Responsive Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service, index) => (
              <div 
                key={service.id || index} 
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Service Card - Responsive */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 h-full flex flex-col">
                  
                  {/* Card Header - Responsive */}
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
                    <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-r ${service.gradient} shadow-md self-start`}>
                      <service.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">
                      {service.title}
                    </h3>
                  </div>

                  {/* Service Description */}
                  <p className="text-slate-600 leading-relaxed mb-4 sm:mb-6 flex-1 text-sm sm:text-base">
                    {service.description}
                  </p>

                  {/* Key Features */}
                  <div className="space-y-2 mb-4 sm:mb-6">
                    {service.features.slice(0, 3).map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-2">
                        <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-slate-600 leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Learn More Button - Responsive */}
                  <button 
                    onClick={() => openServicePopup(service)}
                    className={`w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r ${service.gradient} text-white font-semibold rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base`}
                  >
                    <span className="flex items-center justify-center">
                      Learn More
                      <ArrowRight className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Import and use the new ServicePopup component */}
          <ServicePopup
            isOpen={isPopupOpen}
            service={selectedService}
            showContactForm={showContactForm}
            setShowContactForm={setShowContactForm}
            isSubmitted={isSubmitted}
            formData={formData}
            setFormData={setFormData}
            onClose={closeServicePopup}
            onSubmit={handleContactFormSubmit}
            openCalendly={openCalendly}
          />
        </div>

        {/* Creative Section Separator */}
        <div className="mt-20 mb-16">
          <div className="max-w-6xl mx-auto">
            {/* AI-Themed Compact Separator */}
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center space-x-2">
                {/* AI Circuit Pattern */}
                <div className="w-4 h-0.5 bg-gradient-to-r from-orange-400 to-orange-500"></div>
                <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-0.5 bg-gradient-to-r from-orange-500 to-green-500"></div>
                
                {/* AI Brain Icon */}
                <div className="relative">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-green-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-gradient-to-br from-orange-400 to-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                
                {/* AI Circuit Pattern */}
                <div className="w-2 h-0.5 bg-gradient-to-r from-green-500 to-orange-500"></div>
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse animation-delay-500"></div>
                <div className="w-4 h-0.5 bg-gradient-to-r from-green-500 to-green-400"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Comprehensive FAQ Section for SEO */}
        <section className="py-20 bg-gradient-to-br from-slate-50 to-orange-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Get answers to common questions about our AI consulting services, pricing, and implementation process
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  category: "AI Consulting Services",
                  questions: [
                    {
                      question: "What is AI-native consulting and how does it differ from traditional consulting?",
                      answer: "AI-native consulting integrates artificial intelligence tools and methodologies from the ground up to enhance business strategies, optimize processes, and drive innovation. Unlike traditional consulting that relies primarily on human analysis, AI-native consulting leverages machine learning, predictive analytics, and automation to deliver faster, more accurate insights and solutions with measurable ROI."
                    },
                    {
                      question: "Which industries benefit most from AI consulting services?",
                      answer: "Our AI consulting is industry-agnostic — designed to scale with SMEs and startups across any sector. We have particularly deep specialization in IT Services & Software and Healthcare Revenue Intelligence Advisory, where data-rich, process-intensive operations consistently see the strongest results from AI-driven optimization."
                    },
                    {
                      question: "How do I know if my business is ready for AI transformation?",
                      answer: "Your business is ready for AI transformation if you have: consistent data collection processes, manual tasks that consume significant time, need for faster decision-making, scaling challenges, or desire to improve customer experience. Our free AI Assessment tool can evaluate your readiness and provide a custom roadmap."
                    }
                  ]
                },
                {
                  category: "Implementation & Timeline",
                  questions: [
                    {
                      question: "How long does a typical AI implementation project take?",
                      answer: "Implementation timelines vary based on project scope: Simple automation (2-4 weeks), Process optimization (1-3 months), Complete digital transformation (3-12 months). Our PMaaS approach ensures projects stay on schedule with weekly progress updates and milestone-based delivery."
                    },
                    {
                      question: "What is PMaaS (Project Management as a Service) and why do you use it?",
                      answer: "PMaaS is our dedicated project management service that provides expert project managers, proven methodologies, and advanced tools to ensure successful AI implementation. It eliminates the need to hire internal PM resources and guarantees projects are delivered on time, within budget, and with full accountability."
                    },
                    {
                      question: "How do you ensure smooth integration with our existing systems?",
                      answer: "We conduct comprehensive system audits, use API-based integrations, implement gradual rollouts, and provide extensive testing before full deployment. Our team has experience with 200+ software platforms and ensures zero disruption to your current operations during the transition."
                    }
                  ]
                },
                {
                  category: "Healthcare Revenue Intelligence Advisory",
                  questions: [
                    {
                      question: "What is Healthcare Revenue Intelligence Advisory?",
                      answer: "Healthcare Revenue Intelligence Advisory is our AI-powered advisory service for US healthcare organizations. We deliver strategic consulting, AI-driven analytics, and governance frameworks that provide independent visibility into revenue performance — working alongside your existing RCM operations rather than replacing them. It is advisory and analytics only; we do not provide billing, coding, AR follow-up, claims processing, or operational delivery of any kind."
                    },
                    {
                      question: "Who is the right fit for Orgainse's RCM Advisory?",
                      answer: "The right fit is US healthcare organizations that already have revenue cycle operations in place — internally managed or via a third-party vendor — and need an independent, AI-powered view of what those operations are delivering. This includes physician groups, multi-specialty practices, regional hospital systems, ASCs, clinical laboratories, IPAs, ACOs, value-based-care organizations, healthcare startups, MedTech companies, and health plans with provider analytics needs."
                    },
                    {
                      question: "What is explicitly not included in this service?",
                      answer: "We are not an outsourced operations vendor. We do not provide: medical billing or claims submission, medical coding or clinical documentation, AR follow-up or collections, denial follow-up or appeal submission operations, payment posting or remittance processing, patient billing or collections, or any onshore/offshore RCM staffing. Our scope is strictly advisory, analytics, and governance."
                    },
                    {
                      question: "How quickly do you deliver insights?",
                      answer: "Engagements are structured for speed and minimal internal burden. The first leadership deliverable lands within 30 days. No system access or patient data is required for the initial assessment."
                    }
                  ]
                },
                {
                  category: "Pricing & ROI",
                  questions: [
                    {
                      question: "How do you calculate ROI for AI consulting projects?",
                      answer: "Our ROI calculation considers multiple factors: cost savings from automation, revenue increases from improved processes, time savings for employees, reduced error rates, and enhanced customer satisfaction. Most clients see 200-500% ROI within 12 months, with payback periods typically ranging from 3-9 months."
                    },
                    {
                      question: "What factors influence the pricing of AI consulting services?",
                      answer: "Pricing depends on: project complexity and scope, required technology integrations, implementation timeline, ongoing support needs, and team size. We offer flexible pricing models including fixed-price projects, monthly retainers, and performance-based pricing aligned with your budget and goals."
                    },
                    {
                      question: "Do you offer guarantees on project outcomes?",
                      answer: "Yes, we provide performance guarantees based on agreed KPIs and success metrics. If we don't achieve the promised results within the specified timeframe, we continue working at no additional cost until targets are met or provide a full refund. This reflects our confidence in delivering measurable value."
                    }
                  ]
                },
                {
                  category: "Support & Maintenance",
                  questions: [
                    {
                      question: "What kind of ongoing support do you provide after implementation?",
                      answer: "We provide comprehensive post-implementation support including: 24/7 technical monitoring, monthly performance reviews, continuous optimization, staff training sessions, priority support tickets, and regular updates to keep your AI systems current with the latest technologies."
                    },
                    {
                      question: "How do you handle data security and compliance?",
                      answer: "We maintain enterprise-grade security with SOC 2 compliance, GDPR adherence, encrypted data transmission, regular security audits, and strict access controls. Your data never leaves your infrastructure during analysis, and we provide detailed compliance reporting for regulated industries."
                    },
                    {
                      question: "Can you scale the AI solutions as our business grows?",
                      answer: "Absolutely. Our AI solutions are designed with scalability in mind, using cloud-native architectures and modular components. We provide capacity planning, performance monitoring, and automatic scaling capabilities to ensure your AI systems grow seamlessly with your business needs."
                    }
                  ]
                }
              ].map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-green-500 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">{categoryIndex + 1}</span>
                    </div>
                    {category.category}
                  </h3>
                  
                  {category.questions.map((faq, faqIndex) => (
                    <div key={faqIndex} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                      <details className="group">
                        <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50 transition-colors">
                          <h4 className="text-lg font-semibold text-slate-900 pr-4">
                            {faq.question}
                          </h4>
                          <div className="flex-shrink-0">
                            <Plus className="h-5 w-5 text-orange-600 group-open:hidden transition-transform" />
                            <Minus className="h-5 w-5 text-orange-600 hidden group-open:block transition-transform" />
                          </div>
                        </summary>
                        <div className="px-6 pb-6">
                          <p className="text-slate-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-orange-500 to-green-500 rounded-3xl p-8 text-white">
                <h3 className="text-3xl font-bold mb-4">Still Have Questions?</h3>
                <p className="text-xl mb-6 text-orange-100">
                  Get personalized answers and a free consultation with our AI experts
                </p>
                <Button 
                  onClick={openCalendly}
                  className="bg-white text-slate-900 hover:bg-orange-100 px-8 py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Book Free Consultation
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content Section - Rich Content for Search Engines */}
        <SEOContent />

        {/* SEO Links Section - Internal and External Links */}
        <SEOLinks />

        {/* Social Share Component */}
        <div className="py-8 bg-gradient-to-r from-slate-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Share Our AI Transformation Story
              </h3>
              <p className="text-slate-600 mb-6">
                Help others discover the power of AI-driven digital transformation
              </p>
              <SocialShare 
                title="Comprehensive Business Consulting Services | Digital Transformation | Orgainse Consulting"
                description="Transform your business with comprehensive consulting services delivering measurable, data-driven outcomes. Expert business consulting across India, USA, UK, UAE, Australia."
                hashtags="BusinessConsulting,DigitalTransformation,BusinessStrategy,Consulting,AIConsulting"
              />
            </div>
          </div>
        </div>
    </div>
  );
};

export default Services;
