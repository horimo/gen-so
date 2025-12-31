"use client";

import { Graphics, Container, Ticker, Color } from "pixi.js";
import { getEmotionColor } from "@/lib/pixi/utils/colorPalette";

/**
 * 感情パーティクルのデータ構造
 */
export interface EmotionParticle {
  x: number;
  y: number;
  vx: number; // 速度X
  vy: number; // 速度Y
  size: number;
  color: number;
  alpha: number;
  life: number; // ライフタイム（0-1）
  rotation: number;
  rotationSpeed: number;
  twinklePhase?: number; // 点滅の位相（stress用）
  twinkleSpeed?: number; // 点滅の速度（stress用）
  wavePhase?: number; // 波打つ動きの位相（sadness/peace用）
  waveAmplitude?: number; // 波の振幅（sadness/peace用）
}

/**
 * 感情タイプに応じたパーティクルの設定
 */
interface ParticleConfig {
  color: number;
  baseSpeed: number;
  sizeRange: [number, number];
  rotationSpeed: number;
  behavior: "float" | "twinkle" | "wave" | "random" | "rotate";
  upwardBias?: number; // 上方向へのバイアス（joy/inspiration用）
}

/**
 * 感情タイプごとのパーティクル設定
 */
const EMOTION_PARTICLE_CONFIGS: Record<string, ParticleConfig> = {
  joy: {
    color: 0xffd700, // ゴールド
    baseSpeed: 0.5,
    sizeRange: [3, 6],
    rotationSpeed: 2.0,
    behavior: "float",
    upwardBias: 0.7, // 上に浮かぶ
  },
  inspiration: {
    color: 0x9c27b0, // 紫
    baseSpeed: 0.6,
    sizeRange: [3, 6],
    rotationSpeed: 2.5,
    behavior: "float",
    upwardBias: 0.6,
  },
  sadness: {
    color: 0x1a237e, // 紺色
    baseSpeed: 0.2,
    sizeRange: [2.5, 5],
    rotationSpeed: 0.5,
    behavior: "wave",
  },
  peace: {
    color: 0x4dd0e1, // 青緑
    baseSpeed: 0.25,
    sizeRange: [2.5, 5],
    rotationSpeed: 0.6,
    behavior: "wave",
  },
  stress: {
    color: 0xff1744, // 赤
    baseSpeed: 1.2,
    sizeRange: [3, 7],
    rotationSpeed: 3.0,
    behavior: "twinkle",
  },
  nostalgia: {
    color: 0x8d6e63, // セピア
    baseSpeed: 0.3,
    sizeRange: [2.5, 5],
    rotationSpeed: 1.0,
    behavior: "rotate",
  },
  confusion: {
    color: 0x66bb6a, // 濁った緑
    baseSpeed: 0.8,
    sizeRange: [3, 6],
    rotationSpeed: 1.5,
    behavior: "random",
  },
};

/**
 * 感情の強度に応じたパーティクルの数を計算
 */
function getParticleCount(strength: number): number {
  if (strength <= 0.5) {
    return 3 + Math.floor(Math.random() * 3); // 3-5個
  } else if (strength <= 0.8) {
    return 5 + Math.floor(Math.random() * 4); // 5-8個
  } else {
    return 8 + Math.floor(Math.random() * 5); // 8-12個
  }
}

/**
 * 感情オブジェクト用のパーティクルシステムを作成
 */
export function createEmotionParticleSystem(
  container: Container,
  emotionX: number,
  emotionY: number,
  category: string,
  strength: number,
  ticker: Ticker
): Container {
  const particleContainer = new Container();
  particleContainer.name = `emotion-particles-${category}-${Date.now()}`;
  
  // パーティクルコンテナの位置を感情オブジェクトの位置に設定
  particleContainer.x = emotionX;
  particleContainer.y = emotionY;
  particleContainer.visible = true; // 明示的に表示
  particleContainer.alpha = 1.0; // 不透明度を設定
  
  const config = EMOTION_PARTICLE_CONFIGS[category] || EMOTION_PARTICLE_CONFIGS.confusion;
  const particleCount = getParticleCount(strength);
  
  const particles: EmotionParticle[] = [];
  const graphicsMap = new Map<number, { graphics: Graphics; container: Container }>();
  
  // パーティクルを生成（感情オブジェクトの相対位置（0, 0を中心）に配置）
  const radius = 20 + strength * 20; // 強度に応じて半径を調整（20-40px）
  
  for (let i = 0; i < particleCount; i++) {
    // ランダムな角度と距離で配置（相対位置）
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    const x = Math.cos(angle) * distance; // 相対位置（0, 0を中心）
    const y = Math.sin(angle) * distance; // 相対位置（0, 0を中心）
    
    // 速度を計算（感情タイプに応じて）
    let vx = (Math.random() - 0.5) * config.baseSpeed * 2;
    let vy = (Math.random() - 0.5) * config.baseSpeed * 2;
    
    // 上方向へのバイアス（joy/inspiration）
    if (config.upwardBias) {
      vy -= config.upwardBias * config.baseSpeed;
    }
    
    // サイズを計算
    const size = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
    
    // パーティクルデータを作成
    const particle: EmotionParticle = {
      x,
      y,
      vx,
      vy,
      size,
      color: config.color,
      alpha: 0.6 + Math.random() * 0.4, // 0.6-1.0
      life: 1.0, // 初期ライフタイム
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * config.rotationSpeed * 2,
    };
    
    // 動作タイプに応じた追加パラメータ
    if (config.behavior === "twinkle") {
      particle.twinklePhase = Math.random();
      particle.twinkleSpeed = 2.0 + Math.random() * 2.0; // 2-4秒周期
    } else if (config.behavior === "wave") {
      particle.wavePhase = Math.random() * Math.PI * 2;
      particle.waveAmplitude = 5 + Math.random() * 10; // 5-15px
    }
    
    particles.push(particle);
    
    // Graphicsを作成
    const graphics = new Graphics();
    graphics.clear();
    graphics.beginFill(particle.color);
    graphics.drawCircle(0, 0, particle.size);
    graphics.endFill();
    
    const particleContainerItem = new Container();
    particleContainerItem.addChild(graphics);
    particleContainerItem.x = particle.x;
    particleContainerItem.y = particle.y;
    particleContainerItem.alpha = particle.alpha;
    particleContainerItem.rotation = particle.rotation;
    particleContainerItem.visible = true;
    
    graphicsMap.set(i, { graphics, container: particleContainerItem });
    particleContainer.addChild(particleContainerItem);
  }
  
  // アニメーション関数
  let lastTime = Date.now();
  const animate = () => {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTime) / 1000; // 秒単位
    lastTime = currentTime;
    
    particles.forEach((particle, index) => {
      const particleData = graphicsMap.get(index);
      if (!particleData) return;
      
      const { container: particleContainerItem } = particleData;
      
      // ライフタイムを減少（5秒で消滅）
      particle.life -= deltaTime / 5.0;
      
      if (particle.life <= 0) {
        // パーティクルを削除
        particleContainer.removeChild(particleContainerItem);
        particleContainerItem.destroy();
        graphicsMap.delete(index);
        return;
      }
      
      // 動作タイプに応じた更新
      switch (config.behavior) {
        case "float":
          // 通常の浮遊（joy/inspiration）
          particle.x += particle.vx * deltaTime * 60;
          particle.y += particle.vy * deltaTime * 60;
          particle.rotation += particle.rotationSpeed * deltaTime;
          break;
          
        case "twinkle":
          // 点滅しながら不規則に動く（stress）
          particle.x += particle.vx * deltaTime * 60;
          particle.y += particle.vy * deltaTime * 60;
          particle.rotation += particle.rotationSpeed * deltaTime;
          
          // 不規則な動き（ランダムな方向に加速）
          if (Math.random() < 0.1) {
            particle.vx += (Math.random() - 0.5) * 2;
            particle.vy += (Math.random() - 0.5) * 2;
          }
          
          // 点滅エフェクト
          if (particle.twinklePhase !== undefined && particle.twinkleSpeed !== undefined) {
            particle.twinklePhase += deltaTime * particle.twinkleSpeed;
            if (particle.twinklePhase > 1) particle.twinklePhase -= 1;
            const twinkleIntensity = 0.3 + Math.sin(particle.twinklePhase * Math.PI * 2) * 0.7;
            particle.alpha = twinkleIntensity * (0.6 + Math.random() * 0.4);
          }
          break;
          
        case "wave":
          // 波打つ動き（sadness/peace）
          if (particle.wavePhase !== undefined && particle.waveAmplitude !== undefined) {
            particle.wavePhase += deltaTime * 2; // 波の速度
            const waveOffset = Math.sin(particle.wavePhase) * particle.waveAmplitude;
            particle.x += particle.vx * deltaTime * 60;
            particle.y += particle.vy * deltaTime * 60 + waveOffset * deltaTime * 60;
            particle.rotation += particle.rotationSpeed * deltaTime;
          }
          break;
          
        case "rotate":
          // 回転しながら浮遊（nostalgia）
          particle.x += particle.vx * deltaTime * 60;
          particle.y += particle.vy * deltaTime * 60;
          particle.rotation += particle.rotationSpeed * deltaTime;
          break;
          
        case "random":
          // 不規則な動き（confusion）
          particle.x += particle.vx * deltaTime * 60;
          particle.y += particle.vy * deltaTime * 60;
          particle.rotation += particle.rotationSpeed * deltaTime;
          
          // ランダムな方向に加速
          if (Math.random() < 0.2) {
            particle.vx += (Math.random() - 0.5) * 1.5;
            particle.vy += (Math.random() - 0.5) * 1.5;
          }
          break;
      }
      
      // 位置と回転を更新
      particleContainerItem.x = particle.x;
      particleContainerItem.y = particle.y;
      particleContainerItem.rotation = particle.rotation;
      particleContainerItem.alpha = particle.alpha * particle.life; // ライフタイムに応じてフェードアウト
    });
    
    // すべてのパーティクルが消滅したら、コンテナを削除
    if (particles.every((p, i) => {
      const data = graphicsMap.get(i);
      return !data || p.life <= 0;
    })) {
      particleContainer.destroy();
      ticker.remove(animate);
    }
  };
  
  // ティッカーにアニメーション関数を追加
  ticker.add(animate);
  
  // コンテナが破棄されたときにアニメーションを停止
  particleContainer.on("destroyed", () => {
    ticker.remove(animate);
  });
  
  return particleContainer;
}

/**
 * 感情オブジェクトのリストに対してパーティクルシステムを生成
 */
export function createParticlesForEmotions(
  container: Container,
  emotions: Array<{
    id: string;
    x: number;
    y: number;
    category: string;
    strength: number;
  }>,
  ticker: Ticker
): Map<string, Container> {
  const particleSystems = new Map<string, Container>();
  
  emotions.forEach((emotion) => {
    const particleSystem = createEmotionParticleSystem(
      container,
      emotion.x,
      emotion.y,
      emotion.category,
      emotion.strength,
      ticker
    );
    
    particleSystems.set(emotion.id, particleSystem);
    container.addChild(particleSystem);
  });
  
  return particleSystems;
}

