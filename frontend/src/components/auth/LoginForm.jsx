import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import AuthField from './AuthField';
import SubmitButton from './SubmitButton';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/validation';
import { getApiErrorMessage } from '../../utils/apiErrors';

const REMEMBER_KEY = 'injob_remember_email';

export default function LoginForm({ onSuccess, onSwitchToRegister }) {
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: localStorage.getItem(REMEMBER_KEY) || '',
    mot_de_passe: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [apiError, setApiError] = useState('');
  const [remember, setRemember] = useState(!!localStorage.getItem(REMEMBER_KEY));

  const validate = () => {
    const next = {};
    const emailErr = validateEmail(form.email);
    if (emailErr) next.email = emailErr;
    if (!form.mot_de_passe) next.mot_de_passe = 'Mot de passe requis';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    try {
      if (remember) localStorage.setItem(REMEMBER_KEY, form.email);
      else localStorage.removeItem(REMEMBER_KEY);

      const path = await login({
        email: form.email.trim().toLowerCase(),
        mot_de_passe: form.mot_de_passe,
      });
      onSuccess(path);
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setApiError(getApiErrorMessage(err, 'Email ou mot de passe incorrect'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={shake ? 'animate-shake' : ''}
      noValidate
    >
      <h1 id="auth-modal-title" className="text-2xl font-bold text-text-dark pr-8">
        Connexion
      </h1>
      <p className="text-sm text-text-secondary mt-2">
        Pas encore de compte ?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-primary font-semibold hover:underline"
        >
          S&apos;inscrire
        </button>
      </p>

      <AnimatePresence>
        {apiError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-error text-sm"
          >
            {apiError}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 space-y-4">
        <AuthField
          label="Adresse email"
          type="email"
          name="email"
          placeholder="exemple@email.com"
          icon={Mail}
          value={form.email}
          onChange={(e) => {
            setForm({ ...form, email: e.target.value });
            setErrors((prev) => ({ ...prev, email: '' }));
          }}
          error={errors.email}
          autoComplete="email"
        />

        <AuthField
          label="Mot de passe"
          type="password"
          name="mot_de_passe"
          placeholder="••••••••"
          icon={Lock}
          value={form.mot_de_passe}
          onChange={(e) => {
            setForm({ ...form, mot_de_passe: e.target.value });
            setErrors((prev) => ({ ...prev, mot_de_passe: '' }));
          }}
          error={errors.mot_de_passe}
          autoComplete="current-password"
        />

        <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30"
          />
          Se souvenir de moi
        </label>
      </div>

      <div className="mt-6">
        <SubmitButton loading={loading}>Se connecter</SubmitButton>
      </div>
    </motion.form>
  );
}
