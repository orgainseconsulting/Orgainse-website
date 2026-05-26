import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

const SESSION_KEY = 'orgainse_admin_auth';
const SESSION_MS = 8 * 60 * 60 * 1000; // 8h, matches server JWT TTL

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  }, []);

  const login = useCallback((username) => {
    setIsAuthenticated(true);
    setUser({ username });
  }, []);

  const checkAuthStatus = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.authenticated && parsed?.token && (Date.now() - parsed.timestamp) < SESSION_MS) {
        setIsAuthenticated(true);
        setUser({ username: parsed.username });
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => { checkAuthStatus(); }, [checkAuthStatus]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
