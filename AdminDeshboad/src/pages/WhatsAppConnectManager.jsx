import { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import './AdminStyles.css';

/* ─── Constants ─────────────────────────────────────────────── */
const POLL_INTERVAL_MS = 2000;
const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;

/* ─── Sub-components ─────────────────────────────────────────── */

/** Animated pulsing dot used in status badges */
function PulseDot({ color }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 0 0 ${color}`,
        animation: 'wacm-pulse 1.6s ease-out infinite',
        flexShrink: 0,
      }}
    />
  );
}

/** State: system is warming up */
function InitializingBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      id="wacm-initializing-banner"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        padding: '16px 20px',
        borderRadius: 12,
        border: '1.5px solid #f59e0b',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        boxShadow: '0 2px 12px rgba(245,158,11,0.12)',
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1, marginTop: 2 }}>⚡</span>
      <div>
        <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#92400e', fontSize: '0.95rem' }}>
          Handshake in Progress
        </p>
        <p style={{ margin: 0, color: '#b45309', fontSize: '0.875rem', lineHeight: 1.5 }}>
          The WhatsApp connection worker is warming up. This typically takes 5–15 seconds.
          The pairing code will appear automatically once ready — please wait.
        </p>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <PulseDot color="#f59e0b" />
          <span style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600 }}>
            Establishing secure socket…
          </span>
        </div>
      </div>
    </div>
  );
}

/** State: pairing code ready — display it prominently */
function PairingCodeOverlay({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available — silent */
    }
  };

  /* Format code as XXXX-XXXX for readability */
  const formatted =
    code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;

  return (
    <div
      id="wacm-pairing-overlay"
      style={{
        borderRadius: 14,
        border: '1.5px solid #3b82f6',
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        boxShadow: '0 4px 24px rgba(59,130,246,0.14)',
        overflow: 'hidden',
      }}
    >
      {/* Header strip */}
      <div
        style={{
          background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 20 }}>📱</span>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
          WhatsApp Pairing Code
        </span>
        <span
          style={{
            marginLeft: 'auto',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 20,
            padding: '2px 10px',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          SCAN REQUIRED
        </span>
      </div>

      <div style={{ padding: '24px 20px' }}>
        <p style={{ margin: '0 0 6px', color: '#1e40af', fontWeight: 600, fontSize: '0.875rem' }}>
          Enter this code in WhatsApp → Linked Devices → Link with phone number:
        </p>

        {/* High-contrast monospace code display */}
        <div
          aria-label={`Pairing code: ${formatted}`}
          style={{
            margin: '16px 0',
            padding: '20px',
            borderRadius: 10,
            background: '#1e3a8a',
            textAlign: 'center',
            letterSpacing: '0.3em',
            fontFamily: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            fontWeight: 800,
            color: '#93c5fd',
            userSelect: 'all',
            border: '1px solid #3b82f6',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          {formatted}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <PulseDot color="#3b82f6" />
          <span style={{ color: '#1d4ed8', fontSize: '0.85rem', fontWeight: 600 }}>
            Awaiting phone confirmation…
          </span>
          <button
            id="wacm-copy-code-btn"
            onClick={handleCopy}
            style={{
              marginLeft: 'auto',
              padding: '6px 14px',
              borderRadius: 8,
              border: '1.5px solid #3b82f6',
              background: copied ? '#dbeafe' : '#fff',
              color: '#2563eb',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            {copied ? '✓ Copied!' : '⎘ Copy Code'}
          </button>
        </div>

        <p style={{ margin: '12px 0 0', color: '#64748b', fontSize: '0.8rem' }}>
          ⚠️ This code is valid for approximately 60 seconds. If it expires, click{' '}
          <strong>Reconnect</strong> below to generate a new one.
        </p>
      </div>
    </div>
  );
}

/** State: session is live and active */
function ConnectedBadge({ connectedNumber }) {
  return (
    <div
      role="status"
      id="wacm-connected-badge"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 20px',
        borderRadius: 12,
        border: '1.5px solid #16a34a',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        boxShadow: '0 2px 12px rgba(22,163,74,0.12)',
      }}
    >
      <span style={{ fontSize: 28, lineHeight: 1 }}>✅</span>
      <div>
        <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#15803d', fontSize: '0.95rem' }}>
          Active Linking Pipeline — Live
        </p>
        <p style={{ margin: 0, color: '#166534', fontSize: '0.875rem' }}>
          WhatsApp integration is fully connected and operational.
          {connectedNumber && (
            <span style={{ fontWeight: 600 }}> Linked as: +{connectedNumber}</span>
          )}
        </p>
      </div>
      <PulseDot color="#16a34a" />
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */

/**
 * WhatsAppConnectManager
 *
 * Admin panel UI for setting up the WhatsApp communication layer.
 * Long-polls /api/whatsapp/status every 2000ms and renders state-aware
 * UI for: initializing -> qr_ready -> connected lifecycle.
 *
 * Placed at: AdminDashboard/src/pages/WhatsAppConnectManager.jsx
 * Route suggestion: /whatsapp-setup (add to App.jsx under SidebarLayout)
 */
export function WhatsAppConnectManager() {
  /* -- State ─────────────────────────────────────────────────── */
  const [waStatus, setWaStatus]               = useState('disconnected');
  const [qrCode, setQrCode]                   = useState(null);
  const [connectedNumber, setConnectedNumber] = useState(null);
  const [phone, setPhone]                     = useState('');
  const [phoneError, setPhoneError]           = useState('');
  const [connecting, setConnecting]           = useState(false);
  const [disconnecting, setDisconnecting]     = useState(false);
  const [apiError, setApiError]               = useState('');
  const [successMsg, setSuccessMsg]           = useState('');

  /* -- Refs ──────────────────────────────────────────────────── */
  const pollRef    = useRef(null);
  const mountedRef = useRef(true);

  /* -- Helpers ───────────────────────────────────────────────── */
  const safeSet = (setter) => (val) => {
    if (mountedRef.current) setter(val);
  };

  const clearMessages = () => {
    setApiError('');
    setSuccessMsg('');
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  /* -- Polling Logic ─────────────────────────────────────────── */
  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get('/whatsapp/status');
      if (!mountedRef.current) return;
      
      const newStatus = data.status ?? 'disconnected';
      
      if (newStatus === 'auth_failed') {
        window.alert('Connection Denied: WhatsApp rejected the login attempt or the number is invalid. Please verify and try again.');
        safeSet(setWaStatus)('disconnected');
        safeSet(setQrCode)(null);
        safeSet(setConnectedNumber)(null);
        stopPolling();
        return;
      }
      
      safeSet(setWaStatus)(newStatus);
      safeSet(setQrCode)(data.qrCode ?? null);
      safeSet(setConnectedNumber)(data.connectedNumber ?? null);
    } catch {
      /* Silently ignore poll errors — server may be briefly restarting */
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startPolling = useCallback(() => {
    stopPolling();
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);
  }, [fetchStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  /* -- Effects ───────────────────────────────────────────────── */
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const isTransient = waStatus === 'initializing' || waStatus === 'qr_ready';
    const isConnected = waStatus === 'connected';

    if (isTransient) {
      startPolling();
    } else if (isConnected) {
      stopPolling();
      pollRef.current = setInterval(fetchStatus, 5000);
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [waStatus, startPolling, fetchStatus]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  /* -- Handlers ──────────────────────────────────────────────── */
  const validatePhone = (value) => {
    if (!value.trim()) return 'Phone number is required.';
    if (!PHONE_REGEX.test(value.trim()))
      return 'Enter a valid international phone number (e.g. +919876543210).';
    return '';
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    clearMessages();

    const validationError = validatePhone(phone);
    if (validationError) {
      setPhoneError(validationError);
      return;
    }
    setPhoneError('');
    setConnecting(true);
    safeSet(setWaStatus)('initializing');
    startPolling();

    try {
      await axiosInstance.post('/whatsapp/connect', { phone: phone.trim() });
      safeSet(setSuccessMsg)('Connection request sent. Waiting for pairing code…');
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to initiate WhatsApp connection.';
      safeSet(setApiError)(msg);
      safeSet(setWaStatus)('disconnected');
      stopPolling();
    } finally {
      safeSet(setConnecting)(false);
    }
  };

  const handleDisconnect = async () => {
    clearMessages();
    setDisconnecting(true);
    try {
      await axiosInstance.post('/whatsapp/disconnect');
      safeSet(setWaStatus)('disconnected');
      safeSet(setQrCode)(null);
      safeSet(setConnectedNumber)(null);
      safeSet(setSuccessMsg)('WhatsApp session disconnected successfully.');
      stopPolling();
    } catch (err) {
      safeSet(setApiError)(err.response?.data?.message || 'Failed to disconnect.');
    } finally {
      safeSet(setDisconnecting)(false);
    }
  };

  /* -- Derived UI State ──────────────────────────────────────── */
  const isConnected    = waStatus === 'connected';
  const isInitializing = waStatus === 'initializing';
  const isQrReady      = waStatus === 'qr_ready';

  const statusLabel = {
    disconnected: { text: 'Disconnected',   color: '#6b7280', bg: '#f3f4f6' },
    initializing:  { text: 'Initializing…',  color: '#d97706', bg: '#fef3c7' },
    qr_ready:      { text: 'Code Ready',     color: '#2563eb', bg: '#dbeafe' },
    connected:     { text: 'Connected',      color: '#16a34a', bg: '#dcfce7' },
  }[waStatus] ?? { text: waStatus, color: '#6b7280', bg: '#f3f4f6' };

  /* -- Render ────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @keyframes wacm-pulse {
          0%   { box-shadow: 0 0 0 0 currentColor; opacity: 1; }
          70%  { box-shadow: 0 0 0 8px transparent; opacity: 0.8; }
          100% { box-shadow: 0 0 0 0 transparent; opacity: 1; }
        }
        .wacm-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          box-shadow: 0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04);
        }
        .wacm-phone-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1.5px solid #d1d5db;
          font-size: 0.95rem;
          color: #111827;
          background: #fff;
          transition: border-color 150ms ease, box-shadow 150ms ease;
          box-sizing: border-box;
        }
        .wacm-phone-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
        }
        .wacm-phone-input::placeholder { color: #9ca3af; }
        .wacm-phone-input.error { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.08); }
        .wacm-btn-primary {
          padding: 11px 22px;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          color: #fff;
          box-shadow: 0 2px 8px rgba(37,99,235,0.25);
          transition: all 150ms ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }
        .wacm-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(37,99,235,0.3);
        }
        .wacm-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        .wacm-btn-danger {
          padding: 11px 22px;
          border-radius: 10px;
          border: 1.5px solid #dc2626;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          background: #fff;
          color: #dc2626;
          transition: all 150ms ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .wacm-btn-danger:hover:not(:disabled) { background: #fef2f2; transform: translateY(-1px); }
        .wacm-btn-danger:disabled { opacity: 0.55; cursor: not-allowed; }
        .wacm-mini-spinner {
          width: 14px; height: 14px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          animation: wacm-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        .wacm-mini-spinner.dark {
          border-color: rgba(220,38,38,0.25);
          border-top-color: #dc2626;
        }
        @keyframes wacm-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">WhatsApp Setup</h1>
            <p className="dashboard-subtitle">
              Configure the WhatsApp messaging channel for automated member notifications.
            </p>
          </div>
          <div className="header-decoration">
            <div className="decoration-circle" />
          </div>
        </header>

        <div style={{ maxWidth: 680, margin: '0 auto', display: 'grid', gap: 20 }}>

          {/* Status Overview */}
          <div className="wacm-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
                  Connection Status
                </h2>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>
                  Real-time poll every {POLL_INTERVAL_MS / 1000}s
                </p>
              </div>
              <span
                id="wacm-status-badge"
                style={{
                  padding: '5px 14px',
                  borderRadius: 20,
                  background: statusLabel.bg,
                  color: statusLabel.color,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: `1.5px solid ${statusLabel.color}44`,
                }}
              >
                {statusLabel.text}
              </span>
            </div>
          </div>

          {/* Global API Error */}
          {apiError && (
            <div
              role="alert"
              id="wacm-api-error"
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: '#fef2f2',
                border: '1.5px solid #fecaca',
                color: '#991b1b',
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
              }}
            >
              <span aria-hidden="true">⚠️</span>
              <span>{apiError}</span>
            </div>
          )}

          {/* Global Success Message */}
          {successMsg && (
            <div
              role="status"
              id="wacm-success-msg"
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                color: '#15803d',
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
              }}
            >
              <span aria-hidden="true">✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Dynamic State Panels */}
          {isInitializing && <InitializingBanner />}
          {isQrReady && qrCode && <PairingCodeOverlay code={qrCode} />}
          {isConnected && <ConnectedBadge connectedNumber={connectedNumber} />}

          {/* Setup Form */}
          <div className="wacm-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
                {isConnected ? '🔗 Active Session' : '📲 Link WhatsApp Account'}
              </h2>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {isConnected ? (
                <div>
                  <p style={{ margin: '0 0 16px', color: '#374151', fontSize: '0.9rem' }}>
                    Your WhatsApp number <strong>+{connectedNumber ?? '—'}</strong> is actively
                    linked. All automated member notifications will be dispatched through this session.
                  </p>
                  <button
                    id="wacm-disconnect-btn"
                    className="wacm-btn-danger"
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    aria-busy={disconnecting}
                  >
                    {disconnecting ? (
                      <>
                        <span className="wacm-mini-spinner dark" aria-hidden="true" />
                        Disconnecting…
                      </>
                    ) : (
                      '⏏ Disconnect Session'
                    )}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleConnect} noValidate>
                  <p style={{ margin: '0 0 16px', color: '#374151', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Enter the WhatsApp phone number you want to link. A one-time pairing code
                    will be sent and displayed here.
                  </p>

                  <div style={{ marginBottom: 16 }}>
                    <label
                      htmlFor="wacm-phone-input"
                      style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.875rem', color: '#374151' }}
                    >
                      Phone Number <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      id="wacm-phone-input"
                      type="tel"
                      className={`wacm-phone-input${phoneError ? ' error' : ''}`}
                      placeholder="+919876543210"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (phoneError) setPhoneError(validatePhone(e.target.value));
                      }}
                      aria-describedby={phoneError ? 'wacm-phone-error' : undefined}
                      aria-invalid={!!phoneError}
                      disabled={isInitializing || isQrReady}
                      autoComplete="tel"
                    />
                    {phoneError && (
                      <p
                        id="wacm-phone-error"
                        role="alert"
                        style={{ margin: '6px 0 0', color: '#dc2626', fontSize: '0.8rem', fontWeight: 500 }}
                      >
                        {phoneError}
                      </p>
                    )}
                    <p style={{ margin: '6px 0 0', color: '#9ca3af', fontSize: '0.78rem' }}>
                      Include country code (e.g. +91 for India). Spaces and hyphens are allowed.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button
                      id="wacm-connect-btn"
                      type="submit"
                      className="wacm-btn-primary"
                      disabled={connecting || isInitializing || isQrReady}
                      aria-busy={connecting}
                    >
                      {connecting || isInitializing ? (
                        <>
                          <span className="wacm-mini-spinner" aria-hidden="true" />
                          Connecting…
                        </>
                      ) : isQrReady ? (
                        '⏳ Awaiting Confirmation'
                      ) : (
                        '⚡ Connect WhatsApp'
                      )}
                    </button>

                    {isQrReady && (
                      <button
                        id="wacm-reconnect-btn"
                        type="button"
                        className="wacm-btn-danger"
                        onClick={() => {
                          clearMessages();
                          safeSet(setWaStatus)('disconnected');
                          safeSet(setQrCode)(null);
                          stopPolling();
                        }}
                        style={{ borderColor: '#f59e0b', color: '#b45309' }}
                      >
                        ↺ Reset &amp; Try Again
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Instructions Card */}
          <div
            className="wacm-card"
            style={{ padding: '16px 24px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
          >
            <h3 style={{ margin: '0 0 10px', fontSize: '0.875rem', fontWeight: 700, color: '#475569' }}>
              📋 How to Link Your Number
            </h3>
            <ol style={{ margin: 0, paddingLeft: 18, color: '#64748b', fontSize: '0.85rem', lineHeight: 1.8 }}>
              <li>Enter your WhatsApp number above and click <strong>Connect WhatsApp</strong>.</li>
              <li>Wait for the 8-digit pairing code to appear (usually 5–15 seconds).</li>
              <li>Open WhatsApp on your phone → <strong>Settings → Linked Devices → Link a Device</strong>.</li>
              <li>Choose <strong>Link with phone number</strong> and enter the displayed code.</li>
              <li>The status will switch to <strong>Connected</strong> once verified.</li>
            </ol>
          </div>

        </div>
      </div>
    </>
  );
}

export default WhatsAppConnectManager;
