let selectedDifficulty = 'Beginner';

function selectDifficulty(el) {
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  selectedDifficulty = el.dataset.value;
}

function startInterview() {
  const role = document.getElementById('roleSelect').value;
  const btn  = document.getElementById('startBtn');
  const err  = document.getElementById('errorMsg');

  if (!role || !selectedDifficulty) {
    err.classList.add('show'); return;
  }
  err.classList.remove('show');
  btn.classList.add('loading');
  document.getElementById('btnText').textContent = 'Generating Questions...';
  document.getElementById('btnArrow').textContent = '⏳';

  sessionStorage.setItem('role', role);
  sessionStorage.setItem('difficulty', selectedDifficulty);

  setTimeout(() => { window.location.href = 'interview.html'; }, 800);
}