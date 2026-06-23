import { EventEmitter } from 'node:events';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const waEvents = new EventEmitter();
waEvents.setMaxListeners(100);

export let waState = { status: 'idle', qr: null, myName: null };
let waClient = null;
let initialized = false;

export async function initWhatsApp() {
  if (initialized) return waState;
  initialized = true;

  waState = { ...waState, status: 'connecting' };
  waEvents.emit('update', { type: 'status', ...waState });

  const pkg = await import('whatsapp-web.js');
  const { Client, LocalAuth } = pkg.default ?? pkg;

  waClient = new Client({
    authStrategy: new LocalAuth({ dataPath: join(__dirname, '..', 'data', 'wa_session') }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    },
  });

  waClient.on('qr', (qr) => {
    waState = { ...waState, status: 'qr', qr };
    waEvents.emit('update', { type: 'status', ...waState });
  });

  waClient.on('authenticated', () => {
    waState = { ...waState, status: 'authenticated', qr: null };
    waEvents.emit('update', { type: 'status', ...waState });
  });

  waClient.on('ready', async () => {
    const { pushname, wid } = waClient.info;
    waState = { status: 'ready', qr: null, myName: pushname || wid.user };
    waEvents.emit('update', { type: 'status', ...waState });
  });

  waClient.on('disconnected', () => {
    waState = { status: 'disconnected', qr: null, myName: null };
    initialized = false;
    waClient = null;
    waEvents.emit('update', { type: 'status', ...waState });
  });

  waClient.on('message', async (msg) => {
    if (msg.fromMe) return;
    try {
      const chat = await msg.getChat();
      waEvents.emit('update', {
        type: 'message',
        chatId: chat.id._serialized,
        chatName: chat.name || chat.id.user,
        message: fmtMsg(msg),
      });
    } catch (_) {}
  });

  waClient.initialize().catch((err) => {
    console.error('WhatsApp init failed:', err.message);
    waState = { status: 'error', qr: null, myName: null, error: err.message };
    initialized = false;
    waClient = null;
    waEvents.emit('update', { type: 'status', ...waState });
  });
  return waState;
}

export function fmtMsg(msg) {
  return {
    id: msg.id._serialized,
    body: msg.body || '',
    fromMe: msg.fromMe,
    timestamp: msg.timestamp,
    notifyName: msg._data?.notifyName || null,
  };
}

export async function getChats() {
  if (!waClient || waState.status !== 'ready') return [];
  const chats = await waClient.getChats();
  return chats.slice(0, 40).map((c) => ({
    id: c.id._serialized,
    name: c.name || c.id.user,
    lastMessage: c.lastMessage?.body?.slice(0, 70) ?? '',
    unreadCount: c.unreadCount ?? 0,
    timestamp: c.timestamp ?? 0,
  }));
}

export async function getChatMessages(chatId, limit = 40) {
  if (!waClient || waState.status !== 'ready') return [];
  const chat = await waClient.getChatById(chatId);
  const msgs = await chat.fetchMessages({ limit });
  return msgs.map(fmtMsg);
}

export async function sendWaMessage(chatId, text) {
  if (!waClient || waState.status !== 'ready') throw new Error('WhatsApp not connected');
  return waClient.sendMessage(chatId, text);
}
