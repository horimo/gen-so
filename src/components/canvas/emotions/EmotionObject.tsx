"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useInteractionStore } from "@/store/useInteractionStore";
import type { EmotionObject } from "@/store/useEmotionStore";
import { JoyEmotion } from "./JoyEmotion";
import { StressEmotion } from "./StressEmotion";
import { SadnessEmotion } from "./SadnessEmotion";
import { PeaceEmotion } from "./PeaceEmotion";
import { InspirationEmotion } from "./InspirationEmotion";
import { NostalgiaEmotion } from "./NostalgiaEmotion";
import { ConfusionEmotion } from "./ConfusionEmotion";
import type { Group } from "three";
import { useThree } from "@react-three/fiber";
import { Raycaster, Vector2 } from "three";

interface EmotionObjectProps {
  emotion: EmotionObject;
}

/**
 * 感情オブジェクトのルーターコンポーネント
 * カテゴリに応じて適切な感情コンポーネントを表示
 * ホバー/クリックイベントを処理
 */
export function EmotionObjectRenderer({ emotion }: EmotionObjectProps) {
  const position: [number, number, number] = [
    emotion.x,
    -emotion.depth, // 深度をy座標に変換（マイナス方向）
    emotion.z,
  ];

  const groupRef = useRef<Group>(null);
  const { raycaster, camera, gl } = useThree();
  const { hoveredEmotionId, selectedEmotionId, setHoveredEmotion, setSelectedEmotion } = useInteractionStore();
  const isHovered = hoveredEmotionId === emotion.id;
  const isSelected = selectedEmotionId === emotion.id;
  const mouseRef = useRef(new Vector2());
  const raycasterRef = useRef(new Raycaster());

  // ホバー/クリック検出
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      
      if (groupRef.current) {
        const intersects = raycasterRef.current.intersectObject(groupRef.current, true);
        
        if (intersects.length > 0) {
          setHoveredEmotion(emotion.id);
        } else if (hoveredEmotionId === emotion.id) {
          setHoveredEmotion(null);
        }
      }
    };

    const handleClick = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      
      if (groupRef.current) {
        const intersects = raycasterRef.current.intersectObject(groupRef.current, true);
        
        if (intersects.length > 0) {
          setSelectedEmotion(emotion.id);
        }
      }
    };

    gl.domElement.addEventListener("mousemove", handleMouseMove);
    gl.domElement.addEventListener("click", handleClick);

    return () => {
      gl.domElement.removeEventListener("mousemove", handleMouseMove);
      gl.domElement.removeEventListener("click", handleClick);
    };
  }, [camera, gl, emotion.id, hoveredEmotionId, setHoveredEmotion, setSelectedEmotion]);

  // ホバー/選択時のスケール変更
  useFrame(() => {
    if (!groupRef.current) return;
    
    const targetScale = isHovered || isSelected ? 1.2 : 1.0;
    const currentScale = groupRef.current.scale.x;
    const newScale = currentScale + (targetScale - currentScale) * 0.1;
    groupRef.current.scale.set(newScale, newScale, newScale);
  });

  const baseComponent = (() => {
    switch (emotion.category) {
      case "joy":
        return <JoyEmotion strength={emotion.strength} position={[0, 0, 0]} />;
      case "stress":
        return <StressEmotion strength={emotion.strength} position={[0, 0, 0]} />;
      case "sadness":
        return <SadnessEmotion strength={emotion.strength} position={[0, 0, 0]} />;
      case "peace":
        return <PeaceEmotion strength={emotion.strength} position={[0, 0, 0]} />;
      case "inspiration":
        return <InspirationEmotion strength={emotion.strength} position={[0, 0, 0]} />;
      case "nostalgia":
        return <NostalgiaEmotion strength={emotion.strength} position={[0, 0, 0]} />;
      case "confusion":
        return <ConfusionEmotion strength={emotion.strength} position={[0, 0, 0]} />;
      default:
        return null;
    }
  })();

  return (
    <group ref={groupRef} position={position}>
      {baseComponent}
    </group>
  );
}

