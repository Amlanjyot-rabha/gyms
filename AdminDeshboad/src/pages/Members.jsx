import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import './AdminStyles.css';

export function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    membershipType: '',
    price: 0,
  });

  const fetchMembers = async () => {
    try {
      const res = await axiosInstance.get('/admin/members');
      setMembers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembershipPlans = async () => {
    try {
      const res = await axiosInstance.get('/cms');
      if (res.data.success && res.data.data.membershipPlans) {
        const plans = res.data.data.membershipPlans.plans;
        setMembershipPlans(plans);
        
        // Set default plan if none selected
        if (plans.length > 0 && !formData.membershipType) {
          setFormData(prev => ({
            ...prev,
            membershipType: plans[0].name,
            price: parseInt(plans[0].price.replace(/[^0-9]/g, ''))
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch membership plans:', err);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchMembershipPlans();
  }, []);

  const handleViewMember = (memberId) => {
    navigate(`/members/${memberId}`);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/admin/members', formData);
      alert('Member added successfully!');
      setShowAddForm(false);
      
      // Reset form with default plan
      const defaultPlan = membershipPlans.length > 0 ? membershipPlans[0] : null;
      setFormData({ 
        name: '', 
        email: '', 
        password: '', 
        membershipType: defaultPlan ? defaultPlan.name : '',
        price: defaultPlan ? parseInt(defaultPlan.price.replace(/[^0-9]/g, '')) : 0
      });
      fetchMembers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to add member';
      alert(`Error: ${errorMessage}`);
    }
  };

  const getRemainingDays = (expiry) => {
    const diff = new Date(expiry) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getDisplayStatus = (member) => {
    const remainingDays = getRemainingDays(member.membershipEnd);
    if (member.status === 'expired') return 'expired';
    if (remainingDays <= 5) return 'expiring-soon';
    return member.status;
  };

  const getStatusLabel = (member) => {
    const remainingDays = getRemainingDays(member.membershipEnd);
    if (member.status === 'expired') return 'Expired';
    if (remainingDays <= 5 && member.status === 'active') return 'Expiring Soon';
    return member.status.charAt(0).toUpperCase() + member.status.slice(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getRowStyle = (member) => {
    const remainingDays = getRemainingDays(member.membershipEnd);
    if (member.status === 'expired') return { backgroundColor: '#fee2e2' };
    if (remainingDays <= 5 && member.status === 'active') return { backgroundColor: '#fef3c7' };
    return {};
  };

  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (member.userId?.name || '').toLowerCase().includes(searchLower) ||
      (member.userId?.email || '').toLowerCase().includes(searchLower);

    const matchesFilter =
      statusFilter === 'all' ||
      (statusFilter === 'active' && member.status === 'active') ||
      (statusFilter === 'expired' && member.status === 'expired');

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Members Management</h1>
        <button className="btn-action" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add New Member'}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Add New Member</h3>
          <form onSubmit={handleAddMember} className="admin-form">
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
            <div className="form-group">
              <label>Membership Plan</label>
              <select 
                value={formData.membershipType} 
                onChange={(e) => {
                  const selectedPlan = membershipPlans.find(plan => plan.name === e.target.value);
                  const price = selectedPlan ? parseInt(selectedPlan.price.replace(/[^0-9]/g, '')) : 0;
                  setFormData({...formData, membershipType: e.target.value, price});
                }}
              >
                {membershipPlans.map(plan => (
                  <option key={plan.id} value={plan.name}>
                    {plan.name} (₹{parseInt(plan.price.replace(/[^0-9]/g, ''))})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-action">Create Member</button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              minWidth: '250px',
              flex: '1'
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              minWidth: '150px'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Showing {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? <p>Loading members...</p> : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Plan</th>
                  <th>Expiry</th>
                  <th>Remaining Days</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(member => (
                  <tr key={member._id} style={getRowStyle(member)}>
                    <td style={{ fontWeight: '500' }}>{member.userId?.name || 'Unknown'}</td>
                    <td style={{ color: '#6b7280' }}>{member.userId?.email || 'N/A'}</td>
                    <td>
                      <span className={`badge ${getDisplayStatus(member)}`}>
                        {getStatusLabel(member)}
                      </span>
                    </td>
                    <td>{member.membershipType}</td>
                    <td>{formatDate(member.membershipEnd)}</td>
                    <td>{getRemainingDays(member.membershipEnd)} days</td>
                    <td>
                      <button
                        className="btn-action"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        onClick={() => handleViewMember(member._id)}
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      No members found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
