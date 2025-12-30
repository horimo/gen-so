import { Graphics } from "pixi.js";

/**
 * 滴型を描画
 * @param graphics Graphicsオブジェクト
 * @param size サイズ（ピクセル）
 * @param color 色（0xRRGGBB形式）
 */
export function drawDrop(
  graphics: Graphics,
  size: number,
  color: number
): void {
  graphics.clear();
  graphics.beginFill(color);
  
  const width = size * 0.6;
  const height = size;
  
  // 滴型のパスを描画
  graphics.moveTo(0, -height / 2); // 上部の頂点
  graphics.quadraticCurveTo(-width / 2, 0, 0, height / 2); // 左側の曲線
  graphics.quadraticCurveTo(width / 2, 0, 0, -height / 2); // 右側の曲線
  graphics.closePath();
  
  graphics.endFill();
}

