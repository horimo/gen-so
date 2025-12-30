"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { Color } from "three";

interface InspirationPlantProps {
  strength: number;
  position: [number, number, number];
  emotionSize: number;
  createdAt: number;
}

/**
 * inspirationの植物: 発光する菌類 / 虹色に変化 / 脈動 / 回転する
 */
export function InspirationPlant({ strength, position, emotionSize, createdAt }: InspirationPlantProps) {
  const groupRef = useRef<Group>(null);
  const timeRef = useRef(0);
  const colorRefs = useRef<Array<{ color: Color; material: any }>>([]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    timeRef.current += delta;
    const elapsedTime = Math.max(0, (Date.now() - createdAt) / 1000);
    
    // 成長アニメーション（1-3秒かけて成長）
    const growthDuration = strength < 0.3 ? 3 : strength < 0.7 ? 2 : 1;
    const growthProgress = Math.min(elapsedTime / growthDuration, 1);
    const growthScale = 0.5 + growthProgress * 0.5;
    
    // サイズを更新
    if (groupRef.current.scale.x !== growthScale) {
      groupRef.current.scale.set(growthScale, growthScale, growthScale);
    }
    
    // 脈動アニメーション（成長完了後）
    let pulseScale = growthScale;
    if (growthProgress >= 1.0) {
      const pulseIntensity = Math.sin(timeRef.current * 2) * 0.15 + 1.0; // 0.85-1.15倍
      pulseScale = growthScale * pulseIntensity;
      groupRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
    
    // 高速回転
    groupRef.current.rotation.x += delta * 2;
    groupRef.current.rotation.y += delta * 3;
    groupRef.current.rotation.z += delta * 1.5;
    
    // 虹色の変化（HSL色空間を使用）
    colorRefs.current.forEach((colorRef, layer) => {
      if (colorRef.material) {
        const hue = (timeRef.current * 0.3 + layer * 0.2) % 1;
        colorRef.color.setHSL(hue, 1, 0.5);
        colorRef.material.color = colorRef.color;
        colorRef.material.emissive = colorRef.color;
      }
    });
  });

  const baseSize = Math.max(0.1, emotionSize * (0.6 + strength * 0.9));
  const baseEmissiveIntensity = 0.5 + strength * 0.5;

  if (baseSize <= 0 || !isFinite(baseSize)) {
    return null;
  }

  return (
    <group ref={groupRef} position={position} scale={[0.5, 0.5, 0.5]}>
      {/* 菌類の傘（複数の層） */}
      {[0, 1, 2].map((layer) => {
        const layerSize = baseSize * (0.6 - layer * 0.15);
        const layerHeight = baseSize * (0.3 + layer * 0.2);
        const initialHue = layer * 0.2;
        
        return (
          <mesh
            key={layer}
            position={[0, layerHeight, 0]}
          >
            <dodecahedronGeometry args={[layerSize, 0]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={baseEmissiveIntensity * (1.0 - layer * 0.2)}
              metalness={0.9}
              roughness={0.1}
              ref={(ref) => {
                if (ref) {
                  if (!colorRefs.current[layer]) {
                    colorRefs.current[layer] = { color: new Color(), material: ref };
                  } else {
                    colorRefs.current[layer].material = ref;
                  }
                }
              }}
            />
          </mesh>
        );
      })}
      
      {/* 菌類の茎 */}
      <mesh position={[0, -baseSize * 0.2, 0]}>
        <cylinderGeometry args={[baseSize * 0.15, baseSize * 0.1, baseSize * 0.4, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={baseEmissiveIntensity * 0.6}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

