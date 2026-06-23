import 'dotenv/config';
import Groq from 'groq-sdk';
import { HfInference } from '@huggingface/inference';

if (!process.env.GROQ_API_KEY) {
  console.error('Missing GROQ_API_KEY. Get a free key at console.groq.com');
  process.exit(1);
}
if (!process.env.HF_API_KEY) {
  console.error('Missing HF_API_KEY. Get a free key at huggingface.co/settings/tokens');
  process.exit(1);
}

export const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
export const CHAT_MODEL = process.env.CHAT_MODEL || 'llama-3.3-70b-versatile';
export const EMBED_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

const hf = new HfInference(process.env.HF_API_KEY);

export async function embed(texts) {
  const BATCH = 32;
  const out = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const result = await hf.featureExtraction({ model: EMBED_MODEL, inputs: batch });
    // HF returns number[] for single input, number[][] for batch
    if (typeof result[0] === 'number') {
      out.push(Array.from(result));
    } else {
      for (const vec of result) out.push(Array.from(vec));
    }
  }
  return out;
}

export function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}
