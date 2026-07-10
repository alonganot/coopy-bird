// ===================== SKILLS MODULE =====================
// Shares the informal global scope with game.js (loaded before it).
// Reads/writes game.js globals: bird, pipes, particles, projectiles, frame,
// state, gameData, saveData, ctx, W, H, GRAVITY, JUMP, PIPE_W, GAP,
// getActiveColorItem, onDeath, spawnPipeBreakParticles, drawCoin, collides.

const MAX_EQUIPPED_SKILLS = 3;

const SHOP_SKILLS = [
  { id: 'dash',         label: 'Dash',             description: 'Speed boost & pipe destroyer', price: 100, chargeThreshold: 5,  duration: 14,  color: '#00f7ff' },
  { id: 'shooting',     label: 'Shooting',         description: 'Destroy pipes with projectiles', price: 350, chargeThreshold: 8,  duration: 30,  color: '#fdcb6e' },
  { id: 'invisibility', label: 'Invisibility',     description: 'Ghost through pipes safely',    price: 500, chargeThreshold: 10, duration: 100, color: '#a29bfe' },
  { id: 'timeSlow',     label: 'Pocket Dimension', description: 'Slow physics 50% briefly',      price: 600, chargeThreshold: 10, duration: 240, color: '#00ffcc' },
  { id: 'shrink',       label: 'Shrink',           description: 'Halve your hitbox & size',      price: 700, chargeThreshold: 9,  duration: 300, color: '#ff9ff3' },
  { id: 'hover',        label: 'Hover',            description: 'Hold to glide, slows your fall', price: 800, chargeThreshold: 9,  duration: 180, color: '#c7ecee' },
  { id: 'earthquake',   label: 'Earthquake',       description: 'Sink the next pipe pair',       price: 1000, chargeThreshold: 12, duration: 24,  color: '#e17055' },
  { id: 'freezeFrame',  label: 'Freeze Frame',     description: 'Stop the scroll for 3 seconds', price: 1500, chargeThreshold: 10, duration: 180, color: '#74b9ff' },
  { id: 'shadowClone',  label: 'Shadow Clone',     description: 'Mirrored clone, coins x2',      price: 2000, chargeThreshold: 15, duration: 0,   color: '#636e72' },
];

// --- Runtime state ---
let skillCharges = {};
let skillActiveTimer = {};
let hoverHeld = false;
let clone = null;
let shopMessage = '';
let shopMessageTimer = 0;

function initSkillState() {
  skillCharges = {};
  skillActiveTimer = {};
  hoverHeld = false;
  clone = null;
  shopMessage = '';
  shopMessageTimer = 0;
  SHOP_SKILLS.forEach(s => { skillCharges[s.id] = 0; skillActiveTimer[s.id] = 0; });
}

// --- Persistence ---
function migrateSkillData(d) {
  if (!d.unlockedSkills) d.unlockedSkills = [];
  if (!d.activeSkills) d.activeSkills = {};
  if (!d.equippedOrder) {
    // Backfill from legacy boolean-only saves (pre-slot system)
    d.equippedOrder = SHOP_SKILLS.filter(s => d.activeSkills[s.id]).map(s => s.id).slice(0, MAX_EQUIPPED_SKILLS);
  }
  SHOP_SKILLS.forEach(s => { d.activeSkills[s.id] = d.equippedOrder.includes(s.id); });
  return d;
}

// --- Equip / activation ---
function isSkillEquipped(id) {
  return gameData.equippedOrder.includes(id);
}

function isSkillActive(id) { return skillActiveTimer[id] > 0; }

function isSkillVisuallyActive(id) {
  return id === 'shadowClone' ? !!(clone && clone.alive) : isSkillActive(id);
}

function activateSkill(id) {
  const skill = SHOP_SKILLS.find(s => s.id === id);
  if (!skill || state !== 'play' || !isSkillEquipped(id)) return;
  if (id === 'hover') return; // hold-to-activate, see startHover/stopHover
  if (id === 'shadowClone' && clone && clone.alive) return;
  if (skillActiveTimer[id] > 0 || skillCharges[id] <= 0) return;
  skillCharges[id]--;
  skillActiveTimer[id] = skill.duration;
  if (id === 'shooting') spawnProjectile();
  if (id === 'earthquake') triggerEarthquake();
  if (id === 'shadowClone') spawnClone();
}

function startHover() {
  if (state !== 'play' || !isSkillEquipped('hover') || hoverHeld) return;
  if (skillActiveTimer.hover <= 0) {
    if (skillCharges.hover <= 0) return;
    skillCharges.hover--;
    skillActiveTimer.hover = SHOP_SKILLS.find(s => s.id === 'hover').duration;
  }
  hoverHeld = true;
}
function stopHover() { hoverHeld = false; }

// --- Shrink ---
function getBirdRadius(b) {
  return (b === bird && isSkillActive('shrink')) ? b.r * 0.5 : b.r;
}

// --- Shooting ---
function spawnProjectile() {
  projectiles.push({ x: bird.x + bird.r, y: bird.y, vx: 9 });
}

// --- Earthquake ---
function triggerEarthquake() {
  const target = pipes.find(p => !p.passed && !p.sinking && p.x + PIPE_W > bird.x);
  if (!target) return;
  const skill = SHOP_SKILLS.find(s => s.id === 'earthquake');
  target.sinking = true;
  target.sinkTimer = skill.duration;
  target.sinkDuration = skill.duration;
}

// --- Shadow Clone ---
function spawnClone() {
  const above = bird.y - 60 >= 20;
  const y = above ? bird.y - 60 : bird.y + 60;
  clone = { y: Math.max(20, Math.min(H - 70, y)), vy: bird.vy, r: bird.r, alive: true };
}

function mirrorCloneJump() {
  if (clone && clone.alive) clone.vy = JUMP;
}

function spawnCloneDeathParticles() {
  const col = getActiveColorItem();
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 / 16) * i;
    const spd = 2 + Math.random() * 3;
    particles.push({ x: bird.x, y: clone.y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 1, life: 1, type: 'debris', color: col.body });
  }
}

// Called instead of onDeath() wherever the main bird would die — swaps
// control to a surviving clone if one exists, otherwise ends the run.
function attemptDeath() {
  if (clone && clone.alive) {
    const col = getActiveColorItem();
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 / 16) * i;
      const spd = 2 + Math.random() * 3;
      particles.push({ x: bird.x, y: bird.y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 1, life: 1, type: 'debris', color: col.body });
    }
    bird.y = clone.y;
    bird.vy = clone.vy;
    clone = null;
  } else {
    onDeath();
  }
}

function drawClone() {
  if (!clone || !clone.alive) return;
  const col = getActiveColorItem();
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.translate(bird.x, clone.y);
  const angle = Math.max(-0.5, Math.min(Math.PI / 4, clone.vy * 0.05));
  ctx.rotate(angle);
  ctx.shadowBlur = 14; ctx.shadowColor = col.glow;
  ctx.fillStyle = col.body;
  ctx.beginPath(); ctx.ellipse(0, 0, clone.r, clone.r - 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = col.wing;
  ctx.beginPath(); ctx.ellipse(-4, 5, 10, 6, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// --- Per-frame update (called from game.js's update(), after gravity/pipe movement) ---
function updateSkills() {
  SHOP_SKILLS.forEach(s => {
    if (s.id === 'hover') {
      if (hoverHeld && skillActiveTimer.hover > 0) skillActiveTimer.hover--;
      if (skillActiveTimer.hover <= 0) hoverHeld = false;
    } else if (skillActiveTimer[s.id] > 0) {
      skillActiveTimer[s.id]--;
    }
  });

  if (isSkillActive('invisibility') && frame % 3 === 0) {
    particles.push({ x: bird.x + (Math.random() - 0.5) * 20, y: bird.y + (Math.random() - 0.5) * 20, vy: -0.5, life: 1, type: 'shimmer', color: '#a29bfe' });
  }

  if (hoverHeld && isSkillActive('hover')) {
    bird.vy = Math.min(bird.vy, 1.2);
  }

  // Projectiles (shooting)
  projectiles.forEach(pr => { pr.x += pr.vx; });
  projectiles.forEach(pr => {
    pipes.forEach(p => {
      if (!p.destroyed && pr.x + 4 > p.x && pr.x - 4 < p.x + PIPE_W && (pr.y < p.topH || pr.y > p.topH + GAP)) {
        p.destroyed = true;
        pr.hit = true;
        spawnPipeBreakParticles(p);
      }
    });
  });
  projectiles = projectiles.filter(pr => !pr.hit && pr.x < W + 20);

  // Earthquake — sink animation countdown
  pipes.forEach(p => {
    if (p.sinking) {
      p.sinkTimer--;
      if (p.sinkTimer <= 0) p.destroyed = true;
    }
  });

  // Shadow Clone physics — independent gravity + collision
  if (clone && clone.alive) {
    clone.vy += GRAVITY;
    clone.y += clone.vy;
    let dead = clone.y + clone.r > H - 50 || clone.y - clone.r < 0;
    if (!dead) {
      pipes.forEach(p => {
        if (!p.sinking && collides({ x: bird.x, y: clone.y, r: clone.r }, p)) dead = true;
      });
    }
    if (dead) {
      spawnCloneDeathParticles();
      clone = null;
    }
  }
}

// --- Shop tab: layout, draw, click handling ---
function getSkillItemRects(px, py, pw) {
  const itemW = pw - 32, itemH = 34, gapY = 4;
  const gridX = px + 16;
  const gridY = py + 112;
  return SHOP_SKILLS.map((skill, i) => ({
    skill, x: gridX, y: gridY + i * (itemH + gapY), w: itemW, h: itemH
  }));
}

function drawSkillsTab(px, py, pw, ph) {
  const rects = getSkillItemRects(px, py, pw);
  rects.forEach(({ skill, x: cx, y: cy, w: itemW, h: itemH }) => {
    const owned = gameData.unlockedSkills.includes(skill.id);
    const equippedSlot = gameData.equippedOrder.indexOf(skill.id);
    const equipped = equippedSlot !== -1;
    const borderCol = equipped ? skill.color : owned ? '#00ffa0' : '#1e3a4a';

    ctx.save();
    ctx.fillStyle = equipped ? '#0d1a1a' : '#050d18';
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = equipped ? 2 : 1;
    ctx.shadowBlur = equipped ? 10 : owned ? 5 : 0;
    ctx.shadowColor = borderCol;
    ctx.beginPath(); ctx.roundRect(cx, cy, itemW, itemH, 6); ctx.fill(); ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.shadowBlur = 4; ctx.shadowColor = skill.color;
    ctx.fillStyle = skill.color;
    ctx.font = 'bold 12px "Courier New"';
    ctx.textAlign = 'left';
    ctx.fillText(skill.label, cx + 10, cy + 15);
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#5a7a8a'; ctx.font = '9px "Courier New"';
    ctx.fillText(`+1 / ${skill.chargeThreshold}pt`, cx + 10, cy + 27);

    if (equipped) {
      ctx.save(); ctx.shadowBlur = 6; ctx.shadowColor = skill.color;
      ctx.fillStyle = skill.color; ctx.font = 'bold 10px "Courier New"';
      ctx.textAlign = 'right';
      ctx.fillText(`▶ SLOT ${equippedSlot + 1}`, cx + itemW - 10, cy + 21);
      ctx.restore();
    } else if (owned) {
      ctx.fillStyle = '#00ffa0'; ctx.font = '10px "Courier New"'; ctx.textAlign = 'right';
      ctx.fillText('TAP EQUIP', cx + itemW - 10, cy + 21);
    } else {
      const canAfford = gameData.totalCoins >= skill.price;
      drawCoin(cx + itemW - 40, cy + 17, 6, 1);
      ctx.save();
      if (canAfford) { ctx.shadowBlur = 5; ctx.shadowColor = '#f9ca24'; }
      ctx.fillStyle = canAfford ? '#f9ca24' : '#445566';
      ctx.font = 'bold 11px "Courier New"'; ctx.textAlign = 'right';
      ctx.fillText(skill.price, cx + itemW - 10, cy + 21);
      ctx.restore();
    }
  });
}

function handleSkillsShopClick(mx, my, px, py, pw) {
  const rects = getSkillItemRects(px, py, pw);
  for (const { skill, x: cx, y: cy, w: itemW, h: itemH } of rects) {
    if (mx >= cx && mx <= cx + itemW && my >= cy && my <= cy + itemH) {
      const owned = gameData.unlockedSkills.includes(skill.id);
      const equipped = gameData.equippedOrder.includes(skill.id);
      if (equipped) {
        gameData.equippedOrder = gameData.equippedOrder.filter(id => id !== skill.id);
        gameData.activeSkills[skill.id] = false;
        saveData();
      } else if (owned) {
        if (gameData.equippedOrder.length >= MAX_EQUIPPED_SKILLS) {
          shopMessage = 'MAX 3 SKILLS EQUIPPED';
          shopMessageTimer = 90;
        } else {
          gameData.equippedOrder.push(skill.id);
          gameData.activeSkills[skill.id] = true;
          saveData();
        }
      } else if (gameData.totalCoins >= skill.price) {
        gameData.totalCoins -= skill.price;
        gameData.unlockedSkills.push(skill.id);
        if (gameData.equippedOrder.length < MAX_EQUIPPED_SKILLS) {
          gameData.equippedOrder.push(skill.id);
          gameData.activeSkills[skill.id] = true;
        } else {
          gameData.activeSkills[skill.id] = false;
          shopMessage = 'BOUGHT — MAX 3 EQUIPPED';
          shopMessageTimer = 90;
        }
        saveData();
      }
      return;
    }
  }
}
