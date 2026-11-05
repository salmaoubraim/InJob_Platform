import api from './api';

export async function sendContactMessage(data) {
  const response = await api.post('/contact', data);
  return response.data;
}
