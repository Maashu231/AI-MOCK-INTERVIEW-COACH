require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateQuestionsPrompt, evaluateAnswerPrompt } = require('../prompts/systemPrompt');

console.log('API KEY LOADED:', process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Two separate models to save quota
const modelQuestion = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
const modelEvaluate = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

exports.generateQuestions = async (req, res) => {
  try {
    const { role, difficulty } = req.body;

    if (!role || !difficulty) {
      return res.status(400).json({ error: 'Role and difficulty are required!' });
    }

    const prompt = generateQuestionsPrompt(role, difficulty);
    const result = await modelQuestion.generateContent(prompt);
    const responseText = result.response.text();

    const cleanedResponse = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const questions = JSON.parse(cleanedResponse);
    res.status(200).json({ success: true, questions });

  } catch (error) {
    console.error('Error generating questions:', error.message || error);
    res.status(500).json({ error: 'Failed to generate questions. Please try again!' });
  }
};

exports.evaluateAnswer = async (req, res) => {
  try {
    const { question, userAnswer } = req.body;

    if (!question || !userAnswer) {
      return res.status(400).json({ error: 'Question and answer are required!' });
    }

    const prompt = evaluateAnswerPrompt(question, userAnswer);
    const result = await modelEvaluate.generateContent(prompt);
    const responseText = result.response.text();

    const cleanedResponse = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const evaluation = JSON.parse(cleanedResponse);
    res.status(200).json({ success: true, evaluation });

  } catch (error) {
    console.error('Error evaluating answer:', error.message || error);
    res.status(500).json({ error: 'Failed to evaluate answer. Please try again!' });
  }
};