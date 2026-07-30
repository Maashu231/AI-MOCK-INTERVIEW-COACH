const { generateQuestionsPrompt } = require('./utils/prompts');
const { callWithRetry } = require('./utils/groqClient');

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
