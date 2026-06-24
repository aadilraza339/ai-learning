import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
mkdirSync(dataDir, { recursive: true });

export const db = new Database(join(dataDir, 'app.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

try { db.exec(`ALTER TABLE workspaces ADD COLUMN self_sender TEXT`); } catch (_) {}

db.exec(`
  CREATE TABLE IF NOT EXISTS workspaces (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    self_sender TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS documents (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    file_name    TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'pending',
    uploaded_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    document_id  INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    sender       TEXT NOT NULL,
    message      TEXT NOT NULL,
    message_date TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_messages_ws ON messages(workspace_id);

  CREATE TABLE IF NOT EXISTS chunks (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    document_id  INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    content      TEXT NOT NULL,
    start_date   TEXT,
    end_date     TEXT,
    msg_count    INTEGER,
    embedding    BLOB
  );
  CREATE INDEX IF NOT EXISTS idx_chunks_ws ON chunks(workspace_id);

  CREATE TABLE IF NOT EXISTS conversations (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    role         TEXT NOT NULL,
    content      TEXT NOT NULL,
    mode         TEXT NOT NULL DEFAULT 'ask',
    sources      TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_conv_ws ON conversations(workspace_id);
`);

// --- Vector helpers: store Float32Array as a BLOB ---
export function vecToBlob(arr) {
  return Buffer.from(new Float32Array(arr).buffer);
}

export function blobToVec(blob) {
  return new Float32Array(blob.buffer, blob.byteOffset, blob.byteLength / 4);
}
