"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { EmotionObject } from "@/store/useEmotionStore";

interface WaterBubbleProps {
  strength: number;
  position: [number, number, number];
  emotionObjects: EmotionObject[]; // 感情オブジェクトへの反応用
}

/**
 * 水の泡: sadness/peaceの周り / 静かな感情が多い深度
 */
export function WaterBubble({ strength, position, emotionObjects }: WaterBubbleProps) {
  const meshRef = useRef<Mesh>(null);
  const timeRef = useRef(0);
  const velocityRef = useRef<[number, number, number]>([
    (Math.random() - 0.5) * 0.01,
    Math.random() * 0.02 + 0.01, // 上に浮かぶ
    (Math.random() - 0.5) * 0.01,
  ]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    timeRef.current += delta;
    
    // ゆっくり揺れる
    const sway = Math.sin(timeRef.current * 0.5) * 0.02;
    meshRef.current.rotation.x = sway;
    meshRef.current.rotation.z = sway;
    
    // ランダムウォーク + 感情オブジェクトへの引力
    const [vx, vy, vz] = velocityRef.current;
    
    // 最も近いsadness/peaceの感情オブジェクトを探す
    let nearestEmotion: EmotionObject | null = null;
    let minDistance = Infinity;
    
    for (const emotion of emotionObjects) {
      if (emotion.category === "sadness" || emotion.category === "peace") {
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
        const attraction = 0.0005 * strength;
        velocityRef.current[0] += (dx / distance) * attraction;
        velocityRef.current[1] += (dy / distance) * attraction;
        velocityRef.current[2] += (dz / distance) * attraction;
      }
    }
    
    // 速度の減衰とランダム性（ゆっくり）
    velocityRef.current[0] *= 0.99;
    velocityRef.current[1] *= 0.99;
    velocityRef.current[2] *= 0.99;
    velocityRef.current[0] += (Math.random() - 0.5) * 0.0005;
    velocityRef.current[1] += (Math.random() - 0.5) * 0.0005;
    velocityRef.current[2] += (Math.random() - 0.5) * 0.0005;
    
    // 位置を更新
    meshRef.current.position.x += velocityRef.current[0];
    meshRef.current.position.y += velocityRef.current[1];
    meshRef.current.position.z += velocityRef.current[2];
  });

  const size = 0.04 + strength * 0.04;
  const emissiveIntensity = 0.4 + strength * 0.3;

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial
        color="#4dd0e1" // 青緑色
        emissive="#4dd0e1"
        emissiveIntensity={emissiveIntensity}
        transparent
        opacity={0.7}
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  );
}

