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
    const testData = [
      { message: "今日はとても楽しかった！", category: "joy" as const, strength: 0.9, depth_y: 0, analysis: "喜びの表現" },
      { message: "少し疲れたな...", category: "stress" as const, strength: 0.6, depth_y: 100, analysis: "疲労感" },
      { message: "穏やかな気持ち", category: "peace" as const, strength: 0.7, depth_y: 200, analysis: "平穏" },
      { message: "新しいアイデアが浮かんだ", category: "inspiration" as const, strength: 0.8, depth_y: 300, analysis: "創造性" },
      { message: "懐かしい思い出", category: "nostalgia" as const, strength: 0.7, depth_y: 400, analysis: "郷愁" },
      { message: "何か分からない", category: "confusion" as const, strength: 0.5, depth_y: 500, analysis: "混乱" },
      { message: "悲しい気持ち", category: "sadness" as const, strength: 0.6, depth_y: 600, analysis: "悲しみ" },
      { message: "また楽しい日々", category: "joy" as const, strength: 0.85, depth_y: 700, analysis: "喜び" },
      { message: "ストレスが溜まっている", category: "stress" as const, strength: 0.75, depth_y: 800, analysis: "ストレス" },
      { message: "心が落ち着いている", category: "peace" as const, strength: 0.8, depth_y: 900, analysis: "平穏" },
      { message: "インスピレーションが湧いてきた", category: "inspiration" as const, strength: 0.9, depth_y: 1000, analysis: "創造性" },
      { message: "過去を思い出す", category: "nostalgia" as const, strength: 0.65, depth_y: 1100, analysis: "郷愁" },
      { message: "混乱している", category: "confusion" as const, strength: 0.7, depth_y: 1200, analysis: "混乱" },
      { message: "深い悲しみ", category: "sadness" as const, strength: 0.8, depth_y: 1300, analysis: "悲しみ" },
      { message: "最高の気分！", category: "joy" as const, strength: 0.95, depth_y: 1400, analysis: "喜び" },
    ];

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

