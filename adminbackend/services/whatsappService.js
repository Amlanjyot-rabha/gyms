import makeWASocket, { useMultiFileAuthState, DisconnectReason, Browsers } from '@whiskeysockets/baileys';
import fs from 'fs';

// ── Global State ──────────────────────────────────────────────────────────────
let client = null;
let currentStatus = 'disconnected';
let currentQrCode = null;
let connectedNumber = null;
let pairingCodeRequested = false;
let targetPhone = null;
let workerRunning = false;
let saveCreds = null; // hoisted so it is callable outside the worker closure

// ── Helpers ───────────────────────────────────────────────────────────────────
const setStatus = (status) => {
  console.log(`[WA] Status: '${currentStatus}' → '${status}'`);
  currentStatus = status;
};

const cleanupClient = async () => {
  if (client) {
    console.log('[WA] Destroying existing socket...');
    try {
      client.ws?.close();
      if (typeof client.end === 'function') client.end(undefined);
    } catch (e) {
      console.error('[WA] Error closing socket:', e.message);
    }
    client = null;
  }
  pairingCodeRequested = false;
};

const clearAuthInfo = () => {
  if (fs.existsSync('./auth_info_baileys')) {
    console.log('[WA] Purging auth_info_baileys...');
    try {
      fs.rmSync('./auth_info_baileys', { recursive: true, force: true });
    } catch (e) {
      console.error('[WA] Failed to purge auth directory:', e.message);
    }
  }
};

// ── Background Worker ─────────────────────────────────────────────────────────
const startWhatsAppWorker = async () => {
  if (workerRunning) {
    console.log('[WA] Worker already running — skipping duplicate start.');
    return;
  }
  workerRunning = true;

  try {
    console.log(`[WA] Worker started. targetPhone=${targetPhone}`);
    setStatus('initializing');
    currentQrCode = null;
    await cleanupClient();

    const authState = await useMultiFileAuthState('./auth_info_baileys');
    const state = authState.state;
    saveCreds = authState.saveCreds;

    const socketFactory = makeWASocket.default ?? makeWASocket;
    client = socketFactory({
      auth: state,
      printQRInTerminal: false,
      browser: Browsers.ubuntu('Chrome'), // validated browser identity required by WhatsApp protocol
    });

    client.ev.on('creds.update', saveCreds);

    // ── Out-of-stream pairing code request ────────────────────────────────
    // Executed immediately after socket instantiation with an 800 ms grace
    // period so the underlying WebSocket handshake can complete before the
    // pairing code RPC is fired. This avoids the race condition inside
    // connection.update where awaiting requestPairingCode blocks the event
    // loop while the socket is still negotiating the initial hello frame.
    if (targetPhone && !state.creds.registered && !pairingCodeRequested) {
      pairingCodeRequested = true;
      setTimeout(async () => {
        if (!client) {
          console.log('[WA] Socket was destroyed before pairing code could be requested.');
          return;
        }
        try {
          const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
          console.log(`[WA] Requesting pairing code for ${cleanPhone}...`);
          const code = await client.requestPairingCode(cleanPhone);
          currentQrCode = code;
          setStatus('qr_ready');
          console.log(`[WA] Pairing code ready: ${code}`);
          if (typeof saveCreds === 'function') await saveCreds();
        } catch (error) {
          console.error('[WA] requestPairingCode failed:', error.message);
          pairingCodeRequested = false;
          await cleanupClient();
          setStatus('disconnected');
          workerRunning = false;
        }
      }, 800);
    }

    // ── Connection Lifecycle Listener ─────────────────────────────────────
    client.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut =
          statusCode === DisconnectReason.loggedOut || statusCode === 401;

        console.log(`[WA] Socket closed. statusCode=${statusCode} loggedOut=${isLoggedOut}`);
        currentQrCode = null;
        await cleanupClient();
        workerRunning = false;

        if (isLoggedOut) {
          console.log('[WA] Session logged out. Clearing credentials.');
          connectedNumber = null;
          clearAuthInfo();
          setStatus('auth_failed');
        } else {
          // Recoverable drop — auto-reconnect in 3 s using stored targetPhone
          console.log('[WA] Recoverable disconnect. Reconnecting in 3s...');
          setStatus('disconnected');
          setTimeout(() => {
            startWhatsAppWorker().catch((e) =>
              console.error('[WA] Auto-reconnect failed:', e.message)
            );
          }, 3000);
        }
      }

      if (connection === 'open') {
        console.log('[WA] Fully authenticated — connection open!');
        currentQrCode = null;
        pairingCodeRequested = false;
        connectedNumber = client.user?.id?.split(':')[0] ?? null;
        console.log(`[WA] Connected as: ${connectedNumber}`);
        setStatus('connected');
        workerRunning = false;
      }
    });

  } catch (err) {
    console.error('[WA] Worker fatal error:', err.message);
    await cleanupClient();
    setStatus('disconnected');
    workerRunning = false;
  }
};

// ── Exported API ──────────────────────────────────────────────────────────────

export const connectWhatsApp = async (phone) => {
  if (currentStatus === 'connected') {
    console.log('[WA] Already connected. Ignoring connect request.');
    return;
  }

  // Clean-start safeguard: destroy any stale socket + purge stale credentials
  let formattedPhone = phone.replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = formattedPhone.substring(1);
  }
  if (formattedPhone.length === 10) {
    formattedPhone = '91' + formattedPhone;
  }
  targetPhone = formattedPhone;
  await cleanupClient();
  clearAuthInfo();

  // Fire worker without awaiting — Express controller returns immediately
  setStatus('initializing');
  startWhatsAppWorker().catch((e) =>
    console.error('[WA] Worker launch error:', e.message)
  );
};

export const getWhatsAppStatus = () => ({
  status: currentStatus,
  qrCode: currentQrCode,
  connectedNumber,
});

export const disconnectWhatsApp = async () => {
  console.log('[WA] Manual disconnect requested.');
  try {
    if (client) await client.logout();
  } catch (err) {
    console.error('[WA] Logout error:', err.message);
  } finally {
    await cleanupClient();
    connectedNumber = null;
    currentQrCode = null;
    clearAuthInfo();
    setStatus('disconnected');
    workerRunning = false;
  }
};

export const sendWhatsAppMessage = async (phone, message) => {
  if (!client || currentStatus !== 'connected') {
    throw new Error(`WhatsApp not connected. Current status: ${currentStatus}`);
  }

  let formatted = phone.replace(/[^0-9]/g, '');
  if (formatted.length === 10) formatted = '91' + formatted;
  if (!formatted.endsWith('@s.whatsapp.net')) formatted += '@s.whatsapp.net';

  try {
    await client.sendMessage(formatted, { text: message });
    return true;
  } catch (err) {
    console.error('[WA] sendMessage error:', err.message);
    throw err;
  }
};

export const sendTestMessage = async (phone) =>
  sendWhatsAppMessage(
    phone,
    'Hello! This is a test message from your Gym Management System (Powered by Baileys).'
  );

// ── Boot: Restore authenticated session if credentials exist ──────────────────
if (fs.existsSync('./auth_info_baileys')) {
  console.log('[WA] Existing session found — attempting boot restore...');
  // targetPhone is null here; if WA requires pairing (unregistered state),
  // the out-of-stream guard skips the pairing block and the socket waits
  // for a manual connectWhatsApp() call.
  startWhatsAppWorker().catch((e) =>
    console.error('[WA] Boot restore failed:', e.message)
  );
}
