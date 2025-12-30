"use client";

import { useEffect, useRef, useState } from "react";
import { Application, Graphics, Container } from "pixi.js";
import { PixelateFilter } from "pixi-filters";
import {
  drawStar,
  drawDiamond,
  drawDrop,
  drawHexagon,
  drawCloud,
  drawDistortedSquare,
  drawCircle,
} from "@/lib/pixi/shapes";
import { getEmotionColor, pixelPalette } from "@/lib/pixi/utils/colorPalette";

/**
 * PixiJSライブラリの動作確認用テストコンポーネント
 */
export function PixiTest() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const initApp = async () => {
      try {
        // PixiJS v8アプリケーションの初期化
        const app = new Application();
        
        // 初期化後に設定を適用
        await app.init({
          canvas: canvasRef.current!,
          width: 800,
          height: 600,
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
        setIsReady(true);

        // 各種形状を描画
        const container = new Container();
        app.stage.addChild(container);

        // 感情カテゴリごとの形状を描画
        try {
          // joy: 星
          const joyGraphics = new Graphics();
          drawStar(joyGraphics, 45, getEmotionColor("joy"));
          joyGraphics.x = 100;
          joyGraphics.y = 100;
          container.addChild(joyGraphics);

          // peace: 円
          const peaceGraphics = new Graphics();
          drawCircle(peaceGraphics, 50, getEmotionColor("peace"));
          peaceGraphics.x = 200;
          peaceGraphics.y = 100;
          container.addChild(peaceGraphics);

          // stress: ダイヤモンド
          const stressGraphics = new Graphics();
          drawDiamond(stressGraphics, 55, getEmotionColor("stress"));
          stressGraphics.x = 300;
          stressGraphics.y = 100;
          container.addChild(stressGraphics);

          // sadness: 滴
          const sadnessGraphics = new Graphics();
          drawDrop(sadnessGraphics, 60, getEmotionColor("sadness"));
          sadnessGraphics.x = 400;
          sadnessGraphics.y = 100;
          container.addChild(sadnessGraphics);

          // inspiration: 六角形
          const inspirationGraphics = new Graphics();
          drawHexagon(inspirationGraphics, 65, getEmotionColor("inspiration"));
          inspirationGraphics.x = 500;
          inspirationGraphics.y = 100;
          container.addChild(inspirationGraphics);

          // nostalgia: 雲
          const nostalgiaGraphics = new Graphics();
          drawCloud(nostalgiaGraphics, 70, getEmotionColor("nostalgia"));
          nostalgiaGraphics.x = 600;
          nostalgiaGraphics.y = 100;
          container.addChild(nostalgiaGraphics);

          // confusion: 歪んだ四角形
          const confusionGraphics = new Graphics();
          drawDistortedSquare(confusionGraphics, 75, getEmotionColor("confusion"), 123);
          confusionGraphics.x = 700;
          confusionGraphics.y = 100;
          container.addChild(confusionGraphics);
        } catch (error) {
          console.error("形状描画エラー:", error);
        }

        // サイズバリエーションを表示
        const sizeVariations = [20, 30, 40, 50, 60];
        sizeVariations.forEach((size, index) => {
          const graphics = new Graphics();
          drawStar(graphics, size, pixelPalette.joy);
          graphics.x = 100 + index * 100;
          graphics.y = 250;
          container.addChild(graphics);
        });

        // 色バリエーションを表示
        Object.entries(pixelPalette).forEach(([category, color], index) => {
          const graphics = new Graphics();
          drawCircle(graphics, 30, color);
          graphics.x = 100 + index * 80;
          graphics.y = 350;
          container.addChild(graphics);
        });
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
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-2xl font-bold">PixiJS ドット絵ライブラリ テスト</h2>
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      <div className="text-sm text-gray-600">
        {isReady ? "✓ 初期化完了" : "初期化中..."}
      </div>
      <div className="text-xs text-gray-500 max-w-2xl">
        <p>上段: 各感情カテゴリの形状（joy: 星, peace: 円, stress: ダイヤモンド, sadness: 滴, inspiration: 六角形, nostalgia: 雲, confusion: 歪んだ四角形）</p>
        <p>中段: サイズバリエーション（星形）</p>
        <p>下段: 色バリエーション（各感情カテゴリの色）</p>
      </div>
    </div>
  );
}
