import { useState } from 'react';
import PasswordChangeForm from './PasswordChangeForm';
import { updatePassword } from '../../services/profileService';
import { getApiErrorMessage } from '../../utils/apiErrors';

export default function PasswordChangePanel({ title = 'Changer le mot de passe', className = '' }) {
  const [passwordForm, setPasswordForm] = useState({
    mot_de_passe_actuel: '',
    mot_de_passe: '',
    mot_de_passe_confirmation: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordApiError, setPasswordApiError] = useState('');
  const [attempted, setAttempted] = useState(false);

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
    setAttempted(true);
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
      setAttempted(false);
    } catch (err) {
      setPasswordApiError(getApiErrorMessage(err, 'Mise à jour impossible.'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 auth-card ${className}`}>
      <h3 className="font-semibold text-text-dark uppercase text-sm tracking-wide mb-6">
        {title}
      </h3>
      <PasswordChangeForm
        passwordForm={passwordForm}
        setPasswordForm={setPasswordForm}
        passwordErrors={passwordErrors}
        setPasswordErrors={setPasswordErrors}
        passwordLoading={passwordLoading}
        passwordSuccess={passwordSuccess}
        passwordApiError={passwordApiError}
        attempted={attempted}
        onSubmit={handlePasswordSubmit}
      />
    </div>
  );
}
