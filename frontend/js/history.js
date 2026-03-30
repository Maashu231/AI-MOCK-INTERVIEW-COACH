window.onload = () => {
  const history = JSON.parse(localStorage.getItem('interviewHistory') || '[]');
  const list    = document.getElementById('historyList');
  const empty   = document.getElementById('emptyState');

  if (!history.length) {
    empty.style.display = 'block';
    return;
  }

  history.forEach((interview, i) => {
    const scoreClass = interview.score >= 80 ? 'high' : interview.score >= 50 ? 'mid' : 'low';
    const emoji      = interview.score >= 80 ? '🏆' : interview.score >= 50 ? '👍' : '📚';

    const card = document.createElement('div');
    card.className = 'result-card';
    card.style.marginBottom = '16px';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div class="result-header" onclick="viewInterview(${i})">
        <div class="result-header-left">
          <div class="result-num">${i + 1}</div>
          <div>
            <div style="font-size:14px; font-weight:600; color:var(--white)">${interview.role}</div>
            <div style="font-size:12px; color:var(--muted)">${interview.date} · ${interview.time} · ${interview.difficulty}</div>
          </div>
        </div>
        <div class="result-score-badge ${scoreClass}">${emoji} ${interview.score}/100</div>
        <div class="result-chevron">→</div>
      </div>
    `;
    list.appendChild(card);
  });
};

function viewInterview(index) {
  const history = JSON.parse(localStorage.getItem('interviewHistory') || '[]');
  const interview = history[index];

  sessionStorage.setItem('results',    JSON.stringify(interview.results));
  sessionStorage.setItem('role',       interview.role);
  sessionStorage.setItem('difficulty', interview.difficulty);

  window.location.href = 'report.html';
}

function clearHistory() {
  if (confirm('Are you sure you want to clear all history?')) {
    localStorage.removeItem('interviewHistory');
    window.location.reload();
  }
}
