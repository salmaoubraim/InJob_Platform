export const CANDIDATURE_STATUTS = {
  en_attente: { label: 'En attente', variant: 'warning' },
  acceptee: { label: 'Acceptée', variant: 'success' },
  refusee: { label: 'Refusée', variant: 'danger' },
  entretien_programme: { label: 'Entretien programmé', variant: 'info' },
};

export const CANDIDATURE_TIMELINE = [
  'en_attente',
  'entretien_programme',
  'acceptee',
];

export function getCandidatureStatut(statut) {
  return CANDIDATURE_STATUTS[statut] || CANDIDATURE_STATUTS.en_attente;
}
