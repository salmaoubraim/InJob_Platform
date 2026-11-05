import api from './api';

export async function fetchAdminSettings() {
  const { data } = await api.get('/admin/settings');
  return data.data || {};
}

export async function updateAdminSettings(payload) {
  const { data } = await api.put('/admin/settings', payload);
  return data.data || {};
}
