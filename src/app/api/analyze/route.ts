import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export interface EmotionAnalysis {
  category: "joy" | "peace" | "stress" | "sadness" | "inspiration" | "nostalgia" | "confusion";
  strength: number;
  analysis: string;
}

/**
 * メッセージの感情を解析するAPI Route Handler
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "メッセージが提供されていません" },
        { status: 400 }
      );
    }

    // 環境変数からAPIキーを取得
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEYが設定されていません");
      return NextResponse.json(
        { error: "APIキーが設定されていません" },
        { status: 500 }
      );
    }

    // Google Generative AIを初期化
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // プロンプトを作成
    const prompt = `以下のメッセージの感情を解析してください。

メッセージ: "${message}"

以下のJSON形式で返答してください。analysisは15文字以内で簡潔に記述してください。

{
  "category": "joy" | "peace" | "stress" | "sadness" | "inspiration" | "nostalgia" | "confusion" のいずれか,
  "strength": 0.0 から 1.0 の数値,
  "analysis": "15文字以内の短い解析理由"
}

重要: JSONのみを返答してください。説明や追加のテキスト、マークダウン記号は一切含めないでください。純粋なJSONオブジェクトのみを返してください。`;

    // Gemini 2.0 Flashを使用
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSONを抽出（```json```で囲まれている可能性がある）
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // JSONをパース
    const analysis: EmotionAnalysis = JSON.parse(jsonText);

    // バリデーション
    const validCategories = [
      "joy",
      "peace",
      "stress",
      "sadness",
      "inspiration",
      "nostalgia",
      "confusion",
    ];

    if (!validCategories.includes(analysis.category)) {
      return NextResponse.json(
        { error: "無効な感情カテゴリが返されました" },
        { status: 500 }
      );
    }

    if (
      typeof analysis.strength !== "number" ||
      analysis.strength < 0 ||
      analysis.strength > 1
    ) {
      return NextResponse.json(
        { error: "無効な強度値が返されました" },
        { status: 500 }
      );
    }

    if (
      !analysis.analysis ||
      typeof analysis.analysis !== "string" ||
      analysis.analysis.length > 15
    ) {
      return NextResponse.json(
        { error: "無効な解析理由が返されました" },
        { status: 500 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("感情解析エラー:", error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "APIからの応答の解析に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "感情解析中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

