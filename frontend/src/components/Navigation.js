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
    { href: "/newsletter", label: "Newsletter" },
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
            isScrolled ? "h-20 sm:h-24" : "h-24 sm:h-28 lg:h-36"
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center group mr-6 lg:mr-10" data-testid="nav-logo-home">
            <img
              src="/orgainse-logo.png"
              alt="Orgainse Consulting — Let us plan your SUCCESS"
              className={`w-auto object-contain bg-white rounded-2xl px-3.5 py-2 sm:px-5 sm:py-2.5 shadow-lg ring-1 ring-slate-200/70 hover:shadow-xl hover:ring-orange-300/60 transition-all duration-300 transform hover:scale-105 ${
                isScrolled ? "h-14 sm:h-16 lg:h-20" : "h-16 sm:h-20 lg:h-28"
              }`}
              width="1689"
              height="476"
              style={{
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.95) inset, 0 -1px 0 rgba(0,0,0,0.05) inset, 0 10px 22px -10px rgba(15,23,42,0.22), 0 3px 6px rgba(15,23,42,0.08)",
              }}
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
