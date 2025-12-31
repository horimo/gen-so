import { Application, Graphics, Container } from "pixi.js";

/**
 * 感情分布の型定義
 */
export interface EmotionDistribution {
  normalizedScores: {
    joy: number;
    inspiration: number;
    sadness: number;
    peace: number;
    stress: number;
    nostalgia: number;
    confusion: number;
  };
  avgStrength: number;
  totalCount: number;
}

/**
 * 深度と感情の分布に応じてフォグの密度を計算（3D版と同じロジック）
 */
export function getFogDensity(
  depth: number,
  emotionDistribution: EmotionDistribution
): number {
  // 深く潜るほどフォグが濃くなる（基本密度）
  const normalizedDepth = Math.min(depth / 2000, 1);
  let baseDensity = 0.01 + normalizedDepth * 0.05; // 0.01 ~ 0.06

  // 強い感情が多いほど霧が薄くなる（感情が「空間を切り開く」）
  const { avgStrength, totalCount } = emotionDistribution;
  const strongEmotionInfluence = Math.min(avgStrength * 0.5, 0.03); // 最大0.03の減少
  baseDensity = Math.max(0.005, baseDensity - strongEmotionInfluence);

  // 感情オブジェクトが少ない深度では霧が濃くなる
  if (totalCount < 3) {
    baseDensity += 0.01;
  }

  return Math.min(baseDensity, 0.08); // 最大0.08
}

/**
 * 深度と感情分布に応じてフォグの密度を計算（地上/地下エリアの判定を含む）
 */
export function calculateFogDensity(
  depth: number,
  emotionDistribution: EmotionDistribution,
  isSurfaceArea: boolean
): number {
  // 地表付近（深度-10 ～ 10）での急激な変化
  const surfaceTransitionRange = 10;
  const distanceFromSurface = Math.abs(depth);
  
  if (distanceFromSurface <= surfaceTransitionRange) {
    // 地表付近: 深度0に近いほど薄く、離れるほど濃くなる（急激な変化）
    const normalizedDistance = distanceFromSurface / surfaceTransitionRange;
    // 深度0で0.0005（非常に薄い）、深度10で0.01（やや濃い）
    const surfaceFog = 0.0005 + normalizedDistance * 0.0095;
    
    // 深度0より上（地上）の場合、さらに薄く
    if (depth < 0) {
      return surfaceFog * 0.5; // 地上はさらに薄い
    }
    return surfaceFog;
  } else if (isSurfaceArea) {
    // 地上エリア（深度10-100）: 非常に薄いフォグ（空の霞のような感じ）
    const surfaceDepth = depth - surfaceTransitionRange; // 10-100の範囲
    const normalizedSurfaceDepth = surfaceDepth / 90; // 0-1の範囲
    return 0.01 + normalizedSurfaceDepth * 0.005; // 0.01 ～ 0.015（非常に薄い）
  } else {
    // 地下エリア: 深いほど濃いフォグ
    return getFogDensity(depth, emotionDistribution);
  }
}

/**
 * フォグの不透明度を密度から計算（0-1の範囲）
 */
export function fogDensityToOpacity(density: number): number {
  // 密度を不透明度に変換（0.005 → 0.1, 0.08 → 0.8）
  return Math.min(0.8, Math.max(0.1, density * 10));
}

/**
 * フォグレイヤーを描画
 */
export function drawFogLayer(
  app: Application,
  container: Container,
  viewportWidth: number,
  viewportHeight: number,
  fogOpacity: number,
  groundY: number,
  isSurfaceArea: boolean
): Graphics {
  // 既存のフォグレイヤーを削除
  const existingFog = container.getChildByName("fog-layer");
  if (existingFog) {
    container.removeChild(existingFog);
  }

  const fogGraphics = new Graphics();
  fogGraphics.name = "fog-layer";
  // フォグレイヤーはイベントをブロックしないようにする
  fogGraphics.eventMode = "none";

  // フォグの色（背景色に合わせた青みがかった白）
  const fogColor = isSurfaceArea ? 0x87ceeb : 0x1a1a2e; // 地上はスカイブルー、地下は深い青

  // 地上エリアでは地面より上のみ、地下エリアでは地面より下のみにフォグを描画
  if (isSurfaceArea) {
    // 地上エリア: 地面より上のみにフォグ（空の霞）
    fogGraphics.beginFill(fogColor, fogOpacity * 0.3); // 地上は薄く
    fogGraphics.drawRect(0, 0, viewportWidth, groundY);
    fogGraphics.endFill();
  } else {
    // 地下エリア: 地面より下のみにフォグ（深いほど濃く）
    const undergroundHeight = viewportHeight - groundY;
    
    // グラデーション効果（地面に近いほど薄く、下に行くほど濃く）
    const gradientSteps = 10;
    for (let i = 0; i < gradientSteps; i++) {
      const stepY = groundY + (undergroundHeight / gradientSteps) * i;
      const stepHeight = undergroundHeight / gradientSteps;
      const stepOpacity = fogOpacity * (0.3 + (i / gradientSteps) * 0.7); // 下に行くほど濃く
      
      fogGraphics.beginFill(fogColor, stepOpacity);
      fogGraphics.drawRect(0, stepY, viewportWidth, stepHeight);
      fogGraphics.endFill();
    }
  }

  // フォグレイヤーを追加（zIndexで制御、イベントはブロックしない）
  fogGraphics.zIndex = 50; // スプライト（zIndex: 100）より後ろに配置
  // 背景の後ろ、スプライトの前に配置（zIndexで前面に表示されるが、イベントはブロックしない）
  const bgIndex = container.children.findIndex((child) => child.name === "background");
  if (bgIndex >= 0) {
    container.addChildAt(fogGraphics, bgIndex + 1);
  } else {
    container.addChild(fogGraphics);
  }

  return fogGraphics;
}

/**
 * フォグシステムの更新
 */
export function updateFogLayer(
  fogGraphics: Graphics,
  viewportWidth: number,
  viewportHeight: number,
  fogOpacity: number,
  groundY: number,
  isSurfaceArea: boolean
): void {
  if (!fogGraphics) return;

  // 既存のフォグをクリア
  fogGraphics.clear();

  // フォグの色
  const fogColor = isSurfaceArea ? 0x87ceeb : 0x1a1a2e;

  if (isSurfaceArea) {
    // 地上エリア: 地面より上のみにフォグ（空の霞）
    fogGraphics.beginFill(fogColor, fogOpacity * 0.3);
    fogGraphics.drawRect(0, 0, viewportWidth, groundY);
    fogGraphics.endFill();
  } else {
    // 地下エリア: 地面より下のみにフォグ（深いほど濃く）
    const undergroundHeight = viewportHeight - groundY;
    
    // グラデーション効果（地面に近いほど薄く、下に行くほど濃く）
    const gradientSteps = 10;
    for (let i = 0; i < gradientSteps; i++) {
      const stepY = groundY + (undergroundHeight / gradientSteps) * i;
      const stepHeight = undergroundHeight / gradientSteps;
      const stepOpacity = fogOpacity * (0.3 + (i / gradientSteps) * 0.7);
      
      fogGraphics.beginFill(fogColor, stepOpacity);
      fogGraphics.drawRect(0, stepY, viewportWidth, stepHeight);
      fogGraphics.endFill();
    }
  }
}

