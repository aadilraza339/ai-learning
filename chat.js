import "dotenv/config";
import express from "express";
import cors from "cors";

import { OpenAI } from "openai";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let embeddings = [];
try {
  if (fs.existsSync("embeddings.json")) {
    embeddings = JSON.parse(fs.readFileSync("embeddings.json", "utf-8"));
  }
} catch (error) {
  console.error("Failed to load embeddings:", error);
}

const cosineSimilarity = (a, b) => {
  return a.reduce((sum, v, i) => sum + v * b[i], 0);
};

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Required headers for streaming
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.flushHeaders(); // Important for streaming to start immediately

    // Start LLM stream
    // 1. Embed the query
    // const embeddingResponse = await client.embeddings.create({
    //   model: "text-embedding-3-small",
    //   input: message,
    // });
    // const queryEmbedding = embeddingResponse.data[0].embedding;

    // // 2. Retrieve relevant chunks
    // const scored = embeddings.map((chunk) => ({
    //   ...chunk,
    //   score: cosineSimilarity(chunk.embedding, queryEmbedding),
    // }));
    // scored.sort((a, b) => b.score - a.score);
    // const context = scored.slice(0, 3).map((c) => c.content).join("\n\n");

    // // 3. Augment the prompt
    // const enhancedMessage = `Use the following context to answer the question:\n\n${context}\n\nQuestion: ${message}`;

    const stream = await client.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [{ role: "user", content: message }],
    });

    // Stream chunks
    for await (const chunk of stream) {
      const text = chunk.choices?.[0]?.delta?.content || "";
      res.write(text);
    }

    res.end(); // end stream properly
  } catch (error) {
    console.error(error);

    // If streaming already started, cannot send JSON response
    try {
      res.write("\n[stream-error]");
      res.end();
    } catch (e) {
      console.error("Stream already closed");
    }
  }
});

// Optional: handle client disconnect
app.use((req, res, next) => {
  req.on("close", () => {
    console.log("Client disconnected");
  });
  next();
});

app.listen(4000, () => console.log("Server running at http://localhost:4000"));
