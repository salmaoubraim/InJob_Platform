const basename = import.meta.env.VITE_BASE_PATH?.replace(/\/$/, '') || '';

export function getGoogleRedirectUri() {
  const origin = window.location.origin;
  return `${origin}${basename}/auth/google/callback`;
}

export function mapGoogleError(message) {
  const msg = (message || '').toLowerCase();
  if (msg.includes('popup') || msg.includes('closed') || msg.includes('annul')) {
    return 'Connexion Google annulée.';
  }
  if (msg.includes('refus') || msg.includes('denied') || msg.includes('access')) {
    return 'Accès Google refusé. Autorisez InJob pour continuer.';
  }
  if (msg.includes('réseau') || msg.includes('network') || msg.includes('joindre')) {
    return 'Problème réseau. Vérifiez votre connexion.';
  }
  if (msg.includes('token') || msg.includes('invalide') || msg.includes('expir')) {
    return 'Session Google expirée. Réessayez.';
  }
  if (msg.includes('déjà') || msg.includes('lié') || msg.includes('utilisé')) {
    return message;
  }
  if (msg.includes('bloqué')) {
    return message;
  }
  if (msg.includes('secret') || msg.includes('configur')) {
    return 'OAuth Google incomplet côté serveur. Vérifiez GOOGLE_CLIENT_SECRET.';
  }
  return message || 'Erreur lors de la connexion Google.';
}
