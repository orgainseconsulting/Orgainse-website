import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { openBookingPage, BOOKING_URL } from "../lib/booking";
import { api } from "../lib/api";
import HostPickerModal from "../components/HostPickerModal";

/**
 * Booking context. Replaces the old direct-link Calendly behavior with a
 * Host Picker modal driven by the configurable `/api/app-settings/public`
 * `hosts` list. If no hosts are configured (or the API fails) it falls back
 * to the single env-driven `BOOKING_URL` so the CTA always works.
 *
 * Name kept as `CalendlyContext` for backwards compatibility with existing
 * consumers (`useCalendly`).
 */
const CalendlyContext = createContext(null);

export const CalendlyProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [hosts, setHosts] = useState([]);
  const [fallbackUrl, setFallbackUrl] = useState(BOOKING_URL);
  const [loaded, setLoaded] = useState(false);

  // Lazy-load settings the first time the modal is asked to open so we
  // don't pay the cost on every page view.
  const loadSettings = useCallback(async () => {
    try {
      const res = await api.appSettingsPublic();
      const s = res?.settings || {};
      setHosts(Array.isArray(s.hosts) ? s.hosts : []);
      if (s.booking_url_default) setFallbackUrl(s.booking_url_default);
    } catch {
      /* keep env fallback */
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Pre-load in background after mount so the first click is instant.
    loadSettings();
  }, [loadSettings]);

  const openCalendly = useCallback(() => {
    // If we have an explicit host list (even one), always show the picker
    // so the host info is part of the booking experience.
    if (loaded && hosts.length === 0 && fallbackUrl) {
      openBookingPage(fallbackUrl);
      return;
    }
    setOpen(true);
    if (!loaded) loadSettings();
  }, [loaded, hosts, fallbackUrl, loadSettings]);

  return (
    <CalendlyContext.Provider
      value={{
        openCalendly,
        bookingUrl: fallbackUrl,
        hosts,
      }}
    >
      {children}
      <HostPickerModal
        open={open}
        onClose={() => setOpen(false)}
        hosts={hosts}
        fallbackUrl={fallbackUrl}
      />
    </CalendlyContext.Provider>
  );
};

export const useCalendly = () => {
  const ctx = useContext(CalendlyContext);
  if (!ctx) {
    throw new Error("useCalendly must be used within a CalendlyProvider");
  }
  return ctx;
};
