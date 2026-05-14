import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import './AdminStyles.css';

function MemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('1 Month');
  const [actionLoading, setActionLoading] = useState(false);

  const getRemainingDays = (expiry) => {
    const diff = new Date(expiry) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getStatusLabel = (memberData) => {
    if (!memberData) return 'Unknown';
    if (memberData.status === 'expired') return 'Expired';
    if (memberData.status === 'cancelled') return 'Cancelled';
    const remainingDays = getRemainingDays(memberData.membershipEnd);
    if (remainingDays <= 5 && memberData.status === 'active') return 'Expiring Soon';
    return memberData.status.charAt(0).toUpperCase() + memberData.status.slice(1);
  };

  const fetchMember = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/admin/members');
      const found = res.data.data.find((item) => item._id === id);
      setMember(found || null);
    } catch (err) {
      console.error(err);
      setMember(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();
  }, [id]);

  const getNewExpiryDate = (memberData, plan) => {
    if (!memberData) return 'N/A';

    const planDurationMap = {
      '1 Month': 30,
      '3 Months': 90,
      '6 Months': 180,
      '12 Months': 365,
    };
    const durationDays = planDurationMap[plan] || 30;

    const currentExpiry = new Date(memberData.membershipEnd);
    const today = new Date();

    let newExpiry;
    if (memberData.status === 'active' && currentExpiry > today) {
      newExpiry = new Date(currentExpiry);
      newExpiry.setDate(newExpiry.getDate() + durationDays);
    } else {
      newExpiry = new Date(today);
      newExpiry.setDate(newExpiry.getDate() + durationDays);
    }

    return newExpiry;
  };

  const handleRenewConfirm = async () => {
    if (!member) return;
    setActionLoading(true);

    try {
      await axiosInstance.post(`/admin/members/${member._id}/renew`, {
        plan: selectedPlan,
      });
      alert('Membership renewed successfully');
      setShowRenewModal(false);
      fetchMember();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to renew membership');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelMembership = async () => {
    if (!member) return;
    if (!confirm('Are you sure you want to cancel this membership?')) return;
    setActionLoading(true);

    try {
      await axiosInstance.put(`/admin/members/${member._id}/cancel`);
      alert('Membership cancelled successfully');
      fetchMember();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel membership');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Member Details</h1>
          <p>Member profile, status, and renewal actions.</p>
        </div>
        <button className="btn-action btn-outline" onClick={() => navigate('/members')}>
          Back to Members
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p>Loading member details...</p>
        ) : !member ? (
          <div>
            <p>Member not found.</p>
            <button className="btn-action" onClick={() => navigate('/members')}>
              Back to Members
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 6px', color: '#6b7280' }}>Name</p>
                  <h2 style={{ margin: 0 }}>{member.userId?.name || 'Unknown'}</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 6px', color: '#6b7280' }}>Status</p>
                  <span className={`badge ${member.status}`}>{getStatusLabel(member)}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div>
                  <p style={{ margin: '0 0 6px', color: '#6b7280' }}>Email</p>
                  <p style={{ margin: 0 }}>{member.userId?.email || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 6px', color: '#6b7280' }}>Plan</p>
                  <p style={{ margin: 0 }}>{member.membershipType || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 6px', color: '#6b7280' }}>Expiry Date</p>
                  <p style={{ margin: 0 }}>{formatDate(member.membershipEnd)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 6px', color: '#6b7280' }}>Remaining Days</p>
                  <p style={{ margin: 0 }}>{getRemainingDays(member.membershipEnd)} days</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 6px', color: '#6b7280' }}>Join Date</p>
                  <p style={{ margin: 0 }}>{formatDate(member.membershipStart)}</p>
                </div>
              </div>
            </div>

            <div className="toolbar" style={{ marginBottom: '24px' }}>
              <button
                className="btn-action"
                style={{ minWidth: '180px' }}
                onClick={() => {
                  setSelectedPlan('1 Month');
                  setShowRenewModal(true);
                }}
              >
                Renew Membership
              </button>
              <button
                className="btn-action btn-danger"
                style={{ minWidth: '180px' }}
                onClick={handleCancelMembership}
                disabled={member.status === 'cancelled' || actionLoading}
              >
                Cancel Membership
              </button>
            </div>

            <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '18px' }}>
              <h3 style={{ margin: '0 0 12px' }}>Membership Summary</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Payment Status</span>
                  <strong>{member.paymentStatus || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Membership ID</span>
                  <strong>{member._id}</strong>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showRenewModal && member && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            width: '420px',
            maxWidth: '92%',
            backgroundColor: '#fff',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 24px 80px rgba(15, 23, 42, 0.15)',
          }}>
            <h2 style={{ margin: '0 0 18px' }}>Renew Membership</h2>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 600 }}>Select Plan</label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                }}
              >
                <option value="1 Month">1 Month</option>
                <option value="3 Months">3 Months</option>
              </select>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              marginBottom: '22px',
            }}>
              <p style={{ margin: 0, color: '#1d4ed8' }}>
                New expiry will be: <strong>{formatDate(getNewExpiryDate(member, selectedPlan))}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                className="btn-action"
                onClick={() => setShowRenewModal(false)}
                disabled={actionLoading}
                style={{ backgroundColor: '#fff', border: '1px solid #d1d5db', color: '#111827' }}
              >
                Cancel
              </button>
              <button
                className="btn-action"
                onClick={handleRenewConfirm}
                disabled={actionLoading}
                style={{ backgroundColor: '#2563eb', color: '#fff' }}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberDetails;
