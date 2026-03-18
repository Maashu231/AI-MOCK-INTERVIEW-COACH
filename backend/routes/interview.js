const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');

// Route to generate questions
router.post('/generate-questions', interviewController.generateQuestions);

// Route to evaluate answer
router.post('/evaluate-answer', interviewController.evaluateAnswer);

module.exports = router;