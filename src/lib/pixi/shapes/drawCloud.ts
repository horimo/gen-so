import { Graphics } from "pixi.js";

/**
 * 雲型を描画
 * @param graphics Graphicsオブジェクト
 * @param size サイズ（ピクセル）
 * @param color 色（0xRRGGBB形式）
 */
export function drawCloud(
  graphics: Graphics,
  size: number,
  color: number
): void {
  graphics.clear();
  graphics.beginFill(color);
  
  const width = size;
  const height = size * 0.7;
  
  // 複数の円を組み合わせて雲の形状を作成
  const circles = [
    { x: -width * 0.2, y: -height * 0.1, r: width * 0.25 },
    { x: width * 0.1, y: -height * 0.2, r: width * 0.3 },
    { x: width * 0.3, y: -height * 0.1, r: width * 0.25 },
    { x: 0, y: height * 0.1, r: width * 0.3 },
    { x: width * 0.25, y: height * 0.15, r: width * 0.2 },
  ];
  
  for (const circle of circles) {
    graphics.drawCircle(circle.x, circle.y, circle.r);
  }
  
  graphics.endFill();
}

