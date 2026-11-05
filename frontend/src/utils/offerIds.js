/** Identifiant démo (catalogue frontend) — pas d'appel API candidature. */
export function isDemoOfferId(id) {
  const s = String(id ?? '');
  return (
    s.startsWith('catalog-') ||
    s.startsWith('candidat-') ||
    !/^\d+$/.test(s)
  );
}

export function normalizeOfferId(id) {
  const s = String(id ?? '');
  if (!/^\d+$/.test(s)) {
    return null;
  }
  return Number(s);
}
