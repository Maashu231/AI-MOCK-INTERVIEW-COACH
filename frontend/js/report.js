window.onload = () => {
  const results    = JSON.parse(sessionStorage.getItem('results') || '[]');
  const role       = sessionStorage.getItem('role') || 'Developer';
  const difficulty = sessionStorage.getItem('difficulty') || 'Beginner';

  if (!results.length) {
    window.location.href = 'index.html';
    return;
  }

  const totalScore = results.reduce((sum, r) => sum + (r.evaluation?.score || 0), 0);
  const avgScore   = Math.round(totalScore / results.length * 10);
  const excellent  = results.filter(r => r.evaluation?.score >= 8).length;
  const good       = results.filter(r => r.evaluation?.score >= 5 && r.evaluation?.score < 8).length;
  const needsWork  = results.filter(r => r.evaluation?.score < 5).length;

  document.getElementById('bigScore').innerHTML = `${avgScore}<span>/100</span>`;
  document.getElementById('statExcellent').textContent = excellent;
  document.getElementById('statGood').textContent      = good;
  document.getElementById('statNeedsWork').textContent = needsWork;

  let grade, subtitle;
  if (avgScore >= 80) {
    grade    = '🏆 Outstanding Performance!';
    subtitle = 'You are ready for real interviews! Excellent work.';
  } else if (avgScore >= 60) {
    grade    = '👍 Good Performance!';
    subtitle = 'Solid answers! A bit more practice and you\'ll be interview-ready.';
  } else if (avgScore >= 40) {
    grade    = '📚 Keep Practicing!';
    subtitle = 'You\'re on the right track. Focus on the weak areas below.';
  } else {
    grade    = '💪 Don\'t Give Up!';
    subtitle = 'Every expert was once a beginner. Review the ideal answers and try again!';
  }

  document.getElementById('scoreGrade').textContent    = grade;
  document.getElementById('scoreSubtitle').textContent = subtitle;

  const list = document.getElementById('resultsList');
  results.forEach((result, i) => {
    const score      = result.evaluation?.score || 0;
    const scoreClass = score >= 8 ? 'high' : score >= 5 ? 'mid' : 'low';
    const emoji      = score >= 8 ? '🏆' : score >= 5 ? '👍' : '📚';

    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <div class="result-header" onclick="toggleResult(${i})">
        <div class="result-header-left">
          <div class="result-num">${i + 1}</div>
          <div class="result-question">${result.question}</div>
        </div>
        <div class="result-score-badge ${scoreClass}">${emoji} ${score}/10</div>
        <div class="result-chevron" id="chevron-${i}">▼</div>
      </div>
      <div class="result-body" id="body-${i}">
        <div class="result-section">
          <div class="result-section-label blue">💬 Your Answer</div>
          <div class="result-section-text">${result.userAnswer}</div>
        </div>
        <div class="result-section">
          <div class="result-section-label green">✅ What Was Good</div>
          <div class="result-section-text">${result.evaluation?.feedback || '—'}</div>
        </div>
        <div class="result-section">
          <div class="result-section-label amber">⚡ What to Improve</div>
          <div class="result-section-text">${result.evaluation?.improvement || '—'}</div>
        </div>
        <div class="result-section">
          <div class="result-section-label purple">💡 Ideal Answer</div>
          <div class="result-section-text">${result.evaluation?.idealAnswer || '—'}</div>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
};

function toggleResult(i) {
  const body    = document.getElementById(`body-${i}`);
  const chevron = document.getElementById(`chevron-${i}`);
  body.classList.toggle('open');
  chevron.classList.toggle('open');
}