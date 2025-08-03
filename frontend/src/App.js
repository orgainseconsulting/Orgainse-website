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
          {/* Logo - Made Much Larger and More Prominent */}
          <Link to="/" className="flex items-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_business-catalyst-1/artifacts/635v5nlb_OrgAInse%20Consulting%20%28Website%29.png" 
              alt="Orgainse Consulting - AI Project Management Service & Digital Transformation" 
              className="h-32 w-auto object-contain bg-white rounded-lg px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 border border-gray-100"
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
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info with Larger Logo */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <img 
                src="https://customer-assets.emergentagent.com/job_business-catalyst-1/artifacts/635v5nlb_OrgAInse%20Consulting%20%28Website%29.png" 
                alt="Orgainse Consulting - AI-native Digital Transformation Consulting" 
                className="h-20 w-auto object-contain bg-white rounded-lg px-3 py-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              />
            </Link>
            <p className="text-gray-300 text-sm">
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
                  className="text-gray-400 hover:text-orange-500 transition-all duration-300 transform hover:scale-125"
                  aria-label={social.label}
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">AI-Native Services</h3>
            <ul className="space-y-2 text-sm text-gray-300">
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
            <h3 className="font-semibold mb-4">Industries</h3>
            <ul className="space-y-2 text-sm text-gray-300">
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
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <div className="font-semibold text-white mb-1">Bangalore, India (HQ)</div>
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
                <div className="font-semibold text-white mb-1">Austin, USA (Corporate)</div>
                <div className="text-gray-300">Corporate Office</div>
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

        <Separator className="my-8 bg-slate-700" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
          <div className="text-center md:text-left">
            <p>&copy; 2025 Orgainse Consulting. All rights reserved.</p>
            <p className="text-xs mt-1">Nature of Business: Consultancy and Service Provider</p>
            <p className="text-xs mt-1">Global Compliance Ready: GDPR, HIPAA, SOC 2, ISO 27001</p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
            <Link to="/accessibility" className="hover:text-white">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Home Page Component with SEO Optimization
const Home = () => {
  const stats = [
    { value: "25%", label: "Faster Project Delivery" },
    { value: "45%", label: "Cost Reduction in Operations" },
    { value: "4.9★", label: "Client Satisfaction Rating" },
    { value: "90", label: "Days Average Implementation" },
  ];

  const services = [
    {
      title: "AI Project Management Service (PMaaS)",
      description: "GPT-powered project planning and intelligent PMaaS for startups and SMEs",
      icon: Target,
      keywords: "AI project management service, PMaaS for startups, GPT-powered project planning",
    },
    {
      title: "Digital Transformation Consulting", 
      description: "AI-native digital transformation consulting with multi-agent orchestration platforms",
      icon: Zap,
      keywords: "AI-native digital transformation, GPT implementation roadmap, digital transformation UAE SMEs",
    },
    {
      title: "AI Operational Optimization",
      description: "AI-driven workflow automation and predictive maintenance solutions",
      icon: TrendingUp,
      keywords: "AI operational optimization consulting, reduce OPEX with AI, GPT process mining",
    },
    {
      title: "AI Agile & Scrum Coaching",
      description: "GPT-powered Scrum coach and automated sprint retrospectives",
      icon: Users,
      keywords: "AI agile coaching service, GPT-powered Scrum coach, data-driven agile transformation",
    },
    {
      title: "Business Strategy Development",
      description: "AI-driven business strategy consulting with automated market intelligence",
      icon: Globe,
      keywords: "AI-driven business strategy consulting, GPT competitive analysis, strategy development India SMEs",
    },
    {
      title: "AI Risk Management & Compliance",
      description: "AI risk management consulting with real-time compliance monitoring",
      icon: Shield,
      keywords: "AI risk management consulting, GPT-based risk co-pilot, predictive risk analytics SMEs",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* SEO Optimized Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 to-orange-50 py-20 lg:py-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-slate-800 leading-tight">
                  Let us <span className="text-orange-500 animate-gradient-text">plan</span> your{" "}
                  <span className="text-green-600 animate-gradient-text">SUCCESS</span>!!
                </h1>
                <h2 className="text-xl lg:text-2xl text-slate-700 font-semibold">
                  AI-Native Business & Digital Transformation Consulting
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  GPT-powered project management, AI-driven strategy consulting, and intelligent 
                  operational optimization for startups and SMEs across India, USA, UK, UAE, and Australia.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  Book Free AI Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50 transform hover:scale-105 transition-all duration-300">
                  View Case Studies
                </Button>
              </div>

              {/* Stats with Animation */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center transform hover:scale-110 transition-all duration-300">
                    <div className="text-2xl lg:text-3xl font-bold text-slate-800 animate-counter">{stat.value}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative animate-fade-in animation-delay-500">
              <img
                src="https://images.unsplash.com/photo-1644325349124-d1756b79dd42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb258ZW58MHx8fHwxNzU0MjI3ODg1fDA&ixlib=rb-4.1.0&q=85"
                alt="AI-native Digital Transformation and Project Management Consulting"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover transform hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Optimized Services Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              Our AI-Native Consulting Services
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto">
              Transforming businesses with GPT-powered solutions across IT Services, EdTech, FinTech, 
              Healthcare, Hospitality, and Software Development industries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-500 border-l-4 border-l-orange-500 transform hover:-translate-y-2 hover:scale-105 animate-fade-in" 
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-all duration-300 group-hover:rotate-12">
                      <service.icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-orange-600 transition-colors">
                      {service.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-slate-600 group-hover:text-slate-700 transition-colors">
                    {service.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12 animate-fade-in">
            <Link to="/services">
              <Button size="lg" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50 transform hover:scale-105 transition-all duration-300">
                Explore All AI Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Global Compliance Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
          <h3 className="text-2xl font-bold text-slate-800 mb-8">
            Global Compliance Ready
          </h3>
          <p className="text-lg text-slate-600 mb-6">
            Orgainse Consulting complies with all global compliance standards to ensure your business security and data protection.
          </p>
          <div className="flex justify-center items-center space-x-8 flex-wrap gap-4">
            <Badge variant="outline" className="text-green-600 border-green-600 transform hover:scale-110 transition-all">GDPR Compliant</Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-600 transform hover:scale-110 transition-all">HIPAA Ready</Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-600 transform hover:scale-110 transition-all">ISO 27001</Badge>
            <Badge variant="outline" className="text-orange-600 border-orange-600 transform hover:scale-110 transition-all">SOC 2 Compliant</Badge>
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

  const founders = [
    {
      name: "Rajesh Kumar",
      role: "Founder & CEO",
      title: "Foundation",
      description: "20+ years in enterprise consulting and AI strategy. Former McKinsey consultant with expertise in digital transformation across Fortune 500 companies.",
      expertise: ["AI Strategy", "Digital Transformation", "Enterprise Consulting"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGxlYWRlcnxlbnwwfHx8fDE3NTQyMjc4OTF8MA&ixlib=rb-4.1.0&q=85"
    },
    {
      name: "Priya Sharma",
      role: "Co-Founder & CTO",
      title: "Engine",
      description: "AI/ML expert with 15+ years at Google and Microsoft. Specialized in building scalable AI platforms and GPT-powered enterprise solutions.",
      expertise: ["AI/ML Engineering", "Platform Architecture", "GPT Solutions"],
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b647?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFufGVufDB8fHx8MTc1NDIyNzg5MXww&ixlib=rb-4.1.0&q=85"
    },
    {
      name: "Michael Chen",
      role: "Co-Founder & COO",
      title: "Compass",
      description: "Operations excellence expert with background at Amazon and Uber. Drives operational efficiency through AI-powered process optimization.",
      expertise: ["Operations Excellence", "Process Optimization", "Global Scaling"],
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbnxlbnwwfHx8fDE3NTQyMjc4OTF8MA&ixlib=rb-4.1.0&q=85"
    },
    {
      name: "Sarah Williams",
      role: "Co-Founder & Chief Innovation Officer",
      title: "Spark",
      description: "Innovation catalyst with startup and corporate experience. Leads our AI research initiatives and emerging technology adoption strategies.",
      expertise: ["Innovation Strategy", "AI Research", "Emerging Technologies"],
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcHJvZmVzc2lvbmFsfGVufDB8fHx8MTc1NDIyNzg5MXww&ixlib=rb-4.1.0&q=85"
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

      {/* Founders & Co-Founders Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              Meet Our Leadership Team
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our founders and co-founders bring together decades of experience in AI, consulting, 
              and enterprise transformation to lead Orgainse Consulting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {founders.map((founder, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-8">
                  <div className="flex items-start space-x-6">
                    <div className="relative">
                      <img
                        src={founder.image}
                        alt={founder.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-orange-200 group-hover:border-orange-400 transition-all duration-300"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {founder.title}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 mb-1">{founder.name}</h3>
                      <p className="text-orange-600 font-semibold mb-3">{founder.role}</p>
                      <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                        {founder.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {founder.expertise.map((skill, skillIndex) => (
                          <Badge 
                            key={skillIndex} 
                            variant="outline" 
                            className="text-xs border-orange-300 text-orange-700 hover:bg-orange-50 transition-all"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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