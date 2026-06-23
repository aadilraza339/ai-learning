# Ask Your Chats

A working MVP of a multi-workspace WhatsApp chat RAG system. Upload an exported
WhatsApp `.txt`, the app parses → chunks → embeds → stores it, and you can ask
natural-language questions answered with retrieval + an LLM. Each **workspace** is
an isolated context (e.g. "My Ex", "Family Group") with its own messages.

## Stack (intentionally minimal so it runs today)

- **Node + Express** — single service, REST + static UI
- **SQLite** (`better-sqlite3`) — messages, chunks, and embeddings (as BLOBs)
- **OpenAI** — `text-embedding-3-small` for embeddings, `gpt-4o-mini` for answers
- **Vanilla HTML/JS** front end in `public/`

This trades the full spec stack (NestJS / Next.js / Postgres+pgvector / Drizzle)
for something you can run in one command. The architecture maps 1:1, so swapping
SQLite → pgvector or the UI → Next.js later is straightforward.

## Run

```bash
cd ask-your-chats
cp .env.example .env      # then put your OPENAI_API_KEY in .env
npm install
npm start
```

Open http://localhost:3000

1. Create a workspace (e.g. "My Ex").
2. Upload a WhatsApp export `.txt` (try `sample-chat.txt`).
3. Ask: *"When did we first talk?"*, *"How many times did marriage come up?"*,
   *"What were our biggest arguments?"*, *"Summarize our relationship timeline."*

## How it works

```
upload .txt → parseWhatsApp() → store messages
            → chunkMessages() (windows of ~12) → embed() → store vectors
ask → embed(question) → cosine search within workspace → top-K chunks
    → + SQL summary stats → LLM → answer (+ sources)
```

Retrieval is in-memory cosine over the workspace's chunks — fine for MVP volumes.
Exact/analytic questions ("how many messages") are backed by SQL stats passed
alongside the retrieved excerpts.

## Layout

| File | Role |
|------|------|
| `src/parser.js` | WhatsApp format parsing + chunking |
| `src/db.js` | SQLite schema + vector BLOB helpers |
| `src/openai.js` | Embeddings, chat client, cosine |
| `src/rag.js` | Retrieval, analytics, answer composition |
| `src/server.js` | REST endpoints + ingestion pipeline |
| `public/index.html` | Workspace + chat UI |

## Not yet (next phases from the spec)

Auth, multiple conversations per workspace, timeline generation view,
analytics dashboard, multi-document workspaces, media/voice-note indexing.
