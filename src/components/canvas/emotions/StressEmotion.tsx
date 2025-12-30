"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

interface StressEmotionProps {
  strength: number;
  position: [number, number, number];
}

/**
 * stress: 鋭い多面体 / 赤・紫 / 震える
 */
export function StressEmotion({ strength, position }: StressEmotionProps) {
  const meshRef = useRef<Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    timeRef.current += delta;
    
    // 震えるアニメーション（不規則な揺れ）
    const shakeX = (Math.random() - 0.5) * 0.1 * strength;
    const shakeY = (Math.random() - 0.5) * 0.1 * strength;
    const shakeZ = (Math.random() - 0.5) * 0.1 * strength;
    meshRef.current.position.x = position[0] + shakeX;
    meshRef.current.position.y = position[1] + shakeY;
    meshRef.current.position.z = position[2] + shakeZ;
    
    // 高速回転
    meshRef.current.rotation.x += delta * 3;
    meshRef.current.rotation.y += delta * 2;
  });

  const size = 0.25 + strength * 0.25;
  const emissiveIntensity = 0.4 + strength * 0.6;
  // 赤と紫のグラデーション
  const color = strength > 0.5 ? "#ff0066" : "#9900ff";

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[size, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        metalness={0.6}
        roughness={0.4}
      />
    </mesh>
  );
}

