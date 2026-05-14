import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

/**
 * Login page for Member Portal.
 *
 * AUTHENTICATION FLOW:
 *   1. User submits credentials
 *   2. AuthContext.login() calls /auth/member/login
 *   3. Backend sets memberToken cookie
 *   4. AuthContext.login() VERIFIES session by calling /auth/member/me
 *   5. ONLY IF verification succeeds: auth state is set
 *   6. Component checks role and navigates to dashboard
 *
 * CRITICAL: Frontend NEVER trusts raw login response.
 * Session MUST be verified via /auth/member/me before auth state updates.
 * This ensures frontend/backend auth synchronization.
 */
export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      // Only members can access the member portal
      if (user.role !== 'member') {
        setError('Access denied. This portal is for gym members only.');
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">💪</div>
        <h2>Member Portal</h2>
        <p className="login-hint">Sign in to access your membership</p>

        {error && (
          <div className="login-error" role="alert">{error}</div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="member-email">Email</label>
            <input
              id="member-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="member-password">Password</label>
            <input
              id="member-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="login-footer">
          Not a member yet?{' '}
          <a href="http://localhost:5176" target="_blank" rel="noopener noreferrer">
            Join our gym
          </a>
        </p>
      </div>
    </div>
  );
}
