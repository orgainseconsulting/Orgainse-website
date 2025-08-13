import React, { useEffect } from 'react';
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
  // Proper scroll management
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore scroll position when popup closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay with smooth transition */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Popup container with enhanced design */}
      <div className="relative bg-white rounded-3xl max-w-6xl w-[95%] max-h-[95vh] overflow-hidden shadow-2xl transform transition-all duration-300 scale-100">
        
        {/* Close Button - Enhanced */}
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
            </div>
          </div>
        </div>

          {/* Scrollable Content */}
          <div className="max-h-[70vh] overflow-y-auto" style={{scrollBehavior: 'smooth'}}>
          {!isSubmitted ? (
            <>
              {!showContactForm ? (
                // Service Information View
                <div className="p-4 sm:p-6 lg:p-8">
                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                    {/* What This Service Does */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 sm:mb-4 flex items-center">
                        <Target className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                        What This Service Does
                      </h3>
                      <p className="text-slate-700 leading-relaxed text-base sm:text-lg">
                        {service.detailedInfo.whatItDoes}
                      </p>
                    </div>

                    {/* Why Choose This Service */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-100">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 sm:mb-4 flex items-center">
                        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-green-600 flex-shrink-0" />
                        Why Choose This Service
                      </h3>
                      <p className="text-slate-700 leading-relaxed text-base sm:text-lg">
                        {service.detailedInfo.whyChooseUs}
                      </p>
                    </div>
                  </div>

                  {/* What You'll Get */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-orange-100 mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 sm:mb-4 flex items-center">
                      <Award className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-orange-600 flex-shrink-0" />
                      What You'll Get
                    </h3>
                    <p className="text-slate-700 leading-relaxed text-base sm:text-lg mb-4">
                      {service.detailedInfo.whatYouGet}
                    </p>
                    
                    {/* Benefits List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
                      {service.detailedInfo.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 font-medium text-sm sm:text-base">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Call-to-Action */}
                  <div className="text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 sm:mb-4">
                      Ready to Transform Your Business?
                    </h3>
                    <p className="text-slate-600 mb-4 sm:mb-6 text-base sm:text-lg">
                      Get a personalized consultation and detailed proposal for your project
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                      <button
                        onClick={() => setShowContactForm(true)}
                        className={`px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r ${service.gradient} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-sm sm:text-base`}
                      >
                        Get Custom Proposal
                      </button>
                      
                      <button
                        onClick={openGoogleCalendar}
                        className="px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:border-slate-400 transition-all transform hover:scale-105 text-sm sm:text-base"
                      >
                        Book Free Consultation
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Contact Form View
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-6 sm:mb-8">
                      <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 sm:mb-4">
                        Get Your Custom Proposal
                      </h3>
                      <p className="text-slate-600 text-base sm:text-lg">
                        Tell us about your specific needs and we'll create a tailored proposal for your <strong>{service.title}</strong> project
                      </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Full Name *
                          </label>
                          <Input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
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
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                            placeholder="your.email@company.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            Phone Number
                          </label>
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
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
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
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
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                          rows={4}
                          placeholder="Tell us about your specific needs, goals, timeline, and any questions you have about this service..."
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <button
                          type="button"
                          onClick={() => setShowContactForm(false)}
                          className="px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors text-sm sm:text-base"
                        >
                          ← Back to Details
                        </button>
                        
                        <button
                          type="submit"
                          className={`px-6 sm:px-8 py-3 bg-gradient-to-r ${service.gradient} text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-sm sm:text-base`}
                        >
                          Send My Proposal Request
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Thank You Message
            <div className="p-6 sm:p-12 text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                
                <h3 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
                  Thank You!
                </h3>
                
                <p className="text-xl text-slate-600 mb-6 max-w-2xl mx-auto">
                  Your request for <strong>{service.title}</strong> has been received. 
                  Our team will contact you within 24 hours with a customized proposal and next steps.
                </p>
                
                <div className="bg-slate-50 rounded-2xl p-6 mb-8 max-w-md mx-auto">
                  <h4 className="font-bold text-slate-800 mb-2">What happens next?</h4>
                  <ul className="text-slate-600 text-sm space-y-1 text-left">
                    <li>• We'll review your requirements within 4 hours</li>
                    <li>• Our specialists will prepare your custom proposal</li>
                    <li>• We'll schedule a detailed consultation call</li>
                    <li>• You'll receive a comprehensive project plan</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={onClose}
                  className="bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Continue Exploring Services
                </Button>
              </div>
            </div>
          )}
        </div>

        </div>
      </div>
    </div>
  );
};

export default ServicePopup;