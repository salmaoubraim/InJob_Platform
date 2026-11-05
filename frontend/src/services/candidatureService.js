import api from './api';

export async function postuler(idOffre) {
  const { data } = await api.post('/candidat/candidatures', { id_offre: idOffre });
  return data;
}

export async function fetchMesCandidatures() {
  const { data } = await api.get('/candidat/candidatures');
  return data.data || [];
}

export async function fetchCandidaturesRecruteur() {
  const { data } = await api.get('/recruteur/candidatures');
  return data.data || [];
}

export async function updateCandidatureStatut(id, statut, dateEntretien = null) {
  const { data } = await api.patch(`/recruteur/candidatures/${id}`, {
    statut,
    date_entretien: dateEntretien,
  });
  return data;
}

export async function fetchCandidatProfil(idCandidat) {
  const { data } = await api.get(`/recruteur/candidats/${idCandidat}`);
  return data.data;
}

export async function deleteCandidature(id) {
  const { data } = await api.delete(`/recruteur/candidatures/${id}`);
  return data;
}

export async function clearAllCandidatures() {
  const { data } = await api.delete('/recruteur/candidatures');
  return data;
}

export async function cancelCandidature(id) {
  const { data } = await api.delete(`/candidat/candidatures/${id}`);
  return data;
}

export async function clearMyCandidatures() {
  const { data } = await api.delete('/candidat/candidatures');
  return data;
}
