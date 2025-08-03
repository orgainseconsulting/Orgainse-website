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

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_business-catalyst-1/artifacts/635v5nlb_OrgAInse%20Consulting%20%28Website%29.png" 
              alt="Orgainse Consulting - Let us plan your SUCCESS!!" 
              className="h-16 w-auto object-contain bg-white rounded-lg px-2 py-1"
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
            
            {/* Social Media Links */}
            <div className="flex items-center space-x-3 border-l border-gray-200 pl-6">
              <a
                href="https://linkedin.com/company/orgainseconsulting"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-orange-500 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/orgainse_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-orange-500 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com/orgainse.consulting"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-orange-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
            
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
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

// Footer Component
const Footer = () => {
  const socialLinks = [
    { icon: Linkedin, href: "https://linkedin.com/company/orgainseconsulting", label: "LinkedIn" },
    { icon: Twitter, href: "https://x.com/orgainse_ai", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/orgainse.consulting", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com/orgainseconsulting", label: "Facebook" },
    { icon: Youtube, href: "https://youtube.com/@orgainse", label: "YouTube" },
  ];

  return (
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <img 
                src="https://customer-assets.emergentagent.com/job_business-catalyst-1/artifacts/635v5nlb_OrgAInse%20Consulting%20%28Website%29.png" 
                alt="Orgainse Consulting - Let us plan your SUCCESS!!" 
                className="h-16 w-auto object-contain bg-white rounded-lg px-2 py-1"
              />
            </Link>
            <p className="text-gray-300 text-sm">
              AI-native consulting for innovative businesses. Let us plan your SUCCESS!
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4 pt-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Business Strategy Development</li>
              <li>Digital Transformation</li>
              <li>Operational Optimization</li>
              <li>PMaaS</li>
              <li>Agile & Scrum Coaching</li>
              <li>Risk Management</li>
            </ul>
          </div>

          {/* Industries */}
          <div>
            <h3 className="font-semibold mb-4">Industries</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>IT Services</li>
              <li>EdTech</li>
              <li>FinTech</li>
              <li>Healthcare</li>
              <li>Hospitality</li>
              <li>Software Development</li>
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

// Home Page Component
const Home = () => {
  const stats = [
    { value: "25%", label: "Faster Delivery" },
    { value: "45%", label: "Cost Reduction" },
    { value: "4.9★", label: "Client Satisfaction" },
    { value: "90", label: "Days Implementation" },
  ];

  const services = [
    {
      title: "Business Strategy Development",
      description: "AI-powered strategic planning and market analysis",
      icon: Target,
    },
    {
      title: "Digital Transformation", 
      description: "Comprehensive digitization and automation solutions",
      icon: Zap,
    },
    {
      title: "Operational Optimization",
      description: "Streamline processes with AI-driven insights",
      icon: TrendingUp,
    },
    {
      title: "PMaaS (Project Management as a Service)",
      description: "End-to-end project management solutions",
      icon: Users,
    },
    {
      title: "Agile & Scrum Coaching",
      description: "Transform teams with modern methodologies",
      icon: Globe,
    },
    {
      title: "Risk Management",
      description: "Identify and mitigate business risks proactively",
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 to-orange-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-slate-800 leading-tight">
                  Let us <span className="text-orange-500">plan</span> your{" "}
                  <span className="text-green-600">SUCCESS</span>!!
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Innovative Business & Project Management Consulting powered by AI.
                  We help businesses across 6 industries achieve breakthrough results.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                  Book Free Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                  View Case Studies
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1644325349124-d1756b79dd42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb258ZW58MHx8fHwxNzU0MjI3ODg1fDA&ixlib=rb-4.1.0&q=85"
                alt="AI Consulting Technology"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              Our AI-Native Services
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Transforming businesses across IT Services, EdTech, FinTech, Healthcare, 
              Hospitality, and Software Development industries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-orange-500">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <service.icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </div>
                  <CardDescription className="text-slate-600">
                    {service.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <Button size="lg" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50">
                Explore All Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-slate-800 mb-8">
            Trusted by Global Organizations
          </h3>
          <div className="flex justify-center items-center space-x-8">
            <Badge variant="outline" className="text-green-600 border-green-600">GDPR Compliant</Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-600">HIPAA Certified</Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-600">ISO 27001</Badge>
          </div>
        </div>
      </section>
    </div>
  );
};

// About Page Component  
const About = () => {
  const values = [
    {
      title: "Collaborative",
      description: "We work as an extension of your team",
      icon: Users,
    },
    {
      title: "Outcomes-focused", 
      description: "Results that matter to your business",
      icon: Target,
    },
    {
      title: "Reliable",
      description: "Consistent delivery and support",
      icon: Shield,
    },
    {
      title: "Excellence",
      description: "Best-in-class solutions and service",
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
                About Orgainse Consulting
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                We are an AI-native consulting firm helping businesses transform 
                and scale through innovative strategies and operational excellence.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-slate-700">Founded in 2019</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-slate-700">Global operations across 7 regions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-slate-700">AI-powered methodologies</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/39/lIZrwvbeRuuzqOoWJUEn_Photoaday_CSD%20%281%20of%201%29-5.jpg?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHw0fHxidXNpbmVzcyUyMHN0cmF0ZWd5fGVufDB8fHx8MTc1NDIyNzg5MXww&ixlib=rb-4.1.0&q=85"
                alt="Business Meeting"
                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-800">Our Mission</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                To democratize access to world-class business consulting through 
                AI-powered solutions, enabling organizations of all sizes to achieve 
                breakthrough performance and sustainable growth.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-800">Our Vision</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                To be the global leader in AI-native consulting, setting the standard 
                for innovation, excellence, and measurable business outcomes across 
                all industries we serve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* C.O.R.E. Values */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              Our C.O.R.E. Values
            </h2>
            <p className="text-xl text-slate-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto p-3 bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <value.icon className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl mb-2">{value.title}</CardTitle>
                  <CardDescription>{value.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Services Page Component
const Services = () => {
  const services = [
    {
      title: "Business Strategy Development",
      description: "AI-powered strategic planning, market analysis, and competitive intelligence to drive informed decision-making and sustainable growth.",
      features: ["Market Research & Analysis", "Competitive Intelligence", "Growth Strategy Planning", "Performance Metrics & KPIs"],
      icon: Target,
      image: "https://images.unsplash.com/photo-1523875194681-bedd468c58bf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxidXNpbmVzcyUyMHN0cmF0ZWd5fGVufDB8fHx8MTc1NDIyNzg5MXww&ixlib=rb-4.1.0&q=85"
    },
    {
      title: "Digital Transformation",
      description: "Comprehensive digitization strategies that modernize operations, enhance customer experience, and drive innovation.",
      features: ["Process Automation", "Cloud Migration", "Digital Customer Experience", "Technology Integration"],
      icon: Zap,
      image: "https://images.unsplash.com/photo-1644329770639-1a20809b82a3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb258ZW58MHx8fHwxNzU0MjI3ODg1fDA&ixlib=rb-4.1.0&q=85"
    },
    {
      title: "Operational Optimization", 
      description: "Streamline processes, eliminate inefficiencies, and maximize productivity through AI-driven insights and lean methodologies.",
      features: ["Process Improvement", "Resource Optimization", "Quality Management", "Cost Reduction Strategies"],
      icon: TrendingUp,
      image: "https://images.unsplash.com/photo-1649406458887-2b6561c36a4d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHw0fHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb258ZW58MHx8fHwxNzU0MjI3ODg1fDA&ixlib=rb-4.1.0&q=85"
    },
    {
      title: "PMaaS (Project Management as a Service)",
      description: "End-to-end project management solutions with dedicated PMs, advanced tools, and proven methodologies.",
      features: ["Dedicated Project Managers", "Project Planning & Execution", "Risk Management", "Stakeholder Communication"],
      icon: Users,
      image: "https://images.unsplash.com/photo-1657727534676-cac1bb160d64?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxBSSUyMGNvbnN1bHRpbmd8ZW58MHx8fHwxNzU0MjI3ODc4fDA&ixlib=rb-4.1.0&q=85"
    },
    {
      title: "Agile & Scrum Coaching",
      description: "Transform your teams with modern agile methodologies, scrum practices, and continuous improvement culture.",
      features: ["Agile Transformation", "Scrum Master Training", "Team Coaching", "Continuous Improvement"],
      icon: Globe,
      image: "https://images.unsplash.com/photo-1644325349124-d1756b79dd42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb258ZW58MHx8fHwxNzU0MjI3ODg1fDA&ixlib=rb-4.1.0&q=85"
    },
    {
      title: "Risk Management",
      description: "Proactive risk identification, assessment, and mitigation strategies to protect and strengthen your business.",
      features: ["Risk Assessment", "Compliance Management", "Business Continuity Planning", "Security Audits"],
      icon: Shield,
      image: "https://images.unsplash.com/photo-1644325349124-d1756b79dd42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb258ZW58MHx8fHwxNzU0MjI3ODg1fDA&ixlib=rb-4.1.0&q=85"
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
            Our Services
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Comprehensive AI-native consulting services designed to transform your business 
            and accelerate growth across six key industries.
          </p>
          <div className="flex justify-center space-x-4">
            <Badge className="bg-orange-100 text-orange-700">IT Services</Badge>
            <Badge className="bg-blue-100 text-blue-700">EdTech</Badge>
            <Badge className="bg-green-100 text-green-700">FinTech</Badge>
            <Badge className="bg-purple-100 text-purple-700">Healthcare</Badge>
            <Badge className="bg-pink-100 text-pink-700">Hospitality</Badge>
            <Badge className="bg-indigo-100 text-indigo-700">Software Dev</Badge>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {services.map((service, index) => (
              <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-orange-100 rounded-lg">
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

                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    Request Proposal
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className={`${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <img
                    src={service.image}
                    alt={service.title}
                    className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
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

// Contact Page Component
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
      alert("Message sent successfully! We'll get back to you soon.");
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 to-orange-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
            Get In Touch
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Ready to transform your business? Let's discuss how our AI-native 
            consulting services can drive your success.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24 hours.
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
                          placeholder="+1 (555) 123-4567"
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
                        placeholder="How can we help you?"
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
                        placeholder="Tell us about your project or requirements..."
                      />
                    </div>

                    <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                      Send Message
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                  Let's Start a Conversation
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                  Whether you're looking to optimize operations, transform digitally, 
                  or scale your business, we're here to help you succeed.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                <Card>
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

                <Card>
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

                <Card>
                  <CardContent className="flex items-center space-x-4 p-6">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Book a Call</h3>
                      <p className="text-slate-600">Schedule a free consultation</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
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
              </div>

              {/* CTA */}
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-bold mb-4">Ready to Get Started?</h3>
                  <p className="mb-6">
                    Book a free consultation call and let's discuss your business goals.
                  </p>
                  <Button variant="secondary" className="bg-white text-orange-600 hover:bg-orange-50">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Free Call
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

// Main App Component
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