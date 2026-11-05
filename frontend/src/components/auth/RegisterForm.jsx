import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  MapPin,
  Globe,
  Check,
} from 'lucide-react';
import AuthField from './AuthField';
import SubmitButton from './SubmitButton';
import RoleSelector from './RoleSelector';
import { getApiErrorMessage } from '../../utils/apiErrors';
import PasswordStrength from './PasswordStrength';
import { useAuth } from '../../context/AuthContext';
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '../../utils/validation';
import { MOROCCAN_CITIES, SECTORS, COMPANY_SIZES } from '../../utils/constants';

function ProgressBar({ step, locked }) {
  const total = locked ? 1 : 2;
  const current = locked ? 1 : step;
  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs font-medium text-text-secondary mb-2">
        <span>
          Étape {current} sur {total}
        </span>
        <span>{locked || step === 2 ? 'Informations' : 'Profil'}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={false}
          animate={{ width: locked || step === 2 ? '100%' : '50%' }}
          transition={{ duration: 0.35 }}
        />
      </div>
    </div>
  );
}

export default function RegisterForm({
  initialRole,
  onSuccess,
  onSwitchToLogin,
}) {
  const { register } = useAuth();

  const lockedRole =
    initialRole === 'candidat' || initialRole === 'recruteur' ? initialRole : null;
  const [step, setStep] = useState(lockedRole ? 2 : 1);
  const [role, setRole] = useState(lockedRole || '');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [apiError, setApiError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    ville: '',
    mot_de_passe: '',
    mot_de_passe_confirmation: '',
    nom_entreprise: '',
    secteur: '',
    taille_entreprise: '',
    site_web: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (lockedRole) {
      setRole(lockedRole);
      setStep(2);
    }
  }, [lockedRole]);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validateStep1 = () => !!role;

  const validateStep2 = () => {
    const next = {};
    next.prenom = validateName(form.prenom, 'Prénom');
    next.nom = validateName(form.nom, 'Nom');
    next.email = validateEmail(form.email);
    next.telephone = validatePhone(form.telephone);
    if (!form.ville) next.ville = 'Ville requise';
    next.mot_de_passe = validatePassword(form.mot_de_passe);
    if (form.mot_de_passe !== form.mot_de_passe_confirmation) {
      next.mot_de_passe_confirmation = 'Les mots de passe ne correspondent pas';
    }
    if (role === 'recruteur') {
      if (!form.nom_entreprise?.trim()) next.nom_entreprise = 'Nom de l\'entreprise requis';
      if (!form.secteur) next.secteur = 'Secteur requis';
      if (!form.taille_entreprise) next.taille_entreprise = 'Taille requise';
    }
    if (!acceptedTerms) next.terms = 'Vous devez accepter les conditions';
    Object.keys(next).forEach((k) => !next[k] && delete next[k]);
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = () => ({
    nom: form.nom,
    prenom: form.prenom,
    email: form.email.trim().toLowerCase(),
    telephone: form.telephone ? `+212 ${form.telephone.replace(/^\+?212\s?/, '')}` : '',
    mot_de_passe: form.mot_de_passe,
    mot_de_passe_confirmation: form.mot_de_passe_confirmation,
    role: lockedRole || role,
    ville: form.ville,
    nom_entreprise: role === 'recruteur' ? form.nom_entreprise : undefined,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validateStep2()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    try {
      const path = await register(buildPayload());
      onSuccess(path);
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      const data = err.response?.data;
      if (data?.errors) {
        const fieldErrors = {};
        Object.entries(data.errors).forEach(([k, v]) => {
          fieldErrors[k] = v[0];
        });
        setErrors(fieldErrors);
      }
      setApiError(getApiErrorMessage(err, 'Inscription échouée. Réessayez.'));
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch =
    form.mot_de_passe_confirmation &&
    form.mot_de_passe === form.mot_de_passe_confirmation;

  const phoneField = (
    <AuthField
      label="Téléphone"
      type="tel"
      placeholder="6XX XXX XXX"
      icon={Phone}
      prefix={<span className="font-medium">🇲🇦 +212</span>}
      value={form.telephone}
      onChange={(e) => setField('telephone', e.target.value)}
      error={errors.telephone}
    />
  );

  const cityField = (
    <AuthField
      label="Ville"
      type="select"
      icon={MapPin}
      value={form.ville}
      onChange={(e) => setField('ville', e.target.value)}
      error={errors.ville}
    >
      <option value="">Sélectionnez une ville</option>
      {MOROCCAN_CITIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </AuthField>
  );

  const passwordFields = (
    <>
      <AuthField
        label="Mot de passe"
        type="password"
        icon={Lock}
        value={form.mot_de_passe}
        onChange={(e) => setField('mot_de_passe', e.target.value)}
        error={errors.mot_de_passe}
      />
      <PasswordStrength password={form.mot_de_passe} />
      <div className="relative">
        <AuthField
          label="Confirmer le mot de passe"
          type="password"
          icon={Lock}
          value={form.mot_de_passe_confirmation}
          onChange={(e) => setField('mot_de_passe_confirmation', e.target.value)}
          error={errors.mot_de_passe_confirmation}
        />
        {passwordsMatch && (
          <Check className="absolute right-3 top-[38px] w-5 h-5 text-success" />
        )}
      </div>
    </>
  );

  const termsBlock = (
    <div className="space-y-1">
      <label className="flex items-start gap-2 text-sm text-text-secondary cursor-pointer">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => {
            setAcceptedTerms(e.target.checked);
            setErrors((prev) => ({ ...prev, terms: '' }));
          }}
          className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30"
        />
        <span>
          J&apos;accepte les{' '}
          <button type="button" className="text-primary font-medium hover:underline">
            Conditions d&apos;utilisation
          </button>{' '}
          et la{' '}
          <button type="button" className="text-primary font-medium hover:underline">
            Politique de confidentialité
          </button>
        </span>
      </label>
      {errors.terms && <p className="text-sm text-error">{errors.terms}</p>}
    </div>
  );

  return (
    <>
      <ProgressBar step={step} locked={!!lockedRole} />

      {lockedRole && (
        <p className="text-sm text-primary font-medium mb-4 -mt-2">
          Inscription {lockedRole === 'recruteur' ? 'recruteur' : 'candidat'} uniquement
        </p>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && !lockedRole ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-bold text-text-dark pr-8">
              Choisissez votre profil
            </h1>
            <p className="text-sm text-text-secondary mt-2 mb-6">
              Déjà un compte ?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary font-semibold hover:underline"
              >
                Se connecter
              </button>
            </p>
            <RoleSelector selected={role} onSelect={setRole} />
            <button
              type="button"
              disabled={!validateStep1()}
              onClick={() => role && setStep(2)}
              className="mt-6 w-full h-12 rounded-xl bg-primary text-white font-semibold transition-all hover:bg-primary-dark hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuer
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className={shake ? 'animate-shake' : ''}
            noValidate
          >
            {!lockedRole && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-primary font-medium mb-4 hover:underline"
              >
                ← Retour au choix du profil
              </button>
            )}

            <h1 className="text-2xl font-bold text-text-dark pr-8">
              {role === 'recruteur'
                ? 'Créer votre compte recruteur'
                : 'Créer votre compte candidat'}
            </h1>
            <p className="text-sm text-text-secondary mt-2 mb-4">
              Déjà un compte ?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary font-semibold hover:underline"
              >
                Se connecter
              </button>
            </p>

            {apiError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-error text-sm">
                {apiError}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AuthField
                  label="Prénom"
                  placeholder="Votre prénom"
                  icon={User}
                  value={form.prenom}
                  onChange={(e) => setField('prenom', e.target.value)}
                  error={errors.prenom}
                />
                <AuthField
                  label="Nom"
                  placeholder="Votre nom"
                  value={form.nom}
                  onChange={(e) => setField('nom', e.target.value)}
                  error={errors.nom}
                />
              </div>

              <AuthField
                label={
                  role === 'recruteur'
                    ? 'Adresse email professionnelle'
                    : 'Adresse email'
                }
                type="email"
                placeholder={
                  role === 'recruteur' ? 'contact@entreprise.ma' : 'exemple@email.com'
                }
                icon={Mail}
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                error={errors.email}
              />

              {phoneField}
              {cityField}

              {role === 'recruteur' && (
                <>
                  <AuthField
                    label="Nom de l'entreprise"
                    placeholder="Ex: InnoTech Maroc"
                    icon={Building2}
                    value={form.nom_entreprise}
                    onChange={(e) => setField('nom_entreprise', e.target.value)}
                    error={errors.nom_entreprise}
                  />
                  <AuthField
                    label="Secteur d'activité"
                    type="select"
                    value={form.secteur}
                    onChange={(e) => setField('secteur', e.target.value)}
                    error={errors.secteur}
                  >
                    <option value="">Choisir un secteur</option>
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </AuthField>
                  <div>
                    <p className="text-sm font-medium text-text-dark mb-2">
                      Taille de l&apos;entreprise
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {COMPANY_SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setField('taille_entreprise', size)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                            form.taille_entreprise === size
                              ? 'border-accent bg-[#ECFDF5] text-text-dark'
                              : 'border-gray-200 bg-white text-text-secondary hover:border-gray-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    {errors.taille_entreprise && (
                      <p className="text-sm text-error mt-1">{errors.taille_entreprise}</p>
                    )}
                  </div>
                  <AuthField
                    label="Site web (optionnel)"
                    type="url"
                    placeholder="https://votre-site.ma"
                    icon={Globe}
                    value={form.site_web}
                    onChange={(e) => setField('site_web', e.target.value)}
                  />
                </>
              )}

              {passwordFields}
              {termsBlock}
            </div>

            <div className="mt-6">
              <SubmitButton
                loading={loading}
                variant={role === 'recruteur' ? 'light' : 'primary'}
              >
                {role === 'recruteur' ? 'Créer mon compte recruteur' : 'Créer mon compte'}
              </SubmitButton>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

    </>
  );
}
