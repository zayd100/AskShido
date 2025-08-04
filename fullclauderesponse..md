// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important: This sends cookies with requests
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { method: 'POST', body, ...options });
  }
}

export default new ApiService();

// src/services/authService.js
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

// src/services/questionnaireService.js
import api from './api';

class QuestionnaireService {
  async getResponse() {
    try {
      const response = await api.get('/questionnaire/response');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get questionnaire response');
    }
  }

  async submitAnswer(questionIndex, answer) {
    try {
      const response = await api.post('/questionnaire/answer', {
        questionIndex,
        answer
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to submit answer');
    }
  }

  async getStats() {
    try {
      const response = await api.get('/questionnaire/stats');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get questionnaire stats');
    }
  }

  async resetQuestionnaire() {
    try {
      const response = await api.post('/questionnaire/reset');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to reset questionnaire');
    }
  }
}

export default new QuestionnaireService();

// src/hooks/useAuth.js - REPLACE YOUR EXISTING FILE
import { useState, useEffect } from 'react';
import authService from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authService.verifyToken();
      if (response.valid) {
        setUser(response.user);
      }
    } catch (err) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
};

// src/hooks/useQuestionnaire.js - REPLACE YOUR EXISTING FILE
import { useState } from 'react';
import questionnaireService from '../services/questionnaireService';

export const useQuestionnaire = () => {
  const [response, setResponse] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadResponse = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await questionnaireService.getResponse();
      setResponse(data.response);
      return data.response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (questionIndex, answer) => {
    setError(null);
    
    try {
      const data = await questionnaireService.submitAnswer(questionIndex, answer);
      setResponse(data.response);
      return data.response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loadStats = async () => {
    setError(null);
    
    try {
      const data = await questionnaireService.getStats();
      setStats(data.stats);
      return data.stats;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resetQuestionnaire = async () => {
    setError(null);
    
    try {
      const data = await questionnaireService.resetQuestionnaire();
      setResponse(data.response);
      return data.response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    response,
    stats,
    loading,
    error,
    loadResponse,
    submitAnswer,
    loadStats,
    resetQuestionnaire
  };
};