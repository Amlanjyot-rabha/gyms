import React from 'react';

/**
 * Dashboard page component.
 * Placeholder for the superadmin dashboard.
 */
const Dashboard = () => {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to the Gym Admin Dashboard overview.</p>
      </header>
      <div className="page-content">
        <div className="card-grid">
          <div className="card">
            <h3>Total Members</h3>
            <div className="card-value">1,250</div>
          </div>
          <div className="card">
            <h3>Active Trainers</h3>
            <div className="card-value">45</div>
          </div>
          <div className="card">
            <h3>Revenue This Month</h3>
            <div className="card-value">$12,400</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
