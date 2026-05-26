/**
 * Booking configuration.
 *
 * We replaced Calendly with Google Calendar Appointment Scheduling
 * (a Google Workspace feature). Paste your public booking URL below.
 *
 * How to get yours:
 *   1. Open https://calendar.google.com
 *   2. Create → Appointment schedule → set title/duration/availability
 *   3. Save → click "Open booking page" → copy the URL (looks like
 *      https://calendar.app.google/XXXXXXXX)
 *   4. Replace BOOKING_URL below.
 */
export const BOOKING_URL =
  process.env.REACT_APP_BOOKING_URL ||
  'https://calendar.app.google/i8mBG9yQzmUkeeRy6';

export function openBookingPage(url) {
  const target = url || BOOKING_URL;
  // Open in a new tab so the user keeps your site in their history.
  window.open(target, '_blank', 'noopener,noreferrer');
}
