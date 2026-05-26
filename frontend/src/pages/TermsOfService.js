import React from "react";
import SEOHead from "../components/SEOHead";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 py-20">
      <SEOHead
        title="Terms of Service - Orgainse Consulting"
        description="Review the terms governing the use of Orgainse Consulting's AI-native consulting services and website."
        canonical="https://orgainse.com/terms"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-slate-600 mb-6">Last updated: November 2025</p>

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
                <p>Email: info@orgainse.com | support@orgainse.com</p>
                <p>Phone: +91-9740384683 | +91-9740394863</p>
                <p>Phone (USA): +1(512)641-8773 | +1(512)641-3494</p>
                <p>Headquarters: Bangalore, India | Austin, USA</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
