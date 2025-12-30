"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, MeshStandardMaterial } from "three";

interface JoyPlantProps {
  strength: number;
  position: [number, number, number];
  emotionSize: number; // 感情オブジェクトのサイズ（基準）
  createdAt: number; // 生成時刻（ミリ秒）
}

/**
 * joyの植物: キラキラした花 / 明るい色 / 開花アニメーション / 光を放つ
 */
export function JoyPlant({ strength, position, emotionSize, createdAt }: JoyPlantProps) {
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    timeRef.current += delta;
    const elapsedTime = Math.max(0, (Date.now() - createdAt) / 1000); // 経過秒数（負の値を防ぐ）
    
    // 成長アニメーション（1-3秒かけて成長）
    const growthDuration = strength < 0.3 ? 3 : strength < 0.7 ? 2 : 1;
    const growthProgress = Math.min(elapsedTime / growthDuration, 1);
    const growthScale = 0.5 + growthProgress * 0.5; // 0.5倍 → 1.0倍
    
    // サイズを更新
    if (groupRef.current.scale.x !== growthScale) {
      groupRef.current.scale.set(growthScale, growthScale, growthScale);
    }
    
    // 微風のような揺れ（sin波ベース、より大きく）
    const windX = Math.sin(timeRef.current * 0.5 + position[0] * 0.1) * 0.1;
    const windZ = Math.cos(timeRef.current * 0.5 + position[2] * 0.1) * 0.1;
    const windY = Math.sin(timeRef.current * 0.3) * 0.05; // 上下にも揺れる
    groupRef.current.position.x = position[0] + windX;
    groupRef.current.position.y = position[1] + windY;
    groupRef.current.position.z = position[2] + windZ;
    
    // 開花アニメーション（3-5秒ごとに開花）
    // 成長が完了してから開花アニメーションを開始
    if (growthProgress >= 1.0) {
      const bloomPeriod = 4; // 4秒周期
      const bloomCycle = (timeRef.current % bloomPeriod) / bloomPeriod; // 0-1の範囲
      const bloomIntensity = Math.sin(bloomCycle * Math.PI * 2) * 0.2 + 1.0; // 1.0-1.2倍
      const bloomScale = growthScale * bloomIntensity;
      groupRef.current.scale.set(bloomScale, bloomScale, bloomScale);
      
      // 発光の強弱（開花時に強くなる）
      const baseEmissiveIntensity = (0.4 + strength * 0.4) * (0.3 + 0.3 * growthProgress);
      const bloomEmissiveIntensity = baseEmissiveIntensity * (1.0 + Math.sin(bloomCycle * Math.PI * 2) * 0.6);
      // materialRefは中心の球体のマテリアルを参照（花びらは個別のマテリアル）
    } else {
      // 成長中は通常のスケールと発光
      groupRef.current.scale.set(growthScale, growthScale, growthScale);
    }
    
    // 軽く回転
    groupRef.current.rotation.y += delta * 0.3;
  });

  // 基本サイズ: 感情オブジェクトの0.6-1.5倍（より大きく）
  const baseSize = Math.max(0.1, emotionSize * (0.6 + strength * 0.9)); // 最小サイズを保証
  const emissiveIntensity = 0.4 + strength * 0.4; // より明るく

  // サイズが0以下の場合は何も描画しない
  if (baseSize <= 0 || !isFinite(baseSize)) {
    return null;
  }

  return (
    <group ref={groupRef} position={position} scale={[0.5, 0.5, 0.5]}>
      {/* 花の中心（球体） */}
      <mesh>
        <sphereGeometry args={[baseSize * 0.3, 16, 16]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#ffd700" // ゴールド（joyの感情オブジェクトと同じ色）
          emissive="#ffd700"
          emissiveIntensity={emissiveIntensity}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* 花びら（5-6枚のトーラスを配置） */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * baseSize * 0.6,
              Math.sin(angle * 0.5) * baseSize * 0.3,
              Math.sin(angle) * baseSize * 0.6,
            ]}
            rotation={[angle * 0.3, angle, 0]}
          >
            <torusGeometry args={[baseSize * 0.4, baseSize * 0.15, 8, 16]} />
            <meshStandardMaterial
              color="#ffeb3b" // 明るい黄色
              emissive="#ffeb3b"
              emissiveIntensity={emissiveIntensity * 0.8}
              metalness={0.5}
              roughness={0.5}
              transparent
              opacity={0.9}
            />
          </mesh>
        );
      })}
    </group>
  );
}

