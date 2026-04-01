import React, { useState } from 'react';
import '../App.css';

/**
 * Login Component
 * Provides a modern, responsive login form for the superadmin dashboard.
 */
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Log data to console as requested
    console.log('Login Attempt:', formData);
    alert('Check console for login details!');
  };

  const isFormEmpty = !formData.email || !formData.password;

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Login</h2>
          <p>Welcome back! Please enter your details.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={error && !formData.email ? 'input-error' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={error && !formData.password ? 'input-error' : ''}
            />
            <div className="forgot-password">
              <a href="#forgot">Forgot Password?</a>
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isFormEmpty}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
