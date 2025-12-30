"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

interface NostalgiaPlantProps {
  strength: number;
  position: [number, number, number];
  emotionSize: number;
  createdAt: number;
}

/**
 * nostalgiaの植物: 古い木の根 / セピア色 / ゆっくり成長 / 浮遊
 */
export function NostalgiaPlant({ strength, position, emotionSize, createdAt }: NostalgiaPlantProps) {
  const groupRef = useRef<Group>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    timeRef.current += delta;
    const elapsedTime = Math.max(0, (Date.now() - createdAt) / 1000);
    
    // 成長アニメーション（1-3秒かけて成長、ゆっくり）
    const growthDuration = strength < 0.3 ? 4 : strength < 0.7 ? 3 : 2; // よりゆっくり
    const growthProgress = Math.min(elapsedTime / growthDuration, 1);
    const growthScale = 0.5 + growthProgress * 0.5;
    
    // サイズを更新
    if (groupRef.current.scale.x !== growthScale) {
      groupRef.current.scale.set(growthScale, growthScale, growthScale);
    }
    
    // 浮遊アニメーション（ゆっくり上下に浮遊）
    const depthSeed = position[1] * 0.1;
    const floatY = Math.sin(timeRef.current * 0.2 + depthSeed) * 0.08;
    const floatX = Math.cos(timeRef.current * 0.15 + depthSeed) * 0.03;
    const floatZ = Math.sin(timeRef.current * 0.15 + depthSeed) * 0.03;
    groupRef.current.position.x = position[0] + floatX;
    groupRef.current.position.y = position[1] + floatY;
    groupRef.current.position.z = position[2] + floatZ;
    
    // ゆっくり回転
    groupRef.current.rotation.y += delta * 0.1;
  });

  const baseSize = Math.max(0.1, emotionSize * (0.6 + strength * 0.9));
  const emissiveIntensity = 0.3 + strength * 0.3;

  if (baseSize <= 0 || !isFinite(baseSize)) {
    return null;
  }

  return (
    <group ref={groupRef} position={position} scale={[0.5, 0.5, 0.5]}>
      {/* 古い木の根（不規則な形状） */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const length = baseSize * (0.6 + (i % 2) * 0.3);
        const height = baseSize * (0.2 - i * 0.1);
        
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * baseSize * 0.4,
              height,
              Math.sin(angle) * baseSize * 0.4,
            ]}
            rotation={[angle * 0.3, angle, Math.PI / 6]}
          >
            <icosahedronGeometry args={[baseSize * 0.25, 1]} />
            <meshStandardMaterial
              color="#8b6914" // セピア色
              emissive="#8b6914"
              emissiveIntensity={emissiveIntensity * (0.7 + (i % 2) * 0.3)}
              metalness={0.4}
              roughness={0.6}
            />
          </mesh>
        );
      })}
      
      {/* 中心の根の塊 */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[baseSize * 0.3, 8, 8]} />
        <meshStandardMaterial
          color="#6b4e1a" // より深いセピア色
          emissive="#6b4e1a"
          emissiveIntensity={emissiveIntensity}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
    </group>
  );
}

