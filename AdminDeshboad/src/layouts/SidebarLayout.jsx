import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiUsers, FiCalendar, FiBarChart2, FiFileText, FiLogOut, FiGrid, FiMapPin, FiShield, FiChevronDown, FiKey, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import './SidebarLayout.css';

export function SidebarLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [gymStatus, setGymStatus]           = useState('open');  // 'open' | 'closed'
  const [statusLoading, setStatusLoading]   = useState(false);
  const location   = useLocation();
  const navigate   = useNavigate();
  const { user, logout } = useAuth();
  const profileRef = useRef(null);

  // Read current gym status from CMS on mount
  useEffect(() => {
    axiosInstance.get('/cms')
      .then(res => {
        const status = res.data?.data?.siteStatus ?? 'open';
        setGymStatus(status);
      })
      .catch(() => {}); // fail silently, default stays 'open'
  }, []);

  const handleStatusToggle = async () => {
    if (statusLoading) return;
    const newStatus = gymStatus === 'open' ? 'closed' : 'open';
    setStatusLoading(true);
    try {
      const res = await axiosInstance.get('/cms');
      const currentData = res.data?.data || {};
      await axiosInstance.put('/cms', { ...currentData, siteStatus: newStatus });
      setGymStatus(newStatus);
    } catch {
      alert('Failed to update gym status. Please try again.');
    } finally {
      setStatusLoading(false);
    }
  };

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    await logout(); // clears cookie + redirects to /login
  };

  const handleChangePassword = () => {
    setProfileMenuOpen(false);
    navigate('/settings');
  };

  // Derive display initial and role label
  const displayInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';
  const displayName = user?.name || 'Admin';
  const roleLabel = user?.role === 'super_admin' ? 'Super Admin' : 'Admin';

  return (
    <div className="admin-layout">
      <header className="topbar">
        <button
          className="icon-btn"
          type="button"
          aria-label="Open menu"
          onClick={() => setIsOpen(true)}
        >
          <span className="icon-btn-lines" aria-hidden="true" />
        </button>
        <div className="topbar-title">Admin Dashboard</div>

        {/* Open / Closed Status Toggle */}
        <button
          id="gym-status-toggle"
          type="button"
          className={`gym-status-toggle gym-status-toggle--topbar ${gymStatus === 'open' ? 'gym-status-toggle--open' : 'gym-status-toggle--closed'}`}
          onClick={handleStatusToggle}
          disabled={statusLoading}
          title={gymStatus === 'open' ? 'Click to mark gym as Closed' : 'Click to mark gym as Open'}
          aria-label={`Gym is ${gymStatus}. Toggle status.`}
        >
          <span className="gym-status-dot" aria-hidden />
          {statusLoading ? 'Saving…' : gymStatus === 'open' ? 'Open Now' : 'Closed'}
        </button>

        {/* Profile Dropdown */}
        <div className="topbar-profile" ref={profileRef}>
          <button
            id="profile-menu-btn"
            className="profile-trigger"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={profileMenuOpen}
          >
            <div className="topbar-avatar" aria-hidden="true">{displayInitial}</div>
            <div className="topbar-meta">
              <div className="topbar-name">{displayName}</div>
              <div className="topbar-role">{roleLabel}</div>
            </div>
            <FiChevronDown
              size={14}
              style={{
                color: 'var(--muted)',
                transition: 'transform 180ms ease',
                transform: profileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            />
          </button>

          {profileMenuOpen && (
            <div className="profile-dropdown" role="menu">
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-avatar">{displayInitial}</div>
                <div>
                  <div className="profile-dropdown-name">{displayName}</div>
                  <div className="profile-dropdown-email">{user?.email}</div>
                  <div className="profile-dropdown-role">{roleLabel}</div>
                </div>
              </div>
              <div className="profile-dropdown-divider" />
              <button
                className="profile-dropdown-item"
                role="menuitem"
                onClick={handleChangePassword}
              >
                <FiKey size={15} /> Change Password
              </button>
              <div className="profile-dropdown-divider" />
              <button
                className="profile-dropdown-item profile-dropdown-item--danger"
                role="menuitem"
                onClick={handleLogout}
              >
                <FiLogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <div
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
        role="presentation"
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h2>GymAdmin</h2>
          <button
            type="button"
            className="sidebar-close-btn"
            aria-label="Close menu"
            onClick={() => setIsOpen(false)}
          >
            <FiX size={18} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FiGrid /> Dashboard
          </NavLink>
          <NavLink to="/members" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FiUsers /> Members
          </NavLink>
          <NavLink to="/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FiCalendar /> Attendance
          </NavLink>
          <NavLink to="/cms" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FiFileText /> CMS Manager
          </NavLink>
          <NavLink to="/gym-settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FiMapPin /> Gym Settings
          </NavLink>
          {/* Admins page only shown for super_admin */}
          {user?.role === 'super_admin' && (
            <NavLink to="/admins" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FiShield /> Admin Management
            </NavLink>
          )}
          <NavLink to="/sales-report" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FiBarChart2 /> Sales Report
          </NavLink>
          <button
            type="button"
            className="nav-item gym-status-toggle gym-status-toggle--sidebar"
            onClick={handleStatusToggle}
            disabled={statusLoading}
            title={gymStatus === 'open' ? 'Click to mark gym as Closed' : 'Click to mark gym as Open'}
            aria-label={`Gym is ${gymStatus}. Toggle status.`}
          >
            <span className="gym-status-dot" aria-hidden />
            {statusLoading ? 'Saving…' : gymStatus === 'open' ? 'Open Now' : 'Closed'}
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item btn-logout" onClick={handleLogout}>
            <FiLogOut /> Sign Out
          </button>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
