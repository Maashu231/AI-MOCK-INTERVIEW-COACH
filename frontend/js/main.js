/* ── InterviewAI v2.0 — main.js ── */

let selectedDifficulty = 'Beginner';
let selectedLevel      = 'Fresher';
let selectedRound      = null;

/* ══════════════════════════════════════
   SHADER-LIKE CANVAS BACKGROUND
══════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById('bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  let mouse = { x: W / 2, y: H / 2 };
  let t = 0;

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initGrid();
  });

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Grid mesh
  const COLS = 26, ROWS = 16;
  let pts = [];

  function initGrid() {
    pts = [];
    for (let r = 0; r <= ROWS; r++) {
      for (let c = 0; c <= COLS; c++) {
        pts.push({
          bx:    (c / COLS) * W,
          by:    (r / ROWS) * H,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.4,
          amp:   8 + Math.random() * 14,
          ox: 0, oy: 0,
        });
      }
    }
  }
  initGrid();

  // Particles
  const COLORS = ['#e4a94b', '#5eead4', '#7c3aed', '#60a5fa', '#f472b6'];
  const COUNT  = 100;
  const particles = Array.from({ length: COUNT }, () => ({
    x:   Math.random() * 1920,
    y:   Math.random() * 1080,
    vx:  (Math.random() - 0.5) * 0.35,
    vy:  (Math.random() - 0.5) * 0.35,
    r:   0.5 + Math.random() * 1.5,
    col: COLORS[Math.floor(Math.random() * COLORS.length)],
    a:   0.3 + Math.random() * 0.5,
  }));

  function getP(r, c) {
    const p = pts[r * (COLS + 1) + c];
    return { x: p.bx + p.ox, y: p.by + p.oy };
  }

  function draw() {
    t += 0.008;
    ctx.clearRect(0, 0, W, H);

    // Update grid
    pts.forEach(p => {
      const dx   = mouse.x - p.bx;
      const dy   = mouse.y - p.by;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const pull = Math.max(0, 1 - dist / 280);
      p.ox = Math.sin(t * p.speed + p.phase) * p.amp + pull * dx * 0.12;
      p.oy = Math.cos(t * p.speed + p.phase * 0.7) * p.amp * 0.7 + pull * dy * 0.12;
    });

    // Draw grid lines
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const a = getP(r, c), b = getP(r, c + 1), d = getP(r + 1, c);
        const mx = (a.x + b.x) / 2, my = (a.y + d.y) / 2;
        const mdist = Math.sqrt((mouse.x - mx) ** 2 + (mouse.y - my) ** 2);
        const bright = Math.max(0, 1 - mdist / 320);
        const alpha  = 0.025 + bright * 0.1;

        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(228,169,75,${alpha})`; ctx.lineWidth = 0.5; ctx.stroke();

        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(d.x, d.y);
        ctx.strokeStyle = `rgba(94,234,212,${alpha * 0.8})`; ctx.lineWidth = 0.5; ctx.stroke();
      }
    }

    // Grid node glows near mouse
    pts.forEach(p => {
      const x = p.bx + p.ox, y = p.by + p.oy;
      const dx = mouse.x - x, dy = mouse.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const s = 1 - dist / 200;
        ctx.beginPath(); ctx.arc(x, y, 1.5 + s * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(228,169,75,${s * 0.6})`; ctx.fill();
      }
    });

    // Particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.globalAlpha = p.a; ctx.fillStyle = p.col; ctx.fill(); ctx.globalAlpha = 1;
    });

    // Particle connections
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = particles[i].col;
          ctx.globalAlpha = (1 - dist / 90) * 0.07;
          ctx.lineWidth = 0.5; ctx.stroke(); ctx.globalAlpha = 1;
        }
      }
    }

    // Mouse glow
    const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
    mg.addColorStop(0, 'rgba(228,169,75,0.06)');
    mg.addColorStop(1, 'transparent');
    ctx.fillStyle = mg; ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ══════════════════════════════════════
   SELECTION HANDLERS
══════════════════════════════════════ */
function selectLevel(el) {
  document.querySelectorAll('.pill-level').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  selectedLevel = el.dataset.value;
}

function selectDifficulty(el) {
  document.querySelectorAll('.pill-diff').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  selectedDifficulty = el.dataset.value;
}

function selectRound(el) {
  document.querySelectorAll('.round-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  selectedRound = el.dataset.value;
  document.getElementById('errorMsg').classList.remove('show');
}

/* ══════════════════════════════════════
   START INTERVIEW
══════════════════════════════════════ */
function startInterview() {
  const role = document.getElementById('roleSelect').value;
  const err  = document.getElementById('errorMsg');
  const btn  = document.getElementById('startBtn');

  if (!selectedRound) {
    err.classList.add('show');
    document.getElementById('roundGrid').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  err.classList.remove('show');
  btn.disabled = true;
  document.getElementById('btnText').textContent = 'Generating Questions...';
  document.getElementById('btnArrow').textContent = '⏳';

  sessionStorage.setItem('role',       role);
  sessionStorage.setItem('difficulty', selectedDifficulty);
  sessionStorage.setItem('round',      selectedRound);
  sessionStorage.setItem('level',      selectedLevel);

  document.body.classList.add('page-exit');
  setTimeout(() => { window.location.href = 'interview.html'; }, 300);
}