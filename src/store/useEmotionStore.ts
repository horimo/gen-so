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
  addEmotion: (emotion: Omit<EmotionObject, "id" | "x" | "z" | "timestamp"> & { timestamp?: number }) => void;
  addEmotions: (emotions: Array<Omit<EmotionObject, "id" | "x" | "z" | "timestamp"> & { timestamp?: number }>) => void;
  removeEmotion: (id: string) => void;
  clearEmotions: () => void;
}

/**
 * 感情オブジェクトを管理するストア
 */
export const useEmotionStore = create<EmotionStore>((set) => ({
  objects: [],
  
  addEmotion: (emotion) => {
    // よりランダムなシード生成
    // timestampを取得（渡された場合はそれを使用、なければ現在時刻を使用）
    const timestamp = emotion.timestamp ?? Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    
    // ID全体をハッシュ化（より複雑な計算）
    const idHash = randomId.split('').reduce((acc, char, i) => {
      return acc + char.charCodeAt(0) * (i + 1) * 1000;
    }, 0);
    
    // カテゴリもハッシュに含める（異なるカテゴリで異なる配置）
    const categoryHash = emotion.category.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0) * 10000;
    }, 0);
    
    const seed = Math.floor(emotion.depth * 1000) 
      + timestamp 
      + idHash 
      + categoryHash
      + Math.floor(emotion.strength * 100000);
    
    // シードベースの疑似乱数生成関数（複数の計算を組み合わせてランダム性を向上）
    const seededRandom = (offset: number) => {
      // 複数の計算を組み合わせてよりランダムに
      const value1 = ((seed + offset * 1000) * 9301 + 49297) % 233280;
      const value2 = ((seed + offset * 2000) * 7919 + 12345) % 233280;
      const value3 = ((seed + offset * 3000) * 6781 + 98765) % 233280;
      return ((value1 + value2 + value3) % 233280) / 233280;
    };
    
    // 角度と半径を使った極座標系での配置（より自然な分布）
    // 半径もランダムに変動させてより分散させる
    const angle = seededRandom(0) * Math.PI * 2;
    const radius = seededRandom(1) * 10 + seededRandom(2) * 5; // 0から15の範囲、より分散
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    const object: EmotionObject = {
      ...emotion,
      id: `emotion-${timestamp}-${randomId}`,
      timestamp,
      // 極座標系でのランダムな位置に配置（より自然な分布）
      x,
      z,
    };
    
    set((state) => ({
      objects: [...state.objects, object],
    }));
  },
  
  addEmotions: (emotions) => {
    const baseTime = Date.now();
    const objects: EmotionObject[] = emotions.map((emotion, index) => {
      // 完全にランダムなIDを生成（各オブジェクトごとに異なる）
      const randomId = Math.random().toString(36).substr(2, 9);
      
      // timestampを取得（渡された場合はそれを使用、なければ現在時刻を使用）
      const timestamp = emotion.timestamp ?? (baseTime + index);
      
      // ID全体をハッシュ化（より複雑な計算）
      const idHash = randomId.split('').reduce((acc, char, i) => {
        return acc + char.charCodeAt(0) * (i + 1) * 1000;
      }, 0);
      
      // カテゴリもハッシュに含める（異なるカテゴリで異なる配置）
      const categoryHash = emotion.category.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0) * 10000;
      }, 0);
      
      // より複雑なシード生成（複数の要素を組み合わせ）
      const seed = Math.floor(emotion.depth * 1000) 
        + index * 10000 
        + timestamp 
        + idHash 
        + categoryHash
        + Math.floor(emotion.strength * 100000);
      
      // シードベースの疑似乱数生成関数（複数の計算を組み合わせてランダム性を向上）
      const seededRandom = (offset: number) => {
        // 複数の計算を組み合わせてよりランダムに
        const value1 = ((seed + offset * 1000) * 9301 + 49297) % 233280;
        const value2 = ((seed + offset * 2000) * 7919 + 12345) % 233280;
        const value3 = ((seed + offset * 3000) * 6781 + 98765) % 233280;
        return ((value1 + value2 + value3) % 233280) / 233280;
      };
      
      // 角度と半径を使った極座標系での配置（より自然な分布）
      // 半径もランダムに変動させてより分散させる
      const angle = seededRandom(0) * Math.PI * 2;
      const radius = seededRandom(1) * 10 + seededRandom(2) * 5; // 0から15の範囲、より分散
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      return {
        ...emotion,
        // 各オブジェクトに一意のIDを生成（インデックスとランダム値を組み合わせ）
        id: `emotion-${timestamp}-${index}-${randomId}`,
        timestamp, // DBから取得したcreated_atを使用
        // 極座標系でのランダムな位置に配置（より自然な分布）
        x,
        z,
      };
    });
    
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

