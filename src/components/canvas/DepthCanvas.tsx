"use client";

import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";
import dynamic from "next/dynamic";

// Scene2DPixiを動的インポートで遅延読み込み（コンパイル時間の短縮）
const Scene2DPixi = dynamic(() => import("./Scene2DPixi").then((mod) => ({ default: mod.Scene2DPixi })), {
  ssr: false, // サーバーサイドレンダリングを無効化
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1a1a2e]">
      <div className="text-white/60 text-sm font-mono">読み込み中...</div>
    </div>
  ),
});
import { useDepth } from "@/hooks/useDepth";
import { DepthIndicator } from "@/components/ui/DepthIndicator";
import { FloatingChat } from "@/components/ui/FloatingChat";
import { EmotionDetailModal } from "@/components/ui/EmotionDetailModal";
import { EmotionDepthMap } from "@/components/ui/EmotionDepthMap";
import { useSmoothDepth } from "@/hooks/useSmoothDepth";
import { useMessageStore } from "@/store/useMessageStore";
import { useEmotionStore } from "@/store/useEmotionStore";
import { analyzeEmotion } from "@/lib/api";
import { saveStrataObject, getStrataObjects, getOthersStrataObjects } from "@/lib/api-strata";
import { calculateDepthsFromCreatedAts } from "@/lib/utils/depthCalculator";
import { createTestData } from "@/lib/api-test-data";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";

/**
 * 深度に連動した3D Canvasコンポーネント
 */
export function DepthCanvas() {
  const { user, signOut } = useAuth();
  const { depth: rawDepth, jumpToDepth } = useDepth();
  const smoothDepth = useSmoothDepth(rawDepth);
  const updateMessageStatus = useMessageStore((state) => state.updateMessageStatus);
  const addEmotion = useEmotionStore((state) => state.addEmotion);
  const addEmotions = useEmotionStore((state) => state.addEmotions);
  const clearEmotions = useEmotionStore((state) => state.clearEmotions);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [othersLights, setOthersLights] = useState<Array<{
    depth_y: number;
    category: "joy" | "peace" | "stress" | "sadness" | "inspiration" | "nostalgia" | "confusion";
    strength: number;
  }>>([]);
  const [showDepthMap, setShowDepthMap] = useState(false);

  // ログイン時にデータベースから過去の言層データを読み込む
  useEffect(() => {
    const loadStrataData = async () => {
      if (!user) {
        // ログアウト時はストアをクリア
        clearEmotions();
        setHasLoadedData(false);
        setIsLoadingData(false);
        return;
      }

      // 既にデータを読み込んでいる場合はスキップ
      if (hasLoadedData) {
        return;
      }

      // データ読み込みを非ブロッキングで開始（画面表示をブロックしない）
      // 少し遅延させて、初期表示を優先
      setTimeout(async () => {
        try {
          // 既存のデータをクリアしてから読み込む
          clearEmotions();
          
          const strataData = await getStrataObjects();
          
          // データベースから読み込んだデータを3D空間に復元
          if (strataData.length > 0) {
            // created_atから深度を計算
            const createdAts = strataData.map((strata) => strata.created_at || new Date().toISOString());
            const depths = calculateDepthsFromCreatedAts(createdAts);
            
            const emotions = strataData.map((strata, index) => ({
              category: strata.category,
              strength: strata.strength,
              analysis: strata.analysis || "",
              depth: depths[index], // created_atから計算した深度を使用
              // DBから取得したcreated_atをtimestampとして使用
              timestamp: strata.created_at ? new Date(strata.created_at).getTime() : undefined,
            }));
            
            addEmotions(emotions);
            console.log(`${strataData.length}件の言層データを読み込みました`);
          }
          
          setHasLoadedData(true);
        } catch (error) {
          console.error("言層データの読み込みエラー:", error);
          // エラーが発生しても3D表示は続行
        } finally {
          setIsLoadingData(false);
        }
      }, 100); // 100ms遅延して、初期表示を優先
    };

    loadStrataData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // user.idのみを依存配列に含める

  // 他者の言層データを取得（現在の深度周辺）
  const lastLoadedDepthRef = useRef<number>(-1);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) {
      setOthersLights([]);
      lastLoadedDepthRef.current = -1;
      return;
    }

    const loadOthersData = async () => {
      try {
        // 現在の深度から±500の範囲で他者のデータを取得
        const minDepth = Math.max(0, rawDepth - 500);
        const maxDepth = rawDepth + 500;
        
        const othersData = await getOthersStrataObjects(minDepth, maxDepth);
        setOthersLights(othersData);
        lastLoadedDepthRef.current = rawDepth;
      } catch (error) {
        console.error("他者の言層データの読み込みエラー:", error);
        // エラーが発生しても3D表示は続行
      }
    };

    // 既存のタイムアウトをクリア
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }

    // 深度が大きく変化した場合（200以上）のみ再読み込み
    const depthDiff = Math.abs(rawDepth - lastLoadedDepthRef.current);
    if (depthDiff >= 200 || lastLoadedDepthRef.current === -1) {
      // 初回読み込みまたは深度が大きく変化した場合
      loadOthersData();
    } else {
      // 深度の変化が小さい場合は、遅延して読み込み（デバウンス）
      loadTimeoutRef.current = setTimeout(() => {
        loadOthersData();
      }, 10000); // 10秒後に読み込み（リクエスト頻度を下げる）
    }

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };
  }, [user, rawDepth]);

  // メッセージ送信処理（Gemini APIで感情解析）
  const handleSendMessage = async (message: string, depth: number) => {
    try {
      // Gemini APIで感情解析
      const analysis = await analyzeEmotion(message);
      
      // 解析結果をログに出力
      console.log("感情解析結果:", {
        message,
        depth,
        category: analysis.category,
        strength: analysis.strength,
        analysis: analysis.analysis,
      });
      
      // データベースに保存（ログインユーザーの場合）
      let savedStrata: Awaited<ReturnType<typeof saveStrataObject>> | null = null;
      if (user) {
        try {
          savedStrata = await saveStrataObject(
            message,
            analysis.category,
            analysis.strength,
            analysis.analysis
          );
          console.log("言層をデータベースに保存しました");
        } catch (dbError) {
          console.error("データベース保存エラー:", dbError);
          // データベース保存エラーは3D表示には影響しないため、エラーをスローしない
        }
      }
      
      // 感情オブジェクトを3D空間に追加
      // 新規作成時は深度0（最も浅い）として扱う
      // 既存データを読み込む際に全てのデータをまとめて深度を再計算する
      const createdAt = savedStrata?.created_at ? new Date(savedStrata.created_at) : new Date();
      
      addEmotion({
        category: analysis.category,
        strength: analysis.strength,
        analysis: analysis.analysis,
        depth: 0, // 新規作成時は深度0（最も浅い）、既存データ読み込み時に再計算される
        timestamp: createdAt.getTime(),
      });
      
      // 既存データを再読み込みして深度を再計算（新規作成後）
      if (savedStrata && user) {
        setTimeout(async () => {
          try {
            const strataData = await getStrataObjects();
            if (strataData.length > 0) {
              // 既存の感情オブジェクトをクリア
              clearEmotions();
              
              // created_atから深度を計算
              const createdAts = strataData.map((strata) => strata.created_at || new Date().toISOString());
              const depths = calculateDepthsFromCreatedAts(createdAts);
              
              const emotions = strataData.map((strata, index) => ({
                category: strata.category,
                strength: strata.strength,
                analysis: strata.analysis || "",
                depth: depths[index], // created_atから計算した深度を使用
                timestamp: strata.created_at ? new Date(strata.created_at).getTime() : undefined,
              }));
              
              addEmotions(emotions);
            }
          } catch (error) {
            console.error("深度再計算エラー:", error);
          }
        }, 500); // 500ms後に再読み込み（DBの反映を待つ）
      }
    } catch (error) {
      console.error("感情解析エラー:", error);
      throw error;
    }
  };

  // 2Dモードの切り替え（環境変数またはフラグで制御）
  const use2DMode = process.env.NEXT_PUBLIC_USE_2D_MODE === "true" || true; // デフォルトで2Dモード

  return (
    <div className="fixed inset-0 w-full h-full">
      {/* データ読み込み中のスケルトンUI */}
      {isLoadingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a2e]">
          <div className="text-center">
            <div className="text-white/60 text-sm font-mono mb-2">言層データを読み込み中...</div>
            <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white/30 animate-pulse" style={{ width: "60%" }} />
            </div>
          </div>
        </div>
      )}
      
      {use2DMode ? (
        // 2Dモード
        <Scene2DPixi depth={rawDepth} userId={user?.id} othersLights={othersLights} />
      ) : (
        // 3Dモード（従来の実装）
      <Canvas
        camera={{
          position: [0, 0, 10],
          fov: 75,
          near: 0.1,
          far: 10000,
        }}
        gl={{
          antialias: true,
          alpha: false,
        }}
      >
          <Scene depth={rawDepth} userId={user?.id} othersLights={othersLights} />
      </Canvas>
      )}
      
      {/* 深度インジケーター */}
      <DepthIndicator smoothDepth={smoothDepth} onTap={() => setShowDepthMap(true)} />
      
      {/* 浮遊チャットUI */}
      <FloatingChat 
        currentDepth={rawDepth} 
        onSend={handleSendMessage}
      />
      
      {/* テストデータ作成ボタン（開発用、右上） */}
      {user && process.env.NODE_ENV === "development" && (
        <button
          onClick={async () => {
            try {
              const result = await createTestData();
              alert(result.message);
              // データを再読み込み
              window.location.reload();
            } catch (error) {
              alert(`エラー: ${error instanceof Error ? error.message : "テストデータの作成に失敗しました"}`);
            }
          }}
          className="absolute top-4 right-4 sm:top-8 sm:right-8 z-10 px-3 py-2 sm:px-4 rounded-lg sm:rounded-xl border border-white/20 bg-white/5 backdrop-blur-xl text-white/60 text-xs sm:text-sm font-mono hover:text-white hover:bg-white/10 active:bg-white/15 transition-all touch-manipulation"
        >
          テストデータ作成
        </button>
      )}
      
      {/* ログアウトボタン（右上、テストデータボタンの下） */}
      {user && (
        <button
          onClick={signOut}
          className="absolute top-16 right-4 sm:top-20 sm:right-8 z-10 px-3 py-2 sm:px-4 rounded-lg sm:rounded-xl border border-white/20 bg-white/5 backdrop-blur-xl text-white/60 text-xs sm:text-sm font-mono hover:text-white hover:bg-white/10 active:bg-white/15 transition-all touch-manipulation"
        >
          ログアウト
        </button>
      )}
      
      {/* 感情オブジェクトの詳細モーダル */}
      <EmotionDetailModal />
      
      {/* 感情深度マップ */}
      {showDepthMap && (
        <EmotionDepthMap
          currentDepth={rawDepth}
          onDepthSelect={(depth) => {
            jumpToDepth(depth);
            setShowDepthMap(false);
          }}
          onClose={() => setShowDepthMap(false)}
        />
      )}
    </div>
  );
}

