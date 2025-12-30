"use client";

import { useMotionValue, useSpring } from "framer-motion";

/**
 * 滑らかな深度値の更新を行うカスタムフック
 * ホイール停止時にフワッと止まるようなアニメーションを実現
 */
export function useSmoothDepth(rawDepth: number) {
  const motionValue = useMotionValue(rawDepth);
  const spring = useSpring(motionValue, {
    stiffness: 50,
    damping: 30,
    mass: 0.5,
  });

  // rawDepthが変更されたらmotionValueを更新
  motionValue.set(rawDepth);

  return spring;
}

