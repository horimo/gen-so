import { Graphics } from "pixi.js";

/**
 * 六角形を描画
 * @param graphics Graphicsオブジェクト
 * @param size サイズ（ピクセル）
 * @param color 色（0xRRGGBB形式）
 */
export function drawHexagon(
  graphics: Graphics,
  size: number,
  color: number
): void {
  graphics.clear();
  graphics.beginFill(color);
  
  const radius = size / 2;
  const angleStep = (Math.PI * 2) / 6;
  
  for (let i = 0; i < 6; i++) {
    const angle = i * angleStep - Math.PI / 2;
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

