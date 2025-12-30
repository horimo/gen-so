"use client";

import { useMemo } from "react";
import type { EmotionObject } from "@/store/useEmotionStore";
import { LightButterfly } from "./LightButterfly";
import { WaterBubble } from "./WaterBubble";
import { EnergyParticle } from "./EnergyParticle";
import { MemoryFragment } from "./MemoryFragment";
import { LostLight } from "./LostLight";

interface Creature {
  id: string;
  type: "butterfly" | "bubble" | "energy" | "memory" | "lost";
  strength: number;
  position: [number, number, number];
}

interface CreatureSystemProps {
  emotionObjects: EmotionObject[];
  currentDepth: number;
  isSurfaceArea?: boolean;
}

/**
 * 感情オブジェクトから生物を生成するシステム
 * 地上エリア: 全感情オブジェクトの分布から均等に配置
 * 地下エリア: 現在の深度±500の範囲内の感情オブジェクトの周囲に生成
 */
export function CreatureSystem({ emotionObjects, currentDepth, isSurfaceArea = false }: CreatureSystemProps) {
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

  // 感情オブジェクトの周囲に生物を生成（植物システムと同様のアプローチ）
  const creatures = useMemo(() => {
    const generatedCreatures: Creature[] = [];

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

        // 感情オブジェクトが存在しない場合でも、デフォルトの生物を表示
        if (totalStrength === 0 || nearbyEmotions.length === 0) {
          // デフォルトの生物を生成（各タイプから3-5個ずつ）
          const defaultCreatureCount = 4;
          
          // 光の蝶々
          for (let i = 0; i < defaultCreatureCount; i++) {
            const seed = `butterfly-${i}`.charCodeAt(0) + i * 1000;
            const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
            const random2 = ((seed * 9301 + 49297 + 1) % 233280) / 233280;
            const random3 = ((seed * 9301 + 49297 + 2) % 233280) / 233280;
            const random4 = ((seed * 9301 + 49297 + 3) % 233280) / 233280;
            
            generatedCreatures.push({
              id: `default-surface-butterfly-${i}`,
              type: "butterfly",
              strength: 0.5 + random4 * 0.3,
              position: [(random1 - 0.5) * 20, -random3 * 100, (random2 - 0.5) * 20], // 深度0-100の範囲
            });
          }
          
          // 水の泡
          for (let i = 0; i < defaultCreatureCount; i++) {
            const seed = `bubble-${i}`.charCodeAt(0) + i * 1000;
            const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
            const random2 = ((seed * 9301 + 49297 + 1) % 233280) / 233280;
            const random3 = ((seed * 9301 + 49297 + 2) % 233280) / 233280;
            const random4 = ((seed * 9301 + 49297 + 3) % 233280) / 233280;
            
            generatedCreatures.push({
              id: `default-surface-bubble-${i}`,
              type: "bubble",
              strength: 0.4 + random4 * 0.4,
              position: [(random1 - 0.5) * 20, -random3 * 100, (random2 - 0.5) * 20], // 深度0-100の範囲
            });
          }
        } else {
          // 各感情タイプから生物を生成（分布に応じて数が変わる）
          const totalCreatures = Math.min(Math.floor(totalStrength * 15), 80); // 最大80個
        
        // joy/inspiration → 光の蝶々
        const butterflyCount = Math.floor(((emotionCounts.joy + emotionCounts.inspiration) / totalStrength) * totalCreatures);
        for (let i = 0; i < butterflyCount; i++) {
          const seed = `butterfly-${i}`.charCodeAt(0) + i * 1000;
          const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
          const random2 = ((seed * 9301 + 49297 + 1) % 233280) / 233280;
          const random3 = ((seed * 9301 + 49297 + 2) % 233280) / 233280;
          const random4 = ((seed * 9301 + 49297 + 3) % 233280) / 233280;
          
          const x = (random1 - 0.5) * 20;
          const z = (random2 - 0.5) * 20;
          const y = -random3 * 100; // 深度0-100の範囲（y座標は-100から0）
          
          generatedCreatures.push({
            id: `surface-butterfly-${i}`,
            type: "butterfly",
            strength: 0.5 + random4 * 0.3,
            position: [x, y, z],
          });
        }

        // sadness/peace → 水の泡
        const bubbleCount = Math.floor(((emotionCounts.sadness + emotionCounts.peace) / totalStrength) * totalCreatures);
        for (let i = 0; i < bubbleCount; i++) {
          const seed = `bubble-${i}`.charCodeAt(0) + i * 1000;
          const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
          const random2 = ((seed * 9301 + 49297 + 1) % 233280) / 233280;
          const random3 = ((seed * 9301 + 49297 + 2) % 233280) / 233280;
          const random4 = ((seed * 9301 + 49297 + 3) % 233280) / 233280;
          
          const x = (random1 - 0.5) * 20;
          const z = (random2 - 0.5) * 20;
          const y = -random3 * 100; // 深度0-100の範囲（y座標は-100から0）
          
          generatedCreatures.push({
            id: `surface-bubble-${i}`,
            type: "bubble",
            strength: 0.4 + random4 * 0.4,
            position: [x, y, z],
          });
        }

        // stress/inspiration → エネルギーの粒
        const energyCount = Math.floor(((emotionCounts.stress + emotionCounts.inspiration) / totalStrength) * totalCreatures);
        for (let i = 0; i < energyCount; i++) {
          const seed = `energy-${i}`.charCodeAt(0) + i * 1000;
          const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
          const random2 = ((seed * 9301 + 49297 + 1) % 233280) / 233280;
          const random3 = ((seed * 9301 + 49297 + 2) % 233280) / 233280;
          const random4 = ((seed * 9301 + 49297 + 3) % 233280) / 233280;
          
          const x = (random1 - 0.5) * 20;
          const z = (random2 - 0.5) * 20;
          const y = -random3 * 100; // 深度0-100の範囲（y座標は-100から0）
          
          generatedCreatures.push({
            id: `surface-energy-${i}`,
            type: "energy",
            strength: 0.5 + random4 * 0.3,
            position: [x, y, z],
          });
        }

        // nostalgia → 記憶の欠片
        const memoryCount = Math.floor((emotionCounts.nostalgia / totalStrength) * totalCreatures);
        for (let i = 0; i < memoryCount; i++) {
          const seed = `memory-${i}`.charCodeAt(0) + i * 1000;
          const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
          const random2 = ((seed * 9301 + 49297 + 1) % 233280) / 233280;
          const random3 = ((seed * 9301 + 49297 + 2) % 233280) / 233280;
          const random4 = ((seed * 9301 + 49297 + 3) % 233280) / 233280;
          
          const x = (random1 - 0.5) * 20;
          const z = (random2 - 0.5) * 20;
          const y = -random3 * 100; // 深度0-100の範囲（y座標は-100から0）
          
          generatedCreatures.push({
            id: `surface-memory-${i}`,
            type: "memory",
            strength: 0.4 + random4 * 0.4,
            position: [x, y, z],
          });
        }

        // confusion → 迷子の光
        const lostCount = Math.floor((emotionCounts.confusion / totalStrength) * totalCreatures);
        for (let i = 0; i < lostCount; i++) {
          const seed = `lost-${i}`.charCodeAt(0) + i * 1000;
          const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
          const random2 = ((seed * 9301 + 49297 + 1) % 233280) / 233280;
          const random3 = ((seed * 9301 + 49297 + 2) % 233280) / 233280;
          const random4 = ((seed * 9301 + 49297 + 3) % 233280) / 233280;
          
          const x = (random1 - 0.5) * 20;
          const z = (random2 - 0.5) * 20;
          const y = -random3 * 100; // 深度0-100の範囲（y座標は-100から0）
          
          generatedCreatures.push({
            id: `surface-lost-${i}`,
            type: "lost",
            strength: 0.4 + random4 * 0.4,
            position: [x, y, z],
          });
        }
        }
      } else {
        // 地下エリア: 感情オブジェクトの周囲に生成（既存のロジック）
        nearbyEmotions.forEach((emotion) => {
        // 光の蝶々: joy/inspirationの周り
        if (emotion.category === "joy" || emotion.category === "inspiration") {
          const creatureCount = Math.min(Math.floor(emotion.strength * 4 + 1), 5); // 1-5個
          const seed = emotion.id.charCodeAt(0) + emotion.id.charCodeAt(emotion.id.length - 1);
          
          for (let i = 0; i < creatureCount; i++) {
            const creatureSeed = seed + i * 1000;
            const random1 = ((creatureSeed * 9301 + 49297) % 233280) / 233280;
            const random2 = ((creatureSeed * 9301 + 49297 + 1) % 233280) / 233280;
            const random3 = ((creatureSeed * 9301 + 49297 + 2) % 233280) / 233280;
            const random4 = ((creatureSeed * 9301 + 49297 + 3) % 233280) / 233280;
            
            // 感情オブジェクトの周囲、半径3.0-8.0単位の範囲にランダム配置（より広範囲）
            const angle = random1 * Math.PI * 2;
            const radius = 3.0 + random2 * 5.0; // 3.0-8.0単位
            const offsetX = Math.cos(angle) * radius;
            const offsetZ = Math.sin(angle) * radius;
            
            // 深度方向にも分散（感情オブジェクトの前後±1.0-3.0単位）
            const depthVariation = (random3 - 0.5) * 4.0; // -2.0 から +2.0
            
            generatedCreatures.push({
              id: `butterfly-${emotion.id}-${i}`,
              type: "butterfly",
              strength: emotion.strength * (0.7 + random4 * 0.3),
              position: [
                emotion.x + offsetX,
                -emotion.depth + depthVariation,
                emotion.z + offsetZ,
              ],
            });
          }
        }

        // 水の泡: sadness/peaceの周り
        if (emotion.category === "sadness" || emotion.category === "peace") {
          const creatureCount = Math.min(Math.floor(emotion.strength * 3 + 1), 4); // 1-4個
          const seed = emotion.id.charCodeAt(0) + emotion.id.charCodeAt(emotion.id.length - 1);
          
          for (let i = 0; i < creatureCount; i++) {
            const creatureSeed = seed + i * 1000 + 10000;
            const random1 = ((creatureSeed * 9301 + 49297) % 233280) / 233280;
            const random2 = ((creatureSeed * 9301 + 49297 + 1) % 233280) / 233280;
            const random3 = ((creatureSeed * 9301 + 49297 + 2) % 233280) / 233280;
            const random4 = ((creatureSeed * 9301 + 49297 + 3) % 233280) / 233280;
            
            const angle = random1 * Math.PI * 2;
            const radius = 3.0 + random2 * 5.0;
            const offsetX = Math.cos(angle) * radius;
            const offsetZ = Math.sin(angle) * radius;
            const depthVariation = (random3 - 0.5) * 4.0;
            
            generatedCreatures.push({
              id: `bubble-${emotion.id}-${i}`,
              type: "bubble",
              strength: emotion.strength * (0.6 + random4 * 0.4),
              position: [
                emotion.x + offsetX,
                -emotion.depth + depthVariation,
                emotion.z + offsetZ,
              ],
            });
          }
        }

        // エネルギーの粒: stress/inspirationの周り
        if (emotion.category === "stress" || emotion.category === "inspiration") {
          const creatureCount = Math.min(Math.floor(emotion.strength * 4 + 1), 5); // 1-5個
          const seed = emotion.id.charCodeAt(0) + emotion.id.charCodeAt(emotion.id.length - 1);
          
          for (let i = 0; i < creatureCount; i++) {
            const creatureSeed = seed + i * 1000 + 20000;
            const random1 = ((creatureSeed * 9301 + 49297) % 233280) / 233280;
            const random2 = ((creatureSeed * 9301 + 49297 + 1) % 233280) / 233280;
            const random3 = ((creatureSeed * 9301 + 49297 + 2) % 233280) / 233280;
            const random4 = ((creatureSeed * 9301 + 49297 + 3) % 233280) / 233280;
            
            const angle = random1 * Math.PI * 2;
            const radius = 3.0 + random2 * 5.0;
            const offsetX = Math.cos(angle) * radius;
            const offsetZ = Math.sin(angle) * radius;
            const depthVariation = (random3 - 0.5) * 4.0;
            
            generatedCreatures.push({
              id: `energy-${emotion.id}-${i}`,
              type: "energy",
              strength: emotion.strength * (0.7 + random4 * 0.3),
              position: [
                emotion.x + offsetX,
                -emotion.depth + depthVariation,
                emotion.z + offsetZ,
              ],
            });
          }
        }

        // 記憶の欠片: nostalgiaの周り
        if (emotion.category === "nostalgia") {
          const creatureCount = Math.min(Math.floor(emotion.strength * 3 + 1), 4); // 1-4個
          const seed = emotion.id.charCodeAt(0) + emotion.id.charCodeAt(emotion.id.length - 1);
          
          for (let i = 0; i < creatureCount; i++) {
            const creatureSeed = seed + i * 1000 + 30000;
            const random1 = ((creatureSeed * 9301 + 49297) % 233280) / 233280;
            const random2 = ((creatureSeed * 9301 + 49297 + 1) % 233280) / 233280;
            const random3 = ((creatureSeed * 9301 + 49297 + 2) % 233280) / 233280;
            const random4 = ((creatureSeed * 9301 + 49297 + 3) % 233280) / 233280;
            
            const angle = random1 * Math.PI * 2;
            const radius = 3.0 + random2 * 5.0;
            const offsetX = Math.cos(angle) * radius;
            const offsetZ = Math.sin(angle) * radius;
            const depthVariation = (random3 - 0.5) * 4.0;
            
            generatedCreatures.push({
              id: `memory-${emotion.id}-${i}`,
              type: "memory",
              strength: emotion.strength * (0.6 + random4 * 0.4),
              position: [
                emotion.x + offsetX,
                -emotion.depth + depthVariation,
                emotion.z + offsetZ,
              ],
            });
          }
        }

        // 迷子の光: confusionの周り
        if (emotion.category === "confusion") {
          const creatureCount = Math.min(Math.floor(emotion.strength * 3 + 1), 4); // 1-4個
          const seed = emotion.id.charCodeAt(0) + emotion.id.charCodeAt(emotion.id.length - 1);
          
          for (let i = 0; i < creatureCount; i++) {
            const creatureSeed = seed + i * 1000 + 40000;
            const random1 = ((creatureSeed * 9301 + 49297) % 233280) / 233280;
            const random2 = ((creatureSeed * 9301 + 49297 + 1) % 233280) / 233280;
            const random3 = ((creatureSeed * 9301 + 49297 + 2) % 233280) / 233280;
            const random4 = ((creatureSeed * 9301 + 49297 + 3) % 233280) / 233280;
            
            const angle = random1 * Math.PI * 2;
            const radius = 3.0 + random2 * 5.0;
            const offsetX = Math.cos(angle) * radius;
            const offsetZ = Math.sin(angle) * radius;
            const depthVariation = (random3 - 0.5) * 4.0;
            
            generatedCreatures.push({
              id: `lost-${emotion.id}-${i}`,
              type: "lost",
              strength: emotion.strength * (0.6 + random4 * 0.4),
              position: [
                emotion.x + offsetX,
                -emotion.depth + depthVariation,
                emotion.z + offsetZ,
              ],
            });
          }
        }
      });
      }
    } catch (error) {
      console.error("生物生成エラー:", error);
      return [];
    }

    return generatedCreatures;
  }, [nearbyEmotions, currentDepth, isSurfaceArea]);

  return (
    <>
      {creatures.map((creature) => {
        switch (creature.type) {
          case "butterfly":
            return (
              <LightButterfly
                key={creature.id}
                strength={creature.strength}
                position={creature.position}
                emotionObjects={nearbyEmotions}
              />
            );
          case "bubble":
            return (
              <WaterBubble
                key={creature.id}
                strength={creature.strength}
                position={creature.position}
                emotionObjects={nearbyEmotions}
              />
            );
          case "energy":
            return (
              <EnergyParticle
                key={creature.id}
                strength={creature.strength}
                position={creature.position}
                emotionObjects={nearbyEmotions}
              />
            );
          case "memory":
            return (
              <MemoryFragment
                key={creature.id}
                strength={creature.strength}
                position={creature.position}
                emotionObjects={nearbyEmotions}
              />
            );
          case "lost":
            return (
              <LostLight
                key={creature.id}
                strength={creature.strength}
                position={creature.position}
                emotionObjects={nearbyEmotions}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}

