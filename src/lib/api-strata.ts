import type { StrataObject } from "@/app/api/strata/route";

/**
 * 言層（Strata）オブジェクトを保存するAPIクライアント関数
 * depth_yは不要（created_atから自動計算される）
 */
export async function saveStrataObject(
  message: string,
  category: StrataObject["category"],
  strength: number,
  analysis?: string
): Promise<StrataObject> {
  const response = await fetch("/api/strata", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      category,
      strength,
      analysis,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "言層の保存に失敗しました");
  }

  return response.json();
}

/**
 * 言層（Strata）オブジェクトを取得するAPIクライアント関数
 */
export async function getStrataObjects(): Promise<StrataObject[]> {
  const response = await fetch("/api/strata", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "言層の取得に失敗しました");
  }

  return response.json();
}

export interface OthersStrataObject {
  depth_y: number;
  category: "joy" | "peace" | "stress" | "sadness" | "inspiration" | "nostalgia" | "confusion";
  strength: number;
  created_at: string;
}

/**
 * 他者の言層（Strata）オブジェクトを取得するAPIクライアント関数
 */
export async function getOthersStrataObjects(
  minDepth?: number,
  maxDepth?: number
): Promise<OthersStrataObject[]> {
  const params = new URLSearchParams();
  if (minDepth !== undefined) {
    params.append("min_depth", minDepth.toString());
  }
  if (maxDepth !== undefined) {
    params.append("max_depth", maxDepth.toString());
  }

  const url = `/api/strata/others${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "他者の言層の取得に失敗しました");
  }

  return response.json();
}
