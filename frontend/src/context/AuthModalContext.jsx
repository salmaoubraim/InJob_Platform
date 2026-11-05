import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseAuthMode } from '../utils/authModal';

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState(null);
  const [registerRole, setRegisterRole] = useState(null);

  const openLogin = useCallback(() => {
    setMode('login');
    setRegisterRole(null);
  }, []);

  const openRegister = useCallback((role) => {
    setMode('register');
    setRegisterRole(role === 'candidat' || role === 'recruteur' ? role : null);
  }, []);

  const closeAuth = useCallback(() => {
    setMode(null);
    setRegisterRole(null);
    if (searchParams.get('auth')) {
      const next = new URLSearchParams(searchParams);
      next.delete('auth');
      next.delete('role');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const switchMode = useCallback((nextMode, role) => {
    setMode(nextMode);
    if (nextMode === 'register' && (role === 'candidat' || role === 'recruteur')) {
      setRegisterRole(role);
    } else if (nextMode === 'login') {
      setRegisterRole(null);
    }
  }, []);

  useEffect(() => {
    const fromUrl = parseAuthMode(searchParams);
    if (!fromUrl) return;
    setMode(fromUrl);
    const r = searchParams.get('role');
    setRegisterRole(r === 'candidat' || r === 'recruteur' ? r : null);
  }, [searchParams]);

  return (
    <AuthModalContext.Provider
      value={{
        mode,
        registerRole,
        openLogin,
        openRegister,
        closeAuth,
        switchMode,
        isOpen: !!mode,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider');
  return ctx;
}
