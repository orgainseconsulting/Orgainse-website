import React, { useEffect, useState } from 'react';
import { X, Target, CheckCircle, Award, Sparkles, ArrowRight } from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

const ServicePopup = ({
  isOpen,
  service,
  showContactForm,
  setShowContactForm,
  isSubmitted,
  formData,
  setFormData,
  onClose,
  onSubmit,
  openCalendly
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !service) return null;

  return (
    // Fixed positioning for proper centering regardless of scroll position
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Centered popup modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in transform mx-2 sm:mx-4">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          data-testid="service-popup-close-btn"
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-[1.03]"
        >
          <X className="h-5 w-5 text-slate-700" />
        </button>

        {/* Compact Header */}
        <div className={`bg-gradient-to-r ${service.gradient} px-6 py-6 text-white relative overflow-hidden`}>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <service.icon className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 pr-8">
              <h2 className="text-2xl font-bold mb-2">
                {service.title}
              </h2>
              <p className="text-white/90 text-sm">
                {service.description}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable content with better height calculation */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6">
            {!isSubmitted ? (
              <>
                {!showContactForm ? (
                  // Condensed Service Information
                  <div className="space-y-6">
                    {/* Compact 3-section layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* What This Service Does */}
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center mb-3">
                          <Target className="h-5 w-5 text-blue-600 mr-2" />
                          <h3 className="font-bold text-slate-800">What It Does</h3>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed">
                          {service.detailedInfo.whatItDoes}
                        </p>
                      </div>

                      {/* Why Choose This Service */}
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center mb-3">
                          <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                          <h3 className="font-bold text-slate-800">Why Choose Us</h3>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed">
                          {service.detailedInfo.whyChooseUs}
                        </p>
                      </div>

                      {/* What You'll Get */}
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center mb-3">
                          <Award className="h-5 w-5 text-blue-600 mr-2" />
                          <h3 className="font-bold text-slate-800">What You Get</h3>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed mb-3">
                          {service.detailedInfo.whatYouGet}
                        </p>
                      </div>
                    </div>

                    {/* Right fit / Not the right fit — scope clarification block */}
                    {(service.detailedInfo.rightFit || service.detailedInfo.notRightFit) && (
                      <div
                        data-testid={`service-fit-block-${service.id}`}
                        className="rounded-xl border-2 border-blue-200 bg-blue-50/70 p-5 grid md:grid-cols-2 gap-4"
                      >
                        {service.detailedInfo.rightFit && (
                          <div data-testid={`service-right-fit-${service.id}`}>
                            <h4 className="text-sm font-extrabold uppercase tracking-wider text-blue-700 mb-2 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" /> Right fit
                            </h4>
                            <p className="text-slate-800 text-sm leading-relaxed">
                              {service.detailedInfo.rightFit}
                            </p>
                          </div>
                        )}
                        {service.detailedInfo.notRightFit && (
                          <div data-testid={`service-not-right-fit-${service.id}`}>
                            <h4 className="text-sm font-extrabold uppercase tracking-wider text-violet-700 mb-2 flex items-center gap-2">
                              <span className="inline-block h-4 w-4 rounded-full border-2 border-violet-600 flex items-center justify-center text-violet-600 text-[10px] font-bold leading-none">×</span>
                              Not the right fit
                            </h4>
                            <p className="text-slate-800 text-sm leading-relaxed">
                              {service.detailedInfo.notRightFit}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Explicit scope boundaries */}
                    {(service.detailedInfo.notIncluded || service.detailedInfo.whoWeServe) && (
                      <div className="grid md:grid-cols-2 gap-4">
                        {service.detailedInfo.notIncluded && (
                          <div data-testid={`service-not-included-${service.id}`} className="rounded-xl border border-slate-200 bg-white p-5">
                            <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-3">
                              Not included in this service
                            </h4>
                            <ul className="space-y-1.5">
                              {service.detailedInfo.notIncluded.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                  <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {service.detailedInfo.whoWeServe && (
                          <div data-testid={`service-who-we-serve-${service.id}`} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                            <h4 className="text-sm font-extrabold uppercase tracking-wider text-blue-700 mb-3">
                              Who we serve
                            </h4>
                            <ul className="space-y-1.5">
                              {service.detailedInfo.whoWeServe.map((item, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                  <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Compact Benefits List */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h4 className="font-bold text-slate-800 mb-3">Key Benefits:</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                        {service.detailedInfo.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700 text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cross-link to product page when this service is powered by a product */}
                    {service.productLink && (
                      <a
                        href={service.productLink.href}
                        data-testid={`product-crosslink-${service.id}`}
                        className="block group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border-2 border-blue-400/40 p-5 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/20 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-black/40 ring-1 ring-blue-400/30 flex items-center justify-center p-1.5">
                            <img
                              src="/orqyne/mark-400.png"
                              alt="ORQYNE"
                              className="h-full w-full object-contain"
                              width="56"
                              height="56"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-blue-300 mb-0.5">
                              Powered by our product
                            </div>
                            <div className="text-lg font-extrabold text-white leading-tight">
                              {service.productLink.label}
                            </div>
                            <div className="text-xs text-slate-300 mt-1">
                              {service.productLink.tagline}
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-blue-300 group-hover:translate-x-1 transition-transform">
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        </div>
                      </a>
                    )}

                    {/* Compact CTA Section */}
                    <div className="text-center bg-gradient-to-r from-slate-50 via-white to-blue-50 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-3">
                        Discuss this with us
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => setShowContactForm(true)}
                          data-testid={`service-popup-proposal-btn-${service.id}`}
                          className={`px-6 py-3 bg-gradient-to-r ${service.gradient} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]`}
                        >
                          Request a Scoped Proposal
                        </button>
                        <button
                          onClick={openCalendly}
                          data-testid={`service-popup-book-btn-${service.id}`}
                          className="px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:border-slate-400 hover:shadow-lg transition-all transform hover:scale-[1.02]"
                        >
                          Book a Discovery Call
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Compact Contact Form
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-slate-800 mb-3">
                        Request a Scoped Proposal
                      </h3>
                      <p className="text-slate-600">
                        Tell us about your needs for <strong>{service.title}</strong>
                      </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Full Name *
                          </label>
                          <Input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Your full name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Email Address *
                          </label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="your.email@company.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Phone Number
                          </label>
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Company
                          </label>
                          <Input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Your company name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Project Details
                        </label>
                        <Textarea
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          placeholder="Tell us about your specific needs..."
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                        <button
                          type="button"
                          onClick={() => setShowContactForm(false)}
                          className="px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                        >
                          ← Back to Details
                        </button>
                        
                        <button
                          type="submit"
                          data-testid="service-popup-submit-btn"
                          className={`px-8 py-3 bg-gradient-to-r ${service.gradient} text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]`}
                        >
                          Send My Request
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            ) : (
              // Compact Thank You Message
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-blue-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Thank You!
                </h3>
                
                <p className="text-lg text-slate-600 mb-6 max-w-lg mx-auto">
                  Your request for <strong>{service.title}</strong> has been received. 
                  We'll contact you within one business day.
                </p>
                
                <Button 
                  onClick={onClose}
                  className="bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                >
                  Continue Exploring
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePopup;