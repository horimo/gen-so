"use client";

import { useMemo } from "react";
import { useEmotionStore } from "@/store/useEmotionStore";
import type { EmotionObject } from "@/store/useEmotionStore";

interface Scene2DProps {
  depth: number;
  userId?: string;
  othersLights?: Array<{
    depth_y: number;
    category: "joy" | "peace" | "stress" | "sadness" | "inspiration" | "nostalgia" | "confusion";
    strength: number;
  }>;
}

/**
 * 2Dドットライクなシーンコンポーネント
 */
export function Scene2D({ depth, othersLights = [] }: Scene2DProps) {
  const emotionObjects = useEmotionStore((state) => state.objects);

  // 地上エリアかどうかを判定（深度 0以上 ～ 100以下が地上）
  const isSurfaceArea = useMemo(() => {
    return depth >= 0 && depth <= 100;
  }, [depth]);

  // 地面の位置を計算（深度に応じて上に移動）
  const groundY = useMemo(() => {
    // 画面の高さを取得（デフォルトは100vh）
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const baseGroundY = viewportHeight * (2 / 3); // 画面の下1/3の位置（深度0の時）
    
    // 深度に応じて地面を上に移動（深度が増えると地面が上に移動して地下が見える）
    // 深度0の時は baseGroundY、深度が増えると上に移動
    const depthOffset = depth * 10; // 深度1につき10ピクセル上に移動
    
    return baseGroundY - depthOffset; // マイナス方向（上）に移動
  }, [depth]);

  // 背景色を画面の位置に基づいて計算（地面の位置を基準に、その上は地上、その下は地下）
  const backgroundStyle = useMemo(() => {
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    
    // 地下エリアの色を計算（深度が深くなるほど暗く）
    const undergroundColor = depth >= 100 
      ? (() => {
          const normalizedDepth = Math.min((depth - 100) / 900, 1); // 100-1000の範囲を0-1に正規化
          const r = Math.floor(139 + (10 - 139) * normalizedDepth); // 139 → 10
          const g = Math.floor(115 + (10 - 115) * normalizedDepth); // 115 → 10
          const b = Math.floor(85 + (20 - 85) * normalizedDepth); // 85 → 20
          return `rgb(${r}, ${g}, ${b})`;
        })()
      : "rgb(139, 115, 85)"; // 深度100未満の場合は地面の色
    
    // 地上の色（常に明るい青空色）
    const skyColor = "rgb(135, 206, 250)";
    
    // 地面の位置をパーセンテージで計算
    const groundYPercent = (groundY / viewportHeight) * 100;
    
    // グラデーションで背景を描画（地面の上は地上の色、地面の下は地下の色）
    return {
      background: `linear-gradient(to bottom, ${skyColor} 0%, ${skyColor} ${groundYPercent}%, ${undergroundColor} ${groundYPercent}%, ${undergroundColor} 100%)`,
    };
  }, [depth, groundY]);

  // 表示する感情オブジェクトをフィルタリング
  const visibleEmotions = useMemo(() => {
    return emotionObjects.filter((emotion) => {
      // 深度100より下のオブジェクトのみ表示
      if (emotion.depth <= 100) {
        return false;
      }
      
      // 現在の深度±800の範囲内のオブジェクトを表示
      const distance = Math.abs(emotion.depth - depth);
      return distance <= 800;
    });
  }, [emotionObjects, depth]);


  return (
    <div className="fixed inset-0 overflow-hidden" style={backgroundStyle}>
      {/* 地面（深度に応じて移動） */}
      <div
        className="absolute left-0 right-0"
        style={{
          top: `${groundY}px`,
          height: "33.33%",
          backgroundColor: "#8b7355",
          borderTop: "2px solid rgba(139, 115, 85, 0.5)",
          minHeight: "200px", // 最小の高さを確保
          willChange: "top", // パフォーマンス最適化
        }}
      />

      {/* 感情オブジェクト（2Dドット表示） */}
      {visibleEmotions.map((emotion) => {
        // 深度に応じたY位置を計算（地面を基準に）
        const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
        // 感情オブジェクトの深度と現在の深度の差を計算
        const depthDiff = emotion.depth - depth;
        // 地面の位置から、深度差に応じてオブジェクトを配置
        // 地面の移動速度に合わせて、深度差1につき10ピクセル
        const emotionY = groundY + (depthDiff * 10); // 深度差をピクセルに変換
        
        // 画面外のオブジェクトは表示しない
        if (emotionY < -100 || emotionY > viewportHeight + 100) {
          return null;
        }

        return (
          <EmotionDot2D
            key={emotion.id}
            emotion={emotion}
            x={50 + (emotion.x % 80)} // 画面幅に応じて調整
            y={emotionY}
          />
        );
      })}

      {/* 他者の存在を示す光（2Dドット） */}
      {othersLights
        .filter((light) => {
          const distance = Math.abs(light.depth_y - depth);
          return distance <= 200;
        })
        .map((light, index) => {
          const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
          const depthDiff = light.depth_y - depth;
          const lightY = groundY + (depthDiff * 10);
          
          if (lightY < -100 || lightY > viewportHeight + 100) {
            return null;
          }

          return (
            <div
              key={`others-light-${light.depth_y}-${index}`}
              className="absolute w-2 h-2 rounded-full opacity-60"
              style={{
                left: `${20 + (index % 80)}%`,
                top: `${lightY}px`,
                backgroundColor: getEmotionColor(light.category),
                boxShadow: `0 0 8px ${getEmotionColor(light.category)}`,
              }}
            />
          );
        })}
    </div>
  );
}

/**
 * 2D感情ドットコンポーネント
 */
function EmotionDot2D({ emotion, x, y }: { emotion: EmotionObject; x: number; y: number }) {
  const color = getEmotionColor(emotion.category);
  const size = 8 + emotion.strength * 8; // 強度に応じたサイズ

  return (
    <div
      className="absolute rounded-full cursor-pointer transition-all hover:scale-125"
      style={{
        left: `${x}%`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        boxShadow: `0 0 ${size * 2}px ${color}`,
        transform: "translate(-50%, -50%)",
      }}
      title={`${emotion.category} (${emotion.strength.toFixed(2)})`}
    />
  );
}

/**
 * 感情カテゴリに応じた色を取得
 */
function getEmotionColor(category: string): string {
  const colors: Record<string, string> = {
    joy: "#ffd700",
    peace: "#4dd0e1",
    stress: "#ff1744",
    sadness: "#1a237e",
    inspiration: "#9c27b0",
    nostalgia: "#8d6e63",
    confusion: "#66bb6a",
  };
  return colors[category] || "#ffffff";
}

