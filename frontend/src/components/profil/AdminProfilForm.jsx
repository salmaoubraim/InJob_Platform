import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import AuthField from '../auth/AuthField';
import ProfilePhotoField from './ProfilePhotoField';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/profileService';
import { getApiErrorMessage } from '../../utils/apiErrors';
import { validateEmail, validateName } from '../../utils/validation';
import { getUserPhotoUrl } from '../../utils/mediaUrl';
import { ROLE_LABELS } from '../../utils/profileMenu';

const PROFILE_INPUT =
  'bg-bg-page border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20';

function splitFullName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { prenom: '', nom: '' };
  if (parts.length === 1) return { prenom: parts[0], nom: parts[0] };
  return { prenom: parts[0], nom: parts.slice(1).join(' ') };
}

export default function AdminProfilForm() {
  const { user, setUserData, refreshUser } = useAuth();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [nomComplet, setNomComplet] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (!user) return;
    setNomComplet(`${user.prenom || ''} ${user.nom || ''}`.trim());
    setEmail(user.email || '');
    setPhotoPreview(getUserPhotoUrl(user));
    setRemovePhoto(false);
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setRemovePhoto(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');

    const { prenom, nom } = splitFullName(nomComplet);
    const nextErrors = {};
    nextErrors.nomComplet = validateName(prenom, 'Nom complet');
    nextErrors.email = validateEmail(email);
    Object.keys(nextErrors).forEach((k) => !nextErrors[k] && delete nextErrors[k]);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('prenom', prenom);
      fd.append('nom', nom || prenom);
      fd.append('email', email.trim().toLowerCase());
      if (photoFile) fd.append('photo', photoFile);
      if (removePhoto) fd.append('remove_photo', '1');

      const data = await updateProfile(fd);
      if (photoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
      setUserData(data.user);
      setPhotoPreview(getUserPhotoUrl(data.user));
      setPhotoFile(null);
      setRemovePhoto(false);
      setSuccess(data.message);
      await refreshUser();
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'Enregistrement impossible.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 auth-card">
      <h3 className="font-semibold text-text-dark uppercase text-sm tracking-wide mb-6">
        Profil administrateur
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {success && (
          <div className="p-3 rounded-xl bg-[#ECFDF5] text-success text-sm border border-accent/30">
            {success}
          </div>
        )}
        {apiError && (
          <div className="p-3 rounded-xl bg-red-50 text-error text-sm">{apiError}</div>
        )}

        <ProfilePhotoField
          user={user}
          photoPreview={photoPreview}
          onPhotoChange={handlePhotoChange}
          removePhoto={removePhoto}
          onRemovePhotoChange={setRemovePhoto}
          showRemoveOption
        />

        <AuthField
          label="Nom complet"
          name="nom_complet"
          value={nomComplet}
          onChange={(e) => {
            setNomComplet(e.target.value);
            setErrors((p) => ({ ...p, nomComplet: '' }));
          }}
          error={errors.nomComplet}
          inputClassName={PROFILE_INPUT}
        />

        <AuthField
          label="E-mail"
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((p) => ({ ...p, email: '' }));
          }}
          error={errors.email}
          inputClassName={PROFILE_INPUT}
        />

        <AuthField
          label="Rôle"
          name="role"
          value={ROLE_LABELS[user?.role] || user?.role || ''}
          readOnly
          disabled
          inputClassName={`${PROFILE_INPUT} opacity-70 cursor-not-allowed`}
        />

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-md shadow-primary/20 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}
