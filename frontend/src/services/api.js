import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost/injob-api/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('injob_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // FormData : laisser le navigateur définir Content-Type + boundary (sinon la photo n'est pas envoyée)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('injob_token');
      localStorage.removeItem('injob_user');
    }
    if (!error.response && error.message === 'Network Error') {
      error.message =
        'Impossible de joindre l\'API. Vérifiez Apache, MySQL et http://localhost/injob-api';
    }
    return Promise.reject(error);
  }
);

export default api;
