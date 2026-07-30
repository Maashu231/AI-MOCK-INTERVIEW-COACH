const Groq = require('groq-sdk');
const { generateQuestionsPrompt } = require('../backend/prompts/systemPrompt');

// ── Setup Groq clients from env ──
const apiKeys = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '')
  .split(',')
  .map(k => k.trim())
  .filter(k => k.length > 0);

const clients = apiKeys.map(key => new Groq({ apiKey: key, maxRetries: 0 }));
let currentKeyIndex = 0;

function getNextClient() {
  if (clients.length === 0) throw new Error('No Groq API keys configured.');
  const client = clients[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % clients.length;
  return client;
}

// ── Robust JSON extraction ──
function extractJSON(text) {
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  try { return JSON.parse(cleaned); } catch (_) {}

  const arrayStart = cleaned.indexOf('[');
  const objectStart = cleaned.indexOf('{');
  let start = -1, endChar = '';

  if (arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart)) {
    start = arrayStart; endChar = ']';
  } else if (objectStart !== -1) {
    start = objectStart; endChar = '}';
  }

  if (start === -1) throw new Error('No JSON found in AI response');
  const end = cleaned.lastIndexOf(endChar);
  if (end <= start) throw new Error('Malformed JSON in AI response');
  return JSON.parse(cleaned.substring(start, end + 1));
}

// ── Retry helper ──
async function callWithRetry(prompt) {
  let lastError = null;
  for (let attempt = 0; attempt < clients.length; attempt++) {
    const client = getNextClient();
    try {
      const completion = await client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
      });
      return extractJSON(completion.choices[0].message.content);
    } catch (error) {
      lastError = error;
      console.warn(`API key #${currentKeyIndex} failed (${error.message}), trying next...`);
    }
  }
  throw lastError;
}

// ── Vercel Serverless Handler ──
module.exports = async (req, res) => {
  // Set JSON content type header
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { role, difficulty, round, level, resumeText } = req.body;

    if (!role || !difficulty) {
      return res.status(400).json({ success: false, error: 'Role and difficulty are required!' });
    }

    const prompt = generateQuestionsPrompt(role, difficulty, round, level, resumeText);
    const questions = await callWithRetry(prompt);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('AI returned invalid questions format');
    }

    return res.status(200).json({ success: true, questions });

  } catch (error) {
    console.error('Error generating questions:', error.message || error);
    return res.status(500).json({ success: false, error: 'Failed to generate questions. Please try again!' });
  }
};
