import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { db, vecToBlob } from './db.js';
import { parseWhatsApp, chunkMessages } from './parser.js';
import { embed } from './openai.js';
import { answer, analytics, replyAsUser, suggestWaReply, askAboutWaChat } from './rag.js';
import { initWhatsApp, waEvents, waState, getChats, getChatMessages, sendWaMessage } from './whatsapp.js';
import QRCode from 'qrcode';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.static(join(__dirname, '..', 'public')));

// --- Workspaces (isolated chat contexts) ---
app.get('/api/workspaces', (req, res) => {
  const rows = db
    .prepare(
      `SELECT w.id, w.name, w.created_at, w.self_sender,
              (SELECT COUNT(*) FROM messages m WHERE m.workspace_id = w.id) AS message_count
       FROM workspaces w ORDER BY w.created_at DESC`
    )
    .all();
  res.json(rows);
});

app.patch('/api/workspaces/:id', (req, res) => {
  const { selfSender, name } = req.body;
  if (name !== undefined) {
    const trimmed = (name || '').trim();
    if (!trimmed) return res.status(400).json({ error: 'name required' });
    db.prepare('UPDATE workspaces SET name = ? WHERE id = ?').run(trimmed, Number(req.params.id));
  }
  if (selfSender !== undefined) {
    db.prepare('UPDATE workspaces SET self_sender = ? WHERE id = ?').run(selfSender || null, Number(req.params.id));
  }
  res.json({ ok: true });
});

app.delete('/api/workspaces/:id', (req, res) => {
  db.prepare('DELETE FROM workspaces WHERE id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

app.delete('/api/workspaces/:id/conversations', (req, res) => {
  db.prepare('DELETE FROM conversations WHERE workspace_id = ?').run(Number(req.params.id));
  res.json({ ok: true });
});

app.get('/api/workspaces/:id/senders', (req, res) => {
  const rows = db
    .prepare(
      `SELECT DISTINCT sender FROM messages
       WHERE workspace_id = ? AND sender != 'System'
       ORDER BY sender`
    )
    .all(Number(req.params.id));
  res.json(rows.map((r) => r.sender));
});

app.post('/api/workspaces', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'name required' });
  const info = db.prepare('INSERT INTO workspaces (name) VALUES (?)').run(name);
  res.json({ id: info.lastInsertRowid, name });
});

// --- Upload + ingest a WhatsApp .txt (sent as JSON: { fileName, content }) ---
app.post('/api/workspaces/:id/upload', async (req, res) => {
  const workspaceId = Number(req.params.id);
  const { fileName, content } = req.body;
  const ws = db.prepare('SELECT id FROM workspaces WHERE id = ?').get(workspaceId);
  if (!ws) return res.status(404).json({ error: 'workspace not found' });
  if (!content) return res.status(400).json({ error: 'content required' });

  const docInfo = db
    .prepare("INSERT INTO documents (workspace_id, file_name, status) VALUES (?, ?, 'processing')")
    .run(workspaceId, fileName || 'chat.txt');
  const documentId = docInfo.lastInsertRowid;

  try {
    const messages = parseWhatsApp(content);
    if (messages.length === 0) {
      db.prepare("UPDATE documents SET status = 'failed' WHERE id = ?").run(documentId);
      return res.status(422).json({ error: 'No WhatsApp messages found. Is this an export .txt?' });
    }

    const insertMsg = db.prepare(
      'INSERT INTO messages (workspace_id, document_id, sender, message, message_date) VALUES (?, ?, ?, ?, ?)'
    );
    const insertMany = db.transaction((msgs) => {
      for (const m of msgs) {
        insertMsg.run(workspaceId, documentId, m.sender, m.message, m.date ? m.date.toISOString() : null);
      }
    });
    insertMany(messages);

    const chunks = chunkMessages(messages);
    const vectors = await embed(chunks.map((c) => c.content));
    const insertChunk = db.prepare(
      'INSERT INTO chunks (workspace_id, document_id, content, start_date, end_date, msg_count, embedding) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const insertChunks = db.transaction((cs) => {
      cs.forEach((c, i) => {
        insertChunk.run(
          workspaceId,
          documentId,
          c.content,
          c.startDate ? c.startDate.toISOString() : null,
          c.endDate ? c.endDate.toISOString() : null,
          c.msgCount,
          vecToBlob(vectors[i])
        );
      });
    });
    insertChunks(chunks);

    db.prepare("UPDATE documents SET status = 'ready' WHERE id = ?").run(documentId);
    res.json({ documentId, messages: messages.length, chunks: chunks.length });
  } catch (err) {
    db.prepare("UPDATE documents SET status = 'failed' WHERE id = ?").run(documentId);
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Ask a question (RAG, scoped to the workspace) ---
app.post('/api/workspaces/:id/ask', async (req, res) => {
  const workspaceId = Number(req.params.id);
  const question = (req.body.question || '').trim();
  if (!question) return res.status(400).json({ error: 'question required' });
  const hasChunks = db.prepare('SELECT COUNT(*) AS c FROM chunks WHERE workspace_id = ?').get(workspaceId).c;
  if (!hasChunks) return res.status(400).json({ error: 'Upload a chat to this workspace first.' });
  try {
    const result = await answer(workspaceId, question);
    const saveMsg = db.prepare('INSERT INTO conversations (workspace_id, role, content, mode, sources) VALUES (?, ?, ?, ?, ?)');
    let userConvId, botConvId;
    db.transaction(() => {
      userConvId = saveMsg.run(workspaceId, 'user', question, 'ask', null).lastInsertRowid;
      botConvId = saveMsg.run(workspaceId, 'bot', result.answer, 'ask', JSON.stringify(result.sources)).lastInsertRowid;
    })();
    res.json({ ...result, convIds: { user: userConvId, bot: botConvId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/workspaces/:id/stats', (req, res) => {
  res.json(analytics(Number(req.params.id)));
});

app.get('/api/workspaces/:id/conversations', (req, res) => {
  const rows = db
    .prepare('SELECT id, role, content, mode, sources FROM conversations WHERE workspace_id = ? ORDER BY id ASC')
    .all(Number(req.params.id));
  res.json(rows.map((r) => ({ ...r, sources: r.sources ? JSON.parse(r.sources) : null })));
});

app.delete('/api/workspaces/:id/conversations/:fromId', (req, res) => {
  db.prepare('DELETE FROM conversations WHERE workspace_id = ? AND id >= ?')
    .run(Number(req.params.id), Number(req.params.fromId));
  res.json({ ok: true });
});

app.post('/api/workspaces/:id/reply', async (req, res) => {
  const workspaceId = Number(req.params.id);
  const { message, selfSender } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });
  if (!selfSender) return res.status(400).json({ error: 'selfSender required' });
  try {
    const result = await replyAsUser(workspaceId, message, selfSender);
    const saveMsg = db.prepare('INSERT INTO conversations (workspace_id, role, content, mode, sources) VALUES (?, ?, ?, ?, ?)');
    let userConvId, botConvId;
    db.transaction(() => {
      userConvId = saveMsg.run(workspaceId, 'user', '↩ Reply to: ' + message, 'reply', null).lastInsertRowid;
      botConvId = saveMsg.run(workspaceId, 'bot', result.reply, 'reply', JSON.stringify(result.sources)).lastInsertRowid;
    })();
    res.json({ ...result, convIds: { user: userConvId, bot: botConvId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- WhatsApp Live routes ---

app.post('/api/wa/connect', async (req, res) => {
  try {
    await initWhatsApp();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SSE stream: pushes status changes and incoming messages to the browser
app.get('/api/wa/events', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = async (data) => {
    let payload = { ...data };
    if (data.type === 'status' && data.qr) {
      payload.qrDataUrl = await QRCode.toDataURL(data.qr).catch(() => null);
      delete payload.qr;
    }
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  waEvents.on('update', send);
  await send({ type: 'status', ...waState }); // send current state on connect

  req.on('close', () => waEvents.off('update', send));
});

app.get('/api/wa/chats', async (req, res) => {
  try {
    res.json(await getChats());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// chatId contains '@' so pass it as a query param to avoid URL routing issues
app.get('/api/wa/messages', async (req, res) => {
  const { chatId, limit } = req.query;
  if (!chatId) return res.status(400).json({ error: 'chatId required' });
  try {
    res.json(await getChatMessages(chatId, Number(limit) || 40));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wa/suggest', async (req, res) => {
  const { chatId, myName } = req.body;
  if (!chatId) return res.status(400).json({ error: 'chatId required' });
  try {
    const msgs = await getChatMessages(chatId, 30);
    const suggestion = await suggestWaReply(msgs, myName || 'me');
    res.json({ suggestion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wa/ask', async (req, res) => {
  const { chatId, myName, question } = req.body;
  if (!chatId || !question) return res.status(400).json({ error: 'chatId and question required' });
  try {
    const msgs = await getChatMessages(chatId, 60);
    const ans = await askAboutWaChat(msgs, myName || 'me', question);
    res.json({ answer: ans });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wa/send', async (req, res) => {
  const { chatId, text } = req.body;
  if (!chatId || !text) return res.status(400).json({ error: 'chatId and text required' });
  try {
    await sendWaMessage(chatId, text);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ask-your-chats running at http://localhost:${PORT}`));
