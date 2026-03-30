require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateQuestionsPrompt, evaluateAnswerPrompt } = require('../prompts/systemPrompt');

// ── Multi-Key Round-Robin System ──
const apiKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',')
  .map(k => k.trim())
  .filter(k => k.length > 0);

if (apiKeys.length === 0) {
  console.error('❌ No API keys found! Set GEMINI_API_KEYS in your .env file.');
  process.exit(1);
}

console.log(`✅ Loaded ${apiKeys.length} API key(s) for round-robin rotation`);

// Create a GenAI client + model pair for each key
const clients = apiKeys.map(key => {
  const genAI = new GoogleGenerativeAI(key);
  return {
    questionModel: genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' }),
    evaluateModel: genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' }),
  };
});

let currentKeyIndex = 0;

function getNextClient() {
  const client = clients[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % clients.length;
  return client;
}

exports.generateQuestions = async (req, res) => {
  try {
    const { role, difficulty, round, level } = req.body;

    if (!role || !difficulty) {
      return res.status(400).json({ success: false, error: 'Role and difficulty are required!' });
    }

    const prompt = generateQuestionsPrompt(role, difficulty, round, level);
    const { questionModel } = getNextClient();
    const result = await questionModel.generateContent(prompt);
    const responseText = result.response.text();

    const cleanedResponse = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const questions = JSON.parse(cleanedResponse);
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
    const { evaluateModel } = getNextClient();
    const result = await evaluateModel.generateContent(prompt);
    const responseText = result.response.text();

    const cleanedResponse = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const evaluation = JSON.parse(cleanedResponse);
    res.status(200).json({ success: true, evaluation });

  } catch (error) {
    console.error('Error evaluating answer:', error.message || error);
    res.status(500).json({ success: false, error: 'Failed to evaluate answer. Please try again!' });
  }
};