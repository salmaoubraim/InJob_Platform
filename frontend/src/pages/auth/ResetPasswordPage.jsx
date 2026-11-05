import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import AppHeader from '../../components/layout/AppHeader';
import AuthField from '../../components/auth/AuthField';
import SubmitButton from '../../components/auth/SubmitButton';
import PasswordStrength from '../../components/auth/PasswordStrength';
import authService from '../../services/authService';
import { validateEmail, validatePassword } from '../../utils/validation';
import { getApiErrorMessage } from '../../utils/apiErrors';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    token: searchParams.get('token') || '',
    mot_de_passe: '',
    mot_de_passe_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const next = {};
    next.email = validateEmail(form.email);
    if (!form.token) next.token = 'Lien invalide — redemandez un email.';
    next.mot_de_passe = validatePassword(form.mot_de_passe);
    if (form.mot_de_passe !== form.mot_de_passe_confirmation) {
      next.mot_de_passe_confirmation = 'Les mots de passe ne correspondent pas';
    }
    Object.keys(next).forEach((k) => !next[k] && delete next[k]);
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const data = await authService.resetPassword({
        email: form.email.trim().toLowerCase(),
        token: form.token,
        mot_de_passe: form.mot_de_passe,
        mot_de_passe_confirmation: form.mot_de_passe_confirmation,
      });
      setSuccess(data.message);
      setTimeout(() => navigate('/?auth=login', { replace: true }), 2000);
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'Réinitialisation impossible.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-page flex flex-col">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-10 auth-card"
        >
          <Link
            to="/mot-de-passe-oublie"
            className="inline-flex items-center gap-2 text-sm text-primary font-medium mb-6 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>

          <h1 className="text-2xl font-bold text-text-dark">Nouveau mot de passe</h1>
          <p className="text-sm text-text-secondary mt-2 mb-6">
            Choisissez un mot de passe sécurisé (8 caractères minimum).
          </p>

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-[#ECFDF5] text-success text-sm">{success}</div>
          )}
          {apiError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-error text-sm">{apiError}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <AuthField
              label="Adresse e-mail"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />
            <AuthField
              label="Nouveau mot de passe"
              type="password"
              icon={Lock}
              value={form.mot_de_passe}
              onChange={(e) => setForm({ ...form, mot_de_passe: e.target.value })}
              error={errors.mot_de_passe}
            />
            <PasswordStrength password={form.mot_de_passe} />
            <AuthField
              label="Confirmer le mot de passe"
              type="password"
              icon={Lock}
              value={form.mot_de_passe_confirmation}
              onChange={(e) =>
                setForm({ ...form, mot_de_passe_confirmation: e.target.value })
              }
              error={errors.mot_de_passe_confirmation}
            />
            <SubmitButton loading={loading}>Enregistrer</SubmitButton>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
