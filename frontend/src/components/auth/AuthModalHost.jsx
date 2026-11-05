import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import AuthModal from './AuthModal';
import { useAuthModal } from '../../context/AuthModalContext';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/storage';

/** Modale connexion/inscription disponible sur toutes les pages publiques. */
export default function AuthModalHost() {
  const navigate = useNavigate();
  const { mode, registerRole, closeAuth, switchMode } = useAuthModal();
  const { isAuthenticated, user } = useAuth();

  const handleAuthSuccess = (path) => {
    closeAuth();
    navigate(path);
  };

  useEffect(() => {
    if (mode && isAuthenticated && user) {
      closeAuth();
      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [mode, isAuthenticated, user, navigate, closeAuth]);

  return (
    <AuthModal
      mode={mode}
      initialRole={registerRole}
      onClose={closeAuth}
      onSwitchMode={(nextMode) => {
        switchMode(nextMode, nextMode === 'register' ? registerRole : undefined);
      }}
      onSuccess={handleAuthSuccess}
    />
  );
}
