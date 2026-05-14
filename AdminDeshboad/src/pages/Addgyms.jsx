import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import './AdminStyles.css';

const Addgyms = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    latitude: 0,
    longitude: 0,
    radius: 100,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchGymSettings = async () => {
      try {
        const res = await axiosInstance.get('/gym/settings');
        if (res.data.success && res.data.data) {
          const gym = res.data.data;
          setFormData({
            name: gym.name || '',
            address: gym.address || '',
            phone: gym.phone || '',
            email: gym.email || '',
            latitude: gym.location?.latitude || 0,
            longitude: gym.location?.longitude || 0,
            radius: gym.radius || 100,
          });
        }
      } catch (error) {
        console.error('Error fetching gym settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGymSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' || name === 'radius' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosInstance.put('/admin/gym', formData);
      alert('Gym settings updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update gym settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading settings...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Gym Settings</h1>
          <p className="dashboard-subtitle">Configure your gym's location and contact details.</p>
        </div>
        <div className="header-decoration">
          <div className="decoration-circle"></div>
        </div>
      </header>

      <div className="content-card">
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Gym Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Radius (meters)</label>
              <input type="number" name="radius" value={formData.radius} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude</label>
              <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows="3" required></textarea>
          </div>

          <button type="submit" className="btn-action" disabled={saving}>
            {saving ? 'Saving...' : 'Update Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Addgyms;
