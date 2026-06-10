// ── NAV HIGHLIGHT ──
const sections = document.querySelectorAll('section[id]');
const pills = document.querySelectorAll('.pill');

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      pills.forEach(p => p.classList.remove('active'));
      const a = document.querySelector(`.pill[href="#${e.target.id}"]`);
      if (a) a.classList.add('active');
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => observer.observe(s));


// ── CANVAS SETUP (RETINA + SUAVE) ──
const canvas = document.getElementById('petals-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);


// ── PETAL SYSTEM ──
const petals = [];
let mouse = { x: -200, y: -200 };
let lastTime = performance.now();


// ── INPUT ──
document.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;

  if (Math.random() < 0.18) {
    spawnPetal(e.clientX, e.clientY);
  }
});

document.addEventListener('touchmove', e => {
  const t = e.touches[0];
  mouse.x = t.clientX;
  mouse.y = t.clientY;

  if (Math.random() < 0.2) {
    spawnPetal(t.clientX, t.clientY);
  }
}, { passive: true });


// ── SPAWN PETAL (SAKURA STYLE) ──
function spawnPetal(x, y) {
  const colors = ['#E8C84A','#F0D060','#D4A800','#FADA5E','#F5C518','#FFE066'];

  petals.push({
    x, y,

    vx: (Math.random() - 0.5) * 0.5,
    vy: Math.random() * -0.7 - 0.2,

    size: Math.random() * 7 + 4,
    color: colors[(Math.random() * colors.length) | 0],

    // rotação realista
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.04,
    rotWobble: Math.random() * 0.02,

    // vento (flutter tipo Sakura)
    flutter: Math.random() * 2,
    flutterSpeed: 0.03 + Math.random() * 0.02,

    gravity: 0.012 + Math.random() * 0.004,

    life: 1,
    alpha: 1,
    decay: 0.0025 + Math.random() * 0.001
  });
}


// ── DRAW PETAL ──
function drawPetal(p) {
  ctx.save();
  ctx.globalAlpha = p.alpha;

  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);

  ctx.beginPath();
  ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);

  ctx.fillStyle = p.color;
  ctx.fill();

  ctx.restore();
}


// ── ANIMATION LOOP (SUAVE + WIND) ──
function animate(time) {
  const dt = Math.min((time - lastTime) / 16.67, 2);
  lastTime = time;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = petals.length - 1; i >= 0; i--) {
    const p = petals[i];

    const wind = Math.sin(p.flutter) * 0.15;
    p.flutter += p.flutterSpeed * dt;

    p.x += (p.vx + wind) * dt;
    p.y += p.vy * dt;

    p.vy += p.gravity * dt;

    p.vx *= 0.985;

    p.rot += (p.rotSpeed + Math.sin(p.flutter) * p.rotWobble) * dt;

    p.life -= p.decay * dt;
    p.alpha = Math.max(0, p.life);

    drawPetal(p);

    if (p.life <= 0) petals.splice(i, 1);
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);