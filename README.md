# InterviewAI — AI Mock Interview Coach

An AI-powered mock interview app that generates real technical interview questions, evaluates your answers, and gives you a detailed performance report.

---

## What It Does

- Generates 10 role-specific interview questions using Gemini AI
- Evaluates each answer with a score out of 10
- Shows feedback, improvements, and ideal answers
- Generates a full performance report at the end

---

## Tech Stack

- **Frontend** — HTML, CSS, JavaScript
- **Backend** — Node.js, Express.js
- **AI** — Google Gemini API

---

## Getting Started

**1. Clone the repo**
```bash
git clone https://github.com/yourusername/ai-mock-interview-coach.git
cd ai-mock-interview-coach
```

**2. Install dependencies**
```bash
npm install
```

**3. Add your API key**

Create a `.env` file inside `backend/` folder:
```
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

Get a free API key at [aistudio.google.com](https://aistudio.google.com)

**4. Start the server**
```bash
node backend/server.js
```

**5. Open the app**

Open `frontend/index.html` in your browser.

---

## Supported Roles

Frontend Developer · Backend Developer · Full Stack · DevOps · Data Scientist · Mobile Developer · AI Engineer · System Design

## Difficulty Levels

Beginner · Intermediate · Advanced

---

Built with Node.js + Express + Google Gemini API