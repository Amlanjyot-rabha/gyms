import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';

let client;
let currentStatus = 'disconnected'; // 'disconnected', 'initializing', 'qr_ready', 'connected'
let currentQrCode = null;
let connectedNumber = null;

const initializeClient = () => {
  if (client) {
    return;
  }

  currentStatus = 'initializing';
  currentQrCode = null;

  client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
    puppeteer: {
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-features=MemorySaverMode',
            '--memory-pressure-off'
        ],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });

  client.on('qr', async (qr) => {
    try {
      currentQrCode = await qrcode.toDataURL(qr);
      currentStatus = 'qr_ready';
      console.log('WhatsApp QR Code is ready to scan');
    } catch (err) {
      console.error('Error generating QR code', err);
    }
  });

  client.on('ready', () => {
    currentStatus = 'connected';
    currentQrCode = null;
    connectedNumber = client.info.wid.user;
    console.log(`WhatsApp Client is ready! Connected as ${connectedNumber}`);
  });

  client.on('authenticated', () => {
    console.log('WhatsApp authenticated successfully!');
  });

  client.on('auth_failure', msg => {
    console.error('WhatsApp authentication failure', msg);
    currentStatus = 'disconnected';
    currentQrCode = null;
    client = null;
  });

  client.on('disconnected', (reason) => {
    console.log('WhatsApp client was disconnected', reason);
    currentStatus = 'disconnected';
    currentQrCode = null;
    connectedNumber = null;
    client = null;
  });

  client.initialize().catch(err => {
    console.error('Failed to initialize WhatsApp client', err);
    currentStatus = 'disconnected';
    client = null;
  });
};

export const connectWhatsApp = () => {
  if (currentStatus === 'disconnected') {
    initializeClient();
  }
};

export const getWhatsAppStatus = () => {
  return {
    status: currentStatus,
    qrCode: currentQrCode,
    connectedNumber
  };
};

export const disconnectWhatsApp = async () => {
  if (client) {
    try {
      await client.logout();
    } catch (err) {
      console.error('Error during WhatsApp logout', err);
    } finally {
      currentStatus = 'disconnected';
      currentQrCode = null;
      connectedNumber = null;
      client = null;
    }
  }
};

export const sendWhatsAppMessage = async (phone, message) => {
  // [TRACE] Log input parameters
  console.log(`[TRACE:sendWhatsAppMessage] INPUT - phone: "${phone}", type: ${typeof phone}, message length: ${message.length}`);
  
  if (!client || currentStatus !== 'connected') {
    const errMsg = `WhatsApp client is not connected. Status: ${currentStatus}`;
    console.log(`[TRACE:sendWhatsAppMessage] ERROR - ${errMsg}`);
    throw new Error(errMsg);
  }
  
  // Format phone number to WhatsApp ID
  let formattedPhone = phone.replace(/[^0-9]/g, '');
  
  if (formattedPhone.length === 10) {
    formattedPhone = '91' + formattedPhone;
  }
  
  console.log(`[TRACE:sendWhatsAppMessage] After digit extraction and normalization: "${formattedPhone}"`);
  
  if (!formattedPhone.endsWith('@c.us')) {
    formattedPhone += '@c.us';
  }
  
  console.log(`[TRACE:sendWhatsAppMessage] Final WhatsApp ID: "${formattedPhone}"`);

  try {
    console.log(`[TRACE:sendWhatsAppMessage] Calling client.sendMessage()...`);
    await client.sendMessage(formattedPhone, message);
    console.log(`[TRACE:sendWhatsAppMessage] SUCCESS - Message sent to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error(`[TRACE:sendWhatsAppMessage] ERROR - client.sendMessage() failed for ${formattedPhone}:`, error);
    console.error(`[TRACE:sendWhatsAppMessage] Error message: ${error.message}`);
    console.error(`[TRACE:sendWhatsAppMessage] Error stack: ${error.stack}`);
    throw error;
  }
};

export const sendTestMessage = async (phone) => {
  const message = 'Hello! This is a test message from your Gym Management System WhatsApp integration. If you are seeing this, the integration is successful!';
  return sendWhatsAppMessage(phone, message);
};

// Start client on boot if there is an existing session
initializeClient();
