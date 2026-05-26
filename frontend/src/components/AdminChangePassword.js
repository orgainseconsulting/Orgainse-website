import React, { useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

/**
 * Forced password-change screen. Rendered when the user's JWT was issued with
 * purpose=password_change and the server flagged must_change_password=true.
 *
 * On success the server issues a new full-access token; we persist it and
 * clear must_change_password.
 */
const AdminChangePassword = () => {
  const { user, persistLogin, logout } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.next.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (form.next !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.next === form.current) {
      setError('New password must be different from the temporary one.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.adminChangePassword(form.current, form.next);
      persistLogin({
        token: res.token,
        email: res.email || user?.email,
        name: res.name || user?.name || '',
        must_change_password: false,
        is_super_admin: typeof res.is_super_admin === 'boolean' ? res.is_super_admin : !!user?.is_super_admin,
      });
      toast.success('Password updated. Welcome aboard.');
    } catch (err) {
      setError(err.message || 'Could not update password.');
      toast.error(err.message || 'Could not update password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse" />
      </div>

      <div className="relative w-full max-w-md" data-testid="change-password-screen">
        <div className="text-center mb-6">
          <div className="inline-flex p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg mb-4">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Set your new password</h1>
          <p className="text-slate-600 text-sm">
            Signed in as <span className="font-semibold">{user?.email}</span>.
            Choose a strong password — you won't be asked again.
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current (temporary) password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  data-testid="change-password-current"
                  type={showCurrent ? 'text' : 'password'}
                  name="current"
                  value={form.current}
                  onChange={onChange}
                  className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/80"
                  required
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500"
                >
                  {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New password (min 8 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  data-testid="change-password-new"
                  type={showNew ? 'text' : 'password'}
                  name="next"
                  value={form.next}
                  onChange={onChange}
                  className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/80"
                  required
                  minLength={8}
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500"
                >
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm new password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  data-testid="change-password-confirm"
                  type={showNew ? 'text' : 'password'}
                  name="confirm"
                  value={form.confirm}
                  onChange={onChange}
                  className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/80"
                  required
                  minLength={8}
                  disabled={submitting}
                />
              </div>
            </div>

            {error && (
              <div data-testid="change-password-error" className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              data-testid="change-password-submit"
              type="submit"
              disabled={submitting || !form.current || !form.next || !form.confirm}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 mr-2" /> Save & continue
                </>
              )}
            </button>

            <button
              type="button"
              onClick={logout}
              className="w-full text-sm text-slate-500 hover:text-slate-700"
            >
              Sign out and return to login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminChangePassword;
