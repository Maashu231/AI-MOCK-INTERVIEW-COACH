<div align="center">

# 🎯 InterviewAI

AI-powered mock interview coach that helps you practice and ace your tech interviews.
Pick a role, answer AI-generated questions, get instant scores and feedback — all for free.

</div>

---

## 🔗 Live Demo

🌐 [View Live App](https://ai-mock-interview-saqe.onrender.com)

---

## 📂 Project Links

- 📁 GitHub Repo: [AI-MOCK-INTERVIEW-COACH](https://github.com/Maashu231/AI-MOCK-INTERVIEW-COACH)

---

## ✨ Features

- 🎭 **25+ Tech Roles** — From Junior Dev to Solution Architect and Engineering Manager
- 🔄 **4 Interview Rounds** — HR, Technical, Coding, and Managerial rounds
- 🤖 **AI-Generated Questions** — Powered by Google Gemini 2.5 Flash Lite
- 📊 **Instant Scoring** — Get a score out of 10 with feedback and ideal answers
- 🎙️ **Voice Input** — Speak your answers using built-in speech recognition
- ⏱️ **5-Minute Timer** — Simulates real interview pressure per question
- 📄 **PDF Reports** — Download your performance report with one click
- 📋 **Interview History** — View and revisit your last 10 sessions
- 💾 **Auto-Save Progress** — Resume interrupted interviews within 2 hours
- 🎨 **Modern Dark UI** — Animated canvas background with smooth interactions

---

## 🛠️ Tech Stack

InterviewAI is built with a simple, clean architecture:

- **Frontend:** HTML5, Vanilla JavaScript, CSS3
- **Backend:** Node.js, Express v5
- **AI Engine:** Google Gemini 2.5 Flash Lite
- **PDF Export:** jsPDF
- **Voice Input:** Web Speech API
- **Hosting:** Vercel (frontend) + Render (backend)

---

## 📁 Folder Structure

```
AI-MOCK-INTERVIEW-COACH/
│
├── backend/
│   ├── controllers/
│   │   └── interviewController.js    # Gemini API calls + key rotation
│   ├── prompts/
│   │   └── systemPrompt.js           # AI prompt templates
│   ├── routes/
│   │   └── interview.js              # API route definitions
│   ├── server.js                     # Express server entry point
│   └── .env                          # API keys (git-ignored)
│
├── frontend/
│   ├── css/
│   │   └── style.css                 # Full dark theme + animations
│   ├── js/
│   │   ├── main.js                   # Landing page + canvas background
│   │   ├── interview.js              # Interview session + voice + timer
│   │   ├── report.js                 # Score report + PDF download
│   │   └── history.js                # Past sessions from localStorage
│   ├── index.html                    # Landing page
│   ├── interview.html                # Interview session page
│   ├── report.html                   # Performance report page
│   └── history.html                  # Interview history page
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

Follow these simple steps to run InterviewAI on your local machine:

### 📋 Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm**
- A free **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey)

### 📦 Installation

**1. Clone the repository**

```bash
git clone https://github.com/Maashu231/AI-MOCK-INTERVIEW-COACH.git
cd AI-MOCK-INTERVIEW-COACH
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file inside the `backend/` folder:

```env
GEMINI_API_KEY=your_api_key_here
PORT=3000
```

> 💡 You can add multiple comma-separated keys for auto-rotation: `GEMINI_API_KEYS=key1,key2,key3`

**4. Run the development server**

```bash
npm start
```

**5. Open in browser**

```
http://localhost:3000
```

---

## 🤝 Contributing

We love contributions! If you'd like to improve InterviewAI, follow these steps:

1. **Fork** the repository
2. **Create a new branch** (`git checkout -b feature/your-feature-name`)
3. **Commit your changes** (`git commit -m "Added new feature"`)
4. **Push to GitHub** (`git push origin feature/your-feature-name`)
5. **Open a Pull Request** 🎉

---

## 💬 Support

Need help? Have suggestions?

- Open an issue in the [repository](https://github.com/Maashu231/AI-MOCK-INTERVIEW-COACH/issues)
- Connect on GitHub — [@Maashu231](https://github.com/Maashu231)

---

<div align="center">

**Made with ❤️ by [Maashu231](https://github.com/Maashu231)**

</div>