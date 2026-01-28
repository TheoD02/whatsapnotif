import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import express from 'express';
import cors from 'cors';
import QRCode from 'qrcode';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const AUTH_DIR = path.join(__dirname, 'auth_info');

// State
let sock = null;
let qrCode = null;
let connectionStatus = 'disconnected'; // disconnected, connecting, qr_ready, connected
let lastError = null;

const logger = pino({ level: 'warn' });

async function connectToWhatsApp() {
    connectionStatus = 'connecting';
    qrCode = null;
    lastError = null;

    try {
        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
        const { version } = await fetchLatestBaileysVersion();

        sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: true,
            logger,
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                qrCode = await QRCode.toDataURL(qr);
                connectionStatus = 'qr_ready';
                console.log('QR Code generated - scan it from the admin panel');
            }

            if (connection === 'close') {
                const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

                if (reason === DisconnectReason.loggedOut) {
                    console.log('Logged out - clearing auth and reconnecting...');
                    connectionStatus = 'disconnected';
                    qrCode = null;
                    // Clear auth folder
                    if (fs.existsSync(AUTH_DIR)) {
                        fs.rmSync(AUTH_DIR, { recursive: true });
                    }
                    // Reconnect after a delay
                    setTimeout(connectToWhatsApp, 3000);
                } else if (reason !== DisconnectReason.connectionClosed) {
                    console.log(`Connection closed. Reason: ${reason}. Reconnecting...`);
                    connectionStatus = 'disconnected';
                    setTimeout(connectToWhatsApp, 3000);
                }
            }

            if (connection === 'open') {
                connectionStatus = 'connected';
                qrCode = null;
                console.log('Connected to WhatsApp!');
            }
        });

        sock.ev.on('creds.update', saveCreds);

    } catch (error) {
        console.error('Error connecting to WhatsApp:', error);
        lastError = error.message;
        connectionStatus = 'disconnected';
    }
}

// API Routes

// Get connection status
app.get('/status', (req, res) => {
    res.json({
        status: connectionStatus,
        hasQR: !!qrCode,
        error: lastError,
    });
});

// Get QR code
app.get('/qr', (req, res) => {
    if (!qrCode) {
        return res.status(404).json({ error: 'No QR code available' });
    }
    res.json({ qr: qrCode });
});

// Send message
app.post('/send', async (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({
            success: false,
            error: 'Phone and message are required'
        });
    }

    if (connectionStatus !== 'connected') {
        return res.status(503).json({
            success: false,
            error: 'WhatsApp not connected'
        });
    }

    try {
        // Format phone number (remove + and add @s.whatsapp.net)
        const formattedPhone = phone.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

        const result = await sock.sendMessage(formattedPhone, { text: message });

        res.json({
            success: true,
            messageId: result.key.id,
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.json({
            success: false,
            error: error.message,
        });
    }
});

// Logout / disconnect
app.post('/logout', async (req, res) => {
    try {
        if (sock) {
            await sock.logout();
        }
        connectionStatus = 'disconnected';
        qrCode = null;

        // Clear auth folder
        if (fs.existsSync(AUTH_DIR)) {
            fs.rmSync(AUTH_DIR, { recursive: true });
        }

        res.json({ success: true });

        // Reconnect to get new QR
        setTimeout(connectToWhatsApp, 2000);
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Reconnect
app.post('/reconnect', async (req, res) => {
    try {
        if (sock) {
            sock.end();
        }
        await connectToWhatsApp();
        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`WhatsApp service running on port ${PORT}`);
    connectToWhatsApp();
});
