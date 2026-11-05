import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import authService from '../services/authService';
import { storage, getDashboardPath } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.getUser());
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((data) => {
    storage.setToken(data.token);
    storage.setUser(data.user);
    setUser(data.user);
    return getDashboardPath(data.user.role);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    return persistSession(data);
  };

  const register = async (formData) => {
    const data = await authService.register(formData);
    return persistSession(data);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    storage.clear();
  };

  const setUserData = useCallback((nextUser) => {
    storage.setUser(nextUser);
    setUser({ ...nextUser });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!storage.getToken()) {
      setLoading(false);
      return;
    }
    try {
      const { user: freshUser } = await authService.getUser();
      storage.setUser(freshUser);
      setUser(freshUser);
    } catch {
      storage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user && storage.isAuthenticated(),
        login,
        register,
        logout,
        getDashboardPath,
        setUserData,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
