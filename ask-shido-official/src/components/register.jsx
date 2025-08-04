// src/components/Register.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/login.css'

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const { register, loading, error: authError } = useAuth();
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
    if (!formData.username.trim() || !formData.password.trim() || !formData.confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await register({
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      onRegister(response.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="login-header">
          <h2 className="login-title">
            Create your account
          </h2>
          <p className="login-subtitle">
            Join the Questionnaire App
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
                placeholder="Choose a username"
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
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label htmlFor="confirmPassword" className="field-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="form-input login-input"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="switch-auth-container">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="switch-auth-link login-switch"
              disabled={loading}
            >
              Already have an account? Sign in
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

export default Register;