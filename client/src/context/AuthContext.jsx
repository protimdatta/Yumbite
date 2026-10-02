import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userAPI } from '../services/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'yumbite_user_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on load
  useEffect(() => {
    const restore = async () => {
      const stored = (() => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } })();
      if (!stored) { setIsLoading(false); return; }
      try {
        const res = await userAPI.me(stored);
        if (res.success) {
          setUser(res.data);
          setToken(stored);
        } else {
          try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
          setToken(null);
        }
      } catch {
        try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  const persist = (t) => {
    setToken(t);
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    } catch { /* storage unavailable */ }
  };

  const login = useCallback(async (email, password) => {
    const res = await userAPI.login(email, password);
    if (res.success) {
      persist(res.token);
      setUser(res.user);
      return { success: true };
    }
    return { success: false, message: res.message };
  }, []);

  const signup = useCallback(async (data) => {
    const res = await userAPI.register(data);
    if (res.success) {
      persist(res.token);
      setUser(res.user);
      return { success: true };
    }
    return { success: false, message: res.message };
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    const res = await userAPI.google(idToken);
    if (res.success) {
      persist(res.token);
      setUser(res.user);
      return { success: true, isNew: !!res.isNew };
    }
    return { success: false, message: res.message };
  }, []);

  const logout = useCallback(() => {
    persist(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const stored = (() => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } })();
    const res = await userAPI.updateMe(data, stored);
    if (res.success) {
      setUser(res.data);
      return { success: true };
    }
    return { success: false, message: res.message };
  }, []);

  const value = {
    user,
    token,
    isLoading,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}