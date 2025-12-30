"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

interface StressPlantProps {
  strength: number;
  position: [number, number, number];
  emotionSize: number;
  createdAt: number;
}

/**
 * stressの植物: トゲのある植物 / 鋭い形状 / 震える動き / 赤・紫の色
 */
export function StressPlant({ strength, position, emotionSize, createdAt }: StressPlantProps) {
  const groupRef = useRef<Group>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    timeRef.current += delta;
    const elapsedTime = Math.max(0, (Date.now() - createdAt) / 1000);
    
    // 成長アニメーション（1-3秒かけて成長）
    const growthDuration = strength < 0.3 ? 3 : strength < 0.7 ? 2 : 1;
    const growthProgress = Math.min(elapsedTime / growthDuration, 1);
    const growthScale = 0.5 + growthProgress * 0.5;
    
    // サイズを更新
    if (groupRef.current.scale.x !== growthScale) {
      groupRef.current.scale.set(growthScale, growthScale, growthScale);
    }
    
    // 震える動き（不規則な揺れ）
    const shakeX = Math.sin(timeRef.current * 5 + position[0]) * 0.08 * strength;
    const shakeY = Math.sin(timeRef.current * 6 + position[1]) * 0.08 * strength;
    const shakeZ = Math.cos(timeRef.current * 5.5 + position[2]) * 0.08 * strength;
    groupRef.current.position.x = position[0] + shakeX;
    groupRef.current.position.y = position[1] + shakeY;
    groupRef.current.position.z = position[2] + shakeZ;
    
    // 高速回転
    groupRef.current.rotation.x += delta * 2;
    groupRef.current.rotation.y += delta * 3;
  });

  const baseSize = Math.max(0.1, emotionSize * (0.6 + strength * 0.9));
  const emissiveIntensity = 0.4 + strength * 0.5;
  const color = strength > 0.5 ? "#ff0066" : "#9900ff"; // 赤と紫

  if (baseSize <= 0 || !isFinite(baseSize)) {
    return null;
  }

  return (
    <group ref={groupRef} position={position} scale={[0.5, 0.5, 0.5]}>
      {/* 中心のトゲのある球体 */}
      <mesh>
        <octahedronGeometry args={[baseSize * 0.4, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      
      {/* 周囲のトゲ（4-6本） */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        const height = baseSize * 0.6;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * baseSize * 0.3,
              height * (0.5 + (i % 2) * 0.3),
              Math.sin(angle) * baseSize * 0.3,
            ]}
            rotation={[angle * 0.5, angle, 0]}
          >
            <coneGeometry args={[baseSize * 0.1, baseSize * 0.4, 4]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={emissiveIntensity * 0.9}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

