"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { FogExp2, Color } from "three";
import { Sparkles } from "@react-three/drei";
import { useEmotionStore } from "@/store/useEmotionStore";
import { EmotionObjectRenderer } from "./emotions/EmotionObject";
import { OthersLight } from "./OthersLight";

interface SceneProps {
  depth: number;
  othersLights?: Array<{
    depth_y: number;
    category: "joy" | "peace" | "stress" | "sadness" | "inspiration" | "nostalgia" | "confusion";
    strength: number;
  }>;
}

/**
 * 深度に応じて背景色を計算
 * 地上（紺）から深淵（黒）へグラデーション
 */
function getBackgroundColor(depth: number): string {
  // 深度が深いほど黒に近づく
  // depth: 0 = 紺色, depth: 1000+ = 黒
  const normalizedDepth = Math.min(depth / 1000, 1);
  
  // 紺色 (#1a1a2e) から黒 (#000000) へのグラデーション
  const r = Math.floor(26 * (1 - normalizedDepth));
  const g = Math.floor(26 * (1 - normalizedDepth));
  const b = Math.floor(46 * (1 - normalizedDepth));
  
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * 深度に応じてフォグの密度を計算
 */
function getFogDensity(depth: number): number {
  // 深く潜るほどフォグが濃くなる（指数関数的）
  const normalizedDepth = Math.min(depth / 2000, 1);
  return 0.01 + normalizedDepth * 0.05; // 0.01 ~ 0.06
}

/**
 * 3Dシーンのメインコンポーネント
 */
export function Scene({ depth, othersLights = [] }: SceneProps) {
  const { scene, camera } = useThree();
  const fogRef = useRef<FogExp2 | null>(null);
  const emotionObjects = useEmotionStore((state) => state.objects);

  // 現在の深度に近い他者の光をフィルタリング（±200の範囲）
  const nearbyLights = useMemo(() => {
    return othersLights.filter((light) => {
      const distance = Math.abs(light.depth_y - depth);
      return distance <= 200; // 現在の深度から±200以内
    });
  }, [othersLights, depth]);

  // カメラを深度に応じてマイナスy方向に移動
  useFrame(() => {
    camera.position.y = -depth;
    camera.updateProjectionMatrix();
  });

  // 背景色を深度に応じて更新
  const backgroundColor = useMemo(() => getBackgroundColor(depth), [depth]);
  
  // フォグの密度を深度に応じて更新
  const fogDensity = useMemo(() => getFogDensity(depth), [depth]);

  // フォグの設定
  useFrame(() => {
    if (!fogRef.current) {
      const fogColor = new Color(backgroundColor);
      fogRef.current = new FogExp2(fogColor, fogDensity);
      scene.fog = fogRef.current;
    } else {
      fogRef.current.color.set(backgroundColor);
      fogRef.current.density = fogDensity;
    }
  });

  return (
    <>
      {/* 背景色 */}
      <color attach="background" args={[backgroundColor]} />
      
      {/* 環境光 */}
      <ambientLight intensity={0.3} />
      
      {/* 指向性ライト（上から） */}
      <directionalLight
        position={[10, 10, 10]}
        intensity={0.5}
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
      {emotionObjects.map((emotion) => (
        <EmotionObjectRenderer key={emotion.id} emotion={emotion} />
      ))}
      
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

