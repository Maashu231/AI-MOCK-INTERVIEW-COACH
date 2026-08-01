require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const generateQuestions = require('./api/generate-questions');
const evaluateAnswer = require('./api/evaluate-answer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock Vercel serverless function routes
app.post('/api/generate-questions', (req, res) => generateQuestions(req, res));
app.post('/api/evaluate-answer', (req, res) => evaluateAnswer(req, res));

// Serve frontend static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all
app.use((req, res, next) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Local dev server is running on http://localhost:${PORT}`);
});
