import { Component } from 'react';

/**
 * ErrorBoundary — Catches React errors and prevents entire app crash.
 *
 * Without this, one uncaught error in any component crashes the whole Member Portal.
 * With this, errors are contained and users see a graceful fallback UI.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleRetry = () => {
    // Reset error state and re-render
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    // Full page reload as last resort
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#0f1117',
          color: '#e2e8f0',
          fontFamily: 'Inter, sans-serif',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '400px', marginBottom: '2rem' }}>
            The app encountered an error. You can try to recover or reload the page.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 500
              }}
            >
              🔄 Try Again
            </button>
            <button
              onClick={this.handleReload}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                color: '#94a3b8',
                border: '1px solid #334155',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Reload Page
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre style={{
              marginTop: '2rem',
              padding: '1rem',
              background: '#1e293b',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#ef4444',
              maxWidth: '600px',
              overflow: 'auto'
            }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
