"use client";

import { create } from "zustand";

interface InteractionState {
  hoveredEmotionId: string | null;
  selectedEmotionId: string | null;
  setHoveredEmotion: (id: string | null) => void;
  setSelectedEmotion: (id: string | null) => void;
  clearSelection: () => void;
}

/**
 * インタラクション状態を管理するストア
 */
export const useInteractionStore = create<InteractionState>((set) => ({
  hoveredEmotionId: null,
  selectedEmotionId: null,
  
  setHoveredEmotion: (id) => {
    set({ hoveredEmotionId: id });
  },
  
  setSelectedEmotion: (id) => {
    set({ selectedEmotionId: id });
  },
  
  clearSelection: () => {
    set({ hoveredEmotionId: null, selectedEmotionId: null });
  },
}));

