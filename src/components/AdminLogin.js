import React, { useState } from 'react';
import { Eye, EyeOff, Shield, Lock, User } from 'lucide-react';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple authentication - in production, this should be handled by a secure backend
    const validCredentials = {
      username: process.env.REACT_APP_ADMIN_USERNAME || 'orgainse_admin',
      password: process.env.REACT_APP_ADMIN_PASSWORD || 'OrgAInse@2025!'
    };

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (credentials.username === validCredentials.username && 
        credentials.password === validCredentials.password) {
      // Store authentication in sessionStorage (more secure than localStorage for admin)
      sessionStorage.setItem('orgainse_admin_auth', JSON.stringify({
        authenticated: true,
        timestamp: Date.now(),
        username: credentials.username
      }));
      onLogin(true);
    } else {
      setError('Invalid username or password. Please try again.');
    }

    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center p-4">
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-orange-200 to-yellow-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-green-200 to-blue-200 rounded-full blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-orange-500 to-green-500 rounded-full shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Portal</h1>
          <p className="text-slate-600">Orgainse Consulting Dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white/80"
                  placeholder="Enter your username"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white/80"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-orange-500 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !credentials.username || !credentials.password}
              className="w-full bg-gradient-to-r from-orange-500 to-green-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-orange-600 hover:to-green-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Access Dashboard
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-xs text-center">
              🔒 Secure admin access for Orgainse Consulting team only
            </p>
          </div>
        </div>

        {/* Development Info (only show in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-xs text-center">
              <strong>Dev Mode:</strong> Username: orgainse_admin | Password: OrgAInse@2025!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;