import { db, blobToVec } from './db.js';
import { client, embed, cosine, CHAT_MODEL } from './openai.js';


// Retrieve the top-K most relevant chunks within a single workspace (isolation).
export async function retrieve(workspaceId, question, k = 6) {
  const [qVec] = await embed([question]);
  const rows = db
    .prepare('SELECT id, content, embedding FROM chunks WHERE workspace_id = ?')
    .all(workspaceId);

  const scored = rows.map((r) => ({
    id: r.id,
    content: r.content,
    score: cosine(qVec, blobToVec(r.embedding)),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

// Lightweight analytics answered straight from SQL (cheaper + exact than RAG).
export function analytics(workspaceId) {
  const total = db
    .prepare('SELECT COUNT(*) AS c FROM messages WHERE workspace_id = ?')
    .get(workspaceId).c;
  const perSender = db
    .prepare(
      `SELECT sender, COUNT(*) AS c FROM messages
       WHERE workspace_id = ? AND sender != 'System'
       GROUP BY sender ORDER BY c DESC LIMIT 10`
    )
    .all(workspaceId);
  const range = db
    .prepare(
      `SELECT MIN(message_date) AS first, MAX(message_date) AS last
       FROM messages WHERE workspace_id = ? AND message_date IS NOT NULL`
    )
    .get(workspaceId);
  return { total, perSender, first: range.first, last: range.last };
}

export async function answer(workspaceId, question) {
  const hits = await retrieve(workspaceId, question);
  const stats = analytics(workspaceId);

  const context = hits.map((h, i) => `--- Excerpt ${i + 1} ---\n${h.content}`).join('\n\n');
  const statsLine =
    `Total messages: ${stats.total}. ` +
    `Date range: ${stats.first || '?'} to ${stats.last || '?'}. ` +
    `Top senders: ${stats.perSender.map((s) => `${s.sender} (${s.c})`).join(', ')}.`;

  const res = await client.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content:
          'You answer questions about a WhatsApp conversation using only the provided excerpts ' +
          'and summary statistics. Quote dates and senders when relevant. If the excerpts do not ' +
          'contain the answer, say so plainly. Be concise.',
      },
      {
        role: 'user',
        content: `Conversation summary stats:\n${statsLine}\n\nRelevant excerpts:\n${context}\n\nQuestion: ${question}`,
      },
    ],
  });

  return {
    answer: res.choices[0].message.content,
    sources: hits.map((h) => ({ id: h.id, score: Number(h.score.toFixed(3)), preview: h.content.slice(0, 160) })),
  };
}

// --- Live WhatsApp helpers (no workspace/RAG needed) ---

export async function suggestWaReply(messages, myName) {
  const convo = messages
    .filter((m) => m.body)
    .map((m) => `${m.fromMe ? myName : m.notifyName || 'Other'}: ${m.body}`)
    .join('\n');

  const res = await client.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.8,
    messages: [
      {
        role: 'system',
        content:
          `You are ${myName} on WhatsApp. Write a natural, concise reply to the last message. ` +
          `Match the conversation language (Hindi/Urdu/English/etc.) and tone exactly. ` +
          `Output ONLY the reply text — no labels, no explanation.`,
      },
      { role: 'user', content: `${convo}\n\n${myName}:` },
    ],
  });
  return res.choices[0].message.content.trim();
}

export async function askAboutWaChat(messages, myName, question) {
  const convo = messages
    .filter((m) => m.body)
    .map((m) => `${m.fromMe ? myName : m.notifyName || 'Other'}: ${m.body}`)
    .join('\n');

  const res = await client.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content: 'Answer questions about this WhatsApp conversation using only the messages provided. Be concise.',
      },
      { role: 'user', content: `Conversation:\n${convo}\n\nQuestion: ${question}` },
    ],
  });
  return res.choices[0].message.content;
}

export async function replyAsUser(workspaceId, incomingMessage, selfSender) {
  const hits = await retrieve(workspaceId, incomingMessage);

  // Real back-and-forth exchanges: when someone said X, selfSender replied Y.
  // This teaches the model HOW they respond in context, not just their tone in isolation.
  const exchanges = db
    .prepare(
      `SELECT m1.message AS incoming, m2.message AS response
       FROM messages m1
       JOIN messages m2 ON m2.id = m1.id + 1 AND m2.document_id = m1.document_id
       WHERE m1.workspace_id = ?
         AND m2.sender = ?
         AND m1.sender != ?
         AND LENGTH(m1.message) > 4
         AND LENGTH(m2.message) > 2
       ORDER BY RANDOM()
       LIMIT 20`
    )
    .all(workspaceId, selfSender, selfSender);

  if (exchanges.length === 0) {
    // Fallback: at least check messages exist
    const count = db.prepare('SELECT COUNT(*) AS c FROM messages WHERE workspace_id = ? AND sender = ?').get(workspaceId, selfSender).c;
    if (count === 0) throw new Error(`No messages found for "${selfSender}" in this workspace.`);
  }

  // Random style samples to capture vocabulary / emoji habits
  const styleSamples = db
    .prepare(
      `SELECT message FROM messages
       WHERE workspace_id = ? AND sender = ? AND LENGTH(message) > 2
       ORDER BY RANDOM() LIMIT 30`
    )
    .all(workspaceId, selfSender)
    .map((r) => r.message)
    .join('\n');

  const exchangeBlock = exchanges
    .map((e) => `Someone said: "${e.incoming}"\n${selfSender} replied: "${e.response}"`)
    .join('\n\n');

  const context = hits.map((h, i) => `--- Excerpt ${i + 1} ---\n${h.content}`).join('\n\n');

  const res = await client.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.75,
    messages: [
      {
        role: 'system',
        content:
          `You are generating a WhatsApp reply as "${selfSender}".\n\n` +
          `## Real reply examples (how ${selfSender} actually responds to messages):\n${exchangeBlock}\n\n` +
          `## ${selfSender}'s writing style (vocabulary, tone, emojis, length):\n${styleSamples}\n\n` +
          `## Rules:\n` +
          `- Write a fresh, contextually appropriate reply to the specific incoming message\n` +
          `- Do NOT copy or repeat responses from the examples above — use them only to learn style\n` +
          `- Match their tone, vocabulary, emoji usage, and typical message length\n` +
          `- If the incoming message is emotional or confrontational, respond as ${selfSender} genuinely would\n` +
          `- Output ONLY the reply message, no labels, no explanation`,
      },
      {
        role: 'user',
        content:
          `Relevant chat history for context:\n${context}\n\n` +
          `Incoming message to reply to: "${incomingMessage}"\n\n` +
          `${selfSender}'s reply:`,
      },
    ],
  });

  return {
    reply: res.choices[0].message.content,
    sources: hits.map((h) => ({ id: h.id, score: Number(h.score.toFixed(3)), preview: h.content.slice(0, 160) })),
  };
}
