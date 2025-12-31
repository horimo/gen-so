import { Application, Container } from "pixi.js";
import type { EmotionObject } from "@/store/useEmotionStore";
import { createCreatureSprite } from "./createCreatureSprite";

interface CreatureSystem2DProps {
  app: Application;
  container: Container;
  emotionObjects: EmotionObject[];
  currentDepth: number;
  isSurfaceArea: boolean;
  groundY: number;
}

interface CreatureData {
  id: string;
  type: "butterfly" | "bird" | "insect" | "bubble" | "energy" | "memory" | "lost" | "glowFungus" | "microbe";
  strength: number;
  x: number;
  y: number;
  isSurface: boolean;
  seed: number;
}

/**
 * 生物システム2D
 * 地上と地下で異なる生物を生成
 */
export function CreatureSystem2D({
  app,
  container,
  emotionObjects,
  currentDepth,
  isSurfaceArea,
  groundY,
}: CreatureSystem2DProps): Container {
  const creatureSystemContainer = new Container();
  creatureSystemContainer.name = "creature-system-2d";

  // 地上エリアの場合は全感情オブジェクトを使用、地下エリアの場合は近くの感情のみ
  const nearbyEmotions = emotionObjects.filter((emotion) => {
    // 地上エリアでは深度0以下の感情オブジェクトのみを考慮
    if (isSurfaceArea) {
      return emotion.depth <= 0; // 地上エリア（深度0以下）
    } else {
      // 地下エリアでは現在の深度±800の範囲内の感情オブジェクトをフィルタリング
      const distance = Math.abs(emotion.depth - currentDepth);
      return distance <= 800;
    }
  });

  const generatedCreatures: CreatureData[] = [];

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
        const random = (s: number) => ((s * 9301 + 49297) % 233280) / 233280;
        const viewportWidth = window.innerWidth;
        const x = (random(seed) - 0.5) * viewportWidth * 0.8;
        const y = groundY - random(seed + 1) * 200; // 地上エリア（groundYより上）

        generatedCreatures.push({
          id: `default-surface-butterfly-${i}`,
          type: "butterfly",
          strength: 0.5 + random(seed + 2) * 0.3,
          x,
          y,
          isSurface: true,
          seed,
        });
      }

      // 鳥
      for (let i = 0; i < defaultCreatureCount; i++) {
        const seed = `bird-${i}`.charCodeAt(0) + i * 1000;
        const random = (s: number) => ((s * 9301 + 49297) % 233280) / 233280;
        const viewportWidth = window.innerWidth;
        const x = (random(seed) - 0.5) * viewportWidth * 0.8;
        const y = groundY - random(seed + 1) * 200;

        generatedCreatures.push({
          id: `default-surface-bird-${i}`,
          type: "bird",
          strength: 0.5 + random(seed + 2) * 0.3,
          x,
          y,
          isSurface: true,
          seed,
        });
      }
    } else {
      // 各感情タイプから生物を生成（分布に応じて数が変わる）
      const totalCreatures = Math.min(Math.floor(totalStrength * 15), 80); // 最大80個

      // joy/inspiration → 光の蝶々
      const butterflyCount = Math.floor(
        ((emotionCounts.joy + emotionCounts.inspiration) / totalStrength) * totalCreatures
      );
      for (let i = 0; i < butterflyCount; i++) {
        const seed = `butterfly-${i}`.charCodeAt(0) + i * 1000;
        const random = (s: number) => ((s * 9301 + 49297) % 233280) / 233280;
        const viewportWidth = window.innerWidth;
        const x = (random(seed) - 0.5) * viewportWidth * 0.8;
        const y = groundY - random(seed + 1) * 200; // 地上エリア

        generatedCreatures.push({
          id: `surface-butterfly-${i}`,
          type: "butterfly",
          strength: 0.5 + random(seed + 2) * 0.3,
          x,
          y,
          isSurface: true,
          seed,
        });
      }

      // peace/sadness → 鳥
      const birdCount = Math.floor(
        ((emotionCounts.peace + emotionCounts.sadness) / totalStrength) * totalCreatures
      );
      for (let i = 0; i < birdCount; i++) {
        const seed = `bird-${i}`.charCodeAt(0) + i * 1000;
        const random = (s: number) => ((s * 9301 + 49297) % 233280) / 233280;
        const viewportWidth = window.innerWidth;
        const x = (random(seed) - 0.5) * viewportWidth * 0.8;
        const y = groundY - random(seed + 1) * 200;

        generatedCreatures.push({
          id: `surface-bird-${i}`,
          type: "bird",
          strength: 0.5 + random(seed + 2) * 0.3,
          x,
          y,
          isSurface: true,
          seed,
        });
      }

      // stress → 昆虫
      const insectCount = Math.floor((emotionCounts.stress / totalStrength) * totalCreatures);
      for (let i = 0; i < insectCount; i++) {
        const seed = `insect-${i}`.charCodeAt(0) + i * 1000;
        const random = (s: number) => ((s * 9301 + 49297) % 233280) / 233280;
        const viewportWidth = window.innerWidth;
        const x = (random(seed) - 0.5) * viewportWidth * 0.8;
        const y = groundY - random(seed + 1) * 200;

        generatedCreatures.push({
          id: `surface-insect-${i}`,
          type: "insect",
          strength: 0.5 + random(seed + 2) * 0.3,
          x,
          y,
          isSurface: true,
          seed,
        });
      }

      // inspiration → エネルギーの粒
      const energyCount = Math.floor((emotionCounts.inspiration / totalStrength) * totalCreatures);
      for (let i = 0; i < energyCount; i++) {
        const seed = `energy-${i}`.charCodeAt(0) + i * 1000;
        const random = (s: number) => ((s * 9301 + 49297) % 233280) / 233280;
        const viewportWidth = window.innerWidth;
        const x = (random(seed) - 0.5) * viewportWidth * 0.8;
        const y = groundY - random(seed + 1) * 200;

        generatedCreatures.push({
          id: `surface-energy-${i}`,
          type: "energy",
          strength: 0.5 + random(seed + 2) * 0.3,
          x,
          y,
          isSurface: true,
          seed,
        });
      }

      // nostalgia → 記憶の欠片
      const memoryCount = Math.floor((emotionCounts.nostalgia / totalStrength) * totalCreatures);
      for (let i = 0; i < memoryCount; i++) {
        const seed = `memory-${i}`.charCodeAt(0) + i * 1000;
        const random = (s: number) => ((s * 9301 + 49297) % 233280) / 233280;
        const viewportWidth = window.innerWidth;
        const x = (random(seed) - 0.5) * viewportWidth * 0.8;
        const y = groundY - random(seed + 1) * 200;

        generatedCreatures.push({
          id: `surface-memory-${i}`,
          type: "memory",
          strength: 0.4 + random(seed + 2) * 0.4,
          x,
          y,
          isSurface: true,
          seed,
        });
      }

      // confusion → 迷子の光
      const lostCount = Math.floor((emotionCounts.confusion / totalStrength) * totalCreatures);
      for (let i = 0; i < lostCount; i++) {
        const seed = `lost-${i}`.charCodeAt(0) + i * 1000;
        const random = (s: number) => ((s * 9301 + 49297) % 233280) / 233280;
        const viewportWidth = window.innerWidth;
        const x = (random(seed) - 0.5) * viewportWidth * 0.8;
        const y = groundY - random(seed + 1) * 200;

        generatedCreatures.push({
          id: `surface-lost-${i}`,
          type: "lost",
          strength: 0.4 + random(seed + 2) * 0.4,
          x,
          y,
          isSurface: true,
          seed,
        });
      }
    }
  } else {
    // 地下エリア: 感情オブジェクトの周囲に生成
    nearbyEmotions.forEach((emotion) => {
      const seed = emotion.id.charCodeAt(0) + emotion.id.charCodeAt(emotion.id.length - 1);
      const random = (s: number) => ((s * 9301 + 49297) % 233280) / 233280;

      // joy/inspiration → 発光菌類
      if (emotion.category === "joy" || emotion.category === "inspiration") {
        const creatureCount = Math.min(Math.floor(emotion.strength * 4 + 1), 5); // 1-5個
        for (let i = 0; i < creatureCount; i++) {
          const creatureSeed = seed + i * 1000;
          const offsetX = (random(creatureSeed) - 0.5) * 60;
          const offsetY = (random(creatureSeed + 1) - 0.5) * 30;

          const emotionX = window.innerWidth / 2 + emotion.x * 10;
          const emotionY = groundY + (emotion.depth - currentDepth) * 10;

          generatedCreatures.push({
            id: `glowFungus-${emotion.id}-${i}`,
            type: "glowFungus",
            strength: emotion.strength * (0.7 + random(creatureSeed + 2) * 0.3),
            x: emotionX + offsetX,
            y: emotionY + offsetY,
            isSurface: false,
            seed: creatureSeed,
          });
        }
      }

      // sadness/peace → 水の泡
      if (emotion.category === "sadness" || emotion.category === "peace") {
        const creatureCount = Math.min(Math.floor(emotion.strength * 3 + 1), 4);
        for (let i = 0; i < creatureCount; i++) {
          const creatureSeed = seed + i * 1000;
          const offsetX = (random(creatureSeed) - 0.5) * 50;
          const offsetY = (random(creatureSeed + 1) - 0.5) * 25;

          const emotionX = window.innerWidth / 2 + emotion.x * 10;
          const emotionY = groundY + (emotion.depth - currentDepth) * 10;

          generatedCreatures.push({
            id: `bubble-${emotion.id}-${i}`,
            type: "bubble",
            strength: emotion.strength * (0.6 + random(creatureSeed + 2) * 0.4),
            x: emotionX + offsetX,
            y: emotionY + offsetY,
            isSurface: false,
            seed: creatureSeed,
          });
        }
      }

      // stress/inspiration → エネルギーの粒
      if (emotion.category === "stress" || emotion.category === "inspiration") {
        const creatureCount = Math.min(Math.floor(emotion.strength * 5 + 1), 6);
        for (let i = 0; i < creatureCount; i++) {
          const creatureSeed = seed + i * 1000;
          const offsetX = (random(creatureSeed) - 0.5) * 70;
          const offsetY = (random(creatureSeed + 1) - 0.5) * 35;

          const emotionX = window.innerWidth / 2 + emotion.x * 10;
          const emotionY = groundY + (emotion.depth - currentDepth) * 10;

          generatedCreatures.push({
            id: `energy-${emotion.id}-${i}`,
            type: "energy",
            strength: emotion.strength * (0.7 + random(creatureSeed + 2) * 0.3),
            x: emotionX + offsetX,
            y: emotionY + offsetY,
            isSurface: false,
            seed: creatureSeed,
          });
        }
      }

      // nostalgia → 記憶の欠片
      if (emotion.category === "nostalgia") {
        const creatureCount = Math.min(Math.floor(emotion.strength * 3 + 1), 4);
        for (let i = 0; i < creatureCount; i++) {
          const creatureSeed = seed + i * 1000;
          const offsetX = (random(creatureSeed) - 0.5) * 55;
          const offsetY = (random(creatureSeed + 1) - 0.5) * 28;

          const emotionX = window.innerWidth / 2 + emotion.x * 10;
          const emotionY = groundY + (emotion.depth - currentDepth) * 10;

          generatedCreatures.push({
            id: `memory-${emotion.id}-${i}`,
            type: "memory",
            strength: emotion.strength * (0.6 + random(creatureSeed + 2) * 0.4),
            x: emotionX + offsetX,
            y: emotionY + offsetY,
            isSurface: false,
            seed: creatureSeed,
          });
        }
      }

      // confusion → 迷子の光
      if (emotion.category === "confusion") {
        const creatureCount = Math.min(Math.floor(emotion.strength * 4 + 1), 5);
        for (let i = 0; i < creatureCount; i++) {
          const creatureSeed = seed + i * 1000;
          const offsetX = (random(creatureSeed) - 0.5) * 65;
          const offsetY = (random(creatureSeed + 1) - 0.5) * 32;

          const emotionX = window.innerWidth / 2 + emotion.x * 10;
          const emotionY = groundY + (emotion.depth - currentDepth) * 10;

          generatedCreatures.push({
            id: `lost-${emotion.id}-${i}`,
            type: "lost",
            strength: emotion.strength * (0.6 + random(creatureSeed + 2) * 0.4),
            x: emotionX + offsetX,
            y: emotionY + offsetY,
            isSurface: false,
            seed: creatureSeed,
          });
        }
      }

      // peace → 微生物（地下エリア専用）
      if (emotion.category === "peace") {
        const creatureCount = Math.min(Math.floor(emotion.strength * 2 + 1), 3);
        for (let i = 0; i < creatureCount; i++) {
          const creatureSeed = seed + i * 1000;
          const offsetX = (random(creatureSeed) - 0.5) * 45;
          const offsetY = (random(creatureSeed + 1) - 0.5) * 22;

          const emotionX = window.innerWidth / 2 + emotion.x * 10;
          const emotionY = groundY + (emotion.depth - currentDepth) * 10;

          generatedCreatures.push({
            id: `microbe-${emotion.id}-${i}`,
            type: "microbe",
            strength: emotion.strength * (0.5 + random(creatureSeed + 2) * 0.5),
            x: emotionX + offsetX,
            y: emotionY + offsetY,
            isSurface: false,
            seed: creatureSeed,
          });
        }
      }
    });
  }

  // 生成された生物をスプライトとして描画
  generatedCreatures.forEach((creature) => {
    const creatureSprite = createCreatureSprite({
      app,
      type: creature.type,
      strength: creature.strength,
      x: creature.x,
      y: creature.y,
      isSurface: creature.isSurface,
      seed: creature.seed,
    });
    creatureSprite.name = `creature-${creature.id}`;
    creatureSystemContainer.addChild(creatureSprite);
  });

  return creatureSystemContainer;
}

