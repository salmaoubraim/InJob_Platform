import api from './api';

export const authService = {
  async register(data) {
    const response = await api.post('/register', data);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  async logout() {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('injob_token');
      localStorage.removeItem('injob_user');
    }
  },

  async getUser() {
    const response = await api.get('/user');
    return response.data;
  },
};

export default authService;
