const BASE = import.meta.env.BASE_URL || '/';

/** Lien ancre sur l'accueil (ex: /injob/#offres) */
export function landingHash(id) {
  const base = BASE.endsWith('/') ? BASE : `${BASE}/`;
  return `${base}#${id}`;
}
