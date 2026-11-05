/** Chemin des offres selon le rôle (espace connecté ou page publique). */
export function getOffersPathForRole(role) {
  switch (role) {
    case 'candidat':
      return '/candidat/offres';
    case 'recruteur':
      return '/recruteur/offres';
    case 'admin':
      return '/admin/offres';
    default:
      return '/offres';
  }
}

export function isOffersPath(pathname) {
  const normalized = pathname.replace(/\/$/, '') || '/';
  return normalized === '/offres' || /\/offres$/.test(normalized);
}
