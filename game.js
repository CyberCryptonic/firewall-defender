const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const screens = {
  start: document.getElementById('startScreen'),
  game: document.getElementById('gameScreen'),
  over: document.getElementById('gameOverScreen'),
  win: document.getElementById('winScreen')
};

const hud = {
  level: document.getElementById('hudLevel'),
  lives: document.getElementById('hudLives'),
  score: document.getElementById('hudScore'),
  items: document.getElementById('hudItems')
};

const ui = {
  levelName: document.getElementById('levelName'),
  levelDesc: document.getElementById('levelDesc'),
  message: document.getElementById('messageBox'),
  gameOverScore: document.getElementById('gameOverScore'),
  winScore: document.getElementById('winScore')
};

const keys = {};
let lives = 3, score = 0, levelIndex = 0;
let player, enemies, traps, collectibles, exit, particles;
let running = false;

const levels = [
  { name: '1. Network Login', desc: 'Collect 2 security keys and access the first server.', required: 2,
    walls: [{x:200,y:120,w:20,h:220},{x:420,y:60,w:20,h:300}],
    enemies:[{x:620,y:180,w:24,h:24,vx:0,vy:1.4,minY:100,maxY:460}],
    traps:[] },
  { name: '2. Malware Maze', desc: 'Maze defenses are up. Gather 3 patches safely.', required: 3,
    walls:[{x:120,y:80,w:20,h:350},{x:260,y:0,w:20,h:330},{x:400,y:140,w:20,h:420},{x:560,y:0,w:20,h:300}],
    enemies:[{x:700,y:130,w:24,h:24,vx:0,vy:2,minY:80,maxY:500},{x:330,y:480,w:24,h:24,vx:2,vy:0,minX:300,maxX:520}],
    traps:[] },
  { name: '3. Phishing Storm', desc: 'Fast malware and phishing traps detected.', required: 3,
    walls:[{x:180,y:120,w:20,h:360},{x:360,y:0,w:20,h:300},{x:540,y:200,w:20,h:360}],
    enemies:[{x:700,y:100,w:24,h:24,vx:0,vy:2.6,minY:70,maxY:500},{x:450,y:300,w:24,h:24,vx:2.4,vy:0,minX:380,maxX:760}],
    traps:[{x:290,y:390,w:38,h:38},{x:630,y:160,w:38,h:38}] },
  { name: '4. Patch Rush', desc: 'Pressure rising. Grab patches with precise movement.', required: 4,
    walls:[{x:140,y:70,w:20,h:400},{x:300,y:180,w:20,h:380},{x:460,y:0,w:20,h:330},{x:620,y:190,w:20,h:370}],
    enemies:[{x:760,y:80,w:24,h:24,vx:0,vy:2.8,minY:70,maxY:500},{x:390,y:510,w:24,h:24,vx:2.6,vy:0,minX:340,maxX:780},{x:690,y:430,w:24,h:24,vx:-2.1,vy:0,minX:500,maxX:790}],
    traps:[] },
  { name: '5. Final Breach', desc: 'Final zone: maximum threat. Secure the core server.', required: 4,
    walls:[{x:110,y:0,w:20,h:300},{x:250,y:170,w:20,h:390},{x:390,y:0,w:20,h:300},{x:530,y:170,w:20,h:390},{x:670,y:0,w:20,h:300}],
    enemies:[{x:760,y:80,w:24,h:24,vx:0,vy:3,minY:70,maxY:500},{x:340,y:520,w:24,h:24,vx:2.8,vy:0,minX:280,maxX:800},{x:520,y:80,w:24,h:24,vx:-2.6,vy:0,minX:420,maxX:800},{x:700,y:500,w:24,h:24,vx:0,vy:-2.5,minY:250,maxY:530}],
    traps:[{x:320,y:120,w:42,h:42},{x:600,y:390,w:42,h:42}] }
];

function switchScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

function createLevel() {
  const lv = levels[levelIndex];
  player = {x:40,y:40,w:24,h:24,speed:3.2,collected:0};
  enemies = lv.enemies.map(e => ({...e}));
  traps = lv.traps.map(t => ({...t}));
  collectibles = spawnCollectibles(lv.required);
  exit = {x:780,y:500,w:38,h:38,active:false};
  particles = [];
  ui.levelName.textContent = lv.name;
  ui.levelDesc.textContent = lv.desc;
  showMessage('Collect all security items before server access.');
  updateHud();
}

function spawnCollectibles(count) {
  const arr = [];
  while (arr.length < count) {
    const item = {x: rand(80,760), y: rand(80,500), w:16,h:16};
    const blocked = levels[levelIndex].walls.some(w => rect(item,w));
    if (!blocked) arr.push(item);
  }
  return arr;
}

function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function rect(a,b){ return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }

function update() {
  const dx = (keys['arrowright']||keys['d']?1:0) - (keys['arrowleft']||keys['a']?1:0);
  const dy = (keys['arrowdown']||keys['s']?1:0) - (keys['arrowup']||keys['w']?1:0);
  movePlayer(dx, dy);

  enemies.forEach(e => {
    e.x += e.vx; e.y += e.vy;
    if (e.minX !== undefined && (e.x < e.minX || e.x > e.maxX)) e.vx *= -1;
    if (e.minY !== undefined && (e.y < e.minY || e.y > e.maxY)) e.vy *= -1;
    if (rect(player,e)) onHit();
  });

  traps.forEach(t => { if (rect(player,t)) onHit(); });

  collectibles = collectibles.filter(c => {
    if (rect(player,c)) {
      player.collected++; score += 100;
      burst(c.x + c.w/2, c.y + c.h/2, '#49ff9d');
      updateHud();
      return false;
    }
    return true;
  });

  if (player.collected >= levels[levelIndex].required) exit.active = true;
  if (exit.active && rect(player, exit)) nextLevel();

  particles = particles.filter(p => (p.life-- > 0));
  particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.02; });
}

function movePlayer(dx,dy){
  if (!dx && !dy) return;
  const nx = {...player, x: player.x + dx * player.speed};
  if (inBounds(nx) && !hitWall(nx)) player.x = nx.x;
  const ny = {...player, y: player.y + dy * player.speed};
  if (inBounds(ny) && !hitWall(ny)) player.y = ny.y;
}
function hitWall(obj){ return levels[levelIndex].walls.some(w => rect(obj,w)); }
function inBounds(o){ return o.x>=0 && o.y>=0 && o.x+o.w<=canvas.width && o.y+o.h<=canvas.height; }

function onHit() {
  lives--;
  player.x = 40; player.y = 40;
  canvas.classList.remove('warning-flash');
  void canvas.offsetWidth;
  canvas.classList.add('warning-flash');
  showMessage('Warning: Malware impact! Life lost.');
  updateHud();
  if (lives <= 0) endGame();
}

function nextLevel() {
  levelIndex++;
  if (levelIndex >= levels.length) return winGame();
  showMessage('Zone secured. Redirecting to next network segment...');
  setTimeout(createLevel, 1100);
}

function showMessage(msg){ ui.message.textContent = msg; }
function burst(x,y,color){ for(let i=0;i<10;i++) particles.push({x,y,vx:(Math.random()-0.5)*2.5,vy:(Math.random()-0.5)*2.5,life:24,color}); }

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawGrid();
  levels[levelIndex].walls.forEach(w => drawRect(w,'#223a5b'));
  drawRect(player, '#1aa9ff');
  enemies.forEach(e => drawRect(e, '#ff3a57'));
  traps.forEach(t => drawRect(t, '#b31e32'));
  collectibles.forEach(c => drawRect(c, levelIndex === 2 ? '#1aa9ff' : '#49ff9d'));
  drawRect(exit, exit.active ? '#ffd54a' : '#556270', exit.active ? 18 : 0);
  particles.forEach(p => { ctx.fillStyle = p.color; ctx.fillRect(p.x,p.y,3,3); });
}

function drawRect(r,color,glow=0){
  ctx.save();
  ctx.fillStyle = color;
  if (glow) { ctx.shadowBlur = glow; ctx.shadowColor = color; }
  ctx.fillRect(r.x,r.y,r.w,r.h);
  ctx.restore();
}
function drawGrid(){
  ctx.fillStyle = '#06101d'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = 'rgba(58,97,140,.26)'; ctx.lineWidth = 1;
  for(let x=0;x<canvas.width;x+=28){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
  for(let y=0;y<canvas.height;y+=28){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }
}

function updateHud(){
  hud.level.textContent = levelIndex + 1;
  hud.lives.textContent = lives;
  hud.score.textContent = score;
  hud.items.textContent = `${player.collected}/${levels[levelIndex].required}`;
}

function endGame(){
  running = false;
  ui.gameOverScore.textContent = score;
  switchScreen('over');
}
function winGame(){
  running = false;
  ui.winScore.textContent = score;
  switchScreen('win');
}

function gameLoop(){
  if (!running) return;
  update(); draw();
  requestAnimationFrame(gameLoop);
}

function startGame(){
  lives = 3; score = 0; levelIndex = 0;
  createLevel();
  switchScreen('game');
  running = true;
  requestAnimationFrame(gameLoop);
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);
document.getElementById('playAgainBtn').addEventListener('click', startGame);
document.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
