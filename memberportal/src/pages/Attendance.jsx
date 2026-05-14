import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import './Dashboard.css';

export function Attendance() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axiosInstance.get('/member/profile');
        setHistory(res.data.data.attendanceHistory || []);
      } catch (err) {
        setError('Failed to load attendance history.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading Attendance History...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error" style={{ textAlign: 'center', padding: '2rem' }}>
        <p>{error}</p>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Attendance History</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Your full check-in and check-out log
          </p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </header>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {history.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <tr>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Entry Time</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Exit Time</th>
                  <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((att, index) => (
                  <tr key={att._id} style={{ borderBottom: index === history.length - 1 ? 'none' : '1px solid #F3F4F6' }}>
                    <td style={{ padding: '1rem', fontSize: '0.95rem' }}>
                      {new Date(att.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.95rem' }}>
                      {new Date(att.checkIn || att.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.95rem' }}>
                      {att.checkOut ? (
                        <>
                          {new Date(att.checkOut).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          {att.autoFallback && (
                            <span style={{ fontSize: '0.7rem', color: '#F59E0B', marginLeft: '0.5rem', background: '#FEF3C7', padding: '2px 6px', borderRadius: '4px' }}>
                              Auto
                            </span>
                          )}
                        </>
                      ) : (
                        <span style={{ color: '#F59E0B', fontStyle: 'italic', fontSize: '0.9rem' }}>Pending</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        background: att.status === 'present' ? '#D1FAE5' : '#FEE2E2',
                        color: att.status === 'present' ? '#065F46' : '#991B1B',
                        fontWeight: '500'
                      }}>
                        {att.status || 'present'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No attendance records found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
