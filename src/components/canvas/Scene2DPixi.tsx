"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { Application, Graphics, Container, Rectangle } from "pixi.js";
import { PixelateFilter } from "pixi-filters";
import { useEmotionStore } from "@/store/useEmotionStore";
import type { EmotionObject } from "@/store/useEmotionStore";
import { createPixelSprite } from "@/lib/pixi/PixelSprite";
import { getEmotionColor } from "@/lib/pixi/utils/colorPalette";
import { useInteractionStore } from "@/store/useInteractionStore";
import { createSparkleLayer, SPARKLE_LAYERS } from "@/lib/pixi/sparkles";
import { generatePlants2D, renderPlants2D } from "@/lib/pixi/plants/PlantSystem2D";
import { CreatureSystem2D } from "@/lib/pixi/creatures/CreatureSystem2D";
import { generateTerrariumPlants, renderTerrariumPlants, type TerrariumPlant } from "@/lib/pixi/terrarium/Terrarium2D";

/**
 * 全感情オブジェクトの分布を分析（地上エリア用）
 */
function analyzeAllEmotionDistribution(
  emotionObjects: Array<{
    category: string;
    strength: number;
  }>
) {
  // すべての感情オブジェクトを分析
  const emotionScores: { [key: string]: number } = {
    joy: 0,
    inspiration: 0,
    sadness: 0,
    peace: 0,
    stress: 0,
    nostalgia: 0,
    confusion: 0,
  };

  let totalStrength = 0;
  emotionObjects.forEach((emotion) => {
    const category = emotion.category as keyof typeof emotionScores;
    if (category in emotionScores) {
      emotionScores[category] += emotion.strength;
      totalStrength += emotion.strength;
    }
  });

  // 正規化（0-1の範囲）
  const normalizedScores = {
    joy: totalStrength > 0 ? emotionScores.joy / totalStrength : 0,
    inspiration: totalStrength > 0 ? emotionScores.inspiration / totalStrength : 0,
    sadness: totalStrength > 0 ? emotionScores.sadness / totalStrength : 0,
    peace: totalStrength > 0 ? emotionScores.peace / totalStrength : 0,
    stress: totalStrength > 0 ? emotionScores.stress / totalStrength : 0,
    nostalgia: totalStrength > 0 ? emotionScores.nostalgia / totalStrength : 0,
    confusion: totalStrength > 0 ? emotionScores.confusion / totalStrength : 0,
  };

  return {
    normalizedScores,
    totalCount: emotionObjects.length,
  };
}

/**
 * 感情の分布を分析して環境に反映（地下エリア用）
 */
function analyzeEmotionDistribution(
  emotionObjects: Array<{
    category: string;
    strength: number;
    depth: number;
  }>,
  currentDepth: number
) {
  // 現在の深度±800の範囲内の感情オブジェクトをフィルタリング
  const nearbyEmotions = emotionObjects.filter((emotion) => {
    const distance = Math.abs(emotion.depth - currentDepth);
    return distance <= 800;
  });

  // 各感情タイプの強度を合計
  const emotionScores = {
    joy: 0,
    inspiration: 0,
    sadness: 0,
    peace: 0,
    stress: 0,
    nostalgia: 0,
    confusion: 0,
  };

  let totalStrength = 0;
  nearbyEmotions.forEach((emotion) => {
    const category = emotion.category as keyof typeof emotionScores;
    if (category in emotionScores) {
      emotionScores[category] += emotion.strength;
      totalStrength += emotion.strength;
    }
  });

  // 正規化（0-1の範囲）
  const normalizedScores = {
    joy: totalStrength > 0 ? emotionScores.joy / totalStrength : 0,
    inspiration: totalStrength > 0 ? emotionScores.inspiration / totalStrength : 0,
    sadness: totalStrength > 0 ? emotionScores.sadness / totalStrength : 0,
    peace: totalStrength > 0 ? emotionScores.peace / totalStrength : 0,
    stress: totalStrength > 0 ? emotionScores.stress / totalStrength : 0,
    nostalgia: totalStrength > 0 ? emotionScores.nostalgia / totalStrength : 0,
    confusion: totalStrength > 0 ? emotionScores.confusion / totalStrength : 0,
  };

  return {
    normalizedScores,
    totalCount: nearbyEmotions.length,
  };
}

/**
 * 深度と感情の分布に応じて背景色を計算（2D版用）
 */
function getBackgroundColor(
  depth: number,
  emotionDistribution: ReturnType<typeof analyzeEmotionDistribution>
): { skyColor: number; undergroundColor: number } {
  const { normalizedScores } = emotionDistribution;
  const emotionInfluence = 0.1; // 10%の影響

  // 地上エリア（深度0-100）の背景色（スカイブルーを基本に感情の影響を追加）
  let skyR = 135; // 0x87 = 135
  let skyG = 206; // 0xce = 206
  let skyB = 235; // 0xeb = 235

  // joy/inspiration: 暖色（黄色・オレンジ）
  const warmInfluence = normalizedScores.joy + normalizedScores.inspiration;
  skyR += warmInfluence * 30 * emotionInfluence;
  skyG += warmInfluence * 20 * emotionInfluence;

  // sadness/peace: 青緑色
  const calmInfluence = normalizedScores.sadness + normalizedScores.peace;
  skyG += calmInfluence * 15 * emotionInfluence;
  skyB += calmInfluence * 30 * emotionInfluence;

  // stress: 赤・紫
  const stressInfluence = normalizedScores.stress;
  skyR += stressInfluence * 40 * emotionInfluence;
  skyB += stressInfluence * 20 * emotionInfluence;

  // nostalgia: セピア色
  const nostalgiaInfluence = normalizedScores.nostalgia;
  skyR += nostalgiaInfluence * 20 * emotionInfluence;
  skyG += nostalgiaInfluence * 15 * emotionInfluence;

  // confusion: 濁った緑
  const confusionInfluence = normalizedScores.confusion;
  skyG += confusionInfluence * 15 * emotionInfluence;

  // 値を0-255の範囲に制限
  skyR = Math.max(0, Math.min(255, Math.floor(skyR)));
  skyG = Math.max(0, Math.min(255, Math.floor(skyG)));
  skyB = Math.max(0, Math.min(255, Math.floor(skyB)));

  const skyColor = (skyR << 16) | (skyG << 8) | skyB;

  // 地下エリア（深度100以上）の背景色
  const normalizedDepth = Math.min((depth - 100) / 900, 1);
  let undergroundR = Math.floor(139 + (10 - 139) * normalizedDepth);
  let undergroundG = Math.floor(115 + (10 - 115) * normalizedDepth);
  let undergroundB = Math.floor(85 + (20 - 85) * normalizedDepth);

  // 感情の分布を背景色に反映（10%の影響）
  // joy/inspiration: 暖色
  undergroundR += warmInfluence * 30 * emotionInfluence;
  undergroundG += warmInfluence * 20 * emotionInfluence;

  // sadness/peace: 青緑色
  undergroundG += calmInfluence * 15 * emotionInfluence;
  undergroundB += calmInfluence * 30 * emotionInfluence;

  // stress: 赤・紫
  undergroundR += stressInfluence * 40 * emotionInfluence;
  undergroundB += stressInfluence * 20 * emotionInfluence;

  // nostalgia: セピア色
  undergroundR += nostalgiaInfluence * 20 * emotionInfluence;
  undergroundG += nostalgiaInfluence * 15 * emotionInfluence;

  // confusion: 濁った緑
  undergroundG += confusionInfluence * 15 * emotionInfluence;

  // 値を0-255の範囲に制限し、白っぽい色（r, g, b がすべて150以上）にならないように制限
  undergroundR = Math.max(0, Math.min(150, Math.floor(undergroundR)));
  undergroundG = Math.max(0, Math.min(150, Math.floor(undergroundG)));
  undergroundB = Math.max(0, Math.min(180, Math.floor(undergroundB)));

  const undergroundColor = (undergroundR << 16) | (undergroundG << 8) | undergroundB;

  return { skyColor, undergroundColor };
}

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
export function Scene2DPixi({ depth, othersLights = [], userId }: Scene2DPixiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const containerRef = useRef<Container | null>(null);
  const emotionObjects = useEmotionStore((state) => state.objects);
  const { setHoveredEmotion, setSelectedEmotion, hoveredEmotionId, selectedEmotionId } = useInteractionStore();
  
  // デバッグモードの状態管理
  const [debugMode, setDebugMode] = useState(false);
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());

  // 地面の位置を計算
  // ファーストビューの画面の下1/3を深度0として、そこから上を地上、下を地下とする
  const groundY = useMemo(() => {
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    // 深度0の時の地面の位置（画面の下1/3）
    const baseGroundY = viewportHeight * (2 / 3);
    // 深度が増えると、地面は上に移動（深度1につき10ピクセル上に）
    // 深度0の時はbaseGroundY、深度が増えると上に移動
    const depthOffset = depth * 10;
    return baseGroundY - depthOffset;
  }, [depth]);

  // 表示する感情オブジェクトをフィルタリング
  const visibleEmotions = useMemo(() => {
    return emotionObjects.filter((emotion) => {
      // 深度0以下（地上エリア）の感情オブジェクトは表示しない（地下のみ表示）
      if (emotion.depth <= 0) {
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

  // 地上エリアかどうかを判定
  // ファーストビューの画面の下1/3を深度0として、そこから上を地上、下を地下とする
  const isSurfaceArea = useMemo(() => {
    // 深度0が地面の位置（画面の下1/3）
    // 深度 <= 0: 地上エリア（地面より上、または地面上）
    // 深度 > 0: 地下エリア（地面より下、Y座標が大きい方向）
    return depth <= 0;
  }, [depth]);

  // 感情の分布を分析（地上エリアの場合は全感情、地下エリアの場合は近くの感情）
  const emotionDistribution = useMemo(() => {
    if (isSurfaceArea) {
      // 地上エリア: 全感情オブジェクトの分布を分析
      return analyzeAllEmotionDistribution(emotionObjects);
    } else {
      // 地下エリア: 現在の深度±800の範囲内の感情を分析
      return analyzeEmotionDistribution(emotionObjects, depth);
    }
  }, [emotionObjects, depth, isSurfaceArea]);

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
            // 初期描画時は感情分布を計算（簡易版）
            // 深度0が地面の位置、深度 < 0が地上、深度 > 0が地下
            const initialIsSurfaceArea = currentDepth < 0;
            const initialDistribution = initialIsSurfaceArea
              ? analyzeAllEmotionDistribution(emotionObjects)
              : analyzeEmotionDistribution(emotionObjects, currentDepth);
            drawBackgroundAndGround(appRef.current, containerRef.current, currentDepth, currentGroundY, initialDistribution);
            
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
      currentGroundY: number,
      currentEmotionDistribution: ReturnType<typeof analyzeEmotionDistribution>
    ) => {
      // 既存の背景と地面を削除
      const existingBg = container.getChildByName("background");
      const existingGround = container.getChildByName("ground");
      if (existingBg) container.removeChild(existingBg);
      if (existingGround) container.removeChild(existingGround);

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // 感情分布を考慮した背景色を計算
      const { skyColor, undergroundColor: calculatedUndergroundColor } = getBackgroundColor(
        currentDepth,
        currentEmotionDistribution
      );
      
      // 地下エリアの色を計算（深度0以下の場合は地面の色）
      const undergroundColor = currentDepth > 0 
        ? calculatedUndergroundColor
        : 0x8b7355; // 地面の色
      
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

    drawBackgroundAndGround(appRef.current, containerRef.current, depth, groundY, emotionDistribution);
  }, [depth, groundY, emotionDistribution, drawBackgroundAndGround]);

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
      // タッチデバイスではさらに大きなヒットエリアを設定
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const minHitAreaSize = isTouchDevice ? 100 : 80; // タッチデバイス: 100px、マウス: 80px
      sprite.hitArea = new Rectangle(
        -minHitAreaSize / 2,
        -minHitAreaSize / 2,
        minHitAreaSize,
        minHitAreaSize
      );
      
      // イベントの処理順序を改善（前面のオブジェクトが優先されるように）
      sprite.eventMode = "static"; // PixiJS v8の新しいプロパティ
      
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
      
      // クリック/タップ時のモーダル表示
      // pointertapはpointerdownとpointerupの両方が成功した場合に発火（タッチデバイスに最適）
      sprite.on("pointertap", (event) => {
        // イベントの伝播を停止して、モーダルの背景クリックと競合しないようにする
        event.stopPropagation();
        setSelectedEmotion(emotion.id);
      });
      
      // pointerdownでも処理（即座に反応するため）
      sprite.on("pointerdown", (event) => {
        event.stopPropagation();
        // タッチデバイスの場合は即座に選択（ドラッグを防ぐため）
        if (isTouchDevice) {
          setSelectedEmotion(emotion.id);
        }
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

  // 植物システムの描画
  useEffect(() => {
    if (!appRef.current || !containerRef.current) return;

    const app = appRef.current;
    const container = containerRef.current;

    // 植物を生成
    const plants = generatePlants2D({
      emotionObjects,
      currentDepth: depth,
      groundY,
      isSurfaceArea,
    });

    // 植物を描画
    renderPlants2D(plants, app, container, isSurfaceArea);
  }, [emotionObjects, depth, groundY, isSurfaceArea]);

  // 生物システムの描画
  useEffect(() => {
    if (!appRef.current || !containerRef.current) return;

    const app = appRef.current;
    const container = containerRef.current;

    // 既存の生物レイヤーを削除
    const existingCreatures = container.children.filter((child) => child.name?.startsWith("creature-system-"));
    existingCreatures.forEach((child) => container.removeChild(child));

    // 生物システムを呼び出して生物を生成・描画
    const creatureLayer = CreatureSystem2D({
      app,
      container,
      emotionObjects,
      currentDepth: depth,
      isSurfaceArea,
      groundY,
    });

    // 新しい生物レイヤーを追加
    container.addChild(creatureLayer);

    return () => {
      // コンポーネントがアンマウントされたときに生物レイヤーを削除
      if (creatureLayer && !creatureLayer.destroyed) {
        creatureLayer.destroy({ children: true });
      }
    };
  }, [emotionObjects, depth, isSurfaceArea, groundY]);

  // テラリウムの描画（地上エリアのみ）
  const [terrariumPlantData, setTerrariumPlantData] = useState<{
    plantData: TerrariumPlant[];
    totalGrowth: number;
  } | null>(null);

  // テラリウムコンテナの参照を保持
  const terrariumContainerRef = useRef<Container | null>(null);
  // テラリウムデータ生成時のgroundYを保持（植物の相対位置を計算するため）
  const terrariumBaseGroundYRef = useRef<number | null>(null);

  useEffect(() => {
    if (!userId) {
      setTerrariumPlantData(null);
      return;
    }

    // 地上エリア（depth <= 0）の場合のみテラリウムデータを読み込む
    if (!isSurfaceArea) {
      // 地上エリアでない場合はデータを保持（削除しない）
      return;
    }

    // 既にデータがある場合は再読み込みしない
    if (terrariumPlantData !== null) {
      return;
    }

    let isCancelled = false;

    const loadTerrariumData = async () => {
      try {
        console.log("テラリウムデータを読み込み中...", { userId, isSurfaceArea, depth, groundY });
        const data = await generateTerrariumPlants(userId, groundY);
        
        if (isCancelled) return;
        
        // テラリウムデータ生成時のgroundYを保存
        terrariumBaseGroundYRef.current = groundY;
        
        console.log("テラリウムデータ読み込み完了:", { 
          plantCount: data.plantData.length, 
          totalGrowth: data.totalGrowth 
        });
        setTerrariumPlantData(data);
      } catch (error) {
        if (isCancelled) return;
        console.error("テラリウムデータの読み込みエラー:", error);
        setTerrariumPlantData(null);
      }
    };

    loadTerrariumData();

    return () => {
      isCancelled = true;
    };
  }, [userId, isSurfaceArea]);

  // テラリウムの描画（データが変更された時のみ）
  useEffect(() => {
    if (!appRef.current || !containerRef.current) return;
    
    // テラリウムデータがない場合は既存のテラリウムコンテナを削除
    if (!terrariumPlantData || terrariumPlantData.plantData.length === 0) {
      const existingTerrariumContainer = containerRef.current.getChildByName("terrarium-container");
      if (existingTerrariumContainer) {
        containerRef.current.removeChild(existingTerrariumContainer);
        terrariumContainerRef.current = null;
        console.log("テラリウムコンテナを削除（データなし）");
      }
      return;
    }

    const app = appRef.current;
    const container = containerRef.current;

    // テラリウムデータ生成時のgroundYを使用
    const baseGroundY = terrariumBaseGroundYRef.current ?? groundY;

    console.log("テラリウム植物を描画:", { 
      plantCount: terrariumPlantData.plantData.length, 
      baseGroundY,
      currentGroundY: groundY,
      isSurfaceArea,
      depth
    });
    
    // テラリウムの植物を描画（コンテナを返す）
    const terrariumContainer = renderTerrariumPlants(terrariumPlantData.plantData, app, container, baseGroundY);
    terrariumContainerRef.current = terrariumContainer;
    
    // 描画後の確認
    const renderedPlants = terrariumContainer.children.filter((child) => 
      child.name?.startsWith("terrarium-plant-")
    );
    console.log("描画されたテラリウム植物数:", renderedPlants.length);
  }, [terrariumPlantData]); // テラリウムデータが変更された時のみ再描画

  // テラリウムコンテナの位置をスクロールに合わせて更新
  useEffect(() => {
    if (!terrariumContainerRef.current || terrariumBaseGroundYRef.current === null) return;

    const terrariumContainer = terrariumContainerRef.current;
    const baseGroundY = terrariumBaseGroundYRef.current;
    
    // 現在のgroundYとbaseGroundYの差分を計算して、コンテナの位置を調整
    // スクロールでgroundYが上に移動する（値が小さくなる）と、テラリウムも上に移動
    const yOffset = groundY - baseGroundY;
    terrariumContainer.y = yOffset;
    
    console.log("テラリウムコンテナ位置更新:", { 
      baseGroundY, 
      currentGroundY: groundY, 
      yOffset,
      containerY: terrariumContainer.y 
    });
  }, [groundY]); // groundYが変更されるたびに位置を更新
  
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

  // 星屑エフェクトの表示/非表示と不透明度を制御（深度0から徐々に表示）
  useEffect(() => {
    if (!containerRef.current) return;
    
    // 深度に基づいて不透明度を計算（深度0から徐々に表示）
    // 深度0以下（地上）: alpha = 0, 深度0-50: alpha = 0-1の線形補間, 深度50以上: alpha = 1
    const calculateAlpha = (currentDepth: number): number => {
      if (currentDepth <= 0) return 0; // 地上エリアでは非表示
      if (currentDepth >= 50) return 1; // 深度50以上で完全表示
      return currentDepth / 50; // 0から50の範囲で0から1に線形補間
    };
    
    const alpha = calculateAlpha(depth);
    
    // 星屑レイヤーを取得して表示/非表示と不透明度を制御
    const sparkleLayers = containerRef.current.children.filter((child) => 
      child.name?.startsWith("sparkles-")
    );
    
    sparkleLayers.forEach((layer) => {
      layer.visible = alpha > 0; // 不透明度が0より大きい場合のみ表示
      layer.alpha = alpha;
    });
  }, [depth]);

  // 他者の光の描画と点滅アニメーション
  useEffect(() => {
    if (!appRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const app = appRef.current;
    const ticker = app.ticker;

    // 既存の光を削除（アニメーションも停止）
    const existingLights = container.children.filter((child) => child.name?.startsWith("light-"));
    existingLights.forEach((child) => {
      // アニメーション関数を削除（もしあれば）
      if ((child as any).__twinkleAnimation) {
        ticker.remove((child as any).__twinkleAnimation);
      }
      container.removeChild(child);
    });

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
      lightGraphics.x = lightX;
      lightGraphics.y = lightY;
      lightGraphics.name = `light-${light.depth_y}-${index}`;
      
      // 点滅アニメーションの設定
      // 各光に異なる開始位相を持たせて、同期しないようにする
      const startPhase = (index * 0.1) % 1; // 各光で0.1ずつ位相をずらす
      const pulsePeriod = 0.5; // 0.5秒周期
      const startTime = Date.now();
      
      // アニメーション関数
      const twinkleAnimation = () => {
        const elapsed = (Date.now() - startTime) / 1000; // 秒単位
        
        // 0.5秒周期のパルス（sin波を使用）
        const phase = (elapsed / pulsePeriod + startPhase) % 1;
        const pulse = Math.sin(phase * Math.PI * 2);
        
        // 不透明度を0.4〜0.8の範囲で変化
        const minAlpha = 0.4;
        const maxAlpha = 0.8;
        lightGraphics.alpha = minAlpha + (maxAlpha - minAlpha) * (pulse * 0.5 + 0.5);
      };
      
      // アニメーション関数を参照として保存（後で削除するため）
      (lightGraphics as any).__twinkleAnimation = twinkleAnimation;
      
      // ティッカーにアニメーション関数を追加
      ticker.add(twinkleAnimation);
      
      // 初期不透明度を設定
      lightGraphics.alpha = 0.4 + (0.8 - 0.4) * (Math.sin(startPhase * Math.PI * 2) * 0.5 + 0.5);
      
      // コンテナが破棄されたときにアニメーションを停止
      lightGraphics.on("destroyed", () => {
        ticker.remove(twinkleAnimation);
      });
      
      container.addChild(lightGraphics);
    });
    
    // クリーンアップ関数
    return () => {
      // コンポーネントがアンマウントされたときに、残っているアニメーションを停止
      const remainingLights = container.children.filter((child) => child.name?.startsWith("light-"));
      remainingLights.forEach((child) => {
        if ((child as any).__twinkleAnimation) {
          ticker.remove((child as any).__twinkleAnimation);
        }
      });
    };
  }, [visibleLights, groundY, depth]);

  // デバッグモードのキーボードショートカット（Dキーでトグル）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Dキーでデバッグモードをトグル
      if (e.key === "d" || e.key === "D") {
        // 他の修飾キーが押されていない場合のみ
        if (!e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
          setDebugMode((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // FPS計算
  useEffect(() => {
    if (!appRef.current || !debugMode) {
      setFps(0);
      return;
    }

    const ticker = appRef.current.ticker;
    const updateFPS = () => {
      frameCountRef.current++;
      const now = Date.now();
      const elapsed = now - lastTimeRef.current;
      
      if (elapsed >= 1000) {
        const currentFPS = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(currentFPS);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
    };

    ticker.add(updateFPS);
    return () => {
      ticker.remove(updateFPS);
    };
  }, [debugMode]);

  // デバッグ用：地上と地下の境界線を描画
  useEffect(() => {
    if (!appRef.current || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    
    // 既存の境界線を削除
    const existingDebugLine = container.getChildByName("debug-ground-line");
    if (existingDebugLine) {
      container.removeChild(existingDebugLine);
    }

    if (!debugMode) {
      return;
    }

    const viewportWidth = window.innerWidth;

    // 地上と地下の境界線を描画（groundYの位置に点線）
    const debugLine = new Graphics();
    debugLine.name = "debug-ground-line";
    
    // 点線を描画（10ピクセル描画、5ピクセル空白を繰り返す）
    debugLine.lineStyle(2, 0xff0000, 0.8); // 赤色、不透明度0.8
    const dashLength = 10;
    const gapLength = 5;
    let currentX = 0;
    
    while (currentX < viewportWidth) {
      debugLine.moveTo(currentX, groundY);
      debugLine.lineTo(Math.min(currentX + dashLength, viewportWidth), groundY);
      currentX += dashLength + gapLength;
    }

    // 境界線を背景の上、地面の下に配置
    const backgroundIndex = container.children.findIndex((child) => child.name === "background");
    if (backgroundIndex >= 0) {
      container.addChildAt(debugLine, backgroundIndex + 1);
    } else {
      container.addChild(debugLine);
    }
  }, [debugMode, groundY]);

  // 描画オブジェクト数の計算
  const renderStats = useMemo(() => {
    if (!containerRef.current) {
      return {
        emotions: 0,
        plants: 0,
        terrariumPlants: 0,
        creatures: 0,
        lights: 0,
        sparkles: 0,
        total: 0,
      };
    }

    const container = containerRef.current;
    return {
      emotions: container.children.filter((child) => child.name?.startsWith("emotion-")).length,
      plants: container.children.filter((child) => child.name?.startsWith("plant-")).length,
      terrariumPlants: container.children.filter((child) => child.name?.startsWith("terrarium-plant-")).length,
      creatures: container.children.filter((child) => child.name?.startsWith("creature-")).length,
      lights: container.children.filter((child) => child.name?.startsWith("light-")).length,
      sparkles: container.children.filter((child) => child.name?.startsWith("sparkles-")).length,
      total: container.children.length,
    };
  }, [visibleEmotions, emotionObjects, visibleLights, terrariumPlantData, debugMode]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0"
        style={{ imageRendering: "pixelated" }}
      />
      
      {/* デバッグ情報の表示 */}
      {debugMode && (
        <div className="fixed top-4 left-4 z-50 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 font-mono text-xs text-white/90 max-w-md overflow-auto max-h-[80vh]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">デバッグ情報</h3>
            <button
              onClick={() => setDebugMode(false)}
              className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white/60 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2">
            {/* 深度情報 */}
            <div className="border-b border-white/10 pb-2">
              <div className="font-bold text-white/80 mb-1">深度情報</div>
              <div>現在の深度: <span className="text-yellow-400">{depth.toFixed(2)}</span></div>
              <div>groundY: <span className="text-yellow-400">{groundY.toFixed(2)}</span></div>
              <div>エリア: <span className={isSurfaceArea ? "text-green-400" : "text-blue-400"}>
                {isSurfaceArea ? "地上" : "地下"}
              </span></div>
            </div>

            {/* 描画オブジェクト数 */}
            <div className="border-b border-white/10 pb-2">
              <div className="font-bold text-white/80 mb-1">描画オブジェクト数</div>
              <div>感情オブジェクト: <span className="text-cyan-400">{renderStats.emotions}</span></div>
              <div>植物: <span className="text-green-400">{renderStats.plants}</span></div>
              <div>テラリウム植物: <span className="text-emerald-400">{renderStats.terrariumPlants}</span></div>
              <div>生物: <span className="text-pink-400">{renderStats.creatures}</span></div>
              <div>他者の光: <span className="text-yellow-400">{renderStats.lights}</span></div>
              <div>星屑レイヤー: <span className="text-purple-400">{renderStats.sparkles}</span></div>
              <div>合計: <span className="text-white">{renderStats.total}</span></div>
            </div>

            {/* 感情オブジェクト情報 */}
            <div className="border-b border-white/10 pb-2">
              <div className="font-bold text-white/80 mb-1">感情オブジェクト情報</div>
              <div>総数: <span className="text-cyan-400">{emotionObjects.length}</span></div>
              <div>表示中: <span className="text-cyan-400">{visibleEmotions.length}</span></div>
              <div>他者の光: <span className="text-yellow-400">{visibleLights.length}</span></div>
            </div>

            {/* 感情分布情報 */}
            <div className="border-b border-white/10 pb-2">
              <div className="font-bold text-white/80 mb-1">感情分布</div>
              <div className="text-xs space-y-0.5">
                <div>joy: <span className="text-yellow-400">{(emotionDistribution.normalizedScores.joy * 100).toFixed(1)}%</span></div>
                <div>peace: <span className="text-green-400">{(emotionDistribution.normalizedScores.peace * 100).toFixed(1)}%</span></div>
                <div>stress: <span className="text-red-400">{(emotionDistribution.normalizedScores.stress * 100).toFixed(1)}%</span></div>
                <div>sadness: <span className="text-blue-400">{(emotionDistribution.normalizedScores.sadness * 100).toFixed(1)}%</span></div>
                <div>inspiration: <span className="text-orange-400">{(emotionDistribution.normalizedScores.inspiration * 100).toFixed(1)}%</span></div>
                <div>nostalgia: <span className="text-amber-400">{(emotionDistribution.normalizedScores.nostalgia * 100).toFixed(1)}%</span></div>
                <div>confusion: <span className="text-lime-400">{(emotionDistribution.normalizedScores.confusion * 100).toFixed(1)}%</span></div>
                <div>総数: <span className="text-white">{emotionDistribution.totalCount}</span></div>
              </div>
            </div>

            {/* パフォーマンス情報 */}
            <div className="border-b border-white/10 pb-2">
              <div className="font-bold text-white/80 mb-1">パフォーマンス</div>
              <div>FPS: <span className={fps >= 55 ? "text-green-400" : fps >= 30 ? "text-yellow-400" : "text-red-400"}>
                {fps}
              </span></div>
            </div>

            {/* 星屑エフェクト情報 */}
            <div className="border-b border-white/10 pb-2">
              <div className="font-bold text-white/80 mb-1">星屑エフェクト</div>
              <div>深度0以下（地上）: 非表示</div>
              <div>深度0-50: 徐々に表示</div>
              <div>深度50以上: 完全表示</div>
              <div>現在の不透明度: <span className="text-purple-400">
                {depth <= 0 ? "0.0" : depth >= 50 ? "1.0" : (depth / 50).toFixed(2)}
              </span></div>
            </div>

            {/* テラリウム情報 */}
            <div className="border-b border-white/10 pb-2">
              <div className="font-bold text-white/80 mb-1">テラリウム</div>
              <div>userId: <span className="text-cyan-400">{userId || "なし"}</span></div>
              <div>データ状態: <span className={terrariumPlantData ? "text-green-400" : "text-red-400"}>
                {terrariumPlantData ? "読み込み済み" : "未読み込み"}
              </span></div>
              {terrariumPlantData && (
                <>
                  <div>植物数: <span className="text-emerald-400">{terrariumPlantData.plantData.length}</span></div>
                  <div>成長度: <span className="text-yellow-400">{(terrariumPlantData.totalGrowth * 100).toFixed(1)}%</span></div>
                </>
              )}
            </div>

            {/* 操作説明 */}
            <div className="text-xs text-white/60 pt-2">
              <div>Dキー: デバッグモード切替</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



