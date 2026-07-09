import React from 'react';

/**
 * Payments page component.
 * Placeholder for managing gym payments and subscriptions.
 */
const Payments = () => {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Payments & Subscriptions</h1>
        <p>Track all membership payments and pending dues.</p>
      </header>
      <div className="page-content">
        <div className="summary-cards">
          <div className="summary-card success">
            <h4>Successful Payments</h4>
            <div className="card-value">124</div>
          </div>
          <div className="summary-card pending">
            <h4>Pending Payments</h4>
            <div className="card-value">15</div>
          </div>
          <div className="summary-card failed">
            <h4>Failed Payments</h4>
            <div className="card-value">3</div>
          </div>
        </div>
        <div className="recent-transactions">
          <h3>Recent Transactions</h3>
          <div className="transaction-list">
            <div className="transaction-item">
              <div className="trans-info">
                <strong>John Doe</strong>
                <span>Monthly Membership</span>
              </div>
              <div className="trans-amount success">₹45.00</div>
              <div className="trans-date">2026-03-15</div>
            </div>
            <div className="transaction-item">
              <div className="trans-info">
                <strong>Jane Smith</strong>
                <span>Yearly Membership</span>
              </div>
              <div className="trans-amount success">₹450.00</div>
              <div className="trans-date">2026-03-14</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
