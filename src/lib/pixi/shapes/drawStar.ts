import { Graphics } from "pixi.js";

/**
 * 星形を描画
 * @param graphics Graphicsオブジェクト
 * @param size サイズ（ピクセル）
 * @param color 色（0xRRGGBB形式）
 * @param points 星の頂点数（デフォルト: 5）
 */
export function drawStar(
  graphics: Graphics,
  size: number,
  color: number,
  points: number = 5
): void {
  graphics.clear();
  graphics.beginFill(color);
  
  const outerRadius = size / 2;
  const innerRadius = outerRadius * 0.4;
  const angleStep = (Math.PI * 2) / points;
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * angleStep) / 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.endFill();
}

