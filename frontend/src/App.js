import React, { useState, useEffect, useContext } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Badge } from "./components/ui/badge";
import { Separator } from "./components/ui/separator";
import GoogleCalendarBooking from "./components/GoogleCalendarBooking";
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
  Youtube,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus
} from "lucide-react";
import axios from "axios";

// Regional Pricing and Currency System
const REGION_CONFIG = {
  US: {
    currency: 'USD',
    symbol: '$',
    pppMultiplier: 1.0,
    locale: 'en-US',
    name: 'United States'
  },
  IN: {
    currency: 'INR',
    symbol: '₹',
    pppMultiplier: 5.5, // Adjusted to make Indian prices more eye-catching in thousands (₹1000+ range)
    locale: 'en-IN',
    name: 'India'
  },
  GB: {
    currency: 'GBP',
    symbol: '£',
    pppMultiplier: 0.85, // Slightly lower than US due to economic conditions
    locale: 'en-GB',
    name: 'United Kingdom'
  },
  AE: {
    currency: 'AED',
    symbol: 'AED',
    pppMultiplier: 0.75, // Competitive for UAE market
    locale: 'ar-AE',
    name: 'United Arab Emirates'
  },
  AU: {
    currency: 'AUD',
    symbol: 'A$',
    pppMultiplier: 0.90, // Adjusted for Australian market
    locale: 'en-AU',
    name: 'Australia'
  },
  NZ: {
    currency: 'NZD',
    symbol: 'NZ$',
    pppMultiplier: 0.85, // Competitive for New Zealand market
    locale: 'en-NZ',
    name: 'New Zealand'
  },
  ZA: {
    currency: 'ZAR',
    symbol: 'R',
    pppMultiplier: 0.35, // More affordable for South African market
    locale: 'en-ZA',
    name: 'South Africa'
  },
  EU: {
    currency: 'EUR',
    symbol: '€',
    pppMultiplier: 0.90, // Standard European pricing
    locale: 'en-EU',
    name: 'Europe'
  }
};

// Default region if detection fails
const DEFAULT_REGION = 'US';

// Google Calendar Booking Context
const GoogleCalendarContext = React.createContext();

// Google Calendar Booking Provider
const GoogleCalendarProvider = ({ children }) => {
  const [isGoogleCalendarOpen, setIsGoogleCalendarOpen] = useState(false);
  
  const openGoogleCalendar = () => setIsGoogleCalendarOpen(true);
  const closeGoogleCalendar = () => setIsGoogleCalendarOpen(false);
  
  return (
    <GoogleCalendarContext.Provider value={{
      isGoogleCalendarOpen,
      openGoogleCalendar,
      closeGoogleCalendar
    }}>
      {children}
      <GoogleCalendarBooking 
        isOpen={isGoogleCalendarOpen}
        onClose={closeGoogleCalendar}
      />
    </GoogleCalendarContext.Provider>
  );
};

// Hook to use Google Calendar context
const useGoogleCalendar = () => {
  const context = useContext(GoogleCalendarContext);
  if (!context) {
    throw new Error('useGoogleCalendar must be used within a GoogleCalendarProvider');
  }
  return context;
};

// Regional Pricing Context
const RegionalPricingContext = React.createContext();

// Custom hook for regional pricing
const useRegionalPricing = () => {
  const context = React.useContext(RegionalPricingContext);
  if (!context) {
    throw new Error('useRegionalPricing must be used within a RegionalPricingProvider');
  }
  return context;
};

// Regional Pricing Provider Component
const RegionalPricingProvider = ({ children }) => {
  const [currentRegion, setCurrentRegion] = useState(DEFAULT_REGION);
  const [isLoading, setIsLoading] = useState(true);
  const [userOverride, setUserOverride] = useState(false);

  // Auto-detect user region on component mount
  useEffect(() => {
    const detectRegion = async () => {
      try {
        // Try multiple methods for region detection
        
        // Method 1: Try simple IP geolocation service (free tier)
        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          if (data.country_code) {
            const detectedRegion = mapCountryToRegion(data.country_code);
            if (detectedRegion && !userOverride) {
              setCurrentRegion(detectedRegion);
            }
          }
        } catch (error) {
          console.log('Primary geolocation failed, trying fallback...');
        }

        // Method 2: Fallback to timezone-based detection
        if (currentRegion === DEFAULT_REGION && !userOverride) {
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const regionFromTimezone = mapTimezoneToRegion(timezone);
          if (regionFromTimezone) {
            setCurrentRegion(regionFromTimezone);
          }
        }

      } catch (error) {
        console.log('Region detection failed, using default:', DEFAULT_REGION);
      } finally {
        setIsLoading(false);
      }
    };

    detectRegion();
  }, [userOverride]);

  // Map country codes to our regions
  const mapCountryToRegion = (countryCode) => {
    const mapping = {
      'US': 'US', 'CA': 'US', // North America
      'IN': 'IN', // India
      'GB': 'GB', // UK
      'AE': 'AE', 'SA': 'AE', 'QA': 'AE', // Middle East
      'AU': 'AU', // Australia
      'NZ': 'NZ', // New Zealand
      'ZA': 'ZA', // South Africa
      // European countries
      'DE': 'EU', 'FR': 'EU', 'IT': 'EU', 'ES': 'EU', 'NL': 'EU', 
      'BE': 'EU', 'AT': 'EU', 'PT': 'EU', 'IE': 'EU', 'DK': 'EU',
      'SE': 'EU', 'NO': 'EU', 'FI': 'EU', 'CH': 'EU', 'PL': 'EU'
    };
    return mapping[countryCode] || DEFAULT_REGION;
  };

  // Map timezone to region (fallback method)
  const mapTimezoneToRegion = (timezone) => {
    if (timezone.includes('America')) return 'US';
    if (timezone.includes('India') || timezone.includes('Kolkata')) return 'IN';
    if (timezone.includes('London')) return 'GB';
    if (timezone.includes('Dubai')) return 'AE';
    if (timezone.includes('Australia')) return 'AU';
    if (timezone.includes('Auckland')) return 'NZ';
    if (timezone.includes('Africa')) return 'ZA';
    if (timezone.includes('Europe')) return 'EU';
    return DEFAULT_REGION;
  };

  // Format currency with regional settings
  const formatCurrency = (amount, region = currentRegion) => {
    const config = REGION_CONFIG[region];
    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      return `${config.symbol}${Math.round(amount).toLocaleString()}`;
    }
  };

  // Calculate regional price based on PPP
  const calculateRegionalPrice = (basePrice, region = currentRegion) => {
    const config = REGION_CONFIG[region];
    return Math.round(basePrice * config.pppMultiplier);
  };

  // Get formatted regional price
  const getRegionalPrice = (basePrice) => {
    const adjustedPrice = calculateRegionalPrice(basePrice);
    return formatCurrency(adjustedPrice);
  };

  // Manual region change by user
  const changeRegion = (newRegion) => {
    setCurrentRegion(newRegion);
    setUserOverride(true);
  };

  const value = {
    currentRegion,
    regionConfig: REGION_CONFIG[currentRegion],
    allRegions: REGION_CONFIG,
    isLoading,
    formatCurrency,
    calculateRegionalPrice,
    getRegionalPrice,
    changeRegion,
    userOverride
  };

  return (
    <RegionalPricingContext.Provider value={value}>
      {children}
    </RegionalPricingContext.Provider>
  );
};

// Region Selector Component
const RegionSelector = () => {
  const { currentRegion, allRegions, changeRegion, isLoading } = useRegionalPricing();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-slate-600">
        <Globe className="h-4 w-4 animate-spin" />
        <span>Detecting location...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2 text-sm text-slate-600">
        <Globe className="h-4 w-4" />
        <span>Region:</span>
      </div>
      <select
        value={currentRegion}
        onChange={(e) => changeRegion(e.target.value)}
        className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm focus:border-orange-400 focus:ring-orange-400 focus:outline-none"
      >
        {Object.entries(allRegions).map(([code, config]) => (
          <option key={code} value={code}>
            {config.name} ({config.symbol})
          </option>
        ))}
      </select>
    </div>
  );
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Navigation Component
const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openGoogleCalendar } = useGoogleCalendar();
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
            
            <Button 
              onClick={openGoogleCalendar}
              className="bg-orange-500 hover:bg-orange-600 text-white transform hover:scale-105 transition-all duration-300"
            >
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
                <Button 
                  onClick={openGoogleCalendar}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
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
  const { getRegionalPrice, regionConfig } = useRegionalPricing();
  const { openGoogleCalendar } = useGoogleCalendar();
  
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
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-12 lg:py-16 overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-orange-200 to-yellow-200 rounded-full blur-3xl opacity-30 animate-pulse float-animation"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-green-200 to-blue-200 rounded-full blur-3xl opacity-30 animate-pulse float-animation animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-30 animate-pulse float-animation animation-delay-500"></div>
          <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-30 animate-pulse float-animation animation-delay-1000"></div>
          
          {/* Floating Geometric Shapes */}
          <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-orange-300 rotate-45 animate-spin-slow opacity-40"></div>
          <div className="absolute top-3/4 right-1/4 w-12 h-12 bg-green-300 rounded-full animate-bounce opacity-40"></div>
          <div className="absolute top-1/2 left-1/4 w-6 h-16 bg-yellow-300 rounded-full animate-pulse opacity-40"></div>
          <div className="absolute bottom-1/4 right-1/3 w-10 h-10 bg-purple-300 rotate-12 animate-spin-slow opacity-40"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="animate-fade-in">
              <div className="mb-6">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  <span className="block text-slate-800">Let us </span>
                  <span className="block bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 bg-clip-text text-transparent animate-gradient-text text-5xl lg:text-7xl">
                    plan
                  </span>
                  <span className="block text-slate-800">your </span>
                  <span className="block bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient-text text-5xl lg:text-7xl">
                    SUCCESS!!
                  </span>
                </h1>
              </div>
              
              <div className="relative mb-6">
                <h2 className="text-xl lg:text-2xl text-orange-600 font-bold mb-3">
                  AI-Native Business & Digital Transformation
                </h2>
                <div className="absolute -left-4 top-0 w-2 h-full bg-gradient-to-b from-orange-500 to-green-500 rounded-full animate-pulse"></div>
              </div>
              
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                GPT-powered project management, AI-driven strategy consulting, 
                and intelligent operational optimization for <span className="text-orange-600 font-bold">startups</span> and <span className="text-green-600 font-bold">SMEs</span> 
                across India, USA, UK, UAE, Australia, New Zealand, and South Africa.
              </p>
              
              <p className="text-base text-slate-600 mb-6">
                Transforming businesses with GPT-powered solutions across IT Services, EdTech, FinTech, 
                Healthcare, Hospitality, and Software Development industries.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button className="group relative px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center">
                    Book Free AI Consultation
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button className="group relative px-6 py-3 bg-transparent border-2 border-green-500 text-green-600 font-bold rounded-xl hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
                  <span className="flex items-center justify-center">
                    View Success Stories
                    <Star className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
                  </span>
                </button>
              </div>

              {/* Compact Stats Display */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div 
                    key={index} 
                    className="group relative transform hover:scale-105 transition-all duration-500 animate-fade-in"
                    style={{ animationDelay: `${index * 200 + 1000}ms` }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-xl opacity-20 group-hover:opacity-30 transition-opacity blur-sm`}></div>
                    <div className="relative bg-white/90 backdrop-blur-lg rounded-xl p-4 border border-white/40 hover:border-orange-300 transition-all duration-300 shadow-lg h-24 flex flex-col items-center justify-center text-center">
                      <div className={`text-xl lg:text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent animate-counter mb-1`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-slate-700 font-medium leading-tight max-w-full">{stat.label}</div>
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
                  src="https://images.unsplash.com/photo-1655393001768-d946c97d6fd1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxBSSUyMGFydGlmaWNpYWwlMjBpbnRlbGxpZ2VuY2V8ZW58MHx8fGJsdWV8MTc1NDU4ODI5OHww&ixlib=rb-4.1.0&q=85"
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
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Transforming businesses with GPT-powered solutions across key industries.
            </p>
          </div>

          {/* Compact Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Link to="/services" key={index} className="block">
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
                      
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <span className="text-xs text-orange-600 font-medium group-hover:text-orange-700 transition-colors">
                          Click to learn more →
                        </span>
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              </Link>
            ))}
          </div>

          {/* Compact CTA Section */}
          <div className="text-center mt-10 animate-fade-in">
            <button className="group relative px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center">
                Explore Our AI Arsenal
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
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
            <p className="text-lg text-slate-700 max-w-3xl mx-auto mb-6 leading-relaxed">
              Get exclusive insights, free resources, and expert guidance to transform your business with 
              <span className="text-orange-600 font-bold"> AI-native solutions</span>. Join 2,500+ startup leaders already accelerating their success.
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
                      type="email" 
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-500 focus:border-orange-400 focus:ring-orange-400 h-10"
                      required
                      disabled={isNewsletterLoading}
                    />
                    <button 
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
                      <p className="text-green-600 text-xs text-center font-medium">
                        🎉 Welcome! Check your email for resources.
                      </p>
                    )}
                    {newsletterStatus === "duplicate" && (
                      <p className="text-yellow-600 text-xs text-center font-medium">
                        📧 Already subscribed! Check your email.
                      </p>
                    )}
                    {newsletterStatus === "error" && (
                      <p className="text-red-500 text-xs text-center font-medium">
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
                    onClick={openGoogleCalendar}
                    className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center">
                      Book Free Consultation
                      <Calendar className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
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
              
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                We are an AI-native consulting firm specializing in <span className="text-orange-600 font-bold">GPT-powered project management</span>, 
                intelligent business strategy, and <span className="text-green-600 font-bold">automated operational optimization</span> 
                for startups and SMEs across India, USA, UK, UAE, Australia, New Zealand, and South Africa.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-slate-700 text-sm">Founded in 2025 with <span className="text-blue-600 font-semibold">AI-first approach</span> and started branches in Bangalore, India and Austin, USA in 4 months</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-slate-700 text-sm">Global operations: <span className="text-orange-600 font-semibold">AI project management service</span> across 5 continents (7 countries)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-slate-700 text-sm">AI-powered methodologies with <span className="text-purple-600 font-semibold">GPT implementation roadmap</span> integration</span>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in animation-delay-500">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl blur opacity-60 group-hover:opacity-80 transition duration-1000 animate-pulse"></div>
                <img
                  src="https://images.unsplash.com/photo-1660165458059-57cfb6cc87e5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxBSSUyMGFydGlmaWNpYWwlMjBpbnRlbGxpZ2VuY2V8ZW58MHx8fGJsdWV8MTc1NDU4ODI5OHww&ixlib=rb-4.1.0&q=85"
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

// Revolutionary Services Page with Enhanced Popups and SEO
const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const { openGoogleCalendar } = useGoogleCalendar();

  const services = [
    {
      id: 'ai-project-management',
      title: "AI Project Management Service (PMaaS)",
      description: "Comprehensive AI project management service with GPT-powered SOW auto-generation, intelligent project planning, and automated risk assessment for startups and SMEs across India, USA, UK, UAE, Australia, New Zealand, and South Africa.",
      features: ["GPT-powered Project Planning & SOW Auto-generation", "Automated Risk Assessment & Scenario Modeling", "AI Resource Allocation & Timeline Optimization", "Intelligent Performance Analytics & Reporting"],
      icon: Target,
      image: "https://images.pexels.com/photos/16053029/pexels-photo-16053029.jpeg",
      keywords: "AI project management service, PMaaS for startups, GPT-powered project planning",
      gradient: "from-orange-400 to-red-500",
      detailedInfo: {
        whatItDoes: "Our AI Project Management Service (PMaaS) revolutionizes how you manage projects by leveraging GPT-powered automation. We create intelligent SOWs, automate risk assessments, optimize resource allocation, and provide real-time analytics that increase project success rates by 45%.",
        whyChooseUs: "Unlike traditional project management, our AI-native approach reduces planning time by 60%, eliminates scope creep through intelligent boundary detection, and provides predictive insights that prevent 80% of common project failures before they occur.",
        whatYouGet: "Complete AI-powered project ecosystem including automated project planning, intelligent resource allocation, real-time risk monitoring, GPT-generated documentation, predictive analytics dashboard, and 24/7 AI project assistant.",
        benefits: ["60% reduction in project planning time", "45% increase in project success rates", "80% reduction in scope creep", "Real-time predictive insights", "Automated documentation generation", "24/7 AI project support"],
        industries: ["Software Development", "EdTech", "FinTech", "Healthcare", "Startups", "SMEs"],
        pricing: "Starting from $2,500/month",
        timeline: "2-week setup, immediate results"
      }
    },
    {
      id: 'digital-transformation',
      title: "AI-Native Digital Transformation",
      description: "Complete digital transformation consulting with AI maturity assessment, multi-agent orchestration platforms, and GPT implementation roadmap tailored for EdTech, FinTech, Healthcare, and Software Development industries.",
      features: ["AI Maturity Assessment & Digital Readiness Audit", "Multi-agent Orchestration Platform Setup", "GPT Implementation Roadmap & Integration", "Cloud-First Architecture with AI-Powered Analytics"],
      icon: Zap,
      image: "https://images.unsplash.com/photo-1530825894095-9c184b068fcb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHw0fHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb258ZW58MHx8fGJsdWV8MTc1NDU4ODMwN3ww&ixlib=rb-4.1.0&q=85",
      keywords: "AI-native digital transformation, GPT implementation roadmap, digital transformation UAE SMEs",
      gradient: "from-yellow-400 to-orange-500",
      detailedInfo: {
        whatItDoes: "Transform your entire business operations with our AI-native digital transformation service. We conduct comprehensive AI maturity assessments, design multi-agent orchestration platforms, and create custom GPT implementation roadmaps that digitize and optimize every aspect of your business.",
        whyChooseUs: "Our transformations are 70% faster than traditional approaches because we use AI to design, implement, and optimize simultaneously. We don't just digitize - we intelligentize your operations with AI agents that continuously improve your processes.",
        whatYouGet: "Complete digital ecosystem transformation including AI maturity assessment, custom multi-agent platform, GPT integration roadmap, cloud-first architecture, AI-powered analytics suite, and ongoing optimization support.",
        benefits: ["70% faster transformation timeline", "50% reduction in operational costs", "300% improvement in process efficiency", "AI-powered continuous optimization", "Future-ready scalable architecture", "Real-time business intelligence"],
        industries: ["EdTech", "FinTech", "Healthcare", "Manufacturing", "Retail", "Professional Services"],
        pricing: "Starting from $15,000 (3-6 month engagement)",
        timeline: "1-week assessment, 12-week transformation"
      }
    },
    {
      id: 'operational-optimization',
      title: "AI Operational Optimization", 
      description: "Intelligent operational optimization using AI-driven workflow automation, predictive maintenance agents, and GPT process mining to reduce OPEX by 20% for hospitality, healthcare, and manufacturing SMEs.",
      features: ["AI Workflow Automation & Process Intelligence", "Predictive Maintenance AI Agent & Monitoring", "GPT Process Mining & Bottleneck Detection", "Real-time Performance Analytics & Cost Optimization"],
      icon: TrendingUp,
      image: "https://images.pexels.com/photos/8728559/pexels-photo-8728559.jpeg",
      keywords: "AI operational optimization consulting, reduce OPEX with AI, GPT process mining",
      gradient: "from-green-400 to-emerald-500",
      detailedInfo: {
        whatItDoes: "Optimize your operations with AI agents that continuously monitor, analyze, and improve your business processes. Our system uses GPT-powered process mining to identify bottlenecks, implements predictive maintenance, and automates workflows to reduce operational expenses by up to 35%.",
        whyChooseUs: "Our AI optimization is proactive, not reactive. While others optimize after problems occur, our AI agents predict and prevent operational issues, resulting in 90% fewer disruptions and continuous cost savings that compound over time.",
        whatYouGet: "Comprehensive operational intelligence platform with AI workflow automation, predictive maintenance system, GPT process mining tools, real-time analytics dashboard, automated cost optimization, and performance monitoring suite.",
        benefits: ["35% reduction in operational costs", "90% fewer operational disruptions", "Automated process optimization", "Predictive maintenance alerts", "Real-time performance insights", "Continuous improvement automation"],
        industries: ["Hospitality", "Healthcare", "Manufacturing", "Logistics", "Retail", "Professional Services"],
        pricing: "Starting from $8,000/month",
        timeline: "3-week implementation, immediate optimization"
      }
    },
    {
      id: 'agile-coaching',
      title: "AI Agile & Scrum Coaching",
      description: "Revolutionary agile coaching with GPT-powered Scrum assistance, automated sprint retrospectives, and AI backlog prioritization for enhanced team velocity across UK startups, Australia agile teams, and India software companies.",
      features: ["GPT-Powered Scrum Coaching & Team Mentoring", "Automated Sprint Retrospectives & Analysis", "AI Backlog Prioritization & Story Estimation", "Data-driven Team Performance Analytics"],
      icon: Users,
      image: "https://images.unsplash.com/photo-1585846328761-acbf5a12beea?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxjb25zdWx0aW5nfGVufDB8fHxibHVlfDE3NTQ1ODg0NDR8MA&ixlib=rb-4.1.0&q=85",
      keywords: "AI agile coaching service, GPT-powered Scrum coach, data-driven agile transformation",
      gradient: "from-blue-400 to-indigo-500",
      detailedInfo: {
        whatItDoes: "Supercharge your agile teams with AI-powered Scrum coaching that provides real-time guidance, automated retrospectives, intelligent backlog prioritization, and predictive sprint planning. Our GPT coach works alongside your teams to optimize velocity and delivery quality.",
        whyChooseUs: "Traditional agile coaching is limited by human availability and subjective insights. Our AI coach provides 24/7 support, data-driven recommendations, and objective performance analysis that improves team velocity by 65% while reducing burnout.",
        whatYouGet: "Complete agile acceleration platform including GPT-powered Scrum coach, automated retrospective analysis, AI backlog prioritization engine, sprint planning optimization, team performance analytics, and continuous improvement recommendations.",
        benefits: ["65% improvement in team velocity", "50% reduction in sprint planning time", "24/7 AI coaching availability", "Data-driven performance insights", "Automated administrative tasks", "Predictive delivery forecasting"],
        industries: ["Software Development", "Technology Startups", "Digital Agencies", "Product Teams", "IT Services", "Innovation Labs"],
        pricing: "Starting from $3,500/month per team",
        timeline: "1-week onboarding, immediate velocity improvements"
      }
    },
    {
      id: 'business-strategy',
      title: "AI-Driven Business Strategy Development",
      description: "Advanced business strategy development using automated market intelligence GPT, competitive analysis AI, and scenario planning tools for faster go-to-market strategies across IT Services, EdTech startups, and FinTech SMEs.",
      features: ["Automated Market Intelligence & Competitor Analysis", "AI-Powered Competitive Strategy & Positioning", "Scenario Planning Tools & Market Forecasting", "Growth Strategy Optimization & ROI Modeling"],
      icon: Globe,
      image: "https://images.unsplash.com/photo-1573164574230-db1d5e960238?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxjb25zdWx0aW5nfGVufDB8fHxibHVlfDE3NTQ1ODg0NDR8MA&ixlib=rb-4.1.0&q=85",
      keywords: "AI-driven business strategy consulting, GPT competitive analysis, strategy development India SMEs",
      gradient: "from-purple-400 to-pink-500",
      detailedInfo: {
        whatItDoes: "Develop winning business strategies using AI-powered market intelligence, competitive analysis, and scenario planning. Our GPT-driven approach analyzes thousands of data points to create strategies that are 85% more likely to succeed than traditional consulting approaches.",
        whyChooseUs: "While traditional strategy consulting takes months and relies on historical data, our AI-driven approach delivers real-time insights and predictive strategies in weeks. We analyze 1000x more data points to identify opportunities others miss.",
        whatYouGet: "Comprehensive strategy development suite including automated market intelligence system, AI competitive analysis platform, scenario planning tools, growth optimization roadmap, ROI modeling dashboard, and strategic implementation support.",
        benefits: ["85% higher strategy success rate", "75% faster strategy development", "Real-time market intelligence", "Predictive opportunity identification", "Data-driven decision making", "Continuous strategy optimization"],
        industries: ["IT Services", "EdTech", "FinTech", "SaaS", "E-commerce", "Professional Services"],
        pricing: "Starting from $12,000 (6-8 week engagement)",
        timeline: "2-week analysis, 6-week strategy development"
      }
    },
    {
      id: 'risk-management',
      title: "AI Risk Management & Compliance",
      description: "Comprehensive AI risk management with GPT-based risk co-pilots, automated scenario modeling, and real-time compliance monitoring for fintech SMEs, healthcare organizations, and UAE regulatory compliance requirements.",
      features: ["GPT-Based Risk Assessment & Co-pilot Support", "Automated Scenario Modeling & Stress Testing", "Real-time Compliance Monitoring & Reporting", "Predictive Risk Analytics & Mitigation Planning"],
      icon: Shield,
      image: "https://images.unsplash.com/photo-1497409988347-cbfaac2f0b12?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxhZ2lsZSUyMHNjcnVtfGVufDB8fHxibHVlfDE3NTQ1ODg0Mzl8MA&ixlib=rb-4.1.0&q=85",
      keywords: "AI risk management consulting, GPT-based risk co-pilot, predictive risk analytics SMEs",
      gradient: "from-slate-400 to-slate-600",
      detailedInfo: {
        whatItDoes: "Protect your business with AI-powered risk management that predicts, prevents, and mitigates risks before they impact your operations. Our GPT-based risk co-pilot continuously monitors your business environment and provides real-time risk assessment and compliance monitoring.",
        whyChooseUs: "Traditional risk management is reactive and manual. Our AI approach is predictive and automated, identifying 95% of potential risks before they materialize and ensuring continuous compliance with changing regulations across multiple jurisdictions.",
        whatYouGet: "Complete risk intelligence platform including GPT-based risk co-pilot, automated scenario modeling system, real-time compliance monitoring dashboard, predictive risk analytics, automated reporting suite, and mitigation planning tools.",
        benefits: ["95% early risk detection rate", "80% reduction in compliance violations", "Real-time regulatory updates", "Automated risk reporting", "Predictive risk modeling", "24/7 compliance monitoring"],
        industries: ["FinTech", "Healthcare", "Insurance", "Banking", "Regulated Industries", "Government"],
        pricing: "Starting from $6,500/month",
        timeline: "2-week setup, immediate risk monitoring"
      }
    },
  ];

  const openServicePopup = (service) => {
    setSelectedService(service);
    setIsPopupOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeServicePopup = () => {
    setIsPopupOpen(false);
    setSelectedService(null);
    document.body.style.overflow = 'unset';
  };

  // Service-specific inquiry tracking
  const handleServiceInquiry = async (serviceId, serviceName) => {
    try {
      const inquiryData = {
        service_id: serviceId,
        service_name: serviceName,
        inquiry_type: 'service_interest',
        timestamp: new Date().toISOString(),
        source: 'services_page_popup'
      };

      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/service-inquiry`, inquiryData);
      
      // Redirect to consultation booking with pre-filled service
      window.location.href = `/smart-calendar?service=${encodeURIComponent(serviceName)}`;
    } catch (error) {
      console.error('Error tracking service inquiry:', error);
      // Still redirect even if tracking fails
      window.location.href = `/smart-calendar?service=${encodeURIComponent(serviceName)}`;
    }
  };

  const faqData = [
    {
      question: "What is AI-native consulting and how is it different from traditional consulting?",
      answer: "AI-native consulting integrates artificial intelligence into every aspect of our consulting process, from analysis to implementation. Unlike traditional consulting that relies solely on human expertise, we use GPT-powered tools, automated analysis, and AI-driven insights to deliver faster, more accurate, and continuously optimized solutions. This approach reduces project timelines by 60-70% while improving outcomes."
    },
    {
      question: "How quickly can I see results from AI project management services?",
      answer: "Most clients see immediate improvements within 2 weeks of implementation. Our AI Project Management Service (PMaaS) provides instant benefits like automated project planning, real-time risk assessment, and intelligent resource allocation. Full optimization typically occurs within 4-6 weeks, with 45% improvement in project success rates and 60% reduction in planning time."
    },
    {
      question: "What industries do you serve and what's your success rate?",
      answer: "We serve IT Services, EdTech, FinTech, Healthcare, Hospitality, and Manufacturing across 7 global regions (India, USA, UK, UAE, Australia, New Zealand, South Africa). Our AI-driven approach achieves 85% higher success rates than traditional consulting, with 95% client satisfaction and measurable ROI within 90 days."
    },
    {
      question: "How much do AI consulting services cost and what's the ROI?",
      answer: "Our services start from $2,500/month for AI Project Management to $15,000 for comprehensive Digital Transformation. Most clients achieve 3-5x ROI within 6 months through operational cost reductions (20-35%), improved efficiency (45-70%), and accelerated growth. We offer regional PPP-adjusted pricing to ensure accessibility across all markets."
    },
    {
      question: "Do you provide ongoing support and what does it include?",
      answer: "Yes, all our services include ongoing AI-powered support. This includes 24/7 AI assistant access, continuous system optimization, regular performance analytics, quarterly strategy reviews, and immediate issue resolution. Our AI systems continuously learn and improve your operations even after initial implementation."
    },
    {
      question: "How do you ensure data security and compliance in AI implementations?",
      answer: "We maintain enterprise-grade security with end-to-end encryption, compliance with GDPR, SOC 2, and regional data protection laws. Our AI Risk Management service provides real-time compliance monitoring, automated reporting, and predictive risk assessment with 95% early detection rate for potential security issues."
    },
    {
      question: "Can your AI solutions integrate with existing business systems?",
      answer: "Absolutely. Our AI solutions are designed for seamless integration with existing CRM, ERP, project management, and communication systems. We support 200+ popular business tools and can create custom integrations. Most integrations are completed within 1-2 weeks with zero downtime."
    },
    {
      question: "What makes Orgainse different from other AI consulting firms?",
      answer: "We're the only truly AI-native consulting firm that uses GPT-powered automation in every service delivery aspect. While others offer AI consulting, we ARE AI consulting - using autonomous agents, predictive analytics, and continuous optimization. This results in 60-70% faster delivery, 85% higher success rates, and ongoing value creation."
    }
  ];

  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen">
      {/* Revolutionary Hero Section with SEO */}
      <section className="relative bg-gradient-to-br from-slate-50 via-orange-50 to-green-50 py-12 lg:py-16 overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-orange-200 to-yellow-200 rounded-full blur-3xl animate-pulse float-animation will-change-transform"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-green-200 to-blue-200 rounded-full blur-3xl animate-pulse float-animation animation-delay-2000 will-change-transform"></div>
          <div className="absolute top-1/4 left-1/3 w-6 h-16 bg-yellow-300 rounded-full animate-pulse opacity-40"></div>
          <div className="absolute bottom-1/4 right-1/3 w-8 h-8 bg-orange-300 rotate-45 animate-spin-slow opacity-40"></div>
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
            <span className="text-purple-600 font-bold">AI-driven strategy</span> across six key industries and seven global regions.
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
      <section className="py-12 bg-gradient-to-br from-white via-slate-50 to-orange-50 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, #f97316 0%, transparent 40%), radial-gradient(circle at 80% 80%, #10b981 0%, transparent 40%)`
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="text-slate-800">Our </span>
              <span className="bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                AI Arsenal
              </span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Cutting-edge AI solutions designed to transform your business operations and accelerate growth
            </p>
          </div>

          {/* Enhanced Services Grid with Popup Functionality */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="group relative animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 150}ms` }}
                onMouseEnter={() => setSelectedService(service)}
                onMouseLeave={() => setSelectedService(null)}
                onClick={() => openServicePopup(service)}
              >
                {/* Card Glow Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${service.gradient} rounded-3xl blur opacity-25 group-hover:opacity-60 transition duration-1000`}></div>
                
                {/* Main Card */}
                <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 border border-gray-100 overflow-hidden h-full flex flex-col">
                  
                  {/* Service Image */}
                  <div className="relative mb-6 overflow-hidden rounded-2xl">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                        <ExternalLink className="h-4 w-4 text-orange-600" />
                      </div>
                    </div>
                  </div>

                  {/* Icon and Title */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${service.gradient} shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <service.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors leading-tight">
                        {service.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 leading-relaxed mb-6 flex-1 text-sm group-hover:text-slate-700 transition-colors">
                    {service.description.substring(0, 150)}...
                  </p>

                  {/* Features List */}
                  <div className="space-y-2 mb-6">
                    {service.features.slice(0, 3).map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-slate-600 leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Hover Overlay with Action Buttons */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-3xl flex items-end justify-center pb-8">
                    <div className="text-center transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                      <h4 className="text-white font-bold text-lg mb-2">Learn More</h4>
                      <p className="text-white/90 text-sm mb-4 px-4">
                        Discover detailed benefits, pricing, and how this service transforms your business
                      </p>
                      <button 
                        className="bg-white text-slate-800 px-6 py-2 rounded-lg font-semibold hover:bg-orange-100 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          openServicePopup(service);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    className={`w-full group/btn relative px-6 py-3 bg-gradient-to-r ${service.gradient} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openServicePopup(service);
                    }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${service.gradient.split(' ').reverse().join(' ')} opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300`}></div>
                    <span className="relative z-10 flex items-center justify-center text-sm">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Service Detail Popup Modal */}
          {isPopupOpen && selectedService && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
                <div className="relative p-8">
                  {/* Close Button */}
                  <button 
                    onClick={closeServicePopup}
                    className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6 text-slate-600" />
                  </button>

                  {/* Header */}
                  <div className="flex items-start space-x-6 mb-8">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${selectedService.gradient} shadow-xl`}>
                      <selectedService.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-slate-800 mb-3">
                        {selectedService.title}
                      </h2>
                      <p className="text-slate-600 text-lg">
                        {selectedService.description}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Information Sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* What It Does */}
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-orange-600" />
                        What This Service Does
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {selectedService.detailedInfo.whatItDoes}
                      </p>
                    </div>

                    {/* Why Choose Us */}
                    <div className="bg-orange-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                        <Award className="h-5 w-5 mr-2 text-orange-600" />
                        Why Choose Orgainse
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {selectedService.detailedInfo.whyChooseUs}
                      </p>
                    </div>

                    {/* What You Get */}
                    <div className="bg-green-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                        What You Get
                      </h3>
                      <p className="text-slate-600 leading-relaxed mb-4">
                        {selectedService.detailedInfo.whatYouGet}
                      </p>
                    </div>

                    {/* Key Benefits */}
                    <div className="bg-blue-50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                        Key Benefits
                      </h3>
                      <ul className="space-y-2">
                        {selectedService.detailedInfo.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-600 text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Pricing and Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl">
                      <h4 className="font-bold text-slate-800 mb-2">Investment</h4>
                      <p className="text-2xl font-bold text-orange-600">{selectedService.detailedInfo.pricing}</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                      <h4 className="font-bold text-slate-800 mb-2">Timeline</h4>
                      <p className="text-lg font-semibold text-green-600">{selectedService.detailedInfo.timeline}</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                      <h4 className="font-bold text-slate-800 mb-2">Industries</h4>
                      <p className="text-sm text-slate-600">{selectedService.detailedInfo.industries.join(', ')}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={openGoogleCalendar}
                      className={`flex-1 bg-gradient-to-r ${selectedService.gradient} text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                    >
                      Book Free Consultation
                    </button>
                    <button 
                      onClick={closeServicePopup}
                      className="flex-1 bg-slate-100 text-slate-700 px-8 py-4 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-16 bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Get answers to the most common questions about our AI-native consulting services
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {faqData.map((faq, index) => (
                <div key={index} className="border border-slate-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left p-6 hover:bg-slate-50 transition-colors flex items-center justify-between"
                  >
                    <h3 className="text-lg font-semibold text-slate-800 pr-4">
                      {faq.question}
                    </h3>
                    {openFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-orange-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6 animate-fade-in">
                      <p className="text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-10 animate-fade-in" style={{ animationDelay: '1000ms' }}>
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                Ready to Transform Your Business with AI?
              </h3>
              <p className="text-slate-600 mb-4 text-base">
                Get a personalized consultation and discover how our AI-native solutions can accelerate your growth
              </p>
              <button className="group relative px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center">
                  Start Your AI Journey
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
      <section className="relative bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 py-12 lg:py-16 overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl animate-pulse float-animation will-change-transform"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl animate-pulse float-animation animation-delay-2000 will-change-transform"></div>
          <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-blue-300 rotate-45 animate-spin-slow opacity-60"></div>
          <div className="absolute bottom-1/3 right-1/4 w-6 h-16 bg-purple-300 rounded-full animate-pulse opacity-50"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-in">
          <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-slate-800">Contact </span>
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-text">
              Orgainse
            </span>
            <br />
            <span className="text-slate-800">Consulting</span>
          </h1>
          
          <h2 className="text-2xl lg:text-3xl text-blue-600 font-bold mb-6">
            Get Your Free AI Consultation & GPT-Powered Strategy Session
          </h2>
          
          <p className="text-xl text-slate-700 max-w-4xl mx-auto mb-8 leading-relaxed">
            Ready to transform your business with <span className="text-orange-600 font-bold">AI-native consulting</span>? Let's discuss how our 
            <span className="text-green-600 font-bold"> GPT-powered solutions</span> can drive your success across 
            <span className="text-purple-600 font-bold"> project management</span>, digital transformation, 
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

// AI Assessment Tool Component
const AIAssessmentTool = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { openGoogleCalendar } = useGoogleCalendar();

  // Assessment questions with scoring
  const questions = [
    {
      id: 'ai_readiness',
      title: 'AI Readiness & Current State',
      question: 'How would you describe your organization\'s current AI adoption level?',
      options: [
        { text: 'No AI implementation - completely traditional processes', score: 1 },
        { text: 'Aware of AI potential but no concrete plans', score: 3 },
        { text: 'Basic automation tools in use (Excel macros, simple workflows)', score: 5 },
        { text: 'Some AI tools implemented (chatbots, basic analytics)', score: 7 },
        { text: 'Advanced AI integration across multiple departments', score: 9 },
        { text: 'AI-native organization with comprehensive AI strategy', score: 10 }
      ]
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
        { text: 'AI-powered data management with predictive analytics', score: 10 }
      ]
    },
    {
      id: 'team_skills',
      title: 'Team Capabilities & Skills',
      question: 'What is your team\'s current AI and technology skill level?',
      options: [
        { text: 'Limited technical skills - primarily traditional business roles', score: 1 },
        { text: 'Basic computer literacy with willingness to learn', score: 3 },
        { text: 'Some team members with technical backgrounds', score: 5 },
        { text: 'Dedicated IT/tech team with AI awareness', score: 7 },
        { text: 'AI specialists and data scientists on staff', score: 9 },
        { text: 'AI-first organization with comprehensive AI expertise', score: 10 }
      ]
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
        { text: 'Enterprise-level budget with dedicated AI transformation fund', score: 10 }
      ]
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
        { text: 'Leadership views AI as core competitive advantage', score: 10 }
      ]
    }
  ];

  const handleUserInfoChange = (field, value) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleResponse = (questionId, option) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        answer: option.text,
        score: option.score
      }
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitAssessment = async () => {
    setIsLoading(true);
    
    try {
      // Prepare responses for API
      const formattedResponses = Object.entries(responses).map(([questionId, response]) => ({
        question_id: questionId,
        answer: response.answer,
        score: response.score
      }));

      const assessmentData = {
        ...userInfo,
        responses: formattedResponses
      };

      const response = await axios.post(`${API}/ai-assessment`, assessmentData);
      
      if (response.status === 200) {
        setResults(response.data);
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Assessment submission failed:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'AI Advanced';
    if (score >= 60) return 'AI Ready';
    if (score >= 40) return 'AI Developing';
    return 'AI Beginner';
  };

  // Results View
  if (isSubmitted && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                Your AI Readiness Report
              </span>
            </h1>
            <p className="text-lg text-slate-600">
              Based on your responses, here's your personalized AI transformation roadmap
            </p>
          </div>

          {/* Score Display */}
          <div className="group relative animate-fade-in mb-10" style={{ animationDelay: '200ms' }}>
            <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-green-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="text-center p-8">
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r ${getScoreColor(results.ai_maturity_score)} mb-4 mx-auto`}>
                  <span className="text-4xl font-bold text-white">
                    {results.ai_maturity_score}
                  </span>
                </div>
                <CardTitle className="text-2xl mb-2">
                  AI Maturity Score: {getScoreLabel(results.ai_maturity_score)}
                </CardTitle>
                <CardDescription className="text-lg">
                  You scored {results.ai_maturity_score} out of 100
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Recommendations */}
          <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
              Personalized Recommendations
            </h2>
            <div className="grid gap-4">
              {results.recommendations.map((recommendation, index) => (
                <div 
                  key={index}
                  className="group relative"
                  style={{ animationDelay: `${600 + index * 100}ms` }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-green-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                  <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                    <CardHeader className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-orange-600" />
                        </div>
                        <CardDescription className="text-slate-700 leading-relaxed">
                          {recommendation}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps CTA */}
          <div className="text-center mt-10 animate-fade-in" style={{ animationDelay: '800ms' }}>
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-4 text-slate-800">
                Ready to Transform Your Business?
              </h3>
              <p className="text-slate-600 mb-6">
                Get a free consultation to discuss how we can help implement these recommendations
              </p>
              <button 
                onClick={() => window.location.href = '/contact'}
                className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center">
                  Book Free Consultation
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
              AI Readiness Assessment
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover your organization's AI maturity level and get a personalized transformation roadmap in just 5 minutes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Progress</span>
            <span className="text-sm text-slate-600">
              {currentStep === 0 ? 'User Info' : `Question ${currentStep}/${questions.length}`}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep) / (questions.length + 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* User Information Step */}
        {currentStep === 0 && (
          <div className="group relative animate-fade-in">
            <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-green-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl mb-4 text-center">
                  Let's Get Started
                </CardTitle>
                <CardDescription className="text-center mb-6">
                  Please provide your information to receive personalized recommendations
                </CardDescription>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      value={userInfo.name}
                      onChange={(e) => handleUserInfoChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-slate-50 border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => handleUserInfoChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      className="bg-slate-50 border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Name *
                    </label>
                    <Input
                      value={userInfo.company}
                      onChange={(e) => handleUserInfoChange('company', e.target.value)}
                      placeholder="Enter your company name"
                      className="bg-slate-50 border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <Input
                      value={userInfo.phone}
                      onChange={(e) => handleUserInfoChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      className="bg-slate-50 border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleNext}
                    disabled={!userInfo.name || !userInfo.email || !userInfo.company}
                    className="group relative px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center">
                      Start Assessment
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Question Steps */}
        {currentStep > 0 && currentStep <= questions.length && (
          <div className="group relative animate-fade-in">
            <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-green-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="p-8">
                <div className="text-center mb-6">
                  <Badge className="bg-orange-100 text-orange-700 mb-4">
                    {questions[currentStep - 1].title}
                  </Badge>
                  <CardTitle className="text-2xl mb-4">
                    {questions[currentStep - 1].question}
                  </CardTitle>
                  <CardDescription>
                    Select the option that best describes your organization
                  </CardDescription>
                </div>

                <div className="space-y-3">
                  {questions[currentStep - 1].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleResponse(questions[currentStep - 1].id, option)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                        responses[questions[currentStep - 1].id]?.answer === option.text
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-25'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          responses[questions[currentStep - 1].id]?.answer === option.text
                            ? 'border-orange-500 bg-orange-500'
                            : 'border-slate-300'
                        }`}>
                          {responses[questions[currentStep - 1].id]?.answer === option.text && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                        <span className="flex-1 text-slate-700">{option.text}</span>
                        <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {option.score}/10
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={handlePrevious}
                    className="px-6 py-3 border-2 border-slate-300 text-slate-600 font-medium rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-300"
                  >
                    Previous
                  </button>
                  
                  {currentStep === questions.length ? (
                    <button
                      onClick={submitAssessment}
                      disabled={!responses[questions[currentStep - 1].id] || isLoading}
                      className="group relative px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10 flex items-center justify-center">
                        {isLoading ? 'Analyzing...' : 'Get My Results'}
                        {!isLoading && <Target className="ml-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      disabled={!responses[questions[currentStep - 1].id]}
                      className="group relative px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10 flex items-center justify-center">
                        Next Question
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  )}
                </div>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// ROI Calculator Tool Component
const ROICalculator = () => {
  const { getRegionalPrice, formatCurrency: formatRegionalCurrency, regionConfig } = useRegionalPricing();
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    phone: '',
    industry: '',
    company_size: '',
    current_project_cost: '',
    project_duration_months: '',
    current_efficiency_rating: 5,
    desired_services: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Industry options
  const industries = [
    'IT Services & Software Development',
    'EdTech & Education',
    'FinTech & Financial Services',
    'Healthcare & MedTech',
    'Hospitality & Tourism',
    'Manufacturing',
    'E-commerce & Retail',
    'Consulting Services',
    'Other'
  ];

  // Company size options
  const companySizes = [
    '1-10',
    '11-50',
    '51-200',
    '200+'
  ];

  // Service options
  const serviceOptions = [
    'AI Project Management',
    'Digital Transformation',
    'Operational Optimization',
    'Business Strategy Development',
    'Agile & Scrum Coaching',
    'Risk Management & Compliance'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      desired_services: prev.desired_services.includes(service)
        ? prev.desired_services.filter(s => s !== service)
        : [...prev.desired_services, service]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const calculationData = {
        ...formData,
        current_project_cost: parseFloat(formData.current_project_cost),
        project_duration_months: parseInt(formData.project_duration_months),
        current_efficiency_rating: parseInt(formData.current_efficiency_rating)
      };

      const response = await axios.post(`${API}/roi-calculator`, calculationData);
      
      if (response.status === 200) {
        setResults(response.data);
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('ROI calculation failed:', error);
      alert('Failed to calculate ROI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return formatRegionalCurrency(amount);
  };

  const getROIColor = (roi) => {
    if (roi >= 300) return 'from-green-500 to-emerald-600';
    if (roi >= 200) return 'from-blue-500 to-green-500';
    if (roi >= 100) return 'from-yellow-500 to-blue-500';
    return 'from-orange-500 to-yellow-500';
  };

  // Results View
  if (isSubmitted && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                Your ROI Analysis Report
              </span>
            </h1>
            <p className="text-lg text-slate-600">
              Based on your business metrics, here's your potential return on investment
            </p>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* ROI Percentage */}
            <div className="group relative animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="absolute -inset-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="text-center p-6">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${getROIColor(results.roi_percentage)} mb-3 mx-auto`}>
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg mb-1">ROI Percentage</CardTitle>
                  <CardDescription className="text-2xl font-bold text-green-600">
                    {results.roi_percentage.toFixed(0)}%
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Potential Savings */}
            <div className="group relative animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-green-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-green-500 mb-3 mx-auto">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg mb-1">Annual Savings</CardTitle>
                  <CardDescription className="text-2xl font-bold text-blue-600">
                    {formatCurrency(results.potential_savings)}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Payback Period */}
            <div className="group relative animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-blue-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mb-3 mx-auto">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg mb-1">Payback Period</CardTitle>
                  <CardDescription className="text-2xl font-bold text-purple-600">
                    {results.payback_period_months} months
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Investment */}
            <div className="group relative animate-fade-in" style={{ animationDelay: '500ms' }}>
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-red-500 mb-3 mx-auto">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg mb-1">Investment</CardTitle>
                  <CardDescription className="text-2xl font-bold text-orange-600">
                    {formatCurrency(results.estimated_project_cost)}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Recommended Services */}
          <div className="animate-fade-in mb-10" style={{ animationDelay: '600ms' }}>
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
              Recommended Services for Your Business
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {results.recommended_services.map((service, index) => (
                <div 
                  key={index}
                  className="group relative"
                  style={{ animationDelay: `${700 + index * 100}ms` }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-green-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                  <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                    <CardHeader className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <CardTitle className="text-lg text-slate-800">
                          {service.name}
                        </CardTitle>
                        <Badge className="bg-green-100 text-green-700">
                          {service.duration}
                        </Badge>
                      </div>
                      <CardDescription className="text-slate-700 mb-4 leading-relaxed">
                        {service.description}
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-orange-600">
                          {formatCurrency(service.price)}
                        </span>
                        <div className="flex items-center text-sm text-slate-600">
                          <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                          ROI Focused
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '900ms' }}>
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-4 text-slate-800">
                Ready to Achieve These Results?
              </h3>
              <p className="text-slate-600 mb-6">
                Let's discuss how we can help you implement these solutions and achieve your ROI goals
              </p>
              <button 
                onClick={() => window.location.href = '/contact'}
                className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center">
                  Schedule Strategy Session
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
              ROI Calculator
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-4">
            Calculate your potential return on investment from AI transformation and digital optimization services
          </p>
          <div className="flex justify-center">
            <RegionSelector />
          </div>
        </div>

        {/* ROI Form */}
        <div className="group relative animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-green-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl mb-4 text-center">
                Business Information
              </CardTitle>
              <CardDescription className="text-center mb-6">
                Provide your business details to get accurate ROI calculations
              </CardDescription>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Name *
                    </label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      placeholder="Enter your company name"
                      className="bg-slate-50 border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      className="bg-slate-50 border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      className="bg-slate-50 border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Industry *
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-orange-400 focus:ring-orange-400 focus:outline-none"
                      required
                    >
                      <option value="">Select your industry</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Business Metrics */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Business Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company Size *
                      </label>
                      <select
                        value={formData.company_size}
                        onChange={(e) => handleInputChange('company_size', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-orange-400 focus:ring-orange-400 focus:outline-none"
                        required
                      >
                        <option value="">Select company size</option>
                        {companySizes.map((size) => (
                          <option key={size} value={size}>{size} employees</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Current Project Cost ($) *
                      </label>
                      <Input
                        type="number"
                        value={formData.current_project_cost}
                        onChange={(e) => handleInputChange('current_project_cost', e.target.value)}
                        placeholder="50000"
                        className="bg-slate-50 border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                        required
                        min="1000"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Project Duration (Months) *
                    </label>
                    <Input
                      type="number"
                      value={formData.project_duration_months}
                      onChange={(e) => handleInputChange('project_duration_months', e.target.value)}
                      placeholder="6"
                      className="bg-slate-50 border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                      required
                      min="1"
                      max="36"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Current Efficiency Rating (1-10)
                    </label>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-slate-600">1</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.current_efficiency_rating}
                        onChange={(e) => handleInputChange('current_efficiency_rating', e.target.value)}
                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #f97316 0%, #f97316 ${(formData.current_efficiency_rating - 1) * 11.11}%, #e2e8f0 ${(formData.current_efficiency_rating - 1) * 11.11}%, #e2e8f0 100%)`
                        }}
                      />
                      <span className="text-sm text-slate-600">10</span>
                      <Badge className="bg-orange-100 text-orange-700 ml-2">
                        {formData.current_efficiency_rating}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Desired Services */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Services of Interest</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {serviceOptions.map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => handleServiceToggle(service)}
                        className={`p-3 rounded-lg border-2 text-left transition-all duration-300 ${
                          formData.desired_services.includes(service)
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-25 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded border-2 ${
                            formData.desired_services.includes(service)
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-slate-300'
                          }`}>
                            {formData.desired_services.includes(service) && (
                              <CheckCircle className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm font-medium">{service}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <button
                    type="submit"
                    disabled={isLoading || !formData.company_name || !formData.email || !formData.industry || !formData.company_size || !formData.current_project_cost || !formData.project_duration_months}
                    className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center">
                      {isLoading ? 'Calculating...' : 'Calculate My ROI'}
                      {!isLoading && <TrendingUp className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />}
                    </span>
                  </button>
                </div>
              </form>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Smart Calendar Component
const SmartCalendar = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service_type: '',
    preferred_datetime: '',
    timezone: 'America/New_York',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  // Service types
  const serviceTypes = [
    'AI Project Management Service (PMaaS)',
    'Digital Transformation Consulting',
    'AI Operational Optimization',
    'Business Strategy Development',
    'Agile & Scrum Coaching',
    'Risk Management & Compliance',
    'General Consultation'
  ];

  // Timezone options
  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
    { value: 'Pacific/Auckland', label: 'Auckland (NZDT)' }
  ];

  // Available time slots for next 14 days (excluding weekends)
  const generateTimeSlots = () => {
    const slots = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Business hours: 9 AM - 5 PM
      const businessHours = [
        '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
      ];
      
      businessHours.forEach(hour => {
        const datetime = new Date(date);
        const [hours, minutes] = hour.split(':');
        datetime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        slots.push({
          datetime: datetime.toISOString(),
          display: `${date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })} at ${hour}`,
          available: Math.random() > 0.3 // 70% availability simulation
        });
      });
    }
    
    return slots.filter(slot => slot.available);
  };

  const [availableSlots] = useState(generateTimeSlots());

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const bookingData = {
        ...formData,
        preferred_datetime: new Date(formData.preferred_datetime).toISOString()
      };

      const response = await axios.post(`${API}/book-consultation`, bookingData);
      
      if (response.status === 200) {
        setBookingResult(response.data);
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to book consultation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Success View
  if (isSubmitted && bookingResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Success Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 mb-6 mx-auto">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                Consultation Booked Successfully!
              </span>
            </h1>
            <p className="text-lg text-slate-600">
              We're excited to discuss your AI transformation journey
            </p>
          </div>

          {/* Booking Details */}
          <div className="group relative animate-fade-in mb-10" style={{ animationDelay: '200ms' }}>
            <div className="absolute -inset-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl mb-6 text-center text-slate-800">
                  Booking Confirmation
                </CardTitle>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Name</label>
                      <p className="text-lg font-semibold text-slate-800">{bookingResult.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Email</label>
                      <p className="text-lg font-semibold text-slate-800">{bookingResult.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Service Type</label>
                      <p className="text-lg font-semibold text-slate-800">{bookingResult.service_type}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Date & Time</label>
                      <p className="text-lg font-semibold text-slate-800">
                        {new Date(bookingResult.preferred_datetime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}<br />
                        {new Date(bookingResult.preferred_datetime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Timezone</label>
                      <p className="text-lg font-semibold text-slate-800">
                        {timezones.find(tz => tz.value === bookingResult.timezone)?.label || bookingResult.timezone}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Status</label>
                      <Badge className="bg-green-100 text-green-700">
                        {bookingResult.status || 'Confirmed'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {bookingResult.message && (
                  <div className="mt-6">
                    <label className="text-sm font-medium text-slate-600">Message</label>
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-lg mt-1">
                      {bookingResult.message}
                    </p>
                  </div>
                )}
              </CardHeader>
            </Card>
          </div>

          {/* Next Steps */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-4 text-slate-800">
                What Happens Next?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mb-3">
                    <Mail className="h-6 w-6 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-2">Email Confirmation</h4>
                  <p className="text-sm text-slate-600">You'll receive a detailed confirmation email with meeting link</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-2">Calendar Invite</h4>
                  <p className="text-sm text-slate-600">Meeting invite will be sent to your calendar</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-2">Expert Consultation</h4>
                  <p className="text-sm text-slate-600">Meet with our AI transformation specialists</p>
                </div>
              </div>
              <p className="text-slate-600 mb-6">
                Have questions? Contact us at <strong>info@orgainse.com</strong> or call <strong>+91-9740384683</strong>
              </p>
              <button 
                onClick={() => window.location.href = '/'}
                className="group relative px-6 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center">
                  Back to Home
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
              Book Your AI Consultation
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Schedule a free 30-minute consultation with our AI transformation experts. 
            Discuss your challenges and discover how AI can accelerate your business growth.
          </p>
        </div>

        {/* Booking Form */}
        <div className="group relative animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-green-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl mb-4 text-center">
                Consultation Details
              </CardTitle>
              <CardDescription className="text-center mb-6">
                Fill in your details and select your preferred time slot
              </CardDescription>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-slate-50 border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      className="bg-slate-50 border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      className="bg-slate-50 border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Name (Optional)
                    </label>
                    <Input
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Enter your company name"
                      className="bg-slate-50 border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                </div>

                {/* Service and Scheduling */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Service Type *
                  </label>
                  <select
                    value={formData.service_type}
                    onChange={(e) => handleInputChange('service_type', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-orange-400 focus:ring-orange-400 focus:outline-none"
                    required
                  >
                    <option value="">Select service type</option>
                    {serviceTypes.map((service) => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Preferred Date & Time *
                    </label>
                    <select
                      value={formData.preferred_datetime}
                      onChange={(e) => handleInputChange('preferred_datetime', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-orange-400 focus:ring-orange-400 focus:outline-none"
                      required
                    >
                      <option value="">Select date and time</option>
                      {availableSlots.map((slot, index) => (
                        <option key={index} value={slot.datetime}>
                          {slot.display}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Timezone *
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-orange-400 focus:ring-orange-400 focus:outline-none"
                      required
                    >
                      {timezones.map((tz) => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Additional Message (Optional)
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Tell us about your specific needs, challenges, or questions..."
                    className="bg-slate-50 border-slate-200 focus:border-orange-400 focus:ring-orange-400 min-h-[100px]"
                    rows="4"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <button
                    type="submit"
                    disabled={isLoading || !formData.name || !formData.email || !formData.service_type || !formData.preferred_datetime}
                    className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center">
                      {isLoading ? 'Booking...' : 'Book Free Consultation'}
                      {!isLoading && <Calendar className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />}
                    </span>
                  </button>
                </div>
              </form>

              {/* Benefits Section */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
                  What You'll Get From This Consultation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 mb-2">
                      <Brain className="h-5 w-5 text-orange-600" />
                    </div>
                    <p className="text-sm text-slate-700 font-medium">AI Readiness Assessment</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 mb-2">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-sm text-slate-700 font-medium">Custom Strategy Roadmap</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mb-2">
                      <Award className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-slate-700 font-medium">ROI Projections</p>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Main App Component with SEO Meta Tags
function App() {
  return (
    <div className="App">
      <RegionalPricingProvider>
        <BrowserRouter>
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/ai-assessment" element={<AIAssessmentTool />} />
              <Route path="/roi-calculator" element={<ROICalculator />} />
              <Route path="/smart-calendar" element={<SmartCalendar />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </RegionalPricingProvider>
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