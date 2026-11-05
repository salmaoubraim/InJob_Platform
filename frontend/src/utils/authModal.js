/** Lien vers l'accueil avec modale auth (?auth=login|register&role=…) */
export function buildAuthSearch(mode, role) {
  const params = new URLSearchParams();
  params.set('auth', mode);
  if (role === 'candidat' || role === 'recruteur') {
    params.set('role', role);
  }
  const q = params.toString();
  return q ? `/?${q}` : '/';
}

export function authSearchParams(mode, role) {
  const params = new URLSearchParams();
  params.set('auth', mode);
  if (role === 'candidat' || role === 'recruteur') {
    params.set('role', role);
  }
  return params;
}

export function parseAuthMode(searchParams) {
  const auth = searchParams.get('auth');
  if (auth === 'login' || auth === 'register') return auth;
  return null;
}
