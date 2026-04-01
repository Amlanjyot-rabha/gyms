import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GymProvider } from './context/GymContext';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import GymDetails from './pages/GymDetails';
import Addgyms from './pages/Addgyms';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Login from './pages/Login';
import './App.css';

/**
 * Main App component.
 * Sets up the BrowserRouter and defines routes for the Gym Dashboard.
 * Each route is wrapped in a common Layout component.
 */
function App() {
  return (
    <Router>
      <GymProvider>
        <Routes>
          {/* Login route - no layout */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard routes - with layout */}
          <Route 
            path="/*" 
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/members/:gymid" element={<GymDetails />} />
                  <Route path="/addgym" element={<Addgyms />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/reports" element={<Reports />} />
                </Routes>
              </Layout>
            } 
          />
        </Routes>
      </GymProvider>
    </Router>
  );
}

export default App;
