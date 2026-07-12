if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
}

const Groq = require('groq-sdk');
const { generateQuestionsPrompt, evaluateAnswerPrompt } = require('../prompts/systemPrompt');

// ── Multi-Key Round-Robin System ──
const apiKeys = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '')
  .split(',')
  .map(k => k.trim())
  .filter(k => k.length > 0);

if (apiKeys.length === 0) {
  console.warn('⚠️ No API keys found! Set GROQ_API_KEYS in your .env file. API routes will fail when called.');
} else {
  console.log(`✅ Loaded ${apiKeys.length} API key(s) for round-robin rotation`);
}

// Create a Groq client for each key
const clients = apiKeys.map(key => {
  return new Groq({ apiKey: key });
});

let currentKeyIndex = 0;

function getNextClient() {
  if (clients.length === 0) {
    throw new Error('No Groq API keys configured on the server.');
  }
  const client = clients[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % clients.length;
  return client;
}

// ── Robust JSON extraction ──
// Finds the first valid JSON array or object in the AI response text,
// even if there's extra text, markdown fences, or explanation around it.
function extractJSON(text) {
  // Step 1: Strip markdown code fences
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Step 2: Try parsing the cleaned text directly
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    // continue to fallback
  }

  // Step 3: Find the first [ ... ] or { ... } in the text
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
    throw new Error('No JSON found in AI response');
  }

  // Find the matching closing bracket/brace (last occurrence)
  const end = cleaned.lastIndexOf(endChar);
  if (end <= start) {
    throw new Error('Malformed JSON in AI response');
  }

  const jsonStr = cleaned.substring(start, end + 1);
  return JSON.parse(jsonStr);
}

// ── Retry helper: tries each API key before giving up ──
async function callWithRetry(prompt) {
  let lastError = null;

  for (let attempt = 0; attempt < clients.length; attempt++) {
    const client = getNextClient();
    try {
      const completion = await client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile', // Reliable and fast model
        temperature: 0.7,
      });
      const responseText = completion.choices[0].message.content;
      return extractJSON(responseText);
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ API key #${currentKeyIndex} failed (${error.message}), trying next key...`);
    }
  }

  throw lastError;
}

exports.generateQuestions = async (req, res) => {
  try {
    const { role, difficulty, round, level, resumeText } = req.body;

    if (!role || !difficulty) {
      return res.status(400).json({ success: false, error: 'Role and difficulty are required!' });
    }

    const prompt = generateQuestionsPrompt(role, difficulty, round, level, resumeText);
    const questions = await callWithRetry(prompt);

    // Validate that we got an array of strings
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('AI returned invalid questions format');
    }

    res.status(200).json({ success: true, questions });

  } catch (error) {
    console.error('Error generating questions:', error.message || error);
    res.status(500).json({ success: false, error: 'Failed to generate questions. Please try again!' });
  }
};

exports.evaluateAnswer = async (req, res) => {
  try {
    const { question, userAnswer } = req.body;

    if (!question || !userAnswer) {
      return res.status(400).json({ success: false, error: 'Question and answer are required!' });
    }

    const prompt = evaluateAnswerPrompt(question, userAnswer);
    const evaluation = await callWithRetry(prompt);

    // Validate the evaluation has the expected fields
    if (typeof evaluation !== 'object' || evaluation.score === undefined) {
      throw new Error('AI returned invalid evaluation format');
    }

    res.status(200).json({ success: true, evaluation });

  } catch (error) {
    console.error('Error evaluating answer:', error.message || error);
    res.status(500).json({ success: false, error: 'Failed to evaluate answer. Please try again!' });
  }
};