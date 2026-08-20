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
      return "I'm interested in ORQYNE, your delivery-governance workspace. Please share a walkthrough, an indicative scenario for my team size, and the plan that fits our delivery setup.";
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
      toast.success("Message sent! We'll respond within one business day.");
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
    { icon: Twitter, href: "https://twitter.com/orgainseconsult", label: "Twitter", color: "from-blue-400 to-blue-500" },
    { icon: Instagram, href: "https://instagram.com/orgainseconsulting", label: "Instagram", color: "from-violet-400 to-violet-500" },
    { icon: Facebook, href: "https://facebook.com/orgainseconsulting", label: "Facebook", color: "from-blue-500 to-blue-600" },
    { icon: Youtube, href: "https://youtube.com/@orgainseconsulting", label: "YouTube", color: "from-blue-400 to-blue-600" },
  ];

  const contactMethods = [
    {
      title: "Phone — Bengaluru (Corporate Office)",
      description: "Speak directly with a delivery practitioner",
      details: ["+91 97403 84683", "+91 97403 94863"],
      icon: Phone,
      gradient: "from-blue-400 to-blue-500"
    },
    {
      title: "Email",
      description: "Replies within one business day",
      details: ["info@orgainse.com", "support@orgainse.com"],
      icon: Mail,
      gradient: "from-blue-400 to-blue-500"
    },
    {
      title: "Book a Discovery Call",
      description: "One execution problem, one focused conversation",
      details: ["Free 30-minute discovery call", "A scoped, practical next step"],
      icon: Calendar,
      gradient: "from-blue-400 to-blue-500"
    },
    {
      title: "Offices",
      description: "Serving clients globally",
      details: ["Austin, Texas, USA (HQ)", "Bengaluru, India (Corporate Office)"],
      icon: MapPin,
      gradient: "from-violet-400 to-violet-500"
    }
  ];

  return (
    <div id="contact" className="min-h-screen">
      <SEOHead
        title="Contact Orgainse Consulting | Book an Execution Discovery Call"
        description="Bring one important execution problem to a focused 30-minute discovery call. Orgainse works with teams across India, the USA, the UK, the UAE, Australia, New Zealand and South Africa."
        canonical="https://orgainse.com/contact"
        keywords="contact Orgainse Consulting, book a discovery call, PMaaS enquiry, delivery governance consultation, ORQYNE demo"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Orgainse Consulting",
          url: "https://orgainse.com/contact",
          mainEntity: {
            "@type": "Organization",
            name: "Orgainse Consulting",
            url: "https://orgainse.com/",
            email: "info@orgainse.com",
            contactPoint: [
              { "@type": "ContactPoint", telephone: "+91-9740384683", contactType: "sales", email: "info@orgainse.com", areaServed: ["IN", "US", "GB", "AE", "AU", "NZ", "ZA"] },
              { "@type": "ContactPoint", telephone: "+91-9740394863", contactType: "customer support", email: "support@orgainse.com", areaServed: ["IN", "US", "GB", "AE", "AU", "NZ", "ZA"] }
            ]
          }
        }}
      />

      {/* Hero Section with SEO */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 lg:py-16 overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-slate-50 via-white to-blue-50 rounded-full blur-3xl animate-pulse float-animation will-change-transform"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-slate-50 via-white to-blue-50 rounded-full blur-3xl animate-pulse float-animation animation-delay-2000 will-change-transform"></div>
          <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-blue-300 rotate-45 animate-spin-slow opacity-60"></div>
          <div className="absolute bottom-1/3 right-1/4 w-6 h-16 bg-violet-300 rounded-full animate-pulse opacity-50"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10 animate-fade-in">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white/70 backdrop-blur-sm text-[11px] uppercase tracking-[0.18em] text-slate-500 shadow-sm">
            Contact Orgainse
          </span>
          <h1 className="mt-6 font-outfit text-4xl sm:text-5xl font-bold leading-[1.06] tracking-[-0.03em] max-w-3xl">
            <span className="text-slate-900">Bring one important </span>
            <span className="text-blue-600">execution problem</span>
          </h1>

          <h2 className="mt-6 text-base md:text-lg font-semibold text-slate-700 max-w-2xl leading-relaxed">
            Book a focused discovery session with an Orgainse consultant — no commitment required.
          </h2>

          <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            We will clarify the desired business outcome, the current workflow, decision owners, operating
            constraints, and the most practical next step. The recommendation may involve consulting,
            Project Management as a Service, ORQYNE, a short diagnostic, or no immediate engagement.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #7c3aed 0%, transparent 50%)`
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Enhanced Header Section */}
          <div className="mb-14 animate-fade-in">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-slate-900 max-w-3xl">
              Start the conversation
            </h2>
            <p className="mt-6 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              Whether the priority is project delivery, workflow visibility, operational governance, ORQYNE
              implementation, or practical Artificial Intelligence adoption, we work with teams across India,
              the United States, the United Kingdom, the United Arab Emirates, Australia, New Zealand, and South Africa.
            </p>
          </div>

          {/* Main Contact Section - Form + Contact Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
            {/* Enhanced Contact Form */}
            <div className="animate-fade-in">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                
                <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden h-full">
                  {/* Top Gradient Bar */}
                  <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600"></div>
                  
                  <CardHeader className="pb-6">
                    <CardTitle className="font-outfit text-2xl font-bold tracking-[-0.02em] text-slate-900">
                      Send us a message
                    </CardTitle>
                    <CardDescription className="text-lg text-slate-600">
                      Tell us about the execution problem you are dealing with. We reply within one
                      business day with <span className="font-bold text-blue-600">an honest read on fit</span> and
                      <span className="font-bold text-violet-600"> a suggested next step</span>.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {submitStatus === "success" ? (
                      <div data-testid="contact-success-message" className="text-center py-12">
                        <CheckCircle className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Message Sent!</h3>
                        <p className="text-slate-600 mb-6">
                          Thanks for reaching out. We'll respond within one business day with an honest
                          read on fit and a suggested next step.
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
                          placeholder="Delivery visibility, project governance, or ORQYNE enquiry"
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
                          placeholder="Describe the execution problem: where status becomes unclear, which hand-offs slip, who owns the decisions, and what you need visibility on..."
                        />
                      </div>

                      <button
                        data-testid="contact-submit-btn"
                        type="submit"
                        disabled={isSubmitting}
                        className="group w-full relative px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02] overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-violet-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                
                <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-3xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-600 to-violet-600"></div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-4 bg-white rounded-2xl shadow-lg group-hover:scale-[1.03] group-hover:rotate-12 transition-all duration-500">
                        <Phone className="h-8 w-8 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Phone — Bengaluru (Corporate Office)</h3>
                        <p className="text-slate-600 text-sm mb-3">Direct consultation with our specialists</p>
                        <div className="space-y-1">
                          <p className="text-slate-700 font-medium">
                            <a href="tel:+919740384683" className="hover:text-blue-600 transition-colors" data-testid="contact-phone-india-1">+91 97403 84683</a>
                          </p>
                          <p className="text-slate-700 font-medium">
                            <a href="tel:+919740394863" className="hover:text-blue-600 transition-colors" data-testid="contact-phone-india-2">+91 97403 94863</a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Email Support Card */}
              <div className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-violet-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                
                <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-3xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-600 to-violet-600"></div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-4 bg-white rounded-2xl shadow-lg group-hover:scale-[1.03] group-hover:rotate-12 transition-all duration-500">
                        <Mail className="h-8 w-8 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Email</h3>
                        <p className="text-slate-600 text-sm mb-3">Replies within one business day</p>
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
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-violet-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                
                <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-3xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-600 to-violet-600"></div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-4 bg-white rounded-2xl shadow-lg group-hover:scale-[1.03] group-hover:rotate-12 transition-all duration-500">
                        <Calendar className="h-8 w-8 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Book a Discovery Call</h3>
                        <p className="text-slate-600 text-sm mb-3">One execution problem, one focused conversation</p>
                        <div className="space-y-1">
                          <p className="text-slate-700 font-medium">Free 30-minute discovery call</p>
                          <p className="text-slate-700 font-medium">A scoped, practical next step</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Offices Card */}
              <div className="group relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-violet-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                
                <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-3xl overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-600 to-violet-600"></div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-4 bg-white rounded-2xl shadow-lg group-hover:scale-[1.03] group-hover:rotate-12 transition-all duration-500">
                        <MapPin className="h-8 w-8 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Offices</h3>
                        <p className="text-slate-600 text-sm mb-3">Serving clients globally</p>
                        <div className="space-y-1">
                          <p className="text-slate-700 font-medium">Austin, Texas, USA (HQ)</p>
                          <p className="text-slate-700 font-medium">Bengaluru, India (Corporate Office)</p>
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
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              
              <Card className="relative bg-white/90 backdrop-blur-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 rounded-3xl overflow-hidden h-full">
                <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600"></div>
                
                <CardContent className="p-6 h-full flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">
                    Connect With Our Community
                  </h3>
                  <p className="text-slate-600 text-center mb-6">
                    Follow us for practical notes on delivery execution, governance and visible progress
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
                          className="relative flex items-center justify-center w-12 h-12 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-125 hover:-translate-y-1"
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

            {/* CTA Card */}
            <div className="group relative animate-fade-in" style={{ animationDelay: '1000ms' }}>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse"></div>
              
              <Card className="relative bg-gradient-to-br from-blue-600 to-violet-600 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 rounded-3xl overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-8 -translate-y-8 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full transform -translate-x-4 translate-y-4 animate-pulse animation-delay-500"></div>
                
                <CardContent className="p-8 text-center relative z-10 h-full flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                  <p className="mb-6 text-blue-100">
                    Book a free 30-minute discovery call and bring
                    <span className="font-bold"> one execution problem</span> you want a clearer view of.
                  </p>
                  <button 
                    onClick={openCalendly}
                    className="group/btn bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full font-bold transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  >
                    <Calendar className="inline-block mr-2 h-5 w-5" />
                    Schedule a Free Discovery Call
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
