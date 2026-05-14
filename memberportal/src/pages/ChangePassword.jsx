import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export function ChangePassword() {
  const { changePassword } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from current password.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '440px' }}>
        <div className="login-logo">🔑</div>
        <h2>Change Password</h2>
        <p className="login-hint">Update your account password securely</p>

        {error && (
          <div className="login-error" role="alert">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cp-current">Current Password</label>
            <input
              id="cp-current"
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="cp-new">New Password</label>
            <input
              id="cp-new"
              type="password"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          <div className="form-group">
            <label htmlFor="cp-confirm">Confirm New Password</label>
            <input
              id="cp-confirm"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            style={{
              width: '100%', background: 'transparent', border: '1px solid #D1D5DB',
              padding: '0.75rem', borderRadius: '6px', cursor: 'pointer',
              marginTop: '0.75rem', fontFamily: 'inherit', fontSize: '0.95rem',
              color: '#6B7280', transition: 'all 0.2s'
            }}
          >
            ← Back to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
