import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle2, XCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { newsletterApi } from '../lib/newsletterApi';

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [state, setState] = useState('loading'); // loading | confirm | done | error | already
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setState('error'); setError('Missing unsubscribe token in the link.'); return; }
    newsletterApi.unsubscribeCheck(token)
      .then((r) => {
        setEmail(r.email || '');
        if (r.already_unsubscribed) setState('already');
        else setState('confirm');
      })
      .catch((e) => { setState('error'); setError(e.message || 'Invalid or expired link.'); });
  }, [token]);

  const confirm = async () => {
    try {
      await newsletterApi.unsubscribe(token);
      setState('done');
    } catch (e) { setState('error'); setError(e.message || 'Failed to unsubscribe'); }
  };

  return (
    <div className="min-h-screen bg-[#f6f5f1] flex items-center justify-center px-4 py-12">
      <SEOHead title="Unsubscribe — Orgainse Consulting" description="Manage your subscription to the Orgainse Pulse newsletter."
        canonical="https://www.orgainse.com/unsubscribe" noindex />
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 sm:p-10 text-center" data-testid="unsubscribe-card">
        {state === 'loading' && (
          <div>
            <div className="animate-spin h-10 w-10 border-b-2 border-orange-500 rounded-full mx-auto mb-4" />
            <p className="text-slate-500">Checking your subscription…</p>
          </div>
        )}
        {state === 'confirm' && (
          <>
            <Mail className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Unsubscribe from the Orgainse Pulse?</h1>
            <p className="text-slate-600 mb-1">We'll stop sending newsletter emails to:</p>
            <p className="font-mono text-sm text-slate-800 bg-slate-100 px-3 py-2 rounded inline-block mb-6" data-testid="unsubscribe-email">{email}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/newsletter" className="px-5 py-2.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50">
                Keep me subscribed
              </Link>
              <button onClick={confirm} data-testid="unsubscribe-confirm"
                className="px-5 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600">
                Unsubscribe
              </button>
            </div>
          </>
        )}
        {state === 'already' && (
          <>
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">You're already unsubscribed</h1>
            <p className="text-slate-600 mb-6">{email} is no longer receiving newsletter emails from us.</p>
            <Link to="/" className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800">Back to home</Link>
          </>
        )}
        {state === 'done' && (
          <>
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2" data-testid="unsubscribe-success">Unsubscribed</h1>
            <p className="text-slate-600 mb-6">We won't send newsletter emails to {email} anymore. Sorry to see you go.</p>
            <Link to="/" className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800">Back to home</Link>
          </>
        )}
        {state === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Link not valid</h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <Link to="/contact" className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800">Contact support</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
