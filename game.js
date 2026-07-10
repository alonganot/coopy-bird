const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const GRAVITY = 0.5, JUMP = -9, PIPE_W = 58, GAP = 160, SPEED = 3;
const DASH_SPEED_MULTIPLIER = 4.5;

// --- Shop items ---
const SHOP_COLORS = [
  { id: 'yellow',  label: 'Classic',   price: 0,   body: '#f9ca24', wing: '#f0932b', glow: '#f9ca2488', free: true },
  { id: 'sky',     label: 'Sky',       price: 10,  body: '#74b9ff', wing: '#0984e3', glow: '#74b9ff88' },
  { id: 'rose',    label: 'Rose',      price: 20,  body: '#fd79a8', wing: '#e84393', glow: '#fd79a888' },
  { id: 'mint',    label: 'Mint',      price: 30,  body: '#55efc4', wing: '#00b894', glow: '#55efc488' },
  { id: 'fire',    label: 'Fire',      price: 50,  body: '#ff7675', wing: '#d63031', glow: '#ff767588' },
  { id: 'purple',  label: 'Royal',     price: 75,  body: '#a29bfe', wing: '#6c5ce7', glow: '#a29bfe88' },
  { id: 'gold',    label: 'Gold',      price: 100, body: '#ffeaa7', wing: '#fdcb6e', glow: '#ffeaa788' },
  { id: 'legendary', label: 'Legendary', price: 6767, body: '#0f0f0f', wing: '#e84393', glow: '#e8439388' },
];

const SHOP_PIPES = [
  { id: 'default', label: 'Neon Tube', price: 0, free: true, capStyle: 'straight',
    barrelColors: [[0, '#0a2a1a'], [0.3, '#0d4a2a'], [0.6, '#12603a'], [1, '#082015']],
    capColors: [[0, '#0a3520'], [0.4, '#1a7040'], [1, '#091a10']],
    stripeColor: '#00ffa0', scanlineColor: '#00ff88',
    barrelGlow: '0,255,160', capGlow: '0,255,140', edgeGlow: '0,255,180',
    capH: 22, overhang: 5 },
  { id: 'hazard', label: 'Hazard Stripe', price: 300, capStyle: 'hazard-stripe',
    barrelColors: [[0, '#1a1a05'], [0.3, '#332b00'], [0.6, '#4d3d00'], [1, '#0d0d00']],
    capColors: [[0, '#332b00'], [0.4, '#665500'], [1, '#1a1500']],
    stripeColor: '#ffcc00', scanlineColor: '#ffdd44',
    barrelGlow: '255,204,0', capGlow: '255,180,0', edgeGlow: '255,220,80',
    capH: 22, overhang: 5 },
  { id: 'gilded', label: 'Gilded Column', price: 600, capStyle: 'rounded',
    barrelColors: [[0, '#3a2a05'], [0.3, '#6b4a10'], [0.6, '#8a6a20'], [1, '#2a1c05']],
    capColors: [[0, '#4a3510'], [0.4, '#c9a227'], [1, '#2a1c05']],
    stripeColor: '#ffe08a', scanlineColor: '#ffd766',
    barrelGlow: '255,215,120', capGlow: '255,200,80', edgeGlow: '255,230,160',
    capH: 24, overhang: 6 },
  { id: 'sludge', label: 'Toxic Sludge', price: 1000, capStyle: 'diamond-notch',
    barrelColors: [[0, '#1a2a05'], [0.3, '#3d5a0a'], [0.6, '#5a7a10'], [1, '#0d1502']],
    capColors: [[0, '#2a3a05'], [0.4, '#7a9a1a'], [1, '#141d03']],
    stripeColor: '#c8ff4d', scanlineColor: '#aaff33',
    barrelGlow: '180,255,60', capGlow: '160,255,40', edgeGlow: '200,255,100',
    capH: 22, overhang: 5 },
  { id: 'void', label: 'Void Ring', price: 1500, capStyle: 'ringed-segments',
    barrelColors: [[0, '#1a0a2a'], [0.3, '#3a1050'], [0.6, '#5a1a70'], [1, '#100518']],
    capColors: [[0, '#2a0a3a'], [0.4, '#7a2a9a'], [1, '#180520']],
    stripeColor: '#e070ff', scanlineColor: '#c040ff',
    barrelGlow: '200,80,255', capGlow: '180,60,255', edgeGlow: '220,120,255',
    capH: 26, overhang: 5 },
  { id: 'prism', label: 'Prism Spike', price: 2000, capStyle: 'crystal-spike',
    barrelColors: [[0, '#0a2530'], [0.3, '#154a5f'], [0.6, '#1f6a85'], [1, '#05161c']],
    capColors: [[0, '#154050'], [0.4, '#4fd8ff'], [1, '#0a1f28']],
    stripeColor: '#c8f8ff', scanlineColor: '#8ff0ff',
    barrelGlow: '150,240,255', capGlow: '120,220,255', edgeGlow: '200,250,255',
    capH: 22, overhang: 5 },
];

const SHOP_BACKGROUNDS = [
  { id: 'default', label: 'Synthwave', price: 0, free: true,
    sky: [[0, '#010818'], [0.5, '#020d2e'], [1, '#050520']],
    floor: { top: '#00f7ff33', bottom: '#00050a' },
    horizon: '#00f7ff', grid: '#00f7ff',
    decor: { kind: 'stars', color: '#ffffff', count: 80 }, glowAccent: null },
  { id: 'jungle', label: 'Jungle Canopy', price: 300,
    sky: [[0, '#03130a'], [0.55, '#0c3018'], [1, '#1a3a12']],
    floor: { top: '#2f5c1a55', bottom: '#0a1a06' },
    horizon: '#8fd14f', grid: '#5a8f3a',
    decor: { kind: 'fireflies', color: '#ffe066', count: 40 }, glowAccent: null },
  { id: 'ocean', label: 'Deep Ocean', price: 700,
    sky: [[0, '#0a3a55'], [0.5, '#052a44'], [1, '#01121f']],
    floor: { top: '#c9a24744', bottom: '#4a3a1a' },
    horizon: '#4fd0ff', grid: '#2a8fc0',
    decor: { kind: 'bubbles', color: '#bfefff', count: 50 }, glowAccent: null },
  { id: 'desert', label: 'Dune Storm', price: 1100,
    sky: [[0, '#e8a35c'], [0.5, '#c97a3a'], [1, '#7a4a1a']],
    floor: { top: '#d9a95c66', bottom: '#5a3a12' },
    horizon: '#ffb347', grid: '#c9822f',
    decor: { kind: 'sandhaze', color: '#e8c98a', count: 30 },
    glowAccent: { x: 300, y: 80, r: 55, color: '#fff6d0' } },
  { id: 'snow', label: 'Frostbound', price: 1600,
    sky: [[0, '#0d1a2e'], [0.5, '#1c2f4a'], [1, '#3a4f66']],
    floor: { top: '#dce8f055', bottom: '#e8f0f5' },
    horizon: '#cfe8ff', grid: '#9fc8e8',
    decor: { kind: 'snowflakes', color: '#ffffff', count: 70 }, glowAccent: null },
  { id: 'volcano', label: 'Volcano Ash', price: 2000,
    sky: [[0, '#0a0505'], [0.5, '#1a0808'], [1, '#3a0f0a']],
    floor: { top: '#ff5a1f66', bottom: '#1a0503' },
    horizon: '#ff5a1f', grid: '#8a2a12',
    decor: { kind: 'embers', color: '#ff8a3a', count: 35 },
    glowAccent: { x: 200, y: 560, r: 90, color: '#ff5a1f' } },
];

const SHOP_TABS = [
  { id: 'colors', label: 'COLORS' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'pipes', label: 'PIPES' },
  { id: 'bg', label: 'SCENE' },
];

// --- Persistence ---
function loadData() {
  try { return JSON.parse(localStorage.getItem('flappyData')) || {}; } catch { return {}; }
}
function migrateData(d) {
  if (!d.totalCoins) d.totalCoins = 0;
  if (!d.highScores) d.highScores = [];
  if (!d.unlockedColors) d.unlockedColors = ['yellow'];
  if (!d.activeColor) d.activeColor = 'yellow';
  if (!d.unlockedPipes) d.unlockedPipes = ['default'];
  if (!d.activePipe) d.activePipe = 'default';
  if (!d.unlockedBackgrounds) d.unlockedBackgrounds = ['default'];
  if (!d.activeBackground) d.activeBackground = 'default';
  migrateSkillData(d);
  return d;
}
function saveData() { localStorage.setItem('flappyData', JSON.stringify(gameData)); }

let gameData = migrateData(loadData());
let bird, pipes, frame, score, state, particles, projectiles, decor, gridOffset;
let shopState = null;
let shopTab = 'colors';
let tick = 0, glitchTimer = 150, glitchActive = false, isNewBest = false;

// --- Background decor particles ---
function makeDecor() {
  const n = getActiveBackgroundItem().decor.count || 80;
  decor = Array.from({ length: n }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 1.5 + 0.3,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.3 + 0.05
  }));
}

function init() {
  bird = { x: 80, y: H / 2, vy: 0, r: 18, thrustAnim: 0 };
  pipes = [];
  particles = [];
  projectiles = [];
  frame = 0;
  score = 0;
  state = 'idle';
  gridOffset = 0;
  initSkillState();
  glitchTimer = 150;
  glitchActive = false;
  if (!decor) makeDecor();
}

function getActiveColorItem() {
  return SHOP_COLORS.find(c => c.id === gameData.activeColor) || SHOP_COLORS[0];
}
function getActivePipeItem() {
  return SHOP_PIPES.find(p => p.id === gameData.activePipe) || SHOP_PIPES[0];
}
function getActiveBackgroundItem() {
  return SHOP_BACKGROUNDS.find(b => b.id === gameData.activeBackground) || SHOP_BACKGROUNDS[0];
}

function purchaseOrEquip(item, unlockedList, activeKey) {
  if (unlockedList.includes(item.id)) { gameData[activeKey] = item.id; saveData(); return true; }
  if (gameData.totalCoins >= item.price) {
    gameData.totalCoins -= item.price;
    unlockedList.push(item.id);
    gameData[activeKey] = item.id;
    saveData();
    return true;
  }
  shopMessage = 'NOT ENOUGH COINS';
  shopMessageTimer = 90;
  return false;
}

function spawnPipeBreakParticles(p) {
  const cx = p.x + PIPE_W / 2;
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 2 + Math.random() * 5;
    particles.push({ x: cx, y: bird.y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 1, life: 1, type: 'debris', color: '#00ff88' });
  }
  // Flash shards
  for (let i = 0; i < 8; i++) {
    particles.push({ x: cx, y: p.topH / 2, vx: (Math.random() - 0.5) * 4, vy: Math.random() * 3, life: 1, type: 'spark', color: '#aaffcc' });
    particles.push({ x: cx, y: p.topH + GAP + (H - p.topH - GAP) / 2, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 3, life: 1, type: 'spark', color: '#aaffcc' });
  }
}

function onScore() {
  score++;
  gameData.totalCoins += (clone && clone.alive) ? 2 : 1;
  saveData();
  SHOP_SKILLS.forEach(s => {
    if (isSkillEquipped(s.id) && score % s.chargeThreshold === 0) skillCharges[s.id]++;
  });
  const col = getActiveColorItem();
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 / 12) * i;
    particles.push({ x: bird.x, y: bird.y, vx: Math.cos(angle) * 3.5, vy: Math.sin(angle) * 3.5, life: 1, type: 'spark', color: col.body });
  }
  particles.push({ x: bird.x, y: bird.y - 20, vy: -1.5, life: 1, type: 'text' });
}

function onDeath() {
  if (state === 'dead') return;
  state = 'dead';
  const prevBest = gameData.highScores[0] !== undefined ? gameData.highScores[0] : -1;
  gameData.highScores.push(score);
  gameData.highScores.sort((a, b) => b - a);
  gameData.highScores = gameData.highScores.slice(0, 5);
  isNewBest = score > 0 && score > prevBest;
  saveData();
  for (let i = 0; i < 24; i++) {
    const angle = (Math.PI * 2 / 24) * i;
    const spd = 2 + Math.random() * 4;
    particles.push({ x: bird.x, y: bird.y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 2, life: 1, type: 'debris', color: getActiveColorItem().body });
  }
}

function jump() {
  if (state === 'dead') { init(); return; }
  if (state === 'idle') state = 'play';
  bird.vy = JUMP;
  bird.thrustAnim = 1;
  mirrorCloneJump();
}

const SKILL_SLOT_KEYS = { Digit1: 0, Digit2: 1, Digit3: 2 };

document.addEventListener('keydown', e => {
  if (shopState) return;
  if (e.code === 'Space') jump();
  const slot = SKILL_SLOT_KEYS[e.code];
  if (slot === undefined) return;
  const id = gameData.equippedOrder[slot];
  if (!id) return;
  if (id === 'hover') startHover(); else activateSkill(id);
});
document.addEventListener('keyup', e => {
  const slot = SKILL_SLOT_KEYS[e.code];
  if (slot === undefined) return;
  const id = gameData.equippedOrder[slot];
  if (id === 'hover') stopHover();
});

function handleCanvasClick(mx, my) {
  if (shopState === 'shop') { handleShopClick(mx, my); return; }
  if (state === 'idle' && mx >= W / 2 - 50 && mx <= W / 2 + 50 && my >= H / 2 + 38 && my <= H / 2 + 68) {
    shopState = 'shop'; return;
  }
  jump();
}
canvas.addEventListener('click', e => { const r = canvas.getBoundingClientRect(); handleCanvasClick(e.clientX - r.left, e.clientY - r.top); });
canvas.addEventListener('touchstart', e => { e.preventDefault(); const r = canvas.getBoundingClientRect(), t = e.touches[0]; handleCanvasClick(t.clientX - r.left, t.clientY - r.top); }, { passive: false });

function spawnPipe() {
  const topH = 80 + Math.random() * (H - GAP - 160);
  pipes.push({ x: W, topH, passed: false, glowPhase: Math.random() * Math.PI * 2 });
}

// ===================== DRAW =====================

function drawBg() {
  const theme = getActiveBackgroundItem();
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  theme.sky.forEach(([pos, color]) => sky.addColorStop(pos, color));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  if (theme.glowAccent) {
    const ga = theme.glowAccent;
    const gg = ctx.createRadialGradient(ga.x, ga.y, 0, ga.x, ga.y, ga.r);
    gg.addColorStop(0, ga.color);
    gg.addColorStop(1, 'transparent');
    ctx.save();
    ctx.fillStyle = gg;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  const floorY = H - 50;
  decor.forEach(s => {
    s.phase += 0.04;
    ctx.save();
    switch (theme.decor.kind) {
      case 'fireflies': {
        ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(s.phase));
        ctx.shadowBlur = 8; ctx.shadowColor = theme.decor.color;
        ctx.fillStyle = theme.decor.color;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        if (state === 'play') s.y += Math.sin(s.phase) * 0.3;
        if (s.x < 0) { s.x = W; s.y = Math.random() * H; }
        break;
      }
      case 'bubbles': {
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = theme.decor.color;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.stroke();
        if (state === 'play') { s.y -= s.speed; s.x += Math.sin(s.phase) * 0.3; }
        if (s.y < 0) { s.y = floorY; s.x = Math.random() * W; }
        break;
      }
      case 'sandhaze': {
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = theme.decor.color;
        ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r * 3, s.r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
        if (state === 'play') s.x -= s.speed;
        if (s.x < 0) { s.x = W; s.y = Math.random() * H; }
        break;
      }
      case 'snowflakes': {
        ctx.globalAlpha = 0.7 + 0.3 * Math.sin(s.phase);
        ctx.fillStyle = theme.decor.color;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        if (state === 'play') { s.y += s.speed; s.x += Math.sin(s.phase) * 0.4; }
        if (s.y > floorY) { s.y = 0; s.x = Math.random() * W; }
        break;
      }
      case 'embers': {
        ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(s.phase));
        ctx.shadowBlur = 6; ctx.shadowColor = theme.decor.color;
        ctx.fillStyle = theme.decor.color;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        if (state === 'play') { s.y -= s.speed; s.x += Math.sin(s.phase) * 0.2; }
        if (s.y < 0) { s.y = floorY; s.x = Math.random() * W; }
        break;
      }
      default: { // 'stars'
        ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(s.phase));
        ctx.fillStyle = theme.decor.color;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        if (state === 'play') s.x -= s.speed;
        if (s.x < 0) { s.x = W; s.y = Math.random() * H; }
      }
    }
    ctx.restore();
  });

  ctx.save();
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const y = floorY + t * 55;
    ctx.globalAlpha = 0.08 + t * 0.14;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.globalAlpha = 0.10;
  const vp = W / 2;
  if (state === 'play') gridOffset = (gridOffset + SPEED) % 40;
  for (let x = -gridOffset; x < W + 40; x += 40) {
    ctx.beginPath();
    ctx.moveTo(vp + (x - vp) * 0.05, floorY);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  ctx.restore();

  const floorGrad = ctx.createLinearGradient(0, floorY, 0, H);
  floorGrad.addColorStop(0, theme.floor.top);
  floorGrad.addColorStop(1, theme.floor.bottom);
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, floorY, W, H - floorY);

  ctx.save();
  ctx.shadowBlur = 12;
  ctx.shadowColor = theme.horizon;
  ctx.strokeStyle = theme.horizon + 'cc';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, floorY); ctx.lineTo(W, floorY); ctx.stroke();
  ctx.restore();
}

function drawPipe(p) {
  ctx.save();
  if (p.sinking) ctx.globalAlpha = Math.max(0, p.sinkTimer / p.sinkDuration);
  p.glowPhase = (p.glowPhase || 0) + 0.04;
  const glow = 0.5 + 0.5 * Math.sin(p.glowPhase);
  const botY = p.topH + GAP;
  const item = getActivePipeItem();
  const capH = item.capH, overhang = item.overhang;

  function drawBarrel(x, y, w, h) {
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    item.barrelColors.forEach(([pos, color]) => g.addColorStop(pos, color));
    ctx.fillStyle = g;
    ctx.strokeStyle = `rgba(${item.barrelGlow},${0.3 + glow * 0.4})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke();
    ctx.save();
    ctx.globalAlpha = 0.15 + glow * 0.1;
    ctx.fillStyle = item.stripeColor;
    ctx.fillRect(x + 2, y, 4, h);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.07;
    for (let ly = y; ly < y + h; ly += 8) {
      ctx.fillStyle = item.scanlineColor;
      ctx.fillRect(x, ly, w, 1);
    }
    ctx.restore();
  }

  function drawCap(x, y, ch, flip) {
    const capX = x - overhang, capW = PIPE_W + overhang * 2;
    ctx.save();
    ctx.shadowBlur = 10 + glow * 12;
    ctx.shadowColor = `rgba(${item.capGlow},${0.4 + glow * 0.4})`;

    const g = ctx.createLinearGradient(capX, 0, capX + capW, 0);
    item.capColors.forEach(([pos, color]) => g.addColorStop(pos, color));
    ctx.fillStyle = g;
    ctx.strokeStyle = `rgba(${item.capGlow},${0.5 + glow * 0.4})`;
    ctx.lineWidth = 1.5;

    switch (item.capStyle) {
      case 'rounded':
        ctx.beginPath(); ctx.roundRect(capX, y, capW, ch, 10); ctx.fill(); ctx.stroke();
        break;
      case 'ringed-segments': {
        const segH = (ch - 4) / 3;
        for (let s = 0; s < 3; s++) {
          const sy = y + s * (segH + 2);
          ctx.beginPath(); ctx.roundRect(capX, sy, capW, segH, 3); ctx.fill(); ctx.stroke();
        }
        break;
      }
      case 'crystal-spike': {
        ctx.beginPath(); ctx.rect(capX, y, capW, ch); ctx.fill(); ctx.stroke();
        const spikeCount = 5, spikeW = capW / spikeCount, spikeH = 8;
        const spikeY = flip ? y : y + ch;
        const dir = flip ? -1 : 1;
        ctx.fillStyle = item.capColors[item.capColors.length - 1][1];
        for (let s = 0; s < spikeCount; s++) {
          const sx = capX + s * spikeW;
          ctx.beginPath();
          ctx.moveTo(sx, spikeY);
          ctx.lineTo(sx + spikeW / 2, spikeY + dir * spikeH);
          ctx.lineTo(sx + spikeW, spikeY);
          ctx.closePath(); ctx.fill();
        }
        break;
      }
      case 'diamond-notch': {
        ctx.beginPath(); ctx.rect(capX, y, capW, ch); ctx.fill(); ctx.stroke();
        const midX = capX + capW / 2, midY = y + ch / 2, dr = ch * 0.55;
        ctx.fillStyle = item.stripeColor;
        ctx.beginPath();
        ctx.moveTo(midX, midY - dr); ctx.lineTo(midX + dr, midY); ctx.lineTo(midX, midY + dr); ctx.lineTo(midX - dr, midY);
        ctx.closePath(); ctx.fill();
        break;
      }
      case 'hazard-stripe': {
        ctx.beginPath(); ctx.rect(capX, y, capW, ch); ctx.fill(); ctx.stroke();
        ctx.save();
        ctx.beginPath(); ctx.rect(capX, y, capW, ch); ctx.clip();
        const stripeW = 10;
        for (let sx = capX - ch; sx < capX + capW + ch; sx += stripeW * 2) {
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.moveTo(sx, y); ctx.lineTo(sx + stripeW, y); ctx.lineTo(sx + stripeW - ch, y + ch); ctx.lineTo(sx - ch, y + ch);
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
        break;
      }
      default: // 'straight'
        ctx.beginPath(); ctx.rect(capX, y, capW, ch); ctx.fill(); ctx.stroke();
    }

    ctx.strokeStyle = `rgba(${item.edgeGlow},${0.6 + glow * 0.3})`;
    ctx.lineWidth = 1;
    const edgeY = flip ? y : y + ch;
    ctx.beginPath(); ctx.moveTo(capX, edgeY); ctx.lineTo(capX + capW, edgeY); ctx.stroke();
    ctx.restore();
  }

  drawBarrel(p.x, 0, PIPE_W, p.topH);
  drawCap(p.x, p.topH - capH, capH, false);
  drawBarrel(p.x, botY, PIPE_W, H - botY);
  drawCap(p.x, botY, capH, true);
  ctx.restore();
}

function drawBird() {
  const b = bird;
  const col = getActiveColorItem();
  ctx.save();
  const idleBob = state === 'idle' ? Math.sin(tick * 0.05) * 6 : 0;
  ctx.translate(b.x, b.y + idleBob);
  const angle = Math.max(-0.5, Math.min(Math.PI / 4, b.vy * 0.05));
  ctx.rotate(angle);
  const shrinkScale = isSkillActive('shrink') ? 0.5 : 1;
  ctx.scale(shrinkScale, shrinkScale);

  if (b.thrustAnim > 0) {
    b.thrustAnim = Math.max(0, b.thrustAnim - 0.08);
    const tg = ctx.createRadialGradient(-b.r - 5, 0, 0, -b.r - 5, 0, 20 * b.thrustAnim);
    tg.addColorStop(0, col.body + 'ff');
    tg.addColorStop(0.4, col.wing + '99');
    tg.addColorStop(1, 'transparent');
    ctx.save();
    ctx.globalAlpha = b.thrustAnim;
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.ellipse(-b.r - 5, 0, 20 * b.thrustAnim, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // Dash trail — ghost copies streaking behind
  if (isSkillActive('dash')) {
    const dashSkill = SHOP_SKILLS.find(s => s.id === 'dash');
    const progress = skillActiveTimer.dash / dashSkill.duration;
    for (let i = 1; i <= 5; i++) {
      ctx.save();
      ctx.globalAlpha = (0.18 * progress) * (1 - i / 6);
      ctx.shadowBlur = 10; ctx.shadowColor = '#00f7ff';
      ctx.fillStyle = '#00f7ff';
      ctx.beginPath();
      ctx.ellipse(-i * 14, 0, b.r, b.r - 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Full-width horizontal streak
    ctx.save();
    ctx.globalAlpha = 0.25 * progress;
    const sg = ctx.createLinearGradient(-b.r - 80, 0, -b.r, 0);
    sg.addColorStop(0, 'transparent');
    sg.addColorStop(1, '#00f7ffcc');
    ctx.fillStyle = sg;
    ctx.fillRect(-b.r - 80, -5, 80, 10);
    ctx.restore();
  }

  ctx.save();
  const invisActive = isSkillActive('invisibility');
  if (invisActive) ctx.globalAlpha = 0.4;
  ctx.shadowBlur = 18;
  ctx.shadowColor = invisActive ? '#a29bfe' : col.glow;
  ctx.fillStyle = invisActive ? '#a29bfe' : col.body;
  ctx.beginPath();
  ctx.ellipse(0, 0, b.r, b.r - 3, 0, 0, Math.PI * 2);
  ctx.fill();
  const sheen = ctx.createRadialGradient(-4, -6, 1, 0, 0, b.r);
  sheen.addColorStop(0, 'rgba(255,255,255,0.35)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.beginPath();
  ctx.ellipse(0, 0, b.r, b.r - 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = col.wing;
  ctx.beginPath();
  ctx.ellipse(-4, 5, 10, 6, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-8, -2); ctx.lineTo(6, -2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-6, 3); ctx.lineTo(4, 3); ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.shadowBlur = 8; ctx.shadowColor = '#00f7ff';
  ctx.fillStyle = '#00eeff';
  ctx.beginPath(); ctx.arc(8, -5, 6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#001a22';
  ctx.beginPath(); ctx.arc(9.5, -5, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath(); ctx.arc(7, -7, 1.5, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#ff8c42';
  ctx.beginPath();
  ctx.moveTo(14, -3); ctx.lineTo(23, 0); ctx.lineTo(14, 3);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.moveTo(14, -3); ctx.lineTo(23, 0); ctx.lineTo(14, 0);
  ctx.closePath(); ctx.fill();

  ctx.restore();
}

function drawCoin(x, y, r, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 8; ctx.shadowColor = '#f9ca2488';
  const cg = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.1, x, y, r);
  cg.addColorStop(0, '#fff7a0');
  cg.addColorStop(0.5, '#f9ca24');
  cg.addColorStop(1, '#b8860b');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e6b80088'; ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath(); ctx.arc(x - r * 0.25, y - r * 0.28, r * 0.32, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawParticles() {
  particles.forEach(p => {
    if (p.type === 'spark') {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.shadowBlur = 8; ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (p.type === 'debris') {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.shadowBlur = 6; ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 4 * p.life, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (p.type === 'text') {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.shadowBlur = 10; ctx.shadowColor = '#f9ca24';
      ctx.fillStyle = '#f9ca24';
      ctx.font = 'bold 18px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('+1', p.x, p.y);
      ctx.restore();
    } else if (p.type === 'shimmer') {
      ctx.save();
      ctx.globalAlpha = p.life * 0.6;
      ctx.shadowBlur = 10; ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.5 * p.life, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  });
}

function drawProjectiles() {
  projectiles.forEach(pr => {
    ctx.save();
    ctx.shadowBlur = 10; ctx.shadowColor = '#fdcb6e';
    ctx.fillStyle = '#fdcb6e';
    ctx.beginPath(); ctx.ellipse(pr.x, pr.y, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}

function drawHUD() {
  ctx.save();
  ctx.shadowBlur = 16; ctx.shadowColor = '#00f7ff';
  ctx.fillStyle = '#00f7ff';
  ctx.font = 'bold 40px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText(score, W / 2, 54);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = '#00f7ff55'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W/2 - 28, 24); ctx.lineTo(W/2 - 38, 24); ctx.lineTo(W/2 - 38, 58); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2 + 28, 24); ctx.lineTo(W/2 + 38, 24); ctx.lineTo(W/2 + 38, 58); ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = 'rgba(1,8,24,0.75)';
  ctx.strokeStyle = '#f9ca2450';
  ctx.lineWidth = 1;
  ctx.shadowBlur = 6; ctx.shadowColor = '#f9ca2430';
  ctx.beginPath(); ctx.roundRect(W - 100, 16, 78, 24, 12); ctx.fill(); ctx.stroke();
  ctx.restore();
  drawCoin(W - 40, 28, 11, 1);
  ctx.save();
  ctx.shadowBlur = 8; ctx.shadowColor = '#f9ca24';
  ctx.fillStyle = '#f9ca24';
  ctx.font = 'bold 16px "Courier New"';
  ctx.textAlign = 'right';
  ctx.fillText(gameData.totalCoins, W - 56, 34);
  ctx.restore();

  // Equipped skill charges (top left, stacked)
  if (state === 'play' || state === 'dead') {
    gameData.equippedOrder.forEach((id, row) => {
      const skill = SHOP_SKILLS.find(s => s.id === id);
      const y = 24 + row * 26;
      const active = isSkillVisuallyActive(skill.id);
      const charges = skillCharges[skill.id];
      ctx.save();
      ctx.shadowBlur = active ? 16 : 6;
      ctx.shadowColor = active ? skill.color : '#ffffff55';
      ctx.fillStyle = active ? skill.color : (charges > 0 ? '#cceeff' : '#334455');
      ctx.font = 'bold 13px "Courier New"';
      ctx.textAlign = 'left';
      ctx.fillText(`${skill.label.toUpperCase()} [${row + 1}]`, 12, y);

      for (let i = 0; i < Math.max(charges + (active ? 1 : 0), 3); i++) {
        const filled = i < charges || (active && i === 0);
        ctx.shadowBlur = filled ? 10 : 2;
        ctx.shadowColor = skill.color;
        ctx.fillStyle = filled ? (active && i === 0 ? '#ffffff' : skill.color) : '#1a2a33';
        ctx.strokeStyle = filled ? skill.color + 'aa' : '#334455';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(12 + i * 14, y + 6, 10, 8, 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    });
  }
}

function neonPanel(x, y, w, h, r, color = '#00f7ff') {
  ctx.save();
  ctx.fillStyle = 'rgba(1,8,24,0.88)';
  ctx.strokeStyle = color + '99';
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 18; ctx.shadowColor = color + '55';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); ctx.stroke();
  const t = 8;
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.shadowBlur = 6;
  [[x,y],[x+w,y],[x,y+h],[x+w,y+h]].forEach(([cx,cy],i) => {
    const sx = i%2===0?1:-1, sy = i<2?1:-1;
    ctx.beginPath(); ctx.moveTo(cx+sx*t,cy); ctx.lineTo(cx,cy); ctx.lineTo(cx,cy+sy*t); ctx.stroke();
  });
  ctx.restore();
}

function drawShopButton() {
  const pulse = 0.5 + 0.5 * Math.sin(tick * 0.07);
  ctx.save();
  ctx.shadowBlur = 8 + pulse * 12; ctx.shadowColor = '#f9ca24';
  ctx.strokeStyle = `rgba(249,202,36,${0.45 + pulse * 0.35})`; ctx.lineWidth = 1.5;
  ctx.fillStyle = 'rgba(1,8,24,0.85)';
  ctx.beginPath(); ctx.roundRect(W/2-52, H/2+38, 104, 30, 6); ctx.fill(); ctx.stroke();
  drawCoin(W/2 - 24, H/2 + 53, 7, 1);
  ctx.fillStyle = '#f9ca24'; ctx.shadowBlur = 6;
  ctx.font = 'bold 13px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText('SHOP', W/2 + 12, H/2 + 58);
  ctx.restore();
}

const SHOP_TAB_LAYOUT = { tabW: 80, tabH: 24, gap: 4 };

function drawShopTabs(px, py, pw) {
  const { tabW, tabH, gap } = SHOP_TAB_LAYOUT;
  const totalW = tabW * SHOP_TABS.length + gap * (SHOP_TABS.length - 1);
  const startX = px + (pw - totalW) / 2;
  const tabY = py + 72;
  SHOP_TABS.forEach((tab, i) => {
    const tx = startX + i * (tabW + gap);
    const active = shopTab === tab.id;
    ctx.save();
    ctx.fillStyle = active ? 'rgba(0,247,255,0.15)' : 'rgba(1,8,24,0.6)';
    ctx.strokeStyle = active ? '#00f7ff' : '#1e3a4a';
    ctx.lineWidth = active ? 1.5 : 1;
    ctx.shadowBlur = active ? 10 : 0; ctx.shadowColor = '#00f7ff';
    ctx.beginPath(); ctx.roundRect(tx, tabY, tabW, tabH, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = active ? '#00f7ff' : '#5a7a8a';
    ctx.font = 'bold 12px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(tab.label, tx + tabW / 2, tabY + 17);
    ctx.restore();
  });
}

function drawCloseButton(px, py, ph) {
  ctx.save();
  ctx.strokeStyle = '#ff4466aa'; ctx.lineWidth = 1.5;
  ctx.fillStyle = 'rgba(40,0,10,0.9)';
  ctx.shadowBlur = 8; ctx.shadowColor = '#ff446688';
  ctx.beginPath(); ctx.roundRect(W/2 - 44, py + ph - 42, 88, 28, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ff4466'; ctx.shadowBlur = 6;
  ctx.font = 'bold 13px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText('[ CLOSE ]', W/2, py + ph - 23);
  ctx.restore();
}

function renderShopMessage(px, py, ph) {
  if (shopMessageTimer > 0) {
    shopMessageTimer--;
    ctx.save();
    ctx.shadowBlur = 8; ctx.shadowColor = '#ff4466';
    ctx.fillStyle = '#ff4466';
    ctx.font = 'bold 11px "Courier New"';
    ctx.textAlign = 'center';
    ctx.globalAlpha = Math.min(1, shopMessageTimer / 20);
    ctx.fillText(shopMessage, W / 2, py + ph - 52);
    ctx.restore();
  }
}

// --- Pipes tab ---
function getPipeItemRects(px, py, pw) {
  const cols = 2, itemW = 128, itemH = 68, gapX = 14, gapY = 10;
  const gridX = px + (pw - cols * itemW - (cols - 1) * gapX) / 2;
  const gridY = py + 112;
  return SHOP_PIPES.map((item, i) => ({
    item,
    x: gridX + (i % cols) * (itemW + gapX),
    y: gridY + Math.floor(i / cols) * (itemH + gapY),
    w: itemW, h: itemH
  }));
}

function drawPipePreview(item, x, y) {
  ctx.save();
  ctx.translate(x, y);
  const barrelG = ctx.createLinearGradient(-9, 0, 9, 0);
  item.barrelColors.forEach(([pos, color]) => barrelG.addColorStop(pos, color));
  ctx.fillStyle = barrelG;
  ctx.fillRect(-9, -16, 18, 32);
  const capG = ctx.createLinearGradient(-12, 0, 12, 0);
  item.capColors.forEach(([pos, color]) => capG.addColorStop(pos, color));
  ctx.fillStyle = capG;
  ctx.strokeStyle = `rgba(${item.capGlow},0.9)`;
  ctx.lineWidth = 1;
  switch (item.capStyle) {
    case 'rounded':
      ctx.beginPath(); ctx.roundRect(-12, 12, 24, 10, 5); ctx.fill(); ctx.stroke();
      break;
    case 'ringed-segments':
      for (let s = 0; s < 3; s++) { ctx.beginPath(); ctx.roundRect(-12, 12 + s * 4, 24, 2.6, 1); ctx.fill(); ctx.stroke(); }
      break;
    case 'crystal-spike':
      ctx.beginPath(); ctx.rect(-12, 12, 24, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = item.capColors[item.capColors.length - 1][1];
      for (let s = 0; s < 4; s++) {
        const sx = -12 + s * 6;
        ctx.beginPath(); ctx.moveTo(sx, 12); ctx.lineTo(sx + 3, 8); ctx.lineTo(sx + 6, 12); ctx.closePath(); ctx.fill();
      }
      break;
    default:
      ctx.beginPath(); ctx.rect(-12, 12, 24, 10); ctx.fill(); ctx.stroke();
      if (item.capStyle === 'diamond-notch') {
        ctx.fillStyle = item.stripeColor;
        ctx.beginPath(); ctx.moveTo(0, 13); ctx.lineTo(4, 17); ctx.lineTo(0, 21); ctx.lineTo(-4, 17); ctx.closePath(); ctx.fill();
      } else if (item.capStyle === 'hazard-stripe') {
        ctx.save(); ctx.beginPath(); ctx.rect(-12, 12, 24, 10); ctx.clip();
        for (let sx = -20; sx < 20; sx += 8) {
          ctx.fillStyle = '#000';
          ctx.beginPath(); ctx.moveTo(sx, 12); ctx.lineTo(sx + 4, 12); ctx.lineTo(sx, 22); ctx.lineTo(sx - 4, 22); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }
  }
  ctx.restore();
}

function drawPipesTab(px, py, pw, ph) {
  getPipeItemRects(px, py, pw).forEach(({ item, x: cx, y: cy, w: itemW, h: itemH }) => {
    const owned = gameData.unlockedPipes.includes(item.id);
    const active = gameData.activePipe === item.id;
    const borderCol = active ? '#f9ca24' : owned ? '#00ffa0' : '#1e3a4a';

    ctx.save();
    ctx.fillStyle = active ? '#0d1a0d' : '#050d18';
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = active ? 2 : 1;
    ctx.shadowBlur = active ? 12 : owned ? 6 : 0;
    ctx.shadowColor = borderCol;
    ctx.beginPath(); ctx.roundRect(cx, cy, itemW, itemH, 8); ctx.fill(); ctx.stroke();
    ctx.restore();

    drawPipePreview(item, cx + 24, cy + itemH / 2);

    ctx.fillStyle = '#cde'; ctx.font = 'bold 12px "Courier New"';
    ctx.textAlign = 'left';
    ctx.fillText(item.label, cx + 52, cy + 24);

    if (active) {
      ctx.save(); ctx.shadowBlur = 8; ctx.shadowColor = '#f9ca24';
      ctx.fillStyle = '#f9ca24'; ctx.font = 'bold 11px "Courier New"';
      ctx.fillText('▶ EQUIPPED', cx + 52, cy + 44);
      ctx.restore();
    } else if (owned) {
      ctx.fillStyle = '#00ffa0'; ctx.font = '11px "Courier New"';
      ctx.fillText('TAP EQUIP', cx + 52, cy + 44);
    } else {
      drawCoin(cx + 57, cy + 40, 7, 1);
      const canAfford = gameData.totalCoins >= item.price;
      ctx.save();
      if (canAfford) { ctx.shadowBlur = 6; ctx.shadowColor = '#f9ca24'; }
      ctx.fillStyle = canAfford ? '#f9ca24' : '#445566';
      ctx.font = 'bold 12px "Courier New"';
      ctx.fillText(item.price, cx + 68, cy + 45);
      ctx.restore();
    }
  });
}

function handlePipesShopClick(mx, my, px, py, pw) {
  for (const { item, x: cx, y: cy, w: itemW, h: itemH } of getPipeItemRects(px, py, pw)) {
    if (mx >= cx && mx <= cx + itemW && my >= cy && my <= cy + itemH) {
      purchaseOrEquip(item, gameData.unlockedPipes, 'activePipe');
      return;
    }
  }
}

// --- Backgrounds tab ---
function getBackgroundItemRects(px, py, pw) {
  const itemW = pw - 32, itemH = 40, gapY = 6;
  const gridX = px + 16;
  const gridY = py + 112;
  return SHOP_BACKGROUNDS.map((item, i) => ({
    item, x: gridX, y: gridY + i * (itemH + gapY), w: itemW, h: itemH
  }));
}

function drawBackgroundSwatch(item, x, y, w, h) {
  ctx.save();
  const g = ctx.createLinearGradient(x, y, x, y + h);
  item.sky.forEach(([pos, color]) => g.addColorStop(pos, color));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 4); ctx.fill();
  ctx.fillStyle = item.floor.bottom;
  ctx.fillRect(x, y + h - h * 0.22, w, h * 0.22);
  ctx.strokeStyle = item.horizon + '99'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 4); ctx.stroke();
  ctx.restore();
}

function drawBackgroundsTab(px, py, pw, ph) {
  getBackgroundItemRects(px, py, pw).forEach(({ item, x: cx, y: cy, w: itemW, h: itemH }) => {
    const owned = gameData.unlockedBackgrounds.includes(item.id);
    const active = gameData.activeBackground === item.id;
    const borderCol = active ? '#f9ca24' : owned ? '#00ffa0' : '#1e3a4a';

    ctx.save();
    ctx.fillStyle = active ? '#0d1a0d' : '#050d18';
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = active ? 2 : 1;
    ctx.shadowBlur = active ? 10 : owned ? 5 : 0;
    ctx.shadowColor = borderCol;
    ctx.beginPath(); ctx.roundRect(cx, cy, itemW, itemH, 6); ctx.fill(); ctx.stroke();
    ctx.restore();

    drawBackgroundSwatch(item, cx + 8, cy + 6, 40, itemH - 12);

    ctx.fillStyle = '#cde'; ctx.font = 'bold 12px "Courier New"';
    ctx.textAlign = 'left';
    ctx.fillText(item.label, cx + 58, cy + 24);

    if (active) {
      ctx.save(); ctx.shadowBlur = 6; ctx.shadowColor = '#f9ca24';
      ctx.fillStyle = '#f9ca24'; ctx.font = 'bold 10px "Courier New"'; ctx.textAlign = 'right';
      ctx.fillText('▶ EQUIPPED', cx + itemW - 10, cy + 24);
      ctx.restore();
    } else if (owned) {
      ctx.fillStyle = '#00ffa0'; ctx.font = '10px "Courier New"'; ctx.textAlign = 'right';
      ctx.fillText('TAP EQUIP', cx + itemW - 10, cy + 24);
    } else {
      const canAfford = gameData.totalCoins >= item.price;
      drawCoin(cx + itemW - 42, cy + 20, 6, 1);
      ctx.save();
      if (canAfford) { ctx.shadowBlur = 5; ctx.shadowColor = '#f9ca24'; }
      ctx.fillStyle = canAfford ? '#f9ca24' : '#445566';
      ctx.font = 'bold 11px "Courier New"'; ctx.textAlign = 'right';
      ctx.fillText(item.price, cx + itemW - 10, cy + 24);
      ctx.restore();
    }
    ctx.textAlign = 'left';
  });
}

function handleBackgroundsShopClick(mx, my, px, py, pw) {
  for (const { item, x: cx, y: cy, w: itemW, h: itemH } of getBackgroundItemRects(px, py, pw)) {
    if (mx >= cx && mx <= cx + itemW && my >= cy && my <= cy + itemH) {
      if (purchaseOrEquip(item, gameData.unlockedBackgrounds, 'activeBackground')) makeDecor();
      return;
    }
  }
}

function drawShop() {
  ctx.fillStyle = 'rgba(0,0,8,0.88)';
  ctx.fillRect(0, 0, W, H);

  const px = 24, py = 50, pw = W - 48, ph = H - 100;
  neonPanel(px, py, pw, ph, 14, '#00f7ff');

  ctx.save();
  ctx.shadowBlur = 14; ctx.shadowColor = '#00f7ff';
  ctx.fillStyle = '#00f7ff';
  ctx.font = 'bold 22px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText('// SHOP //', W/2, py + 34);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = '#00f7ff33'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px+16, py+46); ctx.lineTo(px+pw-16, py+46); ctx.stroke();
  ctx.restore();

  drawCoin(px + 20, py + 62, 9, 1);
  ctx.save();
  ctx.fillStyle = '#f9ca24'; ctx.font = '13px "Courier New"';
  ctx.textAlign = 'left';
  ctx.fillText(gameData.totalCoins + ' coins', px + 32, py + 67);
  ctx.restore();

  drawShopTabs(px, py, pw);

  const TAB_DRAWERS = { skills: drawSkillsTab, pipes: drawPipesTab, bg: drawBackgroundsTab };
  if (TAB_DRAWERS[shopTab]) {
    TAB_DRAWERS[shopTab](px, py, pw, ph);
    renderShopMessage(px, py, ph);
    drawCloseButton(px, py, ph);
    return;
  }

  const cols = 2, itemW = 128, itemH = 68, gapX = 14, gapY = 10;
  const gridX = px + (pw - cols * itemW - (cols - 1) * gapX) / 2;
  const gridY = py + 112;

  SHOP_COLORS.forEach((col, i) => {
    const cx = gridX + (i % cols) * (itemW + gapX);
    const cy = gridY + Math.floor(i / cols) * (itemH + gapY);
    const owned = gameData.unlockedColors.includes(col.id);
    const active = gameData.activeColor === col.id;

    const borderCol = active ? '#f9ca24' : owned ? '#00ffa0' : '#1e3a4a';
    ctx.save();
    ctx.fillStyle = active ? '#0d1a0d' : '#050d18';
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = active ? 2 : 1;
    ctx.shadowBlur = active ? 12 : owned ? 6 : 0;
    ctx.shadowColor = borderCol;
    ctx.beginPath(); ctx.roundRect(cx, cy, itemW, itemH, 8); ctx.fill(); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(cx + 30, cy + itemH / 2);
    ctx.shadowBlur = 10; ctx.shadowColor = col.glow;
    ctx.fillStyle = col.body;
    ctx.beginPath(); ctx.ellipse(0, 0, 16, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col.wing;
    ctx.beginPath(); ctx.ellipse(-3, 5, 8, 5, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#00eeff'; ctx.shadowColor = '#00f7ff';
    ctx.beginPath(); ctx.arc(7, -4, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#001a22';
    ctx.beginPath(); ctx.arc(8, -4, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#cde'; ctx.font = 'bold 12px "Courier New"';
    ctx.textAlign = 'left';
    ctx.fillText(col.label, cx + 52, cy + 24);

    if (active) {
      ctx.save(); ctx.shadowBlur = 8; ctx.shadowColor = '#f9ca24';
      ctx.fillStyle = '#f9ca24'; ctx.font = 'bold 11px "Courier New"';
      ctx.fillText('▶ EQUIPPED', cx + 52, cy + 44);
      ctx.restore();
    } else if (owned) {
      ctx.fillStyle = '#00ffa0'; ctx.font = '11px "Courier New"';
      ctx.fillText('TAP EQUIP', cx + 52, cy + 44);
    } else {
      drawCoin(cx + 57, cy + 40, 7, 1);
      const canAfford = gameData.totalCoins >= col.price;
      ctx.save();
      if (canAfford) { ctx.shadowBlur = 6; ctx.shadowColor = '#f9ca24'; }
      ctx.fillStyle = canAfford ? '#f9ca24' : '#445566';
      ctx.font = 'bold 12px "Courier New"';
      ctx.fillText(col.price, cx + 68, cy + 45);
      ctx.restore();
    }
  });

  renderShopMessage(px, py, ph);
  drawCloseButton(px, py, ph);
}

function handleShopClick(mx, my) {
  const px = 24, py = 50, pw = W - 48, ph = H - 100;
  if (mx >= W/2-44 && mx <= W/2+44 && my >= py+ph-42 && my <= py+ph-14) { shopState = null; return; }

  // Tab clicks
  const { tabW, tabH, gap } = SHOP_TAB_LAYOUT;
  const totalW = tabW * SHOP_TABS.length + gap * (SHOP_TABS.length - 1);
  const startX = px + (pw - totalW) / 2;
  const tabY = py + 72;
  if (my >= tabY && my <= tabY + tabH) {
    for (let i = 0; i < SHOP_TABS.length; i++) {
      const tx = startX + i * (tabW + gap);
      if (mx >= tx && mx <= tx + tabW) { shopTab = SHOP_TABS[i].id; return; }
    }
  }

  const TAB_HANDLERS = { skills: handleSkillsShopClick, pipes: handlePipesShopClick, bg: handleBackgroundsShopClick };
  if (TAB_HANDLERS[shopTab]) { TAB_HANDLERS[shopTab](mx, my, px, py, pw); return; }

  const cols = 2, itemW = 128, itemH = 68, gapX = 14, gapY = 10;
  const gridX = px + (pw - cols * itemW - (cols - 1) * gapX) / 2;
  const gridY = py + 112;
  SHOP_COLORS.forEach((col, i) => {
    const cx = gridX + (i % cols) * (itemW + gapX);
    const cy = gridY + Math.floor(i / cols) * (itemH + gapY);
    if (mx >= cx && mx <= cx + itemW && my >= cy && my <= cy + itemH) {
      purchaseOrEquip(col, gameData.unlockedColors, 'activeColor');
    }
  });
}

function drawOverlay() {
  if (state === 'idle') {
    neonPanel(36, H/2 - 100, W - 72, 210, 12);
    ctx.save();
    ctx.font = 'bold 30px "Courier New"';
    ctx.textAlign = 'center';
    if (glitchActive) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#ff00cc';
      ctx.fillText('FLAPPY BIRD', W/2 - 3, H/2 - 58);
      ctx.fillStyle = '#00ffff';
      ctx.fillText('FLAPPY BIRD', W/2 + 3, H/2 - 58);
      ctx.globalAlpha = 1;
    }
    ctx.shadowBlur = 20; ctx.shadowColor = '#00f7ff';
    ctx.fillStyle = '#00f7ff';
    ctx.fillText('FLAPPY BIRD', W/2, H/2 - 58);
    ctx.restore();
    ctx.save();
    ctx.textAlign = 'center';
    const blinkOn = Math.floor(tick / 28) % 2 === 0;
    ctx.fillStyle = blinkOn ? '#7ecfffaa' : '#7ecfff33';
    ctx.font = '11px "Courier New"';
    ctx.fillText('PRESS SPACE OR TAP', W/2, H/2 - 30);
    ctx.fillStyle = '#00f7ff44'; ctx.font = '10px "Courier New"';
    const equippedHint = gameData.equippedOrder
      .map((id, i) => `[${i + 1}] ${SHOP_SKILLS.find(s => s.id === id).label.toUpperCase()}`)
      .join('   ') || 'VISIT SHOP TO UNLOCK SKILLS';
    ctx.fillText(equippedHint, W/2, H/2 - 14);
    ctx.restore();
    const best = gameData.highScores[0] || 0;
    ctx.save();
    ctx.shadowBlur = 8; ctx.shadowColor = '#f9ca24';
    ctx.fillStyle = '#f9ca24'; ctx.font = '12px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(`BEST: ${best}    COINS: ${gameData.totalCoins}`, W/2, H/2 + 2);
    ctx.restore();
    drawShopButton();

  } else if (state === 'dead') {
    const panelH = 60 + gameData.highScores.length * 28 + 80;
    const panelY = H/2 - panelH/2;
    const vig = ctx.createRadialGradient(W/2, H/2, H * 0.15, W/2, H/2, H * 0.75);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, 'rgba(200,0,30,0.22)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
    neonPanel(36, panelY, W - 72, panelH, 12, '#ff4466');

    const top = panelY + 42;
    ctx.save();
    ctx.shadowBlur = 20; ctx.shadowColor = '#ff4466';
    ctx.fillStyle = '#ff4466';
    ctx.font = 'bold 28px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W/2, top);
    ctx.restore();

    ctx.save();
    ctx.shadowBlur = 8; ctx.shadowColor = '#f9ca24';
    ctx.fillStyle = '#f9ca24'; ctx.font = 'bold 16px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(`SCORE: ${score}   +${score} COINS`, W/2, top + 28);
    ctx.restore();
    if (isNewBest) {
      ctx.save();
      ctx.shadowBlur = 10; ctx.shadowColor = '#f9ca24';
      ctx.fillStyle = 'rgba(8,20,8,0.95)';
      ctx.strokeStyle = '#f9ca24'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(W - 100, panelY + 8, 64, 18, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f9ca24'; ctx.shadowBlur = 4;
      ctx.font = 'bold 9px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('★ NEW BEST', W - 68, panelY + 21);
      ctx.restore();
    }
    ctx.save();
    ctx.strokeStyle = '#ff446633'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(52, top + 42); ctx.lineTo(W - 52, top + 42); ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#7ecfff'; ctx.font = 'bold 13px "Courier New"'; ctx.textAlign = 'center';
    ctx.fillText('HIGH SCORES', W/2, top + 56);

    gameData.highScores.forEach((s, i) => {
      const labels = ['01','02','03','04','05'];
      ctx.save();
      if (i === 0) { ctx.shadowBlur = 8; ctx.shadowColor = '#f9ca24'; }
      ctx.fillStyle = i === 0 ? '#f9ca24' : '#7ecfff99';
      ctx.font = `${i === 0 ? 'bold' : ''} 13px "Courier New"`;
      ctx.textAlign = 'center';
      ctx.fillText(`#${labels[i]}  ${s}`, W/2, top + 76 + i * 28);
      ctx.restore();
    });

    const restartBlink = Math.floor(tick / 28) % 2 === 0;
    ctx.fillStyle = restartBlink ? '#7ecfff77' : '#7ecfff22'; ctx.font = '11px "Courier New"'; ctx.textAlign = 'center';
    ctx.fillText('TAP OR SPACE TO RESTART', W/2, top + 76 + gameData.highScores.length * 28 + 10);
  }
}

function drawScanlines() {
  ctx.save();
  ctx.globalAlpha = 0.028;
  ctx.fillStyle = '#000';
  for (let y = 0; y < H; y += 3) {
    ctx.fillRect(0, y, W, 1);
  }
  ctx.restore();
}

// --- Collision & update ---
function collides(b, p) {
  const br = getBirdRadius(b) - 4;
  if (p.sinking) return false;
  if (b.x + br > p.x && b.x - br < p.x + PIPE_W) {
    if (b.y - br < p.topH || b.y + br > p.topH + GAP) return true;
  }
  return false;
}

function update() {
  particles.forEach(p => { p.x += p.vx||0; p.y += p.vy||0; p.life -= 0.03; });
  particles = particles.filter(p => p.life > 0);
  if (state !== 'play') return;

  const dashing = isSkillActive('dash');
  const invisible = isSkillActive('invisibility');
  const timeSlow = isSkillActive('timeSlow') ? 0.5 : 1;
  const freezing = isSkillActive('freezeFrame');

  if (dashing) {
    // Reduce gravity pull during dash for a horizontal feel
    bird.vy *= 0.7;
  }

  bird.vy += GRAVITY * timeSlow;
  bird.y += bird.vy;

  const currentSpeed = freezing ? 0 : (dashing ? SPEED * DASH_SPEED_MULTIPLIER : SPEED) * timeSlow;
  if (!freezing && frame % 90 === 0) spawnPipe();
  pipes.forEach(p => { p.x -= currentSpeed; });
  pipes = pipes.filter(p => p.x + PIPE_W > 0);

  updateSkills();

  // Score passing
  pipes.forEach(p => { if (!p.passed && bird.x > p.x + PIPE_W) { p.passed = true; onScore(); } });

  // Collision — destroy pipe when dashing, ignore when invisible, die otherwise
  pipes.forEach(p => {
    if (collides(bird, p)) {
      if (dashing) {
        if (!p.destroyed) {
          p.destroyed = true;
          spawnPipeBreakParticles(p);
        }
      } else if (invisible) {
        // pass through safely
      } else {
        attemptDeath();
      }
    }
  });
  pipes = pipes.filter(p => !p.destroyed);

  if (bird.y + bird.r > H - 50 || bird.y - bird.r < 0) attemptDeath();
  frame++;
}

function loop() {
  tick++;
  if (state === 'idle' && !shopState) {
    if (--glitchTimer <= 0) {
      glitchActive = !glitchActive;
      glitchTimer = glitchActive ? 7 : Math.floor(Math.random() * 180 + 100);
    }
  } else {
    glitchActive = false;
  }
  drawBg();
  pipes.forEach(drawPipe);
  drawBird();
  drawClone();
  drawProjectiles();
  drawParticles();
  drawHUD();
  drawOverlay();
  if (shopState === 'shop') drawShop();
  drawScanlines();
  update();
  requestAnimationFrame(loop);
}

init();
loop();
