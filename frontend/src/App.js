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
              src="https://customer-assets.emergentagent.com/job_business-catalyst-1/artifacts/635v5nlb_OrgAInse%20Consulting%20%28Website%29.png" 
              alt="Orgainse Consulting - AI Project Management Service & Digital Transformation" 
              className="h-32 w-auto object-cover object-center bg-white rounded-lg px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border border-gray-100"
              style={{objectPosition: '50% 30%'}}
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
                src="https://customer-assets.emergentagent.com/job_business-catalyst-1/artifacts/635v5nlb_OrgAInse%20Consulting%20%28Website%29.png" 
                alt="Orgainse Consulting - AI-native Digital Transformation Consulting" 
                className="h-28 w-auto object-cover object-center bg-white rounded-lg px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border border-gray-100"
                style={{objectPosition: '50% 30%'}}
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
            <p className="text-xs mt-1">Nature of Business: Consultancy and Service Provider</p>
            <p className="text-xs mt-1">Global Compliance Ready: GDPR, HIPAA, SOC 2, ISO 27001</p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-slate-800">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-800">Terms of Service</Link>
            <Link to="/accessibility" className="hover:text-slate-800">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Home Page Component with Revolutionary Creative Design
const Home = () => {
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
                  GPT-powered project management, AI-driven strategy consulting, and intelligent 
                  operational optimization for <span className="text-yellow-400 font-bold">startups</span> and <span className="text-green-400 font-bold">SMEs</span> across 
                  India, USA, UK, UAE, and Australia.
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
                <Card className="relative bg-white/80 backdrop-blur-lg border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-6 hover:rotate-1 group overflow-hidden rounded-3xl">
                  {/* Top Gradient Bar */}
                  <div className={`h-2 bg-gradient-to-r ${service.gradient}`}></div>
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className={`p-4 ${service.iconBg} rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                        <service.icon className={`h-8 w-8 ${service.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl group-hover:text-orange-600 transition-colors leading-tight">
                          {service.title}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-slate-600 group-hover:text-slate-700 transition-colors leading-relaxed">
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

      {/* Enhanced Global Compliance Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-green-400 rounded-full blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-400 rounded-full blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-in">
          <h3 className="text-4xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Global Compliance
            </span>
            <span className="text-white"> Ready</span>
          </h3>
          <p className="text-xl text-slate-300 mb-12 max-w-4xl mx-auto">
            Orgainse Consulting complies with all global compliance standards to ensure your business security and data protection across all international markets.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "GDPR Compliant", color: "from-green-400 to-green-600", icon: Shield },
              { name: "HIPAA Ready", color: "from-blue-400 to-blue-600", icon: Award },
              { name: "ISO 27001", color: "from-purple-400 to-purple-600", icon: Globe },
              { name: "SOC 2 Compliant", color: "from-orange-400 to-orange-600", icon: CheckCircle },
            ].map((badge, index) => (
              <div 
                key={index}
                className="group relative transform hover:scale-110 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${badge.color} rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity blur-sm`}></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                  <badge.icon className="h-8 w-8 text-white mx-auto mb-3" />
                  <div className="text-white font-semibold text-sm">{badge.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Enhanced About Page with Founders Information
const About = () => {
  const values = [
    {
      title: "Collaborative",
      description: "We work as an extension of your team with AI-powered collaboration tools",
      icon: Users,
    },
    {
      title: "Outcomes-focused", 
      description: "Results that matter to your business with measurable AI-driven improvements",
      icon: Target,
    },
    {
      title: "Reliable",
      description: "Consistent delivery and 24/7 AI-powered support across global time zones",
      icon: Shield,
    },
    {
      title: "Excellence",
      description: "Best-in-class AI-native solutions and world-class service delivery",
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* SEO Optimized Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 to-orange-50 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
                About Orgainse Consulting
              </h1>
              <h2 className="text-xl text-orange-600 font-semibold mb-4">
                AI-Native Digital Transformation Leaders
              </h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                We are an AI-native consulting firm specializing in GPT-powered project management, 
                intelligent business strategy, and automated operational optimization for startups and SMEs globally.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-slate-700">Founded in 2019 with AI-first approach</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-slate-700">Global operations: India, USA, UK, UAE, Australia</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-slate-700">AI-powered methodologies with GPT integration</span>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in animation-delay-500">
              <img
                src="https://images.unsplash.com/39/lIZrwvbeRuuzqOoWJUEn_Photoaday_CSD%20%281%20of%201%29-5.jpg?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHw0fHxidXNpbmVzcyUyMHN0cmF0ZWd5fGVufDB8fHx8MTc1NDIyNzg5MXww&ixlib=rb-4.1.0&q=85"
                alt="AI-driven Business Strategy Consulting Team"
                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover transform hover:scale-105 transition-all duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Creative Leadership Ecosystem Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-orange-50 to-green-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-orange-400 rounded-full blur-3xl animate-pulse float-animation"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-green-400 rounded-full blur-2xl animate-pulse float-animation animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-yellow-400 rounded-full blur-3xl animate-pulse float-animation animation-delay-500"></div>
          <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-slate-400 rounded-full blur-2xl animate-pulse float-animation animation-delay-300"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Section */}
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-500 via-green-500 to-slate-700 bg-clip-text text-transparent">
                The ORGAINSE
              </span>
              <br />
              <span className="text-slate-800">Ecosystem</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto mb-8 leading-relaxed">
              Four interconnected forces working in perfect harmony. Not hierarchy, but 
              <span className="font-bold text-orange-600"> synergy</span>. Not theory, but 
              <span className="font-bold text-green-600"> execution</span>. Not rhetoric, but 
              <span className="font-bold text-slate-700"> results</span>.
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
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-green-500 rounded-full shadow-2xl flex items-center justify-center animate-spin-slow">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 800 600">
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
                        <p className="text-orange-100 font-medium">Strategy & Vision</p>
                      </div>
                    </div>
                    
                    <p className="text-sm leading-relaxed text-orange-50">
                      The bedrock of excellence. Sets unwavering standards, builds strategic frameworks, 
                      and ensures every engagement delivers measurable impact with crystal-clear alignment.
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
                      Pure momentum. Harnesses cutting-edge AI, breakthrough technologies, and 
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
                      Strategic navigation mastery. Guides intelligent decision-making through complex 
                      markets, ensuring clients always stay ahead of industry curves.
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
                      Transformation catalyst. Converts strategies into reality with surgical precision, 
                      optimizing performance and maximizing ROI for unprecedented client success.
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

      {/* Mission & Vision */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-3xl font-bold text-slate-800">Our Mission</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                To democratize access to world-class AI-native business consulting through 
                GPT-powered solutions, enabling organizations of all sizes to achieve 
                breakthrough performance and sustainable growth with intelligent automation.
              </p>
            </div>

            <div className="space-y-6 animate-fade-in animation-delay-300">
              <h2 className="text-3xl font-bold text-slate-800">Our Vision</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                To be the global leader in AI-native consulting, setting the standard 
                for innovation, excellence, and measurable business outcomes across 
                all industries we serve through cutting-edge GPT and AI technologies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* C.O.R.E. Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              Our C.O.R.E. Values
            </h2>
            <p className="text-xl text-slate-600">
              The AI-powered principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card 
                key={index} 
                className="text-center hover:shadow-xl transition-all duration-500 transform hover:-translate-y-4 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardHeader>
                  <div className="mx-auto p-4 bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-all group-hover:rotate-12">
                    <value.icon className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl mb-2">{value.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{value.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Enhanced Services Page with SEO
const Services = () => {
  const services = [
    {
      title: "AI Project Management Service (PMaaS)",
      description: "Comprehensive AI project management service with GPT-powered SOW auto-generation, intelligent project planning, and automated risk assessment for startups and SMEs.",
      features: ["GPT-powered Project Planning", "Automated SOW Generation", "AI Risk Assessment", "Intelligent Resource Allocation"],
      icon: Target,
      image: "https://images.unsplash.com/photo-1523875194681-bedd468c58bf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxidXNpbmVzcyUyMHN0cmF0ZWd5fGVufDB8fHx8MTc1NDIyNzg5MXww&ixlib=rb-4.1.0&q=85",
      keywords: "AI project management service, PMaaS for startups, GPT-powered project planning"
    },
    {
      title: "AI-Native Digital Transformation",
      description: "Complete digital transformation consulting with AI maturity assessment, multi-agent orchestration platforms, and GPT implementation roadmaps tailored for your industry.",
      features: ["AI Maturity Assessment", "Multi-agent Orchestration", "GPT Implementation", "Cloud-First Architecture"],
      icon: Zap,
      image: "https://images.unsplash.com/photo-1644329770639-1a20809b82a3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb258ZW58MHx8fHwxNzU0MjI3ODg1fDA&ixlib=rb-4.1.0&q=85",
      keywords: "AI-native digital transformation, GPT implementation roadmap, digital transformation UAE SMEs"
    },
    {
      title: "AI Operational Optimization", 
      description: "Intelligent operational optimization using AI-driven workflow automation, predictive maintenance agents, and GPT process mining to reduce OPEX by 20%.",
      features: ["AI Workflow Automation", "Predictive Maintenance", "GPT Process Mining", "Performance Analytics"],
      icon: TrendingUp,
      image: "https://images.unsplash.com/photo-1649406458887-2b6561c36a4d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHw0fHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb258ZW58MHx8fHwxNzU0MjI3ODg1fDA&ixlib=rb-4.1.0&q=85",
      keywords: "AI operational optimization consulting, reduce OPEX with AI, GPT process mining"
    },
    {
      title: "AI Agile & Scrum Coaching",
      description: "Revolutionary agile coaching with GPT-powered Scrum assistance, automated sprint retrospectives, and AI backlog prioritization for enhanced team velocity.",
      features: ["GPT-Powered Scrum Coaching", "Automated Sprint Retrospectives", "AI Backlog Prioritization", "Data-driven Team Analytics"],
      icon: Users,
      image: "https://images.unsplash.com/photo-1657727534676-cac1bb160d64?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxBSSUyMGNvbnN1bHRpbmd8ZW58MHx8fHwxNzU0MjI3ODc4fDA&ixlib=rb-4.1.0&q=85",
      keywords: "AI agile coaching service, GPT-powered Scrum coach, data-driven agile transformation"
    },
    {
      title: "AI-Driven Business Strategy",
      description: "Advanced business strategy development using automated market intelligence GPT, competitive analysis AI, and scenario planning tools for faster go-to-market strategies.",
      features: ["Automated Market Intelligence", "AI Competitive Analysis", "Scenario Planning Tools", "Growth Strategy Optimization"],
      icon: Globe,
      image: "https://images.unsplash.com/photo-1644325349124-d1756b79dd42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb258ZW58MHx8fHwxNzU0MjI3ODg1fDA&ixlib=rb-4.1.0&q=85",
      keywords: "AI-driven business strategy consulting, GPT competitive analysis, strategy development India SMEs"
    },
    {
      title: "AI Risk Management & Compliance",
      description: "Comprehensive AI risk management with GPT-based risk co-pilots, automated scenario modeling, and real-time compliance monitoring for fintech and healthcare SMEs.",
      features: ["GPT-Based Risk Assessment", "Automated Scenario Modeling", "Real-time Compliance Monitoring", "Predictive Risk Analytics"],
      icon: Shield,
      image: "https://images.unsplash.com/photo-1644325349124-d1756b79dd42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb258ZW58MHx8fHwxNzU0MjI3ODg1fDA&ixlib=rb-4.1.0&q=85",
      keywords: "AI risk management consulting, GPT-based risk co-pilot, predictive risk analytics SMEs"
    },
  ];

  return (
    <div className="min-h-screen">
      {/* SEO Optimized Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 to-orange-50 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
            AI-Native Consulting Services
          </h1>
          <h2 className="text-xl text-orange-600 font-semibold mb-4">
            GPT-Powered Solutions for Digital Transformation
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto mb-8">
            Comprehensive AI-native consulting services designed to transform your business 
            with GPT-powered project management, intelligent automation, and AI-driven strategy 
            across six key industries.
          </p>
          <div className="flex justify-center flex-wrap gap-3">
            <Badge className="bg-orange-100 text-orange-700 transform hover:scale-105 transition-all">IT Services & Software</Badge>
            <Badge className="bg-blue-100 text-blue-700 transform hover:scale-105 transition-all">EdTech & Education</Badge>
            <Badge className="bg-green-100 text-green-700 transform hover:scale-105 transition-all">FinTech & Finance</Badge>
            <Badge className="bg-purple-100 text-purple-700 transform hover:scale-105 transition-all">Healthcare & MedTech</Badge>
            <Badge className="bg-pink-100 text-pink-700 transform hover:scale-105 transition-all">Hospitality & Tourism</Badge>
            <Badge className="bg-indigo-100 text-indigo-700 transform hover:scale-105 transition-all">Startups & SMEs</Badge>
          </div>
        </div>
      </section>

      {/* Services Grid with Enhanced Animations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {services.map((service, index) => (
              <div 
                key={index} 
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-orange-100 rounded-lg transform hover:rotate-12 transition-all duration-300">
                      <service.icon className="h-8 w-8 text-orange-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800">{service.title}</h2>
                  </div>
                  
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-800">What you'll get:</h3>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="bg-orange-500 hover:bg-orange-600 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                    Request AI Consultation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className={`${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <img
                    src={service.image}
                    alt={service.keywords}
                    className="rounded-2xl shadow-xl w-full h-[400px] object-cover transform hover:scale-105 transition-all duration-700"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Enhanced Contact Page
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
      alert("Message sent successfully! We'll get back to you within 24 hours.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      alert("Error sending message. Please try again.");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const socialLinks = [
    { icon: Linkedin, href: "https://linkedin.com/company/orgainse-consulting", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com/orgainseconsult", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/orgainseconsulting", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com/orgainseconsulting", label: "Facebook" },
    { icon: Youtube, href: "https://youtube.com/@orgainseconsulting", label: "YouTube" },
  ];

  return (
    <div className="min-h-screen">
      {/* SEO Optimized Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 to-orange-50 py-20 overflow-hidden animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
            Contact Orgainse Consulting
          </h1>
          <h2 className="text-xl text-orange-600 font-semibold mb-4">
            Get Your Free AI Consultation Today
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto">
            Ready to transform your business with AI-native consulting? Let's discuss how our 
            GPT-powered solutions can drive your success across project management, digital transformation, 
            and operational optimization.
          </p>
        </div>
      </section>

      {/* Contact Form & Info with Social Links */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="animate-fade-in">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24 hours with a customized AI consultation plan.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Name *</label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="mt-1"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Email *</label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="mt-1"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Phone</label>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="mt-1"
                          placeholder="+91-9740384683"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Company</label>
                        <Input
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="mt-1"
                          placeholder="Your company name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">Subject *</label>
                      <Input
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="mt-1"
                        placeholder="AI Consulting Inquiry"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">Message *</label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="mt-1"
                        placeholder="Tell us about your AI transformation needs, project requirements, or how we can help optimize your operations..."
                      />
                    </div>

                    <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                      Send Message
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info with Social Links */}
            <div className="space-y-8 animate-fade-in animation-delay-300">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                  Let's Start Your AI Transformation
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                  Whether you're looking to implement AI project management, optimize operations with GPT, 
                  or accelerate digital transformation, we're here to help you succeed with our AI-native approach.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="flex items-center space-x-4 p-6">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Phone className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Phone - India (HQ)</h3>
                      <p className="text-slate-600">+91-9740384683</p>
                      <p className="text-slate-600">+91-9740394863</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="flex items-center space-x-4 p-6">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Mail className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Email</h3>
                      <p className="text-slate-600">info@orgainse.com</p>
                      <p className="text-slate-600">support@orgainse.com</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="flex items-center space-x-4 p-6">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Book a Call</h3>
                      <p className="text-slate-600">Schedule a free AI consultation</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="flex items-center space-x-4 p-6">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <MapPin className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Our Offices</h3>
                      <p className="text-slate-600">Bangalore, India (HQ)</p>
                      <p className="text-slate-600">Austin, USA (Corporate)</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Media Links */}
                <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Connect With Us</h3>
                    <div className="flex space-x-4">
                      {socialLinks.map((social, index) => (
                        <a
                          key={index}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-600 hover:text-orange-500 transform hover:scale-125 transition-all duration-300"
                          aria-label={social.label}
                        >
                          <social.icon className="h-6 w-6" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* CTA */}
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-bold mb-4">Ready to Get Started?</h3>
                  <p className="mb-6">
                    Book a free AI consultation call and let's discuss your digital transformation goals.
                  </p>
                  <Button variant="secondary" className="bg-white text-orange-600 hover:bg-orange-50 transform hover:scale-105 transition-all">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Free AI Consultation
                  </Button>
                </CardContent>
              </Card>
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
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;