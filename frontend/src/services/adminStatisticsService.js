import api from './api';

export async function fetchAdminStatistics() {
  const { data } = await api.get('/admin/statistiques');
  return data.data || {};
}
