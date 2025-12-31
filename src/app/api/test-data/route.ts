import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

/**
 * テスト用データを作成するAPI Route Handler
 * 開発環境でのみ使用してください
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 現在のユーザーを取得
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // テストデータを定義（複数の深度に異なる感情カテゴリを配置）
    // 各深度にデータが表示されていることを確認しやすいように、細かく分散配置
    const categories: Array<"joy" | "peace" | "stress" | "sadness" | "inspiration" | "nostalgia" | "confusion"> = [
      "joy", "peace", "stress", "sadness", "inspiration", "nostalgia", "confusion"
    ];
    
    const messages: Record<string, string[]> = {
      joy: [
        "今日はとても楽しかった！",
        "最高の気分！",
        "また楽しい日々",
        "嬉しい出来事があった",
        "心が躍る",
        "幸せな瞬間",
        "笑顔が止まらない",
        "ワクワクしている",
      ],
      peace: [
        "穏やかな気持ち",
        "心が落ち着いている",
        "静かな時間",
        "安らぎを感じる",
        "平和な気分",
        "リラックスしている",
        "落ち着いた日々",
        "静けさを楽しむ",
      ],
      stress: [
        "少し疲れたな...",
        "ストレスが溜まっている",
        "緊張している",
        "プレッシャーを感じる",
        "イライラしている",
        "不安な気持ち",
        "重圧を感じる",
        "焦っている",
      ],
      sadness: [
        "悲しい気持ち",
        "深い悲しみ",
        "寂しい",
        "憂鬱な日",
        "涙が出そう",
        "落ち込んでいる",
        "切ない気持ち",
        "物悲しい",
      ],
      inspiration: [
        "新しいアイデアが浮かんだ",
        "インスピレーションが湧いてきた",
        "創造性が高まっている",
        "閃きがあった",
        "アイデアが次々と",
        "創作意欲が湧く",
        "新しい発見",
        "創造的な気分",
      ],
      nostalgia: [
        "懐かしい思い出",
        "過去を思い出す",
        "昔を懐かしむ",
        "思い出に浸る",
        "懐かしい気持ち",
        "過去への郷愁",
        "記憶を辿る",
        "昔の日々を想う",
      ],
      confusion: [
        "何か分からない",
        "混乱している",
        "迷っている",
        "理解できない",
        "困惑している",
        "戸惑っている",
        "混乱した気持ち",
        "分からなくて困っている",
      ],
    };

    const testData: Array<{
      message: string;
      category: typeof categories[number];
      strength: number;
      analysis: string;
      created_at: string; // created_atを指定（depth_yは不要）
    }> = [];
    
    // 基準日時（現在時刻）
    const now = new Date();

    // クラスター（塊）を作成してバラツキを出す
    // 各クラスターは特定の日時（過去からの経過日数）に複数のオブジェクトを集中させる
    // 古いメッセージ（過去のcreated_at）→ 深い深度（大きい値）
    // 新しいメッセージ（最近のcreated_at）→ 浅い深度（小さい値）
    const clusters: Array<{
      daysAgo: number; // 何日前のメッセージか（クラスターの中心）
      count: number; // このクラスターに配置するオブジェクト数
      strengthRange: [number, number]; // 強度の範囲 [min, max]
      dominantCategory?: typeof categories[number]; // このクラスターの主要な感情カテゴリ
      categoryMix: number; // 0-1: 0=dominantCategoryのみ、1=全カテゴリ均等
    }> = [
      // 新しいメッセージ（浅い深度）のクラスター
      { daysAgo: 2, count: 8, strengthRange: [0.75, 0.95], dominantCategory: "joy", categoryMix: 0.3 },
      { daysAgo: 5, count: 5, strengthRange: [0.5, 0.7], dominantCategory: "peace", categoryMix: 0.5 },
      // 中程度の古さのメッセージ（中深度）のクラスター
      { daysAgo: 10, count: 12, strengthRange: [0.6, 0.9], dominantCategory: "inspiration", categoryMix: 0.4 },
      { daysAgo: 15, count: 6, strengthRange: [0.4, 0.65], dominantCategory: "nostalgia", categoryMix: 0.6 },
      // 古いメッセージ（深い深度）のクラスター
      { daysAgo: 30, count: 10, strengthRange: [0.7, 0.95], dominantCategory: "stress", categoryMix: 0.3 },
      { daysAgo: 45, count: 7, strengthRange: [0.5, 0.75], dominantCategory: "sadness", categoryMix: 0.4 },
      // さらに古いメッセージ（非常に深い深度）のクラスター
      { daysAgo: 60, count: 9, strengthRange: [0.3, 0.6], dominantCategory: "confusion", categoryMix: 0.5 },
      { daysAgo: 90, count: 4, strengthRange: [0.4, 0.7], categoryMix: 1.0 }, // 全カテゴリ均等
    ];

    let messageIndex = 0;

    // 各クラスターにオブジェクトを配置
    clusters.forEach((cluster) => {
      const daySpread = 1 + Math.random() * 2; // クラスターの広がり（1-3日）
      
      for (let i = 0; i < cluster.count; i++) {
        // クラスター中心の周辺に配置（±daySpread日の範囲）
        const dayOffset = (Math.random() - 0.5) * daySpread * 2;
        const daysAgo = cluster.daysAgo + dayOffset;
        
        // 過去の日時を計算
        const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        
        // 感情カテゴリを決定
        let category: typeof categories[number];
        if (cluster.dominantCategory && Math.random() > cluster.categoryMix) {
          // dominantCategoryを使用
          category = cluster.dominantCategory;
        } else {
          // ランダムに選択
          category = categories[Math.floor(Math.random() * categories.length)];
        }
        
        const categoryMessages = messages[category];
        const message = categoryMessages[messageIndex % categoryMessages.length];
        
        // 強度をクラスターの範囲内でランダムに決定
        const strength = cluster.strengthRange[0] + 
          Math.random() * (cluster.strengthRange[1] - cluster.strengthRange[0]);
        
        testData.push({
          message,
          category,
          strength: Math.round(strength * 100) / 100, // 小数点第2位まで
          analysis: `${category}の感情表現`,
          created_at: createdAt.toISOString(), // created_atを指定
        });
        
        messageIndex++;
      }
    });

    // 疎らな日時にも少数のオブジェクトを配置（クラスター間の空白を埋める）
    const sparseDaysAgo = [7, 20, 25, 35, 50, 70, 80, 100];
    sparseDaysAgo.forEach((daysAgo) => {
      // 各疎らな日時に1-2個のオブジェクトを配置
      const count = Math.random() > 0.5 ? 1 : 2;
      
      for (let i = 0; i < count; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const categoryMessages = messages[category];
        const message = categoryMessages[messageIndex % categoryMessages.length];
        
        // 疎らな日時は弱めの強度
        const strength = 0.3 + Math.random() * 0.4; // 0.3-0.7
        
        // 過去の日時を計算（±2日の範囲）
        const dayOffset = (Math.random() - 0.5) * 4;
        const createdAt = new Date(now.getTime() - (daysAgo + dayOffset) * 24 * 60 * 60 * 1000);
        
        testData.push({
          message,
          category,
          strength: Math.round(strength * 100) / 100,
          analysis: `${category}の感情表現`,
          created_at: createdAt.toISOString(), // created_atを指定
        });
        
        messageIndex++;
      }
    });

    // created_at順にソート（古いものから新しいものへ）
    testData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // 既存のテストデータを削除（オプション）
    const { error: deleteError } = await supabase
      .from("strata_objects")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.warn("既存データの削除エラー（無視）:", deleteError);
    }

    // テストデータを一括挿入
    const { data, error } = await supabase
      .from("strata_objects")
      .insert(
        testData.map((item) => ({
          user_id: user.id,
          ...item,
        }))
      )
      .select();

    if (error) {
      console.error("テストデータ挿入エラー:", error);
      return NextResponse.json(
        { error: "テストデータの作成に失敗しました", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `${testData.length}件のテストデータを作成しました`,
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("予期しないエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

