"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

interface ConfusionEmotionProps {
  strength: number;
  position: [number, number, number];
}

/**
 * confusion: 歪んだメッシュ / 濁った緑 / 不規則移動
 */
export function ConfusionEmotion({ strength, position }: ConfusionEmotionProps) {
  const meshRef = useRef<Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    timeRef.current += delta;
    
    // 不規則な移動
    const randomX = (Math.random() - 0.5) * 0.2 * strength;
    const randomY = (Math.random() - 0.5) * 0.2 * strength;
    const randomZ = (Math.random() - 0.5) * 0.2 * strength;
    meshRef.current.position.x = position[0] + randomX;
    meshRef.current.position.y = position[1] + randomY;
    meshRef.current.position.z = position[2] + randomZ;
    
    // 不規則な回転
    meshRef.current.rotation.x += (Math.random() - 0.5) * delta * 2;
    meshRef.current.rotation.y += (Math.random() - 0.5) * delta * 2;
    meshRef.current.rotation.z += (Math.random() - 0.5) * delta * 2;
  });

  const size = 0.25 + strength * 0.25;
  const emissiveIntensity = 0.3 + strength * 0.5;

  return (
    <mesh ref={meshRef} position={position}>
      <tetrahedronGeometry args={[size, 0]} />
      <meshStandardMaterial
        color="#4a5d23"
        emissive="#4a5d23"
        emissiveIntensity={emissiveIntensity}
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  );
}

