import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export interface StrataObject {
  id?: string;
  user_id: string;
  message: string;
  category: "joy" | "peace" | "stress" | "sadness" | "inspiration" | "nostalgia" | "confusion";
  strength: number;
  depth_y?: number; // オプショナル（created_atから計算される）
  analysis?: string;
  created_at?: string;
}

/**
 * 言層（Strata）オブジェクトを取得するAPI Route Handler
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

    // ユーザーの言層オブジェクトを取得
    const { data, error } = await supabase
      .from("strata_objects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

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

/**
 * 言層（Strata）オブジェクトを保存するAPI Route Handler
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

    const body = await request.json();
    const { message, category, strength, analysis } = body;

    // バリデーション
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "メッセージが提供されていません" },
        { status: 400 }
      );
    }

    if (
      !category ||
      !["joy", "peace", "stress", "sadness", "inspiration", "nostalgia", "confusion"].includes(
        category
      )
    ) {
      return NextResponse.json(
        { error: "無効な感情カテゴリです" },
        { status: 400 }
      );
    }

    if (
      typeof strength !== "number" ||
      strength < 0 ||
      strength > 1
    ) {
      return NextResponse.json(
        { error: "無効な強度値です" },
        { status: 400 }
      );
    }

    // データベースに保存（depth_yはcreated_atから自動計算されるため、保存しない）
    const { data, error } = await supabase
      .from("strata_objects")
      .insert({
        user_id: user.id,
        message,
        category,
        strength,
        analysis: analysis || null,
      })
      .select()
      .single();

    if (error) {
      console.error("データ保存エラー:", error);
      return NextResponse.json(
        { error: "データの保存に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("予期しないエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

