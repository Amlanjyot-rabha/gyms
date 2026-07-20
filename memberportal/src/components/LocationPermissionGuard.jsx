import { useState, useEffect, useCallback } from 'react';

/* ─── Constants ─────────────────────────────────────────────── */
const FIRST_VISIT_KEY = 'portal_has_logged_in_before';

/* ─── Helper ─────────────────────────────────────────────────── */
/**
 * Query the native Permissions API for geolocation state.
 * Returns: 'granted' | 'denied' | 'prompt' | 'unavailable'
 */
async function queryGeolocationPermission() {
  if (!navigator.permissions) return 'unavailable';
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state; // 'granted' | 'denied' | 'prompt'
  } catch {
    return 'unavailable';
  }
}

/**
 * Trigger the native browser geolocation prompt.
 * This is the only mechanism available to invoke the browser's
 * built-in permission dialog from JavaScript.
 */
function requestGeolocationAccess(onGranted, onDenied) {
  if (!('geolocation' in navigator)) {
    onDenied?.('Geolocation is not supported by your browser.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    () => onGranted?.(),
    (err) => onDenied?.(err.message),
    { timeout: 8000, maximumAge: 0 }
  );
}

/* ─── Overlay Backdrop ───────────────────────────────────────── */
function Backdrop({ onClick }) {
  return (
    <div
      aria-hidden="true"
      onClick={onClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 9998,
        animation: 'lpg-fade-in 200ms ease forwards',
      }}
    />
  );
}

/* ─── Main Modal ─────────────────────────────────────────────── */
/**
 * LocationPermissionGuard
 *
 * Member portal modal that:
 * - On FIRST VISIT: immediately pops a custom reminder alert regardless
 *   of current geolocation permission state.
 * - On RETURN VISITS: queries navigator.permissions for 'geolocation';
 *   shows the modal only if state is 'denied' or 'prompt'.
 *
 * Props:
 *   onClose  {function} — called when user dismisses or grants permission.
 *
 * Usage in Dashboard.jsx:
 *   import { LocationPermissionGuard } from '../components/LocationPermissionGuard';
 *   // Inside JSX:
 *   <LocationPermissionGuard onClose={() => {}} />
 */
export function LocationPermissionGuard({ onClose }) {
  const [visible, setVisible]         = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [permState, setPermState]     = useState(null); // 'denied' | 'prompt' | null
  const [requesting, setRequesting]   = useState(false);
  const [reqResult, setReqResult]     = useState(null); // { type: 'success' | 'error', msg: string }

  /* -- Decide whether to show the modal on mount ─────────────── */
  useEffect(() => {
    let cancelled = false;

    const decide = async () => {
      const alreadyVisited = localStorage.getItem(FIRST_VISIT_KEY);

      if (!alreadyVisited) {
        /* First-time visitor: show reminder immediately */
        if (!cancelled) {
          setIsFirstVisit(true);
          setPermState('prompt');
          setVisible(true);
        }
      } else {
        /* Return visitor: only show if geolocation is not granted */
        const state = await queryGeolocationPermission();
        if (!cancelled && (state === 'denied' || state === 'prompt')) {
          setIsFirstVisit(false);
          setPermState(state);
          setVisible(true);
        }
        /* If 'granted' or 'unavailable', stay hidden */
      }
    };

    decide();
    return () => { cancelled = true; };
  }, []);

  /* -- Dismiss handler ────────────────────────────────────────── */
  const handleDismiss = useCallback(() => {
    /* Mark as returning visitor regardless of permission outcome */
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
    setVisible(false);
    onClose?.();
  }, [onClose]);

  /* -- Grant/enable handler ──────────────────────────────────── */
  const handleEnableLocation = useCallback(() => {
    if (permState === 'denied') {
      /* Browser blocks re-prompt when denied; guide user to settings */
      setReqResult({
        type: 'error',
        msg: 'Location was previously denied. Please open your browser settings and set Location to "Always Allow" for this site, then refresh the page.',
      });
      return;
    }

    setRequesting(true);
    setReqResult(null);

    requestGeolocationAccess(
      () => {
        /* Granted */
        setReqResult({ type: 'success', msg: 'Location access granted! You\'re all set.' });
        setRequesting(false);
        localStorage.setItem(FIRST_VISIT_KEY, 'true');
        /* Auto-dismiss after 1.4s on success */
        setTimeout(() => {
          setVisible(false);
          onClose?.();
        }, 1400);
      },
      (errMsg) => {
        /* Denied via prompt or error */
        setRequesting(false);
        setReqResult({
          type: 'error',
          msg: errMsg?.includes('denied')
            ? 'You denied location access. Please change your browser settings to "Always Allow" and refresh.'
            : `Unable to access location: ${errMsg}`,
        });
      }
    );
  }, [permState, onClose]);

  /* -- Don't render if not visible ───────────────────────────── */
  if (!visible) return null;

  const isDenied = permState === 'denied';

  /* -- Render ────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @keyframes lpg-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lpg-slide-up {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes lpg-pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(234,88,12,0.4); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 12px rgba(234,88,12,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(234,88,12,0); }
        }
        .lpg-btn-enable {
          width: 100%;
          padding: 13px 20px;
          border-radius: 12px;
          border: none;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
          color: #fff;
          box-shadow: 0 4px 16px rgba(234,88,12,0.3);
          transition: all 160ms ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .lpg-btn-enable:hover:not(:disabled) {
          background: linear-gradient(135deg, #c2410c 0%, #ea580c 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(234,88,12,0.38);
        }
        .lpg-btn-enable:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
        .lpg-btn-skip {
          width: 100%;
          padding: 11px 20px;
          border-radius: 12px;
          border: 1.5px solid #e5e7eb;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          background: #fff;
          color: #6b7280;
          transition: all 160ms ease;
        }
        .lpg-btn-skip:hover { background: #f9fafb; border-color: #d1d5db; color: #374151; }
        .lpg-spinner {
          width: 16px; height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          animation: lpg-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes lpg-spin { to { transform: rotate(360deg); } }
        .lpg-step {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .lpg-step:last-child { border-bottom: none; }
        .lpg-step-num {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff;
          font-size: 0.72rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
      `}</style>

      {/* Backdrop */}
      <Backdrop onClick={handleDismiss} />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lpg-modal-title"
        aria-describedby="lpg-modal-desc"
        id="lpg-modal"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            maxWidth: 440,
            width: '100%',
            boxShadow: '0 25px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            animation: 'lpg-slide-up 280ms cubic-bezier(0.34,1.56,0.64,1) forwards',
            pointerEvents: 'all',
          }}
        >
          {/* Header gradient band */}
          <div
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #f97316 100%)',
              padding: '28px 28px 20px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              id="lpg-close-btn"
              onClick={handleDismiss}
              aria-label="Close location permission dialog"
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: 8,
                width: 30,
                height: 30,
                cursor: 'pointer',
                color: '#fff',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 150ms ease',
              }}
            >
              ✕
            </button>

            {/* Icon with pulse animation */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                fontSize: 32,
                marginBottom: 12,
                animation: 'lpg-pulse-ring 2s ease-out infinite',
              }}
              aria-hidden="true"
            >
              📍
            </div>

            <h2
              id="lpg-modal-title"
              style={{ margin: '0 0 6px', color: '#fff', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.01em' }}
            >
              {isFirstVisit ? 'Welcome! Location Access Needed' : 'Location Access Required'}
            </h2>
            <p
              style={{ margin: 0, color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', lineHeight: 1.5 }}
            >
              {isFirstVisit
                ? 'Before your first session, please enable location access.'
                : isDenied
                  ? 'Your browser has blocked location access for this site.'
                  : 'We need location permission to record your attendance.'}
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 24px' }} id="lpg-modal-desc">

            {/* Context banner */}
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: isDenied ? '#fef2f2' : '#fff7ed',
                border: `1.5px solid ${isDenied ? '#fecaca' : '#fed7aa'}`,
                marginBottom: 18,
                fontSize: '0.85rem',
                color: isDenied ? '#991b1b' : '#92400e',
                lineHeight: 1.5,
              }}
            >
              {isDenied ? (
                <>
                  <strong>🚫 Access Blocked:</strong> Your browser settings are preventing
                  this site from reading your location. Attendance check-ins will not work
                  until this is resolved.
                </>
              ) : (
                <>
                  <strong>ℹ️ Why we need this:</strong> Your GPS location is used to verify
                  gym attendance check-ins. We only read location at the moment of check-in
                  and never store or share it.
                </>
              )}
            </div>

            {/* Steps to fix — shown when denied */}
            {isDenied && (
              <div style={{ marginBottom: 18 }}>
                <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: '0.85rem', color: '#374151' }}>
                  How to re-enable location:
                </p>
                {[
                  { icon: '🔒', text: 'Click the lock/info icon in your browser\'s address bar.' },
                  { icon: '📍', text: 'Find "Location" or "Site permissions".' },
                  { icon: '✅', text: 'Change the setting to "Always Allow" or "Always On".' },
                  { icon: '🔄', text: 'Refresh this page to apply the change.' },
                ].map((step, i) => (
                  <div key={i} className="lpg-step">
                    <span className="lpg-step-num">{i + 1}</span>
                    <span style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      {step.icon} {step.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Request result feedback */}
            {reqResult && (
              <div
                role="alert"
                id="lpg-req-result"
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  marginBottom: 16,
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  background: reqResult.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  border: `1.5px solid ${reqResult.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                  color: reqResult.type === 'success' ? '#15803d' : '#991b1b',
                  fontWeight: 500,
                }}
              >
                {reqResult.type === 'success' ? '✅ ' : '⚠️ '}
                {reqResult.msg}
              </div>
            )}

            {/* Primary CTA */}
            <button
              id="lpg-enable-location-btn"
              className="lpg-btn-enable"
              onClick={handleEnableLocation}
              disabled={requesting}
              aria-busy={requesting}
            >
              {requesting ? (
                <>
                  <span className="lpg-spinner" aria-hidden="true" />
                  Requesting Access…
                </>
              ) : isDenied ? (
                '⚙️ Open Browser Settings Guide'
              ) : (
                '📍 Enable Location Access'
              )}
            </button>

            {/* Skip / dismiss */}
            <button
              id="lpg-skip-btn"
              className="lpg-btn-skip"
              onClick={handleDismiss}
              style={{ marginTop: 10 }}
            >
              {isDenied ? 'I\'ll do this later' : 'Skip for now'}
            </button>

            <p style={{ margin: '14px 0 0', textAlign: 'center', color: '#9ca3af', fontSize: '0.76rem', lineHeight: 1.5 }}>
              🔐 Location data is only used for in-gym attendance verification.
              It is never stored, shared, or tracked outside of check-in moments.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default LocationPermissionGuard;
