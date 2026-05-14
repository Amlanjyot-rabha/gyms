import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import './AdminStyles.css';

export default function AttendanceDetails() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch member details
        const memberRes = await axiosInstance.get(`/admin/members`);
        const memberData = memberRes.data.data.find(m => m.userId?._id === memberId || m._id === memberId);
        setMember(memberData);

        // Fetch all attendance and filter by member
        const attendanceRes = await axiosInstance.get('/admin/attendance');
        const memberAttendance = attendanceRes.data.data.filter(log => 
          log.userId?._id === memberId
        );
        setAttendance(memberAttendance);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [memberId]);

  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Generate options for current and previous year
    for (let year = currentYear; year >= currentYear - 1; year--) {
      for (let month = 11; month >= 0; month--) {
        const value = `${year}-${String(month + 1).padStart(2, '0')}`;
        const label = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
        options.push({ value, label });
      }
    }
    return options;
  };

  const filteredAttendance = attendance.filter(log => {
    const logDate = new Date(log.date);
    const [year, month] = selectedMonth.split('-');
    return logDate.getFullYear() === parseInt(year) && logDate.getMonth() === parseInt(month) - 1;
  });

  // Calculate monthly stats
  const presentDays = filteredAttendance.length;
  const [selectedYear, selectedMonthNum] = selectedMonth.split('-');
  const totalDaysInMonth = new Date(parseInt(selectedYear), parseInt(selectedMonthNum), 0).getDate();
  const attendancePercentage = Math.round((presentDays / totalDaysInMonth) * 100);

  // Get color for progress bar based on percentage
  const getProgressColor = (percentage) => {
    if (percentage >= 75) return '#22c55e'; // green
    if (percentage >= 40) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });
    return `${day} ${month} ${year}, ${time}`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Member Attendance</h1>
          <p style={{ margin: '0', color: '#6b7280' }}>
            {member ? `Viewing attendance for ${member.userId?.name || 'Unknown'}` : 'Loading...'}
          </p>
        </div>
        <button 
          className="btn-action btn-outline" 
          onClick={() => navigate('/attendance')}
        >
          ← Back to Attendance
        </button>
      </div>

      {loading ? <p>Loading...</p> : (
        <>
          {/* Member Info Section */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Member Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ color: '#6b7280', fontSize: '0.875rem' }}>Name</label>
                <p style={{ margin: '5px 0 0 0', fontWeight: '500' }}>
                  {member?.userId?.name || 'Unknown'}
                </p>
              </div>
              <div>
                <label style={{ color: '#6b7280', fontSize: '0.875rem' }}>Email</label>
                <p style={{ margin: '5px 0 0 0', fontWeight: '500' }}>
                  {member?.userId?.email || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Month Filter Section */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ fontWeight: '500' }}>Select Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  minWidth: '200px'
                }}
              >
                {getMonthOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                {filteredAttendance.length} record{filteredAttendance.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Monthly Stats Section */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Monthly Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '15px' }}>
              <div>
                <label style={{ color: '#6b7280', fontSize: '0.875rem' }}>Present</label>
                <p style={{ margin: '5px 0 0 0', fontWeight: '600', fontSize: '1.25rem' }}>
                  {presentDays} days
                </p>
              </div>
              <div>
                <label style={{ color: '#6b7280', fontSize: '0.875rem' }}>Total Days</label>
                <p style={{ margin: '5px 0 0 0', fontWeight: '600', fontSize: '1.25rem' }}>
                  {totalDaysInMonth}
                </p>
              </div>
              <div>
                <label style={{ color: '#6b7280', fontSize: '0.875rem' }}>Attendance</label>
                <p style={{ margin: '5px 0 0 0', fontWeight: '600', fontSize: '1.25rem' }}>
                  {attendancePercentage}%
                </p>
              </div>
            </div>
            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${attendancePercentage}%`,
                  height: '100%',
                  backgroundColor: getProgressColor(attendancePercentage),
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Attendance List Section */}
          <div className="card">
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Attendance Records</h3>
            {filteredAttendance.length > 0 ? (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map(log => (
                      <tr key={log._id}>
                        <td>{formatDate(log.date)}</td>
                        <td>
                          <span className="badge active">Present</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                No attendance records for this month.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
