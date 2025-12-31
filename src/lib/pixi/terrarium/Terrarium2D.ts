import { Application, Container } from "pixi.js";
import type { StrataObject } from "@/app/api/strata/route";
import { getStrataObjects } from "@/lib/api-strata";
import { createPlantSprite } from "../plants/createPlantSprite";
import type { EmotionCategory } from "../utils/colorPalette";

interface Terrarium2DProps {
  app: Application;
  container: Container;
  currentDepth: number;
  groundY: number;
  userId?: string;
}

export interface TerrariumPlant {
  id: string;
  category: EmotionCategory;
  strength: number;
  x: number;
  y: number;
  growthProgress: number; // 0-1の範囲で成長度合い
  seed: number;
}

/**
 * 過去のチャットデータを分析して植物の成長度合いを計算
 */
function analyzeChatDataForGrowth(strataObjects: StrataObject[], groundY: number): {
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

  Object.entries(emotionCounts).forEach(([category, data]) => {
    if (data.count === 0) return;

    // チャット数に応じて植物の数を決定（3-15個、より多くの植物で生態系を形成）
    const plantCount = Math.min(15, Math.max(3, Math.floor(data.count / 3) + 3));
    const avgStrength = data.totalStrength / data.count;

    for (let i = 0; i < plantCount; i++) {
      // シードベースの疑似乱数生成（一貫性を保つ）
      const seed = category.charCodeAt(0) + i * 1000 + totalChats;
      const random = (s: number) => ((s * 9301 + 49297) % 233280) / 233280;
      const random1 = random(seed);
      const random2 = random(seed + 1);
      const random3 = random(seed + 2);
      const random4 = random(seed + 3);

      // 地上エリア全体に広がる配置（画面幅の80%の範囲、groundYより上）
      const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 800;
      const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 600;
      const angle = random1 * Math.PI * 2;
      const radius = (random2 * 0.3 + 0.1) * viewportWidth; // 画面幅の10-40%の範囲
      const x = (viewportWidth / 2) + Math.cos(angle) * radius;
      // groundYより上、画面の上1/3からgroundYまでの範囲に配置
      const maxY = groundY - 20; // groundYより20px上
      const minY = Math.max(0, groundY - viewportHeight * 0.3); // 画面の上1/3または0
      const y = minY + random3 * (maxY - minY);

      // 成長度合いを計算（チャット数と強度に基づく）
      const categoryGrowth = Math.min(1.0, (data.count / 20) * 0.6 + avgStrength * 0.4);
      const growthProgress = categoryGrowth * (0.8 + random4 * 0.2); // 0.8-1.0倍の範囲でランダムに変動

      plantData.push({
        id: `terrarium-plant-${category}-${i}`,
        category: category as EmotionCategory,
        strength: avgStrength * (0.7 + random4 * 0.3),
        x,
        y,
        growthProgress,
        seed,
      });
    }
  });

  return {
    plantData,
    totalGrowth,
  };
}

/**
 * テラリウム2D
 * 地上エリアに配置される植物の生態系
 * 過去のチャット内容に基づいて植物が成長する
 */
export function Terrarium2D({
  app,
  container,
  currentDepth,
  groundY,
  userId,
}: Terrarium2DProps): Container | null {
  // 地上エリア（depth < 0）にのみ表示
  const isVisible = currentDepth < 0;

  if (!isVisible || !userId) {
    return null;
  }

  const terrariumContainer = new Container();
  terrariumContainer.name = "terrarium-2d";

  // チャットデータを取得（非同期処理は呼び出し側で行う）
  // ここではコンテナのみを作成し、実際のデータ取得と描画はuseEffectで行う
  return terrariumContainer;
}

/**
 * テラリウムの植物データを生成（非同期）
 */
export async function generateTerrariumPlants(
  userId: string,
  groundY: number
): Promise<{ plantData: TerrariumPlant[]; totalGrowth: number }> {
  try {
    const strataObjects = await getStrataObjects();
    return analyzeChatDataForGrowth(strataObjects, groundY);
  } catch (error) {
    console.error("テラリウム用チャットデータの読み込みエラー:", error);
    return {
      plantData: [],
      totalGrowth: 0,
    };
  }
}

/**
 * テラリウムの植物を描画
 * @returns テラリウムコンテナ（位置調整用）
 */
export function renderTerrariumPlants(
  plantData: TerrariumPlant[],
  app: Application,
  container: Container,
  baseGroundY: number
): Container {
  // 既存のテラリウムコンテナを削除
  const existingTerrariumContainer = container.getChildByName("terrarium-container");
  if (existingTerrariumContainer) {
    container.removeChild(existingTerrariumContainer);
  }

  // テラリウム専用のコンテナを作成
  const terrariumContainer = new Container();
  terrariumContainer.name = "terrarium-container";

  console.log("renderTerrariumPlants呼び出し:", { 
    plantCount: plantData.length, 
    baseGroundY,
    viewportWidth: typeof window !== "undefined" ? window.innerWidth : 0,
    viewportHeight: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  // 各植物を描画
  plantData.forEach((plant, index) => {
    // 成長度合いに応じてサイズを調整
    const baseSize = 8 + plant.strength * 8;
    const size = baseSize * (0.3 + plant.growthProgress * 0.7); // 0.3-1.0倍の範囲

    console.log(`植物${index}を描画:`, { 
      id: plant.id, 
      category: plant.category, 
      x: plant.x, 
      y: plant.y, 
      baseGroundY,
      scale: 0.3 + plant.growthProgress * 0.7 
    });

    const plantSprite = createPlantSprite({
      app,
      category: plant.category,
      strength: plant.strength,
      x: plant.x,
      y: plant.y,
      isSurface: true, // テラリウムは地上エリア専用
      seed: plant.seed,
    });

    // 成長度合いに応じてスケールを調整
    const scale = 0.3 + plant.growthProgress * 0.7;
    plantSprite.scale.set(scale, scale);

    plantSprite.name = `terrarium-plant-${plant.id}`;
    terrariumContainer.addChild(plantSprite);
    
    console.log(`植物${index}を追加完了:`, { 
      name: plantSprite.name, 
      x: plantSprite.x, 
      y: plantSprite.y, 
      scale: plantSprite.scale.x,
      visible: plantSprite.visible,
      alpha: plantSprite.alpha
    });
  });
  
  // テラリウムコンテナをメインコンテナに追加
  container.addChild(terrariumContainer);
  
  console.log("テラリウム植物描画完了。コンテナの子要素数:", container.children.length);
  
  return terrariumContainer;
}

