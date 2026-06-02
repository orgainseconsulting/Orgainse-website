import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { api } from "../lib/api";
import SEOHead from "../components/SEOHead";
import { useCalendly } from "../context/CalendlyContext";

const Contact = () => {
  const { openCalendly } = useCalendly();
  const location = useLocation();
  const queryParams = React.useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const isOrqyneInquiry = queryParams.get("product") === "orqyne";

  const initialSubject = React.useMemo(() => {
    if (isOrqyneInquiry) {
      const tier = queryParams.get("tier");
      const cockpit = queryParams.get("cockpit");
      const cockpitMap = { it: "IT Services & Software", canvas: "Canvas", rcm: "US Healthcare Analytics" };
      const tierStr = tier ? ` · ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier` : "";
      const cockpitStr = cockpit && cockpitMap[cockpit] ? ` · ${cockpitMap[cockpit]} cockpit` : "";
      return `ORQYNE Product Inquiry${tierStr}${cockpitStr}`;
    }
    return "";
  }, [isOrqyneInquiry, queryParams]);

  const initialMessage = React.useMemo(() => {
    if (isOrqyneInquiry) {
      return "I'm interested in ORQYNE — your AI Project Management as a Service product. Please share a personalised demo, ROI estimate, and the right tier for my team.";
    }
    return "";
  }, [isOrqyneInquiry]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: initialSubject,
    message: initialMessage,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(""); // "", "success", "error"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("");
    try {
      await api.contact({
        leadType: isOrqyneInquiry ? "Product Inquiry (ORQYNE)" : "Contact Inquiry",
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        subject: formData.subject,
        message: formData.message,
      });
      toast.success("Message sent! We'll respond within 24 hours.");
      setSubmitStatus("success");
      setFormData({ name: "", email: "", phone: "", company: "", subject: "", message: "" });
    } catch (err) {
      console.error("Contact submit failed:", err);
      toast.error(err.message || "Failed to send message. Please try again.");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
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
      title: "Phone — India (HQ)",
      description: "Direct consultation with our specialists",
      details: ["+91 97403 84683", "+91 97403 94863"],
      icon: Phone,
      gradient: "from-green-400 to-emerald-500"
    },
    {
      title: "Email Support",
      description: "24/7 support and consultation",
      details: ["info@orgainse.com", "support@orgainse.com"],
      icon: Mail,
      gradient: "from-blue-400 to-indigo-500"
    },
    {
      title: "Book AI Consultation",
      description: "Schedule your free strategy session",
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
          
          <p className="text-xl text-slate-700 max-w-4xl mx-auto mb-8 leading-relaxed text-justify">
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
          {/* Enhanced Header Section */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Let's Start Your AI Transformation
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-5xl mx-auto leading-relaxed text-justify">
              Whether you're looking to implement <span className="font-bold text-blue-600">AI project management</span>, 
              optimize operations with <span className="font-bold text-purple-600">GPT-powered solutions</span>, 
              or accelerate <span className="font-bold text-orange-600">digital transformation</span>, we're here to help you succeed 
              with our AI-native approach across India, USA, UK, UAE, Australia, New Zealand, and South Africa.
            </p>
          </div>

          {/* Main Contact Section - Form + Contact Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
            {/* Enhanced Contact Form */}
            <div className="animate-fade-in">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                
                <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden h-full">
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
                    {submitStatus === "success" ? (
                      <div data-testid="contact-success-message" className="text-center py-12">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Message Sent!</h3>
                        <p className="text-slate-600 mb-6">
                          Thanks for reaching out. We'll respond within 24 hours with a customized
                          AI consultation plan.
                        </p>
                        <button
                          type="button"
                          onClick={() => setSubmitStatus("")}
                          className="text-blue-600 underline text-sm"
                        >
                          Send another message
                        </button>
                      </div>
                    ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-slate-700">Name *</label>
                          <Input
                            data-testid="contact-name-input"
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
                            data-testid="contact-email-input"
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
                            data-testid="contact-phone-input"
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
                            data-testid="contact-company-input"
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
                          data-testid="contact-subject-input"
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
                          data-testid="contact-message-input"
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
                        data-testid="contact-submit-btn"
                        type="submit"
                        disabled={isSubmitting}
                        className="group w-full relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative z-10 flex items-center justify-center text-lg">
                          {isSubmitting ? "Sending..." : "Send Message & Get Consultation"}
                          {!isSubmitting && <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />}
                        </span>
                      </button>
                    </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Methods Grid */}
            <div className="space-y-6 animate-fade-in animation-delay-300">
              {/* Phone Card */}
              <div className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                
                <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-3xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-4 bg-white rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <Phone className="h-8 w-8 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Phone — India (HQ)</h3>
                        <p className="text-slate-600 text-sm mb-3">Direct consultation with our specialists</p>
                        <div className="space-y-1">
                          <p className="text-slate-700 font-medium">
                            <a href="tel:+919740384683" className="hover:text-orange-600 transition-colors" data-testid="contact-phone-india-1">+91 97403 84683</a>
                          </p>
                          <p className="text-slate-700 font-medium">
                            <a href="tel:+919740394863" className="hover:text-orange-600 transition-colors" data-testid="contact-phone-india-2">+91 97403 94863</a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Email Support Card */}
              <div className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                
                <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-3xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-4 bg-white rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <Mail className="h-8 w-8 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Email Support</h3>
                        <p className="text-slate-600 text-sm mb-3">24/7 support and consultation</p>
                        <div className="space-y-1">
                          <p className="text-slate-700 font-medium">info@orgainse.com</p>
                          <p className="text-slate-700 font-medium">support@orgainse.com</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Book Consultation Card */}
              <div className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                
                <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-3xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-orange-400 to-red-500"></div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-4 bg-white rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <Calendar className="h-8 w-8 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Book Consultation</h3>
                        <p className="text-slate-600 text-sm mb-3">Schedule your free strategy session</p>
                        <div className="space-y-1">
                          <p className="text-slate-700 font-medium">Free 30-min consultation</p>
                          <p className="text-slate-700 font-medium">Customized AI roadmap</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Global Offices Card */}
              <div className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                
                <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-3xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-500"></div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-4 bg-white rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <MapPin className="h-8 w-8 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Global Offices</h3>
                        <p className="text-slate-600 text-sm mb-3">AI-native consulting across regions</p>
                        <div className="space-y-1">
                          <p className="text-slate-700 font-medium">Bangalore, India (HQ)</p>
                          <p className="text-slate-700 font-medium">Austin, USA (Corporate)</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Bottom Section - Social Media and CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Enhanced Social Media Card */}
            <div className="group relative animate-fade-in" style={{ animationDelay: '800ms' }}>
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              
              <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-3xl overflow-hidden h-full">
                <div className="h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
                
                <CardContent className="p-6 h-full flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">
                    Connect With Our Community
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

            {/* Revolutionary CTA Card */}
            <div className="group relative animate-fade-in" style={{ animationDelay: '1000ms' }}>
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse"></div>
              
              <Card className="relative bg-gradient-to-br from-orange-500 to-purple-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 rounded-3xl overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-8 -translate-y-8 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full transform -translate-x-4 translate-y-4 animate-pulse animation-delay-500"></div>
                
                <CardContent className="p-8 text-center relative z-10 h-full flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                  <p className="mb-6 text-orange-100">
                    Book a free AI consultation call and let's discuss your digital transformation goals 
                    with our <span className="font-bold">GPT-powered strategy development</span>.
                  </p>
                  <button 
                    onClick={openCalendly}
                    className="group/btn bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Calendar className="inline-block mr-2 h-5 w-5" />
                    Schedule Free AI Consultation
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
