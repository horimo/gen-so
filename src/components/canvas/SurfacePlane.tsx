"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Mesh, ShaderMaterial, Vector3 } from "three";
import * as THREE from "three";

interface SurfacePlaneProps {
  depth: number;
}

/**
 * 地表平面コンポーネント
 * 深度0（y=0）に配置され、地上と地下を視覚的に分離する
 */
export function SurfacePlane({ depth }: SurfacePlaneProps) {
  const meshRef = useRef<Mesh>(null);
  const timeRef = useRef(0);
  const { camera } = useThree();

  // カメラが地表に近いかどうか（深度0-50の範囲）
  const isNearSurface = useMemo(() => {
    return depth >= 0 && depth <= 50;
  }, [depth]);

  // カメラが地表より上かどうか（深度 < 0、地上エリア）
  const isAboveSurface = useMemo(() => {
    return depth < 0;
  }, [depth]);

  // カスタムシェーダーマテリアル
  const shaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        depth: { value: 0 },
        isNearSurface: { value: 0 },
        isAboveSurface: { value: 0 },
        uCameraPosition: { value: new Vector3(0, 0, 0) },
      },
      vertexShader: `
        precision highp float;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        
        void main() {
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform float time;
        uniform float depth;
        uniform float isNearSurface;
        uniform float isAboveSurface;
        uniform vec3 uCameraPosition;
        
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        
        void main() {
          // 基本色（ガラスのような青白い色）
          vec3 baseColor = vec3(0.7, 0.85, 1.0);
          
          // 深度に応じた透明度（地表に近いほど不透明、遠いほど透明）
          float opacity = 0.3;
          
          // 地表に近い場合、より不透明に（視認性を高める）
          float nearSurfaceFactor = step(0.5, isNearSurface);
          float depthFactor = depth / 50.0;
          opacity = mix(opacity, 0.5 + (1.0 - depthFactor) * 0.3, nearSurfaceFactor);
          
          // 地上から見る場合、より透明に（空の色が透ける）
          float aboveSurfaceFactor = step(0.5, isAboveSurface);
          opacity = mix(opacity, 0.1, aboveSurfaceFactor);
          
          // フレネル効果（端がより明るく見える）
          vec3 viewDirection = normalize(uCameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - dot(viewDirection, vNormal), 2.0);
          
          // 時間に応じた微細な揺らぎ（水面のような効果）
          float wave = sin(time * 0.5 + vWorldPosition.x * 0.1 + vWorldPosition.z * 0.1) * 0.02;
          
          // 最終的な色
          vec3 fresnelColor = vec3(fresnel * 0.3);
          vec3 waveColor = vec3(wave);
          vec3 finalColor = baseColor + fresnelColor + waveColor;
          finalColor = mix(finalColor, vec3(1.0), fresnel * 0.5);
          
          gl_FragColor = vec4(finalColor, opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // アニメーション更新
  useFrame((state, delta) => {
    timeRef.current += delta;
    
    if (meshRef.current && meshRef.current.material instanceof ShaderMaterial) {
      const material = meshRef.current.material;
      material.uniforms.time.value = timeRef.current;
      material.uniforms.depth.value = depth;
      material.uniforms.isNearSurface.value = isNearSurface ? 1.0 : 0.0;
      material.uniforms.isAboveSurface.value = isAboveSurface ? 1.0 : 0.0;
      material.uniforms.uCameraPosition.value.copy(camera.position);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]} // 水平な平面にする
      material={shaderMaterial}
    >
      {/* 大きな平面（十分に広い範囲をカバー） */}
      <planeGeometry args={[200, 200, 32, 32]} />
    </mesh>
  );
}

