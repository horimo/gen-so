"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { FogExp2, Color, DirectionalLight } from "three";
import { Sparkles } from "@react-three/drei";
import { useEmotionStore } from "@/store/useEmotionStore";
import { EmotionObjectRenderer } from "./emotions/EmotionObject";
import { OthersLight } from "./OthersLight";
import { PlantSystem } from "./ecosystem/PlantSystem";
import { CreatureSystem } from "./ecosystem/CreatureSystem";
import { SurfacePlane } from "./SurfacePlane";
import { Terrarium } from "./Terrarium";
import { Ground } from "./Ground";

interface SceneProps {
  depth: number;
  userId?: string;
  othersLights?: Array<{
    depth_y: number;
    category: "joy" | "peace" | "stress" | "sadness" | "inspiration" | "nostalgia" | "confusion";
    strength: number;
  }>;
}

/**
 * 全感情オブジェクトの分布を分析（地上エリア用）
 */
function analyzeAllEmotionDistribution(
  emotionObjects: Array<{
    category: string;
    strength: number;
  }>
) {
  // すべての感情オブジェクトを分析
  const emotionScores: { [key: string]: number } = {
    joy: 0,
    inspiration: 0,
    sadness: 0,
    peace: 0,
    stress: 0,
    nostalgia: 0,
    confusion: 0,
  };

  let totalStrength = 0;
  emotionObjects.forEach((emotion) => {
    const category = emotion.category as keyof typeof emotionScores;
    if (category in emotionScores) {
      emotionScores[category] += emotion.strength;
      totalStrength += emotion.strength;
    }
  });

  // 正規化（0-1の範囲）
  const normalizedScores = {
    joy: totalStrength > 0 ? emotionScores.joy / totalStrength : 0,
    inspiration: totalStrength > 0 ? emotionScores.inspiration / totalStrength : 0,
    sadness: totalStrength > 0 ? emotionScores.sadness / totalStrength : 0,
    peace: totalStrength > 0 ? emotionScores.peace / totalStrength : 0,
    stress: totalStrength > 0 ? emotionScores.stress / totalStrength : 0,
    nostalgia: totalStrength > 0 ? emotionScores.nostalgia / totalStrength : 0,
    confusion: totalStrength > 0 ? emotionScores.confusion / totalStrength : 0,
  };

  // 平均的な感情の強度
  const avgStrength = emotionObjects.length > 0
    ? totalStrength / emotionObjects.length
    : 0;

  return {
    normalizedScores,
    avgStrength,
    totalCount: emotionObjects.length,
  };
}

/**
 * 感情の分布を分析して環境に反映
 */
function analyzeEmotionDistribution(
  emotionObjects: Array<{
    category: string;
    strength: number;
    depth: number;
  }>,
  currentDepth: number
) {
  // 現在の深度±800の範囲内の感情オブジェクトをフィルタリング（範囲を拡大）
  const nearbyEmotions = emotionObjects.filter((emotion) => {
    const distance = Math.abs(emotion.depth - currentDepth);
    return distance <= 800;
  });

  // 各感情タイプの強度を合計
  const emotionScores = {
    joy: 0,
    inspiration: 0,
    sadness: 0,
    peace: 0,
    stress: 0,
    nostalgia: 0,
    confusion: 0,
  };

  let totalStrength = 0;
  nearbyEmotions.forEach((emotion) => {
    const category = emotion.category as keyof typeof emotionScores;
    if (category in emotionScores) {
      emotionScores[category] += emotion.strength;
      totalStrength += emotion.strength;
    }
  });

  // 正規化（0-1の範囲）
  const normalizedScores = {
    joy: totalStrength > 0 ? emotionScores.joy / totalStrength : 0,
    inspiration: totalStrength > 0 ? emotionScores.inspiration / totalStrength : 0,
    sadness: totalStrength > 0 ? emotionScores.sadness / totalStrength : 0,
    peace: totalStrength > 0 ? emotionScores.peace / totalStrength : 0,
    stress: totalStrength > 0 ? emotionScores.stress / totalStrength : 0,
    nostalgia: totalStrength > 0 ? emotionScores.nostalgia / totalStrength : 0,
    confusion: totalStrength > 0 ? emotionScores.confusion / totalStrength : 0,
  };

  // 平均的な感情の強度
  const avgStrength = nearbyEmotions.length > 0
    ? totalStrength / nearbyEmotions.length
    : 0;

  return {
    normalizedScores,
    avgStrength,
    totalCount: nearbyEmotions.length,
  };
}

/**
 * 深度と感情の分布に応じて背景色を計算
 */
function getBackgroundColor(depth: number, emotionDistribution: ReturnType<typeof analyzeEmotionDistribution>): string {
  // 深度が深いほど黒に近づく（基本色）
  const normalizedDepth = Math.min(depth / 1000, 1);
  let r = 26 * (1 - normalizedDepth);
  let g = 26 * (1 - normalizedDepth);
  let b = 46 * (1 - normalizedDepth);

  // 感情の分布を背景色に反映（10%の影響に削減、白くならないように）
  const { normalizedScores } = emotionDistribution;
  const emotionInfluence = 0.1; // 20%から10%に削減

  // joy/inspiration: 暖色（黄色・オレンジ）
  const warmInfluence = normalizedScores.joy + normalizedScores.inspiration;
  r += warmInfluence * 30 * emotionInfluence; // 50から30に削減
  g += warmInfluence * 20 * emotionInfluence; // 30から20に削減

  // sadness/peace: 青緑色
  const calmInfluence = normalizedScores.sadness + normalizedScores.peace;
  g += calmInfluence * 15 * emotionInfluence; // 20から15に削減
  b += calmInfluence * 30 * emotionInfluence; // 40から30に削減

  // stress: 赤・紫
  const stressInfluence = normalizedScores.stress;
  r += stressInfluence * 40 * emotionInfluence; // 60から40に削減
  b += stressInfluence * 20 * emotionInfluence; // 30から20に削減

  // nostalgia: セピア色
  const nostalgiaInfluence = normalizedScores.nostalgia;
  r += nostalgiaInfluence * 20 * emotionInfluence; // 30から20に削減
  g += nostalgiaInfluence * 15 * emotionInfluence; // 20から15に削減

  // confusion: 濁った緑
  const confusionInfluence = normalizedScores.confusion;
  g += confusionInfluence * 15 * emotionInfluence; // 20から15に削減

  // 値を0-255の範囲に制限し、白っぽい色（r, g, b がすべて150以上）にならないように制限
  r = Math.max(0, Math.min(150, Math.floor(r))); // 255から150に制限
  g = Math.max(0, Math.min(150, Math.floor(g))); // 255から150に制限
  b = Math.max(0, Math.min(180, Math.floor(b))); // 255から180に制限（青は少し明るく）

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * 深度と感情の分布に応じてフォグの密度を計算
 */
function getFogDensity(depth: number, emotionDistribution: ReturnType<typeof analyzeEmotionDistribution>): number {
  // 深く潜るほどフォグが濃くなる（基本密度）
  const normalizedDepth = Math.min(depth / 2000, 1);
  let baseDensity = 0.01 + normalizedDepth * 0.05; // 0.01 ~ 0.06

  // 強い感情が多いほど霧が薄くなる（感情が「空間を切り開く」）
  const { avgStrength, totalCount } = emotionDistribution;
  const strongEmotionInfluence = Math.min(avgStrength * 0.5, 0.03); // 最大0.03の減少
  baseDensity = Math.max(0.005, baseDensity - strongEmotionInfluence);

  // 感情オブジェクトが少ない深度では霧が濃くなる
  if (totalCount < 3) {
    baseDensity += 0.01;
  }

  return Math.min(baseDensity, 0.08); // 最大0.08
}

/**
 * 感情の分布に応じたライティング設定を計算
 */
function getLightingSettings(emotionDistribution: ReturnType<typeof analyzeEmotionDistribution>) {
  const { normalizedScores } = emotionDistribution;

  // 環境光の強度
  let ambientIntensity = 0.3;
  
  // joy/inspirationが多い: 明るくなる
  const brightInfluence = normalizedScores.joy + normalizedScores.inspiration;
  ambientIntensity += brightInfluence * 0.4; // 最大0.7

  // sadnessが多い: 暗くなる
  const darkInfluence = normalizedScores.sadness;
  ambientIntensity -= darkInfluence * 0.2; // 最小0.1

  ambientIntensity = Math.max(0.1, Math.min(0.7, ambientIntensity));

  // 指向性ライトの強度
  let directionalIntensity = 0.5;
  directionalIntensity += brightInfluence * 0.3; // 最大0.8
  directionalIntensity = Math.max(0.3, Math.min(0.8, directionalIntensity));

  // ライトの色（感情に応じて変化）
  let lightColor = "#ffffff";
  
  if (brightInfluence > 0.3) {
    // joy/inspiration: 暖色
    lightColor = "#fff4e6"; // 温かい白
  } else if (normalizedScores.peace > 0.3) {
    // peace: 柔らかな青白
    lightColor = "#e6f3ff";
  } else if (normalizedScores.stress > 0.3) {
    // stress: 赤みがかった光
    lightColor = "#ffe6e6";
  } else if (normalizedScores.sadness > 0.3) {
    // sadness: 青みがかった光
    lightColor = "#e6e6ff";
  }

  // stressが多い場合の点滅効果（時間ベース）
  const stressBlink = normalizedScores.stress > 0.2;

  return {
    ambientIntensity,
    directionalIntensity,
    lightColor,
    stressBlink,
  };
}

/**
 * 3Dシーンのメインコンポーネント
 */
export function Scene({ depth, userId, othersLights = [] }: SceneProps) {
  const { scene, camera } = useThree();
  const fogRef = useRef<FogExp2 | null>(null);
  const directionalLightRef = useRef<DirectionalLight>(null);
  const timeRef = useRef(0);
  const emotionObjects = useEmotionStore((state) => state.objects);
  const targetCameraYRef = useRef(-depth);
  const currentCameraYRef = useRef(-depth);

  // 地上エリアかどうかを判定（深度 0以上 ～ 100以下が地上、100より大きい値が地下）
  const isSurfaceArea = useMemo(() => {
    return depth >= 0 && depth <= 100;
  }, [depth]);

  // 現在の深度に近い他者の光をフィルタリング（±200の範囲）
  const nearbyLights = useMemo(() => {
    return othersLights.filter((light) => {
      const distance = Math.abs(light.depth_y - depth);
      return distance <= 200; // 現在の深度から±200以内
    });
  }, [othersLights, depth]);

  // 感情の分布を分析（地上エリアの場合は全感情、地下エリアの場合は近くの感情）
  const emotionDistribution = useMemo(() => {
    if (isSurfaceArea) {
      // 地上エリア: 全感情オブジェクトの分布を分析
      return analyzeAllEmotionDistribution(emotionObjects);
    } else {
      // 地下エリア: 現在の深度±500の範囲内の感情を分析
      return analyzeEmotionDistribution(emotionObjects, depth);
    }
  }, [emotionObjects, depth, isSurfaceArea]);

  // 背景色を深度と感情の分布に応じて更新（シンプルで確実な実装）
  const backgroundColor = useMemo(() => {
    // 地上エリア（depth < 100）: 明るい青空色
    if (depth < 100) {
      // 深度0より上（地上）: 常に明るい青空色
      if (depth < 0) {
        return `rgb(135, 206, 250)`;
      }
      
      // 深度0-100: 地上から地下へのスムーズな遷移
      const normalizedDepth = depth / 100; // 0-1の範囲
      const r = Math.floor(135 + (26 - 135) * normalizedDepth);
      const g = Math.floor(206 + (26 - 206) * normalizedDepth);
      const b = Math.floor(250 + (46 - 250) * normalizedDepth);
      return `rgb(${r}, ${g}, ${b})`;
    }
    
    // 地下エリア（depth >= 100）: 深い背景色（感情の影響を最小限に）
    // 深度が深いほど黒に近づく（基本色のみ、感情の影響は最小限）
    const normalizedDepth = Math.min((depth - 100) / 900, 1); // 100-1000の範囲を0-1に正規化
    const r = Math.floor(26 + (10 - 26) * normalizedDepth); // 26 → 10（より暗く）
    const g = Math.floor(26 + (10 - 26) * normalizedDepth); // 26 → 10
    const b = Math.floor(46 + (20 - 46) * normalizedDepth); // 46 → 20
      
      return `rgb(${r}, ${g}, ${b})`;
  }, [depth]);
  
  // フォグの密度を深度と感情の分布に応じて更新（地上エリアは非常に薄く、地下エリアは濃く）
  // 地表（深度0）付近での急激な変化を追加
  const fogDensity = useMemo(() => {
    // 地表付近（深度-10 ～ 10）での急激な変化
    const surfaceTransitionRange = 10;
    const distanceFromSurface = Math.abs(depth);
    
    if (distanceFromSurface <= surfaceTransitionRange) {
      // 地表付近: 深度0に近いほど薄く、離れるほど濃くなる（急激な変化）
      const normalizedDistance = distanceFromSurface / surfaceTransitionRange;
      // 深度0で0.0005（非常に薄い）、深度10で0.01（やや濃い）
      const surfaceFog = 0.0005 + normalizedDistance * 0.0095;
      
      // 深度0より上（地上）の場合、さらに薄く
      if (depth < 0) {
        return surfaceFog * 0.5; // 地上はさらに薄い
      }
      return surfaceFog;
    } else if (isSurfaceArea) {
      // 地上エリア（深度10-100）: 非常に薄いフォグ（空の霞のような感じ）
      const surfaceDepth = depth - surfaceTransitionRange; // 10-100の範囲
      const normalizedSurfaceDepth = surfaceDepth / 90; // 0-1の範囲
      return 0.01 + normalizedSurfaceDepth * 0.005; // 0.01 ～ 0.015（非常に薄い）
    } else {
      // 地下エリア: 深いほど濃いフォグ
      return getFogDensity(depth, emotionDistribution);
    }
  }, [depth, emotionDistribution, isSurfaceArea]);

  // ライティング設定を感情の分布に応じて更新（地上エリアは明るく、地下エリアは暗く）
  // 地表（深度0）付近での急激な変化を追加
  const lightingSettings = useMemo(() => {
    const baseSettings = getLightingSettings(emotionDistribution);
    
    // 地表付近（深度-10 ～ 10）での急激な変化
    const surfaceTransitionRange = 10;
    const distanceFromSurface = Math.abs(depth);
    
    if (distanceFromSurface <= surfaceTransitionRange) {
      // 地表付近: 深度0に近いほど明るく、離れるほど暗くなる（急激な変化）
      const normalizedDistance = distanceFromSurface / surfaceTransitionRange;
      
      // 深度0で最も明るく、深度10で通常の明るさ
      const surfaceAmbientBoost = (1 - normalizedDistance) * 0.3; // 0.3 ～ 0
      const surfaceDirectionalBoost = (1 - normalizedDistance) * 0.4; // 0.4 ～ 0
      
      // 深度0より上（地上）の場合、さらに明るく
      if (depth < 0) {
        return {
          ...baseSettings,
          ambientIntensity: Math.min(1.0, baseSettings.ambientIntensity + surfaceAmbientBoost + 0.2),
          directionalIntensity: Math.min(1.0, baseSettings.directionalIntensity + surfaceDirectionalBoost + 0.3),
          lightColor: "#ffffff", // 白い光（太陽光）
        };
      } else {
        // 深度0より下（地下）の場合、徐々に暗くなる
        return {
          ...baseSettings,
          ambientIntensity: baseSettings.ambientIntensity + surfaceAmbientBoost,
          directionalIntensity: baseSettings.directionalIntensity + surfaceDirectionalBoost,
          lightColor: "#ffffff", // 地表付近は白い光
        };
      }
    } else if (isSurfaceArea) {
      // 地上エリア（深度10-100）: 明るいライティング（太陽光のような感じ）
      return {
        ...baseSettings,
        ambientIntensity: Math.max(0.5, baseSettings.ambientIntensity + 0.2), // より明るく
        directionalIntensity: Math.max(0.7, baseSettings.directionalIntensity + 0.2), // より明るく
        lightColor: "#ffffff", // 白い光（太陽光）
      };
    } else {
      // 地下エリア: 従来のライティング設定
      return baseSettings;
    }
  }, [emotionDistribution, isSurfaceArea, depth]);

  // カメラを深度に応じて移動（深度0が地上、深度が増えると下に降りる）
  useFrame((state, delta) => {
    // 目標位置を更新
    targetCameraYRef.current = -depth;
    
    // スムーズな補間（Lerp）でカメラを移動
    const lerpFactor = 0.1; // 補間係数（小さいほど滑らか、大きいほど速い）
    currentCameraYRef.current += (targetCameraYRef.current - currentCameraYRef.current) * lerpFactor;
    
    // 深度0が地上（y=0）、深度が増えるとy座標がマイナス方向に移動（下に降りる）
    camera.position.y = currentCameraYRef.current;
    
    // カメラを少し下向きにして地面が見えるように（地上感を出す）
    // 地上エリア（depth <= 10）の時だけ下向きにする
    if (depth <= 10) {
      const tiltAngle = -0.15; // 約8.6度下向き
      camera.rotation.x = tiltAngle;
    } else {
      camera.rotation.x = 0; // 地下では正面を見る
    }
    
    camera.updateProjectionMatrix();
    
    timeRef.current += delta;

    // フォグの設定
    if (!fogRef.current) {
      const fogColor = new Color(backgroundColor);
      fogRef.current = new FogExp2(fogColor, fogDensity);
      scene.fog = fogRef.current;
    } else {
      fogRef.current.color.set(backgroundColor);
      fogRef.current.density = fogDensity;
    }

    // 指向性ライトの設定（stressが多い場合の点滅効果）
    if (directionalLightRef.current) {
      const { directionalIntensity, lightColor, stressBlink } = lightingSettings;
      
      let intensity = directionalIntensity;
      if (stressBlink) {
        // 点滅効果（0.5秒周期）
        const blinkCycle = (timeRef.current % 0.5) / 0.5;
        intensity *= 0.5 + Math.sin(blinkCycle * Math.PI * 2) * 0.3; // 0.2-0.8倍の範囲で点滅
      }
      
      directionalLightRef.current.intensity = intensity;
      directionalLightRef.current.color.set(lightColor);
    }
  });

  return (
    <>
      {/* 背景色 */}
      <color attach="background" args={[backgroundColor]} />
      
      {/* 地面（深度0、y=0に配置） */}
      <Ground depth={depth} />
      
      {/* 地表平面（深度0、y=0に配置、視覚的な分離用） */}
      <SurfacePlane depth={depth} />
      
      {/* テラリウム（地上エリアに配置、過去のチャット内容に基づいて成長） */}
      <Terrarium depth={depth} userId={userId} />
      
      {/* 環境光（感情の分布に応じて変化） */}
      <ambientLight intensity={lightingSettings.ambientIntensity} />
      
      {/* 指向性ライト（上から、感情の分布に応じて変化） */}
      <directionalLight
        ref={directionalLightRef}
        position={[10, 10, 10]}
        intensity={lightingSettings.directionalIntensity}
        color={lightingSettings.lightColor}
        castShadow
      />
      
      {/* 星屑や光の粒（Sparkles） */}
      <Sparkles
        count={200}
        scale={[100, 200, 100]}
        size={2}
        speed={0.4}
        opacity={0.6}
        color="#ffffff"
        position={[0, -depth, 0]}
      />
      
      {/* 追加の星屑レイヤー（より遠く） */}
      <Sparkles
        count={150}
        scale={[150, 300, 150]}
        size={1.5}
        speed={0.3}
        opacity={0.4}
        color="#a0a0ff"
        position={[0, -depth - 500, 0]}
      />
      
      {/* さらに深い層の星屑 */}
      <Sparkles
        count={100}
        scale={[200, 400, 200]}
        size={1}
        speed={0.2}
        opacity={0.3}
        color="#6666ff"
        position={[0, -depth - 1000, 0]}
      />
      
      {/* 感情オブジェクト（言層）を描画 */}
      {emotionObjects
        .filter((emotion) => {
          // シンプルなフィルタリング: 深度100より下のオブジェクトのみ表示
          if (emotion.depth <= 100) {
            return false;
          }
          
          // 現在の深度±800の範囲内のオブジェクトを表示
          const distance = Math.abs(emotion.depth - depth);
          return distance <= 800;
        })
        .map((emotion) => (
          <EmotionObjectRenderer key={emotion.id} emotion={emotion} />
        ))}
      
      {/* 植物システム（地上エリアでは常に表示、地下エリアでは感情オブジェクトがある場合のみ） */}
      {(isSurfaceArea || emotionObjects.length > 0) && (
        <PlantSystem 
          emotionObjects={emotionObjects} 
          currentDepth={depth}
          isSurfaceArea={isSurfaceArea}
        />
      )}
      
      {/* 生物システム（地上エリアでは常に表示、地下エリアでは感情オブジェクトがある場合のみ） */}
      {(isSurfaceArea || emotionObjects.length > 0) && (
        <CreatureSystem 
          emotionObjects={emotionObjects} 
          currentDepth={depth}
          isSurfaceArea={isSurfaceArea}
        />
      )}
      
      {/* 他者の存在を示す「遠くの光」を描画 */}
      {nearbyLights.map((light, index) => {
        // ランダムな位置に配置（-10から10の範囲、より広範囲）
        const x = (Math.random() - 0.5) * 20;
        const z = (Math.random() - 0.5) * 20;
        
        return (
          <OthersLight
            key={`others-light-${light.depth_y}-${index}`}
            depth={light.depth_y}
            category={light.category}
            strength={light.strength}
            position={[x, -light.depth_y, z]}
          />
        );
      })}
    </>
  );
}

