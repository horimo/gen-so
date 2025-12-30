"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { EmotionObject } from "@/store/useEmotionStore";

interface MemoryFragmentProps {
  strength: number;
  position: [number, number, number];
  emotionObjects: EmotionObject[]; // 感情オブジェクトへの反応用
}

/**
 * 記憶の欠片: nostalgiaの周り / 古い感情の周り
 */
export function MemoryFragment({ strength, position, emotionObjects }: MemoryFragmentProps) {
  const meshRef = useRef<Mesh>(null);
  const timeRef = useRef(0);
  const velocityRef = useRef<[number, number, number]>([
    (Math.random() - 0.5) * 0.015,
    (Math.random() - 0.5) * 0.015,
    (Math.random() - 0.5) * 0.015,
  ]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    timeRef.current += delta;
    
    // ゆっくり回転
    meshRef.current.rotation.y += delta * 0.5;
    
    // 浮遊
    const float = Math.sin(timeRef.current * 0.3) * 0.05;
    meshRef.current.position.y = position[1] + float;
    
    // ランダムウォーク + 感情オブジェクトへの引力
    const [vx, vy, vz] = velocityRef.current;
    
    // 最も近いnostalgiaの感情オブジェクトを探す
    let nearestEmotion: EmotionObject | null = null;
    let minDistance = Infinity;
    
    for (const emotion of emotionObjects) {
      if (emotion.category === "nostalgia") {
        const dx = emotion.x - meshRef.current!.position.x;
        const dy = -emotion.depth - meshRef.current!.position.y;
        const dz = emotion.z - meshRef.current!.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (distance < minDistance && distance < 10) {
          minDistance = distance;
          nearestEmotion = emotion;
        }
      }
    }
    
    // 感情オブジェクトへの引力（弱い）
    if (nearestEmotion) {
      const dx = nearestEmotion.x - meshRef.current.position.x;
      const dy = -nearestEmotion.depth - meshRef.current.position.y;
      const dz = nearestEmotion.z - meshRef.current.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distance > 0.5) {
        const attraction = 0.0008 * strength;
        velocityRef.current[0] += (dx / distance) * attraction;
        velocityRef.current[1] += (dy / distance) * attraction;
        velocityRef.current[2] += (dz / distance) * attraction;
      }
    }
    
    // 速度の減衰とランダム性（ゆっくり）
    velocityRef.current[0] *= 0.99;
    velocityRef.current[1] *= 0.99;
    velocityRef.current[2] *= 0.99;
    velocityRef.current[0] += (Math.random() - 0.5) * 0.0008;
    velocityRef.current[1] += (Math.random() - 0.5) * 0.0008;
    velocityRef.current[2] += (Math.random() - 0.5) * 0.0008;
    
    // 位置を更新
    meshRef.current.position.x += velocityRef.current[0];
    meshRef.current.position.z += velocityRef.current[2];
  });

  const size = 0.05 + strength * 0.05;
  const emissiveIntensity = 0.3 + strength * 0.3;

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[size, 1]} />
      <meshStandardMaterial
        color="#8b6914" // セピア色
        emissive="#8b6914"
        emissiveIntensity={emissiveIntensity}
        metalness={0.4}
        roughness={0.6}
      />
    </mesh>
  );
}

