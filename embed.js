import { OpenAI } from "openai";
import fs from "fs";
import "dotenv/config";

const client = new OpenAI();

const chunks = JSON.parse(fs.readFileSync("chunks.json", "utf-8"));

const embedded = [];

for (const chunk of chunks) {
  const res = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: chunk.content
  });

  embedded.push({
    ...chunk,
    embedding: res.data[0].embedding
  });
}

fs.writeFileSync("embeddings.json", JSON.stringify(embedded, null, 2));
console.log("Embeddings stored");
