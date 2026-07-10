export function neonPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color = '#00f7ff',
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(1,8,24,0.88)';
  ctx.strokeStyle = color + '99';
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 18;
  ctx.shadowColor = color + '55';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
  ctx.stroke();
  const t = 8;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 6;
  ([[x, y], [x + w, y], [x, y + h], [x + w, y + h]] as const).forEach(([cx, cy], i) => {
    const sx = i % 2 === 0 ? 1 : -1;
    const sy = i < 2 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(cx + sx * t, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + sy * t);
    ctx.stroke();
  });
  ctx.restore();
}
