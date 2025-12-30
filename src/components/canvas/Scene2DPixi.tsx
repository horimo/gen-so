"use client";

import { useEffect, useRef, useMemo } from "react";
import { Application, Graphics, Container, Rectangle } from "pixi.js";
import { PixelateFilter } from "pixi-filters";
import { useEmotionStore } from "@/store/useEmotionStore";
import type { EmotionObject } from "@/store/useEmotionStore";
import { createPixelSprite } from "@/lib/pixi/PixelSprite";
import { getEmotionColor } from "@/lib/pixi/utils/colorPalette";
import { useInteractionStore } from "@/store/useInteractionStore";
import { createSparkleLayer, SPARKLE_LAYERS } from "@/lib/pixi/sparkles";

interface Scene2DPixiProps {
  depth: number;
  userId?: string;
  othersLights?: Array<{
    depth_y: number;
    category: "joy" | "peace" | "stress" | "sadness" | "inspiration" | "nostalgia" | "confusion";
    strength: number;
  }>;
}

/**
 * PixiJSを使用した2Dドット絵シーンコンポーネント
 */
export function Scene2DPixi({ depth, othersLights = [] }: Scene2DPixiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const containerRef = useRef<Container | null>(null);
  const emotionObjects = useEmotionStore((state) => state.objects);
  const { setHoveredEmotion, setSelectedEmotion, hoveredEmotionId, selectedEmotionId } = useInteractionStore();

  // 地面の位置を計算
  const groundY = useMemo(() => {
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const baseGroundY = viewportHeight * (2 / 3);
    const depthOffset = depth * 10;
    return baseGroundY - depthOffset;
  }, [depth]);

  // 表示する感情オブジェクトをフィルタリング
  const visibleEmotions = useMemo(() => {
    return emotionObjects.filter((emotion) => {
      if (emotion.depth <= 100) {
        return false;
      }
      const distance = Math.abs(emotion.depth - depth);
      return distance <= 800;
    });
  }, [emotionObjects, depth]);

  // 他者の光をフィルタリング
  const visibleLights = useMemo(() => {
    return othersLights.filter((light) => {
      const distance = Math.abs(light.depth_y - depth);
      return distance <= 200;
    });
  }, [othersLights, depth]);

  // PixiJSアプリケーションの初期化
  useEffect(() => {
    if (!canvasRef.current) return;

    const initApp = async () => {
      try {
        const app = new Application();
        
        await app.init({
          canvas: canvasRef.current!,
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: 0x87ceeb, // スカイブルー
          antialias: false,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        // ピクセル化フィルターを適用（解像度を上げるため値を小さく）
        try {
          const pixelateFilter = new PixelateFilter(2);
          app.stage.filters = [pixelateFilter];
        } catch (error) {
          console.warn("ピクセル化フィルターの適用に失敗しました:", error);
        }

        appRef.current = app;

        // メインコンテナを作成
        const container = new Container();
        app.stage.addChild(container);
        containerRef.current = container;

        // 初期描画を実行（最新のdepthとgroundYを使用）
        // 描画用のuseEffectが実行される前に、初期描画を確実に実行する
        setTimeout(() => {
          if (containerRef.current && appRef.current) {
            const currentDepth = depth;
            const currentGroundY = groundY;
            drawBackgroundAndGround(appRef.current, containerRef.current, currentDepth, currentGroundY);
            
            // 星屑エフェクトを作成（PixiJSアプリケーション初期化後に実行）
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // 既存の星屑レイヤーが存在する場合はスキップ
            const existingSparkles = containerRef.current.children.filter((child) => child.name?.startsWith("sparkles-"));
            if (existingSparkles.length === 0) {
              console.log("星屑エフェクト: PixiJS初期化後に星屑レイヤーを作成します");
              
              // 各星屑レイヤーを作成
              SPARKLE_LAYERS.forEach((config) => {
                console.log(`星屑エフェクト: レイヤー作成開始 - depthOffset: ${config.depthOffset}, count: ${config.count}`);
                const sparkleLayer = createSparkleLayer(
                  containerRef.current!,
                  config,
                  viewportWidth,
                  viewportHeight,
                  depth,
                  () => groundYRef.current.value,
                  appRef.current!.ticker,
                  () => depthRef.current // 深度を取得する関数を渡す（リアルタイムで更新される）
                );
                
                console.log(`星屑エフェクト: レイヤー作成完了 - depthOffset: ${config.depthOffset}, 子要素数: ${sparkleLayer.children.length}`);
                
                // 背景の上、地面の下に配置（z-indexの低い順）
                const backgroundIndex = containerRef.current!.children.findIndex((child) => child.name === "background");
                if (backgroundIndex >= 0) {
                  containerRef.current!.addChildAt(sparkleLayer, backgroundIndex + 1);
                  console.log(`星屑エフェクト: レイヤー追加 - depthOffset: ${config.depthOffset}, インデックス: ${backgroundIndex + 1}`);
                } else {
                  containerRef.current!.addChildAt(sparkleLayer, 0);
                  console.log(`星屑エフェクト: レイヤー追加 - depthOffset: ${config.depthOffset}, インデックス: 0`);
                }
              });
              
              console.log("星屑エフェクト: すべてのレイヤー作成完了", {
                totalChildren: containerRef.current!.children.length,
                sparkleLayers: containerRef.current!.children.filter(c => c.name?.startsWith("sparkles-")).length,
              });
            }
          }
        }, 0);

        // リサイズハンドラー
        const handleResize = () => {
          app.renderer.resize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      } catch (error) {
        console.error("PixiJS初期化エラー:", error);
      }
    };

    initApp();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
        containerRef.current = null;
      }
    };
  }, []);

  // 背景と地面を描画する関数
  const drawBackgroundAndGround = useMemo(() => {
    return (
      app: Application,
      container: Container,
      currentDepth: number,
      currentGroundY: number
    ) => {
      // 既存の背景と地面を削除
      const existingBg = container.getChildByName("background");
      const existingGround = container.getChildByName("ground");
      if (existingBg) container.removeChild(existingBg);
      if (existingGround) container.removeChild(existingGround);

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // 地下エリアの色を計算
      const undergroundColor = currentDepth >= 100 
        ? (() => {
            const normalizedDepth = Math.min((currentDepth - 100) / 900, 1);
            const r = Math.floor(139 + (10 - 139) * normalizedDepth);
            const g = Math.floor(115 + (10 - 115) * normalizedDepth);
            const b = Math.floor(85 + (20 - 85) * normalizedDepth);
            return (r << 16) | (g << 8) | b;
          })()
        : 0x8b7355; // 地面の色
      
      const skyColor = 0x87ceeb; // スカイブルー
      
      // 背景を描画
      const bgGraphics = new Graphics();
      bgGraphics.name = "background";
      
      // 地上部分（スカイブルー）
      bgGraphics.beginFill(skyColor);
      bgGraphics.drawRect(0, 0, viewportWidth, currentGroundY);
      bgGraphics.endFill();
      
      // 地下部分
      bgGraphics.beginFill(undergroundColor);
      bgGraphics.drawRect(0, currentGroundY, viewportWidth, viewportHeight - currentGroundY);
      bgGraphics.endFill();
      
      container.addChildAt(bgGraphics, 0);

      // 地面を描画
      const groundGraphics = new Graphics();
      groundGraphics.name = "ground";
      groundGraphics.beginFill(0x8b7355);
      groundGraphics.drawRect(0, currentGroundY, viewportWidth, viewportHeight * 0.33);
      groundGraphics.endFill();
      container.addChild(groundGraphics);
    };
  }, []);

  // 背景と地面の描画
  useEffect(() => {
    if (!appRef.current || !containerRef.current) return;

    drawBackgroundAndGround(appRef.current, containerRef.current, depth, groundY);
  }, [depth, groundY, drawBackgroundAndGround]);

  // 感情オブジェクトの描画
  useEffect(() => {
    if (!appRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const app = appRef.current;

    // 既存の感情オブジェクトを削除
    const existingEmotions = container.children.filter((child) => child.name?.startsWith("emotion-"));
    existingEmotions.forEach((child) => container.removeChild(child));

    // 新しい感情オブジェクトを追加
    visibleEmotions.forEach((emotion) => {
      const viewportHeight = window.innerHeight;
      const depthDiff = emotion.depth - depth;
      const emotionY = groundY + (depthDiff * 10);
      
      // 画面外のオブジェクトは表示しない
      if (emotionY < -100 || emotionY > viewportHeight + 100) {
        return;
      }

      // X位置を計算（画面幅の中央を基準に）
      const emotionX = (window.innerWidth / 2) + (emotion.x * 10); // emotion.xは-15から15の範囲

      const sprite = createPixelSprite({
        app,
        category: emotion.category,
        strength: emotion.strength,
        x: emotionX,
        y: emotionY,
        seed: emotion.id.charCodeAt(0) + emotion.depth, // confusion用のシード
      });
      
      sprite.name = `emotion-${emotion.id}`;
      
      // インタラクティブ機能を追加
      sprite.interactive = true;
      sprite.cursor = "pointer";
      
      // ヒットエリアを拡大（見た目は変えずにタップしやすくする）
      // 感情オブジェクトのサイズは6-24ピクセル程度なので、最低48ピクセルのヒットエリアを設定
      const minHitAreaSize = 48;
      sprite.hitArea = new Rectangle(
        -minHitAreaSize / 2,
        -minHitAreaSize / 2,
        minHitAreaSize,
        minHitAreaSize
      );
      
      // ホバー/クリックイベントのハンドラー
      let animationId: number | null = null;
      let targetScale = 1.0;
      
      // スムーズなスケールアニメーション関数
      const animateScale = () => {
        const currentScale = sprite.scale.x;
        const newScale = currentScale + (targetScale - currentScale) * 0.2;
        sprite.scale.set(newScale, newScale);
        
        if (Math.abs(newScale - targetScale) > 0.01) {
          animationId = requestAnimationFrame(animateScale);
        } else {
          sprite.scale.set(targetScale, targetScale);
          animationId = null;
        }
      };
      
      // ホバー時の視覚的フィードバック
      sprite.on("pointerover", () => {
        setHoveredEmotion(emotion.id);
        // 既存のアニメーションをキャンセル
        if (animationId !== null) {
          cancelAnimationFrame(animationId);
        }
        // スケールを1.2倍に（スムーズにアニメーション）
        targetScale = 1.2;
        animateScale();
      });
      
      sprite.on("pointerout", () => {
        if (hoveredEmotionId === emotion.id) {
          setHoveredEmotion(null);
        }
        // 既存のアニメーションをキャンセル
        if (animationId !== null) {
          cancelAnimationFrame(animationId);
        }
        // スケールを元に戻す（スムーズにアニメーション）
        targetScale = 1.0;
        animateScale();
      });
      
      // クリック時のモーダル表示
      sprite.on("pointerdown", (event) => {
        // イベントの伝播を停止して、モーダルの背景クリックと競合しないようにする
        event.stopPropagation();
        setSelectedEmotion(emotion.id);
      });
      
      // pointerupでもイベントを停止（タッチデバイス対応）
      sprite.on("pointerup", (event) => {
        event.stopPropagation();
      });
      
      // スプライトが破棄されたときにアニメーションをクリーンアップ
      sprite.on("destroyed", () => {
        if (animationId !== null) {
          cancelAnimationFrame(animationId);
        }
      });
      
      container.addChild(sprite);
    });
  }, [visibleEmotions, groundY, depth, setHoveredEmotion, setSelectedEmotion, hoveredEmotionId]);
  
  // モーダルが表示されている間は、Canvasのクリックイベントを無視
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    const handleCanvasClick = (event: MouseEvent | TouchEvent) => {
      // モーダルが表示されている場合は、Canvasのクリックイベントを無視
      if (selectedEmotionId) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    
    canvas.addEventListener("click", handleCanvasClick, true);
    canvas.addEventListener("touchend", handleCanvasClick, true);
    
    return () => {
      canvas.removeEventListener("click", handleCanvasClick, true);
      canvas.removeEventListener("touchend", handleCanvasClick, true);
    };
  }, [selectedEmotionId]);

  // groundYの参照を保持（星屑エフェクトで使用）
  const groundYRef = useRef({ value: groundY });
  useEffect(() => {
    groundYRef.current.value = groundY;
  }, [groundY]);
  
  // 深度の参照を保持（星屑エフェクトで使用）
  const depthRef = useRef(depth);
  useEffect(() => {
    depthRef.current = depth;
  }, [depth]);

  // 星屑エフェクトはPixiJSアプリケーション初期化時に作成されるため、ここでは削除

  // 他者の光の描画
  useEffect(() => {
    if (!appRef.current || !containerRef.current) return;

    const container = containerRef.current;

    // 既存の光を削除
    const existingLights = container.children.filter((child) => child.name?.startsWith("light-"));
    existingLights.forEach((child) => container.removeChild(child));

    // 新しい光を追加
    visibleLights.forEach((light, index) => {
      const viewportHeight = window.innerHeight;
      const depthDiff = light.depth_y - depth;
      const lightY = groundY + (depthDiff * 10);
      
      if (lightY < -100 || lightY > viewportHeight + 100) {
        return;
      }

      const lightX = window.innerWidth * (0.2 + (index % 80) / 100);
      const color = getEmotionColor(light.category);

      const lightGraphics = new Graphics();
      lightGraphics.beginFill(color);
      lightGraphics.drawCircle(0, 0, 4);
      lightGraphics.endFill();
      lightGraphics.alpha = 0.6;
      lightGraphics.x = lightX;
      lightGraphics.y = lightY;
      lightGraphics.name = `light-${light.depth_y}-${index}`;
      
      container.addChild(lightGraphics);
    });
  }, [visibleLights, groundY, depth]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

