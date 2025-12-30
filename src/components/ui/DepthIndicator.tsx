"use client";

import { useTransform } from "framer-motion";
import { motion, MotionValue } from "framer-motion";
import { useEffect, useState } from "react";

interface DepthIndicatorProps {
  smoothDepth: MotionValue<number>;
}

/**
 * 深度インジケーターコンポーネント
 * ガラスモフィズムデザインで現在の深度を表示
 */
export function DepthIndicator({ smoothDepth }: DepthIndicatorProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // スムーズな深度値をリアルタイムで監視
  useEffect(() => {
    const unsubscribe = smoothDepth.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [smoothDepth]);

  // 数値をフォーマット（小数点以下1桁、単位「m」を付与）
  const formattedDepth = `${displayValue.toFixed(1)} m`;

  return (
    <motion.div
      className="fixed top-4 left-4 sm:top-8 sm:left-8 z-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative px-4 py-3 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl shadow-2xl">
        {/* 内側の光る効果 */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        
        {/* 深度表示 */}
        <div className="relative flex items-baseline gap-1 sm:gap-2">
          <span className="text-white/60 text-xs sm:text-sm font-medium tracking-wider uppercase">
            Depth
          </span>
          <motion.span
            key={formattedDepth}
            className="text-white text-lg sm:text-2xl font-mono font-semibold tabular-nums"
            style={{ textShadow: "0 0 20px rgba(255, 255, 255, 0.3)" }}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
          >
            {formattedDepth}
          </motion.span>
        </div>
        
        {/* 下部のアクセントライン */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>
    </motion.div>
  );
}

