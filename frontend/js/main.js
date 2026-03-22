let selectedDifficulty = 'Beginner';

function selectDifficulty(el) {
  // Remove active from all pills
  document.querySelectorAll('.pill').forEach(p => {
    p.classList.remove('active');
    p.className = `pill ${p.classList[1]} py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500 text-sm font-semibold transition-all duration-200 hover:scale-105`;
  });

  // Set active on clicked pill
  el.classList.add('active');
  selectedDifficulty = el.dataset.value;
}

function startInterview() {
  const role = document.getElementById('roleSelect').value;
  const btn  = document.getElementById('startBtn');
  const err  = document.getElementById('errorMsg');

  if (!role || !selectedDifficulty) {
    err.classList.remove('hidden');
    return;
  }

  err.classList.add('hidden');
  btn.disabled = true;
  document.getElementById('btnText').textContent = '⏳ Generating Questions...';

  sessionStorage.setItem('role', role);
  sessionStorage.setItem('difficulty', selectedDifficulty);

  setTimeout(() => {
    window.location.href = 'interview.html';
  }, 800);
}