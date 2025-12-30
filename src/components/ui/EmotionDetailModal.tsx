"use client";

import { useEffect } from "react";
import { useInteractionStore } from "@/store/useInteractionStore";
import { useEmotionStore } from "@/store/useEmotionStore";
import { useMessageStore } from "@/store/useMessageStore";
import type { EmotionObject } from "@/store/useEmotionStore";

interface EmotionDetailModalProps {
  // jumpToDepthは不要になったため削除
}

/**
 * 感情オブジェクトの詳細を表示するモーダル
 */
export function EmotionDetailModal({}: EmotionDetailModalProps) {
  const selectedEmotionId = useInteractionStore((state) => state.selectedEmotionId);
  const setSelectedEmotion = useInteractionStore((state) => state.setSelectedEmotion);
  const emotionObjects = useEmotionStore((state) => state.objects);
  const messages = useMessageStore((state) => state.messages);

  const selectedEmotion = emotionObjects.find((e) => e.id === selectedEmotionId);
  const relatedMessage = selectedEmotion
    ? messages.find((m) => m.id === selectedEmotion.id || m.timestamp === selectedEmotion.timestamp)
    : null;

  // ESCキーで閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedEmotion(null);
      }
    };

    if (selectedEmotionId) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [selectedEmotionId, setSelectedEmotion]);

  if (!selectedEmotion) {
    return null;
  }

  const categoryLabels: Record<string, string> = {
    joy: "喜び",
    peace: "平和",
    stress: "ストレス",
    sadness: "悲しみ",
    inspiration: "インスピレーション",
    nostalgia: "ノスタルジア",
    confusion: "混乱",
  };

  const categoryColors: Record<string, string> = {
    joy: "#ffd700",
    peace: "#4dd0e1",
    stress: "#ff0066",
    sadness: "#1a1a3e",
    inspiration: "#9c27b0",
    nostalgia: "#8b6914",
    confusion: "#4a5d23",
  };


  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        // モーダルのコンテンツ部分をクリックした場合は閉じない
        if (e.target === e.currentTarget) {
          setSelectedEmotion(null);
        }
      }}
    >
      <div
        className="relative w-full max-w-2xl mx-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={() => setSelectedEmotion(null)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="閉じる"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: categoryColors[selectedEmotion.category] }}
            />
            <h2 className="text-2xl font-bold text-white">
              {categoryLabels[selectedEmotion.category] || selectedEmotion.category}
            </h2>
          </div>
          <p className="text-white/70 text-sm">
            強度: {(selectedEmotion.strength * 100).toFixed(0)}%
          </p>
        </div>

        {/* メッセージ内容 */}
        {relatedMessage && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-sm font-semibold text-white/80 mb-2">メッセージ</h3>
            <p className="text-white/90 whitespace-pre-wrap">{relatedMessage.text}</p>
          </div>
        )}

        {/* 解析理由 */}
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-sm font-semibold text-white/80 mb-2">解析理由</h3>
          <p className="text-white/90 whitespace-pre-wrap">{selectedEmotion.analysis}</p>
        </div>

        {/* メタ情報 */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-sm font-semibold text-white/80 mb-1">深度</h3>
            <p className="text-white/90">{selectedEmotion.depth.toFixed(1)}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-sm font-semibold text-white/80 mb-1">作成日時</h3>
            <p className="text-white/90 text-sm">{formatDate(selectedEmotion.timestamp)}</p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-end">
          <button
            onClick={() => setSelectedEmotion(null)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

