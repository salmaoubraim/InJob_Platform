import api from './api';

export async function fetchEligibleCandidats() {
  const { data } = await api.get('/recruteur/avis-candidats/eligibles');
  return data.data || [];
}

export async function fetchOffresForCandidat(idCandidat) {
  const { data } = await api.get(`/recruteur/avis-candidats/${idCandidat}/offres`);
  return data.data || [];
}

export async function fetchRecruteurAvisCandidats() {
  const { data } = await api.get('/recruteur/avis-candidats');
  return data.data || [];
}

export async function postRecruteurAvisCandidat(payload) {
  const { data } = await api.post('/recruteur/avis-candidats', payload);
  return data;
}

export async function deleteRecruteurAvisCandidat(id) {
  const { data } = await api.delete(`/recruteur/avis-candidats/${id}`);
  return data;
}

export async function deleteRecruteurAvisCandidatBulk(ids) {
  const { data } = await api.delete('/recruteur/avis-candidats/bulk', { data: { ids } });
  return data;
}

/** Évaluations reçues du recruteur (avis_recruteur_candidat). */
export async function fetchCandidatAvisRecruteurs() {
  const { data } = await api.get('/candidat/avis-recruteurs');
  return data.data || [];
}

export async function fetchEligibleRecruteursForAvis() {
  const { data } = await api.get('/candidat/avis-recruteurs/eligibles');
  return data.data || [];
}

export async function fetchOffresForRecruteurAvis(idRecruteur) {
  const { data } = await api.get(`/candidat/avis-recruteurs/${idRecruteur}/offres`);
  return data.data || [];
}

export async function fetchCandidatMesAvisRecruteurs() {
  const { data } = await api.get('/candidat/mes-avis-recruteurs');
  return data.data || [];
}

export async function postCandidatAvisRecruteur(payload) {
  const { data } = await api.post('/candidat/avis-recruteurs', payload);
  return data;
}

export async function deleteCandidatAvisRecruteur(id) {
  const { data } = await api.delete(`/candidat/avis-recruteurs/${id}`);
  return data;
}

export async function updateCandidatAvisRecruteur(id, payload) {
  const { data } = await api.put(`/candidat/avis-recruteurs/${id}`, payload);
  return data;
}

export async function deleteCandidatAvisRecruteurBulk(ids) {
  const { data } = await api.delete('/candidat/avis-recruteurs/bulk', { data: { ids } });
  return data;
}

export async function updateRecruteurAvisCandidat(id, payload) {
  const { data } = await api.put(`/recruteur/avis-candidats/${id}`, payload);
  return data;
}

/** Avis laissés par les candidats sur les offres du recruteur (table avis_recruteurs). */
export async function fetchRecruteurAvisRecruteursRecus() {
  const { data } = await api.get('/recruteur/avis-recruteurs-recus');
  return data.data || [];
}

export async function deleteRecruteurAvisRecu(id) {
  const { data } = await api.delete(`/recruteur/avis-recruteurs-recus/${id}`);
  return data;
}

export async function deleteRecruteurAvisRecuBulk(ids) {
  const { data } = await api.delete('/recruteur/avis-recruteurs-recus/bulk', { data: { ids } });
  return data;
}

/** Évaluations reçues du candidat (avis_recruteur_candidat). */
export async function deleteCandidatAvisRecu(id) {
  const { data } = await api.delete(`/candidat/avis-recruteurs-recus/${id}`);
  return data;
}

export async function deleteCandidatAvisRecuBulk(ids) {
  const { data } = await api.delete('/candidat/avis-recruteurs-recus/bulk', { data: { ids } });
  return data;
}
