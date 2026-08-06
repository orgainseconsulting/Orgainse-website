import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Phone,
  Mail,
  Globe,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import LegalModal from "./LegalModal";
import WordmarkBackdrop from "./brand/WordmarkBackdrop";
import { LEGAL_DOCS } from "../content/legal";

const socialLinks = [
  { icon: Linkedin, href: "https://linkedin.com/company/orgainse-consulting", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com/orgainseconsult", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/orgainseconsulting", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/orgainseconsulting", label: "Facebook" },
  { icon: Youtube, href: "https://youtube.com/@orgainseconsulting", label: "YouTube" },
];

const SERVICE_LINKS = [
  "Project Management as a Service (PMaaS)",
  "Artificial Intelligence and Workflow Transformation",
  "Delivery and Operational Governance",
  "ORQYNE Implementation and Adoption",
  "Artificial Intelligence Strategy and Readiness",
  "Healthcare Revenue Intelligence Advisory",
];

const Footer = () => {
  const [legalDoc, setLegalDoc] = useState(null);

  return (
    <footer data-testid="site-footer" className="relative overflow-hidden bg-white text-slate-800 border-t border-slate-200">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-52 sm:pb-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-5">
            <Link to="/" className="inline-flex items-center" data-testid="footer-logo-home">
              <img
                src="/orgainse-logo.png"
                alt="Orgainse Consulting — Let us plan your SUCCESS"
                className="h-16 sm:h-20 w-auto object-contain bg-white rounded-2xl px-4 py-2 ring-1 ring-slate-200/70 hover:ring-blue-300/60 transition-all duration-300"
                width="1689"
                height="476"
                style={{
                  boxShadow:
                    "0 1px 0 rgba(255,255,255,0.9) inset, 0 -1px 0 rgba(0,0,0,0.04) inset, 0 8px 18px -8px rgba(15,23,42,0.18), 0 2px 4px rgba(15,23,42,0.06)",
                }}
              />
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
              Delivery consulting, Project Management as a Service, and ORQYNE — turning fragmented work into visible, governed execution.
            </p>
            <div className="flex items-center gap-4 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-outfit font-bold text-slate-900 text-[13px] uppercase tracking-[0.18em] mb-5">Services</h3>
            <ul className="space-y-2.5 text-sm text-slate-600">
              {SERVICE_LINKS.map((s) => (
                <li key={s}>
                  <Link to="/services" className="hover:text-blue-700 transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-outfit font-bold text-slate-900 text-[13px] uppercase tracking-[0.18em] mb-5">Explore</h3>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li><Link to="/products" className="hover:text-blue-700 transition-colors">ORQYNE Platform</Link></li>
              <li><Link to="/about" className="hover:text-blue-700 transition-colors">About Orgainse</Link></li>
              <li><Link to="/ai-assessment" className="hover:text-blue-700 transition-colors">Execution Readiness Assessment</Link></li>
              <li><Link to="/roi-calculator" className="hover:text-blue-700 transition-colors">ROI Calculator</Link></li>
              <li><Link to="/blog" className="hover:text-blue-700 transition-colors">Blog</Link></li>
              <li><Link to="/newsletter" className="hover:text-blue-700 transition-colors">Newsletter</Link></li>
              <li><Link to="/contact" className="hover:text-blue-700 transition-colors">Contact</Link></li>
              <li>
                <a
                  href="https://orgainse.live"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-blue-700 transition-colors"
                >
                  orgainse.live <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-outfit font-bold text-slate-900 text-[13px] uppercase tracking-[0.18em] mb-5">Contact</h3>
            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Austin, Texas, USA
                </div>
                <p className="mt-1 text-[13px] text-slate-500">Headquarters</p>
              </div>
              <div>
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Bengaluru, India
                </div>
                <p className="mt-1 text-[13px] text-slate-500">Corporate Office</p>
                <div className="mt-2 space-y-1">
                  <a href="tel:+919740384683" data-testid="footer-phone-india-1" className="flex items-center gap-2 hover:text-blue-700 transition-colors">
                    <Phone className="h-3.5 w-3.5" /> +91 97403 84683
                  </a>
                  <a href="tel:+919740394863" data-testid="footer-phone-india-2" className="flex items-center gap-2 hover:text-blue-700 transition-colors">
                    <Phone className="h-3.5 w-3.5" /> +91 97403 94863
                  </a>
                </div>
              </div>
              <div className="space-y-1">
                <a href="mailto:info@orgainse.com" className="flex items-center gap-2 hover:text-blue-700 transition-colors">
                  <Mail className="h-3.5 w-3.5" /> info@orgainse.com
                </a>
                <a href="mailto:support@orgainse.com" className="flex items-center gap-2 hover:text-blue-700 transition-colors">
                  <Mail className="h-3.5 w-3.5" /> support@orgainse.com
                </a>
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" /> www.orgainse.com
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-slate-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Orgainse Consulting. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <button
              type="button"
              data-testid="footer-privacy-btn"
              onClick={() => setLegalDoc(LEGAL_DOCS.privacy)}
              className="hover:text-blue-700 transition-colors font-medium"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              data-testid="footer-terms-btn"
              onClick={() => setLegalDoc(LEGAL_DOCS.terms)}
              className="hover:text-blue-700 transition-colors font-medium"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      <WordmarkBackdrop text="ORGAINSE" />

      {legalDoc && <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />}
    </footer>
  );
};

export default Footer;
