"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

interface SadnessEmotionProps {
  strength: number;
  position: [number, number, number];
}

/**
 * sadness: 滴型 / 紺色 / 透過・沈降
 */
export function SadnessEmotion({ strength, position }: SadnessEmotionProps) {
  const meshRef = useRef<Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    timeRef.current += delta;
    
    // 沈降アニメーション（ゆっくり下に落ちる）
    const sinkSpeed = 0.1 * strength;
    meshRef.current.position.y = position[1] - timeRef.current * sinkSpeed;
    
    // 軽く揺れる
    meshRef.current.rotation.z = Math.sin(timeRef.current * 0.5) * 0.1;
  });

  const size = 0.2 + strength * 0.2;
  const emissiveIntensity = 0.3 + strength * 0.4;

  return (
    <mesh ref={meshRef} position={position}>
      <coneGeometry args={[size, size * 1.5, 8]} />
      <meshStandardMaterial
        color="#1a1a3e"
        emissive="#1a1a3e"
        emissiveIntensity={emissiveIntensity}
        transparent
        opacity={0.7 + strength * 0.3}
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  );
}

