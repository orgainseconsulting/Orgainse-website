import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
} from "lucide-react";
import { Button } from "./ui/button";
import { useCalendly } from "../context/CalendlyContext";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { openCalendly } = useCalendly();
  const location = useLocation();

  // Shrink header on scroll
  useEffect(() => {
    let timeoutId = null;
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsScrolled(scrollTop > 50), 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/products", label: "Products" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  const socialLinks = [
    { icon: Linkedin, href: "https://linkedin.com/company/orgainse-consulting", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com/orgainseconsult", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com/orgainseconsulting", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com/orgainseconsulting", label: "Facebook" },
    { icon: Youtube, href: "https://youtube.com/@orgainseconsulting", label: "YouTube" },
  ];

  return (
    <nav
      data-testid="site-nav"
      className={`bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "shadow-lg" : "shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex justify-between items-center transition-all duration-300 ${
            isScrolled ? "h-16 sm:h-20" : "h-20 sm:h-24 lg:h-32"
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center group mr-8 lg:mr-12" data-testid="nav-logo-home">
            <img
              src="https://customer-assets.emergentagent.com/job_digital-presence-29/artifacts/xx6a5zd7_Copy%20of%20OrgAInse%20Consulting%20%28Website%29.png"
              alt="Orgainse Consulting - AI Project Management Service & Digital Transformation"
              className={`w-auto object-contain bg-white rounded-xl px-2 py-1 sm:px-3 sm:py-2 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-100 ${
                isScrolled ? "h-8 sm:h-10 lg:h-12" : "h-10 sm:h-14 lg:h-20"
              }`}
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
                className={`text-sm font-medium transition-colors hover:text-orange-500 ${
                  location.pathname === link.href ? "text-orange-500" : "text-slate-600"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="hidden xl:flex items-center space-x-3 border-l border-gray-200 pl-6">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-orange-500 transition-colors transform hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            <Button
              data-testid="nav-book-consultation"
              onClick={openCalendly}
              className="bg-orange-500 hover:bg-orange-600 text-white transform hover:scale-105 transition-all duration-300 text-sm px-4 py-2"
            >
              Book Consultation
            </Button>
          </div>

          {/* Mobile button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              data-testid="nav-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-10 w-10 p-0"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden" data-testid="nav-mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block px-3 py-2 text-base font-medium text-slate-600 hover:text-orange-500 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-3 py-2 border-t border-gray-200 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 font-medium">Follow us:</span>
                  <div className="flex items-center space-x-3">
                    {socialLinks.map((social, idx) => (
                      <a
                        key={idx}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 hover:text-orange-500"
                        aria-label={social.label}
                      >
                        <social.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-3 py-2">
                <Button
                  onClick={() => {
                    openCalendly();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Book Free Consultation
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
