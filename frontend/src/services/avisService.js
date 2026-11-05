import api from './api';

export async function fetchAvis() {
  const { data } = await api.get('/avis');
  return data.data || [];
}

export async function postAvis(payload) {
  const { data } = await api.post('/avis', payload);
  return data;
}

export async function deleteAvis(id) {
  const { data } = await api.delete(`/avis/${id}`);
  return data;
}

export async function deleteAvisBulk(ids) {
  const { data } = await api.delete('/avis/bulk', { data: { ids } });
  return data;
}

export async function clearAllAvis() {
  const { data } = await api.delete('/avis');
  return data;
}
