const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const screens = { start: document.getElementById('startScreen'), game: document.getElementById('gameScreen') };
const hud = {
  level: document.getElementById('hudLevel'),
  levelName: document.getElementById('hudLevelName'),
  lives: document.getElementById('hudLives'),
  score: document.getElementById('hudScore'),
  items: document.getElementById('hudItems')
};
const overlay = {
  root: document.getElementById('overlay'),
  title: document.getElementById('overlayTitle'),
  text: document.getElementById('overlayText'),
  button: document.getElementById('overlayBtn')
};
const muteBtn = document.getElementById('muteBtn');

const keys = {};
let audioCtx;
let muted = false;
let running = false;
let awaitingContinue = false;

const state = { levelIndex: 0, lives: 3, score: 0, player: null, collectibles: [], enemies: [], traps: [], particles: [], exit: null };

const levels = [
  { name: 'Network Login', mission: 'Tutorial: collect 2 security keys.', start: { x: 42, y: 42 }, required: 2, walls: [{ x: 250, y: 80, w: 20, h: 420 }], collectibles: [{ x: 130, y: 110 }, { x: 820, y: 500 }], enemies: [{ x: 640, y: 140, r: 13, vx: 0, vy: 1.4, minY: 100, maxY: 520 }], traps: [], exit: { x: 900, y: 540 } },
  { name: 'Malware Maze', mission: 'Collect 3 patches across guarded lanes.', start: { x: 35, y: 35 }, required: 3, walls: [{ x: 140, y: 60, w: 20, h: 500 }, { x: 320, y: 0, w: 20, h: 380 }, { x: 500, y: 220, w: 20, h: 380 }, { x: 680, y: 0, w: 20, h: 360 }], collectibles: [{ x: 80, y: 530 }, { x: 430, y: 110 }, { x: 860, y: 120 }], enemies: [{ x: 220, y: 470, r: 13, vx: 1.8, vy: 0, minX: 170, maxX: 620 }, { x: 860, y: 360, r: 13, vx: 0, vy: 2, minY: 80, maxY: 520 }], traps: [], exit: { x: 900, y: 40 } },
  { name: 'Phishing Storm', mission: 'Avoid phishing traps and collect safe data packets.', start: { x: 50, y: 520 }, required: 3, walls: [{ x: 240, y: 0, w: 20, h: 350 }, { x: 470, y: 250, w: 20, h: 350 }, { x: 720, y: 0, w: 20, h: 360 }], collectibles: [{ x: 90, y: 90 }, { x: 550, y: 100 }, { x: 860, y: 520 }], enemies: [{ x: 610, y: 520, r: 13, vx: 2.5, vy: 0, minX: 500, maxX: 900 }, { x: 860, y: 120, r: 13, vx: 0, vy: 2.6, minY: 80, maxY: 500 }], traps: [{ x: 320, y: 430, w: 36, h: 36 }, { x: 580, y: 290, w: 36, h: 36 }, { x: 780, y: 430, w: 36, h: 36 }], exit: { x: 902, y: 42 } },
  { name: 'Patch Rush', mission: 'High pressure zone: collect 4 assets quickly.', start: { x: 35, y: 300 }, required: 4, walls: [{ x: 170, y: 0, w: 20, h: 410 }, { x: 360, y: 170, w: 20, h: 430 }, { x: 560, y: 0, w: 20, h: 380 }, { x: 760, y: 180, w: 20, h: 420 }], collectibles: [{ x: 90, y: 70 }, { x: 300, y: 520 }, { x: 630, y: 120 }, { x: 880, y: 500 }], enemies: [{ x: 270, y: 130, r: 13, vx: 2.7, vy: 0, minX: 210, maxX: 520 }, { x: 660, y: 510, r: 13, vx: 0, vy: -2.8, minY: 240, maxY: 550 }, { x: 890, y: 100, r: 13, vx: 0, vy: 3, minY: 60, maxY: 520 }], traps: [{ x: 430, y: 100, w: 36, h: 36 }], exit: { x: 905, y: 45 } },
  { name: 'Core Lockdown', mission: 'Final sector: collect 4 assets and secure the network core.', start: { x: 40, y: 40 }, required: 4, walls: [{ x: 120, y: 0, w: 20, h: 350 }, { x: 280, y: 200, w: 20, h: 400 }, { x: 440, y: 0, w: 20, h: 330 }, { x: 600, y: 210, w: 20, h: 390 }, { x: 760, y: 0, w: 20, h: 330 }], collectibles: [{ x: 80, y: 520 }, { x: 360, y: 100 }, { x: 680, y: 500 }, { x: 890, y: 130 }], enemies: [{ x: 210, y: 520, r: 13, vx: 2.8, vy: 0, minX: 150, maxX: 420 }, { x: 520, y: 80, r: 13, vx: -2.8, vy: 0, minX: 460, maxX: 900 }, { x: 870, y: 520, r: 13, vx: 0, vy: -3.1, minY: 250, maxY: 550 }, { x: 900, y: 150, r: 13, vx: 0, vy: 3.2, minY: 80, maxY: 520 }], traps: [{ x: 330, y: 300, w: 36, h: 36 }, { x: 540, y: 110, w: 36, h: 36 }, { x: 820, y: 390, w: 36, h: 36 }], exit: { x: 900, y: 540 } }
];

const rectHit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function setScreen(name) { Object.values(screens).forEach(s => s.classList.remove('active')); screens[name].classList.add('active'); }
function tone(freq, time = 0.09) { if (muted) return; audioCtx ||= new (window.AudioContext || window.webkitAudioContext)(); const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.frequency.value = freq; o.type = 'triangle'; o.connect(g); g.connect(audioCtx.destination); g.gain.value = 0.04; o.start(); o.stop(audioCtx.currentTime + time); }
function showOverlay(title, text, btnText, onClick) { awaitingContinue = true; overlay.title.textContent = title; overlay.text.textContent = text; overlay.button.textContent = btnText; overlay.root.classList.remove('hidden'); overlay.button.onclick = () => { awaitingContinue = false; overlay.root.classList.add('hidden'); onClick(); }; }

function loadLevel() {
  const lv = levels[state.levelIndex];
  state.player = { x: lv.start.x, y: lv.start.y, w: 24, h: 24, speed: 3.2, collected: 0 };
  state.collectibles = lv.collectibles.map(c => ({ x: c.x, y: c.y, w: 16, h: 16 }));
  state.enemies = lv.enemies.map(e => ({ ...e }));
  state.traps = lv.traps.map(t => ({ ...t }));
  state.exit = { x: lv.exit.x, y: lv.exit.y, w: 34, h: 34, active: false };
  updateHud();
}

function updateHud() {
  const lv = levels[state.levelIndex];
  hud.level.textContent = state.levelIndex + 1;
  hud.levelName.textContent = lv.name;
  hud.lives.textContent = state.lives;
  hud.score.textContent = state.score;
  hud.items.textContent = `${state.player.collected}/${lv.required}`;
}

function loseLife() {
  state.lives -= 1;
  state.player.x = levels[state.levelIndex].start.x;
  state.player.y = levels[state.levelIndex].start.y;
  canvas.classList.remove('damage-flash'); void canvas.offsetWidth; canvas.classList.add('damage-flash');
  tone(160, 0.13);
  if (state.lives <= 0) {
    running = false;
    showOverlay('System Compromised', `Final Score: ${state.score}`, 'Restart', () => startGame());
  }
  updateHud();
}

function update() {
  const p = state.player;
  const lv = levels[state.levelIndex];
  const dx = ((keys.d || keys.arrowright) ? 1 : 0) - ((keys.a || keys.arrowleft) ? 1 : 0);
  const dy = ((keys.s || keys.arrowdown) ? 1 : 0) - ((keys.w || keys.arrowup) ? 1 : 0);
  const px = { ...p, x: p.x + dx * p.speed }; if (px.x >= 0 && px.x + px.w <= canvas.width && !lv.walls.some(w => rectHit(px, w))) p.x = px.x;
  const py = { ...p, y: p.y + dy * p.speed }; if (py.y >= 0 && py.y + py.h <= canvas.height && !lv.walls.some(w => rectHit(py, w))) p.y = py.y;

  state.enemies.forEach(e => {
    e.x += e.vx; e.y += e.vy;
    if (e.minX !== undefined && (e.x < e.minX || e.x > e.maxX)) e.vx *= -1;
    if (e.minY !== undefined && (e.y < e.minY || e.y > e.maxY)) e.vy *= -1;
    if (Math.hypot((p.x + 12) - e.x, (p.y + 12) - e.y) < 24) loseLife();
  });

  state.traps.forEach(t => rectHit(p, t) && loseLife());
  state.collectibles = state.collectibles.filter(c => {
    if (rectHit(p, c)) { state.player.collected += 1; state.score += 100; tone(660, 0.07); state.particles.push({ x: c.x + 8, y: c.y + 8, life: 20 }); updateHud(); return false; }
    return true;
  });

  state.particles = state.particles.filter(pt => (pt.life-- > 0));
  if (state.player.collected >= lv.required) state.exit.active = true;
  if (state.exit.active && rectHit(p, state.exit)) {
    tone(420, 0.12);
    running = false;
    if (state.levelIndex === levels.length - 1) {
      showOverlay('Network Secured', `You completed all 5 levels. Final Score: ${state.score}`, 'Play Again', () => startGame());
    } else {
      showOverlay('Level Complete', `${lv.name} secured. Prepare for next sector.`, 'Next Level', () => { state.levelIndex += 1; loadLevel(); running = true; loop(); });
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#020a14'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(30,162,255,.2)'; for (let x = 0; x < canvas.width; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); } for (let y = 0; y < canvas.height; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

  const lv = levels[state.levelIndex];
  lv.walls.forEach(w => { ctx.fillStyle = '#233a5a'; ctx.fillRect(w.x, w.y, w.w, w.h); });
  state.traps.forEach(t => { ctx.fillStyle = '#ff4e72'; ctx.beginPath(); ctx.arc(t.x + 18, t.y + 18, 16, 0, Math.PI * 2); ctx.fill(); });
  state.collectibles.forEach(c => { ctx.fillStyle = '#59ffa7'; ctx.shadowBlur = 12; ctx.shadowColor = '#59ffa7'; ctx.fillRect(c.x, c.y, c.w, c.h); ctx.shadowBlur = 0; });
  state.enemies.forEach(e => { ctx.fillStyle = '#ff4e72'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff4e72'; ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; });

  ctx.fillStyle = state.exit.active ? '#e8f26e' : '#56616d';
  ctx.shadowBlur = state.exit.active ? 16 : 0; ctx.shadowColor = '#e8f26e';
  ctx.fillRect(state.exit.x, state.exit.y, state.exit.w, state.exit.h); ctx.shadowBlur = 0;

  const p = state.player;
  ctx.fillStyle = '#1ea2ff'; ctx.shadowBlur = 14; ctx.shadowColor = '#1ea2ff';
  ctx.beginPath(); ctx.moveTo(p.x + 12, p.y); ctx.lineTo(p.x + 24, p.y + 12); ctx.lineTo(p.x + 12, p.y + 24); ctx.lineTo(p.x, p.y + 12); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
  state.particles.forEach(pt => { ctx.fillStyle = '#ffffff'; ctx.fillRect(pt.x + Math.random() * 8 - 4, pt.y + Math.random() * 8 - 4, 2, 2); });
}

function loop() { if (!running || awaitingContinue) return; update(); draw(); requestAnimationFrame(loop); }

function startGame() {
  state.levelIndex = 0; state.lives = 3; state.score = 0; state.particles = [];
  loadLevel(); setScreen('game'); running = false;
  showOverlay(`Level 1: ${levels[0].name}`, levels[0].mission, 'Begin', () => { running = true; loop(); });
}

document.getElementById('startBtn').addEventListener('click', startGame);
muteBtn.addEventListener('click', () => { muted = !muted; muteBtn.textContent = `Sound: ${muted ? 'Off' : 'On'}`; });
document.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
