import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import '../styles/Layout.css';

/**
 * Layout component that wraps the common Navbar and Sidebar around the main content.
 * Manages the state for the mobile sidebar drawer.
 */
const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle function to open/close the sidebar drawer on mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close the sidebar (useful for navigation or clicking outside on mobile)
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="layout">
      {/* Passing toggle function to Navbar for the hamburger menu */}
      <Navbar onToggleSidebar={toggleSidebar} />
      
      <div className="layout-body">
        {/* Passing state and close function to Sidebar for mobile behavior */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        
        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={closeSidebar}></div>
        )}
        
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
