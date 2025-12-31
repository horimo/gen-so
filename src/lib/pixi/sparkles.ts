"use client";

import { Graphics, Container, Ticker, Color } from "pixi.js";

/**
 * 星屑パーティクルの設定
 */
export interface SparkleConfig {
  count: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
  depthOffset: number; // 深度オフセット（現在の深度からの距離）
}

/**
 * 星屑パーティクルのデータ
 */
interface SparkleParticle {
  x: number;
  y: number;
  baseY: number; // 基準Y位置
  vx: number; // X方向の速度
  vy: number; // Y方向の速度
  size: number;
  opacity: number;
  color: number; // 色（数値）
  twinklePhase: number; // 点滅の位相（0-1）
  twinkleSpeed: number; // 点滅の速度
}

/**
 * 星屑レイヤーを作成
 */
export function createSparkleLayer(
  container: Container,
  config: SparkleConfig,
  viewportWidth: number,
  viewportHeight: number,
  currentDepth: number,
  getGroundY: () => number, // groundYを取得する関数
  ticker: Ticker,
  getDepth?: () => number // 深度を取得する関数（オプション）
): Container {
  const sparkleContainer = new Container();
  sparkleContainer.name = `sparkles-${config.depthOffset}`;
  
  // 深度に基づいて不透明度を計算（深度0から徐々に表示）
  // 深度0以下（地上）: alpha = 0, 深度0-50: alpha = 0-1の線形補間, 深度50以上: alpha = 1
  const calculateAlpha = (depth: number): number => {
    if (depth <= 0) return 0; // 地上エリアでは非表示
    if (depth >= 50) return 1; // 深度50以上で完全表示
    return depth / 50; // 0から50の範囲で0から1に線形補間
  };
  
  const initialAlpha = calculateAlpha(currentDepth);
  sparkleContainer.visible = initialAlpha > 0; // 不透明度が0より大きい場合のみ表示
  sparkleContainer.alpha = initialAlpha;
  
  // 深度オフセットに応じたY位置の基準を保持
  let lastDepth = currentDepth;
  
  // 深度を取得する関数（外部から更新可能）
  const getCurrentDepth = getDepth || (() => currentDepth);
  
  // 再配置フラグ（ジャンプ直後のフレームで位置を確実に更新するため）
  let justRepositioned = false;
  
  const particles: SparkleParticle[] = [];
  
  // パーティクルを生成
  for (let i = 0; i < config.count; i++) {
    // ランダムな位置に配置（画面全体に散らばす）
    const x = Math.random() * viewportWidth;
    const y = Math.random() * viewportHeight; // Y位置もランダムに
    
    // ランダムな速度（-speed ～ speed）
    const vx = (Math.random() - 0.5) * config.speed * 2;
    const vy = (Math.random() - 0.5) * config.speed * 2;
    
    // 点滅の位相と速度（ランダム）
    const twinklePhase = Math.random();
    const twinkleSpeed = 0.5 + Math.random() * 0.5; // 0.5-1.0秒周期
    
    particles.push({
      x,
      y,
      baseY: y, // 基準Y位置（深度が変わっても相対位置を保つ）
      vx,
      vy,
      size: config.size,
      opacity: config.opacity,
      color: new Color(config.color).toNumber(),
      twinklePhase,
      twinkleSpeed,
    });
  }
  
  // 各パーティクルをGraphicsとして描画（Containerでラップしてalphaを制御）
  const graphicsMap = new Map<number, { graphics: Graphics; container: Container }>();
  
  particles.forEach((particle, index) => {
    const graphics = new Graphics();
    // Graphicsを描画（初期描画）
    graphics.clear();
    graphics.beginFill(particle.color, 1.0); // 不透明度は1.0で描画（alphaで制御）
    graphics.drawCircle(0, 0, Math.max(2, particle.size)); // 最小サイズを2に（確実に表示されるように）
    graphics.endFill();
    
    const particleContainer = new Container();
    particleContainer.addChild(graphics);
    particleContainer.x = particle.x;
    particleContainer.y = particle.y;
    particleContainer.alpha = particle.opacity; // 初期不透明度を設定
    particleContainer.visible = true; // 明示的に表示
    
    graphicsMap.set(index, { graphics, container: particleContainer });
    sparkleContainer.addChild(particleContainer);
  });
  
  // 星屑レイヤー作成完了
  
  // アニメーション関数
  let lastTime = Date.now();
  const animate = () => {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTime) / 1000; // 秒単位
    lastTime = currentTime;
    
    // 現在の深度を取得
    const nowDepth = getCurrentDepth();
    
    // 深度が変わった場合、星屑レイヤー全体のY位置を調整
    // 深度が深くなる（数値が大きくなる）ほど、星屑は上に移動（Y位置が小さくなる）
    const depthDelta = nowDepth - lastDepth;
    if (Math.abs(depthDelta) > 0.01) { // 閾値を0.1から0.01に下げる
      // 深度の急激な変化（ジャンプ）を検知（100以上）
      const isJump = Math.abs(depthDelta) > 100;
      
      if (isJump) {
        // 深度ジャンプ時：星屑の位置を一括で再配置して分散させる
        particles.forEach((particle, index) => {
          // ランダムな位置に再配置（画面全体に均等に分散）
          particle.x = Math.random() * viewportWidth;
          particle.y = Math.random() * viewportHeight;
          
          // 基準Y位置も更新
          particle.baseY = particle.y;
          
          // コンテナの位置も即座に更新（次のフレームを待たない）
          const particleData = graphicsMap.get(index);
          if (particleData) {
            particleData.container.x = particle.x;
            particleData.container.y = particle.y;
          }
        });
        
        // 星屑レイヤーの位置もリセット
        sparkleContainer.y = 0;
        lastDepth = nowDepth;
        
        // 再配置フラグを設定（次のフレームで位置を確実に更新するため）
        justRepositioned = true;
      } else {
        // 通常のスクロール：星屑レイヤーを移動
        const yDelta = -depthDelta * 10;
        sparkleContainer.y += yDelta;
        lastDepth = nowDepth;
      }
      
      // 星屑位置更新完了
    }
    
    particles.forEach((particle, index) => {
      const particleData = graphicsMap.get(index);
      if (!particleData) return;
      
      const { graphics, container } = particleData;
      
      // 再配置直後の場合は、位置を確実に更新
      if (justRepositioned) {
        container.x = particle.x;
        container.y = particle.y;
      } else {
        // 位置を更新（移動アニメーション）
        particle.x += particle.vx * deltaTime * 60; // 60fps基準
        particle.y += particle.vy * deltaTime * 60; // Y方向も移動
      }
      
      // 画面外に出たら反対側に戻す（X方向）
      if (particle.x < 0) particle.x += viewportWidth;
      if (particle.x > viewportWidth) particle.x -= viewportWidth;
      
      // Y方向の画面外判定（星屑レイヤーの位置を考慮）
      const worldY = sparkleContainer.y + particle.y;
      const margin = 200; // 余裕を持たせる
      
      if (worldY < -margin) {
        // 画面の上に出たら、画面の下からランダムな位置に再出現
        const randomOffset = Math.random() * viewportWidth; // X位置もランダムに
        particle.x = randomOffset;
        particle.y = viewportHeight + margin - sparkleContainer.y;
      } else if (worldY > viewportHeight + margin) {
        // 画面の下に出たら、画面の上からランダムな位置に再出現
        const randomOffset = Math.random() * viewportWidth; // X位置もランダムに
        particle.x = randomOffset;
        particle.y = -margin - sparkleContainer.y;
      }
      
      // 点滅アニメーション
      particle.twinklePhase += deltaTime * particle.twinkleSpeed;
      if (particle.twinklePhase > 1) particle.twinklePhase -= 1;
      
      // 点滅の強度（0.5-1.0の範囲）
      const twinkleIntensity = 0.5 + Math.sin(particle.twinklePhase * Math.PI * 2) * 0.5;
      const currentOpacity = particle.opacity * twinkleIntensity;
      
      // 位置を設定（Containerの位置を更新）
      // 再配置直後でない場合のみ位置を更新（再配置直後は既に更新済み）
      if (!justRepositioned) {
        container.x = particle.x;
        container.y = particle.y;
      }
      
      // 不透明度をContainerのalphaで制御（再描画不要）
      container.alpha = currentOpacity;
    });
    
    // 再配置フラグをリセット（1フレーム後に通常のアニメーションに戻す）
    if (justRepositioned) {
      justRepositioned = false;
    }
  };
  
  // ティッカーにアニメーション関数を追加
  ticker.add(animate);
  
  // コンテナが破棄されたときにアニメーションを停止
  sparkleContainer.on("destroyed", () => {
    ticker.remove(animate);
  });
  
  // 初期描画は上記で既に完了しているため、ここでは何もしない
  
  return sparkleContainer;
}

/**
 * 星屑レイヤーの設定（3D版の設定を参考）
 * 感情オブジェクトが目立つように、控えめな設定に調整
 */
export const SPARKLE_LAYERS: SparkleConfig[] = [
  {
    count: 120, // 200 → 120に削減
    size: 2.5, // 4 → 2.5に縮小
    speed: 0.4,
    opacity: 0.35, // 0.8 → 0.35に下げる（控えめに）
    color: "#ffffff",
    depthOffset: 0, // 現在の深度
  },
  {
    count: 80, // 150 → 80に削減
    size: 2, // 3 → 2に縮小
    speed: 0.3,
    opacity: 0.25, // 0.6 → 0.25に下げる
    color: "#a0a0ff",
    depthOffset: -500, // 500深度分後ろ
  },
  {
    count: 50, // 100 → 50に削減
    size: 1.5, // 2 → 1.5に縮小
    speed: 0.2,
    opacity: 0.18, // 0.5 → 0.18に下げる
    color: "#6666ff",
    depthOffset: -1000, // 1000深度分後ろ
  },
];

