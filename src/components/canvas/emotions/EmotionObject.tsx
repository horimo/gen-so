"use client";

import type { EmotionObject } from "@/store/useEmotionStore";
import { JoyEmotion } from "./JoyEmotion";
import { StressEmotion } from "./StressEmotion";
import { SadnessEmotion } from "./SadnessEmotion";
import { PeaceEmotion } from "./PeaceEmotion";
import { InspirationEmotion } from "./InspirationEmotion";
import { NostalgiaEmotion } from "./NostalgiaEmotion";
import { ConfusionEmotion } from "./ConfusionEmotion";

interface EmotionObjectProps {
  emotion: EmotionObject;
}

/**
 * 感情オブジェクトのルーターコンポーネント
 * カテゴリに応じて適切な感情コンポーネントを表示
 */
export function EmotionObjectRenderer({ emotion }: EmotionObjectProps) {
  const position: [number, number, number] = [
    emotion.x,
    -emotion.depth, // 深度をy座標に変換（マイナス方向）
    emotion.z,
  ];

  switch (emotion.category) {
    case "joy":
      return <JoyEmotion strength={emotion.strength} position={position} />;
    case "stress":
      return <StressEmotion strength={emotion.strength} position={position} />;
    case "sadness":
      return <SadnessEmotion strength={emotion.strength} position={position} />;
    case "peace":
      return <PeaceEmotion strength={emotion.strength} position={position} />;
    case "inspiration":
      return <InspirationEmotion strength={emotion.strength} position={position} />;
    case "nostalgia":
      return <NostalgiaEmotion strength={emotion.strength} position={position} />;
    case "confusion":
      return <ConfusionEmotion strength={emotion.strength} position={position} />;
    default:
      return null;
  }
}

