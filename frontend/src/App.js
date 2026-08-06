import React, { Suspense } from "react";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import { AuthProvider } from "./components/AuthContext";
import { CalendlyProvider } from "./context/CalendlyContext";
import { RegionalPricingProvider } from "./context/RegionalPricingContext";

import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import CookieBanner from "./components/CookieBanner";
import MobilePerformanceOptimizer from "./components/MobilePerformanceOptimizer";
import AnalyticsDebug from "./components/AnalyticsDebug";

import "./App.css";

// Lazy-loaded route components for code-splitting
const Home = React.lazy(() => import("./pages/Home"));
const About = React.lazy(() => import("./pages/About"));
const Services = React.lazy(() => import("./pages/Services"));
const Contact = React.lazy(() => import("./pages/Contact"));
const AdminDashboard = React.lazy(() => import("./components/AdminDashboard")); // eslint-disable-line no-unused-vars
const ProtectedAdminRoute = React.lazy(() => import("./components/ProtectedAdminRoute"));
const AIAssessmentToolPage = React.lazy(() => import("./pages/AIAssessmentTool"));
const ROICalculatorPage = React.lazy(() => import("./pages/ROICalculator"));
const SmartCalendarPage = React.lazy(() => import("./pages/SmartCalendar"));
const NotFoundPage = React.lazy(() => import("./pages/NotFound"));
const PrivacyPolicyPage = React.lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfServicePage = React.lazy(() => import("./pages/TermsOfService"));
const ProductsPage = React.lazy(() => import("./pages/Products"));
const BlogIndexPage = React.lazy(() => import("./pages/BlogIndex"));
const BlogPostPage = React.lazy(() => import("./pages/BlogPost"));
const NewsletterIndexPage = React.lazy(() => import("./pages/NewsletterIndex"));
const NewsletterIssuePage = React.lazy(() => import("./pages/NewsletterIssue"));
const UnsubscribePage = React.lazy(() => import("./pages/Unsubscribe"));

const RouteFallback = () => (
  <div
    data-testid="route-loading"
    className="min-h-screen bg-white flex items-center justify-center"
  >
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-slate-500 text-sm">Loading…</p>
    </div>
  </div>
);

/** Sends a GA4 page_view on every client-side route change (SPA navigation). */
const RouteAnalytics = () => {
  const location = useLocation();
  React.useEffect(() => {
    if (typeof window.gtag !== "function") return undefined;
    // let the page's SEOHead update document.title before reporting
    const id = setTimeout(() => {
      window.gtag("event", "page_view", {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }, 400);
    return () => clearTimeout(id);
  }, [location.pathname, location.search]);
  return null;
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <CalendlyProvider>
          <RegionalPricingProvider>
            <BrowserRouter>
              <RouteAnalytics />
              <MobilePerformanceOptimizer />
              <Navigation />
              <main>
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/ai-assessment" element={<AIAssessmentToolPage />} />
                    <Route path="/roi-calculator" element={<ROICalculatorPage />} />
                    <Route path="/smart-calendar" element={<SmartCalendarPage />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/blog" element={<BlogIndexPage />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                    <Route path="/newsletter" element={<NewsletterIndexPage />} />
                    <Route path="/newsletter/:slug" element={<NewsletterIssuePage />} />
                    <Route path="/unsubscribe" element={<UnsubscribePage />} />
                    <Route path="/admin" element={<ProtectedAdminRoute />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsOfServicePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </BrowserRouter>
          </RegionalPricingProvider>
        </CalendlyProvider>
      </AuthProvider>
      <Analytics />
      <SpeedInsights />
      <AnalyticsDebug />
      <Toaster position="top-right" richColors closeButton />
      <CookieBanner />
    </div>
  );
}

export default App;
