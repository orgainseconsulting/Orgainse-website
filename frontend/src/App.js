import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Badge } from "./components/ui/badge";
import { Separator } from "./components/ui/separator";
import { 
  Menu, 
  X, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe,
  Brain,
  Target,
  Award,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Navigation Component
const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ];

  const socialLinks = [
    { icon: Linkedin, href: "https://linkedin.com/company/orgainse-consulting", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com/orgainseconsult", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/orgainseconsulting", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com/orgainseconsulting", label: "Facebook" },
    { icon: Youtube, href: "https://youtube.com/@orgainseconsulting", label: "YouTube" },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-32">
          {/* Logo - Zoomed and Cropped for Visibility */}
          <Link to="/" className="flex items-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_digital-presence-29/artifacts/xx6a5zd7_Copy%20of%20OrgAInse%20Consulting%20%28Website%29.png" 
              alt="Orgainse Consulting - AI Project Management Service & Digital Transformation" 
              className="h-20 w-auto object-contain bg-white rounded-xl px-3 py-2 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-100"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-orange-500 ${
                  location.pathname === link.href
                    ? "text-orange-500"
                    : "text-slate-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* All Social Media Links in Header */}
            <div className="flex items-center space-x-3 border-l border-gray-200 pl-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-orange-500 transition-colors transform hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            
            <Button className="bg-orange-500 hover:bg-orange-600 text-white transform hover:scale-105 transition-all duration-300">
              Book Free Consultation
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-orange-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* All Mobile Social Links */}
              <div className="px-3 py-2 border-t border-gray-200 mt-2">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-600 font-medium">Follow us:</span>
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-orange-500"
                      aria-label={social.label}
                    >
                      <social.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
              
              <div className="px-3 py-2">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Book Free Consultation
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Footer Component with White Background for Logo
const Footer = () => {
  const socialLinks = [
    { icon: Linkedin, href: "https://linkedin.com/company/orgainse-consulting", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com/orgainseconsult", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/orgainseconsulting", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com/orgainseconsulting", label: "Facebook" },
    { icon: Youtube, href: "https://youtube.com/@orgainseconsulting", label: "YouTube" },
  ];

  return (
    <footer className="bg-white text-slate-800 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info with Much Larger Logo */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <img 
                src="https://customer-assets.emergentagent.com/job_digital-presence-29/artifacts/xx6a5zd7_Copy%20of%20OrgAInse%20Consulting%20%28Website%29.png" 
                alt="Orgainse Consulting - AI-native Digital Transformation Consulting" 
                className="h-16 w-auto object-contain bg-white rounded-xl px-3 py-2 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-100"
              />
            </Link>
            <p className="text-slate-600 text-sm">
              AI-native consulting for innovative businesses. Let us plan your SUCCESS!
            </p>
            
            {/* All Social Media Links in Footer */}
            <div className="flex space-x-4 pt-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-orange-500 transition-all duration-300 transform hover:scale-125"
                  aria-label={social.label}
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4 text-slate-800">AI-Native Services</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Business Strategy Development</li>
              <li>Digital Transformation</li>
              <li>Operational Optimization</li>
              <li>PMaaS (AI Project Management)</li>
              <li>Agile & Scrum Coaching</li>
              <li>Risk Management & Compliance</li>
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h3 className="font-semibold mb-4 text-slate-800">Industries</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>IT Services & Software Development</li>
              <li>EdTech & Education</li>
              <li>FinTech & Financial Services</li>
              <li>Healthcare & MedTech</li>
              <li>Hospitality & Tourism</li>
              <li>Startups & SMEs</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-slate-800">Contact</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <div className="font-semibold text-slate-800 mb-1">Bangalore, India (HQ)</div>
                <div className="flex items-center space-x-2 mb-1">
                  <Phone className="h-4 w-4" />
                  <span>+91-9740384683</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+91-9740394863</span>
                </div>
              </div>
              
              <div>
                <div className="font-semibold text-slate-800 mb-1">Austin, USA (Corporate)</div>
                <div className="text-slate-600">Corporate Office</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>info@orgainse.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>support@orgainse.com</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>www.orgainse.com</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-slate-300" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-600">
          <div className="text-center md:text-left">
            <p>&copy; 2025 Orgainse Consulting. All rights reserved.</p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-slate-800">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-800">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Home Page Component with Revolutionary Creative Design
const Home = () => {
  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("");
  const [isNewsletterLoading, setIsNewsletterLoading] = useState(false);

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
      const response = await axios.post(`${API}/newsletter`, {
        email: newsletterEmail
      });

      if (response.status === 200) {
        setNewsletterStatus("success");
        setNewsletterEmail("");
        // Track successful newsletter signup
        trackLeadAction('newsletter_signup');
        // Show success message for 3 seconds
        setTimeout(() => setNewsletterStatus(""), 3000);
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setNewsletterStatus("duplicate");
      } else {
        setNewsletterStatus("error");
      }
      // Show error message for 3 seconds
      setTimeout(() => setNewsletterStatus(""), 3000);
    } finally {
      setIsNewsletterLoading(false);
    }
  };

  // AI Assessment handler
  const handleAIAssessment = () => {
    // Track engagement
    trackLeadAction('ai_assessment_click');
    // Could open a modal or redirect to assessment page
    alert("🚀 AI Assessment feature coming soon! For now, book a free consultation to get your personalized AI readiness report.");
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
    { value: "4.9★", label: "Client Satisfaction Rating", color: "from-yellow-400 to-yellow-600" },
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
      title: "AI Agile & Scrum Coaching",
      description: "GPT-powered Scrum coach and automated sprint retrospectives",
      icon: Users,
      keywords: "AI agile coaching service, GPT-powered Scrum coach, data-driven agile transformation",
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
      {/* Revolutionary Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-orange-900 to-green-900 py-20 lg:py-32 overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full blur-3xl opacity-20 animate-pulse float-animation"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse float-animation animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse float-animation animation-delay-500"></div>
          <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse float-animation animation-delay-1000"></div>
          
          {/* Floating Geometric Shapes */}
          <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-orange-400 rotate-45 animate-spin-slow opacity-60"></div>
          <div className="absolute top-3/4 right-1/4 w-12 h-12 bg-green-400 rounded-full animate-bounce opacity-60"></div>
          <div className="absolute top-1/2 left-1/4 w-6 h-16 bg-yellow-400 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute bottom-1/4 right-1/3 w-10 h-10 bg-purple-400 rotate-12 animate-spin-slow opacity-60"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  <span className="block text-white">Let us </span>
                  <span className="block bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 bg-clip-text text-transparent animate-gradient-text text-6xl lg:text-8xl">
                    plan
                  </span>
                  <span className="block text-white">your </span>
                  <span className="block bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-text text-6xl lg:text-8xl">
                    SUCCESS!!
                  </span>
                </h1>
                
                <div className="relative">
                  <h2 className="text-2xl lg:text-3xl text-orange-300 font-bold mb-4">
                    AI-Native Business & Digital Transformation
                  </h2>
                  <div className="absolute -left-4 top-0 w-2 h-full bg-gradient-to-b from-orange-400 to-green-400 rounded-full animate-pulse"></div>
                </div>
                
                <p className="text-xl text-slate-300 leading-relaxed">
                  GPT-powered project management, AI-driven strategy consulting, 
                  and intelligent operational optimization for <span className="text-yellow-400 font-bold">startups</span> and <span className="text-green-400 font-bold">SMEs</span> 
                  across India, USA, UK, UAE, Australia, New Zealand, and South Africa.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <button className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center">
                    Book Free AI Consultation
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </span>
                </button>
                
                <button className="group px-8 py-4 border-2 border-green-400 text-green-400 font-bold rounded-2xl hover:bg-green-400 hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-green-400/25 hover:shadow-xl">
                  <span className="flex items-center">
                    View Success Stories
                    <Star className="ml-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                  </span>
                </button>
              </div>

              {/* Revolutionary Stats Display */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="group relative transform hover:scale-110 transition-all duration-500 animate-fade-in"
                    style={{ animationDelay: `${index * 200 + 1000}ms` }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity blur-sm`}></div>
                    <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                      <div className={`text-3xl lg:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent animate-counter mb-2`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-slate-300 leading-tight">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in animation-delay-500">
              {/* Creative Image Container */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
                <img
                  src="https://images.unsplash.com/photo-1644325349124-d1756b79dd42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb258ZW58MHx8fHwxNzU0MjI3ODg1fDA&ixlib=rb-4.1.0&q=85"
                  alt="AI-native Digital Transformation and Project Management Consulting"
                  className="relative rounded-2xl w-full h-[500px] object-cover transform group-hover:scale-105 transition-all duration-700 shadow-2xl"
                />
                
                {/* Floating UI Elements */}
                <div className="absolute top-4 right-4 bg-orange-500 rounded-full p-3 animate-bounce">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div className="absolute bottom-4 left-4 bg-green-500 rounded-full p-3 animate-pulse">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="absolute top-1/2 -right-4 bg-purple-500 rounded-full p-4 transform rotate-12 animate-spin-slow">
                  <Target className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revolutionary Services Preview */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-orange-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #f97316 0%, transparent 50%), radial-gradient(circle at 75% 75%, #10b981 0%, transparent 50%)`
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-800 via-orange-600 to-green-600 bg-clip-text text-transparent">
                Our AI-Native
              </span>
              <br />
              <span className="text-slate-800">Consulting Arsenal</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto mb-8">
              Transforming businesses with GPT-powered solutions across IT Services, EdTech, FinTech, 
              Healthcare, Hospitality, and Software Development industries.
            </p>
            
            {/* Animated Divider */}
            <div className="flex justify-center">
              <div className="w-32 h-1 bg-gradient-to-r from-orange-500 via-green-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Creative Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Floating Background */}
                <div className={`absolute -inset-2 bg-gradient-to-r ${service.gradient} rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000`}></div>
                
                {/* Main Card */}
                <Card className="relative bg-white/80 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 group overflow-hidden rounded-2xl flex flex-col">
                  {/* Top Gradient Bar */}
                  <div className={`h-1 bg-gradient-to-r ${service.gradient}`}></div>
                  
                  <CardHeader className="pb-3 flex-1 flex flex-col p-5">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className={`p-3 ${service.iconBg} rounded-xl group-hover:scale-105 group-hover:rotate-6 transition-all duration-500 shadow-md`}>
                        <service.icon className={`h-6 w-6 ${service.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-orange-600 transition-colors leading-tight">
                          {service.title}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-slate-600 group-hover:text-slate-700 transition-colors leading-relaxed text-sm">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"></div>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-16 animate-fade-in">
            <button className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-full shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center text-lg">
                Explore Our AI Arsenal
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Revolutionary Lead Generation Hub */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-orange-900 to-green-900 relative overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-80 h-80 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full blur-3xl opacity-15 animate-pulse float-animation"></div>
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-3xl opacity-15 animate-pulse float-animation animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/3 w-4 h-12 bg-yellow-400 rounded-full animate-pulse opacity-30"></div>
          <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-orange-400 rotate-45 animate-spin-slow opacity-40"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Section */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-white">Accelerate Your </span>
              <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 bg-clip-text text-transparent animate-gradient-text">
                AI Transformation
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
              Get exclusive insights, free resources, and expert guidance to transform your business with 
              <span className="text-yellow-400 font-bold"> AI-native solutions</span>. Join 2,500+ startup leaders already accelerating their success.
            </p>
          </div>

          {/* Lead Generation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            
            {/* Newsletter Subscription Card */}
            <div className="group relative animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <Card className="relative bg-white/10 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 overflow-hidden rounded-2xl flex flex-col">
                <div className="h-1 bg-gradient-to-r from-orange-400 to-yellow-500"></div>
                <CardHeader className="pb-3 flex-1 flex flex-col p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-3 bg-orange-100 rounded-xl group-hover:scale-105 group-hover:rotate-6 transition-all duration-500 shadow-md">
                      <Mail className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-white group-hover:text-orange-300 transition-colors leading-tight">
                        AI Strategy Newsletter
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-slate-300 group-hover:text-slate-200 transition-colors leading-relaxed mb-4 text-sm">
                    Weekly insights on AI project management, digital transformation trends, and exclusive case studies from successful startups.
                  </CardDescription>
                  
                  {/* Newsletter Form */}
                  <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                    <Input 
                      type="email" 
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="bg-white/20 border-white/30 text-white placeholder-slate-300 focus:border-orange-400 focus:ring-orange-400"
                      required
                      disabled={isNewsletterLoading}
                    />
                    <button 
                      type="submit"
                      disabled={isNewsletterLoading || !newsletterEmail.trim()}
                      className="w-full group relative px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-xl shadow-xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10 flex items-center justify-center">
                        {isNewsletterLoading ? "Subscribing..." : "Get Free AI Insights"}
                        {!isNewsletterLoading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                      </span>
                    </button>
                    
                    {/* Status Messages */}
                    {newsletterStatus === "success" && (
                      <p className="text-green-400 text-sm text-center font-medium">
                        🎉 Welcome aboard! Check your email for the AI Transformation Checklist.
                      </p>
                    )}
                    {newsletterStatus === "duplicate" && (
                      <p className="text-yellow-400 text-sm text-center font-medium">
                        📧 You're already subscribed! Check your email for resources.
                      </p>
                    )}
                    {newsletterStatus === "error" && (
                      <p className="text-red-400 text-sm text-center font-medium">
                        ❌ Something went wrong. Please try again.
                      </p>
                    )}
                    
                    <p className="text-xs text-slate-400 text-center">
                      🎁 Instant access to "AI Transformation Checklist" (worth $297)
                    </p>
                  </form>
                </CardHeader>
              </Card>
            </div>

            {/* Free AI Assessment Card */}
            <div className="group relative animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="absolute -inset-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <Card className="relative bg-white/10 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 overflow-hidden rounded-2xl flex flex-col">
                <div className="h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
                <CardHeader className="pb-3 flex-1 flex flex-col p-5">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-4 bg-green-100 rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                      <Brain className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-white group-hover:text-green-300 transition-colors leading-tight">
                        Free AI Readiness Assessment
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-slate-300 group-hover:text-slate-200 transition-colors leading-relaxed mb-6">
                    Discover your company's AI maturity score and get a personalized roadmap for digital transformation in just 5 minutes.
                  </CardDescription>
                  
                  <button 
                    onClick={handleAIAssessment}
                    className="w-full group relative px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-xl shadow-xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center">
                      Start Free Assessment
                      <Target className="ml-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                    </span>
                  </button>
                  
                  <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-slate-400">
                    <span className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-green-400" /> No signup required</span>
                    <span className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-green-400" /> Instant results</span>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Free Consultation Card */}
            <div className="group relative animate-fade-in md:col-span-2 lg:col-span-1" style={{ animationDelay: '600ms' }}>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <Card className="relative bg-white/10 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 overflow-hidden rounded-2xl flex flex-col">
                <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-500"></div>
                <CardHeader className="pb-3 flex-1 flex flex-col p-5">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-4 bg-purple-100 rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                      <Calendar className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-white group-hover:text-purple-300 transition-colors leading-tight">
                        Free Strategy Session
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-slate-300 group-hover:text-slate-200 transition-colors leading-relaxed mb-6">
                    Book a 30-minute AI strategy consultation worth $500. Get expert insights on your digital transformation journey.
                  </CardDescription>
                  
                  <button 
                    onClick={handleFreeConsultation}
                    className="w-full group relative px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center">
                      Book Free Session
                      <Calendar className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    </span>
                  </button>
                  
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 mb-2">
                      <Star className="h-3 w-3 text-yellow-400" />
                      <span>Limited slots available</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      💎 Usually $500/session - FREE for qualified startups
                    </p>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Lead Magnets Section */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '800ms' }}>
            <h3 className="text-3xl font-bold text-white mb-8">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Free Resources
              </span>
              <span className="text-white"> to Accelerate Your Growth</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  title: "AI Implementation Guide",
                  description: "Step-by-step roadmap for AI adoption",
                  value: "$197",
                  icon: Target,
                  gradient: "from-orange-400 to-yellow-500"
                },
                {
                  title: "ROI Calculator Template",
                  description: "Calculate AI project ROI instantly",
                  value: "$97",
                  icon: TrendingUp,
                  gradient: "from-green-400 to-blue-500"
                },
                {
                  title: "Digital Transformation Checklist",
                  description: "25-point transformation checklist",
                  value: "$127",
                  icon: CheckCircle,
                  gradient: "from-purple-400 to-pink-500"
                }
              ].map((resource, index) => (
                <div key={index} className="group relative">
                  <div className={`absolute -inset-1 bg-gradient-to-r ${resource.gradient} rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500`}></div>
                  <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <resource.icon className="h-6 w-6 text-white" />
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 font-bold">
                        Worth {resource.value}
                      </Badge>
                    </div>
                    <h4 className="text-white font-semibold mb-2">{resource.title}</h4>
                    <p className="text-slate-300 text-sm">{resource.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-slate-300 mt-8 text-lg">
              Join our newsletter and get instant access to all resources - 
              <span className="text-yellow-400 font-bold"> FREE ($421 value)</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

// Enhanced About Page with Revolutionary Creative Design and SEO
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
      <section className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 py-20 lg:py-32 overflow-hidden">
        {/* Optimized Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl animate-pulse will-change-transform"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full blur-3xl animate-pulse animation-delay-2000 will-change-transform"></div>
          <div className="absolute top-1/2 left-1/4 w-6 h-16 bg-blue-400 rounded-full animate-pulse opacity-40"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-white">About </span>
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-text">
                  Orgainse Consulting
                </span>
              </h1>
              
              <h2 className="text-2xl lg:text-3xl text-blue-300 font-bold mb-6">
                AI-Native Digital Transformation Leaders & GPT-Powered Project Management Experts
              </h2>
              
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                We are an AI-native consulting firm specializing in <span className="text-yellow-400 font-bold">GPT-powered project management</span>, 
                intelligent business strategy, and <span className="text-green-400 font-bold">automated operational optimization</span> 
                for startups and SMEs across India, USA, UK, UAE, Australia, New Zealand, and South Africa.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span className="text-slate-300">Founded in 2025 with <span className="text-blue-400 font-semibold">AI-first approach</span> and started branches in Bangalore, India and Austin, USA in 4 months</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span className="text-slate-300">Global operations: <span className="text-orange-400 font-semibold">AI project management service</span> across 5 continents (7 countries)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <span className="text-slate-300">AI-powered methodologies with <span className="text-purple-400 font-semibold">GPT implementation roadmap</span> integration</span>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in animation-delay-500">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl blur opacity-60 group-hover:opacity-80 transition duration-1000 animate-pulse"></div>
                <img
                  src="https://images.unsplash.com/photo-1523875194681-bedd468c58bf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxidXNpbmVzcyUyMHN0cmF0ZWd5fGVufDB8fHx8MTc1NDI0MDE4Mnww&ixlib=rb-4.1.0&q=85"
                  alt="AI-driven Business Strategy Consulting Team implementing GPT-powered solutions"
                  className="relative rounded-2xl w-full h-[400px] object-cover transform group-hover:scale-105 transition-all duration-700 shadow-2xl"
                  loading="lazy"
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
          <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-slate-400 rounded-full blur-2xl animate-pulse float-animation animation-delay-300 will-change-transform"></div>
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
            <p className="text-xl text-slate-600 max-w-4xl mx-auto mb-8 leading-relaxed">
              Four interconnected forces delivering <span className="font-bold text-orange-600">AI-driven business strategy consulting</span> and 
              <span className="font-bold text-green-600">GPT-powered agile coaching</span>. Not hierarchy, but 
              <span className="font-bold text-slate-700">predictive risk analytics</span>.
            </p>
            
            {/* Visual Connection Lines */}
            <div className="relative w-32 h-8 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-green-500 to-slate-700 rounded-full opacity-30 animate-pulse"></div>
              <div className="absolute inset-1 bg-white rounded-full"></div>
              <div className="absolute inset-2 bg-gradient-to-r from-orange-500 via-green-500 to-slate-700 rounded-full"></div>
            </div>
          </div>

          {/* Creative Central Hub Design */}
          <div className="relative">
            {/* Central Connection Point */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-green-500 rounded-full shadow-2xl flex items-center justify-center animate-spin-slow will-change-transform">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full"></div>
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
            <div className="grid grid-cols-2 gap-8 lg:gap-16 relative z-20">
              
              {/* The Foundation - Top Left */}
              <div className="relative animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="absolute -top-4 -left-4 w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl transform rotate-3 opacity-20"></div>
                <Card className="relative bg-gradient-to-br from-orange-400 to-orange-600 text-white border-none shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-2 group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full transform -translate-x-4 translate-y-4"></div>
                  
                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                        <Target className="h-8 w-8 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">The Foundation</h3>
                        <p className="text-orange-100 font-medium">AI Strategy & Vision</p>
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
                  
                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:-rotate-12 transition-transform duration-500">
                        <Zap className="h-8 w-8 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">The Engine</h3>
                        <p className="text-amber-800 font-medium">Innovation & Growth</p>
                      </div>
                    </div>
                    
                    <p className="text-sm leading-relaxed text-amber-900">
                      Pure momentum through <span className="font-bold">GPT-powered project planning</span>. Harnesses cutting-edge 
                      <span className="font-bold">AI operational optimization</span>, breakthrough technologies, and 
                      revolutionary thinking to propel clients beyond their competition.
                    </p>
                    
                    <div className="mt-6 flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-amber-300 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-600 rounded-full animate-pulse" style={{width: '92%'}}></div>
                      </div>
                      <span className="text-xs text-amber-800">Power: 92%</span>
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
                  
                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-180 transition-transform duration-700">
                        <Globe className="h-8 w-8 text-green-500" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">The Compass</h3>
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
                  
                  <CardContent className="p-8 relative z-10">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                        <Users className="h-8 w-8 text-slate-700" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">The Spark</h3>
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
                  <div className="w-3 h-3 bg-slate-700 rounded-full animate-pulse animation-delay-700"></div>
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
                <span className="text-green-400 font-bold">GPT-powered solutions</span>, enabling organizations of all sizes to achieve 
                breakthrough performance and sustainable growth with <span className="text-blue-400 font-bold">intelligent automation</span> and 
                <span className="text-purple-400 font-bold">real-time compliance monitoring</span>.
              </p>
            </div>

            <div className="space-y-6 animate-fade-in animation-delay-300">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Our Vision</span>
              </h2>
              <p className="text-xl text-slate-200 leading-relaxed">
                To be the global leader in <span className="text-orange-400 font-bold">AI-native consulting</span>, setting the standard 
                for innovation, excellence, and measurable business outcomes through <span className="text-green-400 font-bold">cutting-edge GPT</span> and 
                <span className="text-blue-400 font-bold">AI technologies</span> across all industries we serve with <span className="text-pink-400 font-bold">outcome-based AI strategy consulting</span>.
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
                <Card className="relative text-center hover:shadow-xl transition-all duration-500 transform hover:-translate-y-4 bg-white/90 backdrop-blur-lg border-0 shadow-2xl rounded-3xl overflow-hidden">
                  {/* Top Gradient Bar */}
                  <div className={`h-2 bg-gradient-to-r ${value.gradient}`}></div>
                  
                  <CardHeader className="pb-6">
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

// Revolutionary Services Page with Creative Design and SEO
const Services = () => {
  const services = [
    {
      title: "AI Project Management Service (PMaaS)",
      description: "Comprehensive AI project management service with GPT-powered SOW auto-generation, intelligent project planning, and automated risk assessment for startups and SMEs across India, USA, UK, UAE, Australia, New Zealand, and South Africa.",
      features: ["GPT-powered Project Planning & SOW Auto-generation", "Automated Risk Assessment & Scenario Modeling", "AI Resource Allocation & Timeline Optimization", "Intelligent Performance Analytics & Reporting"],
      icon: Target,
      image: "https://images.unsplash.com/photo-1657727534676-cac1bb160d64?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwyfHxBSSUyMGNvbnN1bHRpbmd8ZW58MHx8fHwxNzU0MjQwMTc1fDA&ixlib=rb-4.1.0&q=85",
      keywords: "AI project management service, PMaaS for startups, GPT-powered project planning",
      gradient: "from-orange-400 to-red-500"
    },
    {
      title: "AI-Native Digital Transformation",
      description: "Complete digital transformation consulting with AI maturity assessment, multi-agent orchestration platforms, and GPT implementation roadmap tailored for EdTech, FinTech, Healthcare, and Software Development industries.",
      features: ["AI Maturity Assessment & Digital Readiness Audit", "Multi-agent Orchestration Platform Setup", "GPT Implementation Roadmap & Integration", "Cloud-First Architecture with AI-Powered Analytics"],
      icon: Zap,
      image: "https://images.unsplash.com/photo-1644325349124-d1756b79dd42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb258ZW58MHx8fHwxNzU0MjQwMTkwfDA&ixlib=rb-4.1.0&q=85",
      keywords: "AI-native digital transformation, GPT implementation roadmap, digital transformation UAE SMEs",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      title: "AI Operational Optimization", 
      description: "Intelligent operational optimization using AI-driven workflow automation, predictive maintenance agents, and GPT process mining to reduce OPEX by 20% for hospitality, healthcare, and manufacturing SMEs.",
      features: ["AI Workflow Automation & Process Intelligence", "Predictive Maintenance AI Agent & Monitoring", "GPT Process Mining & Bottleneck Detection", "Real-time Performance Analytics & Cost Optimization"],
      icon: TrendingUp,
      image: "https://images.unsplash.com/photo-1649406458887-2b6561c36a4d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHw0fHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb258ZW58MHx8fHwxNzU0MjQwMTkwfDA&ixlib=rb-4.1.0&q=85",
      keywords: "AI operational optimization consulting, reduce OPEX with AI, GPT process mining",
      gradient: "from-green-400 to-emerald-500"
    },
    {
      title: "AI Agile & Scrum Coaching",
      description: "Revolutionary agile coaching with GPT-powered Scrum assistance, automated sprint retrospectives, and AI backlog prioritization for enhanced team velocity across UK startups, Australia agile teams, and India software companies.",
      features: ["GPT-Powered Scrum Coaching & Team Mentoring", "Automated Sprint Retrospectives & Analysis", "AI Backlog Prioritization & Story Estimation", "Data-driven Team Performance Analytics"],
      icon: Users,
      image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg",
      keywords: "AI agile coaching service, GPT-powered Scrum coach, data-driven agile transformation",
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      title: "AI-Driven Business Strategy Development",
      description: "Advanced business strategy development using automated market intelligence GPT, competitive analysis AI, and scenario planning tools for faster go-to-market strategies across IT Services, EdTech startups, and FinTech SMEs.",
      features: ["Automated Market Intelligence & Competitor Analysis", "AI-Powered Competitive Strategy & Positioning", "Scenario Planning Tools & Market Forecasting", "Growth Strategy Optimization & ROI Modeling"],
      icon: Globe,
      image: "https://images.unsplash.com/photo-1650978810653-112cb6018092?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHN0cmF0ZWd5fGVufDB8fHx8MTc1NDI0MDE4Mnww&ixlib=rb-4.1.0&q=85",
      keywords: "AI-driven business strategy consulting, GPT competitive analysis, strategy development India SMEs",
      gradient: "from-purple-400 to-pink-500"
    },
    {
      title: "AI Risk Management & Compliance",
      description: "Comprehensive AI risk management with GPT-based risk co-pilots, automated scenario modeling, and real-time compliance monitoring for fintech SMEs, healthcare organizations, and UAE regulatory compliance requirements.",
      features: ["GPT-Based Risk Assessment & Co-pilot Support", "Automated Scenario Modeling & Stress Testing", "Real-time Compliance Monitoring & Reporting", "Predictive Risk Analytics & Mitigation Planning"],
      icon: Shield,
      image: "https://images.unsplash.com/photo-1523875194681-bedd468c58bf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxidXNpbmVzcyUyMHN0cmF0ZWd5fGVufDB8fHx8MTc1NDI0MDE4Mnww&ixlib=rb-4.1.0&q=85",
      keywords: "AI risk management consulting, GPT-based risk co-pilot, predictive risk analytics SMEs",
      gradient: "from-slate-400 to-slate-600"
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Revolutionary Hero Section with SEO */}
      <section className="relative bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 py-20 lg:py-32 overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full blur-3xl animate-pulse float-animation will-change-transform"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-3xl animate-pulse float-animation animation-delay-2000 will-change-transform"></div>
          <div className="absolute top-1/2 left-1/4 w-6 h-16 bg-yellow-400 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute bottom-1/4 right-1/3 w-8 h-8 bg-orange-400 rotate-45 animate-spin-slow opacity-40"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-in">
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-white">AI-Native </span>
            <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 bg-clip-text text-transparent animate-gradient-text">
              Consulting
            </span>
            <br />
            <span className="text-white">Services</span>
          </h1>
          
          <h2 className="text-2xl lg:text-3xl text-orange-300 font-bold mb-6">
            GPT-Powered Solutions for Digital Transformation & Project Management
          </h2>
          
          <p className="text-xl text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
            Comprehensive <span className="text-yellow-400 font-bold">AI-native consulting services</span> designed to transform your business 
            with <span className="text-green-400 font-bold">GPT-powered project management</span>, intelligent automation, and 
            <span className="text-orange-400 font-bold">AI-driven strategy</span> across six key industries and seven global regions.
          </p>
          
          <div className="flex justify-center flex-wrap gap-4 mb-12">
            {[
              { name: "IT Services & Software", color: "from-orange-400 to-red-500" },
              { name: "EdTech & Education", color: "from-blue-400 to-indigo-500" },
              { name: "FinTech & Finance", color: "from-green-400 to-emerald-500" },
              { name: "Healthcare & MedTech", color: "from-purple-400 to-pink-500" },
              { name: "Hospitality & Tourism", color: "from-pink-400 to-rose-500" },
              { name: "Startups & SMEs", color: "from-indigo-400 to-purple-500" },
            ].map((industry, index) => (
              <div 
                key={index}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${industry.color} rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity blur-sm`}></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105">
                  <span className="text-white font-medium text-sm">{industry.name}</span>
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

      {/* Revolutionary Services Grid with Enhanced Animations */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-orange-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #f97316 0%, transparent 50%), radial-gradient(circle at 75% 75%, #10b981 0%, transparent 50%)`
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="space-y-24">
            {services.map((service, index) => (
              <div 
                key={index} 
                className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center animate-fade-in ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={`space-y-8 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className="relative group">
                      <div className={`absolute inset-0 bg-gradient-to-r ${service.gradient} rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity blur-sm`}></div>
                      <div className="relative p-4 bg-white rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:rotate-12">
                        <service.icon className="h-10 w-10 text-slate-600" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 leading-tight">
                        {service.title}
                      </h2>
                      <div className={`h-1 w-20 bg-gradient-to-r ${service.gradient} rounded-full mt-2`}></div>
                    </div>
                  </div>
                  
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 text-lg">What you'll get:</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {service.features.map((feature, featureIndex) => (
                        <div 
                          key={featureIndex}
                          className="group flex items-start space-x-3 p-3 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300"
                        >
                          <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <span className="text-slate-700 group-hover:text-slate-800 transition-colors font-medium">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10 flex items-center">
                        Request AI Consultation
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                      </span>
                    </button>
                  </div>
                </div>

                <div className={`${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''} relative group`}>
                  {/* Creative Image Container */}
                  <div className={`absolute -inset-4 bg-gradient-to-r ${service.gradient} rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse`}></div>
                  <img
                    src={service.image}
                    alt={`${service.keywords} - ${service.title} for startups and SMEs`}
                    className="relative rounded-2xl shadow-2xl w-full h-[400px] object-cover transform group-hover:scale-105 transition-all duration-700"
                    loading="lazy"
                  />
                  
                  {/* Floating UI Elements */}
                  <div className="absolute top-4 right-4 bg-orange-500 rounded-full p-3 animate-bounce will-change-transform">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute bottom-4 left-4 bg-green-500 rounded-full p-3 animate-pulse will-change-transform">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute top-1/2 -right-4 bg-purple-500 rounded-full p-4 transform rotate-12 animate-spin-slow will-change-transform">
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Creative CTA Section */}
          <div className="text-center mt-20 animate-fade-in">
            <h3 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-6">
              Ready to Transform Your Business with{" "}
              <span className="bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                AI-Native Solutions?
              </span>
            </h3>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Join hundreds of successful startups and SMEs who have accelerated their growth with our 
              <span className="font-bold text-orange-600"> GPT-powered consulting services</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-full shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center text-lg">
                  Explore Our AI Arsenal
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
              
              <button className="group px-10 py-5 border-2 border-orange-500 text-orange-500 font-bold rounded-full hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-orange-500/25 hover:shadow-xl">
                <span className="flex items-center text-lg">
                  Get Free AI Readiness Audit
                  <Star className="ml-3 h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Revolutionary Contact Page with Creative Design and SEO
const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/contact`, formData);
      alert("Message sent successfully! We'll get back to you within 24 hours with a customized AI consultation plan.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      alert("Error sending message. Please try again or contact us directly at info@orgainse.com");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const socialLinks = [
    { icon: Linkedin, href: "https://linkedin.com/company/orgainse-consulting", label: "LinkedIn", color: "from-blue-400 to-blue-600" },
    { icon: Twitter, href: "https://twitter.com/orgainseconsult", label: "Twitter", color: "from-sky-400 to-blue-500" },
    { icon: Instagram, href: "https://instagram.com/orgainseconsulting", label: "Instagram", color: "from-pink-400 to-rose-500" },
    { icon: Facebook, href: "https://facebook.com/orgainseconsulting", label: "Facebook", color: "from-blue-500 to-indigo-600" },
    { icon: Youtube, href: "https://youtube.com/@orgainseconsulting", label: "YouTube", color: "from-red-400 to-red-600" },
  ];

  const contactMethods = [
    {
      title: "Phone - India (HQ)",
      description: "Direct consultation with our AI specialists",
      details: ["+91-9740384683", "+91-9740394863"],
      icon: Phone,
      gradient: "from-green-400 to-emerald-500"
    },
    {
      title: "Email Support",
      description: "24/7 AI-powered support and consultation",
      details: ["info@orgainse.com", "support@orgainse.com"],
      icon: Mail,
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      title: "Book AI Consultation",
      description: "Schedule your free GPT-powered strategy session",
      details: ["Free 30-min consultation", "Customized AI roadmap"],
      icon: Calendar,
      gradient: "from-orange-400 to-red-500"
    },
    {
      title: "Global Offices",
      description: "AI-native consulting across regions",
      details: ["Bangalore, India (HQ)", "Austin, USA (Corporate)"],
      icon: MapPin,
      gradient: "from-purple-400 to-pink-500"
    }
  ];

  return (
    <div id="contact" className="min-h-screen">
      {/* Revolutionary Hero Section with SEO */}
      <section className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 py-20 lg:py-32 overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl animate-pulse float-animation will-change-transform"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-3xl animate-pulse float-animation animation-delay-2000 will-change-transform"></div>
          <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-blue-400 rotate-45 animate-spin-slow opacity-60"></div>
          <div className="absolute bottom-1/3 right-1/4 w-6 h-16 bg-purple-400 rounded-full animate-pulse opacity-50"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-in">
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-white">Contact </span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-text">
              Orgainse
            </span>
            <br />
            <span className="text-white">Consulting</span>
          </h1>
          
          <h2 className="text-2xl lg:text-3xl text-blue-300 font-bold mb-6">
            Get Your Free AI Consultation & GPT-Powered Strategy Session
          </h2>
          
          <p className="text-xl text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
            Ready to transform your business with <span className="text-yellow-400 font-bold">AI-native consulting</span>? Let's discuss how our 
            <span className="text-green-400 font-bold"> GPT-powered solutions</span> can drive your success across 
            <span className="text-orange-400 font-bold"> project management</span>, digital transformation, 
            and operational optimization for startups and SMEs globally.
          </p>
          
          {/* Animated Divider */}
          <div className="flex justify-center mb-8">
            <div className="w-40 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Revolutionary Contact Form & Info with Enhanced Design */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)`
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Enhanced Contact Form */}
            <div className="animate-fade-in">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                
                <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden">
                  {/* Top Gradient Bar */}
                  <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                  
                  <CardHeader className="pb-6">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Send us a message
                    </CardTitle>
                    <CardDescription className="text-lg text-slate-600">
                      Fill out the form below and we'll get back to you within 24 hours with a customized 
                      <span className="font-bold text-blue-600"> AI consultation plan</span> and 
                      <span className="font-bold text-purple-600"> GPT-powered strategy recommendations</span>.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-slate-700">Name *</label>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-2 border-2 border-slate-200 focus:border-blue-500 transition-colors duration-300"
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-700">Email *</label>
                          <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-2 border-2 border-slate-200 focus:border-blue-500 transition-colors duration-300"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-slate-700">Phone</label>
                          <Input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="mt-2 border-2 border-slate-200 focus:border-blue-500 transition-colors duration-300"
                            placeholder="+91-9740384683"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-700">Company</label>
                          <Input
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            className="mt-2 border-2 border-slate-200 focus:border-blue-500 transition-colors duration-300"
                            placeholder="Your company name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700">Subject *</label>
                        <Input
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="mt-2 border-2 border-slate-200 focus:border-blue-500 transition-colors duration-300"
                          placeholder="AI Consulting Inquiry - Project Management/Digital Transformation"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-slate-700">Message *</label>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="mt-2 border-2 border-slate-200 focus:border-blue-500 transition-colors duration-300"
                          placeholder="Tell us about your AI transformation needs, GPT-powered project management requirements, operational optimization goals, or how we can help accelerate your business growth with our AI-native consulting services..."
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="group w-full relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative z-10 flex items-center justify-center text-lg">
                          Send Message & Get AI Consultation
                          <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                        </span>
                      </button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Enhanced Contact Info with Creative Cards */}
            <div className="space-y-8 animate-fade-in animation-delay-300">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Let's Start Your AI Transformation
                  </span>
                </h2>
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  Whether you're looking to implement <span className="font-bold text-blue-600">AI project management</span>, 
                  optimize operations with <span className="font-bold text-purple-600">GPT-powered solutions</span>, 
                  or accelerate <span className="font-bold text-orange-600">digital transformation</span>, we're here to help you succeed 
                  with our AI-native approach across India, USA, UK, UAE, Australia, New Zealand, and South Africa.
                </p>
              </div>

              {/* Creative Contact Method Cards */}
              <div className="space-y-6">
                {contactMethods.map((method, index) => (
                  <div 
                    key={index}
                    className="group relative animate-fade-in"
                    style={{ animationDelay: `${index * 150 + 400}ms` }}
                  >
                    {/* Floating Background */}
                    <div className={`absolute -inset-2 bg-gradient-to-r ${method.gradient} rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000`}></div>
                    
                    <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-3xl overflow-hidden">
                      {/* Top Gradient Bar */}
                      <div className={`h-1 bg-gradient-to-r ${method.gradient}`}></div>
                      
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className={`p-4 bg-white rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                            <method.icon className="h-8 w-8 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{method.title}</h3>
                            <p className="text-slate-600 text-sm mb-3">{method.description}</p>
                            <div className="space-y-1">
                              {method.details.map((detail, detailIndex) => (
                                <p key={detailIndex} className="text-slate-700 font-medium">
                                  {detail}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}

                {/* Enhanced Social Media Card */}
                <div className="group relative animate-fade-in" style={{ animationDelay: '800ms' }}>
                  <div className="absolute -inset-2 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  
                  <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-3xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">
                        Connect With Our AI Community
                      </h3>
                      <p className="text-slate-600 text-center mb-6">
                        Follow us for the latest insights on AI-native consulting and GPT-powered business transformation
                      </p>
                      
                      <div className="flex justify-center space-x-4">
                        {socialLinks.map((social, index) => (
                          <div 
                            key={index}
                            className="group/social relative"
                          >
                            <div className={`absolute inset-0 bg-gradient-to-r ${social.color} rounded-2xl opacity-20 group-hover/social:opacity-40 transition-opacity blur-sm`}></div>
                            <a
                              href={social.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative flex items-center justify-center w-12 h-12 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-125 hover:-translate-y-2"
                              aria-label={social.label}
                            >
                              <social.icon className="h-6 w-6 text-slate-600" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Revolutionary CTA Card */}
              <div className="group relative animate-fade-in" style={{ animationDelay: '1000ms' }}>
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse"></div>
                
                <Card className="relative bg-gradient-to-br from-orange-500 to-purple-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 rounded-3xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-8 -translate-y-8 animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full transform -translate-x-4 translate-y-4 animate-pulse animation-delay-500"></div>
                  
                  <CardContent className="p-8 text-center relative z-10">
                    <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                    <p className="mb-6 text-orange-100">
                      Book a free AI consultation call and let's discuss your digital transformation goals 
                      with our <span className="font-bold">GPT-powered strategy development</span>.
                    </p>
                    <button className="group/btn bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                      <Calendar className="inline-block mr-2 h-5 w-5" />
                      Schedule Free AI Consultation
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Main App Component with SEO Meta Tags
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

// Privacy Policy Component
const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-slate-600 mb-6">Last updated: January 2025</p>
          
          <div className="space-y-8 text-slate-700">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Information We Collect</h2>
              <p className="mb-4 leading-relaxed">
                At Orgainse Consulting, we collect information you provide directly to us, such as when you:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fill out our contact forms or newsletter subscription</li>
                <li>Request a consultation or AI assessment</li>
                <li>Communicate with us via email or phone</li>
                <li>Use our website and services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">How We Use Your Information</h2>
              <p className="mb-4 leading-relaxed">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide AI consulting services and project management solutions</li>
                <li>Send you our AI Strategy Newsletter and free resources</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Improve our services and develop new AI solutions</li>
                <li>Comply with legal obligations and protect our rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Information Sharing</h2>
              <p className="leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy. 
                We may share your information with trusted service providers who assist us in operating our website and conducting our business, 
                provided they agree to keep this information confidential.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Data Security</h2>
              <p className="leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. We use industry-standard encryption and secure servers to protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Global Compliance</h2>
              <p className="leading-relaxed">
                Our privacy practices comply with applicable data protection laws including GDPR (European Union), 
                CCPA (California), and other regional privacy regulations across India, USA, UK, UAE, Australia, New Zealand, and South Africa.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 space-y-2">
                <p>Email: info@orgainse.com</p>
                <p>Phone: +91-9740384683 (India) | +1-XXX-XXX-XXXX (USA)</p>
                <p>Address: Bangalore, India | Austin, USA</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// Terms of Service Component
const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-slate-600 mb-6">Last updated: January 2025</p>
          
          <div className="space-y-8 text-slate-700">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing and using Orgainse Consulting's website and services, you accept and agree to be bound by the terms 
                and provision of this agreement. Our AI-native consulting services are provided subject to these terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Services Description</h2>
              <p className="mb-4 leading-relaxed">Orgainse Consulting provides:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>AI Project Management Service (PMaaS) with GPT-powered solutions</li>
                <li>Digital transformation consulting and strategy development</li>
                <li>Operational optimization using AI-driven methodologies</li>
                <li>Agile & Scrum coaching with AI-powered insights</li>
                <li>Risk management and compliance consulting</li>
                <li>Business strategy development across multiple industries</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">User Responsibilities</h2>
              <p className="mb-4 leading-relaxed">As a user of our services, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete information when requested</li>
                <li>Use our services in compliance with applicable laws and regulations</li>
                <li>Maintain the confidentiality of any login credentials</li>
                <li>Not use our services for any unlawful or prohibited purposes</li>
                <li>Respect intellectual property rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Service Limitations</h2>
              <p className="leading-relaxed">
                While we strive to provide exceptional AI consulting services, results may vary based on client requirements, 
                market conditions, and implementation factors. We do not guarantee specific outcomes but commit to delivering 
                professional expertise and best practices in AI-native consulting.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Intellectual Property</h2>
              <p className="leading-relaxed">
                All content, methodologies, and AI solutions developed by Orgainse Consulting remain our intellectual property. 
                Clients receive usage rights for implemented solutions but not ownership of our proprietary methodologies and frameworks.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Limitation of Liability</h2>
              <p className="leading-relaxed">
                Orgainse Consulting's liability is limited to the amount paid for services. We are not responsible for indirect, 
                incidental, or consequential damages arising from the use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Governing Law</h2>
              <p className="leading-relaxed">
                These terms are governed by the laws of India and the United States, depending on the jurisdiction of service delivery. 
                Any disputes will be resolved through arbitration in the applicable jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Contact Information</h2>
              <p className="leading-relaxed">
                For questions regarding these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 space-y-2">
                <p>Email: info@orgainse.com</p>
                <p>Phone: +91-9740384683 (India) | +1-XXX-XXX-XXXX (USA)</p>
                <p>Headquarters: Bangalore, India | Austin, USA</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;