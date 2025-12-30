"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { EmotionObject } from "@/store/useEmotionStore";

interface EnergyParticleProps {
  strength: number;
  position: [number, number, number];
  emotionObjects: EmotionObject[]; // 感情オブジェクトへの反応用
}

/**
 * エネルギーの粒: stress/inspirationの周り / 強い感情の周り
 */
export function EnergyParticle({ strength, position, emotionObjects }: EnergyParticleProps) {
  const meshRef = useRef<Mesh>(null);
  const timeRef = useRef(0);
  const velocityRef = useRef<[number, number, number]>([
    (Math.random() - 0.5) * 0.03,
    (Math.random() - 0.5) * 0.03,
    (Math.random() - 0.5) * 0.03,
  ]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    timeRef.current += delta;
    
    // 高速回転
    meshRef.current.rotation.x += delta * 5;
    meshRef.current.rotation.y += delta * 3;
    
    // 脈動
    const pulse = Math.sin(timeRef.current * 4) * 0.2 + 1.0;
    meshRef.current.scale.set(pulse, pulse, pulse);
    
    // ランダムウォーク + 感情オブジェクトへの引力
    const [vx, vy, vz] = velocityRef.current;
    
    // 最も近いstress/inspirationの感情オブジェクトを探す
    let nearestEmotion: EmotionObject | null = null;
    let minDistance = Infinity;
    
    for (const emotion of emotionObjects) {
      if (emotion.category === "stress" || emotion.category === "inspiration") {
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
    
    // 感情オブジェクトへの引力（強い）
    if (nearestEmotion) {
      const dx = nearestEmotion.x - meshRef.current.position.x;
      const dy = -nearestEmotion.depth - meshRef.current.position.y;
      const dz = nearestEmotion.z - meshRef.current.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distance > 0.3) {
        const attraction = 0.002 * strength;
        velocityRef.current[0] += (dx / distance) * attraction;
        velocityRef.current[1] += (dy / distance) * attraction;
        velocityRef.current[2] += (dz / distance) * attraction;
      }
    }
    
    // 速度の減衰とランダム性
    velocityRef.current[0] *= 0.97;
    velocityRef.current[1] *= 0.97;
    velocityRef.current[2] *= 0.97;
    velocityRef.current[0] += (Math.random() - 0.5) * 0.002;
    velocityRef.current[1] += (Math.random() - 0.5) * 0.002;
    velocityRef.current[2] += (Math.random() - 0.5) * 0.002;
    
    // 位置を更新
    meshRef.current.position.x += velocityRef.current[0];
    meshRef.current.position.y += velocityRef.current[1];
    meshRef.current.position.z += velocityRef.current[2];
  });

  const size = 0.06 + strength * 0.06;
  const emissiveIntensity = 0.5 + strength * 0.5;
  const color = strength > 0.5 ? "#ff0066" : "#9900ff"; // 赤と紫

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[size, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>
  );
}

