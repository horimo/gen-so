"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

interface PeaceEmotionProps {
  strength: number;
  position: [number, number, number];
}

/**
 * peace: 有機的曲線 / 青緑 / 膨張収縮
 */
export function PeaceEmotion({ strength, position }: PeaceEmotionProps) {
  const meshRef = useRef<Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    timeRef.current += delta;
    
    // 膨張収縮アニメーション
    const scale = 1 + Math.sin(timeRef.current * 1.5) * 0.3 * strength;
    meshRef.current.scale.set(scale, scale, scale);
    
    // ゆっくり回転
    meshRef.current.rotation.y += delta * 0.5;
  });

  const size = 0.3 + strength * 0.3;
  const emissiveIntensity = 0.4 + strength * 0.5;

  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[size, size * 0.3, 16, 32]} />
      <meshStandardMaterial
        color="#00ffaa"
        emissive="#00ffaa"
        emissiveIntensity={emissiveIntensity}
        metalness={0.5}
        roughness={0.5}
      />
    </mesh>
  );
}

