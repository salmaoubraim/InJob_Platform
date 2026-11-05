import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import AppHeader from '../../components/layout/AppHeader';
import AuthField from '../../components/auth/AuthField';
import SubmitButton from '../../components/auth/SubmitButton';
import authService from '../../services/authService';
import { validateEmail } from '../../utils/validation';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { buildAuthSearch } from '../../utils/authModal';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setResetUrl('');
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setLoading(true);
    try {
      const data = await authService.forgotPassword(email.trim().toLowerCase());
      setInfo(data.message);
      if (data.reset_url) setResetUrl(data.reset_url);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erreur lors de la demande.'));
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
            to="/"
            className="inline-flex items-center gap-2 text-sm text-primary font-medium mb-6 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>

          <h1 className="text-2xl font-bold text-text-dark">Mot de passe oublié</h1>
          <p className="text-sm text-text-secondary mt-2 mb-6">
            Entrez votre email InJob. Vous recevrez un lien pour définir un nouveau mot de passe.
          </p>

          {info && (
            <div className="mb-4 p-3 rounded-xl bg-primary-soft text-text-dark text-sm">{info}</div>
          )}
          {resetUrl && (
            <div className="mb-4 p-3 rounded-xl bg-[#ECFDF5] text-sm break-all">
              <p className="font-semibold text-text-dark mb-1">Lien (mode développement) :</p>
              <a href={resetUrl} className="text-primary underline">
                {resetUrl}
              </a>
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-error text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <AuthField
              label="Adresse e-mail"
              type="email"
              placeholder="vous@exemple.com"
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              error={error}
            />
            <SubmitButton loading={loading}>Envoyer le lien</SubmitButton>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            <Link to={buildAuthSearch('login')} className="text-primary font-semibold hover:underline">
              Retour à la connexion
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
