const { evaluateAnswerPrompt } = require('./utils/prompts');
const { callWithRetry } = require('./utils/groqClient');

module.exports = async (req, res) => {
  // Set JSON content type header
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { question, userAnswer } = req.body;

    if (!question || !userAnswer) {
      return res.status(400).json({ success: false, error: 'Question and answer are required!' });
    }

    const prompt = evaluateAnswerPrompt(question, userAnswer);
    const evaluation = await callWithRetry(prompt);

    if (typeof evaluation !== 'object' || evaluation.score === undefined) {
      throw new Error('AI returned invalid evaluation format');
    }

    return res.status(200).json({ success: true, evaluation });

  } catch (error) {
    console.error('Error evaluating answer:', error.message || error);
    return res.status(500).json({ success: false, error: 'Failed to evaluate answer. Please try again!' });
  }
};
