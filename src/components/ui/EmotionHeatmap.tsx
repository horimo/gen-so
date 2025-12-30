"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEmotionStore } from "@/store/useEmotionStore";

interface EmotionHeatmapProps {
  currentDepth: number;
  onDepthSelect: (depth: number) => void;
  onClose: () => void;
}

/**
 * 感情オブジェクトのヒートマップコンポーネント
 * 深度ごとの感情の分布を可視化し、タップで深度ジャンプが可能
 */
export function EmotionHeatmap({ currentDepth, onDepthSelect, onClose }: EmotionHeatmapProps) {
  const emotionObjects = useEmotionStore((state) => state.objects);
  const [hoveredDepth, setHoveredDepth] = useState<number | null>(null);

  // 感情オブジェクトの深度範囲を計算
  const depthRange = useMemo(() => {
    if (emotionObjects.length === 0) {
      return { min: 0, max: 1000 };
    }
    
    const depths = emotionObjects.map((e) => e.depth);
    const min = Math.min(...depths);
    const max = Math.max(...depths);
    
    // 最小値と最大値に余白を追加
    const padding = Math.max((max - min) * 0.1, 100);
    
    return {
      min: Math.max(0, min - padding),
      max: max + padding,
    };
  }, [emotionObjects]);

  // 深度ごとの感情の強度を計算（ヒートマップ用）
  const heatmapData = useMemo(() => {
    const bins = 100; // ヒートマップの解像度
    const binSize = (depthRange.max - depthRange.min) / bins;
    const data: Array<{ depth: number; intensity: number; count: number }> = [];

    for (let i = 0; i < bins; i++) {
      const binMin = depthRange.min + i * binSize;
      const binMax = depthRange.min + (i + 1) * binSize;
      const binCenter = (binMin + binMax) / 2;

      // この深度範囲内の感情オブジェクトを集計
      const emotionsInBin = emotionObjects.filter(
        (e) => e.depth >= binMin && e.depth < binMax
      );

      // 強度の合計と個数を計算
      const totalStrength = emotionsInBin.reduce((sum, e) => sum + e.strength, 0);
      const intensity = emotionsInBin.length > 0 ? totalStrength / emotionsInBin.length : 0;
      const count = emotionsInBin.length;

      data.push({
        depth: binCenter,
        intensity,
        count,
      });
    }

    return data;
  }, [emotionObjects, depthRange]);

  // 最大強度を計算（正規化用）
  const maxIntensity = useMemo(() => {
    return Math.max(...heatmapData.map((d) => d.intensity), 0.1);
  }, [heatmapData]);

  // ヒートマップの高さ（ビューポートの80%）
  const heatmapHeight = typeof window !== "undefined" ? window.innerHeight * 0.8 : 600;
  const heatmapWidth = 60; // 幅

  // クリック位置から深度を計算
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const ratio = 1 - y / rect.height; // 上から下へ（深い方向）
    const selectedDepth = depthRange.min + (depthRange.max - depthRange.min) * ratio;
    onDepthSelect(selectedDepth);
  };

  // ホバー位置から深度を計算
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const ratio = 1 - y / rect.height;
    const depth = depthRange.min + (depthRange.max - depthRange.min) * ratio;
    setHoveredDepth(depth);
  };

  const handleMouseLeave = () => {
    setHoveredDepth(null);
  };

  // 現在の深度の位置を計算
  const currentDepthRatio = (currentDepth - depthRange.min) / (depthRange.max - depthRange.min);
  const currentDepthY = (1 - currentDepthRatio) * heatmapHeight;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">感情ヒートマップ</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="閉じる"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* ヒートマップ */}
          <div className="relative flex items-center gap-4">
            {/* 深度ラベル（左側） */}
            <div className="flex flex-col justify-between text-white/60 text-xs font-mono" style={{ height: `${heatmapHeight}px` }}>
              <span>{depthRange.max.toFixed(0)}m</span>
              <span>{depthRange.min.toFixed(0)}m</span>
            </div>

            {/* ヒートマップ本体 */}
            <div
              className="relative cursor-pointer border border-white/20 rounded-lg overflow-hidden"
              style={{ width: `${heatmapWidth}px`, height: `${heatmapHeight}px` }}
              onClick={handleClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* 各深度のバー */}
              {heatmapData.map((data, index) => {
                const normalizedIntensity = data.intensity / maxIntensity;
                const barHeight = heatmapHeight / heatmapData.length;
                const y = index * barHeight;

                // 強度に応じた色（青→緑→黄→赤）
                const hue = 240 - normalizedIntensity * 120; // 240 (青) → 120 (緑) → 0 (赤)
                const saturation = 70 + normalizedIntensity * 30;
                const lightness = 40 + normalizedIntensity * 20;
                const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

                return (
                  <div
                    key={index}
                    className="absolute left-0 right-0 transition-opacity hover:opacity-80"
                    style={{
                      top: `${y}px`,
                      height: `${barHeight}px`,
                      backgroundColor: color,
                      opacity: normalizedIntensity * 0.8 + 0.2,
                    }}
                  />
                );
              })}

              {/* 現在の深度のマーカー */}
              <div
                className="absolute left-0 right-0 border-t-2 border-b-2 border-white pointer-events-none"
                style={{
                  top: `${currentDepthY - 1}px`,
                  height: "2px",
                  boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                }}
              />

              {/* ホバー時の深度表示 */}
              {hoveredDepth !== null && (
                <div
                  className="absolute left-full ml-4 px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white text-sm whitespace-nowrap pointer-events-none"
                  style={{
                    top: `${(1 - (hoveredDepth - depthRange.min) / (depthRange.max - depthRange.min)) * heatmapHeight - 20}px`,
                  }}
                >
                  {hoveredDepth.toFixed(1)}m
                </div>
              )}
            </div>

            {/* 凡例（右側） */}
            <div className="flex flex-col gap-2 text-white/60 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(240, 70%, 40%)" }} />
                <span>低</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(120, 70%, 40%)" }} />
                <span>中</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(0, 100%, 60%)" }} />
                <span>高</span>
              </div>
            </div>
          </div>

          {/* 説明 */}
          <p className="mt-4 text-white/60 text-sm text-center">
            ヒートマップをクリックして深度にジャンプ
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

