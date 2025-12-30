import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // エラーがある場合、エラーページにリダイレクト
  if (error) {
    const errorMessage = errorDescription || error;
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      );
    }
  }

  // 認証成功後、ホームページにリダイレクト
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}

