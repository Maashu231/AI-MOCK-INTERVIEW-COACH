# InterviewAI — AI Mock Interview Coach

AI-powered mock interview app. Pick a role, answer questions, get instant feedback.

**Live:** [ai-mock-interview-coach.onrender.com](https://ai-mock-interview-coach.onrender.com)

## Features

- 25+ tech roles with 4 interview rounds (HR, Technical, Coding, Managerial)
- 10 AI-generated questions per session using Google Gemini
- Real-time scoring with feedback and ideal answers
- Voice input support (Chrome)
- PDF report download
- Interview history tracking
- Multi-key API rotation for quota management

## Tech Stack

**Frontend:** HTML, CSS, JavaScript  
**Backend:** Node.js, Express  
**AI:** Google Gemini 2.5 Flash Lite

## Setup

```bash
git clone https://github.com/Maashu231/AI-MOCK-INTERVIEW-COACH.git
cd AI-MOCK-INTERVIEW-COACH
npm install
```

Create `backend/.env`:
```
GEMINI_API_KEYS=your_api_key_here
PORT=3000
```

Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
backend/
  server.js              # Express server
  controllers/           # Gemini API logic + key rotation
  prompts/               # AI prompt templates
  routes/                # API endpoints

frontend/
  index.html             # Landing page
  interview.html         # Interview session
  report.html            # Performance report
  history.html           # Past interviews
  css/style.css          # Styling
  js/                    # Page logic, voice input, PDF generation
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate-questions` | Generate 10 questions |
| POST | `/api/evaluate-answer` | Score an answer |

## License

ISC