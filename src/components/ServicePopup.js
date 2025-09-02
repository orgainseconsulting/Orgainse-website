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
  openCalendly
}) => {
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
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
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
                      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <div className="flex items-center mb-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <h3 className="font-bold text-slate-800">Why Choose Us</h3>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed">
                          {service.detailedInfo.whyChooseUs}
                        </p>
                      </div>

                      {/* What You'll Get */}
                      <div className="bg-orange-50 rounded-xl p-4 border border-green-100">
                        <div className="flex items-center mb-3">
                          <Award className="h-5 w-5 text-orange-600 mr-2" />
                          <h3 className="font-bold text-slate-800">What You Get</h3>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed mb-3">
                          {service.detailedInfo.whatYouGet}
                        </p>
                      </div>
                    </div>

                    {/* Compact Benefits List */}
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h4 className="font-bold text-slate-800 mb-3">Key Benefits:</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                        {service.detailedInfo.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700 text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Compact CTA Section */}
                    <div className="text-center bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-3">
                        Ready to Get Started?
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => setShowContactForm(true)}
                          className={`px-6 py-3 bg-gradient-to-r ${service.gradient} text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
                        >
                          Get Custom Proposal
                        </button>
                        <button
                          onClick={openCalendly}
                          className="px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:border-slate-400 hover:shadow-lg transition-all transform hover:scale-105"
                        >
                          Book Free Consultation
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Compact Contact Form
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-slate-800 mb-3">
                        Get Your Custom Proposal
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
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
                          className={`px-8 py-3 bg-gradient-to-r ${service.gradient} text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
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
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Thank You!
                </h3>
                
                <p className="text-lg text-slate-600 mb-6 max-w-lg mx-auto">
                  Your request for <strong>{service.title}</strong> has been received. 
                  We'll contact you within 24 hours.
                </p>
                
                <Button 
                  onClick={onClose}
                  className="bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
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