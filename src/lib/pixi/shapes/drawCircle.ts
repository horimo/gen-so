import { Graphics } from "pixi.js";

/**
 * 円形を描画
 * @param graphics Graphicsオブジェクト
 * @param size サイズ（ピクセル）
 * @param color 色（0xRRGGBB形式）
 */
export function drawCircle(
  graphics: Graphics,
  size: number,
  color: number
): void {
  graphics.clear();
  graphics.beginFill(color);
  graphics.drawCircle(0, 0, size / 2);
  graphics.endFill();
}

