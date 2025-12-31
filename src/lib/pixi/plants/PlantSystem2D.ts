"use client";

import type { EmotionObject } from "@/store/useEmotionStore";
import type { Application, Container } from "pixi.js";
import { createPlantSprite } from "./createPlantSprite";

export interface Plant2D {
  id: string;
  category: "joy" | "peace" | "stress" | "sadness" | "inspiration" | "nostalgia" | "confusion";
  strength: number;
  x: number;
  y: number;
  emotionId: string;
  createdAt: number;
}

interface PlantSystem2DProps {
  emotionObjects: EmotionObject[];
  currentDepth: number;
  groundY: number;
  isSurfaceArea: boolean;
  app: Application;
  container: Container;
}

/**
 * 2D版植物システム
 * 地上エリア: 全感情オブジェクトの分布から均等に配置（草花）
 * 地下エリア: 現在の深度±800の範囲内の感情オブジェクトの周囲に生成（ツタ・苔）
 */
export function generatePlants2D({
  emotionObjects,
  currentDepth,
  groundY,
  isSurfaceArea,
}: Omit<PlantSystem2DProps, "app" | "container">): Plant2D[] {
  const generatedPlants: Plant2D[] = [];

  try {
    if (isSurfaceArea) {
      // 地上エリア: 全感情の分布に基づいて均等に配置
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
      emotionObjects.forEach((emotion) => {
        const category = emotion.category as keyof typeof emotionCounts;
        if (category in emotionCounts) {
          emotionCounts[category] += emotion.strength;
          totalStrength += emotion.strength;
        }
      });

      // 感情オブジェクトが存在しない場合でも、デフォルトの植物を表示
      if (totalStrength === 0 || emotionObjects.length === 0) {
        // デフォルトの植物を生成（各タイプから5-8個ずつ）
        const defaultPlantCount = 6;
        Object.keys(emotionCounts).forEach((category) => {
          for (let i = 0; i < defaultPlantCount; i++) {
            const seed = category.charCodeAt(0) + i * 1000;
            const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
            const random2 = ((seed * 9301 + 49297 + 1) % 233280) / 233280;
            const random3 = ((seed * 9301 + 49297 + 2) % 233280) / 233280;

            // 画面全体に広がる配置
            const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 800;
            const x = (random1 - 0.5) * viewportWidth * 0.8; // 画面幅の80%の範囲
            const depthY = random2 * 100; // 深度0-100の範囲
            const y = groundY - depthY * 10; // 深度をY座標に変換

            generatedPlants.push({
              id: `default-surface-plant-${category}-${i}`,
              category: category as Plant2D["category"],
              strength: 0.5 + random3 * 0.3,
              x,
              y,
              emotionId: `default-${category}`,
              createdAt: Date.now(),
            });
          }
        });
      } else {
        // 感情オブジェクトから植物を生成
        emotionObjects.forEach((emotion) => {
          const seed = emotion.id.charCodeAt(0) + emotion.depth;
          const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
          const random2 = ((seed * 9301 + 49297 + 1) % 233280) / 233280;
          const random3 = ((seed * 9301 + 49297 + 2) % 233280) / 233280;
          const random4 = ((seed * 9301 + 49297 + 3) % 233280) / 233280;

          // 感情オブジェクトの強度に応じて植物の数を決定
          let plantCount = 3;
          if (emotion.strength > 0.7) {
            plantCount = 5 + (seed % 2); // 5-6個
          } else if (emotion.strength > 0.4) {
            plantCount = 4 + (seed % 2); // 4-5個
          } else {
            plantCount = 3 + (seed % 2); // 3-4個
          }

          // 植物を生成
          for (let i = 0; i < plantCount; i++) {
            const plantSeed = seed + i * 1000;
            const random5 = ((plantSeed * 9301 + 49297) % 233280) / 233280;
            const random6 = ((plantSeed * 9301 + 49297 + 1) % 233280) / 233280;

            // 感情オブジェクトの周囲、半径20-60ピクセルの範囲にランダム配置
            const angle = random5 * Math.PI * 2;
            const radius = 20 + random6 * 40; // 20-60ピクセル
            const offsetX = Math.cos(angle) * radius;
            const offsetY = Math.sin(angle) * radius;

            // 深度方向にも分散させる（感情オブジェクトの前後±10-30ピクセル）
            const depthOffset = (random3 - 0.5) * 2.0;
            const depthVariation = depthOffset * (10 + random4 * 20); // ±10-30ピクセル

            // 各植物のstrengthを少しランダムに変動（0.7-1.0倍）
            const plantStrength = emotion.strength * (0.7 + random6 * 0.3);

            // 感情オブジェクトの位置を計算
            const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 800;
            const emotionX = viewportWidth / 2 + emotion.x * 10;
            const depthDiff = emotion.depth - currentDepth;
            const emotionY = groundY + depthDiff * 10;

            generatedPlants.push({
              id: `plant-${emotion.id}-${i}`,
              category: emotion.category,
              strength: plantStrength,
              x: emotionX + offsetX,
              y: emotionY + offsetY + depthVariation,
              emotionId: emotion.id,
              createdAt: emotion.timestamp,
            });
          }
        });
      }
    } else {
      // 地下エリア: 現在の深度±800の範囲内の感情オブジェクトの周囲に生成
      const nearbyEmotions = emotionObjects.filter((emotion) => {
        const distance = Math.abs(emotion.depth - currentDepth);
        return distance <= 800;
      });

      nearbyEmotions.forEach((emotion) => {
        const seed = emotion.id.charCodeAt(0) + emotion.depth;
        const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
        const random2 = ((seed * 9301 + 49297 + 1) % 233280) / 233280;
        const random3 = ((seed * 9301 + 49297 + 2) % 233280) / 233280;
        const random4 = ((seed * 9301 + 49297 + 3) % 233280) / 233280;

        // 感情オブジェクトの強度に応じて植物の数を決定（地下は少し少なめ）
        let plantCount = 2;
        if (emotion.strength > 0.7) {
          plantCount = 4 + (seed % 2); // 4-5個
        } else if (emotion.strength > 0.4) {
          plantCount = 3 + (seed % 2); // 3-4個
        } else {
          plantCount = 2 + (seed % 2); // 2-3個
        }

        // 植物を生成
        for (let i = 0; i < plantCount; i++) {
          const plantSeed = seed + i * 1000;
          const random5 = ((plantSeed * 9301 + 49297) % 233280) / 233280;
          const random6 = ((plantSeed * 9301 + 49297 + 1) % 233280) / 233280;

          // 感情オブジェクトの周囲、半径15-45ピクセルの範囲にランダム配置
          const angle = random5 * Math.PI * 2;
          const radius = 15 + random6 * 30; // 15-45ピクセル
          const offsetX = Math.cos(angle) * radius;
          const offsetY = Math.sin(angle) * radius;

          // 深度方向にも分散させる（感情オブジェクトの前後±5-20ピクセル）
          const depthOffset = (random3 - 0.5) * 2.0;
          const depthVariation = depthOffset * (5 + random4 * 15); // ±5-20ピクセル

          // 各植物のstrengthを少しランダムに変動（0.7-1.0倍）
          const plantStrength = emotion.strength * (0.7 + random6 * 0.3);

          // 感情オブジェクトの位置を計算
          const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 800;
          const emotionX = viewportWidth / 2 + emotion.x * 10;
          const depthDiff = emotion.depth - currentDepth;
          const emotionY = groundY + depthDiff * 10;

          generatedPlants.push({
            id: `plant-${emotion.id}-${i}`,
            category: emotion.category,
            strength: plantStrength,
            x: emotionX + offsetX,
            y: emotionY + offsetY + depthVariation,
            emotionId: emotion.id,
            createdAt: emotion.timestamp,
          });
        }
      });
    }
  } catch (error) {
    console.error("植物生成エラー:", error);
  }

  return generatedPlants;
}

/**
 * 植物をPixiJSコンテナに描画
 */
export function renderPlants2D(
  plants: Plant2D[],
  app: Application,
  container: Container,
  isSurfaceArea: boolean
): void {
  // 既存の植物を削除
  const existingPlants = container.children.filter((child) => child.name?.startsWith("plant-"));
  existingPlants.forEach((child) => container.removeChild(child));

  // 新しい植物を追加
  plants.forEach((plant) => {
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 600;
    
    // 画面外の植物は表示しない
    if (plant.y < -100 || plant.y > viewportHeight + 100) {
      return;
    }

    const sprite = createPlantSprite({
      app,
      category: plant.category,
      strength: plant.strength,
      x: plant.x,
      y: plant.y,
      isSurface: isSurfaceArea,
      seed: plant.id.charCodeAt(0) + plant.createdAt,
    });

    sprite.name = `plant-${plant.id}`;
    container.addChild(sprite);
  });
}

