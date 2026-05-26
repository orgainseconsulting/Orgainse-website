import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

const SESSION_KEY = 'orgainse_admin_auth';
const SESSION_MS = 8 * 60 * 60 * 1000; // 8h, matches server JWT TTL

const readSession = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeSession = (data) => {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch { /* ignore */ }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  }, []);

  /**
   * persist:
   *   { token, email, name, must_change_password, is_super_admin? }
   * Token may be a short-lived password-change token until the user resets.
   */
  const persistLogin = useCallback((payload) => {
    const data = {
      authenticated: true,
      timestamp: Date.now(),
      token: payload.token,
      email: payload.email,
      username: payload.email, // legacy field
      name: payload.name || '',
      must_change_password: !!payload.must_change_password,
      is_super_admin: !!payload.is_super_admin,
    };
    writeSession(data);
    setIsAuthenticated(true);
    setUser({
      email: data.email,
      username: data.email,
      name: data.name,
      must_change_password: data.must_change_password,
      is_super_admin: data.is_super_admin,
    });
  }, []);

  // Merge updates into the existing session (after auth/me or password change)
  const updateUser = useCallback((updates) => {
    const current = readSession() || {};
    const next = { ...current, ...updates };
    writeSession(next);
    setUser((prev) => ({ ...(prev || {}), ...updates }));
  }, []);

  // Backward-compat helper used by older consumers (just marks authenticated)
  const login = useCallback((username) => {
    setIsAuthenticated(true);
    setUser((prev) => prev || { username, email: username });
  }, []);

  const checkAuthStatus = useCallback(() => {
    try {
      const parsed = readSession();
      if (parsed?.authenticated && parsed?.token && (Date.now() - parsed.timestamp) < SESSION_MS) {
        setIsAuthenticated(true);
        setUser({
          email: parsed.email || parsed.username,
          username: parsed.username || parsed.email,
          name: parsed.name || '',
          must_change_password: !!parsed.must_change_password,
          is_super_admin: !!parsed.is_super_admin,
        });
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
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      user,
      login,
      logout,
      checkAuthStatus,
      persistLogin,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
