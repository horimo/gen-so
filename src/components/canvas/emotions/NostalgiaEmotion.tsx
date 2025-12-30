"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

interface NostalgiaEmotionProps {
  strength: number;
  position: [number, number, number];
}

/**
 * nostalgia: 雲状 / セピア / 浮遊
 */
export function NostalgiaEmotion({ strength, position }: NostalgiaEmotionProps) {
  const meshRef = useRef<Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    timeRef.current += delta;
    
    // 浮遊アニメーション（上下にゆっくり浮遊）
    const floatHeight = Math.sin(timeRef.current * 0.8) * 0.4 * strength;
    meshRef.current.position.y = position[1] + floatHeight;
    
    // ゆっくり回転
    meshRef.current.rotation.y += delta * 0.3;
  });

  const size = 0.35 + strength * 0.35;
  const emissiveIntensity = 0.3 + strength * 0.4;

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[size, 1]} />
      <meshStandardMaterial
        color="#d4a574"
        emissive="#d4a574"
        emissiveIntensity={emissiveIntensity}
        transparent
        opacity={0.8}
        metalness={0.2}
        roughness={0.8}
      />
    </mesh>
  );
}

