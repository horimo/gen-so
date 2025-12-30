"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

interface ConfusionPlantProps {
  strength: number;
  position: [number, number, number];
  emotionSize: number;
  createdAt: number;
}

/**
 * confusionの植物: 歪んだ植物 / 不規則な形状 / 不規則な動き / 濁った緑
 */
export function ConfusionPlant({ strength, position, emotionSize, createdAt }: ConfusionPlantProps) {
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
    
    // 不規則な動き（ランダムな方向に動く）
    const randomX = Math.sin(timeRef.current * 2 + position[0]) * 0.1 * strength;
    const randomY = Math.sin(timeRef.current * 2.3 + position[1]) * 0.1 * strength;
    const randomZ = Math.cos(timeRef.current * 2.1 + position[2]) * 0.1 * strength;
    groupRef.current.position.x = position[0] + randomX;
    groupRef.current.position.y = position[1] + randomY;
    groupRef.current.position.z = position[2] + randomZ;
    
    // 不規則な回転
    groupRef.current.rotation.x += (Math.sin(timeRef.current * 3) * 0.5) * delta * 2;
    groupRef.current.rotation.y += (Math.cos(timeRef.current * 2.5) * 0.5) * delta * 2;
    groupRef.current.rotation.z += (Math.sin(timeRef.current * 2.7) * 0.5) * delta * 2;
  });

  const baseSize = Math.max(0.1, emotionSize * (0.6 + strength * 0.9));
  const emissiveIntensity = 0.3 + strength * 0.4;

  if (baseSize <= 0 || !isFinite(baseSize)) {
    return null;
  }

  return (
    <group ref={groupRef} position={position} scale={[0.5, 0.5, 0.5]}>
      {/* 歪んだ植物（不規則な形状） */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        const offset = (i % 2) * 0.3; // 交互にオフセット
        const height = baseSize * (0.3 + i * 0.2);
        
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * baseSize * 0.3 + offset,
              height,
              Math.sin(angle) * baseSize * 0.3 + offset,
            ]}
            rotation={[angle * 0.5 + offset, angle + offset, offset]}
            scale={[1 + offset * 0.5, 1 + offset * 0.3, 1 + offset * 0.5]}
          >
            <tetrahedronGeometry args={[baseSize * 0.3, 0]} />
            <meshStandardMaterial
              color="#4a5d23" // 濁った緑
              emissive="#4a5d23"
              emissiveIntensity={emissiveIntensity * (0.8 + (i % 2) * 0.2)}
              metalness={0.3}
              roughness={0.7}
            />
          </mesh>
        );
      })}
    </group>
  );
}

