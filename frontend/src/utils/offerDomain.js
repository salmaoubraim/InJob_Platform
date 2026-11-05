const DOMAIN_ALIASES = {
  Informatique: 'Informatique & tech',
  Commerce: 'Commerce & vente',
  Finance: 'Finance',
  Santé: 'Santé',
  Juridique: 'Juridique',
  Marketing: 'Marketing',
};

export const DOMAIN_MISMATCH_MESSAGE =
  'Cette offre ne correspond pas à votre métier principal ni à vos compétences enregistrées.';

export function resolveCandidatDomain(user) {
  if (!user?.candidat) return null;

  if (user.candidat.categorie?.nom_categorie) {
    return user.candidat.categorie.nom_categorie;
  }

  if (user.candidat.id_categorie) {
    return user.candidat.id_categorie;
  }

  return null;
}

export function resolveOfferDomain(offer) {
  if (!offer) return null;

  if (offer.id_categorie != null && offer.id_categorie !== '') {
    return offer.id_categorie;
  }

  const label = offer.categorie || offer.domaine;
  return DOMAIN_ALIASES[label] || label || null;
}

function parseCompetences(competences) {
  if (!competences) return [];
  return competences
    .toLowerCase()
    .split(/[,;|/\n]+/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 2);
}

function textsOverlap(a, b) {
  const left = String(a || '').trim().toLowerCase();
  const right = String(b || '').trim().toLowerCase();
  if (!left || !right) return false;
  if (left.includes(right) || right.includes(left)) return true;
  return right.split(/\s+/).some((word) => word.length >= 3 && (left.includes(word) || word.includes(left)));
}

function competencesMatchOffer(competences, offer) {
  const tokens = parseCompetences(competences);
  if (tokens.length === 0) return false;

  const targets = [offer?.metier, offer?.titre].filter(Boolean);

  return tokens.some((token) => targets.some((target) => textsOverlap(token, target)));
}

function matchesCompetenceMetier(user, offer) {
  const offerMetierId = offer?.id_metier != null ? Number(offer.id_metier) : null;
  if (!offerMetierId) return false;

  const extraMetiers = user?.candidat?.competences_metiers || [];
  return extraMetiers.some((m) => Number(m.id_metier) === offerMetierId);
}

export function canApplyToOffer(user, offer) {
  const candidatDomain = resolveCandidatDomain(user);
  const offerDomain = resolveOfferDomain(offer);

  if (candidatDomain && offerDomain) {
    if (
      typeof candidatDomain === 'number' ||
      typeof offerDomain === 'number' ||
      /^\d+$/.test(String(candidatDomain)) ||
      /^\d+$/.test(String(offerDomain))
    ) {
      if (Number(candidatDomain) === Number(offerDomain)) return true;
    } else if (String(candidatDomain).trim() === String(offerDomain).trim()) {
      return true;
    }
  }

  const candidatMetierId = user?.candidat?.id_metier;
  const offerMetierId = offer?.id_metier;
  if (candidatMetierId && offerMetierId && Number(candidatMetierId) === Number(offerMetierId)) {
    return true;
  }

  if (matchesCompetenceMetier(user, offer)) {
    return true;
  }

  const competences = user?.candidat?.competences?.trim();
  if (competences && competencesMatchOffer(competences, offer)) {
    return true;
  }

  if (!candidatDomain || !offerDomain) {
    return true;
  }

  return false;
}
