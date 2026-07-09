import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import './Dashboard.css';

/**
 * Dashboard — Member portal main page.
 *
 * IMPORTANT: Uses mountedRef pattern to prevent state updates on unmounted component.
 * Auth errors are handled via centralized invalidateSession() - NOT local logout/redirect.
 */
export function Dashboard() {
  const { user, logout, invalidateSession } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [actionType, setActionType] = useState('info'); // 'info' | 'success' | 'error'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProcessingAttendance, setIsProcessingAttendance] = useState(false);

  // close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.user-menu-container')) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // mountedRef prevents state updates after component unmount
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    // Cleanup function runs on unmount
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Safe state setter that checks mount status
  const safeSetState = (setter) => (value) => {
    if (mountedRef.current) {
      setter(value);
    }
  };

  const fetchProfile = async () => {
    const startTime = Date.now();
    console.log('[DASHBOARD] ===== START fetchProfile =====');
    console.log('[DASHBOARD] mounted:', mountedRef.current);
    
    safeSetState(setLoading)(true);
    console.log('[DASHBOARD] setLoading(true) called');
    
    try {
      console.log('[DASHBOARD] About to call GET /member/profile');
      const res = await axiosInstance.get('/member/profile');
      const duration = Date.now() - startTime;
      
      console.log('[DASHBOARD] Response received after', duration, 'ms');
      console.log('[DASHBOARD] Response status:', res.status);
      console.log('[DASHBOARD] Response data:', res.data);
      console.log('[DASHBOARD] Profile data:', res.data.data);
      
      if (mountedRef.current) {
        console.log('[DASHBOARD] Component still mounted, updating state');
        safeSetState(setProfile)(res.data.data);
        safeSetState(setError)('');
        console.log('[DASHBOARD] State updated with profile');
      } else {
        console.log('[DASHBOARD] Component unmounted, skipping state update');
      }
    } catch (err) {
      const duration = Date.now() - startTime;
      console.error('[DASHBOARD] ===== ERROR =====');
      console.error('[DASHBOARD] Duration:', duration, 'ms');
      console.error('[DASHBOARD] Error type:', err.name);
      console.error('[DASHBOARD] Error message:', err.message);
      console.error('[DASHBOARD] Error response status:', err.response?.status);
      console.error('[DASHBOARD] Error response data:', err.response?.data);
      console.error('[DASHBOARD] Stack:', err.stack);
      
      const status = err.response?.status;
      console.log('[DASHBOARD] Status code:', status);

      if (status === 401) {
        console.log('[DASHBOARD] Auth error detected, calling invalidateSession()');
        invalidateSession();
        return;
      }

      if (mountedRef.current) {
        console.log('[DASHBOARD] Setting error message');
        safeSetState(setError)('Failed to load your profile. Please refresh the page.');
      }
    } finally {
      console.log('[DASHBOARD] Finally block - setting loading to false');
      if (mountedRef.current) {
        safeSetState(setLoading)(false);
        console.log('[DASHBOARD] setLoading(false) called');
      } else {
        console.log('[DASHBOARD] Component unmounted, skipping setLoading');
      }
      console.log('[DASHBOARD] ===== END fetchProfile =====');
    }
  };

  useEffect(() => {
    console.log('[DASHBOARD] useEffect hook fired - component mounted');
    console.log('[DASHBOARD] Calling fetchProfile from useEffect');
    fetchProfile();
    // No cleanup needed - mountedRef handles it
  }, []);

  const showMessage = (msg, type = 'info') => {
    setActionMsg(msg);
    setActionType(type);
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleMarkAttendance = () => {
    if (isProcessingAttendance) return;

    if (profile?.status !== 'active') {
      showMessage('You need an active membership to mark attendance.', 'error');
      return;
    }

    safeSetState(setIsProcessingAttendance)(true);
    showMessage('Fetching your location...', 'info');

    if (!navigator.geolocation) {
      showMessage('Geolocation is not supported by your browser.', 'error');
      safeSetState(setIsProcessingAttendance)(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await axiosInstance.post('/attendance', { location: { lat: latitude, lng: longitude } });

          if (!mountedRef.current) return;

          showMessage(
            isCheckedIn 
              ? 'Successfully checked out! 👋' 
              : 'Attendance marked successfully! ✓', 
            'success'
          );
          fetchProfile();
        } catch (err) {
          if (!mountedRef.current) return;

          const status = err.response?.status;
          if (status === 401) {
            invalidateSession();
            return;
          }
          showMessage(err.response?.data?.message || 'Failed to mark attendance.', 'error');
        } finally {
          safeSetState(setIsProcessingAttendance)(false);
        }
      },
      async (error) => {
        if (!mountedRef.current) return;
        
        try {
          // error.code 1 = PERMISSION_DENIED
          if (error.code === 1) {
            showMessage('Unable to retrieve your location. Please allow location access.', 'error');
            return;
          }

          // error.code 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
          if (error.code === 2 || error.code === 3) {
            showMessage('Failed to retrieve location due to a technical error.', 'error');
          } else {
            showMessage('An unknown error occurred while retrieving your location.', 'error');
          }
        } finally {
          safeSetState(setIsProcessingAttendance)(false);
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 6000,
        maximumAge: 0
      }
    );
  };

  const handleRenew = () => {
    showMessage('Membership renewal — contact the gym front desk.', 'info');
  };

  const handleLogout = async () => {
    await logout();
  };

  // Retry function for error state - allows recovery without manual refresh
  const handleRetry = () => {
    safeSetState(setError)('');
    fetchProfile();
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <span style={{
          width: '24px', height: '24px',
          border: '2px solid #4F46E5',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          display: 'inline-block',
          marginRight: '0.75rem'
        }} />
        Loading Dashboard...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error" style={{ textAlign: 'center', padding: '2rem' }}>
        <p>{error}</p>
        <button
          onClick={handleRetry}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  const isActive = profile?.status === 'active';
  const displayName = user?.name || 'Member';
  const displayInitial = displayName.charAt(0).toUpperCase();

  // Attendance Logic
  const latestAttendance = profile?.attendanceHistory?.[0];
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  
  const isToday = latestAttendance && new Date(latestAttendance.date).setHours(0, 0, 0, 0) === todayDate.getTime();
  const hasCheckedInToday = isToday;
  const hasCheckedOutToday = isToday && !!latestAttendance.checkOut;
  const isCheckedIn = isToday && !hasCheckedOutToday;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Member Portal</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Welcome back, <strong>{displayName}</strong>
          </p>
        </div>

        {/* Profile actions - Dropdown Menu */}
        <div className="user-menu-container" style={{ position: 'relative' }}>
          <button 
            className="user-menu-btn" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              display: 'grid', placeItems: 'center',
              color: '#fff', fontWeight: '700', fontSize: '1rem'
            }}>
              {displayInitial}
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)' }}>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {isMenuOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <strong>{displayName}</strong>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</span>
              </div>
              <div className="dropdown-divider"></div>
              <button onClick={() => navigate('/attendance')} className="dropdown-item">
                📅 Attendance History
              </button>
              <button onClick={() => navigate('/change-password')} className="dropdown-item">
                🔑 Change Password
              </button>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-item text-danger">
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {actionMsg && (
        <div
          className="action-msg"
          style={{
            background: actionType === 'success' ? '#ECFDF5' : actionType === 'error' ? '#FEF2F2' : '#EFF6FF',
            color: actionType === 'success' ? '#065F46' : actionType === 'error' ? '#991B1B' : '#1E40AF',
          }}
        >
          {actionMsg}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Membership Status Card */}
        <section className="card card-status">
          <h2>Membership Status</h2>
          <div className="status-badge" data-status={profile?.status}>
            {profile?.status?.toUpperCase() || 'UNKNOWN'}
          </div>

          {isActive ? (
            <>
              <p>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Expires: </span>
                <strong>{new Date(profile.expiryDate).toLocaleDateString()}</strong>
              </p>
              <p>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Remaining: </span>
                <strong>{profile.remainingDays} days</strong>
              </p>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>
              Your membership is inactive or expired. Please visit the gym desk to renew.
            </p>
          )}

          <div className="renew-section">
            <h3>Renew Membership</h3>
            <div className="renew-actions">
              <button onClick={handleRenew} className="btn-secondary">1 Month</button>
              <button onClick={handleRenew} className="btn-secondary">3 Months</button>
              <button onClick={handleRenew} className="btn-secondary">6 Months</button>
              <button onClick={handleRenew} className="btn-secondary">12 Months</button>
            </div>
          </div>
        </section>

        {/* Attendance Card */}
        <section className="card card-attendance">
          <h2>Attendance</h2>
          
          <button
            className={`btn-primary ${!isActive ? 'disabled' : ''} ${isCheckedIn ? 'btn-danger' : ''}`}
            onClick={handleMarkAttendance}
            disabled={!isActive || hasCheckedOutToday}
            style={{ width: '100%', marginBottom: '1.5rem', transition: 'all 0.2s ease' }}
          >
            {hasCheckedOutToday ? '✅ Completed for Today' : isCheckedIn ? '🚪 Exit' : '📍 Mark Attendance'}
          </button>

          <div className="attendance-today-summary">
            <h3>Latest Record</h3>
            {latestAttendance ? (
              <div className="today-record-card">
                <div className="record-row">
                  <span className="record-label">Date</span>
                  <span className="record-value">
                    {new Date(latestAttendance.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="record-row">
                  <span className="record-label">Entry Time</span>
                  <span className="record-value">
                    {new Date(latestAttendance.checkIn || latestAttendance.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="record-row">
                  <span className="record-label">Exit Time</span>
                  <span className="record-value">
                    {latestAttendance.checkOut 
                      ? new Date(latestAttendance.checkOut).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) 
                      : <span id="kpn8xh" style={{ color: '#F59E0B', fontStyle: 'italic' }}>Pending</span>}
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>
                You haven't checked in yet.
              </p>
            )}
            
            <button 
              onClick={() => navigate('/attendance')} 
              className="btn-text-link"
              style={{ marginTop: '1rem', width: '100%', textAlign: 'center' }}
            >
              View Full History →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
