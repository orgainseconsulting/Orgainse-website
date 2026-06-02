import React from "react";
import SEOHead from "../components/SEOHead";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 py-20">
      <SEOHead
        title="Privacy Policy - Orgainse Consulting"
        description="Read how Orgainse Consulting collects, uses, and protects personal information across our AI consulting services."
        canonical="https://orgainse.com/privacy"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-slate-600 mb-6">Last updated: November 2025</p>

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
                <p>Email: info@orgainse.com | support@orgainse.com</p>
                <p>Phone: +91 97403 84683 | +91 97403 94863</p>
                <p>Headquarters: Bangalore, India</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
