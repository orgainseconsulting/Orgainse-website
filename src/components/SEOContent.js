import React from 'react';
import { CheckCircle, TrendingUp, Users, Globe, Zap, Target } from 'lucide-react';

const SEOContent = () => {
  return (
    <div className="py-16 bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 relative overflow-hidden">
      {/* Beautiful Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl animate-pulse will-change-transform"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl animate-pulse will-change-transform animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-6 h-16 bg-blue-300 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute top-1/3 right-1/3 w-4 h-12 bg-purple-300 rounded-full animate-pulse opacity-30 animation-delay-1000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Enhanced Main Content Section with Design Elements */}
        <div className="max-w-4xl mx-auto">
          
          {/* Enhanced Introduction Section with Visual Elements */}
          <div className="prose prose-lg max-w-none mb-12 relative">
            {/* Decorative Element Above Title */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-1 bg-gradient-to-r from-orange-500 via-green-500 to-blue-500 rounded-full animate-pulse"></div>
            </div>
            
            {/* Enhanced Title with Gradient Background */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 mb-8 animate-fade-in">
              <h1 className="text-4xl font-bold mb-6 leading-tight text-center">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                  Comprehensive Business Consulting Services:
                </span>
                <br />
                <span className="text-slate-800">Transform Your Business with </span>
                <span className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient-text">
                  AI-Native Solutions
                </span>
              </h1>
              
              {/* Decorative Corner Elements */}
              <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-blue-400 to-green-400 rounded-full opacity-20 animate-pulse animation-delay-1000"></div>
            </div>
            
            {/* Enhanced Content Cards */}
            <div className="space-y-6">
              {/* First Content Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] animate-fade-in">
                <p className="text-xl text-slate-700 leading-relaxed text-justify">
                  <strong>Orgainse Consulting</strong> is a leading <strong>business consulting firm</strong> offering comprehensive <strong>digital transformation</strong>, <strong>project management</strong>, <strong>AI strategy</strong>, and <strong>operational optimization services</strong> for startups and SMEs worldwide. Our integrated consulting approach delivers an average <strong>340% ROI</strong> and <strong>25% faster delivery</strong> across industries including IT Services, EdTech, FinTech, Healthcare, Hospitality, and Software Development.
                </p>
                {/* Small decorative element */}
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-4 animate-pulse"></div>
              </div>

              {/* Second Content Card */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 shadow-lg border border-blue-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] animate-fade-in animation-delay-300">
                <p className="text-lg text-slate-700 leading-relaxed text-justify">
                  Since our founding in <strong>2025</strong>, we have revolutionized how businesses approach <strong>comprehensive transformation</strong> by integrating cutting-edge technology with proven business methodologies. Our <strong>holistic consulting approach</strong> enables organizations to achieve unprecedented efficiency, cost reduction, and strategic growth through intelligent solutions and data-driven decision making across all business functions.
                </p>
                {/* Small decorative element */}
                <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-orange-500 rounded-full mt-4 animate-pulse"></div>
              </div>

              {/* Third Content Card */}
              <div className="bg-gradient-to-r from-green-50 to-orange-50 rounded-xl p-6 shadow-lg border border-green-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] animate-fade-in animation-delay-600">
                <p className="text-lg text-slate-700 leading-relaxed text-justify">
                  <strong>Modern business consulting</strong> requires expertise across multiple domains. Our comprehensive service portfolio includes <strong>digital transformation</strong>, <strong>project management optimization</strong>, <strong>AI strategy development</strong>, <strong>risk management</strong>, and <strong>operational excellence</strong>. This integrated approach results in significantly improved business outcomes and client satisfaction rates exceeding 95%.
                </p>
                {/* Small decorative element */}
                <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-4 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Key Benefits Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              Why Choose Orgainse Consulting Services?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">340% Average ROI</h3>
                  <p className="text-slate-700">Proven return on investment within 18 months through comprehensive business optimization and intelligent automation across all consulting services.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <TrendingUp className="h-6 w-6 text-orange-500 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">25% Faster Delivery</h3>
                  <p className="text-slate-700">Accelerated business transformation through integrated consulting services, strategic planning, and optimized implementation processes.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Users className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Expert Team</h3>
                  <p className="text-slate-700">Certified business consultants, strategists, and transformation specialists with deep industry expertise across multiple verticals and business functions.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Globe className="h-6 w-6 text-purple-500 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Global Reach</h3>
                  <p className="text-slate-700">Serving businesses across 7 countries: India, USA, UK, UAE, Australia, New Zealand, and South Africa with comprehensive consulting support.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Comprehensive Services Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              Comprehensive Business Consulting Solutions
            </h2>
            
            <p className="text-lg text-slate-700 leading-relaxed mb-8 text-justify">
              Our <strong>comprehensive consulting services</strong> encompass the full spectrum of business transformation needs. From initial <strong>strategic assessment</strong> to complete <strong>operational optimization</strong>, we provide end-to-end solutions tailored to your industry requirements and organizational goals.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <Target className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Strategic Consulting</h3>
                <p className="text-slate-700 text-justify">Business strategy development, market analysis, and growth planning for sustainable competitive advantage.</p>
              </div>
              
              <div className="text-center">
                <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Digital Transformation</h3>
                  <p className="text-slate-700 text-justify">Complete technology modernization, process digitization, and digital strategy implementation.</p>
                </div>
              </div>
              
              <div className="text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Operational Excellence</h3>
                  <p className="text-slate-700 text-justify">Process optimization, performance improvement, and operational efficiency enhancement.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Industry Expertise */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              Industry-Specific Business Transformation Expertise
            </h2>
            
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              Our team brings deep vertical expertise across multiple industries, ensuring that your <strong>business transformation solution</strong> aligns with industry best practices, regulatory requirements, and market-specific challenges.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mb-4">Key Industries We Serve:</h3>
            <div className="space-y-3 mb-8">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <p className="text-slate-700"><strong>IT Services & Software Development:</strong> Technology strategy, agile transformation, and development process optimization</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <p className="text-slate-700"><strong>EdTech & Education:</strong> Educational technology consulting, learning platform optimization, and institutional transformation</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <p className="text-slate-700"><strong>FinTech & Financial Services:</strong> Financial technology strategy, regulatory compliance, and process automation</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <p className="text-slate-700"><strong>Healthcare & MedTech:</strong> Healthcare technology consulting, clinical process optimization, and digital health solutions</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <p className="text-slate-700"><strong>Hospitality & Tourism:</strong> Customer experience optimization, operations consulting, and digital service transformation</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Ready to Transform Your Business with Comprehensive Consulting?
            </h2>
            <p className="text-lg text-slate-700 mb-6">
              Join hundreds of successful organizations that have achieved remarkable growth through our comprehensive business consulting services. Contact our experts today for a free consultation and discover how our integrated approach can accelerate your business transformation journey.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-slate-700">Free business consultation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-slate-700">Comprehensive business assessment</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-slate-700">Custom ROI analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-slate-700">Tailored transformation roadmap</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOContent;
