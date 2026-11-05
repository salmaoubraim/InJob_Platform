import api from './api';

export async function updateProfile(formData) {
  const { data } = await api.post('/profile', formData);
  return data;
}

export async function updatePassword(payload) {
  const { data } = await api.put('/profile/password', payload);
  return data;
}
