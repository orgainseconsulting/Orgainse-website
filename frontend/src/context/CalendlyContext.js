import React, { createContext, useContext } from "react";
import { openBookingPage, BOOKING_URL } from "../lib/booking";

// Google Calendar Booking Context (replaces Calendly).
// Name kept for backwards-compat with existing consumers.
const CalendlyContext = createContext(null);

export const CalendlyProvider = ({ children }) => (
  <CalendlyContext.Provider value={{ openCalendly: openBookingPage, bookingUrl: BOOKING_URL }}>
    {children}
  </CalendlyContext.Provider>
);

export const useCalendly = () => {
  const ctx = useContext(CalendlyContext);
  if (!ctx) {
    throw new Error("useCalendly must be used within a CalendlyProvider");
  }
  return ctx;
};
