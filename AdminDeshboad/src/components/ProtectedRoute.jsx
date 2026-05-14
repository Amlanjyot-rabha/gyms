import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — guards routes behind authentication.
 *
 * Props:
 *   children      — the component to render when authorized
 *   allowedRoles  — optional array of roles allowed (e.g. ['super_admin'])
 *                   if omitted, any authenticated user is allowed
 *
 * Behavior:
 *   - Shows a loading screen while session is being bootstrapped
 *   - Redirects to /login if not authenticated
 *   - Redirects to /dashboard if authenticated but wrong role
 */
export function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary, #0f1117)',
        color: 'var(--text-primary, #e2e8f0)',
        fontSize: '1rem',
        fontFamily: 'Inter, sans-serif',
        gap: '0.75rem'
      }}>
        <span style={{
          width: '20px', height: '20px',
          border: '2px solid #4f46e5',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          display: 'inline-block'
        }} />
        Verifying session...
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Authenticated but insufficient role
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
