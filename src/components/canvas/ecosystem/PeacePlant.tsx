"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, MeshStandardMaterial } from "three";

interface PeacePlantProps {
  strength: number;
  position: [number, number, number];
  emotionSize: number; // 感情オブジェクトのサイズ（基準）
  createdAt: number; // 生成時刻（ミリ秒）
}

/**
 * peaceの植物: 苔・シダ / ゆっくり成長 / 柔らかな動き / 青緑色
 */
export function PeacePlant({ strength, position, emotionSize, createdAt }: PeacePlantProps) {
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
    
    // 微風のようなゆっくりとした揺れ（sin波ベース、同期）
    // 同じ深度の植物は同じリズムで揺れる（depthをシード値として使用）
    const depthSeed = position[1] * 0.1;
    const windX = Math.sin(timeRef.current * 0.3 + depthSeed) * 0.08; // より大きく揺れる
    const windZ = Math.cos(timeRef.current * 0.3 + depthSeed) * 0.08;
    const windY = Math.sin(timeRef.current * 0.2 + depthSeed) * 0.03; // 上下にも揺れる
    groupRef.current.position.x = position[0] + windX;
    groupRef.current.position.y = position[1] + windY;
    groupRef.current.position.z = position[2] + windZ;
    
    // 発光の強弱（成長に応じて）
    // materialRefは中心の球体のマテリアルを参照（葉っぱは個別のマテリアル）
    if (materialRef.current) {
      const baseEmissiveIntensity = (0.4 + strength * 0.4) * (0.3 + 0.3 * growthProgress);
      materialRef.current.emissiveIntensity = baseEmissiveIntensity;
    }
    
    // ゆっくり回転
    groupRef.current.rotation.y += delta * 0.2;
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
      {/* 苔・シダの形状: 複数の葉っぱを組み合わせた形状 */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const height = (i % 2) * baseSize * 0.2; // 交互に高さを変える
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * baseSize * 0.4,
              height,
              Math.sin(angle) * baseSize * 0.4,
            ]}
            rotation={[Math.PI / 6, angle, 0]}
          >
            <coneGeometry args={[baseSize * 0.3, baseSize * 0.6, 6]} />
            <meshStandardMaterial
              color="#26a69a" // より深い青緑色（peaceの#00ffaaと差別化）
              emissive="#26a69a"
              emissiveIntensity={emissiveIntensity * (0.8 + (i % 2) * 0.2)} // 交互に明るさを変える
              metalness={0.2}
              roughness={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>
        );
      })}
      
      {/* 中心の小さな苔の塊 */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[baseSize * 0.2, 8, 8]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#4dd0e1" // 明るい青緑色
          emissive="#4dd0e1"
          emissiveIntensity={emissiveIntensity}
          metalness={0.3}
          roughness={0.7}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

