import React, { useEffect, useState } from 'react';

/**
 * Lightweight cookie / consent banner.
 * - Stored choice in localStorage under "orgainse_consent"
 * - Two-button: Accept all / Reject non-essential
 * - On reject, we noop (analytics scripts already loaded in index.html;
 *   a fuller implementation should gate them based on this value)
 */
const STORAGE_KEY = 'orgainse_consent';

export default function CookieBanner() {
  const [decision, setDecision] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  });

  useEffect(() => {
    if (decision === 'accepted' || decision === 'rejected') {
      try { localStorage.setItem(STORAGE_KEY, decision); } catch { /* ignore */ }
    }
  }, [decision]);

  if (decision === 'accepted' || decision === 'rejected') return null;

  return (
    <div
      data-testid="cookie-banner"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md bg-slate-900 text-white rounded-2xl shadow-2xl p-5 z-[60] border border-white/10"
      role="dialog"
      aria-label="Cookie consent"
    >
      <p className="text-sm leading-relaxed mb-4">
        We use essential cookies and (with your consent) analytics cookies to
        understand how visitors interact with the site. See our{' '}
        <a href="/privacy" className="underline hover:text-orange-300">
          Privacy Policy
        </a>{' '}
        for details.
      </p>
      <div className="flex gap-2">
        <button
          data-testid="cookie-reject-btn"
          onClick={() => setDecision('rejected')}
          className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-white/30 hover:bg-white/10 transition"
        >
          Reject non-essential
        </button>
        <button
          data-testid="cookie-accept-btn"
          onClick={() => setDecision('accepted')}
          className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-orange-500 to-green-500 hover:opacity-90 transition"
        >
          Accept all
        </button>
      </div>
    </div>
  );
}
