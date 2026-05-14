import { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Button } from './Button';
import './AuthModal.css';

export function AuthModal({ isOpen, onClose, selectedPlan }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 1. Register User (creates User + inactive Member record)
      const res = await axiosInstance.post('/auth/register', formData);
      
      setSuccess(res.data.message || 'Successfully registered! Please log in to the member portal to continue.');
      
      setTimeout(() => {
        // Redirect to member portal login page
        window.location.href = 'http://localhost:5175/login';
      }, 2500);
      
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>{selectedPlan ? `Get ${selectedPlan.name}` : 'Join the Gym'}</h2>
        
        {success ? (
          <div className="modal-success">{success}</div>
        ) : (
           <form onSubmit={handleSubmit} className="modal-form">
            {error && <div className="modal-error">{error}</div>}
            
            <div className="form-group">
               <label htmlFor="name">Full Name</label>
               <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} />
            </div>
            
            <div className="form-group">
               <label htmlFor="email">Email</label>
               <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} />
            </div>
            
            <div className="form-group">
               <label htmlFor="password">Password</label>
               <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} />
            </div>

            <Button type="submit" block variant="primary" disabled={loading}>
               {loading ? 'Processing...' : 'Register & Pay'}
            </Button>
           </form>
        )}
      </div>
    </div>
  );
}
