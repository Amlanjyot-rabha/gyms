 import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ChangePassword } from './pages/ChangePassword';
import { Attendance } from './pages/Attendance';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * App — Root component with ErrorBoundary protection.
 *
 * ErrorBoundary prevents entire app crash from any single component error.
 * All routes are wrapped for maximum stability.
 */
function App() {
  return (
    <ErrorBoundary>
      <Router basename="/memberportal">
        <Routes>

          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Member-only protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <Attendance />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;