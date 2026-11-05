import api from './api';

export async function fetchOffreById(id) {
  const { data } = await api.get(`/offres/${id}`);
  return data.data;
}

export async function fetchOffres(search = '', filters = {}) {
  const params = { ...filters };
  if (search?.trim()) params.q = search.trim();
  const { data } = await api.get('/offres', { params });
  return data.data || [];
}

/** Accueil : 4 offres affichées sur la landing. */
export const LANDING_OFFERS_LIMIT = 4;

/** Espace candidat connecté : toutes les offres publiées (hors catalogue accueil). */
export const CANDIDAT_OFFERS_LIMIT = 100;

export async function fetchRecentOffres(limit = LANDING_OFFERS_LIMIT) {
  return fetchOffres('', { recent: true, limit });
}

/** Espace candidat : offres publiées avec filtres métier / catégorie. */
export async function fetchCandidatOffres(search = '', filters = {}) {
  return fetchOffres(search, {
    ...filters,
    scope: 'candidat',
    limit: CANDIDAT_OFFERS_LIMIT,
  });
}

export async function fetchMetiers(idCategorie = '') {
  const params = idCategorie ? { id_categorie: idCategorie } : {};
  const { data } = await api.get('/metiers', { params });
  return data.data || [];
}

export async function fetchRecruteurOffres(search = '') {
  const params = search.trim() ? { q: search.trim() } : {};
  const { data } = await api.get('/recruteur/offres', { params });
  return data.data || [];
}

export async function fetchCategories() {
  const { data } = await api.get('/categories');
  return data.data || [];
}

export async function createOffre(payload, imageFile = null) {
  if (imageFile) {
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        form.append(key, value);
      }
    });
    form.append('image', imageFile);
    const { data } = await api.post('/recruteur/offres', form);
    return data;
  }
  const { data } = await api.post('/recruteur/offres', payload);
  return data;
}

export async function publishOffre(id) {
  const { data } = await api.patch(`/recruteur/offres/${id}/publish`);
  return data;
}

export async function updateOffre(id, payload, imageFile = null) {
  if (imageFile) {
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        form.append(key, value);
      }
    });
    form.append('image', imageFile);
    const { data } = await api.post(`/recruteur/offres/${id}`, form);
    return data;
  }
  const { data } = await api.put(`/recruteur/offres/${id}`, payload);
  return data;
}

export async function deleteOffre(id) {
  const { data } = await api.delete(`/recruteur/offres/${id}`);
  return data;
}
