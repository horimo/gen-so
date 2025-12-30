"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, MeshStandardMaterial, Color } from "three";

interface InspirationEmotionProps {
  strength: number;
  position: [number, number, number];
}

/**
 * inspiration: 幾何学模様 / 虹色 / 回転
 */
export function InspirationEmotion({ strength, position }: InspirationEmotionProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    
    timeRef.current += delta;
    
    // 高速回転
    meshRef.current.rotation.x += delta * 2;
    meshRef.current.rotation.y += delta * 3;
    meshRef.current.rotation.z += delta * 1.5;
    
    // 虹色の変化（HSL色空間を使用）
    const hue = (timeRef.current * 0.5) % 1;
    const color = new Color().setHSL(hue, 1, 0.5);
    materialRef.current.color = color;
    materialRef.current.emissive = color;
  });

  const size = 0.3 + strength * 0.3;
  const emissiveIntensity = 0.5 + strength * 0.5;

  return (
    <mesh ref={meshRef} position={position}>
      <dodecahedronGeometry args={[size, 0]} />
      <meshStandardMaterial
        ref={materialRef}
        emissiveIntensity={emissiveIntensity}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}

