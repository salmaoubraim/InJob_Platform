import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import GoogleAuthButton from './GoogleAuthButton';
import { authService } from '../../services/authService';
import { storage, getDashboardPath } from '../../utils/storage';
import { getGoogleRedirectUri, mapGoogleError } from '../../utils/googleOAuth';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

async function finishWithCredential(credential, onSuccess, onNeedRole, onError, setLoading) {
  setLoading(true);
  try {
    const data = await authService.googleLogin(credential);
    if (data.is_new) {
      onNeedRole?.({
        credential,
        email: data.email,
        prenom: data.prenom,
        nom: data.nom,
        photo: data.photo,
      });
      return;
    }
    storage.setToken(data.token);
    storage.setUser(data.user);
    onSuccess(getDashboardPath(data.user.role));
  } catch (err) {
    onError?.(mapGoogleError(err.response?.data?.message || err.message));
  } finally {
    setLoading(false);
  }
}

/**
 * Connexion Google OAuth — redirection vers Google (flux authorization code).
 */
const PRESET_ROLE_KEY = 'injob_google_preset_role';

export default function GoogleSignIn({ onSuccess, onNeedRole, onError, disabled, presetRole }) {
  const [loading, setLoading] = useState(false);

  if (!CLIENT_ID) {
    return (
      <GoogleAuthButton
        label="Se connecter avec Google"
        disabled={disabled}
        onClick={() =>
          onError?.(
            'Configurez VITE_GOOGLE_CLIENT_ID dans frontend/.env.xampp puis relancez le build (voir GOOGLE-OAUTH.md).'
          )
        }
      />
    );
  }

  const startRedirect = useGoogleLogin({
    flow: 'auth-code',
    ux_mode: 'redirect',
    redirect_uri: getGoogleRedirectUri(),
    scope: 'openid email profile',
    onError: () => onError?.('Connexion Google annulée ou refusée.'),
  });

  return (
    <div className="relative w-full">
      <GoogleAuthButton
        label={loading ? 'Connexion en cours…' : 'Se connecter avec Google'}
        disabled={disabled || loading}
        onClick={() => {
          setLoading(true);
          try {
            if (presetRole) {
              sessionStorage.setItem(PRESET_ROLE_KEY, presetRole);
            } else {
              sessionStorage.removeItem(PRESET_ROLE_KEY);
            }
            startRedirect();
          } catch {
            setLoading(false);
            onError?.('Impossible de lancer la connexion Google.');
          }
        }}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}

/** Utilitaire pour le flux ID token (callback ou tests). */
export async function handleGoogleCredential(credential, handlers) {
  const { onSuccess, onNeedRole, onError, setLoading = () => {} } = handlers;
  await finishWithCredential(credential, onSuccess, onNeedRole, onError, setLoading);
}
