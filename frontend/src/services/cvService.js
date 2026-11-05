import api from './api';

export async function fetchMyCv() {
  const { data } = await api.get('/candidat/cv');
  return data.data || [];
}

export async function uploadCv(file) {
  const form = new FormData();
  form.append('fichier', file);
  const { data } = await api.post('/candidat/cv', form);
  return data;
}

export async function deleteCv(id) {
  const { data } = await api.delete(`/candidat/cv/${id}`);
  return data;
}

export function getCvDownloadUrl(id) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost/injob-api/api';
  const token = localStorage.getItem('injob_token');
  return `${base}/cv/${id}/download?token=${token}`;
}
