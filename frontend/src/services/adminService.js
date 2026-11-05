import api from './api';

function withParams(path, params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  );
  return api.get(path, { params: clean });
}

export async function fetchAdminUsers(params) {
  const { data } = await withParams('/admin/utilisateurs', params);
  return data;
}

export async function fetchAdminUser(id) {
  const { data } = await api.get(`/admin/utilisateurs/${id}`);
  return data.data;
}

export async function suspendAdminUser(id) {
  const { data } = await api.patch(`/admin/utilisateurs/${id}/suspend`);
  return data;
}

export async function activateAdminUser(id) {
  const { data } = await api.patch(`/admin/utilisateurs/${id}/activate`);
  return data;
}

export async function warnAdminUser(id, message) {
  const { data } = await api.post(`/admin/utilisateurs/${id}/warn`, { message });
  return data;
}

export async function deleteAdminUser(id) {
  const { data } = await api.delete(`/admin/utilisateurs/${id}`);
  return data;
}

export async function fetchAdminOffres(params) {
  const { data } = await withParams('/admin/offres', params);
  return data;
}

export async function fetchAdminOffre(id) {
  const { data } = await api.get(`/admin/offres/${id}`);
  return data.data;
}

export async function suspendAdminOffre(id) {
  const { data } = await api.patch(`/admin/offres/${id}/suspend`);
  return data;
}

export async function hideAdminOffre(id) {
  const { data } = await api.patch(`/admin/offres/${id}/hide`);
  return data;
}

export async function unhideAdminOffre(id) {
  const { data } = await api.patch(`/admin/offres/${id}/unhide`);
  return data;
}

export async function deleteAdminOffre(id) {
  const { data } = await api.delete(`/admin/offres/${id}`);
  return data;
}

export async function fetchAdminCategories(params) {
  const { data } = await withParams('/admin/categories', params);
  return data.data || [];
}

export async function createAdminCategorie(payload) {
  const { data } = await api.post('/admin/categories', payload);
  return data;
}

export async function updateAdminCategorie(id, payload) {
  const { data } = await api.put(`/admin/categories/${id}`, payload);
  return data;
}

export async function deleteAdminCategorie(id) {
  const { data } = await api.delete(`/admin/categories/${id}`);
  return data;
}

export async function fetchAdminMetiers(params) {
  const { data } = await withParams('/admin/metiers', params);
  return data.data || [];
}

export async function createAdminMetier(payload) {
  const { data } = await api.post('/admin/metiers', payload);
  return data;
}

export async function updateAdminMetier(id, payload) {
  const { data } = await api.put(`/admin/metiers/${id}`, payload);
  return data;
}

export async function deleteAdminMetier(id) {
  const { data } = await api.delete(`/admin/metiers/${id}`);
  return data;
}

export async function fetchAdminCandidatures(params) {
  const { data } = await withParams('/admin/candidatures', params);
  return data;
}

export async function deleteAdminCandidature(id) {
  const { data } = await api.delete(`/admin/candidatures/${id}`);
  return data;
}

export async function fetchAdminAvis(params) {
  const { data } = await withParams('/admin/avis', params);
  return data.data || [];
}

export async function hideAdminAvis(type, id) {
  const { data } = await api.patch('/admin/avis/hide', { type, id });
  return data;
}

export async function unhideAdminAvis(type, id) {
  const { data } = await api.patch('/admin/avis/unhide', { type, id });
  return data;
}

export async function deleteAdminAvis(type, id) {
  const { data } = await api.delete('/admin/avis', { data: { type, id } });
  return data;
}

export async function clearAllAdminAvis() {
  const { data } = await api.delete('/admin/avis/all', { data: { confirm: true } });
  return data;
}
