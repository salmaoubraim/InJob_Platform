/**
 * Domaine entreprise du recruteur — utilisé pour verrouiller catégories / métiers.
 */
export function getRecruteurDomainFromUser(user) {
  const id = user?.recruteur?.id_categorie;
  const label =
    user?.recruteur?.categorie?.nom_categorie ||
    user?.recruteur?.domaine ||
    null;

  if (!id) {
    return { id: null, label };
  }

  return { id: String(id), label };
}

export function inferRecruteurDomainFromOffres(offres = []) {
  if (!Array.isArray(offres) || offres.length === 0) {
    return { id: null, label: null };
  }

  const withCategory = offres.find((o) => o.id_categorie != null && o.id_categorie !== '');
  if (!withCategory) {
    return { id: null, label: null };
  }

  return {
    id: String(withCategory.id_categorie),
    label: withCategory.categorie || null,
  };
}

export function filterCategoriesForRecruteur(allCategories, domainId) {
  if (!domainId || !Array.isArray(allCategories)) {
    return [];
  }

  return allCategories.filter((c) => String(c.id_categorie) === String(domainId));
}

export function isRecruteurDomainLocked(domainId, offresCount = 0) {
  return Boolean(domainId) && offresCount > 0;
}
