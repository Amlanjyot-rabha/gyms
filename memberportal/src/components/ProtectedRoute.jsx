import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — Simple auth guard for member-only routes.
 *
 * BEHAVIOR:
 *   1. If loading → show loading spinner
 *   2. If auth error OR no user OR wrong role → redirect to /login
 *   3. Otherwise → render children
 *
 * IMPORTANT: This component has NO side effects, NO API calls, NO state mutations.
 * It ONLY reads auth state from AuthContext and renders accordingly.
 */
export function ProtectedRoute({ children }) {
  const { user, isLoading, isAuthError } = useAuth();

  // Show loading while AuthContext is bootstrapping session
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0f1117',
        color: '#e2e8f0',
        fontSize: '1rem',
        fontFamily: 'Inter, sans-serif',
        gap: '0.75rem'
      }}>
        <span style={{
          width: '20px', height: '20px',
          border: '2px solid #6366f1',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          display: 'inline-block'
        }} />
        Loading your session...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Redirect to login if:
  // - Auth error occurred (401 from bootstrap)
  // - No user in context
  // - User role is not 'member'
  const shouldRedirect = isAuthError || !user || user.role !== 'member';

  if (shouldRedirect) {
    return <Navigate to="/login" replace />;
  }

  // Auth valid and role correct - render the protected content
  return children;
}
