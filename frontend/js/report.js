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
  } else if