const Groq = require('groq-sdk');

// ── Setup Groq clients from env ──
const apiKeys = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '')
  .split(',')
  .map(k => k.trim())
  .filter(k => k.length > 0);

if (apiKeys.length === 0) {
  console.error('❌ No Groq API keys found!');
  console.error('   GROQ_API_KEYS:', process.env.GROQ_API_KEYS ? 'SET (length: ' + process.env.GROQ_API_KEYS.length + ')' : 'UNDEFINED');
  console.error('   GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'SET' : 'UNDEFINED');
  console.error('   → Make sure GROQ_API_KEYS is set in your Vercel Environment Variables dashboard.');
}

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
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input to extractJSON: empty or non-string');
  }

  // 1. Try stripping markdown code fences
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // 2. Try parsing directly
  try { return JSON.parse(cleaned); } catch (_) {}

  // 3. Find first [ or { and match closing
  const arrayStart = cleaned.indexOf('[');
  const objectStart = cleaned.indexOf('{');
  
  let start = -1;
  let endChar = '';

  if (arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart)) {
    start = arrayStart;
    endChar = ']';
  } else if (objectStart !== -1) {
    start = objectStart;
    endChar = '}';
  }

  if (start === -1) {
    throw new Error('No JSON structure found in AI response');
  }

  // Find the LAST occurrence of the matching bracket to include nested objects
  const end = cleaned.lastIndexOf(endChar);
  if (end <= start) {
    throw new Error('Malformed JSON structure in AI response');
  }

  const jsonString = cleaned.substring(start, end + 1);
  try {
    return JSON.parse(jsonString);
  } catch (parseError) {
    throw new Error(`Failed to parse extracted JSON: ${parseError.message}`);
  }
}

// ── Retry helper ──
async function callWithRetry(prompt, model = 'openai/gpt-oss-20b', temperature = 0.7) {
  let lastError = null;
  // Try each client exactly once in case of failure
  const attempts = clients.length > 0 ? clients.length : 1; 

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const client = getNextClient();
      const completion = await client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: model,
        temperature: temperature,
      });

      const responseText = completion.choices[0].message.content;
      return extractJSON(responseText);
    } catch (error) {
      lastError = error;
      console.warn(`API request failed (Attempt ${attempt + 1}/${attempts}): ${error.message}`);
    }
  }

  const errorMsg = lastError ? lastError.message : 'All API requests failed';
  const wrappedError = new Error(`AI service error: ${errorMsg}`);
  wrappedError.statusCode = lastError?.status || 500;
  throw wrappedError;
}

module.exports = { callWithRetry };
