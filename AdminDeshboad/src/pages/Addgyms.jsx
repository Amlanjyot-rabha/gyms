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
  const [waStatus, setWaStatus] = useState('disconnected');
  const [waQrCode, setWaQrCode] = useState(null);
  const [waNumber, setWaNumber] = useState(null);

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

  useEffect(() => {
    let interval;
    const fetchWaStatus = async () => {
      try {
        const res = await axiosInstance.get('/admin/whatsapp/status');
        if (res.data) {
          setWaStatus(res.data.status);
          setWaQrCode(res.data.qrCode);
          setWaNumber(res.data.connectedNumber);
        }
      } catch (error) {
        console.error('Failed to fetch WA status');
      }
    };
    
    fetchWaStatus();
    interval = setInterval(fetchWaStatus, 3000);
    return () => clearInterval(interval);
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

  const connectWhatsApp = async () => {
    setWaStatus('initializing');
    try {
      await axiosInstance.post('/admin/whatsapp/connect');
    } catch (e) {
      alert('Failed to initialize WhatsApp connection');
    }
  };

  const disconnectWhatsApp = async () => {
    try {
      await axiosInstance.post('/admin/whatsapp/disconnect');
      setWaStatus('disconnected');
      setWaQrCode(null);
      setWaNumber(null);
    } catch (e) {
      alert('Failed to disconnect');
    }
  };

  const sendWaTestMessage = async () => {
    if (!waNumber) return;
    try {
      await axiosInstance.post('/admin/whatsapp/test', { phone: waNumber });
      alert('Test message sent!');
    } catch (e) {
      alert('Failed to send test message');
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

      <div className="content-card" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>WhatsApp Integration</h2>
        <div className="whatsapp-section">
          {waStatus === 'disconnected' && (
            <div className="text-center" style={{ padding: '2rem' }}>
              <p style={{ marginBottom: '1rem', color: 'var(--muted)' }}>Status: Not Connected</p>
              <button className="btn-action btn-success" onClick={connectWhatsApp}>Connect WhatsApp</button>
            </div>
          )}
          
          {waStatus === 'initializing' && (
            <div className="text-center" style={{ padding: '2rem' }}>
              <p>Initializing WhatsApp client... Please wait.</p>
            </div>
          )}
          
          {waStatus === 'qr_ready' && waQrCode && (
            <div className="text-center" style={{ padding: '2rem' }}>
              <p style={{ marginBottom: '1rem' }}>Scan this QR code with your WhatsApp mobile app to connect.</p>
              <img src={waQrCode} alt="WhatsApp QR Code" style={{ width: '250px', height: '250px', margin: '0 auto', display: 'block', borderRadius: '8px' }} />
            </div>
          )}
          
          {waStatus === 'connected' && (
            <div className="text-center" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: '#22c55e', borderRadius: '50%', display: 'inline-block' }}></span>
                <strong style={{ fontSize: '1.1rem' }}>Connected</strong>
              </div>
              <p style={{ marginBottom: '1.5rem', color: 'var(--muted)' }}>Phone Number: {waNumber}</p>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn-action" onClick={sendWaTestMessage} style={{ backgroundColor: '#25D366' }}>
                  Send Test Message
                </button>
                <button className="btn-action" onClick={disconnectWhatsApp} style={{ backgroundColor: '#ef4444' }}>
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Addgyms;
