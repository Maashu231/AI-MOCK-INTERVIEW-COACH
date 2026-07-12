const { generateQuestions } = require('../backend/controllers/interviewController');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  return generateQuestions(req, res);
};
