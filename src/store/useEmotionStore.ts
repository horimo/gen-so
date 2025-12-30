"use client";

import { create } from "zustand";
import type { EmotionAnalysis } from "@/app/api/analyze/route";

export interface EmotionObject {
  id: string;
  category: EmotionAnalysis["category"];
  strength: number;
  analysis: string;
  depth: number; // y座標（マイナス方向）
  timestamp: number;
  x: number; // ランダムなx座標
  z: number; // ランダムなz座標
}

interface EmotionStore {
  objects: EmotionObject[];
  addEmotion: (emotion: Omit<EmotionObject, "id" | "x" | "z" | "timestamp">) => void;
  addEmotions: (emotions: Omit<EmotionObject, "id" | "x" | "z" | "timestamp">[]) => void;
  removeEmotion: (id: string) => void;
  clearEmotions: () => void;
}

/**
 * 感情オブジェクトを管理するストア
 */
export const useEmotionStore = create<EmotionStore>((set) => ({
  objects: [],
  
  addEmotion: (emotion) => {
    const object: EmotionObject = {
      ...emotion,
      id: `emotion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      // ランダムな位置に配置（-5から5の範囲）
      x: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 10,
    };
    
    set((state) => ({
      objects: [...state.objects, object],
    }));
  },
  
  addEmotions: (emotions) => {
    const baseTime = Date.now();
    const objects: EmotionObject[] = emotions.map((emotion, index) => ({
      ...emotion,
      // 各オブジェクトに一意のIDを生成（インデックスとランダム値を組み合わせ）
      id: `emotion-${baseTime}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: baseTime + index, // インデックスを加算して一意性を保証
      // ランダムな位置に配置（-5から5の範囲）
      x: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 10,
    }));
    
    set((state) => ({
      objects: [...state.objects, ...objects],
    }));
  },
  
  removeEmotion: (id: string) => {
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
    }));
  },
  
  clearEmotions: () => {
    set({ objects: [] });
  },
}));

