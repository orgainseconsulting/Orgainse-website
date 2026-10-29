import React, { useEffect, useState } from 'react';

/**
 * Lightweight cookie / consent banner.
 * - Stored choice in localStorage under "orgainse_consent"
 * - Two-button: Accept all / Reject non-essential
 * - Drives Google Consent Mode v2: analytics_storage stays "denied" until the
 *   visitor accepts (default is set in index.html before gtag('js'))
 */
const STORAGE_KEY = 'orgainse_consent';

export default function CookieBanner() {
  // 'pending' until mounted so prerendered HTML and first client render match.
  const [decision, setDecision] = useState('pending');

  useEffect(() => {
    try { setDecision(localStorage.getItem(STORAGE_KEY)); } catch { setDecision(null); }
  }, []);

  useEffect(() => {
    if (decision !== 'accepted' && decision !== 'rejected') return;
    try { localStorage.setItem(STORAGE_KEY, decision); } catch { /* ignore */ }
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: decision === 'accepted' ? 'granted' : 'denied',
      });
    }
  }, [decision]);

  if (decision === 'pending' || decision === 'accepted' || decision === 'rejected') return null;

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
        <a href="/privacy" className="underline hover:text-blue-300">
          Privacy Policy
        </a>{' '}
        for details.
      </p>
      <div className="flex gap-2">
        <button
          data-testid="cookie-reject-btn"
          onClick={() => setDecision('rejected')}
          className="flex-1 px-4 py-2 text-sm font-medium rounded-full border border-white/30 hover:bg-white/10 transition-colors"
        >
          Reject non-essential
        </button>
        <button
          data-testid="cookie-accept-btn"
          onClick={() => setDecision('accepted')}
          className="flex-1 px-4 py-2 text-sm font-semibold rounded-full bg-white text-slate-900 hover:bg-slate-100 transition-colors"
        >
          Accept all
        </button>
      </div>
    </div>
  );
}
