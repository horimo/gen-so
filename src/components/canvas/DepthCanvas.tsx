"use client";

import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";
import { useDepth } from "@/hooks/useDepth";
import { DepthIndicator } from "@/components/ui/DepthIndicator";
import { FloatingChat } from "@/components/ui/FloatingChat";
import { useSmoothDepth } from "@/hooks/useSmoothDepth";
import { useMessageStore } from "@/store/useMessageStore";
import { useEmotionStore } from "@/store/useEmotionStore";
import { analyzeEmotion } from "@/lib/api";
import { saveStrataObject, getStrataObjects, getOthersStrataObjects } from "@/lib/api-strata";
import { createTestData } from "@/lib/api-test-data";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";

/**
 * 深度に連動した3D Canvasコンポーネント
 */
export function DepthCanvas() {
  const { user, signOut } = useAuth();
  const rawDepth = useDepth();
  const smoothDepth = useSmoothDepth(rawDepth);
  const updateMessageStatus = useMessageStore((state) => state.updateMessageStatus);
  const addEmotion = useEmotionStore((state) => state.addEmotion);
  const addEmotions = useEmotionStore((state) => state.addEmotions);
  const clearEmotions = useEmotionStore((state) => state.clearEmotions);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [othersLights, setOthersLights] = useState<Array<{
    depth_y: number;
    category: "joy" | "peace" | "stress" | "sadness" | "inspiration" | "nostalgia" | "confusion";
    strength: number;
  }>>([]);

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

      try {
        // 既存のデータをクリアしてから読み込む
        clearEmotions();
        
        const strataData = await getStrataObjects();
        
        // データベースから読み込んだデータを3D空間に復元
        if (strataData.length > 0) {
          const emotions = strataData.map((strata) => ({
            category: strata.category,
            strength: strata.strength,
            analysis: strata.analysis || "",
            depth: strata.depth_y,
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
      
      // 感情オブジェクトを3D空間に追加（現在の深度に配置）
      addEmotion({
        category: analysis.category,
        strength: analysis.strength,
        analysis: analysis.analysis,
        depth: depth, // 現在の深度を保存
      });
      
      // データベースに保存（ログインユーザーの場合）
      if (user) {
        try {
          await saveStrataObject(
            message,
            analysis.category,
            analysis.strength,
            depth,
            analysis.analysis
          );
          console.log("言層をデータベースに保存しました");
        } catch (dbError) {
          console.error("データベース保存エラー:", dbError);
          // データベース保存エラーは3D表示には影響しないため、エラーをスローしない
        }
      }
    } catch (error) {
      console.error("感情解析エラー:", error);
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full">
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
        <Scene depth={rawDepth} othersLights={othersLights} />
      </Canvas>
      
      {/* 深度インジケーター */}
      <DepthIndicator smoothDepth={smoothDepth} />
      
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
    </div>
  );
}

