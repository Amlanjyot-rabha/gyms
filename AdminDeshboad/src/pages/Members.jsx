import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGyms } from '../context/GymContext';

/**
 * Members page component.
 * Displays a list of gyms with their basic details and status.
 * Allows navigation to individual gym details.
 */
const Members = () => {
  const navigate = useNavigate();
  const { gyms } = useGyms();

  /**
   * Navigates to the gym detail page
   * @param {number} id - The ID of the gym
   */
  const handleViewDetails = (id) => {
    navigate(`/members/${id}`);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gym Management List</h1>
        <p>View and manage all registered gym locations.</p>
      </header>

      <div className="page-content">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Owner Name</th>
                <th>Gym Name</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {gyms.map((gym) => (
                <tr key={gym.id}>
                  <td style={{ fontWeight: '500', color: '#2c3e50' }}>{gym.ownerName}</td>
                  <td>{gym.gymName}</td>
                  <td>{gym.planDuration}</td>
                  <td>
                    <span className={`status-badge ${gym.status.toLowerCase()}`}>
                      {gym.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="edit-btn"
                      onClick={() => handleViewDetails(gym.id)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Members;
