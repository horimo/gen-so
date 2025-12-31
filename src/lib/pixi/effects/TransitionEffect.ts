"use client";

import { Graphics, Container, Ticker } from "pixi.js";

/**
 * トランジションパーティクルのデータ構造
 */
interface TransitionParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number; // ライフタイム（0-1）
}

/**
 * トランジションの状態
 */
export type TransitionState = "idle" | "fadingOut" | "fadingIn" | "complete";

/**
 * トランジションエフェクトの設定
 */
export interface TransitionConfig {
  fadeDuration: number; // フェード時間（ミリ秒）
  jumpThreshold: number; // 深度ジャンプの閾値
}

/**
 * デフォルト設定
 */
const DEFAULT_CONFIG: TransitionConfig = {
  fadeDuration: 300, // 0.3秒
  jumpThreshold: 100, // 深度の変化が100以上でジャンプと判定
};

/**
 * トランジションエフェクトを作成
 */
export function createTransitionEffect(
  container: Container,
  viewportWidth: number,
  viewportHeight: number,
  ticker: Ticker,
  config: Partial<TransitionConfig> = {}
): {
  fadeLayer: Graphics;
  particleContainer: Container;
  startTransition: (direction: "up" | "down") => void;
  updateTransition: (deltaTime: number) => void;
  getState: () => TransitionState;
} {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // フェードレイヤーを作成（画面全体を覆う黒いレイヤー）
  const fadeLayer = new Graphics();
  fadeLayer.name = "transition-fade-layer";
  fadeLayer.zIndex = 1000; // 最前面に配置
  fadeLayer.visible = false;
  fadeLayer.alpha = 0;
  fadeLayer.eventMode = "none"; // イベントをブロックしない

  // フェードレイヤーを描画
  fadeLayer.clear();
  fadeLayer.beginFill(0x000000, 1.0);
  fadeLayer.drawRect(0, 0, viewportWidth, viewportHeight);
  fadeLayer.endFill();

  container.addChild(fadeLayer);

  // トランジションパーティクル用のコンテナ
  const particleContainer = new Container();
  particleContainer.name = "transition-particles";
  particleContainer.zIndex = 999; // フェードレイヤーの後ろ
  particleContainer.visible = false;
  particleContainer.eventMode = "none";
  container.addChild(particleContainer);

  // パーティクルの管理
  const particles: TransitionParticle[] = [];
  const particleGraphicsMap = new Map<number, Graphics>();

  // トランジションの状態管理
  let state: TransitionState = "idle";
  let fadeProgress = 0; // 0-1
  let fadeDirection: "up" | "down" | null = null;
  let fadeStartTime = 0;

  /**
   * パーティクルを生成
   */
  const createParticles = (direction: "up" | "down", count: number = 50) => {
    // 既存のパーティクルをクリア
    particles.length = 0;
    particleGraphicsMap.forEach((graphics) => {
      particleContainer.removeChild(graphics);
      graphics.destroy();
    });
    particleGraphicsMap.clear();

    // 新しいパーティクルを生成
    for (let i = 0; i < count; i++) {
      const particle: TransitionParticle = {
        x: Math.random() * viewportWidth,
        y: direction === "up" ? viewportHeight + Math.random() * 200 : -Math.random() * 200,
        vx: (Math.random() - 0.5) * 2, // 横方向の速度（-1 ～ 1）
        vy: direction === "up" ? -(3 + Math.random() * 5) : (3 + Math.random() * 5), // 縦方向の速度
        size: 2 + Math.random() * 3, // 2-5px
        alpha: 0.6 + Math.random() * 0.4, // 0.6-1.0
        life: 1.0,
      };

      particles.push(particle);

      // Graphicsを作成
      const graphics = new Graphics();
      graphics.clear();
      graphics.beginFill(0xffffff, 1.0);
      graphics.drawCircle(0, 0, particle.size);
      graphics.endFill();
      graphics.x = particle.x;
      graphics.y = particle.y;
      graphics.alpha = particle.alpha;

      particleGraphicsMap.set(i, graphics);
      particleContainer.addChild(graphics);
    }

    particleContainer.visible = true;
  };

  /**
   * パーティクルを更新
   */
  const updateParticles = (deltaTime: number) => {
    if (particles.length === 0) return;

    particles.forEach((particle, index) => {
      const graphics = particleGraphicsMap.get(index);
      if (!graphics) return;

      // 位置を更新
      particle.x += particle.vx * deltaTime * 60;
      particle.y += particle.vy * deltaTime * 60;

      // ライフタイムを減少（1秒で消滅）
      particle.life -= deltaTime;
      if (particle.life <= 0) {
        particle.life = 0;
      }

      // 画面外に出たら再配置
      if (particle.y < -100 || particle.y > viewportHeight + 100) {
        particle.y = fadeDirection === "up" ? viewportHeight + Math.random() * 200 : -Math.random() * 200;
        particle.x = Math.random() * viewportWidth;
        particle.life = 1.0;
      }

      // Graphicsを更新
      graphics.x = particle.x;
      graphics.y = particle.y;
      graphics.alpha = particle.alpha * particle.life;
    });
  };

  /**
   * トランジションを開始
   */
  const startTransition = (direction: "up" | "down") => {
    if (state !== "idle") return; // 既にトランジション中ならスキップ

    state = "fadingOut";
    fadeDirection = direction;
    fadeProgress = 0;
    fadeStartTime = Date.now();
    fadeLayer.visible = true;

    // パーティクルを生成
    createParticles(direction, 50);
  };

  /**
   * トランジションを更新
   */
  const updateTransition = (deltaTime: number) => {
    // パーティクルを更新（トランジション中のみ）
    if (state !== "idle" && state !== "complete") {
      updateParticles(deltaTime);
    }

    if (state === "idle" || state === "complete") return;

    const elapsed = Date.now() - fadeStartTime;
    const progress = Math.min(elapsed / finalConfig.fadeDuration, 1);

    if (state === "fadingOut") {
      // フェードアウト中
      fadeProgress = progress;
      fadeLayer.alpha = fadeProgress;

      if (progress >= 1) {
        // フェードアウト完了 → フェードイン開始
        state = "fadingIn";
        fadeStartTime = Date.now();
      }
    } else if (state === "fadingIn") {
      // フェードイン中
      fadeProgress = 1 - progress;
      fadeLayer.alpha = fadeProgress;

      if (progress >= 1) {
        // フェードイン完了
        state = "complete";
        fadeLayer.visible = false;
        fadeLayer.alpha = 0;
        fadeProgress = 0;
        fadeDirection = null;

        // パーティクルを非表示
        particleContainer.visible = false;
        particles.length = 0;
        particleGraphicsMap.forEach((graphics) => {
          particleContainer.removeChild(graphics);
          graphics.destroy();
        });
        particleGraphicsMap.clear();

        // 少し遅延してからidleに戻す
        setTimeout(() => {
          state = "idle";
        }, 50);
      }
    }
  };

  /**
   * 現在の状態を取得
   */
  const getState = () => state;

  return {
    fadeLayer,
    particleContainer,
    startTransition,
    updateTransition,
    getState,
  };
}

/**
 * 深度ジャンプを検知してトランジションを開始
 */
export function detectDepthJump(
  currentDepth: number,
  previousDepth: number,
  threshold: number = 100
): { isJump: boolean; direction: "up" | "down" | null } {
  const depthDelta = currentDepth - previousDepth;
  const isJump = Math.abs(depthDelta) > threshold;

  if (!isJump) {
    return { isJump: false, direction: null };
  }

  // 深度が増加（下にスクロール）→ 上向きのトランジション
  // 深度が減少（上にスクロール）→ 下向きのトランジション
  const direction = depthDelta > 0 ? "up" : "down";

  return { isJump: true, direction };
}

