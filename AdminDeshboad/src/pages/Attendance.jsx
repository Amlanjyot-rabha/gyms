import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import './AdminStyles.css';

export function Attendance() {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axiosInstance.get('/admin/attendance');
        setAttendance(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const handleViewAttendance = (memberId) => {
    navigate(`/attendance/${memberId}`);
  };

  // Group attendance by member and calculate stats
  const getMemberStats = () => {
    const memberMap = new Map();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    attendance.forEach(log => {
      const memberId = log.userId?._id;
      if (!memberId) return;

      const logDate = new Date(log.date);

      if (!memberMap.has(memberId)) {
        memberMap.set(memberId, {
          memberId,
          name: log.userId?.name || 'Unknown',
          email: log.userId?.email || 'N/A',
          records: [],
          lastActivity: null,
          isPresentToday: false
        });
      }

      const member = memberMap.get(memberId);
      member.records.push(log);

      // Check if attendance is today
      const logDay = new Date(logDate);
      logDay.setHours(0, 0, 0, 0);
      if (logDay.getTime() === today.getTime()) {
        member.isPresentToday = true;
      }

      // Update last activity if this is the latest
      if (!member.lastActivity || logDate > new Date(member.lastActivity)) {
        member.lastActivity = log.date;
      }
    });

    // Convert to array and sort by last activity DESC
    return Array.from(memberMap.values()).sort((a, b) => {
      if (!a.lastActivity) return 1;
      if (!b.lastActivity) return -1;
      return new Date(b.lastActivity) - new Date(a.lastActivity);
    });
  };

  const memberStats = getMemberStats();

  const filteredMembers = memberStats.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (member.name || '').toLowerCase().includes(searchLower) ||
      (member.email || '').toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Attendance Logs</h1>
          <p className="dashboard-subtitle">Real-time member check-in records and attendance tracking.</p>
        </div>
        <div className="header-decoration">
          <div className="decoration-circle"></div>
        </div>
      </header>

      <div className="content-card">
        <div className="card-header">
          <div className="search-filters">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="members-count">
          <span>Showing {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="loading-state">Loading attendance...</div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Email</th>
                  <th>Status (Today)</th>
                  <th>Last Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(member => (
                  <tr key={member.memberId}>
                    <td style={{ fontWeight: '500' }}>{member.name}</td>
                    <td style={{ color: '#6b7280' }}>{member.email}</td>
                    <td>
                      <span className={`badge ${member.isPresentToday ? 'active' : 'expired'}`}>
                        {member.isPresentToday ? 'Present' : 'Absent'}
                      </span>
                    </td>
                    <td>{formatDate(member.lastActivity)}</td>
                    <td>
                      <button
                        className="btn-action"
                        style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                        onClick={() => handleViewAttendance(member.memberId)}
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      No members found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
