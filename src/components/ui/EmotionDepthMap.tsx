"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEmotionStore } from "@/store/useEmotionStore";

interface EmotionDepthMapProps {
  currentDepth: number;
  onDepthSelect: (depth: number) => void;
  onClose: () => void;
}

/**
 * 感情オブジェクトの深度マップコンポーネント
 * 実際にオブジェクトが存在する深度を表示し、オブジェクト数に応じて可視化
 */
export function EmotionDepthMap({ currentDepth, onDepthSelect, onClose }: EmotionDepthMapProps) {
  const emotionObjects = useEmotionStore((state) => state.objects);
  const [hoveredDepth, setHoveredDepth] = useState<number | null>(null);

  // 深度ごとにオブジェクトをグループ化
  const depthGroups = useMemo(() => {
    const groups = new Map<number, typeof emotionObjects>();
    
    emotionObjects.forEach((emotion) => {
      // 深度を丸めてグループ化（10単位で丸める）
      const roundedDepth = Math.round(emotion.depth / 10) * 10;
      
      if (!groups.has(roundedDepth)) {
        groups.set(roundedDepth, []);
      }
      groups.get(roundedDepth)!.push(emotion);
    });

    // 深度順にソート
    return Array.from(groups.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([depth, objects]) => ({
        depth,
        count: objects.length,
        objects,
        // 平均強度を計算
        avgStrength: objects.reduce((sum, e) => sum + e.strength, 0) / objects.length,
      }));
  }, [emotionObjects]);

  // 最大オブジェクト数を計算（正規化用）
  const maxCount = useMemo(() => {
    return Math.max(...depthGroups.map((g) => g.count), 1);
  }, [depthGroups]);

  // 深度範囲を計算
  const depthRange = useMemo(() => {
    if (depthGroups.length === 0) {
      return { min: 0, max: 1000 };
    }
    
    const min = depthGroups[0].depth;
    const max = depthGroups[depthGroups.length - 1].depth;
    
    // 上下に余白を追加
    const padding = Math.max((max - min) * 0.1, 100);
    
    return {
      min: Math.max(0, min - padding),
      max: max + padding,
    };
  }, [depthGroups]);

  // マップの高さ（ビューポートの80%）
  const mapHeight = typeof window !== "undefined" ? window.innerHeight * 0.8 : 600;
  const mapWidth = 200; // 幅

  // クリック位置から深度を計算（下に行くほど深い）
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const ratio = y / rect.height; // 上から下へ（0から1へ、下が深い）
    const selectedDepth = depthRange.min + (depthRange.max - depthRange.min) * ratio;
    onDepthSelect(selectedDepth);
  };

  // ホバー位置から深度を計算（下に行くほど深い）
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const ratio = y / rect.height; // 上から下へ（0から1へ、下が深い）
    const depth = depthRange.min + (depthRange.max - depthRange.min) * ratio;
    setHoveredDepth(depth);
  };

  const handleMouseLeave = () => {
    setHoveredDepth(null);
  };

  // 現在の深度の位置を計算（下に行くほど深い）
  const currentDepthRatio = (currentDepth - depthRange.min) / (depthRange.max - depthRange.min);
  const currentDepthY = currentDepthRatio * mapHeight; // 上から下へ

  // 各深度グループの位置を計算（下に行くほど深い）
  const getDepthY = (depth: number) => {
    const ratio = (depth - depthRange.min) / (depthRange.max - depthRange.min);
    return ratio * mapHeight; // 上から下へ（0からmapHeightへ）
  };

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
          className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">深度マップ</h2>
              <p className="text-white/60 text-sm mt-1">
                {emotionObjects.length}個の感情オブジェクト
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* 地上へ戻るボタン */}
              <button
                onClick={() => {
                  onDepthSelect(0); // 深度0（地上）にジャンプ
                  onClose();
                }}
                className="px-4 py-2 flex items-center gap-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 hover:border-cyan-400/50 text-cyan-300 text-sm font-medium transition-all backdrop-blur-sm"
                aria-label="地上へ戻る"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                <span>地上へ戻る</span>
              </button>
              {/* 閉じるボタン */}
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
          </div>

          {depthGroups.length === 0 ? (
            <div className="text-white/60 text-center py-8">
              感情オブジェクトがありません
            </div>
          ) : (
            <div className="relative flex items-center gap-4">
              {/* 深度ラベル（左側） */}
              <div
                className="flex flex-col justify-between text-white/60 text-xs font-mono"
                style={{ height: `${mapHeight}px` }}
              >
                <span>{depthRange.min.toFixed(0)}m</span>
                <span>{depthRange.max.toFixed(0)}m</span>
              </div>

              {/* マップ本体 */}
              <div
                className="relative cursor-pointer border border-white/20 rounded-lg overflow-hidden bg-black/20"
                style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
                onClick={handleClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* 背景のグリッド線 */}
                <svg
                  className="absolute inset-0 pointer-events-none"
                  style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
                >
                  {Array.from({ length: 10 }).map((_, i) => {
                    const y = (i / 10) * mapHeight;
                    return (
                      <line
                        key={i}
                        x1="0"
                        y1={y}
                        x2={mapWidth}
                        y2={y}
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="1"
                      />
                    );
                  })}
                </svg>

                {/* 各深度グループのバー */}
                {depthGroups.map((group) => {
                  const y = getDepthY(group.depth);
                  const normalizedCount = group.count / maxCount;
                  
                  // オブジェクト数に応じたバーの幅（多いほど太く）
                  const barWidth = 20 + normalizedCount * 80;
                  
                  // オブジェクト数に応じた色（少ない: 青、多い: 赤）
                  const hue = 240 - normalizedCount * 120; // 240 (青) → 120 (緑) → 0 (赤)
                  const saturation = 70 + normalizedCount * 30;
                  const lightness = 40 + normalizedCount * 20;
                  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

                  return (
                    <div
                      key={group.depth}
                      className="absolute transition-all hover:opacity-80"
                      style={{
                        left: `${(mapWidth - barWidth) / 2}px`,
                        top: `${y - 5}px`,
                        width: `${barWidth}px`,
                        height: "10px",
                        backgroundColor: color,
                        borderRadius: "5px",
                        boxShadow: `0 0 ${normalizedCount * 10}px ${color}`,
                      }}
                      title={`深度: ${group.depth}m, オブジェクト数: ${group.count}個`}
                    />
                  );
                })}

                {/* 現在の深度のマーカー */}
                <div
                  className="absolute left-0 right-0 border-t-2 border-b-2 border-white pointer-events-none z-10"
                  style={{
                    top: `${currentDepthY - 1}px`,
                    height: "2px",
                    boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                  }}
                />

                {/* ホバー時の深度表示 */}
                {hoveredDepth !== null && (
                  <div
                    className="absolute left-full ml-4 px-3 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-white text-sm whitespace-nowrap pointer-events-none z-20"
                    style={{
                      top: `${((hoveredDepth - depthRange.min) / (depthRange.max - depthRange.min)) * mapHeight - 20}px`,
                    }}
                  >
                    {hoveredDepth.toFixed(1)}m
                  </div>
                )}
              </div>

              {/* 凡例と統計（右側） */}
              <div className="flex flex-col gap-4 min-w-[200px]">
                <div className="space-y-2">
                  <h3 className="text-white/80 text-sm font-semibold">凡例</h3>
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(240, 70%, 40%)" }} />
                    <span>少ない (1-2個)</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(120, 70%, 40%)" }} />
                    <span>中程度 (3-5個)</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(0, 100%, 60%)" }} />
                    <span>多い (6個以上)</span>
                  </div>
                </div>

                {/* 統計情報 */}
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <div className="text-white/60 text-xs">
                    <div className="font-semibold text-white/80 mb-1">統計</div>
                    <div>深度範囲: {depthRange.min.toFixed(0)}m - {depthRange.max.toFixed(0)}m</div>
                    <div>深度グループ数: {depthGroups.length}個</div>
                    <div>最大オブジェクト数: {maxCount}個/深度</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 説明 */}
          <p className="mt-4 text-white/60 text-sm text-center">
            マップをクリックして深度にジャンプ（オブジェクトが多いほど太く、明るく表示）
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

