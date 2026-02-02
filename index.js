import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 3000;
const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY belum diisi. Buat file .env lalu isi GEMINI_API_KEY=...');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

// Resolve folder path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const starterDir = path.join(__dirname, 'starter');

// Serve the vanilla JS starter files
app.use(express.static(starterDir));

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Chat endpoint (front-end will call this)
app.post('/chat', async (req, res) => {
  try {
    const message = (req.body?.message ?? '').toString().trim();
    if (!message) return res.status(400).json({ error: 'message wajib diisi' });

    const response = await ai.models.generateContent({
      model,
      contents: message,
    });

    return res.json({ output: response.text });
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Gemini AI Chatbot running at http://localhost:${PORT}`);
});
