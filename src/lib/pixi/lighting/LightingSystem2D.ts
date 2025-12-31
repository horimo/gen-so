import { Application, Graphics, Container } from "pixi.js";
import type { EmotionDistribution } from "../fog/FogSystem2D";

/**
 * ライティング設定の型定義
 */
export interface LightingSettings {
  ambientIntensity: number;
  directionalIntensity: number;
  lightColor: string;
  stressBlink: boolean;
}

/**
 * 感情の分布に応じたライティング設定を計算（3D版と同じロジック）
 */
export function getLightingSettings(
  emotionDistribution: EmotionDistribution
): LightingSettings {
  const { normalizedScores } = emotionDistribution;

  // 環境光の強度
  let ambientIntensity = 0.3;
  
  // joy/inspirationが多い: 明るくなる
  const brightInfluence = normalizedScores.joy + normalizedScores.inspiration;
  ambientIntensity += brightInfluence * 0.4; // 最大0.7

  // sadnessが多い: 暗くなる
  const darkInfluence = normalizedScores.sadness;
  ambientIntensity -= darkInfluence * 0.2; // 最小0.1

  ambientIntensity = Math.max(0.1, Math.min(0.7, ambientIntensity));

  // 指向性ライトの強度
  let directionalIntensity = 0.5;
  directionalIntensity += brightInfluence * 0.3; // 最大0.8
  directionalIntensity = Math.max(0.3, Math.min(0.8, directionalIntensity));

  // ライトの色（感情に応じて変化）
  let lightColor = "#ffffff";
  
  if (brightInfluence > 0.3) {
    // joy/inspiration: 暖色
    lightColor = "#fff4e6"; // 温かい白
  } else if (normalizedScores.peace > 0.3) {
    // peace: 柔らかな青白
    lightColor = "#e6f3ff";
  } else if (normalizedScores.stress > 0.3) {
    // stress: 赤みがかった光
    lightColor = "#ffe6e6";
  } else if (normalizedScores.sadness > 0.3) {
    // sadness: 青みがかった光
    lightColor = "#e6e6ff";
  }

  // stressが多い場合の点滅効果（時間ベース）
  const stressBlink = normalizedScores.stress > 0.2;

  return {
    ambientIntensity,
    directionalIntensity,
    lightColor,
    stressBlink,
  };
}

/**
 * 深度と感情分布に応じてライティング設定を計算（地上/地下エリアの判定を含む）
 */
export function calculateLightingSettings(
  depth: number,
  emotionDistribution: EmotionDistribution,
  isSurfaceArea: boolean
): LightingSettings {
  const baseSettings = getLightingSettings(emotionDistribution);
  
  // 地表付近（深度-10 ～ 10）での急激な変化
  const surfaceTransitionRange = 10;
  const distanceFromSurface = Math.abs(depth);
  
  if (distanceFromSurface <= surfaceTransitionRange) {
    // 地表付近: 深度0に近いほど明るく、離れるほど暗くなる（急激な変化）
    const normalizedDistance = distanceFromSurface / surfaceTransitionRange;
    
    // 深度0で最も明るく、深度10で通常の明るさ
    const surfaceAmbientBoost = (1 - normalizedDistance) * 0.3; // 0.3 ～ 0
    const surfaceDirectionalBoost = (1 - normalizedDistance) * 0.4; // 0.4 ～ 0
    
    // 深度0より上（地上）の場合、さらに明るく
    if (depth < 0) {
      return {
        ...baseSettings,
        ambientIntensity: Math.min(1.0, baseSettings.ambientIntensity + surfaceAmbientBoost + 0.2),
        directionalIntensity: Math.min(1.0, baseSettings.directionalIntensity + surfaceDirectionalBoost + 0.3),
        lightColor: "#ffffff", // 白い光（太陽光）
      };
    } else {
      // 深度0より下（地下）の場合、徐々に暗くなる
      return {
        ...baseSettings,
        ambientIntensity: baseSettings.ambientIntensity + surfaceAmbientBoost,
        directionalIntensity: baseSettings.directionalIntensity + surfaceDirectionalBoost,
        lightColor: "#ffffff", // 地表付近は白い光
      };
    }
  } else if (isSurfaceArea) {
    // 地上エリア（深度10-100）: 明るいライティング（太陽光のような感じ）
    return {
      ...baseSettings,
      ambientIntensity: Math.max(0.5, baseSettings.ambientIntensity + 0.2), // より明るく
      directionalIntensity: Math.max(0.7, baseSettings.directionalIntensity + 0.2), // より明るく
      lightColor: "#ffffff", // 白い光（太陽光）
    };
  } else {
    // 地下エリア: 従来のライティング設定
    return baseSettings;
  }
}

/**
 * 色の文字列（#rrggbb）を数値（0xrrggbb）に変換
 */
function hexToNumber(hex: string): number {
  return parseInt(hex.replace("#", ""), 16);
}

/**
 * ライティングレイヤーを描画
 */
export function drawLightingLayer(
  app: Application,
  container: Container,
  viewportWidth: number,
  viewportHeight: number,
  lightingSettings: LightingSettings,
  time: number
): Graphics {
  // 既存のライティングレイヤーを削除
  const existingLighting = container.getChildByName("lighting-layer");
  if (existingLighting) {
    container.removeChild(existingLighting);
  }

  const lightingGraphics = new Graphics();
  lightingGraphics.name = "lighting-layer";
  // ライティングレイヤーはイベントをブロックしないようにする
  lightingGraphics.eventMode = "none";

  // stressの点滅効果を適用
  // 不透明度を大幅に減らして、画面が白っぽくならないようにする
  // ambientIntensity (0.1-0.7) を不透明度 (0.05-0.25) に変換
  let opacity = lightingSettings.ambientIntensity * 0.35; // 最大約0.25
  opacity = Math.max(0.05, Math.min(0.25, opacity)); // 0.05-0.25の範囲に制限
  
  if (lightingSettings.stressBlink) {
    // 0.5秒周期の点滅（sin波を使用）
    const blinkCycle = (time / 500) % 1; // 0-1の範囲
    const blinkFactor = Math.sin(blinkCycle * Math.PI * 2) * 0.3 + 0.7; // 0.4-1.0の範囲
    opacity *= blinkFactor;
  }

  // ライトの色を数値に変換
  const lightColorNum = hexToNumber(lightingSettings.lightColor);

  // オーバーレイレイヤーを描画（全画面を覆う）
  lightingGraphics.beginFill(lightColorNum, opacity);
  lightingGraphics.drawRect(0, 0, viewportWidth, viewportHeight);
  lightingGraphics.endFill();

  // ライティングレイヤーを追加（zIndexで制御、イベントはブロックしない）
  lightingGraphics.zIndex = 60; // フォグ（zIndex: 50）より後ろ、スプライト（zIndex: 100）より前
  // フォグレイヤーの後ろに配置（zIndexで前面に表示されるが、イベントはブロックしない）
  const fogIndex = container.children.findIndex((child) => child.name === "fog-layer");
  if (fogIndex >= 0) {
    container.addChildAt(lightingGraphics, fogIndex + 1);
  } else {
    const bgIndex = container.children.findIndex((child) => child.name === "background");
    if (bgIndex >= 0) {
      container.addChildAt(lightingGraphics, bgIndex + 1);
    } else {
      container.addChild(lightingGraphics);
    }
  }

  return lightingGraphics;
}

/**
 * ライティングレイヤーの更新
 */
export function updateLightingLayer(
  lightingGraphics: Graphics,
  viewportWidth: number,
  viewportHeight: number,
  lightingSettings: LightingSettings,
  time: number
): void {
  if (!lightingGraphics) return;

  // 既存のライティングをクリア
  lightingGraphics.clear();

  // stressの点滅効果を適用
  // 不透明度を大幅に減らして、画面が白っぽくならないようにする
  // ambientIntensity (0.1-0.7) を不透明度 (0.05-0.25) に変換
  let opacity = lightingSettings.ambientIntensity * 0.35; // 最大約0.25
  opacity = Math.max(0.05, Math.min(0.25, opacity)); // 0.05-0.25の範囲に制限
  
  if (lightingSettings.stressBlink) {
    // 0.5秒周期の点滅（sin波を使用）
    const blinkCycle = (time / 500) % 1; // 0-1の範囲
    const blinkFactor = Math.sin(blinkCycle * Math.PI * 2) * 0.3 + 0.7; // 0.4-1.0の範囲
    opacity *= blinkFactor;
  }

  // ライトの色を数値に変換
  const lightColorNum = hexToNumber(lightingSettings.lightColor);

  // オーバーレイレイヤーを描画（全画面を覆う）
  lightingGraphics.beginFill(lightColorNum, opacity);
  lightingGraphics.drawRect(0, 0, viewportWidth, viewportHeight);
  lightingGraphics.endFill();
}

