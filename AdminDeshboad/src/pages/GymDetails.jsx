import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGyms } from '../context/GymContext';

/**
 * Gym Detail component.
 * Extracts gym ID from URL params and displays all details of the selected gym.
 */
const GymDetails = () => {
  const { gymid } = useParams();
  const navigate = useNavigate();
  const { gyms } = useGyms();

  // Find the gym based on the ID from URL
  const gym = gyms.find((g) => g.id === parseInt(gymid));

  // If no gym is found, display a message
  if (!gym) {
    return (
      <div className="page-container">
        <header className="page-header">
          <h1>Gym Not Found</h1>
          <p>The gym you are looking for does not exist.</p>
        </header>
        <button className="edit-btn" onClick={() => navigate('/members')}>
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>{gym.gymName} Details</h1>
        <p>Full information about the gym and its registration status.</p>
      </header>

      <div className="page-content">
        <div className="form-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="detail-section">
            <div className="form-row">
              <div className="form-group">
                <label>Gym Name</label>
                <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2c3e50' }}>{gym.gymName}</p>
              </div>
              <div className="form-group">
                <label>Status</label>
                <span className={`status-badge ${gym.status.toLowerCase()}`} style={{ display: 'inline-block', width: 'fit-content', padding: '8px 16px', fontSize: '1rem' }}>
                  {gym.status}
                </span>
              </div>
            </div>

            <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid #eee' }} />

            <div className="form-row">
              <div className="form-group">
                <label>Owner Name</label>
                <p>{gym.ownerName}</p>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <p>{gym.email}</p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <p>{gym.phone}</p>
              </div>
              <div className="form-group">
                <label>Plan Duration</label>
                <p>{gym.planDuration}</p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Gym Address</label>
                <p>{gym.address}</p>
              </div>
            </div>

            <div className="price-display" style={{ marginTop: '2rem' }}>
              <div className="price-tag">
                <span className="label">Total Plan Price:</span>
                <span className="amount">₹{gym.price}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                className="submit-btn" 
                style={{ flex: 1, backgroundColor: '#7f8c8d' }}
                onClick={() => navigate('/members')}
              >
                Back to List
              </button>
              <button 
                className="submit-btn" 
                style={{ flex: 1 }}
                onClick={() => alert('Edit functionality coming soon!')}
              >
                Edit Gym Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymDetails;
