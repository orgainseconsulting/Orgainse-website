import React, { Suspense } from "react";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

const RouteFallback = () => (
  <div
    data-testid="route-loading"
    className="min-h-screen bg-gray-100 flex items-center justify-center"
  >
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <CalendlyProvider>
          <RegionalPricingProvider>
            <BrowserRouter>
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
