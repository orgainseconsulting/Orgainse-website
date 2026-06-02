import React from "react";
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
} from "lucide-react";
import { Separator } from "./ui/separator";

const Footer = () => {
  const socialLinks = [
    { icon: Linkedin, href: "https://linkedin.com/company/orgainse-consulting", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com/orgainseconsult", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/orgainseconsulting", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com/orgainseconsulting", label: "Facebook" },
    { icon: Youtube, href: "https://youtube.com/@orgainseconsulting", label: "YouTube" },
  ];

  return (
    <footer data-testid="site-footer" className="bg-white text-slate-800 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <img
                src="https://customer-assets.emergentagent.com/job_digital-presence-29/artifacts/xx6a5zd7_Copy%20of%20OrgAInse%20Consulting%20%28Website%29.png"
                alt="Orgainse Consulting - AI-native Digital Transformation Consulting"
                className="h-16 w-auto object-contain bg-white rounded-xl px-3 py-2 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-100"
              />
            </Link>
            <p className="text-slate-600 text-sm">
              AI-native consulting for innovative businesses. Let us plan your SUCCESS!
            </p>
            <div className="flex space-x-4 pt-4">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-orange-500 transition-all duration-300 transform hover:scale-125"
                  aria-label={social.label}
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-slate-800">AI-Native Services</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Business Strategy Development</li>
              <li>Digital Transformation</li>
              <li>Operational Optimization</li>
              <li>PMaaS (AI Project Management)</li>
              <li>Healthcare Revenue Intelligence Advisory</li>
              <li>Risk Management & Compliance</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-slate-800">Industries</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>IT Services & Software</li>
              <li>Healthcare Revenue Intelligence Advisory</li>
              <li>Industry-Agnostic for SMEs &amp; Startups</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-slate-800">Contact</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <div className="font-semibold text-slate-800 mb-1">Bangalore, India (HQ)</div>
                <div className="flex items-center space-x-2 mb-1">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+919740384683" className="hover:text-orange-600 transition-colors" data-testid="footer-phone-india-1">+91 97403 84683</a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <a href="tel:+919740394863" className="hover:text-orange-600 transition-colors" data-testid="footer-phone-india-2">+91 97403 94863</a>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>info@orgainse.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>support@orgainse.com</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>www.orgainse.com</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-slate-300" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-600">
          <div className="text-center md:text-left">
            <p>&copy; 2025 Orgainse Consulting. All rights reserved.</p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/blog" className="hover:text-slate-800">Blog</Link>
            <Link to="/newsletter" className="hover:text-slate-800">Newsletter</Link>
            <Link to="/privacy" className="hover:text-slate-800">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-800">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
