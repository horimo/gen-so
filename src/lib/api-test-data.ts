/**
 * テスト用データを作成するAPIクライアント関数
 */
export async function createTestData(): Promise<{ message: string; count: number }> {
  const response = await fetch("/api/test-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "テストデータの作成に失敗しました");
  }

  return response.json();
}

