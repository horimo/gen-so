import type { EmotionAnalysis } from "@/app/api/analyze/route";

/**
 * メッセージの感情を解析するAPIクライアント関数
 */
export async function analyzeEmotion(
  message: string
): Promise<EmotionAnalysis> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "感情解析に失敗しました");
  }

  return response.json();
}

