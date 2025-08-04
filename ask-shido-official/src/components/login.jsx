// src/components/Login.jsx - Updated to use API services
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/login.css'

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const { login, loading, error: authError } = useAuth();
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await login(formData);
      onLogin(response.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="login-header">
          <h2 className="login-title">
            Sign in to your account
          </h2>
          <p className="login-subtitle">
            Welcome to AskShido!
          </p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-fields">
            <div className="form-field">
              <label htmlFor="username" className="field-label">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="form-input login-input"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="form-input login-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {(error || authError) && (
            <div className="error-message">
              {error || authError}
            </div>
          )}

          <div className="submit-button-container">
            <button
              type="submit"
              disabled={loading}
              className="submit-button login-button"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="switch-auth-container">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="switch-auth-link login-switch"
              disabled={loading}
            >
              Don't have an account? Sign up
            </button>
          </div>
        </form>

        {/* Powered by LifeBushido */}
        <div className="powered-by-container">
          <span className="powered-by-text">Powered by</span>
          <img 
            src="/lifebushido.png" 
            alt="LifeBushido" 
            className="powered-by-logo"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;