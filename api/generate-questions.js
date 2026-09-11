const { generateQuestionsPrompt, sanitizeInput } = require('./utils/prompts');
const { callWithRetry } = require('./utils/groqClient');

module.exports = async (req, res) => {
  // Set JSON content type header
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { role, difficulty, round, level, resumeText } = req.body;
    const safeRole = sanitizeInput(role);
    const safeDifficulty = sanitizeInput(difficulty);
    const safeRound = round ? sanitizeInput(round) : round;
    const safeLevel = level ? sanitizeInput(level) : level;
    const safeResumeText = resumeText ? sanitizeInput(resumeText) : resumeText;

    if (!role || !difficulty) {
      return res.status(400).json({ success: false, error: 'Role and difficulty are required!' });
    }

    const prompt = generateQuestionsPrompt(safeRole, safeDifficulty, safeRound, safeLevel, safeResumeText);
    const startTime = Date.now();
    const questions = await callWithRetry(prompt);

    console.log(
      `generate-questions AI request completed in ${Date.now() - startTime}ms`
    );

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('AI returned invalid questions format');
    }

    return res.status(200).json({ success: true, questions });

  } catch (error) {
    console.error('Error generating questions:', error.message || error);
    const userMsg = error.message?.includes('No Groq API keys')
      ? 'Server configuration error: API keys not set. Please contact the administrator.'
      : 'Failed to generate questions. Please try again!';
    return res.status(500).json({ success: false, error: userMsg });
  }
};
