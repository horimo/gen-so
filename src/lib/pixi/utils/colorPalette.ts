/**
 * ドット絵用カラーパレット
 * 各感情カテゴリに対応した色を定義
 */

export const pixelPalette = {
  joy: 0xffd700,      // ゴールド
  peace: 0x4dd0e1,    // 青緑
  stress: 0xff1744,   // 赤
  sadness: 0x1a237e,  // 紺色
  inspiration: 0x9c27b0, // 紫
  nostalgia: 0x8d6e63,  // セピア
  confusion: 0x66bb6a,  // 濁った緑
} as const;

export type EmotionCategory = keyof typeof pixelPalette;

/**
 * 感情カテゴリから色を取得
 */
export function getEmotionColor(category: EmotionCategory | string): number {
  return pixelPalette[category as EmotionCategory] || 0xffffff;
}

/**
 * ドット絵用の色数を制限したパレット
 * 16色のドット絵風カラーパレット
 */
export const limitedPalette: readonly number[] = [
  0x000000, // 黒
  0xffffff, // 白
  0xffd700, // ゴールド
  0x4dd0e1, // 青緑
  0xff1744, // 赤
  0x1a237e, // 紺色
  0x9c27b0, // 紫
  0x8d6e63, // セピア
  0x66bb6a, // 緑
  0xff9800, // オレンジ
  0x2196f3, // 青
  0xf44336, // 赤
  0x4caf50, // 緑
  0xffeb3b, // 黄
  0x9e9e9e, // グレー
  0x795548, // 茶色
];

/**
 * 色を最も近いパレット色に変換
 */
export function quantizeColor(color: number): number {
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;

  let minDistance = Infinity;
  let closestColor = limitedPalette[0];

  for (const paletteColor of limitedPalette) {
    const pr = (paletteColor >> 16) & 0xff;
    const pg = (paletteColor >> 8) & 0xff;
    const pb = paletteColor & 0xff;

    const distance = Math.sqrt(
      Math.pow(r - pr, 2) + Math.pow(g - pg, 2) + Math.pow(b - pb, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = paletteColor;
    }
  }

  return closestColor;
}

