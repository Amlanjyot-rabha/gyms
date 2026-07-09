import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import './AdminStyles.css';

export function Attendance() {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    // Use local date string YYYY-MM-DD to avoid timezone shifting
    return new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });

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

  // Filter attendance by selected date and group by member
  const getMemberStats = () => {
    const memberMap = new Map();
    const targetDate = new Date(selectedDate);
    targetDate.setHours(0, 0, 0, 0);

    attendance.forEach(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);

      // Only include logs for the selected date
      if (logDate.getTime() !== targetDate.getTime()) return;

      const memberId = log.userId?._id;
      if (!memberId) return;

      if (!memberMap.has(memberId)) {
        memberMap.set(memberId, {
          memberId,
          name: log.userId?.name || 'Unknown',
          email: log.userId?.email || 'N/A',
          records: [],
          lastActivity: null,
          status: 'Pending'
        });
      }

      const member = memberMap.get(memberId);
      member.records.push(log);

      // Determine the latest activity and status
      if (!member.lastActivity || new Date(log.date) > new Date(member.lastActivity)) {
        member.lastActivity = log.date;
        
        if (log.checkIn && !log.checkOut) {
          member.status = 'Checked In';
        } else if (log.checkIn && log.checkOut) {
          member.status = 'Checked Out';
        } else {
          member.status = log.status || 'Pending';
        }
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
          <div className="search-filters" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="search-input"
              style={{ width: '180px' }}
            />
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
                  <th>Status</th>
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
                      <span className={`badge ${member.status === 'Checked In' ? 'active' : member.status === 'Checked Out' ? 'cancelled' : 'expired'}`}>
                        {member.status}
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
                      No attendance records found for the selected date.
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
