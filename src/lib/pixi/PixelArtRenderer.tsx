"use client";

import { useEffect, useRef } from "react";
import { Application, Graphics, Container } from "pixi.js";
import { PixelateFilter } from "pixi-filters";

interface PixelArtRendererProps {
  width?: number;
  height?: number;
  pixelSize?: number; // ピクセル化のサイズ（デフォルト: 4）
  children?: React.ReactNode;
  onAppReady?: (app: Application) => void;
}

/**
 * PixiJSアプリケーションを初期化し、ピクセル化フィルターを適用するラッパーコンポーネント
 */
export function PixelArtRenderer({
  width,
  height,
  pixelSize = 4,
  children,
  onAppReady,
}: PixelArtRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const initApp = async () => {
      try {
        // PixiJS v8アプリケーションの初期化
        const app = new Application();
        
        await app.init({
          canvas: canvasRef.current!,
          width: width || window.innerWidth,
          height: height || window.innerHeight,
          backgroundColor: 0x87ceeb, // スカイブルー
          antialias: false, // アンチエイリアスを無効化（ドット絵らしさを保つ）
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });
        
      // ピクセル化フィルターを適用（v8対応版、解像度を上げるためデフォルト値を小さく）
      try {
        const filterSize = pixelSize || 2; // デフォルトを2に変更
        const pixelateFilter = new PixelateFilter(filterSize);
        app.stage.filters = [pixelateFilter];
      } catch (error) {
        console.warn("ピクセル化フィルターの適用に失敗しました:", error);
      }
        
        appRef.current = app;
        onAppReady?.(app);
      } catch (error) {
        console.error("PixiJS初期化エラー:", error);
      }
    };

    initApp();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [width, height, pixelSize, onAppReady]);

  return <canvas ref={canvasRef} />;
}

/**
 * 低解像度で描画して拡大表示するためのユーティリティ
 */
export function createPixelSprite(
  app: Application,
  drawFunction: (graphics: Graphics) => void,
  internalSize: number = 16,
  scale: number = 4
): Container {
  const container = new Container();
  
  // 低解像度のGraphicsを作成
  const graphics = new Graphics();
  graphics.scale.set(scale);
  
  // 描画関数を実行
  drawFunction(graphics);
  
  container.addChild(graphics);
  container.scale.set(1 / scale); // 表示時に元のサイズに戻す
  
  return container;
}

