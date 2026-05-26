import { useEffect } from "react";

// Console-only diagnostic for analytics scripts. Renders nothing.
const AnalyticsDebug = () => {
  useEffect(() => {
    console.log("✅ Vercel Analytics component mounted");

    if (typeof window !== "undefined" && window.gtag) {
      console.log("✅ Google Analytics gtag function available");
      window.gtag("event", "page_view", {
        page_title: document.title,
        page_location: window.location.href,
      });
      console.log("📊 Sent page_view event to GA");
    } else {
      console.log("❌ Google Analytics gtag not found");
    }

    const t = setTimeout(() => {
      const vaScript = document.querySelector('script[src*="vitals.vercel-analytics.com"]');
      if (vaScript) {
        console.log("✅ Vercel Analytics script loaded");
      } else {
        console.log("❌ Vercel Analytics script not found");
      }
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  return null;
};

export default AnalyticsDebug;
