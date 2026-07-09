 import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SidebarLayout } from './layouts/SidebarLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Members } from './pages/Members';
import MemberDetails from './pages/MemberDetails';
import { Attendance } from './pages/Attendance';
import AttendanceDetails from './pages/AttendanceDetails';
import { CMSManager } from './pages/CMSManager';
import { Settings } from './pages/Settings';
import Dashboard from './pages/Dashboard';
import Addgyms from './pages/Addgyms';
import AdminManagement from './pages/AdminManagement';
import SalesReport from './pages/SalesReport';

function App() {
  return (
    <Router basename="/dashboard">
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <SidebarLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="members/:id" element={<MemberDetails />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="attendance/:memberId" element={<AttendanceDetails />} />
          <Route path="cms" element={<CMSManager />} />
          <Route path="gym-settings" element={<Addgyms />} />

          {/* Super admin only — ProtectedRoute enforces this at the route level */}
          <Route
            path="admins"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminManagement />
              </ProtectedRoute>
            }
          />

          <Route path="settings" element={<Settings />} />
          <Route path="sales-report" element={<SalesReport />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;