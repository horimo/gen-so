import { Graphics } from "pixi.js";

/**
 * 歪んだ四角形を描画
 * @param graphics Graphicsオブジェクト
 * @param size サイズ（ピクセル）
 * @param color 色（0xRRGGBB形式）
 * @param seed ランダムシード（同じシードで同じ形状）
 */
export function drawDistortedSquare(
  graphics: Graphics,
  size: number,
  color: number,
  seed: number = 0
): void {
  graphics.clear();
  graphics.beginFill(color);
  
  // シードベースの疑似乱数
  const random = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };
  
  const halfSize = size / 2;
  const distortion = size * 0.15;
  
  // 各頂点をランダムに歪ませる
  const topLeft = {
    x: -halfSize + (random(1) - 0.5) * distortion,
    y: -halfSize + (random(2) - 0.5) * distortion,
  };
  const topRight = {
    x: halfSize + (random(3) - 0.5) * distortion,
    y: -halfSize + (random(4) - 0.5) * distortion,
  };
  const bottomRight = {
    x: halfSize + (random(5) - 0.5) * distortion,
    y: halfSize + (random(6) - 0.5) * distortion,
  };
  const bottomLeft = {
    x: -halfSize + (random(7) - 0.5) * distortion,
    y: halfSize + (random(8) - 0.5) * distortion,
  };
  
  graphics.moveTo(topLeft.x, topLeft.y);
  graphics.lineTo(topRight.x, topRight.y);
  graphics.lineTo(bottomRight.x, bottomRight.y);
  graphics.lineTo(bottomLeft.x, bottomLeft.y);
  graphics.closePath();
  
  graphics.endFill();
}

