let timerInterval = null;
const TIMER_SECONDS = 300; // 5 minutes
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BACKEND = isLocalhost ? 'http://localhost:3000/api' : 'https://ai-mock-interview-saqe.onrender.com/api';

let questions    = [];
let currentIndex = 0;
let results      = [];
let role         = '';
let difficulty   = '';
let round        = '';
let level        = '';

window.onload = async () => {
  role       = sessionStorage.getItem('role')       || 'Frontend Developer';
  difficulty = sessionStorage.getItem('difficulty') || 'Beginner';
  round      = sessionStorage.getItem('round')      || 'Technical';
  level      = sessionStorage.getItem('level')      || 'Fresher';

  document.getElementById('sessionInfo').innerHTML  = `<span>${role}</span> · ${difficulty}`;
  document.getElementById('questionRole').textContent = `${role} · ${difficulty}`;

  buildDots();

  // ── Check for saved progress ──
  const saved = restoreProgress();
  if (saved) {
    const resume = confirm(`You have an unfinished interview (${saved.results.length}/10 questions answered). Resume from where you left off?`);

    if (resume) {
      // Restore everything
      questions    = saved.questions;
      results      = saved.results;
      currentIndex = saved.results.length;

      // Mark completed dots
      for (let i = 0; i < results.length; i++) {
        const dot = document.getElementById(`dot-${i}`);
        if (dot) { dot.classList.remove('active'); dot.classList.add('done'); }
      }

      // Update progress bar
      document.getElementById('progressFill').style.width  = (results.length / 10 * 100) + '%';
      document.getElementById('progressCount').textContent = `${results.length} / 10`;

      // Show next question
      showQuestion(currentIndex);
      return;
    } else {
      clearProgress();
    }
  }

  await fetchQuestions();
};
function buildDots() {
  const wrap = document.getElementById('questionDots');
  wrap.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const dot = document.createElement('div');
    dot.className = 'q-dot' + (i === 0 ? ' active' : '');
    dot.textContent = i + 1;
    dot.id = `dot-${i}`;
    wrap.appendChild(dot);
  }
}

async function fetchQuestions() {
  try {
    const res  = await fetch(`${BACKEND}/generate-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, difficulty, round, level })
    });
    const data = await res.json();
    if (data.success) {
      questions = data.questions;
      showQuestion(0);
    } else {
      showFetchError(data.error);
    }
  } catch (err) {
    showFetchError('Could not connect to server. Make sure your backend is running!');
  }
}

function showQuestion(index) {
  document.getElementById('loadingScreen').style.display   = 'none';
  document.getElementById('interviewScreen').style.display = 'block';

  document.getElementById('questionNumber').textContent = index + 1;
  document.getElementById('questionText').textContent   = questions[index];
  document.getElementById('answerInput').value          = '';
  document.getElementById('charCount').textContent      = '0 characters';

  document.getElementById('feedbackCard').classList.remove('show');
  document.getElementById('submitBtn').style.display    = 'flex';
  document.getElementById('submitBtn').classList.remove('loading');
  document.getElementById('submitText').textContent     = 'Submit Answer';
  document.getElementById('submitArrow').textContent    = '→';
  document.getElementById('nextBtn').style.display      = 'none';
  document.getElementById('errorMsg').classList.remove('show');

  updateProgress(index);
  updateDots(index);
  startTimer();
}

async function submitAnswer() {
  const answer = document.getElementById('answerInput').value.trim();
  const err    = document.getElementById('errorMsg');

  if (!answer) { err.classList.add('show'); return; }
  err.classList.remove('show');

  const btn = document.getElementById('submitBtn');
  btn.classList.add('loading');
  document.getElementById('submitText').textContent  = 'Evaluating...';
  document.getElementById('submitArrow').textContent = '⏳';

  try {
    const res  = await fetch(`${BACKEND}/evaluate-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: questions[currentIndex], userAnswer: answer })
    });
    const data = await res.json();

    if (data.success) {
      results.push({
        question:   questions[currentIndex],
        userAnswer: answer,
        evaluation: data.evaluation
      });
      showFeedback(data.evaluation);
      markDotDone(currentIndex);
    } else {
      err.textContent = data.error;
      err.classList.add('show');
      btn.classList.remove('loading');
      document.getElementById('submitText').textContent  = 'Submit Answer';
      document.getElementById('submitArrow').textContent = '→';
    }
  } catch (e) {
    err.textContent = '⚠️ Could not evaluate. Check backend is running!';
    err.classList.add('show');
    btn.classList.remove('loading');
    document.getElementById('submitText').textContent  = 'Submit Answer';
    document.getElementById('submitArrow').textContent = '→';
  }
}

function showFeedback(evaluation) {
  saveProgress();
  stopTimer();
  const score  = evaluation.score;
  const circle = document.getElementById('scoreCircle');

  circle.className = 'score-circle ' + (score >= 7 ? 'high' : score >= 4 ? 'mid' : 'low');
  document.getElementById('scoreNumber').textContent   = score;
  document.getElementById('scoreLabel').textContent    = score >= 7 ? '🏆 Great Answer!' : score >= 4 ? '👍 Decent Answer' : '📚 Needs Work';
  document.getElementById('scoreFeedback').textContent = evaluation.feedback;
  document.getElementById('feedbackGood').textContent  = evaluation.feedback;
  document.getElementById('feedbackImprove').textContent = evaluation.improvement;
  document.getElementById('feedbackIdeal').innerHTML    = formatIdealAnswer(evaluation.idealAnswer);

  document.getElementById('feedbackCard').classList.add('show');
  document.getElementById('submitBtn').style.display = 'none';

  const isLast  = currentIndex === questions.length - 1;
  const nextBtn = document.getElementById('nextBtn');
  nextBtn.style.display = 'flex';
  document.getElementById('nextText').textContent = isLast ? 'View Report 📊' : 'Next Question';
}

function nextQuestion() {
  if (currentIndex === questions.length - 1) {
    clearProgress();
    sessionStorage.setItem('results',    JSON.stringify(results));
    sessionStorage.setItem('role',       role);
    sessionStorage.setItem('difficulty', difficulty);
    window.location.href = 'report.html';
    return;
  }
  currentIndex++;
  showQuestion(currentIndex);
}

function updateProgress(index) {
  const done  = results.length;
  const pct   = (done / 10) * 100;
  document.getElementById('progressFill').style.width  = pct + '%';
  document.getElementById('progressCount').textContent = `${done} / 10`;
}

function updateDots(activeIndex) {
  for (let i = 0; i < 10; i++) {
    const dot = document.getElementById(`dot-${i}`);
    if (!dot) continue;
    dot.classList.remove('active');
    if (i === activeIndex) dot.classList.add('active');
  }
}

function markDotDone(index) {
  const dot = document.getElementById(`dot-${index}`);
  if (dot) { dot.classList.remove('active'); dot.classList.add('done'); }
  document.getElementById('progressFill').style.width  = (results.length / 10 * 100) + '%';
  document.getElementById('progressCount').textContent = `${results.length} / 10`;
}

document.addEventListener('DOMContentLoaded', () => {
  const ta = document.getElementById('answerInput');
  if (ta) {
    ta.addEventListener('input', () => {
      document.getElementById('charCount').textContent = ta.value.length + ' characters';
    });
  }
});

// ── Format ideal answer: render code blocks properly ──
function formatIdealAnswer(text) {
  if (!text) return '—';

  // Escape HTML to prevent XSS
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Detect if the answer contains code (has \n with code-like patterns)
  const hasCode = /\\n/.test(text) && /[{};()=]/.test(text);

  if (hasCode) {
    // Split into explanation and code parts
    const parts = escaped.split(/\\n/);
    const explanation = parts[0];
    const code = parts.slice(1).join('\n');

    if (code.trim()) {
      return `<p style="margin-bottom:10px">${explanation}</p><pre class="code-block"><code>${code}</code></pre>`;
    }
  }

  // For non-code answers, just convert \n to line breaks
  return escaped.replace(/\\n/g, '<br>');
}

function showFetchError(msg) {
  document.getElementById('loadingScreen').innerHTML = `
    <div style="font-size:40px;margin-bottom:16px">⚠️</div>
    <h3 style="color:#ef4444;margin-bottom:8px">Something went wrong</h3>
    <p style="color:#6b6b80;margin-bottom:24px">${msg}</p>
    <button onclick="window.location.href='index.html'"
      style="padding:10px 24px;background:#4f46e5;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">
      ← Go Back
    </button>`;
}
function startTimer() {
  clearInterval(timerInterval);
  let timeLeft = TIMER_SECONDS;

  const circle = document.getElementById('timerCircle');
  const text   = document.getElementById('timerText');

  circle.className = 'timer-circle';

  timerInterval = setInterval(() => {
    timeLeft--;

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    text.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

    if (timeLeft <= 30) circle.className = 'timer-circle warning';
    if (timeLeft <= 10) circle.className = 'timer-circle danger';

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      text.textContent = '0:00';
      // Auto submit when time runs out
      const answer = document.getElementById('answerInput').value.trim();
      if (!answer) {
        document.getElementById('answerInput').value = 'No answer provided — time ran out.';
      }
      submitAnswer();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}
// ── Voice Input ──
let recognition = null;
let isListening = false;
let accumulatedTranscript = ''; // Accumulate voice across phrases

function toggleVoice() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Voice input is not supported in your browser. Please use Google Chrome!');
    return;
  }

  if (isListening) {
    stopVoice();
    return;
  }

  startVoice();
}

function startVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();

  recognition.continuous     = true;
  recognition.interimResults = true;
  recognition.lang           = 'en-US';

  const btn     = document.getElementById('micBtn');
  const micText = document.getElementById('micText');
  const textarea = document.getElementById('answerInput');

  btn.classList.add('listening');
  micText.textContent = 'Listening...';
  isListening = true;

  // Start fresh accumulation from any existing text in textarea
  accumulatedTranscript = textarea.value;

  recognition.onresult = (event) => {
    let finalTranscript   = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    // Accumulate final transcript and show interim for current phrase
    if (finalTranscript) {
      accumulatedTranscript += (accumulatedTranscript ? ' ' : '') + finalTranscript.trim();
      textarea.value = accumulatedTranscript;
    } else {
      textarea.value = accumulatedTranscript + (accumulatedTranscript ? ' ' : '') + interimTranscript;
    }
    document.getElementById('charCount').textContent = textarea.value.length + ' characters';
  };

  recognition.onerror = (event) => {
    console.error('Voice error:', event.error);
    stopVoice();
  };

  recognition.onend = () => {
    if (isListening) stopVoice();
  };

  recognition.start();
}

function stopVoice() {
  if (recognition) recognition.stop();
  const btn     = document.getElementById('micBtn');
  const micText = document.getElementById('micText');
  btn.classList.remove('listening');
  micText.textContent = 'Speak';
  isListening = false;
}
// ── Save progress to localStorage ──
function saveProgress() {
  const progress = {
    role,
    difficulty,
    questions,
    results,
    currentIndex,
    timestamp: Date.now()
  };
  localStorage.setItem('interviewProgress', JSON.stringify(progress));
}

// ── Restore progress if exists ──
function restoreProgress() {
  const saved = localStorage.getItem('interviewProgress');
  if (!saved) return false;

  const progress = JSON.parse(saved);

  // Check if progress is less than 2 hours old
  const twoHours = 2 * 60 * 60 * 1000;
  if (Date.now() - progress.timestamp > twoHours) {
    localStorage.removeItem('interviewProgress');
    return false;
  }

  // Check if same role and difficulty
  if (progress.role !== role || progress.difficulty !== difficulty) {
    localStorage.removeItem('interviewProgress');
    return false;
  }

  // Check if interview was already completed
  if (progress.results.length === 10) {
    localStorage.removeItem('interviewProgress');
    return false;
  }

  return progress;
}

// ── Clear progress after interview completes ──
function clearProgress() {
  localStorage.removeItem('interviewProgress');
}