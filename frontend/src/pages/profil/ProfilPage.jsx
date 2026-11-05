import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import AuthField from '../../components/auth/AuthField';
import SubmitButton from '../../components/auth/SubmitButton';
import ProfilePhotoField from '../../components/profil/ProfilePhotoField';
import PasswordChangeForm from '../../components/profil/PasswordChangeForm';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, updatePassword } from '../../services/profileService';
import { fetchCategories } from '../../services/offreService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { validateEmail, validateName } from '../../utils/validation';
import { getUserPhotoUrl } from '../../utils/mediaUrl';
import PageShell from '../../components/ui/PageShell';

const PROFILE_INPUT =
  'bg-bg-page border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20';

export default function ProfilPage() {
  const { user, setUserData, refreshUser } = useAuth();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const [profile, setProfile] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    id_categorie: '',
    competences: '',
    experience: '',
    nom_entreprise: '',
    description_entreprise: '',
    site_web: '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileApiError, setProfileApiError] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    mot_de_passe_actuel: '',
    mot_de_passe: '',
    mot_de_passe_confirmation: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordApiError, setPasswordApiError] = useState('');
  const [passwordAttempted, setPasswordAttempted] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!user) return;
    setProfile({
      prenom: user.prenom || '',
      nom: user.nom || '',
      email: user.email || '',
      telephone: user.telephone || '',
      adresse: user.adresse || user.candidat?.adresse || user.recruteur?.ville || '',
      ville: user.candidat?.ville || user.recruteur?.ville || '',
      id_categorie: user.candidat?.id_categorie ? String(user.candidat.id_categorie) : '',
      competences: user.candidat?.competences || '',
      experience: user.candidat?.experience || '',
      nom_entreprise: user.recruteur?.nom_entreprise || '',
      description_entreprise: user.recruteur?.description_entreprise || '',
      site_web: user.recruteur?.site_web || '',
    });
    setPhotoPreview(getUserPhotoUrl(user));
  }, [user]);

  if (user?.role === 'admin') {
    return <Navigate to="/admin/parametres?tab=profil" replace />;
  }

  const validateProfile = () => {
    const next = {};
    next.prenom = validateName(profile.prenom, 'Prénom');
    next.nom = validateName(profile.nom, 'Nom');
    next.email = validateEmail(profile.email);
    Object.keys(next).forEach((k) => !next[k] && delete next[k]);
    setProfileErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileApiError('');
    setProfileSuccess('');
    if (!validateProfile()) return;

    setProfileLoading(true);
    try {
      const fd = new FormData();
      fd.append('prenom', profile.prenom.trim());
      fd.append('nom', profile.nom.trim());
      fd.append('email', profile.email.trim().toLowerCase());
      if (profile.telephone.trim()) fd.append('telephone', profile.telephone.trim());
      if (profile.adresse.trim()) fd.append('adresse', profile.adresse.trim());
      if (profile.ville.trim()) fd.append('ville', profile.ville.trim());
      if (isCandidat && profile.id_categorie) {
        fd.append('id_categorie', profile.id_categorie);
      }
      if (profile.competences.trim()) fd.append('competences', profile.competences.trim());
      if (profile.experience.trim()) fd.append('experience', profile.experience.trim());
      if (profile.nom_entreprise.trim()) fd.append('nom_entreprise', profile.nom_entreprise.trim());
      if (profile.description_entreprise.trim()) {
        fd.append('description_entreprise', profile.description_entreprise.trim());
      }
      if (profile.site_web.trim()) fd.append('site_web', profile.site_web.trim());
      if (photoFile) fd.append('photo', photoFile);

      const data = await updateProfile(fd);
      if (photoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
      setUserData(data.user);
      setPhotoPreview(getUserPhotoUrl(data.user));
      setProfileSuccess(data.message);
      setPhotoFile(null);
      await refreshUser();
    } catch (err) {
      setProfileApiError(getApiErrorMessage(err, 'Enregistrement impossible.'));
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const validatePasswordForm = () => {
    const next = {};
    if (!passwordForm.mot_de_passe_actuel) {
      next.mot_de_passe_actuel = 'Mot de passe actuel requis';
    }
    if (!passwordForm.mot_de_passe || passwordForm.mot_de_passe.length < 8) {
      next.mot_de_passe = 'Minimum 8 caractères';
    }
    if (
      passwordForm.mot_de_passe &&
      passwordForm.mot_de_passe !== passwordForm.mot_de_passe_confirmation
    ) {
      next.mot_de_passe_confirmation = 'Les mots de passe ne correspondent pas';
    }
    Object.keys(next).forEach((k) => !next[k] && delete next[k]);
    setPasswordErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordAttempted(true);
    setPasswordApiError('');
    setPasswordSuccess('');
    if (!validatePasswordForm()) return;

    setPasswordLoading(true);
    try {
      const data = await updatePassword({
        mot_de_passe_actuel: passwordForm.mot_de_passe_actuel,
        mot_de_passe: passwordForm.mot_de_passe,
        mot_de_passe_confirmation: passwordForm.mot_de_passe_confirmation,
      });
      setPasswordSuccess(data.message);
      setPasswordForm({
        mot_de_passe_actuel: '',
        mot_de_passe: '',
        mot_de_passe_confirmation: '',
      });
      setPasswordErrors({});
      setPasswordAttempted(false);
    } catch (err) {
      setPasswordApiError(getApiErrorMessage(err, 'Mise à jour impossible.'));
    } finally {
      setPasswordLoading(false);
    }
  };

  const isCandidat = user?.role === 'candidat';
  const isRecruteur = user?.role === 'recruteur';
  const profileTitle = isRecruteur ? 'Profil entreprise' : 'Mon profil';
  const profileSubtitle = isRecruteur
    ? 'Informations de votre entreprise visibles par les candidats.'
    : 'Complétez votre profil pour maximiser vos chances auprès des recruteurs.';

  return (
    <PageShell
      title={profileTitle}
      subtitle={profileSubtitle}
    >
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <section className="bg-white rounded-2xl p-6 sm:p-8 auth-card">
          <form onSubmit={handleProfileSubmit} className="space-y-4" noValidate>
            {profileSuccess && (
              <div className="p-3 rounded-xl bg-[#ECFDF5] text-success text-sm border border-accent/30">
                {profileSuccess}
              </div>
            )}
            {profileApiError && (
              <div className="p-3 rounded-xl bg-red-50 text-error text-sm">{profileApiError}</div>
            )}

            <ProfilePhotoField
              user={user}
              photoPreview={photoPreview}
              onPhotoChange={handlePhotoChange}
            />

            <AuthField
              label="Nom"
              name="nom"
              icon={User}
              value={`${profile.prenom} ${profile.nom}`.trim()}
              onChange={(e) => {
                const parts = e.target.value.trim().split(/\s+/).filter(Boolean);
                const prenom = parts[0] || '';
                const nom = parts.length > 1 ? parts.slice(1).join(' ') : prenom;
                setProfile({ ...profile, prenom, nom });
                setProfileErrors((p) => ({ ...p, prenom: '', nom: '' }));
              }}
              error={profileErrors.prenom || profileErrors.nom}
              inputClassName={PROFILE_INPUT}
            />

            <AuthField
              label="Adresse e-mail"
              type="email"
              name="email"
              icon={Mail}
              value={profile.email}
              onChange={(e) => {
                setProfile({ ...profile, email: e.target.value });
                setProfileErrors((p) => ({ ...p, email: '' }));
              }}
              error={profileErrors.email}
              inputClassName={PROFILE_INPUT}
            />

            <AuthField
              label="Téléphone (optionnel)"
              name="telephone"
              icon={Phone}
              value={profile.telephone}
              onChange={(e) => setProfile({ ...profile, telephone: e.target.value })}
              inputClassName={PROFILE_INPUT}
            />

            <AuthField
              label="Adresse"
              name="adresse"
              icon={MapPin}
              placeholder="Ex : Rabat, Maroc"
              value={profile.adresse}
              onChange={(e) => setProfile({ ...profile, adresse: e.target.value })}
              inputClassName={PROFILE_INPUT}
            />

            {isCandidat && (
              <>
                <AuthField
                  label="Domaine professionnel principal"
                  type="select"
                  name="id_categorie"
                  icon={Briefcase}
                  value={profile.id_categorie}
                  onChange={(e) => setProfile({ ...profile, id_categorie: e.target.value })}
                  inputClassName={PROFILE_INPUT}
                >
                  <option value="">Choisir votre domaine</option>
                  {categories.map((c) => (
                    <option key={c.id_categorie} value={c.id_categorie}>
                      {c.nom_categorie}
                    </option>
                  ))}
                </AuthField>
                <p className="text-xs text-text-secondary -mt-2">
                  Postulez aux offres de votre métier principal ou liées à vos compétences (y compris hors domaine).
                </p>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Compétences
                  </label>
                  <textarea
                    value={profile.competences}
                    onChange={(e) => setProfile({ ...profile, competences: e.target.value })}
                    rows={3}
                    className={`w-full ${PROFILE_INPUT} px-3 py-2 text-sm`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Expérience
                  </label>
                  <textarea
                    value={profile.experience}
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                    rows={3}
                    className={`w-full ${PROFILE_INPUT} px-3 py-2 text-sm`}
                  />
                </div>
              </>
            )}

            {isRecruteur && (
              <>
                <AuthField
                  label="Nom de l'entreprise"
                  name="nom_entreprise"
                  value={profile.nom_entreprise}
                  onChange={(e) => setProfile({ ...profile, nom_entreprise: e.target.value })}
                  inputClassName={PROFILE_INPUT}
                />
                <AuthField
                  label="Site web"
                  name="site_web"
                  value={profile.site_web}
                  onChange={(e) => setProfile({ ...profile, site_web: e.target.value })}
                  inputClassName={PROFILE_INPUT}
                />
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Description entreprise
                  </label>
                  <textarea
                    value={profile.description_entreprise}
                    onChange={(e) =>
                      setProfile({ ...profile, description_entreprise: e.target.value })
                    }
                    rows={4}
                    className={`w-full ${PROFILE_INPUT} px-3 py-2 text-sm`}
                  />
                </div>
              </>
            )}

            <SubmitButton loading={profileLoading}>Enregistrer</SubmitButton>
          </form>
        </section>

        <section className="bg-white rounded-2xl p-6 sm:p-8 auth-card">
          <h2 className="text-lg font-semibold text-text-dark mb-4">
            Changer le mot de passe
          </h2>
          <PasswordChangeForm
            passwordForm={passwordForm}
            setPasswordForm={setPasswordForm}
            passwordErrors={passwordErrors}
            setPasswordErrors={setPasswordErrors}
            passwordLoading={passwordLoading}
            passwordSuccess={passwordSuccess}
            passwordApiError={passwordApiError}
            attempted={passwordAttempted}
            onSubmit={handlePasswordSubmit}
          />
        </section>
      </div>
    </PageShell>
  );
}
