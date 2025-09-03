import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const authData = sessionStorage.getItem('orgainse_admin_auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        const now = Date.now();
        const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours
        
        // Check if session is still valid
        if (parsed.authenticated && (now - parsed.timestamp) < sessionDuration) {
          setIsAuthenticated(true);
          setUser({ username: parsed.username });
        } else {
          // Session expired
          logout();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (username) => {
    setIsAuthenticated(true);
    setUser({ username });
    
    // Update session storage
    sessionStorage.setItem('orgainse_admin_auth', JSON.stringify({
      authenticated: true,
      timestamp: Date.now(),
      username: username
    }));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    sessionStorage.removeItem('orgainse_admin_auth');
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;