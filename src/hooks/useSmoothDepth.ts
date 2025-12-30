"use client";

import { useMotionValue, useSpring } from "framer-motion";

/**
 * 滑らかな深度値の更新を行うカスタムフック
 * ホイール停止時にフワッと止まるようなアニメーションを実現
 */
export function useSmoothDepth(rawDepth: number) {
  const motionValue = useMotionValue(rawDepth);
  // スクロールに即座に反応するように、非常に硬いスプリング設定
  const spring = useSpring(motionValue, {
    stiffness: 500, // 非常に硬く（即座に反応）
    damping: 50, // ダンピングを増やして振動を抑える
    mass: 0.1, // 非常に軽く（即座に反応）
  });

  // rawDepthが変更されたらmotionValueを更新
  motionValue.set(rawDepth);

  return spring;
}

