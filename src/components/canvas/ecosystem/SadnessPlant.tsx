"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

interface SadnessPlantProps {
  strength: number;
  position: [number, number, number];
  emotionSize: number;
  createdAt: number;
}

/**
 * sadnessの植物: 透明な水草 / ゆっくり揺れる / 透過 / 沈降する
 */
export function SadnessPlant({ strength, position, emotionSize, createdAt }: SadnessPlantProps) {
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
    
    // ゆっくりとした揺れ（水の流れのような動き）
    const depthSeed = position[1] * 0.1;
    const waveX = Math.sin(timeRef.current * 0.2 + depthSeed) * 0.05;
    const waveZ = Math.cos(timeRef.current * 0.2 + depthSeed) * 0.05;
    const waveY = Math.sin(timeRef.current * 0.15 + depthSeed) * 0.02; // 上下の揺れ
    groupRef.current.position.x = position[0] + waveX;
    groupRef.current.position.y = position[1] + waveY;
    groupRef.current.position.z = position[2] + waveZ;
    
    // ゆっくり回転
    groupRef.current.rotation.y += delta * 0.15;
  });

  const baseSize = Math.max(0.1, emotionSize * (0.6 + strength * 0.9));
  const emissiveIntensity = 0.3 + strength * 0.3;
  const opacity = 0.5 + strength * 0.3; // 透過

  if (baseSize <= 0 || !isFinite(baseSize)) {
    return null;
  }

  return (
    <group ref={groupRef} position={position} scale={[0.5, 0.5, 0.5]}>
      {/* 水草の葉（3-5枚） */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const height = baseSize * (0.8 + i * 0.2);
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * baseSize * 0.2,
              height * 0.5,
              Math.sin(angle) * baseSize * 0.2,
            ]}
            rotation={[Math.PI / 4, angle, 0]}
          >
            <cylinderGeometry args={[baseSize * 0.15, baseSize * 0.1, height, 6]} />
            <meshStandardMaterial
              color="#1a1a3e" // 紺色
              emissive="#1a1a3e"
              emissiveIntensity={emissiveIntensity}
              transparent
              opacity={opacity * (0.8 + (i % 2) * 0.2)}
              metalness={0.2}
              roughness={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

