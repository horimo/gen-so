# GEN-SO（言層）

ユーザーの言葉やライフログを、3D空間上の「地層（Strata）」として視覚化する没入型アート作品。

## 📋 目次

- [プロジェクト概要](#プロジェクト概要)
- [技術スタック](#技術スタック)
- [機能一覧](#機能一覧)
- [デプロイ](#デプロイ)
- [セットアップ手順](#セットアップ手順)
- [プロジェクト構造](#プロジェクト構造)
- [主要機能の説明](#主要機能の説明)
- [開発ガイド](#開発ガイド)

## 🎨 プロジェクト概要

GEN-SO（言層）は、ユーザーの感情を3D空間上に「地層」として刻み、時間の深さを視覚的に体験できるアート作品です。スクロールで過去へ潜り、自分の感情の層を探索できます。

### 設計思想

- **垂直軸の移動**: y軸（マイナス方向）を時間軸の深さとする。スクロールで過去へ潜る。
- **幻想的な質感**: 無機質なツールではなく、Geminiの感性を通じた「秘密基地」のような情緒的な演出を行う。
- **動的環境**: ユーザーの感情や外部データ（カレンダー等）で、光、霧、植物の形状が変化する。

## 🛠 技術スタック

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **3D Engine**: React Three Fiber (R3F), @react-three/drei, Three.js
- **Animation**: Framer Motion
- **AI**: Gemini 2.0 Flash (API接続)
- **Database**: Supabase (PostgreSQL + Row Level Security)
- **State Management**: Zustand
- **Authentication**: Supabase Auth

## ✨ 機能一覧

### 認証機能
- ✅ メールアドレス/パスワードによるログイン・新規登録
- ✅ ログイン状態の管理（AuthContext）
- ✅ ログアウト機能

### 3Dシーン機能
- ✅ 無限垂直移動（スクロール/スワイプで深度を移動）
- ✅ 深度に応じた背景色のグラデーション（紺→黒）
- ✅ 指数関数的なフォグ（FogExp2）による幻想的な霧の演出
- ✅ 星屑や光の粒（Sparkles）によるスピード感の演出

### 感情解析機能
- ✅ Gemini 2.0 Flashによる感情解析
- ✅ 7種類の感情カテゴリ（joy, peace, stress, sadness, inspiration, nostalgia, confusion）
- ✅ 感情の強度（0.0-1.0）と解析理由の取得

### 3Dオブジェクト生成
- ✅ 感情マッピング定義に基づく3Dオブジェクトの生成
  - **joy**: 球体 / ゴールド / 跳ねる
  - **stress**: 鋭い多面体 / 赤・紫 / 震える
  - **sadness**: 滴型 / 紺色 / 透過・沈降
  - **peace**: 有機的曲線 / 青緑 / 膨張収縮
  - **inspiration**: 幾何学模様 / 虹色 / 回転
  - **nostalgia**: 雲状 / セピア / 浮遊
  - **confusion**: 歪んだメッシュ / 濁った緑 / 不規則移動
- ✅ Emissive効果による発光
- ✅ 深度に応じた位置配置

### データベース連携
- ✅ 言層（Strata）の保存・取得
- ✅ Row Level Security (RLS)によるデータ保護
- ✅ 画面リロード時の状態復元

### ソーシャル機能
- ✅ 他者の存在を「遠くの光」として表示
- ✅ 同じ深度にいる他者の気配を感じる演出
- ✅ プライバシー保護（メッセージ内容は非表示）

### UI/UX
- ✅ ガラスモフィズムデザイン
- ✅ 深度インジケーター（リアルタイム表示）
- ✅ 浮遊チャットUI
- ✅ スマホ対応（レスポンシブデザイン、タッチ操作）

## 🚀 セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Gemini APIキーの取得
1. https://aistudio.google.com/app/apikey にアクセス
2. APIキーを取得して`.env.local`に設定

#### Supabaseの設定
1. https://supabase.com でプロジェクトを作成
2. 「Settings」→「API」から以下を取得：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. データベースのセットアップ

Supabaseダッシュボードの「SQL Editor」で以下のSQLを実行してください：

```sql
-- テーブル作成とRLS設定
-- 詳細は supabase/migrations/001_create_strata_objects.sql を参照
```

詳細な手順は `README_DATABASE.md` を参照してください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセスしてください。

## 📁 プロジェクト構造

```
gen-so/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/          # 感情解析API
│   │   │   ├── strata/           # 言層データAPI
│   │   │   │   └── others/       # 他者の言層データAPI
│   │   │   └── test-data/        # テストデータ作成API
│   │   ├── auth/
│   │   │   └── callback/         # OAuth認証コールバック
│   │   ├── globals.css           # グローバルスタイル
│   │   ├── layout.tsx            # ルートレイアウト
│   │   └── page.tsx              # トップページ
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── emotions/         # 感情別3Dコンポーネント
│   │   │   │   ├── JoyEmotion.tsx
│   │   │   │   ├── StressEmotion.tsx
│   │   │   │   ├── SadnessEmotion.tsx
│   │   │   │   ├── PeaceEmotion.tsx
│   │   │   │   ├── InspirationEmotion.tsx
│   │   │   │   ├── NostalgiaEmotion.tsx
│   │   │   │   ├── ConfusionEmotion.tsx
│   │   │   │   └── EmotionObject.tsx
│   │   │   ├── DepthCanvas.tsx   # メインCanvasコンポーネント
│   │   │   ├── Scene.tsx         # 3Dシーン
│   │   │   └── OthersLight.tsx   # 他者の光
│   │   └── ui/
│   │       ├── DepthIndicator.tsx # 深度インジケーター
│   │       ├── FloatingChat.tsx   # 浮遊チャットUI
│   │       └── LoginGate.tsx       # ログイン画面
│   ├── contexts/
│   │   └── AuthContext.tsx         # 認証コンテキスト
│   ├── hooks/
│   │   ├── useDepth.ts            # 深度管理フック
│   │   └── useSmoothDepth.ts      # 滑らかな深度更新フック
│   ├── lib/
│   │   ├── supabase/              # Supabaseクライアント
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── api.ts                 # 感情解析APIクライアント
│   │   ├── api-strata.ts          # 言層データAPIクライアント
│   │   ├── api-test-data.ts       # テストデータAPIクライアント
│   │   └── utils.ts               # ユーティリティ関数
│   └── store/
│       ├── useEmotionStore.ts     # 感情オブジェクト管理
│       └── useMessageStore.ts    # メッセージ管理
├── supabase/
│   └── migrations/                # データベースマイグレーション
├── .cursorrules                   # プロジェクトルール
├── .env.local                     # 環境変数（gitignore）
└── README.md                      # このファイル
```

## 🎯 主要機能の説明

### 深度システム

- **深度（depth）**: y座標のマイナス方向が時間の深さを表す
- **スクロール/スワイプ**: マウスホイールやタッチ操作で深度を移動
- **背景色**: 深度0（地上）は紺色、深度1000+（深淵）は黒へグラデーション
- **フォグ**: 深く潜るほど視界が幻想的に霞む（指数関数的）

### 感情マッピング

各感情カテゴリは、.cursorrulesで定義された形状・色・動きで3D空間に表現されます：

| 感情 | 形状 | 色 | 動き |
|------|------|-----|------|
| joy | 球体 | ゴールド | 跳ねる |
| stress | 鋭い多面体 | 赤・紫 | 震える |
| sadness | 滴型 | 紺色 | 透過・沈降 |
| peace | 有機的曲線 | 青緑 | 膨張収縮 |
| inspiration | 幾何学模様 | 虹色 | 回転 |
| nostalgia | 雲状 | セピア | 浮遊 |
| confusion | 歪んだメッシュ | 濁った緑 | 不規則移動 |

### データベース構造

`strata_objects`テーブル：

- `id`: UUID（主キー）
- `user_id`: UUID（外部キー、auth.users参照）
- `message`: TEXT（メッセージ内容）
- `category`: TEXT（感情カテゴリ）
- `strength`: NUMERIC(3,2)（強度 0.0-1.0）
- `depth_y`: NUMERIC(10,2)（深度）
- `analysis`: TEXT（解析理由）
- `created_at`: TIMESTAMP（作成日時）

### セキュリティ

- **Row Level Security (RLS)**: ユーザーは自分のデータのみアクセス可能
- **認証チェック**: すべてのAPI Route Handlerで認証を確認
- **プライバシー保護**: 他者のメッセージ内容は表示しない

## 🧪 テストデータの作成

開発環境では、画面右上の「テストデータ作成」ボタンからテストデータを作成できます。

または、APIを直接呼び出すこともできます：

```bash
curl -X POST http://localhost:3000/api/test-data \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie"
```

## 📱 スマホ対応

- **レスポンシブデザイン**: チャット欄と深度インジケーターが画面内に収まる
- **タッチ操作**: 上下スワイプで深度を移動
- **最適化**: `touch-action: pan-y`でタッチ操作を最適化

## 🎨 デザイン原則

- **ガラスモフィズム**: 透過、ぼかし、柔らかな発光
- **色調**: ネオン、パステル、深い深海の色調
- **UIとCanvasの分離**: HTML UIは`fixed`や`absolute`でCanvasの上に重ねる
- **パフォーマンス**: `useFrame`内での`setState`は避け、`ref`を使用

## 🔧 開発ガイド

### 新しい感情カテゴリの追加

1. `.cursorrules`の感情マッピング定義に追加
2. `src/components/canvas/emotions/`に新しいコンポーネントを作成
3. `src/components/canvas/emotions/EmotionObject.tsx`にケースを追加
4. `src/app/api/analyze/route.ts`のバリデーションに追加

### カスタムフックの追加

`src/hooks/`ディレクトリに新しいフックを追加してください。

### ストアの拡張

`src/store/`ディレクトリにZustandストアを追加してください。

## 📝 ライセンス

このプロジェクトはハッカソン用に作成されました。

## 🙏 謝辞

- React Three Fiberコミュニティ
- Supabaseチーム
- Google Gemini API

---

**GEN-SO（言層）** - 言葉を地層として刻む、没入型アート体験

