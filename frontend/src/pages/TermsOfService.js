import React from "react";
import { Link } from "react-router-dom";
import SEOHead from "../components/SEOHead";
import { LegalBody } from "../components/LegalModal";
import { TERMS_OF_SERVICE, LEGAL_UPDATED } from "../content/legal";

const TermsOfService = () => (
  <div className="min-h-screen bg-white py-20" data-testid="terms-page">
    <SEOHead
      title="Terms of Service | Orgainse"
      description="The terms governing use of the Orgainse website, its informational tools, and the framework for consulting, PMaaS, and ORQYNE implementation engagements."
      canonical="https://orgainse.com/terms"
      structuredData={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Terms of Service",
        url: "https://orgainse.com/terms",
        dateModified: "2026-06-01",
        publisher: { "@type": "Organization", name: "Orgainse", url: "https://orgainse.com/" },
      }}
    />
    <div className="max-w-3xl mx-auto px-6 lg:px-10">
      <p className="text-[10px] uppercase tracking-[0.24em] text-blue-600 font-bold">Orgainse</p>
      <h1 className="mt-3 font-outfit text-4xl sm:text-5xl font-bold tracking-[-0.03em] text-slate-900">{TERMS_OF_SERVICE.title}</h1>
      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-7 sm:p-10 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.35)]">
        <LegalBody doc={TERMS_OF_SERVICE} testIdPrefix="terms" />
      </div>
      <p className="mt-8 text-xs text-slate-500">
        Version dated {LEGAL_UPDATED}. See also the{" "}
        <Link to="/privacy" className="font-semibold text-blue-700 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  </div>
);

export default TermsOfService;
