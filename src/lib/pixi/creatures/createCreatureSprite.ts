import { Application, Container, Graphics, Ticker } from "pixi.js";
import { getEmotionColor, type EmotionCategory } from "../utils/colorPalette";

interface CreatureSpriteProps {
  app: Application;
  type: "butterfly" | "bird" | "insect" | "bubble" | "energy" | "memory" | "lost" | "glowFungus" | "microbe";
  strength: number;
  x: number;
  y: number;
  isSurface: boolean; // 地上か地下か
  seed?: number;
}

/**
 * 生物スプライトを作成
 * 地上と地下で異なる生物を表示
 */
export function createCreatureSprite({
  app,
  type,
  strength,
  x,
  y,
  isSurface,
  seed = 0,
}: CreatureSpriteProps): Container {
  const container = new Container();
  container.x = x;
  container.y = y;

  const baseSize = 4 + strength * 4; // 感情の強度に応じてサイズを決定
  const finalSize = Math.max(3, Math.min(12, baseSize)); // 最小3, 最大12

  const color = getEmotionColor(type === "butterfly" || type === "bird" || type === "insect" 
    ? "joy" 
    : type === "bubble" 
    ? "sadness" 
    : type === "energy" 
    ? "stress" 
    : type === "memory" 
    ? "nostalgia" 
    : type === "lost" 
    ? "confusion" 
    : "inspiration");

  const graphics = new Graphics();

  // 地上と地下で異なる生物を描画
  if (isSurface) {
    // 地上エリアの生物
    switch (type) {
      case "butterfly":
        drawButterfly(graphics, finalSize, color, seed);
        break;
      case "bird":
        drawBird(graphics, finalSize, color, seed);
        break;
      case "insect":
        drawInsect(graphics, finalSize, color, seed);
        break;
      case "bubble":
        drawBubble(graphics, finalSize, color, seed);
        break;
      case "energy":
        drawEnergyParticle(graphics, finalSize, color, seed);
        break;
      case "memory":
        drawMemoryFragment(graphics, finalSize, color, seed);
        break;
      case "lost":
        drawLostLight(graphics, finalSize, color, seed);
        break;
      default:
        drawButterfly(graphics, finalSize, color, seed);
        break;
    }
  } else {
    // 地下エリアの生物
    switch (type) {
      case "glowFungus":
        drawGlowFungus(graphics, finalSize, color, seed);
        break;
      case "microbe":
        drawMicrobe(graphics, finalSize, color, seed);
        break;
      case "bubble":
        drawBubble(graphics, finalSize, color, seed);
        break;
      case "energy":
        drawEnergyParticle(graphics, finalSize, color, seed);
        break;
      case "memory":
        drawMemoryFragment(graphics, finalSize, color, seed);
        break;
      case "lost":
        drawLostLight(graphics, finalSize, color, seed);
        break;
      default:
        drawGlowFungus(graphics, finalSize, color, seed);
        break;
    }
  }

  container.addChild(graphics);

  // アニメーションを追加
  addCreatureAnimation(container, type, app.ticker, isSurface, strength, seed);

  return container;
}

// ========== 地上エリアの生物 ==========

/**
 * 蝶々を描画
 */
function drawButterfly(graphics: Graphics, size: number, color: number, seed: number) {
  const random = (s: number) => ((s * 9301 + 49297) % 233280) / 233280;
  
  // 体
  graphics.beginFill(color);
  graphics.drawRect(-size / 8, -size / 2, size / 4, size);
  graphics.endFill();
  
  // 羽（左右対称）
  graphics.beginFill(color, 0.7);
  // 上羽
  graphics.drawEllipse(-size / 2, -size / 3, size / 2, size / 3);
  graphics.drawEllipse(size / 2, -size / 3, size / 2, size / 3);
  // 下羽
  graphics.drawEllipse(-size / 2, size / 6, size / 3, size / 4);
  graphics.drawEllipse(size / 2, size / 6, size / 3, size / 4);
  graphics.endFill();
  
  // 触角
  graphics.lineStyle(1, color);
  graphics.moveTo(-size / 8, -size / 2);
  graphics.lineTo(-size / 4, -size / 2 - size / 4);
  graphics.moveTo(size / 8, -size / 2);
  graphics.lineTo(size / 4, -size / 2 - size / 4);
  graphics.lineStyle(0);
}

/**
 * 鳥を描画
 */
function drawBird(graphics: Graphics, size: number, color: number, seed: number) {
  // 体
  graphics.beginFill(color);
  graphics.drawEllipse(0, 0, size / 2, size / 3);
  graphics.endFill();
  
  // 頭
  graphics.beginFill(color);
  graphics.drawCircle(size / 4, -size / 6, size / 4);
  graphics.endFill();
  
  // くちばし
  graphics.beginFill(color, 0.8);
  graphics.drawPolygon([
    size / 2, -size / 6,
    size / 2 + size / 6, -size / 8,
    size / 2, -size / 12,
  ]);
  graphics.endFill();
  
  // 翼
  graphics.beginFill(color, 0.6);
  graphics.drawEllipse(-size / 4, 0, size / 3, size / 2);
  graphics.endFill();
}

/**
 * 昆虫を描画
 */
function drawInsect(graphics: Graphics, size: number, color: number, seed: number) {
  // 体
  graphics.beginFill(color);
  graphics.drawEllipse(0, 0, size / 2, size / 3);
  graphics.endFill();
  
  // 脚（左右3本ずつ）
  graphics.lineStyle(1, color);
  for (let i = -1; i <= 1; i++) {
    graphics.moveTo(-size / 3, i * size / 6);
    graphics.lineTo(-size / 2, i * size / 6 + size / 8);
    graphics.moveTo(size / 3, i * size / 6);
    graphics.lineTo(size / 2, i * size / 6 + size / 8);
  }
  graphics.lineStyle(0);
  
  // 触角
  graphics.lineStyle(1, color);
  graphics.moveTo(-size / 4, -size / 3);
  graphics.lineTo(-size / 3, -size / 2);
  graphics.moveTo(size / 4, -size / 3);
  graphics.lineTo(size / 3, -size / 2);
  graphics.lineStyle(0);
}

/**
 * 水の泡を描画（地上・地下共通）
 */
function drawBubble(graphics: Graphics, size: number, color: number, seed: number) {
  // 外側の円
  graphics.lineStyle(1, color, 0.6);
  graphics.drawCircle(0, 0, size / 2);
  graphics.lineStyle(0);
  
  // 内側のハイライト
  graphics.beginFill(color, 0.3);
  graphics.drawCircle(-size / 6, -size / 6, size / 4);
  graphics.endFill();
}

/**
 * エネルギーの粒を描画（地上・地下共通）
 */
function drawEnergyParticle(graphics: Graphics, size: number, color: number, seed: number) {
  // 中心の点
  graphics.beginFill(color);
  graphics.drawCircle(0, 0, size / 3);
  graphics.endFill();
  
  // 外側の光の輪
  graphics.lineStyle(1, color, 0.5);
  graphics.drawCircle(0, 0, size / 2);
  graphics.drawCircle(0, 0, size / 1.5);
  graphics.lineStyle(0);
}

/**
 * 記憶の欠片を描画（地上・地下共通）
 */
function drawMemoryFragment(graphics: Graphics, size: number, color: number, seed: number) {
  const random = (s: number) => ((s * 9301 + 49297) % 233280) / 233280;
  
  // 不規則な多角形
  const points: number[] = [];
  const sides = 5 + Math.floor(random(seed) * 3); // 5-7角形
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2;
    const radius = size / 2 * (0.7 + random(seed + i) * 0.3);
    points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  
  graphics.beginFill(color, 0.6);
  graphics.drawPolygon(points);
  graphics.endFill();
}

/**
 * 迷子の光を描画（地上・地下共通）
 */
function drawLostLight(graphics: Graphics, size: number, color: number, seed: number) {
  // 不規則な形の光
  graphics.beginFill(color, 0.5);
  graphics.drawCircle(0, 0, size / 2);
  graphics.endFill();
  
  // 外側の点滅する光
  graphics.lineStyle(1, color, 0.3);
  graphics.drawCircle(0, 0, size / 1.2);
  graphics.lineStyle(0);
}

// ========== 地下エリアの生物 ==========

/**
 * 発光菌類を描画
 */
function drawGlowFungus(graphics: Graphics, size: number, color: number, seed: number) {
  // 茎
  graphics.beginFill(color, 0.7);
  graphics.drawRect(-size / 8, 0, size / 4, size / 2);
  graphics.endFill();
  
  // 傘（発光）
  graphics.beginFill(color);
  graphics.drawEllipse(0, -size / 4, size / 2, size / 3);
  graphics.endFill();
  
  // 内側の発光
  graphics.beginFill(color, 0.5);
  graphics.drawEllipse(0, -size / 4, size / 3, size / 4);
  graphics.endFill();
}

/**
 * 微生物を描画
 */
function drawMicrobe(graphics: Graphics, size: number, color: number, seed: number) {
  // 単細胞生物のような形
  graphics.beginFill(color, 0.6);
  graphics.drawEllipse(0, 0, size / 2, size / 3);
  graphics.endFill();
  
  // 内部の核
  graphics.beginFill(color);
  graphics.drawCircle(0, 0, size / 4);
  graphics.endFill();
  
  // 周囲の突起
  graphics.lineStyle(1, color, 0.5);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    graphics.moveTo(Math.cos(angle) * size / 4, Math.sin(angle) * size / 4);
    graphics.lineTo(Math.cos(angle) * size / 2, Math.sin(angle) * size / 2);
  }
  graphics.lineStyle(0);
}

/**
 * 生物のアニメーションを追加
 */
function addCreatureAnimation(
  container: Container,
  type: string,
  ticker: Ticker,
  isSurface: boolean,
  strength: number,
  seed: number
): void {
  const startTime = Date.now();
  const baseX = container.x;
  const baseY = container.y;
  const baseRotation = container.rotation;
  const baseScale = container.scale.x;
  
  const random = (s: number) => ((s * 9301 + 49297) % 233280) / 233280;
  const speed = 0.5 + strength * 0.5; // 強度に応じて速度を調整

  const animate = () => {
    const elapsed = (Date.now() - startTime) / 1000; // 秒単位

    if (isSurface) {
      // 地上エリアのアニメーション
      switch (type) {
        case "butterfly":
          // 蝶々: 羽ばたきと浮遊
          const butterflyWing = Math.sin(elapsed * 8) * 0.3; // 羽ばたき
          container.rotation = baseRotation + butterflyWing;
          const butterflyFloat = Math.sin(elapsed * 1.5) * 2;
          container.y = baseY + butterflyFloat;
          const butterflyX = Math.sin(elapsed * 0.8) * 3;
          container.x = baseX + butterflyX;
          break;

        case "bird":
          // 鳥: 滑空と上下動
          const birdGlide = Math.sin(elapsed * 0.5) * 5;
          container.y = baseY + birdGlide;
          const birdX = elapsed * speed * 2; // 横方向に移動
          container.x = baseX + birdX;
          break;

        case "insect":
          // 昆虫: 不規則な動き
          const insectX = Math.sin(elapsed * 3 + seed) * 2;
          const insectY = Math.cos(elapsed * 2.5 + seed) * 1.5;
          container.x = baseX + insectX;
          container.y = baseY + insectY;
          break;

        case "bubble":
          // 水の泡: ゆっくり上昇
          container.y = baseY - elapsed * speed * 10;
          const bubbleSway = Math.sin(elapsed * 0.5) * 1;
          container.x = baseX + bubbleSway;
          break;

        case "energy":
          // エネルギーの粒: 高速回転と脈動
          container.rotation = baseRotation + elapsed * 5;
          const energyPulse = 1 + Math.sin(elapsed * 3) * 0.2;
          container.scale.set(baseScale * energyPulse);
          break;

        case "memory":
          // 記憶の欠片: ゆっくり浮遊
          const memoryFloat = Math.sin(elapsed * 0.8) * 2;
          container.y = baseY + memoryFloat;
          const memoryRotate = elapsed * 0.3;
          container.rotation = baseRotation + memoryRotate;
          break;

        case "lost":
          // 迷子の光: 不規則な動き
          const lostX = (Math.random() - 0.5) * 3;
          const lostY = (Math.random() - 0.5) * 3;
          container.x = baseX + lostX;
          container.y = baseY + lostY;
          const lostPulse = 1 + Math.sin(elapsed * 4) * 0.3;
          container.scale.set(baseScale * lostPulse);
          break;
      }
    } else {
      // 地下エリアのアニメーション
      switch (type) {
        case "glowFungus":
          // 発光菌類: ゆっくり発光
          const fungusGlow = 0.7 + Math.sin(elapsed * 1.5) * 0.3;
          container.alpha = fungusGlow;
          break;

        case "microbe":
          // 微生物: ゆっくり移動
          const microbeX = Math.sin(elapsed * 0.5 + seed) * 2;
          const microbeY = Math.cos(elapsed * 0.6 + seed) * 1.5;
          container.x = baseX + microbeX;
          container.y = baseY + microbeY;
          break;

        case "bubble":
          // 水の泡: ゆっくり上昇（地下でも）
          container.y = baseY - elapsed * speed * 8;
          const bubbleSway = Math.sin(elapsed * 0.4) * 1;
          container.x = baseX + bubbleSway;
          break;

        case "energy":
          // エネルギーの粒: 高速回転と脈動
          container.rotation = baseRotation + elapsed * 4;
          const energyPulse = 1 + Math.sin(elapsed * 2.5) * 0.25;
          container.scale.set(baseScale * energyPulse);
          break;

        case "memory":
          // 記憶の欠片: ゆっくり浮遊
          const memoryFloat = Math.sin(elapsed * 0.6) * 1.5;
          container.y = baseY + memoryFloat;
          const memoryRotate = elapsed * 0.2;
          container.rotation = baseRotation + memoryRotate;
          break;

        case "lost":
          // 迷子の光: 不規則な動き
          const lostX = (Math.random() - 0.5) * 2;
          const lostY = (Math.random() - 0.5) * 2;
          container.x = baseX + lostX;
          container.y = baseY + lostY;
          const lostPulse = 1 + Math.sin(elapsed * 3) * 0.25;
          container.scale.set(baseScale * lostPulse);
          break;
      }
    }
  };

  ticker.add(animate);
  
  // コンテナが破棄されたときにアニメーションを停止
  container.on("destroyed", () => {
    ticker.remove(animate);
  });
}

