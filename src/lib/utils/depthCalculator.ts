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
 * 最も新しいメッセージを深度20として、古いものは正の値（地下エリア）になるように調整
 * 古いメッセージ → 深い深度（正の値、大きい値）
 * 新しいメッセージ → 浅い深度（20以上、小さい値）
 * 
 * 深度0が「地面の位置」で、これが基準点です。
 * 最も新しいメッセージは深度20に配置され、古いメッセージは深度20より深い（正の値、地下エリア）に配置されます。
 * 
 * @param createdAts 作成日時の配列
 * @returns 深度の配列（最も新しいものが20、古いものは20より大きい正の値）
 */
export function calculateDepthsFromCreatedAts(
  createdAts: (string | Date)[]
): number[] {
  if (createdAts.length === 0) return [];
  
  // 最も新しい日時を取得（深度20の基準点）
  const newestDate = createdAts.reduce((newest, current) => {
    const currentDate = typeof current === "string" ? new Date(current) : current;
    const newestDate = typeof newest === "string" ? new Date(newest) : newest;
    return currentDate > newestDate ? current : newest;
  });
  
  const newestDateObj = typeof newestDate === "string" ? new Date(newestDate) : newestDate;
  
  // 各作成日時から深度を計算（最も新しいものを基準に）
  return createdAts.map((createdAt) => {
    const createdDate = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
    // 新しいものから古いものを引く
    // 最も新しいもの（createdDate = newestDateObj）は timeDiff = 0 → 深度20
    // 古いもの（createdDate < newestDateObj）は timeDiff > 0 → 深度20より大きい正の値（地下エリア）
    const timeDiff = newestDateObj.getTime() - createdDate.getTime(); // ミリ秒
    
    // 経過時間を深度に変換
    // 1日 = 86400000ミリ秒
    // 1日につき10の深度を増やす
    // 最も新しいもの（timeDiff=0）は深度20、古いもの（timeDiff>0）は深度20より大きい正の値（地下エリア）
    const baseDepth = Math.floor(timeDiff / (86400000 / 10)); // 1日 = 10深度
    const depth = baseDepth + 20; // 最も新しいメッセージを深度20に配置
    
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

