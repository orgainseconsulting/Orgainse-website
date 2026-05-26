import React, { useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, Shield, Lock, Mail } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const AdminLogin = ({ onLogin }) => {
  const { persistLogin } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const email = credentials.email.trim().toLowerCase();
      if (!email.endsWith('@orgainse.com')) {
        throw new Error('Only @orgainse.com accounts may sign in.');
      }
      const res = await api.adminLogin(email, credentials.password);
      persistLogin({
        token: res.token,
        email: res.email || email,
        name: res.name || '',
        must_change_password: !!res.must_change_password,
        is_super_admin: !!res.is_super_admin,
      });
      if (res.must_change_password) {
        toast.message('Welcome. Please set a new password to continue.');
      } else {
        toast.success(`Welcome back, ${res.name || res.email}`);
      }
      onLogin(res.email || email);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((p) => ({ ...p, [name]: value }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-orange-200 to-yellow-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-green-200 to-blue-200 rounded-full blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-orange-500 to-green-500 rounded-full shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Portal</h1>
          <p className="text-slate-600">Orgainse Consulting · @orgainse.com only</p>
        </div>

        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Work email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  data-testid="admin-email-input"
                  type="email"
                  id="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white/80"
                  placeholder="you@orgainse.com"
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  data-testid="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white/80"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  data-testid="admin-toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-orange-500 transition-colors"
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-slate-400" /> : <Eye className="h-5 w-5 text-slate-400" />}
                </button>
              </div>
            </div>

            {error && (
              <div data-testid="admin-login-error" className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              data-testid="admin-login-submit-btn"
              type="submit"
              disabled={isLoading || !credentials.email || !credentials.password}
              className="w-full bg-gradient-to-r from-orange-500 to-green-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-orange-600 hover:to-green-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" /> Access Dashboard
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-xs text-center">
              First-time sign-in? You'll be asked to set a new password. Need help? Ping the super-admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
