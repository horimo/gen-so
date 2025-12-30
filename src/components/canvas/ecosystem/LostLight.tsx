"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import type { EmotionObject } from "@/store/useEmotionStore";

interface LostLightProps {
  strength: number;
  position: [number, number, number];
  emotionObjects: EmotionObject[]; // 感情オブジェクトへの反応用
}

/**
 * 迷子の光: confusionの周り / 混乱した感情の周り
 */
export function LostLight({ strength, position, emotionObjects }: LostLightProps) {
  const meshRef = useRef<Mesh>(null);
  const timeRef = useRef(0);
  const velocityRef = useRef<[number, number, number]>([
    (Math.random() - 0.5) * 0.025,
    (Math.random() - 0.5) * 0.025,
    (Math.random() - 0.5) * 0.025,
  ]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    timeRef.current += delta;
    
    // 不規則な回転
    meshRef.current.rotation.x += (Math.random() - 0.5) * delta * 3;
    meshRef.current.rotation.y += (Math.random() - 0.5) * delta * 3;
    meshRef.current.rotation.z += (Math.random() - 0.5) * delta * 3;
    
    // 不規則な動き（ランダムウォーク）
    const [vx, vy, vz] = velocityRef.current;
    
    // 最も近いconfusionの感情オブジェクトを探す
    let nearestEmotion: EmotionObject | null = null;
    let minDistance = Infinity;
    
    for (const emotion of emotionObjects) {
      if (emotion.category === "confusion") {
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
    
    // 感情オブジェクトへの反発（混乱しているので近づかない）
    if (nearestEmotion) {
      const dx = nearestEmotion.x - meshRef.current.position.x;
      const dy = -nearestEmotion.depth - meshRef.current.position.y;
      const dz = nearestEmotion.z - meshRef.current.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distance < 3) {
        const repulsion = 0.001 * strength;
        velocityRef.current[0] -= (dx / distance) * repulsion;
        velocityRef.current[1] -= (dy / distance) * repulsion;
        velocityRef.current[2] -= (dz / distance) * repulsion;
      }
    }
    
    // 速度の減衰とランダム性（不規則）
    velocityRef.current[0] *= 0.96;
    velocityRef.current[1] *= 0.96;
    velocityRef.current[2] *= 0.96;
    velocityRef.current[0] += (Math.random() - 0.5) * 0.003;
    velocityRef.current[1] += (Math.random() - 0.5) * 0.003;
    velocityRef.current[2] += (Math.random() - 0.5) * 0.003;
    
    // 位置を更新
    meshRef.current.position.x += velocityRef.current[0];
    meshRef.current.position.y += velocityRef.current[1];
    meshRef.current.position.z += velocityRef.current[2];
  });

  const size = 0.05 + strength * 0.05;
  const emissiveIntensity = 0.3 + strength * 0.4;

  return (
    <mesh ref={meshRef} position={position}>
      <tetrahedronGeometry args={[size, 0]} />
      <meshStandardMaterial
        color="#4a5d23" // 濁った緑
        emissive="#4a5d23"
        emissiveIntensity={emissiveIntensity}
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  );
}

