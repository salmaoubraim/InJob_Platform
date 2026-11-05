import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MessageSquare, Send } from 'lucide-react';
import AppHeader from '../components/layout/AppHeader';
import InJobLogo from '../components/layout/InJobLogo';
import AuthModalHost from '../components/auth/AuthModalHost';
import LandingFooter from '../components/layout/LandingFooter';
import AuthField from '../components/auth/AuthField';
import SubmitButton from '../components/auth/SubmitButton';
import { useAuth } from '../context/AuthContext';
import { sendContactMessage } from '../services/contactService';
import { validateEmail, validateName } from '../utils/validation';
import { getApiErrorMessage } from '../utils/apiErrors';

const CONTACT_FIELD =
  'bg-white border-2 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/25';

export default function ContactPage() {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ nom: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        nom: `${user.prenom || ''} ${user.nom || ''}`.trim(),
        email: user.email || '',
      }));
    }
  }, [user]);

  const validate = () => {
    const next = {};
    if (!isAuthenticated) {
      next.nom = validateName(form.nom, 'Nom');
      next.email = validateEmail(form.email);
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      next.message = 'Message requis (10 caractères minimum)';
    }
    Object.keys(next).forEach((k) => !next[k] && delete next[k]);
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');
    if (!validate()) return;

    const nom = isAuthenticated
      ? `${user.prenom || ''} ${user.nom || ''}`.trim()
      : form.nom.trim();
    const email = isAuthenticated ? user.email : form.email.trim().toLowerCase();

    setLoading(true);
    try {
      const data = await sendContactMessage({
        nom,
        email,
        message: form.message.trim(),
      });
      setSuccess(data.message);
      setForm((prev) => ({
        nom: isAuthenticated ? nom : '',
        email: isAuthenticated ? email : '',
        message: '',
      }));
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'Envoi impossible. Réessayez.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-bg-page flex flex-col flex-1">
      <AppHeader />

      <main className="flex-1 flex items-center justify-center py-10 sm:py-14 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="bg-white rounded-2xl p-6 sm:p-10 auth-card">
            <div className="mb-6">
              <InJobLogo size="lg" centered />
            </div>

            <h1 className="text-2xl font-bold text-text-dark text-center">Contact</h1>
            <p className="text-sm text-text-secondary text-center mt-2 mb-6">
              {isAuthenticated
                ? 'Envoyez votre message — vos coordonnées sont préremplies depuis votre profil.'
                : 'Une question, un partenariat ou besoin d\'aide ? Écrivez-nous.'}
            </p>

            {success && (
              <div className="mb-4 p-3 rounded-xl bg-[#ECFDF5] text-success text-sm border border-accent/30">
                {success}
              </div>
            )}
            {apiError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-error text-sm">{apiError}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {isAuthenticated ? (
                <div className="rounded-xl border border-gray-200 bg-bg-page/60 px-4 py-3 text-sm space-y-1">
                  <p className="font-medium text-text-dark">{form.nom}</p>
                  <p className="text-text-secondary">{form.email}</p>
                </div>
              ) : (
                <>
                  <AuthField
                    label="Nom"
                    name="nom"
                    placeholder="Votre nom"
                    icon={User}
                    value={form.nom}
                    onChange={(e) => {
                      setForm({ ...form, nom: e.target.value });
                      setErrors((p) => ({ ...p, nom: '' }));
                    }}
                    error={errors.nom}
                    inputClassName={CONTACT_FIELD}
                  />

                  <AuthField
                    label="Adresse e-mail"
                    type="email"
                    name="email"
                    placeholder="vous@exemple.com"
                    icon={Mail}
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      setErrors((p) => ({ ...p, email: '' }));
                    }}
                    error={errors.email}
                    inputClassName={CONTACT_FIELD}
                  />
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-text-dark mb-1.5">
                  Message
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Votre message..."
                    value={form.message}
                    onChange={(e) => {
                      setForm({ ...form, message: e.target.value });
                      setErrors((p) => ({ ...p, message: '' }));
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white outline-none resize-y min-h-[120px] text-text-dark placeholder:text-text-secondary/50 ${
                      errors.message
                        ? 'border-2 border-error focus:border-error focus:ring-2 focus:ring-error/25'
                        : CONTACT_FIELD
                    }`}
                  />
                </div>
                {errors.message && (
                  <p className="text-sm text-error mt-1">{errors.message}</p>
                )}
              </div>

              <SubmitButton loading={loading}>
                <span className="inline-flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Envoyer le message
                </span>
              </SubmitButton>
            </form>
          </div>
        </motion.div>
      </main>

      <LandingFooter />
      <AuthModalHost />
    </div>
  );
}
