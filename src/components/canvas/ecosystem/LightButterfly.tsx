"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { EmotionObject } from "@/store/useEmotionStore";

interface LightButterflyProps {
  strength: number;
  position: [number, number, number];
  emotionObjects: EmotionObject[]; // 感情オブジェクトへの反応用
}

/**
 * 光の蝶々: joy/inspirationの周り / 明るい感情が多い深度
 */
export function LightButterfly({ strength, position, emotionObjects }: LightButterflyProps) {
  const meshRef = useRef<Mesh>(null);
  const timeRef = useRef(0);
  const velocityRef = useRef<[number, number, number]>([
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02,
  ]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    timeRef.current += delta;
    
    // 羽ばたきアニメーション
    const wingFlap = Math.sin(timeRef.current * 8) * 0.1;
    meshRef.current.rotation.x = wingFlap;
    
    // ランダムウォーク + 感情オブジェクトへの引力
    const [vx, vy, vz] = velocityRef.current;
    
    // 最も近いjoy/inspirationの感情オブジェクトを探す
    let nearestEmotion: EmotionObject | null = null;
    let minDistance = Infinity;
    
    for (const emotion of emotionObjects) {
      if (emotion.category === "joy" || emotion.category === "inspiration") {
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
    
    // 感情オブジェクトへの引力
    if (nearestEmotion) {
      const dx = nearestEmotion.x - meshRef.current.position.x;
      const dy = -nearestEmotion.depth - meshRef.current.position.y;
      const dz = nearestEmotion.z - meshRef.current.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distance > 0.5) {
        const attraction = 0.001 * strength;
        velocityRef.current[0] += (dx / distance) * attraction;
        velocityRef.current[1] += (dy / distance) * attraction;
        velocityRef.current[2] += (dz / distance) * attraction;
      }
    }
    
    // 速度の減衰とランダム性
    velocityRef.current[0] *= 0.98;
    velocityRef.current[1] *= 0.98;
    velocityRef.current[2] *= 0.98;
    velocityRef.current[0] += (Math.random() - 0.5) * 0.001;
    velocityRef.current[1] += (Math.random() - 0.5) * 0.001;
    velocityRef.current[2] += (Math.random() - 0.5) * 0.001;
    
    // 位置を更新
    meshRef.current.position.x += velocityRef.current[0];
    meshRef.current.position.y += velocityRef.current[1];
    meshRef.current.position.z += velocityRef.current[2];
    
    // 回転（飛ぶ方向に）
    meshRef.current.rotation.y = Math.atan2(velocityRef.current[0], velocityRef.current[2]);
  });

  const size = 0.05 + strength * 0.05;
  const emissiveIntensity = 0.6 + strength * 0.4;

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial
        color="#ffeb3b" // 明るい黄色
        emissive="#ffeb3b"
        emissiveIntensity={emissiveIntensity}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

