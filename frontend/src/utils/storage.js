const TOKEN_KEY = 'injob_token';
const USER_KEY = 'injob_user';

export const storage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};

export const getDashboardPath = (role) => {
  const paths = {
    candidat: '/candidat/dashboard',
    recruteur: '/recruteur/dashboard',
    admin: '/admin/dashboard',
  };
  return paths[role] || '/?auth=login';
};
