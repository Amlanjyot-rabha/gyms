import React from 'react';
import '../styles/Navbar.css';

/**
 * Navbar component for the top navigation bar.
 * Displays a hamburger menu (mobile view), gym logo, and user profile section.
 */
const Navbar = ({ onToggleSidebar }) => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* Hamburger menu for mobile screens */}
        <button className="hamburger-menu" onClick={onToggleSidebar} aria-label="Toggle Menu">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </button>
        <div className="logo">GymAdmin</div>
      </div>
      <div className="navbar-right">
        <div className="user-profile">
          <button className="nav-btn sign-in">Sign In</button>
          <button className="nav-btn sign-out">Sign Out</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
