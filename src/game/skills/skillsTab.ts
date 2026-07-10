import { drawCoin } from '../render/particles';
import { saveData, world } from '../state';
import { MAX_EQUIPPED_SKILLS, SHOP_SKILLS, type SkillItem } from './data';
import { skillState } from './state';

interface ItemRect { skill: SkillItem; x: number; y: number; w: number; h: number }

function getSkillItemRects(px: number, py: number, pw: number): ItemRect[] {
  const itemW = pw - 32, itemH = 37, gapY = 1;
  const gridX = px + 16;
  const gridY = py + 112;
  return SHOP_SKILLS.map((skill, i) => ({
    skill, x: gridX, y: gridY + i * (itemH + gapY), w: itemW, h: itemH,
  }));
}

export function drawSkillsTab(ctx: CanvasRenderingContext2D, px: number, py: number, pw: number): void {
  const rects = getSkillItemRects(px, py, pw);
  rects.forEach(({ skill, x: cx, y: cy, w: itemW, h: itemH }) => {
    const owned = world.gameData.unlockedSkills.includes(skill.id);
    const equippedSlot = world.gameData.equippedOrder.indexOf(skill.id);
    const equipped = equippedSlot !== -1;
    const borderCol = equipped ? skill.color : owned ? '#00ffa0' : '#1e3a4a';

    ctx.save();
    ctx.fillStyle = equipped ? '#0d1a1a' : '#050d18';
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = equipped ? 2 : 1;
    ctx.shadowBlur = equipped ? 10 : owned ? 5 : 0;
    ctx.shadowColor = borderCol;
    ctx.beginPath();
    ctx.roundRect(cx, cy, itemW, itemH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.shadowBlur = 4;
    ctx.shadowColor = skill.color;
    ctx.fillStyle = skill.color;
    ctx.font = 'bold 12px "Courier New"';
    ctx.textAlign = 'left';
    ctx.fillText(skill.label, cx + 10, cy + 15);
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#5a7a8a';
    ctx.font = '9px "Courier New"';
    ctx.fillText(`+1 / ${skill.chargeThreshold}pt`, cx + 10, cy + 27);

    if (equipped) {
      ctx.save();
      ctx.shadowBlur = 6;
      ctx.shadowColor = skill.color;
      ctx.fillStyle = skill.color;
      ctx.font = 'bold 10px "Courier New"';
      ctx.textAlign = 'right';
      ctx.fillText(`▶ SLOT ${equippedSlot + 1}`, cx + itemW - 10, cy + 21);
      ctx.restore();
    } else if (owned) {
      ctx.fillStyle = '#00ffa0';
      ctx.font = '10px "Courier New"';
      ctx.textAlign = 'right';
      ctx.fillText('TAP EQUIP', cx + itemW - 10, cy + 21);
    } else {
      const canAfford = world.gameData.totalCoins >= skill.price;
      drawCoin(ctx, cx + itemW - 40, cy + 17, 6, 1);
      ctx.save();
      if (canAfford) { ctx.shadowBlur = 5; ctx.shadowColor = '#f9ca24'; }
      ctx.fillStyle = canAfford ? '#f9ca24' : '#445566';
      ctx.font = 'bold 11px "Courier New"';
      ctx.textAlign = 'right';
      ctx.fillText(String(skill.price), cx + itemW - 10, cy + 21);
      ctx.restore();
    }
  });
}

export function handleSkillsShopClick(mx: number, my: number, px: number, py: number, pw: number): void {
  const rects = getSkillItemRects(px, py, pw);
  for (const { skill, x: cx, y: cy, w: itemW, h: itemH } of rects) {
    if (mx >= cx && mx <= cx + itemW && my >= cy && my <= cy + itemH) {
      const owned = world.gameData.unlockedSkills.includes(skill.id);
      const equipped = world.gameData.equippedOrder.includes(skill.id);
      if (equipped) {
        world.gameData.equippedOrder = world.gameData.equippedOrder.filter(id => id !== skill.id);
        world.gameData.activeSkills[skill.id] = false;
        saveData();
      } else if (owned) {
        if (world.gameData.equippedOrder.length >= MAX_EQUIPPED_SKILLS) {
          skillState.shopMessage = 'MAX 3 SKILLS EQUIPPED';
          skillState.shopMessageTimer = 90;
        } else {
          world.gameData.equippedOrder.push(skill.id);
          world.gameData.activeSkills[skill.id] = true;
          saveData();
        }
      } else if (world.gameData.totalCoins >= skill.price) {
        world.gameData.totalCoins -= skill.price;
        world.gameData.unlockedSkills.push(skill.id);
        if (world.gameData.equippedOrder.length < MAX_EQUIPPED_SKILLS) {
          world.gameData.equippedOrder.push(skill.id);
          world.gameData.activeSkills[skill.id] = true;
        } else {
          world.gameData.activeSkills[skill.id] = false;
          skillState.shopMessage = 'BOUGHT — MAX 3 EQUIPPED';
          skillState.shopMessageTimer = 90;
        }
        saveData();
      }
      return;
    }
  }
}
