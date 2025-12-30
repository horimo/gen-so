"use client";

import { useMemo, useEffect, useState } from "react";
import type { StrataObject } from "@/app/api/strata/route";
import { getStrataObjects } from "@/lib/api-strata";
import { JoyPlant } from "./ecosystem/JoyPlant";
import { PeacePlant } from "./ecosystem/PeacePlant";
import { StressPlant } from "./ecosystem/StressPlant";
import { SadnessPlant } from "./ecosystem/SadnessPlant";
import { InspirationPlant } from "./ecosystem/InspirationPlant";
import { NostalgiaPlant } from "./ecosystem/NostalgiaPlant";
import { ConfusionPlant } from "./ecosystem/ConfusionPlant";

interface TerrariumProps {
  depth: number;
  userId?: string;
}

interface TerrariumPlant {
  id: string;
  category: "joy" | "peace" | "stress" | "sadness" | "inspiration" | "nostalgia" | "confusion";
  strength: number;
  position: [number, number, number];
  growthProgress: number; // 0-1の範囲で成長度合い
  createdAt: number;
}

/**
 * 過去のチャットデータを分析して植物の成長度合いを計算
 */
function analyzeChatDataForGrowth(strataObjects: StrataObject[]): {
  plantData: TerrariumPlant[];
  totalGrowth: number; // 0-1の範囲で全体の成長度合い
} {
  if (strataObjects.length === 0) {
    return {
      plantData: [],
      totalGrowth: 0,
    };
  }

  // 各感情タイプの分布を計算
  const emotionCounts: { [key: string]: { count: number; totalStrength: number } } = {
    joy: { count: 0, totalStrength: 0 },
    peace: { count: 0, totalStrength: 0 },
    stress: { count: 0, totalStrength: 0 },
    sadness: { count: 0, totalStrength: 0 },
    inspiration: { count: 0, totalStrength: 0 },
    nostalgia: { count: 0, totalStrength: 0 },
    confusion: { count: 0, totalStrength: 0 },
  };

  strataObjects.forEach((strata) => {
    const category = strata.category as keyof typeof emotionCounts;
    if (category in emotionCounts) {
      emotionCounts[category].count += 1;
      emotionCounts[category].totalStrength += Number(strata.strength);
    }
  });

  // 全体の成長度合いを計算（チャット数と強度に基づく）
  const totalChats = strataObjects.length;
  const avgStrength = strataObjects.reduce((sum, s) => sum + Number(s.strength), 0) / totalChats;
  const totalGrowth = Math.min(1.0, (totalChats / 100) * 0.5 + avgStrength * 0.5); // 最大100チャットで0.5、強度で0.5

  // 各感情タイプから植物を生成
  const plantData: TerrariumPlant[] = [];
  const baseTime = Date.now();

  Object.entries(emotionCounts).forEach(([category, data]) => {
    if (data.count === 0) return;

    // チャット数に応じて植物の数を決定（3-15個、より多くの植物で生態系を形成）
    const plantCount = Math.min(15, Math.max(3, Math.floor(data.count / 3) + 3));
    const avgStrength = data.totalStrength / data.count;

    for (let i = 0; i < plantCount; i++) {
      // シードベースの疑似乱数生成（一貫性を保つ）
      const seed = category.charCodeAt(0) + i * 1000 + totalChats;
      const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
      const random2 = ((seed * 9301 + 49297 + 1) % 233280) / 233280;
      const random3 = ((seed * 9301 + 49297 + 2) % 233280) / 233280;
      const random4 = ((seed * 9301 + 49297 + 3) % 233280) / 233280;

      // 地上エリア全体に広がる配置（半径5-15の範囲、高さ0-3の範囲）
      const angle = random1 * Math.PI * 2;
      const radius = 5 + random2 * 10; // 5-15の範囲（より広範囲に配置）
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = random3 * 3; // 0-3の範囲（地面から少し浮く）

      // 成長度合いを計算（チャット数と強度に基づく）
      const categoryGrowth = Math.min(1.0, (data.count / 20) * 0.6 + avgStrength * 0.4);
      const growthProgress = categoryGrowth * (0.8 + random4 * 0.2); // 0.8-1.0倍の範囲でランダムに変動

      plantData.push({
        id: `terrarium-plant-${category}-${i}`,
        category: category as TerrariumPlant["category"],
        strength: avgStrength * (0.7 + random4 * 0.3),
        position: [x, y, z],
        growthProgress,
        createdAt: baseTime + i,
      });
    }
  });

  return {
    plantData,
    totalGrowth,
  };
}

/**
 * 地上エリアに配置される植物の生態系コンポーネント
 * 過去のチャット内容に基づいて植物が成長する
 */
export function Terrarium({ depth, userId }: TerrariumProps) {
  const [strataObjects, setStrataObjects] = useState<StrataObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 地上エリア（depth <= 10）にのみ表示
  const isVisible = depth <= 10;

  // 過去のチャットデータを取得
  useEffect(() => {
    if (!userId || !isVisible) {
      setIsLoading(false);
      return;
    }

    const loadChatData = async () => {
      try {
        const data = await getStrataObjects();
        setStrataObjects(data);
      } catch (error) {
        console.error("テラリウム用チャットデータの読み込みエラー:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatData();
  }, [userId, isVisible]);

  // チャットデータを分析して植物データを生成
  const { plantData, totalGrowth } = useMemo(() => {
    if (isLoading || strataObjects.length === 0) {
      return {
        plantData: [],
        totalGrowth: 0,
      };
    }
    return analyzeChatDataForGrowth(strataObjects);
  }, [strataObjects, isLoading]);

  if (!isVisible) {
    return null;
  }

  // 地上エリア（depth <= 10）に直接配置
  // y座標は深度に応じて調整（depth=0の時、y=0に配置）
  const groundY = -depth; // 深度0の時、y=0に配置

  return (
    <group position={[0, groundY, 0]}>

      {/* 地上エリアの植物（過去のチャット内容に基づいて成長） */}
      {plantData.map((plant) => {
        // 成長度合いに応じてサイズを調整
        const emotionSize = 0.3 + plant.strength * 0.3;
        const scale = 0.3 + plant.growthProgress * 0.7; // 0.3-1.0倍の範囲

        switch (plant.category) {
          case "joy":
            return (
              <group key={plant.id} position={plant.position} scale={scale}>
                <JoyPlant
                  strength={plant.strength}
                  position={[0, 0, 0]}
                  emotionSize={emotionSize}
                  createdAt={plant.createdAt}
                />
              </group>
            );
          case "peace":
            return (
              <group key={plant.id} position={plant.position} scale={scale}>
                <PeacePlant
                  strength={plant.strength}
                  position={[0, 0, 0]}
                  emotionSize={emotionSize}
                  createdAt={plant.createdAt}
                />
              </group>
            );
          case "stress":
            return (
              <group key={plant.id} position={plant.position} scale={scale}>
                <StressPlant
                  strength={plant.strength}
                  position={[0, 0, 0]}
                  emotionSize={emotionSize}
                  createdAt={plant.createdAt}
                />
              </group>
            );
          case "sadness":
            return (
              <group key={plant.id} position={plant.position} scale={scale}>
                <SadnessPlant
                  strength={plant.strength}
                  position={[0, 0, 0]}
                  emotionSize={emotionSize}
                  createdAt={plant.createdAt}
                />
              </group>
            );
          case "inspiration":
            return (
              <group key={plant.id} position={plant.position} scale={scale}>
                <InspirationPlant
                  strength={plant.strength}
                  position={[0, 0, 0]}
                  emotionSize={emotionSize}
                  createdAt={plant.createdAt}
                />
              </group>
            );
          case "nostalgia":
            return (
              <group key={plant.id} position={plant.position} scale={scale}>
                <NostalgiaPlant
                  strength={plant.strength}
                  position={[0, 0, 0]}
                  emotionSize={emotionSize}
                  createdAt={plant.createdAt}
                />
              </group>
            );
          case "confusion":
            return (
              <group key={plant.id} position={plant.position} scale={scale}>
                <ConfusionPlant
                  strength={plant.strength}
                  position={[0, 0, 0]}
                  emotionSize={emotionSize}
                  createdAt={plant.createdAt}
                />
              </group>
            );
          default:
            return null;
        }
      })}

      {/* 生態系全体を照らす光（成長度合いに応じて明るさが変わる） */}
      <pointLight
        position={[0, 2, 0]}
        intensity={0.4 + totalGrowth * 0.6}
        color="#fff4e6"
        distance={30}
        decay={2}
      />
      
      {/* 追加の環境光（生態系全体を柔らかく照らす） */}
      <pointLight
        position={[-10, 3, -10]}
        intensity={0.2 + totalGrowth * 0.3}
        color="#e6f3ff"
        distance={40}
        decay={2}
      />
      
      <pointLight
        position={[10, 3, 10]}
        intensity={0.2 + totalGrowth * 0.3}
        color="#fff4e6"
        distance={40}
        decay={2}
      />
    </group>
  );
}

