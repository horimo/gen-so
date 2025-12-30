import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

/**
 * 他者の言層（Strata）オブジェクトを取得するAPI Route Handler
 * メッセージ内容は除外し、深度、カテゴリ、強度のみを返す
 */
export async function GET(request: NextRequest) {
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

    // クエリパラメータから深度範囲を取得（オプション）
    const { searchParams } = new URL(request.url);
    const minDepth = searchParams.get("min_depth");
    const maxDepth = searchParams.get("max_depth");

    // 自分以外のユーザーの言層オブジェクトを取得
    // メッセージとanalysisは除外し、深度、カテゴリ、強度のみを返す
    let query = supabase
      .from("strata_objects")
      .select("depth_y, category, strength, created_at")
      .neq("user_id", user.id); // 自分のデータは除外

    // 深度範囲でフィルタリング（指定されている場合）
    if (minDepth) {
      query = query.gte("depth_y", parseFloat(minDepth));
    }
    if (maxDepth) {
      query = query.lte("depth_y", parseFloat(maxDepth));
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("データ取得エラー:", error);
      return NextResponse.json(
        { error: "データの取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("予期しないエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

