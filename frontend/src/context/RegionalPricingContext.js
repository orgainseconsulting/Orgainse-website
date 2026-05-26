import React, { createContext, useContext, useEffect, useState } from "react";

// Regional Pricing and Currency System
export const REGION_CONFIG = {
  US: { currency: "USD", symbol: "$", pppMultiplier: 1.0, locale: "en-US", name: "United States" },
  IN: { currency: "INR", symbol: "₹", pppMultiplier: 5.5, locale: "en-IN", name: "India" },
  GB: { currency: "GBP", symbol: "£", pppMultiplier: 0.85, locale: "en-GB", name: "United Kingdom" },
  AE: { currency: "AED", symbol: "AED", pppMultiplier: 0.75, locale: "ar-AE", name: "United Arab Emirates" },
  AU: { currency: "AUD", symbol: "A$", pppMultiplier: 0.9, locale: "en-AU", name: "Australia" },
  NZ: { currency: "NZD", symbol: "NZ$", pppMultiplier: 0.85, locale: "en-NZ", name: "New Zealand" },
  ZA: { currency: "ZAR", symbol: "R", pppMultiplier: 0.35, locale: "en-ZA", name: "South Africa" },
  EU: { currency: "EUR", symbol: "€", pppMultiplier: 0.9, locale: "en-EU", name: "Europe" },
};

export const DEFAULT_REGION = "US";

const mapCountryToRegion = (countryCode) => {
  const mapping = {
    US: "US", CA: "US",
    IN: "IN",
    GB: "GB",
    AE: "AE", SA: "AE", QA: "AE",
    AU: "AU",
    NZ: "NZ",
    ZA: "ZA",
    DE: "EU", FR: "EU", IT: "EU", ES: "EU", NL: "EU",
    BE: "EU", AT: "EU", PT: "EU", IE: "EU", DK: "EU",
    SE: "EU", NO: "EU", FI: "EU", CH: "EU", PL: "EU",
  };
  return mapping[countryCode] || DEFAULT_REGION;
};

const mapTimezoneToRegion = (timezone) => {
  if (timezone.includes("America")) return "US";
  if (timezone.includes("India") || timezone.includes("Kolkata")) return "IN";
  if (timezone.includes("London")) return "GB";
  if (timezone.includes("Dubai")) return "AE";
  if (timezone.includes("Australia")) return "AU";
  if (timezone.includes("Auckland")) return "NZ";
  if (timezone.includes("Africa")) return "ZA";
  if (timezone.includes("Europe")) return "EU";
  return DEFAULT_REGION;
};

const RegionalPricingContext = createContext(null);

export const useRegionalPricing = () => {
  const ctx = useContext(RegionalPricingContext);
  if (!ctx) {
    throw new Error("useRegionalPricing must be used within a RegionalPricingProvider");
  }
  return ctx;
};

export const RegionalPricingProvider = ({ children }) => {
  const [currentRegion, setCurrentRegion] = useState(DEFAULT_REGION);
  const [isLoading, setIsLoading] = useState(true);
  const [userOverride, setUserOverride] = useState(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("orgainse_region");
      if (cached && REGION_CONFIG[cached]) {
        setCurrentRegion(cached);
        setIsLoading(false);
        return;
      }
    } catch {
      /* ignore */
    }

    const detectRegion = async () => {
      let detected = null;
      try {
        // Proxy through our own API so the browser never sees the cross-origin
        // request to ipapi.co (kills the CORS console noise and lets us swap
        // providers without touching the SPA).
        const backend = process.env.REACT_APP_BACKEND_URL || "";
        const response = await fetch(`${backend}/api/geo`);
        if (response.ok) {
          const data = await response.json();
          if (data?.country_code) {
            detected = mapCountryToRegion(data.country_code);
          }
        }
      } catch {
        /* silent */
      }

      if (!detected) {
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          detected = mapTimezoneToRegion(tz);
        } catch {
          /* keep default */
        }
      }

      if (detected && !userOverride) {
        setCurrentRegion(detected);
        try { localStorage.setItem("orgainse_region", detected); } catch { /* ignore */ }
      }
      setIsLoading(false);
    };

    detectRegion();
  }, [userOverride]);

  const formatCurrency = (amount, region = currentRegion) => {
    const cfg = REGION_CONFIG[region];
    try {
      return new Intl.NumberFormat(cfg.locale, {
        style: "currency",
        currency: cfg.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${cfg.symbol}${Math.round(amount).toLocaleString()}`;
    }
  };

  const calculateRegionalPrice = (basePrice, region = currentRegion) => {
    const cfg = REGION_CONFIG[region];
    return Math.round(basePrice * cfg.pppMultiplier);
  };

  const getRegionalPrice = (basePrice) => formatCurrency(calculateRegionalPrice(basePrice));

  const changeRegion = (newRegion) => {
    setCurrentRegion(newRegion);
    setUserOverride(true);
    try { localStorage.setItem("orgainse_region", newRegion); } catch { /* ignore */ }
  };

  const value = {
    currentRegion,
    regionConfig: REGION_CONFIG[currentRegion],
    allRegions: REGION_CONFIG,
    isLoading,
    formatCurrency,
    calculateRegionalPrice,
    getRegionalPrice,
    changeRegion,
    userOverride,
  };

  return (
    <RegionalPricingContext.Provider value={value}>
      {children}
    </RegionalPricingContext.Provider>
  );
};
