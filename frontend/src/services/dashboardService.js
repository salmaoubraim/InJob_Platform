import api from './api';

export async function fetchDashboardStats() {
  const { data } = await api.get('/dashboard/stats');
  return data.data || {};
}

export async function fetchLandingStats() {
  const { data } = await api.get('/stats/landing');
  return data.data || {};
}
