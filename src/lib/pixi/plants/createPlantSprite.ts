"use client";

import { Graphics, Container, Application, Ticker } from "pixi.js";
import { getEmotionColor, type EmotionCategory } from "../utils/colorPalette";

interface PlantSpriteProps {
  app: Application;
  category: EmotionCategory | string;
  strength: number;
  x: number;
  y: number;
  isSurface: boolean; // 地上エリアかどうか
  seed?: number;
}

/**
 * 植物スプライトを作成
 * 地上エリア: 草花のような植物
 * 地下エリア: ツタや苔のような植物
 */
export function createPlantSprite({
  app,
  category,
  strength,
  x,
  y,
  isSurface,
  seed = 0,
}: PlantSpriteProps): Container {
  const container = new Container();
  container.x = x;
  container.y = y;

  const color = getEmotionColor(category);
  const graphics = new Graphics();

  if (isSurface) {
    // 地上エリア: 草花のような植物
    drawSurfacePlant(graphics, category, strength, color, seed);
  } else {
    // 地下エリア: ツタや苔のような植物
    drawUndergroundPlant(graphics, category, strength, color, seed);
  }

  container.addChild(graphics);

  // アニメーションを追加
  addPlantAnimation(container, category, app.ticker, isSurface);

  return container;
}

/**
 * 地上エリア用の植物（草花）を描画
 */
function drawSurfacePlant(
  graphics: Graphics,
  category: EmotionCategory | string,
  strength: number,
  color: number,
  seed: number
) {
  const size = 4 + strength * 6; // 4-10ピクセル
  const baseSize = Math.max(3, Math.min(10, size));

  // シードベースの疑似乱数で一貫性を保つ
  const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
  const random2 = ((seed * 9301 + 49297 + 1) % 233280) / 233280;

  switch (category) {
    case "joy":
      // キラキラした花（星型の花びら）
      graphics.beginFill(color);
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        const petalX = Math.cos(angle) * baseSize * 0.6;
        const petalY = Math.sin(angle) * baseSize * 0.6;
        graphics.drawCircle(petalX, petalY, baseSize * 0.3);
      }
      graphics.drawCircle(0, 0, baseSize * 0.2); // 中心
      graphics.endFill();
      break;

    case "peace":
      // 柔らかな花（円形の花びら）
      graphics.beginFill(color);
      graphics.drawCircle(0, 0, baseSize * 0.5);
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        const petalX = Math.cos(angle) * baseSize * 0.4;
        const petalY = Math.sin(angle) * baseSize * 0.4;
        graphics.drawCircle(petalX, petalY, baseSize * 0.25);
      }
      graphics.endFill();
      break;

    case "stress":
      // とげのある花（多角形）
      graphics.beginFill(color);
      const points: number[] = [];
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8;
        const radius = baseSize * (0.4 + (i % 2) * 0.2);
        points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
      }
      graphics.drawPolygon(points);
      graphics.endFill();
      break;

    case "sadness":
      // しだれた花（滴型）
      graphics.beginFill(color);
      graphics.drawEllipse(0, 0, baseSize * 0.4, baseSize * 0.6);
      graphics.drawEllipse(0, -baseSize * 0.3, baseSize * 0.3, baseSize * 0.4);
      graphics.endFill();
      break;

    case "inspiration":
      // 幾何学的な花（六角形）
      graphics.beginFill(color);
      const hexPoints: number[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        hexPoints.push(Math.cos(angle) * baseSize * 0.5, Math.sin(angle) * baseSize * 0.5);
      }
      graphics.drawPolygon(hexPoints);
      graphics.endFill();
      break;

    case "nostalgia":
      // 雲のような花（複数の円）
      graphics.beginFill(color);
      graphics.drawCircle(0, 0, baseSize * 0.4);
      graphics.drawCircle(-baseSize * 0.2, 0, baseSize * 0.3);
      graphics.drawCircle(baseSize * 0.2, 0, baseSize * 0.3);
      graphics.drawCircle(0, -baseSize * 0.2, baseSize * 0.3);
      graphics.endFill();
      break;

    case "confusion":
      // 不規則な花（ランダムな点）
      graphics.beginFill(color);
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8 + random1 * Math.PI;
        const radius = baseSize * (0.3 + random2 * 0.3);
        const dotX = Math.cos(angle) * radius;
        const dotY = Math.sin(angle) * radius;
        graphics.drawCircle(dotX, dotY, baseSize * 0.15);
      }
      graphics.endFill();
      break;

    default:
      // デフォルト: シンプルな花
      graphics.beginFill(color);
      graphics.drawCircle(0, 0, baseSize * 0.5);
      graphics.endFill();
  }
}

/**
 * 地下エリア用の植物（ツタ・苔）を描画
 */
function drawUndergroundPlant(
  graphics: Graphics,
  category: EmotionCategory | string,
  strength: number,
  color: number,
  seed: number
) {
  const size = 3 + strength * 5; // 3-8ピクセル
  const baseSize = Math.max(2, Math.min(8, size));

  // シードベースの疑似乱数で一貫性を保つ
  const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
  const random2 = ((seed * 9301 + 49297 + 1) % 233280) / 233280;

  switch (category) {
    case "joy":
      // 光る苔（小さな点が集まった）
      graphics.beginFill(color);
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        const dotX = Math.cos(angle) * baseSize * 0.4;
        const dotY = Math.sin(angle) * baseSize * 0.4;
        graphics.drawCircle(dotX, dotY, baseSize * 0.2);
      }
      graphics.endFill();
      break;

    case "peace":
      // 柔らかな苔（楕円形）
      graphics.beginFill(color);
      graphics.drawEllipse(0, 0, baseSize * 0.6, baseSize * 0.4);
      graphics.drawEllipse(0, baseSize * 0.3, baseSize * 0.4, baseSize * 0.3);
      graphics.endFill();
      break;

    case "stress":
      // とげのあるツタ（ジグザグ）
      graphics.beginFill(color);
      const points: number[] = [];
      for (let i = 0; i < 6; i++) {
        const x = (i - 2.5) * baseSize * 0.3;
        const y = (i % 2) * baseSize * 0.2 - baseSize * 0.1;
        points.push(x, y);
      }
      graphics.drawPolygon(points);
      graphics.endFill();
      break;

    case "sadness":
      // しだれたツタ（曲線）
      graphics.beginFill(color);
      graphics.drawEllipse(0, 0, baseSize * 0.5, baseSize * 0.7);
      graphics.drawEllipse(0, baseSize * 0.4, baseSize * 0.3, baseSize * 0.5);
      graphics.endFill();
      break;

    case "inspiration":
      // 幾何学的なツタ（菱形）
      graphics.beginFill(color);
      graphics.drawPolygon([
        -baseSize * 0.3, 0,
        0, -baseSize * 0.4,
        baseSize * 0.3, 0,
        0, baseSize * 0.4,
      ]);
      graphics.endFill();
      break;

    case "nostalgia":
      // 古い苔（不規則な形）
      graphics.beginFill(color);
      graphics.drawCircle(0, 0, baseSize * 0.4);
      graphics.drawCircle(-baseSize * 0.2, baseSize * 0.2, baseSize * 0.3);
      graphics.drawCircle(baseSize * 0.2, baseSize * 0.2, baseSize * 0.3);
      graphics.endFill();
      break;

    case "confusion":
      // 不規則なツタ（ランダムな点）
      graphics.beginFill(color);
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6 + random1 * Math.PI;
        const radius = baseSize * (0.2 + random2 * 0.3);
        const dotX = Math.cos(angle) * radius;
        const dotY = Math.sin(angle) * radius;
        graphics.drawCircle(dotX, dotY, baseSize * 0.15);
      }
      graphics.endFill();
      break;

    default:
      // デフォルト: シンプルな苔
      graphics.beginFill(color);
      graphics.drawEllipse(0, 0, baseSize * 0.5, baseSize * 0.3);
      graphics.endFill();
  }
}

/**
 * 植物のアニメーションを追加
 */
function addPlantAnimation(
  container: Container,
  category: EmotionCategory | string,
  ticker: Ticker,
  isSurface: boolean
): void {
  const startTime = Date.now();
  const baseX = container.x;
  const baseY = container.y;
  const baseRotation = container.rotation;
  const baseScale = container.scale.x;

  const animate = () => {
    const elapsed = (Date.now() - startTime) / 1000; // 秒単位

    if (isSurface) {
      // 地上エリア: 風に揺れるアニメーション
      switch (category) {
        case "joy":
          // 軽やかに揺れる
          const joySway = Math.sin(elapsed * 2) * 0.5;
          container.rotation = baseRotation + joySway * 0.1;
          const joyPulse = 1 + Math.sin(elapsed * 3) * 0.05;
          container.scale.set(baseScale * joyPulse);
          break;

        case "peace":
          // ゆっくり揺れる
          const peaceSway = Math.sin(elapsed * 1) * 0.3;
          container.rotation = baseRotation + peaceSway * 0.05;
          break;

        case "stress":
          // 微細な震え
          const stressShake = (Math.random() - 0.5) * 0.2;
          container.rotation = baseRotation + stressShake;
          break;

        case "sadness":
          // しだれる
          const sadnessSway = Math.sin(elapsed * 0.8) * 0.4;
          container.rotation = baseRotation + sadnessSway * 0.1;
          break;

        case "inspiration":
          // 回転しながら揺れる
          container.rotation = baseRotation + elapsed * 0.2;
          const inspirationSway = Math.sin(elapsed * 1.5) * 0.3;
          container.x = baseX + inspirationSway;
          break;

        case "nostalgia":
          // ゆっくり浮遊
          const nostalgiaFloat = Math.sin(elapsed * 0.5) * 0.2;
          container.y = baseY + nostalgiaFloat;
          break;

        case "confusion":
          // 不規則な動き
          const confusionX = (Math.random() - 0.5) * 0.3;
          const confusionY = (Math.random() - 0.5) * 0.3;
          container.x = baseX + confusionX;
          container.y = baseY + confusionY;
          break;

        default:
          // デフォルト: 微細な揺れ
          const defaultSway = Math.sin(elapsed * 1.2) * 0.2;
          container.rotation = baseRotation + defaultSway * 0.05;
      }
    } else {
      // 地下エリア: 静かな動き（ツタや苔の成長）
      switch (category) {
        case "joy":
          // 光る苔（点滅）
          const joyTwinkle = 0.7 + Math.sin(elapsed * 2) * 0.3;
          container.alpha = joyTwinkle;
          break;

        case "peace":
          // ゆっくり成長
          const peaceGrow = 0.9 + Math.sin(elapsed * 0.3) * 0.1;
          container.scale.set(baseScale * peaceGrow);
          break;

        case "stress":
          // 微細な震え
          const stressShake = (Math.random() - 0.5) * 0.1;
          container.rotation = baseRotation + stressShake;
          break;

        case "sadness":
          // しだれる
          const sadnessSway = Math.sin(elapsed * 0.5) * 0.2;
          container.rotation = baseRotation + sadnessSway * 0.05;
          break;

        case "inspiration":
          // ゆっくり回転
          container.rotation = baseRotation + elapsed * 0.1;
          break;

        case "nostalgia":
          // 静かに存在
          // アニメーションなし
          break;

        case "confusion":
          // 不規則な動き
          const confusionX = (Math.random() - 0.5) * 0.2;
          const confusionY = (Math.random() - 0.5) * 0.2;
          container.x = baseX + confusionX;
          container.y = baseY + confusionY;
          break;

        default:
          // デフォルト: 静かな存在
          break;
      }
    }
  };

  // ティッカーにアニメーション関数を追加
  ticker.add(animate);

  // コンテナが破棄されたときにアニメーションを停止
  container.on("destroyed", () => {
    ticker.remove(animate);
  });
}

