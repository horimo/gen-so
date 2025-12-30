"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * テラリウム感のあるローディングコンポーネント
 */
export function TerrariumLoader() {
  const [dots, setDots] = useState("");
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; delay: number }>>([]);
  const [petals, setPetals] = useState<Array<{ x: number; y: number }>>([]);

  // クライアントサイドでのみランダムな値を生成（ハイドレーション不一致を防ぐ）
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);

    // パーティクルの位置を生成（クライアントサイドのみ）
    const generatedParticles = Array.from({ length: 30 }).map((_, i) => ({
      delay: i * 0.1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
    }));
    setParticles(generatedParticles);

    // 花びらの位置を生成（クライアントサイドのみ、固定値で計算）
    const generatedPetals = [0, 1, 2, 3, 4, 5].map((i) => {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 20;
      return {
        x: Math.cos(angle) * radius + 10,
        y: Math.sin(angle) * radius + 10,
      };
    });
    setPetals(generatedPetals);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#1a1a2e] via-[#0f0f1e] to-[#000000] flex items-center justify-center">
      {/* 背景の光る粒子 */}
      <div className="absolute inset-0">
        {particles.map((particle, i) => {
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                boxShadow: `0 0 ${particle.size * 2}px rgba(255, 255, 255, 0.5)`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + (particle.size * 0.5),
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>

      {/* 中央のコンテンツ */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* 成長する植物のアニメーション */}
        <div className="relative w-32 h-32">
          {/* 茎 */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 bg-gradient-to-t from-[#4dd0e1] to-[#1a1a3e] rounded-t-full"
            initial={{ height: 0 }}
            animate={{ height: 60 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          
          {/* 葉（左） */}
          <motion.div
            className="absolute bottom-12 left-1/2 w-16 h-8 bg-gradient-to-r from-[#4dd0e1] to-transparent rounded-full opacity-60"
            style={{ transformOrigin: "right center" }}
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: -20 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          />
          
          {/* 葉（右） */}
          <motion.div
            className="absolute bottom-12 left-1/2 w-16 h-8 bg-gradient-to-l from-[#4dd0e1] to-transparent rounded-full opacity-60"
            style={{ transformOrigin: "left center" }}
            initial={{ scale: 0, rotate: 45 }}
            animate={{ scale: 1, rotate: 20 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          />
          
          {/* 花（joy風） */}
          <motion.div
            className="absolute bottom-16 left-1/2 -translate-x-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
          >
            <div className="relative">
              {/* 中心 */}
              <motion.div
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffd700] to-[#ffeb3b]"
                style={{
                  boxShadow: "0 0 20px rgba(255, 215, 0, 0.6)",
                }}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* 花びら */}
              {petals.map((petal, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-[#ffeb3b] to-[#ffd700] opacity-80"
                    style={{
                    left: `${petal.x}px`,
                    top: `${petal.y}px`,
                      transform: `translate(-50%, -50%)`,
                      boxShadow: "0 0 10px rgba(255, 235, 59, 0.4)",
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.6, 0.9, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut",
                    }}
                  />
              ))}
            </div>
          </motion.div>
        </div>

        {/* テキスト */}
        <div className="text-center">
          <motion.h1
            className="text-2xl sm:text-3xl font-bold text-white mb-2"
            style={{
              textShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            言層（GEN-SO）
          </motion.h1>
          
          <motion.p
            className="text-white/60 text-sm sm:text-base font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            読み込み中{dots}
          </motion.p>
        </div>

        {/* 光る粒子の軌道 */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => {
            const angle = (i / 5) * Math.PI * 2;
            const radius = 100;
            
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white/40"
                style={{
                  left: "50%",
                  top: "50%",
                  transformOrigin: "0 0",
                  boxShadow: "0 0 10px rgba(255, 255, 255, 0.6)",
                }}
                animate={{
                  x: [0, Math.cos(angle) * radius, 0],
                  y: [0, Math.sin(angle) * radius, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* 下部のアクセントライン */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
  );
}

