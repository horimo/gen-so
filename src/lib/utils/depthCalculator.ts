/**
 * 作成日時から深度を計算するユーティリティ関数
 * 新しいメッセージ（最近のcreated_at）→ 浅い深度（小さい値）
 * 古いメッセージ（過去のcreated_at）→ 深い深度（大きい値）
 */

/**
 * 作成日時から深度を計算
 * @param createdAt 作成日時（ISO文字列またはDateオブジェクト）
 * @param referenceTime 基準時刻（デフォルト: 現在時刻）
 * @returns 深度（新しいものは浅い=小さい値、古いものは深い=大きい値）
 */
export function calculateDepthFromCreatedAt(
  createdAt: string | Date,
  referenceTime: Date = new Date()
): number {
  const createdDate = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const timeDiff = referenceTime.getTime() - createdDate.getTime(); // ミリ秒
  
  // 経過時間を深度に変換
  // 1日 = 86400000ミリ秒
  // 1日につき10の深度を増やす（古いものほど深く）
  // 新しいもの（0日前）は深度0、1日前は深度10、2日前は深度20...
  const depth = Math.floor(timeDiff / (86400000 / 10)); // 1日 = 10深度
  
  // 最小深度を0に設定（負の値にならないように）
  return Math.max(0, depth);
}

/**
 * 複数の作成日時から深度を計算し、基準時刻を自動調整
 * 最も古いメッセージを深度0として、新しいものは負の値（地上エリア）になるように調整
 * @param createdAts 作成日時の配列
 * @returns 深度の配列（最も古いものが0、新しいものは負の値）
 */
export function calculateDepthsFromCreatedAts(
  createdAts: (string | Date)[]
): number[] {
  if (createdAts.length === 0) return [];
  
  // 最も古い日時を取得
  const oldestDate = createdAts.reduce((oldest, current) => {
    const currentDate = typeof current === "string" ? new Date(current) : current;
    const oldestDate = typeof oldest === "string" ? new Date(oldest) : oldest;
    return currentDate < oldestDate ? current : oldest;
  });
  
  const oldestDateObj = typeof oldestDate === "string" ? new Date(oldestDate) : oldestDate;
  
  // 各作成日時から深度を計算（最も古いものを基準に）
  return createdAts.map((createdAt) => {
    const createdDate = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
    // 古いものから新しいものを引く（古いものは正の値、新しいものは負の値）
    const timeDiff = oldestDateObj.getTime() - createdDate.getTime(); // ミリ秒
    
    // 経過時間を深度に変換
    // 1日 = 86400000ミリ秒
    // 1日につき10の深度を増やす（古いものほど深く）
    // 最も古いもの（基準）は深度0、新しいものは負の値（地上エリア）
    const depth = Math.floor(timeDiff / (86400000 / 10)); // 1日 = 10深度
    
    return depth;
  });
}

/**
 * 単一の作成日時から深度を計算（基準時刻を指定）
 * 新しいメッセージ（最近のcreated_at）→ 浅い深度（小さい値、負の値も可）
 * 古いメッセージ（過去のcreated_at）→ 深い深度（大きい値）
 * @param createdAt 作成日時（ISO文字列またはDateオブジェクト）
 * @param referenceTime 基準時刻（デフォルト: 現在時刻）
 * @returns 深度（新しいものは浅い=小さい値、古いものは深い=大きい値）
 */
export function calculateDepthFromCreatedAtWithReference(
  createdAt: string | Date,
  referenceTime: Date = new Date()
): number {
  const createdDate = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const timeDiff = referenceTime.getTime() - createdDate.getTime(); // ミリ秒
  
  // 経過時間を深度に変換
  // 1日 = 86400000ミリ秒
  // 1日につき10の深度を増やす（古いものほど深く）
  // 新しいもの（0日前）は深度0、1日前は深度10、2日前は深度20...
  const depth = Math.floor(timeDiff / (86400000 / 10)); // 1日 = 10深度
  
  // 負の値も許可（新しいものは地上エリア）
  return depth;
}

