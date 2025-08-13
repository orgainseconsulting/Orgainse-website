import React, { useEffect, useState } from 'react';
import { X, Target, CheckCircle, Award } from 'lucide-react';
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
  openGoogleCalendar
}) => {
  const [scrollMode, setScrollMode] = useState('cursor'); // 'cursor' or 'sync'

  // Advanced scroll management with two modes
  useEffect(() => {
    if (!isOpen) return;

    if (scrollMode === 'cursor') {
      // CURSOR-BASED SCROLLING: Popup scrolls when cursor is over it, page scrolls when cursor is over background
      const handleWheel = (e) => {
        const popup = document.querySelector('.service-popup-content');
        const isOverPopup = popup && popup.contains(e.target);
        
        if (isOverPopup) {
          // Cursor is over popup - scroll popup content, prevent page scroll
          const popupScrollContainer = popup.querySelector('.popup-scroll-container');
          if (popupScrollContainer) {
            e.preventDefault();
            popupScrollContainer.scrollTop += e.deltaY;
          }
        }
        // If cursor is over background - allow normal page scrolling (do nothing)
      };

      document.addEventListener('wheel', handleWheel, { passive: false });
      return () => document.removeEventListener('wheel', handleWheel);
      
    } else if (scrollMode === 'sync') {
      // SYNCHRONIZED SCROLLING: Both popup and page scroll together smoothly
      const handleWheel = (e) => {
        const popup = document.querySelector('.service-popup-content');
        const popupScrollContainer = popup?.querySelector('.popup-scroll-container');
        
        if (popupScrollContainer) {
          // Don't prevent default - allow page to scroll naturally
          // Also scroll popup content proportionally
          const scrollRatio = 0.7; // Popup scrolls at 70% of page scroll speed
          popupScrollContainer.scrollTop += e.deltaY * scrollRatio;
        }
      };

      document.addEventListener('wheel', handleWheel, { passive: true });
      return () => document.removeEventListener('wheel', handleWheel);
    }
  }, [isOpen, scrollMode]);

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Scroll Mode Toggle (for testing - can be removed in production) */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-white/90 rounded-lg p-2 shadow-lg">
          <button
            onClick={() => setScrollMode(scrollMode === 'cursor' ? 'sync' : 'cursor')}
            className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {scrollMode === 'cursor' ? 'Cursor Mode' : 'Sync Mode'} (Click to toggle)
          </button>
        </div>
      </div>
      
      {/* Popup container */}
      <div className="service-popup-content relative bg-white rounded-3xl max-w-6xl w-[95%] max-h-[95vh] overflow-hidden shadow-2xl transform transition-all duration-300 scale-100">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
        >
          <X className="h-6 w-6 text-slate-700" />
        </button>

        {/* Header with improved gradient design */}
        <div className={`bg-gradient-to-r ${service.gradient} px-8 py-10 text-white relative overflow-hidden`}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative z-10 flex items-center space-x-6">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <service.icon className="h-12 w-12 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-3 leading-tight">
                {service.title}
              </h2>
              <p className="text-white/90 text-xl leading-relaxed max-w-3xl">
                {service.description}
              </p>
              <div className="mt-3 text-white/70 text-sm">
                {scrollMode === 'cursor' 
                  ? '💡 Hover over popup to scroll content, hover over background to scroll page' 
                  : '💡 Scroll wheel moves both popup and page together'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content with mode-aware scroll handling */}
        <div className="popup-scroll-container h-[calc(95vh-280px)] overflow-y-auto" style={{scrollBehavior: 'smooth'}}>
          <div className="p-8">
            {!isSubmitted ? (
              <>
                {!showContactForm ? (
                  // Service Information View with enhanced design
                  <div className="space-y-8">
                    {/* Main Content Grid with better spacing */}
                    <div className="grid lg:grid-cols-2 gap-8">
                      {/* What This Service Does - Enhanced card */}
                      <div className="group bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center mb-6">
                          <div className="p-3 bg-blue-600 rounded-xl mr-4">
                            <Target className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-slate-800">
                            What This Service Does
                          </h3>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-lg">
                          {service.detailedInfo.whatItDoes}
                        </p>
                      </div>

                      {/* Why Choose This Service - Enhanced card */}
                      <div className="group bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center mb-6">
                          <div className="p-3 bg-green-600 rounded-xl mr-4">
                            <CheckCircle className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-slate-800">
                            Why Choose This Service
                          </h3>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-lg">
                          {service.detailedInfo.whyChooseUs}
                        </p>
                      </div>
                    </div>

                    {/* What You'll Get - Full width with enhanced design */}
                    <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-8 border border-orange-200">
                      <div className="flex items-center mb-6">
                        <div className="p-3 bg-orange-600 rounded-xl mr-4">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">
                          What You'll Get
                        </h3>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-lg mb-6">
                        {service.detailedInfo.whatYouGet}
                      </p>
                      
                      {/* Benefits Grid with enhanced design */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {service.detailedInfo.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-white/60 rounded-xl">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-800 font-medium">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced CTA Section */}
                    <div className="text-center py-8 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl">
                      <h3 className="text-3xl font-bold text-slate-800 mb-4">
                        Ready to Transform Your Business?
                      </h3>
                      <p className="text-slate-600 mb-8 text-lg max-w-2xl mx-auto">
                        Get a personalized consultation and detailed proposal for your project
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                        <button
                          onClick={() => setShowContactForm(true)}
                          className={`px-8 py-4 bg-gradient-to-r ${service.gradient} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg`}
                        >
                          Get Custom Proposal
                        </button>
                        
                        <button
                          onClick={openGoogleCalendar}
                          className="px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:border-slate-400 hover:shadow-lg transition-all transform hover:scale-105 text-lg"
                        >
                          Book Free Consultation
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Enhanced Contact Form
                  <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                      <h3 className="text-3xl font-bold text-slate-800 mb-4">
                        Get Your Custom Proposal
                      </h3>
                      <p className="text-slate-600 text-lg">
                        Tell us about your specific needs and we'll create a tailored proposal for your <strong>{service.title}</strong> project
                      </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Full Name *
                          </label>
                          <Input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                            className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
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
                            className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                            placeholder="your.email@company.com"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Phone Number
                          </label>
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
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
                            className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                            placeholder="Your company name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Project Details & Requirements
                        </label>
                        <Textarea
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                          rows={5}
                          placeholder="Tell us about your specific needs, goals, timeline, and any questions you have about this service..."
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <button
                          type="button"
                          onClick={() => setShowContactForm(false)}
                          className="px-8 py-4 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-colors text-base"
                        >
                          ← Back to Details
                        </button>
                        
                        <button
                          type="submit"
                          className={`px-8 py-4 bg-gradient-to-r ${service.gradient} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-base`}
                        >
                          Send My Proposal Request
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            ) : (
              // Enhanced Thank You Message
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                
                <h3 className="text-4xl font-bold text-slate-800 mb-6">
                  Thank You!
                </h3>
                
                <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                  Your request for <strong>{service.title}</strong> has been received. 
                  Our team will contact you within 24 hours with a customized proposal and next steps.
                </p>
                
                <div className="bg-slate-50 rounded-2xl p-8 mb-8 max-w-md mx-auto">
                  <h4 className="font-bold text-slate-800 mb-4 text-lg">What happens next?</h4>
                  <ul className="text-slate-600 space-y-2 text-left">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>We'll review your requirements within 4 hours</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Our specialists will prepare your custom proposal</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>We'll schedule a detailed consultation call</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>You'll receive a comprehensive project plan</span>
                    </li>
                  </ul>
                </div>
                
                <Button 
                  onClick={onClose}
                  className="bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg"
                >
                  Continue Exploring Services
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