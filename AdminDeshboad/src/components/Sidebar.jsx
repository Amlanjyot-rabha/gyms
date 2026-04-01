import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

/**
 * Sidebar component for navigation.
 * Receives isOpen and onClose props for mobile responsiveness.
 */
const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'gyms', path: '/members' },
    { name: 'add new gym', path: '/addgym' },
    { name: 'Payments', path: '/payments' },
    { name: 'Reports', path: '/reports' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-menu">
        <ul className="menu-list">
          {menuItems.map((item) => (
            <li key={item.name} className="menu-item">
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? 'menu-link active' : 'menu-link'}
                onClick={onClose} // Close sidebar on mobile after clicking a link
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
