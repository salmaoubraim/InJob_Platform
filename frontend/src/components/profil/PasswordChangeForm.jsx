import AuthField from '../auth/AuthField';
import SubmitButton from '../auth/SubmitButton';

const PROFILE_INPUT =
  'bg-bg-page border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20';

export default function PasswordChangeForm({
  passwordForm,
  setPasswordForm,
  passwordErrors,
  setPasswordErrors,
  passwordLoading,
  passwordSuccess,
  passwordApiError,
  attempted = false,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {passwordSuccess && (
        <div className="p-3 rounded-xl bg-[#ECFDF5] text-success text-sm border border-accent/30">
          {passwordSuccess}
        </div>
      )}
      {passwordApiError && (
        <div className="p-3 rounded-xl bg-red-50 text-error text-sm">{passwordApiError}</div>
      )}

      <AuthField
        label="Mot de passe actuel"
        type="password"
        name="mot_de_passe_actuel"
        value={passwordForm.mot_de_passe_actuel}
        onChange={(e) => {
          setPasswordForm({ ...passwordForm, mot_de_passe_actuel: e.target.value });
          setPasswordErrors((p) => ({ ...p, mot_de_passe_actuel: '' }));
        }}
        error={attempted ? passwordErrors.mot_de_passe_actuel : ''}
        inputClassName={PROFILE_INPUT}
      />

      <AuthField
        label="Nouveau mot de passe"
        type="password"
        name="mot_de_passe"
        placeholder="Minimum 8 caractères"
        value={passwordForm.mot_de_passe}
        onChange={(e) => {
          setPasswordForm({ ...passwordForm, mot_de_passe: e.target.value });
          setPasswordErrors((p) => ({ ...p, mot_de_passe: '' }));
        }}
        error={attempted ? passwordErrors.mot_de_passe : ''}
        inputClassName={PROFILE_INPUT}
      />

      <AuthField
        label="Confirmer le nouveau mot de passe"
        type="password"
        name="mot_de_passe_confirmation"
        placeholder="Confirmez le mot de passe"
        value={passwordForm.mot_de_passe_confirmation}
        onChange={(e) => {
          setPasswordForm({
            ...passwordForm,
            mot_de_passe_confirmation: e.target.value,
          });
          setPasswordErrors((p) => ({ ...p, mot_de_passe_confirmation: '' }));
        }}
        error={attempted ? passwordErrors.mot_de_passe_confirmation : ''}
        inputClassName={PROFILE_INPUT}
      />

      <SubmitButton loading={passwordLoading}>
        Mettre à jour le mot de passe
      </SubmitButton>
    </form>
  );
}
