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
let frame = 0;

const state = { levelIndex: 0, lives: 3, score: 0, player: null, collectibles: [], enemies: [], traps: [], particles: [], hitPulse: 0, exit: null };

const levels = [
  { name: 'Network Login', mission: 'Collect 2 security keys and reach the secure uplink.', start: { x: 42, y: 42 }, required: 2, walls: [{ x: 250, y: 80, w: 20, h: 420 }], collectibles: [{ x: 130, y: 110 }, { x: 820, y: 500 }], enemies: [{ x: 640, y: 140, r: 13, vx: 0, vy: 1.4, minY: 100, maxY: 520 }], traps: [], exit: { x: 900, y: 540 } },
  { name: 'Malware Maze', mission: 'Collect 3 patches through guarded channels.', start: { x: 35, y: 35 }, required: 3, walls: [{ x: 140, y: 60, w: 20, h: 500 }, { x: 320, y: 0, w: 20, h: 380 }, { x: 500, y: 220, w: 20, h: 380 }, { x: 680, y: 0, w: 20, h: 360 }], collectibles: [{ x: 80, y: 530 }, { x: 430, y: 110 }, { x: 860, y: 120 }], enemies: [{ x: 220, y: 470, r: 13, vx: 1.8, vy: 0, minX: 170, maxX: 620 }, { x: 860, y: 360, r: 13, vx: 0, vy: 2, minY: 80, maxY: 520 }], traps: [], exit: { x: 900, y: 40 } },
  { name: 'Phishing Storm', mission: 'Avoid trap nodes and collect 3 safe packets.', start: { x: 50, y: 520 }, required: 3, walls: [{ x: 240, y: 0, w: 20, h: 350 }, { x: 470, y: 250, w: 20, h: 350 }, { x: 720, y: 0, w: 20, h: 360 }], collectibles: [{ x: 90, y: 90 }, { x: 550, y: 100 }, { x: 860, y: 520 }], enemies: [{ x: 610, y: 520, r: 13, vx: 2.5, vy: 0, minX: 500, maxX: 900 }, { x: 860, y: 120, r: 13, vx: 0, vy: 2.6, minY: 80, maxY: 500 }], traps: [{ x: 320, y: 430, w: 36, h: 36 }, { x: 580, y: 290, w: 36, h: 36 }, { x: 780, y: 430, w: 36, h: 36 }], exit: { x: 902, y: 42 } },
  { name: 'Patch Rush', mission: 'High pressure zone: collect 4 assets quickly.', start: { x: 35, y: 300 }, required: 4, walls: [{ x: 170, y: 0, w: 20, h: 410 }, { x: 360, y: 170, w: 20, h: 430 }, { x: 560, y: 0, w: 20, h: 380 }, { x: 760, y: 180, w: 20, h: 420 }], collectibles: [{ x: 90, y: 70 }, { x: 300, y: 520 }, { x: 630, y: 120 }, { x: 880, y: 500 }], enemies: [{ x: 270, y: 130, r: 13, vx: 2.7, vy: 0, minX: 210, maxX: 520 }, { x: 660, y: 510, r: 13, vx: 0, vy: -2.8, minY: 240, maxY: 550 }, { x: 890, y: 100, r: 13, vx: 0, vy: 3, minY: 60, maxY: 520 }], traps: [{ x: 430, y: 100, w: 36, h: 36 }], exit: { x: 905, y: 45 } },
  { name: 'Core Lockdown', mission: 'Final sector: collect 4 assets and secure the network core.', start: { x: 40, y: 40 }, required: 4, walls: [{ x: 120, y: 0, w: 20, h: 350 }, { x: 280, y: 200, w: 20, h: 400 }, { x: 440, y: 0, w: 20, h: 330 }, { x: 600, y: 210, w: 20, h: 390 }, { x: 760, y: 0, w: 20, h: 330 }], collectibles: [{ x: 80, y: 520 }, { x: 360, y: 100 }, { x: 680, y: 500 }, { x: 890, y: 130 }], enemies: [{ x: 210, y: 520, r: 13, vx: 2.8, vy: 0, minX: 150, maxX: 420 }, { x: 520, y: 80, r: 13, vx: -2.8, vy: 0, minX: 460, maxX: 900 }, { x: 870, y: 520, r: 13, vx: 0, vy: -3.1, minY: 250, maxY: 550 }, { x: 900, y: 150, r: 13, vx: 0, vy: 3.2, minY: 80, maxY: 520 }], traps: [{ x: 330, y: 300, w: 36, h: 36 }, { x: 540, y: 110, w: 36, h: 36 }, { x: 820, y: 390, w: 36, h: 36 }], exit: { x: 900, y: 540 } }
];

const rectHit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function setScreen(name) { Object.values(screens).forEach(s => s.classList.remove('active')); screens[name].classList.add('active'); }
function tone(freq, time = 0.09) { if (muted) return; audioCtx ||= new (window.AudioContext || window.webkitAudioContext)(); const o = audioCtx.createOscillator(); const g = audioCtx.createGain(); o.frequency.value = freq; o.type = 'triangle'; o.connect(g); g.connect(audioCtx.destination); g.gain.value = 0.04; o.start(); o.stop(audioCtx.currentTime + time); }
function showOverlay(title, text, btnText, onClick) { awaitingContinue = true; overlay.title.textContent = title; overlay.text.textContent = text; overlay.button.textContent = btnText; overlay.root.classList.remove('hidden'); overlay.button.onclick = () => { awaitingContinue = false; overlay.root.classList.add('hidden'); onClick(); }; }

function spawnPickupBurst(x, y, color) {
  for (let i = 0; i < 18; i += 1) {
    const a = (Math.PI * 2 * i) / 18;
    state.particles.push({ x, y, vx: Math.cos(a) * (1 + Math.random() * 2), vy: Math.sin(a) * (1 + Math.random() * 2), life: 28, color, size: 2 + Math.random() * 2 });
  }
}

function loadLevel() {
  const lv = levels[state.levelIndex];
  state.player = { x: lv.start.x, y: lv.start.y, w: 24, h: 24, speed: 3.2, collected: 0 };
  state.collectibles = lv.collectibles.map(c => ({ x: c.x, y: c.y, w: 16, h: 16, type: Math.random() > 0.5 ? 'chip' : 'key' }));
  state.enemies = lv.enemies.map(e => ({ ...e }));
  state.traps = lv.traps.map(t => ({ ...t }));
  state.exit = { x: lv.exit.x, y: lv.exit.y, w: 34, h: 34, active: false };
  updateHud();
}

function updateHud() {
  const lv = levels[state.levelIndex];
  hud.level.textContent = state.levelIndex + 1;
  hud.levelName.textContent = `${lv.name} — ${lv.mission}`;
  hud.lives.textContent = '❤'.repeat(state.lives).padEnd(3, '·');
  hud.score.textContent = state.score;
  hud.items.textContent = `${state.player.collected}/${lv.required}`;
}

function loseLife() {
  state.lives -= 1;
  state.player.x = levels[state.levelIndex].start.x;
  state.player.y = levels[state.levelIndex].start.y;
  state.hitPulse = 16;
  canvas.classList.remove('damage-flash'); void canvas.offsetWidth; canvas.classList.add('damage-flash');
  tone(160, 0.13);
  if (state.lives <= 0) {
    running = false;
    showOverlay('System Compromised', `Threats overran the firewall. Final Score: ${state.score}.`, 'Restart Defense', () => startGame());
  }
  updateHud();
}

function update() {
  frame += 1;
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
    if (rectHit(p, c)) { state.player.collected += 1; state.score += 100; tone(660, 0.07); spawnPickupBurst(c.x + 8, c.y + 8, '#63ffb2'); updateHud(); return false; }
    return true;
  });

  state.particles = state.particles.filter(pt => {
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.vx *= 0.96;
    pt.vy *= 0.96;
    pt.life -= 1;
    return pt.life > 0;
  });
  if (state.hitPulse > 0) state.hitPulse -= 1;

  if (state.player.collected >= lv.required) state.exit.active = true;
  if (state.exit.active && rectHit(p, state.exit)) {
    tone(420, 0.12);
    running = false;
    if (state.levelIndex === levels.length - 1) {
      showOverlay('Network Secured // Victory', `All 5 levels secured. Final Score: ${state.score}. The campus core is stable.`, 'Play Again', () => startGame());
    } else {
      showOverlay(`Level ${state.levelIndex + 1} Complete`, `${lv.name} secured. Proceed to Level ${state.levelIndex + 2}.`, 'Next Level', () => {
        state.levelIndex += 1;
        loadLevel();
        running = false;
        showOverlay(`Level ${state.levelIndex + 1}: ${levels[state.levelIndex].name}`, levels[state.levelIndex].mission, 'Begin', () => { running = true; loop(); });
      });
    }
  }
}

function drawCollectible(c) {
  const pulse = Math.sin(frame * 0.08 + c.x) * 0.5 + 0.5;
  ctx.save();
  ctx.translate(c.x + 8, c.y + 8);
  ctx.shadowBlur = 12 + pulse * 8;
  ctx.shadowColor = '#63ffb2';
  if (c.type === 'chip') {
    ctx.fillStyle = '#63ffb2';
    ctx.fillRect(-8, -8, 16, 16);
    ctx.strokeStyle = '#d5ffea';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-6, -6, 12, 12);
  } else {
    ctx.strokeStyle = '#7ef7ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-3, -1, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#7ef7ff';
    ctx.fillRect(1, -2, 8, 4);
    ctx.fillRect(7, -5, 2, 3);
  }
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#020a14'; ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(57,181,255,.18)';
  for (let x = 0; x < canvas.width; x += 32) { ctx.beginPath(); ctx.moveTo(x + (frame % 32), 0); ctx.lineTo(x + (frame % 32), canvas.height); ctx.stroke(); }
  for (let y = 0; y < canvas.height; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

  const lv = levels[state.levelIndex];
  lv.walls.forEach(w => { ctx.fillStyle = '#1f3554'; ctx.fillRect(w.x, w.y, w.w, w.h); ctx.fillStyle = 'rgba(99,255,178,.18)'; ctx.fillRect(w.x + 6, w.y, 2, w.h); });
  state.traps.forEach(t => { ctx.strokeStyle = '#ff4f74'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(t.x + 18, t.y + 18, 15, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(t.x + 8, t.y + 8); ctx.lineTo(t.x + 28, t.y + 28); ctx.moveTo(t.x + 28, t.y + 8); ctx.lineTo(t.x + 8, t.y + 28); ctx.stroke(); });
  state.collectibles.forEach(drawCollectible);

  state.enemies.forEach(e => {
    const pulse = Math.sin(frame * 0.1 + e.x) * 0.5 + 0.5;
    ctx.save();
    ctx.fillStyle = '#ff4f74';
    ctx.shadowBlur = 12 + pulse * 8;
    ctx.shadowColor = '#ff4f74';
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffc0cd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(e.x - 5, e.y - 5);
    ctx.lineTo(e.x + 5, e.y + 5);
    ctx.moveTo(e.x + 5, e.y - 5);
    ctx.lineTo(e.x - 5, e.y + 5);
    ctx.stroke();
    ctx.restore();
  });

  ctx.save();
  ctx.translate(state.exit.x + 17, state.exit.y + 17);
  if (state.exit.active) {
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#f4ff74';
    ctx.fillStyle = '#d5ff66';
    ctx.fillRect(-16, -16, 32, 32);
    ctx.fillStyle = '#25330c';
    ctx.fillRect(-4, -4, 8, 8);
  } else {
    ctx.fillStyle = '#4b5668';
    ctx.fillRect(-16, -16, 32, 32);
    ctx.strokeStyle = '#9fa8b6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -2, 7, Math.PI, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  const p = state.player;
  const pulse = Math.sin(frame * 0.15) * 0.5 + 0.5;
  ctx.save();
  ctx.translate(p.x + 12, p.y + 12);
  ctx.shadowBlur = 12 + pulse * 7;
  ctx.shadowColor = '#39b5ff';
  ctx.fillStyle = '#39b5ff';
  ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(11, -3); ctx.lineTo(8, 10); ctx.lineTo(0, 13); ctx.lineTo(-8, 10); ctx.lineTo(-11, -3); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#d8f2ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.moveTo(-5, 0); ctx.lineTo(5, 0); ctx.stroke();
  ctx.restore();

  state.particles.forEach(pt => { ctx.fillStyle = pt.color; ctx.globalAlpha = pt.life / 28; ctx.fillRect(pt.x, pt.y, pt.size, pt.size); });
  ctx.globalAlpha = 1;

  if (state.hitPulse > 0) {
    ctx.fillStyle = `rgba(255,79,116,${state.hitPulse / 40})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function loop() { if (!running || awaitingContinue) return; update(); draw(); requestAnimationFrame(loop); }

function startGame() {
  state.levelIndex = 0; state.lives = 3; state.score = 0; state.particles = []; state.hitPulse = 0;
  loadLevel(); setScreen('game'); running = false;
  showOverlay(`Level 1: ${levels[0].name}`, `Objective: ${levels[0].mission}`, 'Begin', () => { running = true; loop(); });
}

document.getElementById('startBtn').addEventListener('click', startGame);
muteBtn.addEventListener('click', () => { muted = !muted; muteBtn.textContent = `Sound: ${muted ? 'Off' : 'On'}`; });
document.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
