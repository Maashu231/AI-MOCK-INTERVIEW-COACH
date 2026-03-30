
window.onload = () => {
  const results    = JSON.parse(sessionStorage.getItem('results') || '[]');
  const role       = sessionStorage.getItem('role') || 'Developer';
  const difficulty = sessionStorage.getItem('difficulty') || 'Beginner';

  if (!results.length) {
    window.location.href = 'index.html';
    return;
  }

  //--Auto Save to History--
  saveToHistory(results, role, difficulty);

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
        <div class="result-body-inner">
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
// ── PDF Download ──
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const results    = JSON.parse(sessionStorage.getItem('results') || '[]');
  const role       = sessionStorage.getItem('role') || 'Developer';
  const difficulty = sessionStorage.getItem('difficulty') || 'Beginner';
  const totalScore = results.reduce((sum, r) => sum + (r.evaluation?.score || 0), 0);
  const avgScore   = Math.round(totalScore / results.length * 10);

  // ── Header ──
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('InterviewAI — Performance Report', 14, 18);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Role: ${role}  |  Difficulty: ${difficulty}  |  Score: ${avgScore}/100`, 14, 30);

  // ── Score Summary ──
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance Summary', 14, 52);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const excellent = results.filter(r => r.evaluation?.score >= 8).length;
  const good      = results.filter(r => r.evaluation?.score >= 5 && r.evaluation?.score < 8).length;
  const needsWork = results.filter(r => r.evaluation?.score < 5).length;
  doc.text(`Overall Score: ${avgScore}/100  |  Excellent: ${excellent}  |  Good: ${good}  |  Needs Work: ${needsWork}`, 14, 62);

  // ── Questions ──
  let y = 75;

  results.forEach((result, i) => {
    if (y > 250) { doc.addPage(); y = 20; }

    const score = result.evaluation?.score || 0;

    // Question header
    doc.setFillColor(238, 242, 255);
    doc.rect(14, y - 5, 182, 8, 'F');
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Q${i + 1}. ${result.question.substring(0, 80)}${result.question.length > 80 ? '...' : ''}`, 16, y);
    y += 8;

    // Score
    doc.setTextColor(score >= 7 ? 16 : score >= 4 ? 245 : 239,
                     score >= 7 ? 185 : score >= 4 ? 158 : 68,
                     score >= 7 ? 129 : score >= 4 ? 11 : 68);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Score: ${score}/10`, 16, y);
    y += 7;

    // Your answer
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const answerLines = doc.splitTextToSize(`Your Answer: ${result.userAnswer}`, 178);
    doc.text(answerLines.slice(0, 2), 16, y);
    y += answerLines.slice(0, 2).length * 5 + 3;

    // Ideal answer
    const idealLines = doc.splitTextToSize(`Ideal Answer: ${result.evaluation?.idealAnswer || ''}`, 178);
    doc.text(idealLines.slice(0, 2), 16, y);
    y += idealLines.slice(0, 2).length * 5 + 8;

    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.line(14, y - 4, 196, y - 4);
  });

  // ── Footer ──
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by InterviewAI — AI Mock Interview Coach', 14, 287);

  // ── Save ──
  doc.save(`InterviewAI_Report_${role.replace(/ /g,'_')}_${new Date().toLocaleDateString()}.pdf`);
}
// ── Save to History ──
function saveToHistory(results, role, difficulty) {
  const totalScore = results.reduce((sum, r) => sum + (r.evaluation?.score || 0), 0);
  const avgScore   = Math.round(totalScore / results.length * 10);

  const interview = {
    id:         Date.now(),
    date:       new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }),
    time:       new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }),
    role,
    difficulty,
    score:      avgScore,
    results
  };

  const history = JSON.parse(localStorage.getItem('interviewHistory') || '[]');
  history.unshift(interview);

  // Keep only last 10 interviews
  if (history.length > 10) history.pop();

  localStorage.setItem('interviewHistory', JSON.stringify(history));
}