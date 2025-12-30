"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

interface JoyEmotionProps {
  strength: number;
  position: [number, number, number];
}

/**
 * joy: 球体 / ゴールド / 跳ねる
 */
export function JoyEmotion({ strength, position }: JoyEmotionProps) {
  const meshRef = useRef<Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    timeRef.current += delta;
    
    // 跳ねるアニメーション（y軸方向に上下に跳ねる）
    const bounceHeight = Math.sin(timeRef.current * 2) * 0.3 * strength;
    meshRef.current.position.y = position[1] + bounceHeight;
    
    // 軽く回転
    meshRef.current.rotation.x += delta * 0.5;
    meshRef.current.rotation.y += delta * 0.3;
  });

  const size = 0.3 + strength * 0.3;
  const emissiveIntensity = 0.5 + strength * 0.5;

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color="#ffd700"
        emissive="#ffd700"
        emissiveIntensity={emissiveIntensity}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

