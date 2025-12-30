import { Graphics } from "pixi.js";

/**
 * ダイヤモンド形を描画
 * @param graphics Graphicsオブジェクト
 * @param size サイズ（ピクセル）
 * @param color 色（0xRRGGBB形式）
 */
export function drawDiamond(
  graphics: Graphics,
  size: number,
  color: number
): void {
  graphics.clear();
  graphics.beginFill(color);
  
  const halfSize = size / 2;
  
  graphics.moveTo(0, -halfSize);      // 上
  graphics.lineTo(halfSize, 0);       // 右
  graphics.lineTo(0, halfSize);        // 下
  graphics.lineTo(-halfSize, 0);      // 左
  graphics.closePath();
  
  graphics.endFill();
}

