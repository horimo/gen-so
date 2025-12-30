"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, PointLight, MeshStandardMaterial } from "three";

interface OthersLightProps {
  depth: number;
  category: "joy" | "peace" | "stress" | "sadness" | "inspiration" | "nostalgia" | "confusion";
  strength: number;
  position: [number, number, number];
}

/**
 * 他者の存在を示す「遠くの光」コンポーネント
 * かすかな光の点として描画
 */
export function OthersLight({ depth, category, strength, position }: OthersLightProps) {
  const meshRef = useRef<Mesh>(null);
  const lightRef = useRef<PointLight>(null);
  const timeRef = useRef(0);

  // カテゴリに応じた色を取得
  const getColor = (cat: typeof category): string => {
    switch (cat) {
      case "joy":
        return "#ffd700";
      case "stress":
        return strength > 0.5 ? "#ff0066" : "#9900ff";
      case "sadness":
        return "#1a1a3e";
      case "peace":
        return "#00ffaa";
      case "inspiration":
        return "#ffffff";
      case "nostalgia":
        return "#d4a574";
      case "confusion":
        return "#4a5d23";
      default:
        return "#ffffff";
    }
  };

  const color = getColor(category);
  const opacity = 0.2 + strength * 0.3; // かすかな光（0.2-0.5）
  const size = 0.05 + strength * 0.05; // 非常に小さな点（0.05-0.1）

  useFrame((state, delta) => {
    if (!meshRef.current || !lightRef.current) return;

    timeRef.current += delta;

    // ゆっくりと点滅するアニメーション
    const pulse = 0.5 + Math.sin(timeRef.current * 0.5) * 0.3;
    const currentOpacity = opacity * pulse;

    // メッシュの透明度を更新
    if (meshRef.current.material) {
      const material = meshRef.current.material as MeshStandardMaterial;
      material.opacity = currentOpacity;
      material.emissiveIntensity = currentOpacity * 2;
    }

    // ライトの強度を更新
    lightRef.current.intensity = currentOpacity * 0.5;
  });

  return (
    <group position={position}>
      {/* かすかな光の点 */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={opacity * 2}
          transparent
          opacity={opacity}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* 周囲を照らすポイントライト（非常に弱い） */}
      <pointLight
        ref={lightRef}
        color={color}
        intensity={opacity * 0.5}
        distance={2}
        decay={2}
      />
    </group>
  );
}

