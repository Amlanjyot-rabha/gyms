import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import './AdminStyles.css';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const fetchAdmins = async () => {
    try {
      const res = await axiosInstance.get('/admin/admins');
      if (res.data.success) {
        setAdmins(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (admins.length >= 3) {
      alert('Maximum limit of 3 normal admins reached.');
      return;
    }
    try {
      await axiosInstance.post('/admin/admins', formData);
      alert('Admin added successfully!');
      setShowAddForm(false);
      setFormData({ name: '', email: '', password: '' });
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add admin');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Admin Management</h1>
          <p className="dashboard-subtitle">Manage up to 3 normal admins.</p>
        </div>
        <div className="header-decoration">
          <div className="decoration-circle"></div>
        </div>
      </header>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Admin</h2>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Current: {admins.length}/3 admins</p>
            <form onSubmit={handleAddAdmin} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password" 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="btn-action">Create Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="content-card">
        <div className="card-header">
          <div></div>
          <button 
            className="btn-action" 
            onClick={() => setShowAddForm(true)}
            disabled={admins.length >= 3 && !showAddForm}
          >
            Add New Admin
          </button>
        </div>

        <div className="members-count">
          <span>Showing {admins.length} admin{admins.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="loading-state">Loading admins...</div>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin._id}>
                    <td>{admin.name}</td>
                    <td>{admin.email}</td>
                    <td><span className="badge active">{admin.role}</span></td>
                    <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>No admins found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;
