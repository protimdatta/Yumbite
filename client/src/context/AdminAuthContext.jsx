import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AdminAuthContext = createContext(null);

function safeGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function safeSet(key, value) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch { /* storage unavailable */ }
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => safeGet('admin_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = safeGet('admin_token');
      if (storedToken) {
        try {
          const response = await authAPI.getMe(storedToken);
          if (response.success) {
            setAdmin(response.data);
            setToken(storedToken);
          } else {
            safeSet('admin_token', null);
          }
        } catch (error) {
          safeSet('admin_token', null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await authAPI.login(email, password);
    if (response.success) {
      safeSet('admin_token', response.token);
      setToken(response.token);
      setAdmin(response.admin);
      return { success: true };
    }
    return { success: false, message: response.message };
  }, []);

  const logout = useCallback(() => {
    safeSet('admin_token', null);
    setToken(null);
    setAdmin(null);
  }, []);

  const updateAdmin = useCallback((data) => {
    setAdmin((prev) => ({ ...(prev || {}), ...data }));
  }, []);

  const value = {
    admin,
    token,
    isLoading,
    login,
    logout,
    updateAdmin,
    isAuthenticated: !!admin,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}