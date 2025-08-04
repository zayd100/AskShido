import api from './api';

class AuthService {
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Logout failed');
    }
  }

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get user info');
    }
  }

  async verifyToken() {
    try {
      const response = await api.get('/auth/verify');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Token verification failed');
    }
  }
}

export default new AuthService();