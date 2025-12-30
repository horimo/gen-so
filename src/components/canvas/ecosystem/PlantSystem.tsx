"use client";

import { useMemo } from "react";
import type { EmotionObject } from "@/store/useEmotionStore";
import { JoyPlant } from "./JoyPlant";
import { PeacePlant } from "./PeacePlant";
import { StressPlant } from "./StressPlant";
import { SadnessPlant } from "./SadnessPlant";
import { InspirationPlant } from "./InspirationPlant";
import { NostalgiaPlant } from "./NostalgiaPlant";
import { ConfusionPlant } from "./ConfusionPlant";

interface Plant {
  id: string;
  category: "joy" | "peace" | "stress" | "sadness" | "inspiration" | "nostalgia" | "confusion";
  strength: number;
  position: [number, number, number];
  emotionSize: number;
  emotionId: string; // 関連する感情オブジェクトのID
  createdAt: number;
}

interface PlantSystemProps {
  emotionObjects: EmotionObject[];
  currentDepth: number;
  isSurfaceArea?: boolean;
}

/**
 * 感情オブジェクトから植物を生成するシステム
 * 地上エリア: 全感情オブジェクトの分布から均等に配置
 * 地下エリア: 現在の深度±500の範囲内の感情オブジェクトの周囲に生成
 */
export function PlantSystem({ emotionObjects, currentDepth, isSurfaceArea = false }: PlantSystemProps) {
  // 地上エリアの場合は全感情オブジェクトを使用、地下エリアの場合は近くの感情のみ
  const nearbyEmotions = useMemo(() => {
    if (isSurfaceArea) {
      // 地上エリア: 全感情オブジェクトを使用（分布分析用）
      return emotionObjects;
    } else {
      // 地下エリア: 現在の深度±800の範囲内の感情オブジェクトをフィルタリング（範囲を拡大）
      return emotionObjects.filter((emotion) => {
        const distance = Math.abs(emotion.depth - currentDepth);
        return distance <= 800;
      });
    }
  }, [emotionObjects, currentDepth, isSurfaceArea]);

  // 感情オブジェクトから植物を生成
  // 注意: useMemo内でMath.random()を使うと、毎回異なる結果が生成されるため、
  // 感情オブジェクトのIDとインデックスをシードとして使用して一貫性を保つ
  const plants = useMemo(() => {
    const generatedPlants: Plant[] = [];

    try {
      if (isSurfaceArea) {
        // 地上エリア: 全感情の分布に基づいて均等に配置
        // 各感情タイプの分布を計算
        const emotionCounts: { [key: string]: number } = {
          joy: 0,
          peace: 0,
          stress: 0,
          sadness: 0,
          inspiration: 0,
          nostalgia: 0,
          confusion: 0,
        };
        
        let totalStrength = 0;
        nearbyEmotions.forEach((emotion) => {
          const category = emotion.category as keyof typeof emotionCounts;
          if (category in emotionCounts) {
            emotionCounts[category] += emotion.strength;
            totalStrength += emotion.strength;
          }
        });

        // 感情オブジェクトが存在しない場合でも、デフォルトの植物を表示
        if (totalStrength === 0 || nearbyEmotions.length === 0) {
          // デフォルトの植物を生成（各タイプから5-10個ずつ）
          const defaultPlantCount = 8; // 各タイプから8個ずつ
          Object.keys(emotionCounts).forEach((category) => {
            for (let i = 0; i < defaultPlantCount; i++) {
              const seed = category.charCodeAt(0) + i * 1000;
              const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
              const random2 = ((seed * 9301 + 49297 + 1) % 233280) / 233280;
              const random3 = ((seed * 9301 + 49297 + 2) % 233280) / 233280;
              const random4 = ((seed * 9301 + 49297 + 3) % 233280) / 233280;
              
              const x = (random1 - 0.5) * 20;
              const z = (random2 - 0.5) * 20;
              const y = -random3 * 100; // 深度0-100の範囲（y座標は-100から0）
              
              generatedPlants.push({
                id: `default-surface-plant-${category}-${i}`,
                category: category as Plant["category"],
                strength: 0.5 + random4 * 0.3,
                position: [x, y, z],
                emotionSize: 0.3 + (0.5 + random4 * 0.3) * 0.3,
                emotionId: `default-${category}`,
                createdAt: Date.now(),
              });
            }
          });
        } else {
          // 各感情タイプから植物を生成（分布に応じて数が変わる）
          const totalPlants = Math.min(Math.floor(totalStrength * 20), 100); // 最大100個
        
        Object.entries(emotionCounts).forEach(([category, strength]) => {
          if (strength <= 0) return;
          
          const plantCount = Math.floor((strength / totalStrength) * totalPlants);
          const avgStrength = totalStrength > 0 ? strength / nearbyEmotions.filter(e => e.category === category).length : 0.5;
          
          for (let i = 0; i < plantCount; i++) {
            // 地上エリア内に均等に配置（-50から0の範囲、x/zは-10から10の範囲）
            const seed = category.charCodeAt(0) + i * 1000;
            const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
            const random2 = ((seed * 9301 + 49297 + 1) % 233280) / 233280;
            const random3 = ((seed * 9301 + 49297 + 2) % 233280) / 233280;
            const random4 = ((seed * 9301 + 49297 + 3) % 233280) / 233280;
            
            const x = (random1 - 0.5) * 20; // -10 から 10
            const z = (random2 - 0.5) * 20; // -10 から 10
            const y = -50 + random3 * 50; // -50 から 0（地上エリア）
            
            const plantStrength = avgStrength * (0.7 + random4 * 0.3);
            const emotionSize = 0.3 + plantStrength * 0.3;
            
            generatedPlants.push({
              id: `surface-plant-${category}-${i}`,
              category: category as Plant["category"],
              strength: plantStrength,
              position: [x, y, z],
              emotionSize,
              emotionId: `surface-${category}`, // 地上エリア用の仮ID
              createdAt: Date.now(),
            });
          }
        });
        }
      } else {
        // 地下エリア: 感情オブジェクトの周囲に生成（既存のロジック）
        nearbyEmotions.forEach((emotion) => {
        // すべての感情オブジェクトから植物を生成

        // 感情オブジェクトのサイズを計算（既存のロジックに合わせる）
        const emotionSize = 0.3 + emotion.strength * 0.3;

        // 植物の数を決定（strengthに応じて2-5個）
        // 感情オブジェクトのIDをシードとして使用して一貫性を保つ
        const seed = emotion.id.charCodeAt(0) + emotion.id.charCodeAt(emotion.id.length - 1);
        let plantCount: number;
        if (emotion.strength < 0.3) {
          plantCount = 2;
        } else if (emotion.strength < 0.7) {
          plantCount = 3 + (seed % 2); // 3-4個（シードベース）
        } else {
          plantCount = 4 + (seed % 2); // 4-5個（シードベース）
        }

        // 植物を生成
        for (let i = 0; i < plantCount; i++) {
          // シードベースの疑似乱数生成（一貫性を保つ）
          const plantSeed = seed + i * 1000;
          const random1 = ((plantSeed * 9301 + 49297) % 233280) / 233280;
          const random2 = ((plantSeed * 9301 + 49297 + 1) % 233280) / 233280;
          const random3 = ((plantSeed * 9301 + 49297 + 2) % 233280) / 233280;
          const random4 = ((plantSeed * 9301 + 49297 + 3) % 233280) / 233280;
          const random5 = ((plantSeed * 9301 + 49297 + 4) % 233280) / 233280;

          // 感情オブジェクトの周囲、半径2.0-4.5単位の範囲にランダム配置（より広範囲に）
          const angle = random1 * Math.PI * 2;
          const radius = 2.0 + random2 * 2.5; // 2.0-4.5単位（より広範囲）
          const offsetX = Math.cos(angle) * radius;
          const offsetZ = Math.sin(angle) * radius;
          
          // 深度方向にも分散させる（感情オブジェクトの前後±0.5-1.5単位）
          // これによりスクロール時に植物が段階的に見えてくる
          const depthOffset = (random3 - 0.5) * 2.0; // -1.0 から +1.0 の範囲
          const depthVariation = depthOffset * (0.5 + random4 * 1.0); // ±0.5-1.5単位

          // 各植物のstrengthを少しランダムに変動（0.7-1.0倍）
          const plantStrength = emotion.strength * (0.7 + random5 * 0.3);

          generatedPlants.push({
            id: `plant-${emotion.id}-${i}`,
            category: emotion.category,
            strength: plantStrength,
            position: [
              emotion.x + offsetX,
              -emotion.depth + depthVariation, // y座標を深度方向に分散
              emotion.z + offsetZ,
            ],
            emotionSize,
            emotionId: emotion.id,
            createdAt: emotion.timestamp,
          });
        }
      });
      }
    } catch (error) {
      console.error("植物生成エラー:", error);
      return [];
    }

    return generatedPlants;
  }, [nearbyEmotions, isSurfaceArea]);

  return (
    <>
      {plants.map((plant) => {
        switch (plant.category) {
          case "joy":
            return (
              <JoyPlant
                key={plant.id}
                strength={plant.strength}
                position={plant.position}
                emotionSize={plant.emotionSize}
                createdAt={plant.createdAt}
              />
            );
          case "peace":
            return (
              <PeacePlant
                key={plant.id}
                strength={plant.strength}
                position={plant.position}
                emotionSize={plant.emotionSize}
                createdAt={plant.createdAt}
              />
            );
          case "stress":
            return (
              <StressPlant
                key={plant.id}
                strength={plant.strength}
                position={plant.position}
                emotionSize={plant.emotionSize}
                createdAt={plant.createdAt}
              />
            );
          case "sadness":
            return (
              <SadnessPlant
                key={plant.id}
                strength={plant.strength}
                position={plant.position}
                emotionSize={plant.emotionSize}
                createdAt={plant.createdAt}
              />
            );
          case "inspiration":
            return (
              <InspirationPlant
                key={plant.id}
                strength={plant.strength}
                position={plant.position}
                emotionSize={plant.emotionSize}
                createdAt={plant.createdAt}
              />
            );
          case "nostalgia":
            return (
              <NostalgiaPlant
                key={plant.id}
                strength={plant.strength}
                position={plant.position}
                emotionSize={plant.emotionSize}
                createdAt={plant.createdAt}
              />
            );
          case "confusion":
            return (
              <ConfusionPlant
                key={plant.id}
                strength={plant.strength}
                position={plant.position}
                emotionSize={plant.emotionSize}
                createdAt={plant.createdAt}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}

