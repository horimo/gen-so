"use client";

import { Graphics, Container, Ticker, Application } from "pixi.js";
import {
  drawStar,
  drawDiamond,
  drawDrop,
  drawHexagon,
  drawCloud,
  drawDistortedSquare,
  drawCircle,
} from "./shapes";
import { getEmotionColor, type EmotionCategory } from "./utils/colorPalette";

interface PixelSpriteProps {
  app: Application;
  category: EmotionCategory | string;
  strength: number;
  x: number;
  y: number;
  size?: number;
  seed?: number; // confusion用のランダムシード
}

/**
 * 感情カテゴリに応じたドット絵スプライトコンポーネント
 * アニメーション対応
 */
export function createPixelSprite({
  app,
  category,
  strength,
  x,
  y,
  size,
  seed = 0,
}: PixelSpriteProps): Container {
  const container = new Container();
  container.x = x;
  container.y = y;

  // サイズを計算（強度に応じて変化）
  const baseSize = size || 8 + strength * 8;
  const minSize = 6;
  const maxSize = 24;
  const finalSize = Math.max(minSize, Math.min(maxSize, baseSize));

  // 色を取得
  const color = getEmotionColor(category);

  // Graphicsオブジェクトを作成
  const graphics = new Graphics();

  // 感情カテゴリに応じた形状を描画
  switch (category) {
    case "joy":
      drawStar(graphics, finalSize, color);
      break;
    case "peace":
      drawCircle(graphics, finalSize, color);
      break;
    case "stress":
      drawDiamond(graphics, finalSize, color);
      break;
    case "sadness":
      drawDrop(graphics, finalSize, color);
      break;
    case "inspiration":
      drawHexagon(graphics, finalSize, color);
      break;
    case "nostalgia":
      drawCloud(graphics, finalSize, color);
      break;
    case "confusion":
      drawDistortedSquare(graphics, finalSize, color, seed);
      break;
    default:
      drawCircle(graphics, finalSize, color);
  }

  container.addChild(graphics);

  // アニメーションを追加
  addEmotionAnimation(container, category, app.ticker);

  return container;
}

/**
 * 感情カテゴリに応じたアニメーションを追加
 */
function addEmotionAnimation(
  container: Container,
  category: EmotionCategory | string,
  ticker: Ticker
): void {
  const startTime = Date.now();
  const baseRotation = container.rotation;
  const baseScale = container.scale.x;
  const baseX = container.x;
  const baseY = container.y;

  // アニメーション関数
  const animate = () => {
    const elapsed = (Date.now() - startTime) / 1000; // 秒単位

    switch (category) {
      case "joy":
        // 回転（2秒周期）+ パルス（1秒周期）
        container.rotation = baseRotation + (elapsed * Math.PI) / 1; // 2秒で1回転
        const pulse = 1 + Math.sin(elapsed * Math.PI * 2) * 0.1; // 1秒周期のパルス
        container.scale.set(baseScale * pulse);
        break;

      case "peace":
        // 膨張収縮（3秒周期）
        const expand = 1 + Math.sin((elapsed * Math.PI * 2) / 3) * 0.15;
        container.scale.set(baseScale * expand);
        break;

      case "stress":
        // 微細な揺れ（0.1秒周期、ランダム）
        const shakeX = (Math.random() - 0.5) * 2;
        const shakeY = (Math.random() - 0.5) * 2;
        container.x = baseX + shakeX;
        container.y = baseY + shakeY;
        break;

      case "sadness":
        // ゆっくり揺れる（2秒周期）
        const sway = Math.sin((elapsed * Math.PI * 2) / 2) * 3;
        container.x = baseX + sway;
        break;

      case "inspiration":
        // 回転（3秒周期）+ パルス（1.5秒周期）
        container.rotation = baseRotation + (elapsed * Math.PI * 2) / 3;
        const inspirationPulse = 1 + Math.sin((elapsed * Math.PI * 2) / 1.5) * 0.12;
        container.scale.set(baseScale * inspirationPulse);
        break;

      case "nostalgia":
        // 上下に浮遊（4秒周期）
        const float = Math.sin((elapsed * Math.PI * 2) / 4) * 5;
        container.y = baseY + float;
        break;

      case "confusion":
        // 不規則な動き（ランダム）
        const randomX = (Math.random() - 0.5) * 4;
        const randomY = (Math.random() - 0.5) * 4;
        container.x = baseX + randomX;
        container.y = baseY + randomY;
        container.rotation = baseRotation + (Math.random() - 0.5) * 0.2;
        break;

      default:
        // デフォルトはアニメーションなし
        break;
    }
  };

  // ティッカーにアニメーション関数を追加
  ticker.add(animate);

  // コンテナが破棄されたときにアニメーションを停止
  container.on("destroyed", () => {
    ticker.remove(animate);
  });
}

