import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import './AdminStyles.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    totalAttendance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p>Real-time analytics for your gym.</p>
        </div>
      </header>

      <div className="card-grid">
        <div className="card stat-card">
          <h3>Total Members</h3>
          <div className="card-value">{stats.totalMembers}</div>
        </div>
        <div className="card stat-card">
          <h3>Active Members</h3>
          <div className="card-value">{stats.activeMembers}</div>
        </div>
        <div className="card stat-card">
          <h3>Expired Members</h3>
          <div className="card-value">{stats.expiredMembers}</div>
        </div>
        <div className="card stat-card">
          <h3>Total Attendance</h3>
          <div className="card-value">{stats.totalAttendance}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
