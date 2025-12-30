"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Mesh } from "three";
import * as THREE from "three";

interface GroundProps {
  depth: number;
}

/**
 * 地面コンポーネント
 * チャット欄の上に配置され、自然な起伏を持つ地面
 */
export function Ground({ depth }: GroundProps) {
  const meshRef = useRef<Mesh>(null);
  const timeRef = useRef(0);
  const { camera } = useThree();

  // チャット欄の位置を計算（画面下部）
  // カメラの視野角75度、z=10から、画面下部のy座標を計算
  // チャット欄は画面下部にあるので、カメラより下（マイナス方向）に配置
  const chatBarY = useMemo(() => {
    const fov = 75;
    const cameraZ = 10;
    const vFov = (fov * Math.PI) / 180;
    const viewHeight = 2 * Math.tan(vFov / 2) * cameraZ;
    
    // チャット欄は画面下部約20%の位置（bottom-4 sm:bottom-8を考慮）
    // 画面下部から上に20%の位置 = 画面中心から下に30%の位置
    return -viewHeight * 0.3; // カメラ中心（y=0）から下に30%の位置
  }, []);

  // カメラが地面に近いかどうか（深度0-20の範囲）
  const isNearGround = useMemo(() => {
    return depth >= 0 && depth <= 20;
  }, [depth]);

  // カメラが地面より上かどうか（深度 < 0、地上エリア）
  const isAboveGround = useMemo(() => {
    return depth < 0;
  }, [depth]);

  // カスタムシェーダーマテリアル（ノイズと起伏を追加）
  // 現在は使用していない（testMaterialを使用中）
  // 将来的にシェーダーマテリアルを使用する場合は、以下のコードを有効化
  // シェーダーマテリアルは現在コメントアウト（コンパイルエラーを防ぐため）
  /*
  const shaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        depth: { value: 0 },
        isNearGround: { value: 0 },
        isAboveGround: { value: 0 },
        cameraPosition: { value: new Vector3(0, 0, 0) },
      },
      vertexShader: `
        uniform float time;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        // ノイズ関数
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        // より滑らかなノイズ
        float smoothNoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          
          float a = noise(i);
          float b = noise(i + vec2(1.0, 0.0));
          float c = noise(i + vec2(0.0, 1.0));
          float d = noise(i + vec2(1.0, 1.0));
          
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        
        // フラクタルノイズ（複数のオクターブ）
        float fractalNoise(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          
          for (int i = 0; i < 4; i++) {
            value += amplitude * smoothNoise(p * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
          }
          
          return value;
        }
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          
          // ノイズを使って位置を変形（起伏を作る）
          vec3 pos = position;
          float noiseValue = fractalNoise(uv * 8.0 + time * 0.1);
          pos.y += noiseValue * 0.3; // 最大0.3単位の起伏
          
          // より細かいノイズを追加
          float fineNoise = smoothNoise(uv * 32.0 + time * 0.2);
          pos.y += fineNoise * 0.1; // 最大0.1単位の細かい起伏
          
          vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float depth;
        uniform float isNearGround;
        uniform float isAboveGround;
        uniform vec3 cameraPosition;
        
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        // ノイズ関数（フラグメントシェーダー用）
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        float smoothNoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          
          float a = noise(i);
          float b = noise(i + vec2(1.0, 0.0));
          float c = noise(i + vec2(0.0, 1.0));
          float d = noise(i + vec2(1.0, 1.0));
          
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        
        float fractalNoise(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          
          for (int i = 0; i < 3; i++) {
            value += amplitude * smoothNoise(p * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
          }
          
          return value;
        }
        
        void main() {
          // 基本色（より明るい土の色、地上感を出す）
          vec3 baseColor = vec3(0.627, 0.510, 0.427); // #a0826d（明るい土の色）
          
          // ノイズを使って色のバリエーションを追加
          float colorNoise = fractalNoise(vUv * 4.0);
          baseColor += (colorNoise - 0.5) * 0.15; // ±0.15の範囲で色を変動（より自然に）
          
          // 距離に応じた色の変化（遠くは薄くなる）
          float distance = length(vWorldPosition - cameraPosition);
          float distanceFade = 1.0 - smoothstep(50.0, 200.0, distance);
          baseColor *= (0.7 + distanceFade * 0.3); // 遠くは少し暗く
          
          // 深度に応じて色を調整
          if (isAboveGround > 0.5) {
            // 地上から見る時：明るい土の色（緑がかった土）
            baseColor = vec3(0.667, 0.549, 0.447); // より明るく、少し緑がかった色
          } else if (isNearGround > 0.5) {
            // 地面付近：中間の色
            float t = depth / 20.0;
            baseColor = mix(
              vec3(0.627, 0.510, 0.427), // #a0826d
              vec3(0.545, 0.451, 0.333), // #8b7355
              t
            );
          } else {
            // 地下から見る時：暗い色
            baseColor = vec3(0.420, 0.353, 0.290); // #6b5a4a
          }
          
          // フレネル効果（端がより明るく見える）
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - dot(viewDirection, vNormal), 2.0);
          
          // 最終的な色（より明るく、地上感を出す）
          vec3 finalColor = baseColor + fresnel * 0.15;
          finalColor = mix(finalColor, vec3(0.8, 0.7, 0.6), fresnel * 0.2); // 端をより明るく
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });
  }, []);
  */

  // 地面のテクスチャ（オプション：将来的に追加可能）
  // 現在はシンプルな平面を使用

  // アニメーション更新
  // シェーダーマテリアルがコメントアウトされているため、アニメーション更新も不要
  // 将来的にシェーダーマテリアルを使用する場合は、以下のコードを有効化
  /*
  useFrame((state, delta) => {
    timeRef.current += delta;
    
    if (meshRef.current && meshRef.current.material instanceof ShaderMaterial) {
      const material = meshRef.current.material;
      material.uniforms.time.value = timeRef.current;
      material.uniforms.depth.value = depth;
      material.uniforms.isNearGround.value = isNearGround ? 1.0 : 0.0;
      material.uniforms.isAboveGround.value = isAboveGround ? 1.0 : 0.0;
      material.uniforms.cameraPosition.value.copy(camera.position);
    }
  });
  */

  // 地面の位置（ファーストビューで画面の下1/3が地面になるように調整）
  // シンプルな実装：固定値で試行錯誤しやすいように
  const baseGroundY = useMemo(() => {
    // カメラの設定
    const fov = 75;
    const cameraZ = 10;
    const tiltAngle = -0.15; // カメラの下向きの傾き
    
    // 視野の高さ
    const vFovRad = (fov * Math.PI) / 180;
    const viewHeight = 2 * Math.tan(vFovRad / 2) * cameraZ;
    
    // 画面下部の位置（カメラの傾きを考慮）
    const screenBottom = -viewHeight / 2 + Math.tan(tiltAngle) * cameraZ;
    
    // 画面の下1/3の位置に地面を配置
    // 画面下部から上に viewHeight / 3 の位置（下1/3の上端）
    // 地面の中心をそこに配置するため、さらに調整が必要
    // 試行錯誤: 画面下部から上に viewHeight / 4 の位置に配置してみる
    return screenBottom + viewHeight / 4;
  }, []);

  // テスト用のシンプルなマテリアル（まず表示を確認）
  const testMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#8b7355",
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
  }, []);

  return (
    <>
      {/* メインの地面 */}
      <mesh
        ref={meshRef}
        position={[0, baseGroundY - depth, 0]} // カメラの移動に合わせて調整
        rotation={[-Math.PI / 2, 0, 0]} // 水平な平面にする
        material={testMaterial} // まずシンプルなマテリアルで表示確認
        receiveShadow
      >
        {/* 大きな平面（十分に広い範囲をカバー） */}
        <planeGeometry args={[500, 500, 64, 64]} />
      </mesh>
    </>
  );
}

