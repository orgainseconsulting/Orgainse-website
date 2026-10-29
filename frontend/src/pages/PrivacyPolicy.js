import React from "react";
import { Link } from "react-router-dom";
import SEOHead from "../components/SEOHead";
import { LegalBody } from "../components/LegalModal";
import { PRIVACY_POLICY, LEGAL_UPDATED } from "../content/legal";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-white py-20" data-testid="privacy-page">
    <SEOHead
      title="Privacy Policy | Orgainse"
      description="How Orgainse collects, uses, shares, retains, and protects personal information across its consulting, PMaaS, and ORQYNE implementation services."
      canonical="https://www.orgainse.com/privacy"
      structuredData={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Privacy Policy",
        url: "https://www.orgainse.com/privacy",
        dateModified: "2026-06-01",
        publisher: { "@type": "Organization", name: "Orgainse", url: "https://www.orgainse.com/" },
      }}
    />
    <div className="max-w-3xl mx-auto px-6 lg:px-10">
      <p className="text-[10px] uppercase tracking-[0.24em] text-blue-600 font-bold">Orgainse</p>
      <h1 className="mt-3 font-outfit text-4xl sm:text-5xl font-bold tracking-[-0.03em] text-slate-900">{PRIVACY_POLICY.title}</h1>
      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-7 sm:p-10 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.35)]">
        <LegalBody doc={PRIVACY_POLICY} testIdPrefix="privacy" />
      </div>
      <p className="mt-8 text-xs text-slate-500">
        Version dated {LEGAL_UPDATED}. See also the{" "}
        <Link to="/terms" className="font-semibold text-blue-700 hover:underline">
          Terms of Service
        </Link>
        .
      </p>
    </div>
  </div>
);

export default PrivacyPolicy;
