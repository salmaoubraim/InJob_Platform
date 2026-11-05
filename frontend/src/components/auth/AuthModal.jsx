import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

export default function AuthModal({
  mode,
  initialRole,
  onClose,
  onSwitchMode,
  onSuccess,
}) {
  useLockBodyScroll(!!mode);

  useEffect(() => {
    if (!mode) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {mode && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overscroll-contain"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-text-dark/40 backdrop-blur-md"
            aria-label="Fermer"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-md max-h-[min(90vh,720px)] overflow-y-auto rounded-2xl bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl shadow-primary/10 p-6 sm:p-8 auth-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-text-secondary hover:bg-primary-soft hover:text-primary transition-colors"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            {mode === 'login' ? (
              <LoginForm
                onSuccess={onSuccess}
                onSwitchToRegister={() => onSwitchMode('register')}
              />
            ) : (
              <RegisterForm
                initialRole={initialRole}
                onSuccess={onSuccess}
                onSwitchToLogin={() => onSwitchMode('login')}
              />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
