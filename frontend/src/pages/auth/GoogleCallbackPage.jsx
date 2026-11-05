import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import InJobLogo from '../../components/layout/InJobLogo';
import GoogleRoleModal from '../../components/auth/GoogleRoleModal';
import { authService } from '../../services/authService';
import { storage, getDashboardPath } from '../../utils/storage';
import { getGoogleRedirectUri, mapGoogleError } from '../../utils/googleOAuth';
import { getApiErrorMessage } from '../../utils/apiErrors';

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [roleModal, setRoleModal] = useState({
    open: false,
    email: '',
    prenom: '',
    nom: '',
    photo: null,
    code: '',
    initialRole: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const oauthError = params.get('error');

    if (oauthError) {
      setError(oauthError === 'access_denied'
        ? 'Accès Google refusé.'
        : 'Connexion Google annulée.');
      setLoading(false);
      return;
    }

    if (!code) {
      setError('Code Google manquant. Réessayez depuis la page de connexion.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await authService.googleExchangeCode(code, getGoogleRedirectUri());

        if (data.is_new) {
          const presetRole = sessionStorage.getItem('injob_google_preset_role');
          sessionStorage.removeItem('injob_google_preset_role');

          if (presetRole === 'candidat') {
            const reg = await authService.googleRegister({
              code,
              redirect_uri: getGoogleRedirectUri(),
              role: 'candidat',
            });
            storage.setToken(reg.token);
            storage.setUser(reg.user);
            navigate(getDashboardPath(reg.user.role), { replace: true });
            return;
          }

          setRoleModal({
            open: true,
            email: data.email,
            prenom: data.prenom,
            nom: data.nom,
            photo: data.photo,
            code,
            initialRole: presetRole === 'recruteur' ? 'recruteur' : '',
          });
          setLoading(false);
          return;
        }

        storage.setToken(data.token);
        storage.setUser(data.user);
        navigate(getDashboardPath(data.user.role), { replace: true });
      } catch (err) {
        setError(mapGoogleError(getApiErrorMessage(err)));
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleRole = async (role, extra = {}) => {
    setLoading(true);
    try {
      const data = await authService.googleRegister({
        code: roleModal.code,
        redirect_uri: getGoogleRedirectUri(),
        role,
        nom_entreprise: extra.nom_entreprise,
        ville: extra.ville,
      });
      storage.setToken(data.token);
      storage.setUser(data.user);
      setRoleModal((m) => ({ ...m, open: false }));
      navigate(getDashboardPath(data.user.role), { replace: true });
    } catch (err) {
      setError(mapGoogleError(getApiErrorMessage(err)));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-page flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center auth-card">
        <InJobLogo size="lg" centered />
        {loading && !error && (
          <>
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mt-6" />
            <p className="text-sm text-text-secondary mt-4">Connexion Google en cours…</p>
          </>
        )}
        {error && (
          <>
            <p className="text-error text-sm mt-6">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold"
            >
              Retour à la connexion
            </button>
          </>
        )}
      </div>

      <GoogleRoleModal
        open={roleModal.open}
        email={roleModal.email}
        prenom={roleModal.prenom}
        nom={roleModal.nom}
        photo={roleModal.photo}
        initialRole={roleModal.initialRole}
        onConfirm={handleRole}
        onClose={() => navigate('/login', { replace: true })}
      />
    </div>
  );
}
