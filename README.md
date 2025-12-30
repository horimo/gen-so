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

### 🌱 植物生態系（Phase 1-1.5）
- ✅ 全7種類の感情タイプに対応した植物システム
  - **joy**: キラキラした花（球体+トーラス花びら、開花アニメーション）
  - **peace**: 苔・シダ（複数のコーン型の葉、ゆっくり揺れる）
  - **stress**: トゲのある植物（octahedron+複数のコーン、震える動き）
  - **sadness**: 透明な水草（複数のシリンダー、透過効果）
  - **inspiration**: 発光する菌類（複数層のdodecahedron、虹色変化）
  - **nostalgia**: 古い木の根（icosahedron、浮遊）
  - **confusion**: 歪んだ植物（tetrahedron、不規則な動き）
- ✅ 感情オブジェクトの周囲に自動生成（半径2.0-4.5単位、深度方向にも分散）
- ✅ 成長アニメーション（1-3秒で0.5倍→1.0倍に成長）
- ✅ 揺れ・開花・脈動などの動的アニメーション
- ✅ 感情の強度に応じた植物の数とサイズの調整

### 🦋 生物システム（Phase 2）
- ✅ 5種類の浮遊生物
  - **光の蝶々**: joy/inspirationの周りに出現、羽ばたきアニメーション
  - **水の泡**: sadness/peaceの周りに出現、ゆっくり上に浮かぶ
  - **エネルギーの粒**: stress/inspirationの周りに出現、高速回転と脈動
  - **記憶の欠片**: nostalgiaの周りに出現、ゆっくり浮遊
  - **迷子の光**: confusionの周りに出現、不規則な動き
- ✅ 感情オブジェクトへの反応（引力/反発）
- ✅ 群れ行動とランダムウォーク
- ✅ 感情の分布に応じた生物の生成数調整

### 🌊 環境の動的反応（Phase 3）
- ✅ 動的ライティング
  - joy/inspirationが多い: 明るく暖色の光
  - sadnessが多い: 暗く青みがかった光
  - stressが多い: 点滅する赤みがかった光
  - peaceが多い: 柔らかな青白の光
- ✅ 適応的フォグ
  - 強い感情が多い深度では霧が薄くなる（感情が「空間を切り開く」）
  - 感情オブジェクトが少ない深度では霧が濃くなる
- ✅ 背景色の感情反映
  - 深度ベースの基本色に、感情の分布を20%反映
  - 各感情タイプの色が背景に混ざる

### 🌍 地表システム
- ✅ 地表平面の実装
  - 深度0（y=0）に配置される半透明の平面
  - カスタムシェーダーによるガラスモフィズム表現
  - フレネル効果と時間ベースの揺らぎアニメーション
- ✅ 地上と地下の明確な分離
  - 深度0付近での急激な視覚的変化（フォグ、ライティング、背景色）
  - 地上エリア（深度 < 0）: 明るい青空色、薄いフォグ、明るいライティング
  - 地下エリア（深度 > 0）: 深い色、濃いフォグ、暗いライティング
- ✅ 深度インジケーターの拡張
  - 地表の位置（深度0）を表示
  - 現在の深度が「地上」「地表」「地下」かを表示
  - 地表からの距離を表示

### 🎨 インタラクション機能（Phase 4）
- ✅ ホバー/タッチ反応
  - 感情オブジェクトにマウスを近づけるとスケールが1.2倍に拡大
  - レイキャストによる正確な検出
- ✅ 感情オブジェクトの詳細表示
  - クリック/タップで詳細モーダルを表示
  - メッセージ内容、解析理由、作成日時、深度情報を表示
  - ESCキーで閉じる
- ✅ 深度マップ
  - 深度メーターをタップで深度マップを表示
  - 実際にオブジェクトが存在する深度のみを表示
  - オブジェクト数に応じてバーの太さと色が変化
  - クリックでその深度にスムーズにジャンプ
  - **「地上へ戻る」ボタン**（深度0にワンクリックでジャンプ）
- ✅ 深度ジャンプ機能
  - スムーズなアニメーション（1秒、easeInOutCubic）
  - ジャンプ後のスクロール位置を正しく維持

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
- ✅ 深度インジケーター（リアルタイム表示、タップで深度マップ表示）
- ✅ 浮遊チャットUI
- ✅ スマホ対応（レスポンシブデザイン、タッチ操作）
- ✅ テラリウム感のあるローディング画面（成長する植物アニメーション）

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
│   │   │   ├── ecosystem/        # 生態系コンポーネント
│   │   │   │   ├── PlantSystem.tsx      # 植物システム
│   │   │   │   ├── JoyPlant.tsx         # joyの植物
│   │   │   │   ├── PeacePlant.tsx       # peaceの植物
│   │   │   │   ├── StressPlant.tsx      # stressの植物
│   │   │   │   ├── SadnessPlant.tsx     # sadnessの植物
│   │   │   │   ├── InspirationPlant.tsx # inspirationの植物
│   │   │   │   ├── NostalgiaPlant.tsx   # nostalgiaの植物
│   │   │   │   ├── ConfusionPlant.tsx   # confusionの植物
│   │   │   │   ├── CreatureSystem.tsx   # 生物システム
│   │   │   │   ├── LightButterfly.tsx   # 光の蝶々
│   │   │   │   ├── WaterBubble.tsx      # 水の泡
│   │   │   │   ├── EnergyParticle.tsx   # エネルギーの粒
│   │   │   │   ├── MemoryFragment.tsx   # 記憶の欠片
│   │   │   │   └── LostLight.tsx        # 迷子の光
│   │   │   ├── DepthCanvas.tsx   # メインCanvasコンポーネント
│   │   │   ├── Scene.tsx         # 3Dシーン
│   │   │   ├── SurfacePlane.tsx  # 地表平面
│   │   │   └── OthersLight.tsx   # 他者の光
│   │   └── ui/
│   │       ├── DepthIndicator.tsx    # 深度インジケーター
│   │       ├── FloatingChat.tsx      # 浮遊チャットUI
│   │       ├── LoginGate.tsx         # ログイン画面
│   │       ├── TerrariumLoader.tsx   # テラリウムローディング画面
│   │       ├── EmotionDetailModal.tsx # 感情オブジェクト詳細モーダル
│   │       └── EmotionDepthMap.tsx   # 深度マップ
│   ├── contexts/
│   │   └── AuthContext.tsx         # 認証コンテキスト
│   ├── hooks/
│   │   ├── useDepth.ts            # 深度管理フック（ジャンプ機能付き）
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
│       ├── useMessageStore.ts     # メッセージ管理
│       └── useInteractionStore.ts # インタラクション状態管理
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
- **背景色**: 深度0（地上）は紺色、深度1000+（深淵）は黒へグラデーション（感情の分布も反映）
- **フォグ**: 深く潜るほど視界が幻想的に霞む（指数関数的、感情の強度に応じて変化）
- **深度マップ**: 深度メーターをタップすると、実際のオブジェクト位置を可視化したマップを表示
- **深度ジャンプ**: 深度マップ上でクリックすると、その深度にスムーズにジャンプ

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

### 植物生態系

各感情オブジェクトの周囲に、その感情を象徴する植物が自動生成されます：

- **生成ルール**: 感情の強度に応じて2-5個の植物を生成
- **配置**: 感情オブジェクトの周囲、半径2.0-4.5単位の範囲にランダム配置（深度方向にも分散）
- **アニメーション**: 成長、揺れ、開花、脈動などの動的アニメーション
- **視覚効果**: 発光、透過、色の変化など

### 生物システム

感情の分布に応じて、小さな光の生物が浮遊します：

- **生成ルール**: 感情タイプの数に応じて生物を生成（最大100-200個）
- **行動**: ランダムウォーク + 感情オブジェクトへの引力/反発
- **種類**: 光の蝶々、水の泡、エネルギーの粒、記憶の欠片、迷子の光

### 環境の動的反応

感情の分布に応じて、環境が動的に変化します：

- **ライティング**: 感情タイプに応じて光の色と強度が変化
- **フォグ**: 強い感情が多い深度では霧が薄くなる
- **背景色**: 感情の分布が背景色に20%反映される

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

## 📚 ドキュメント

詳細なドキュメントは`docs/`ディレクトリを参照してください：

- **PROJECT_STATUS.md**: プロジェクトの現在の状態まとめ（実装状況、技術スタック、アーキテクチャ）
- **FEATURE_DESIGN.md**: テラリウム機能の詳細設計
- **IMPLEMENTATION_STATUS.md**: 実装状況と技術詳細
- **README_DATABASE.md**: データベース構造とセットアップ
- **DEPLOY.md**: デプロイ手順
- **DEPLOY_CHECKLIST.md**: デプロイ前チェックリスト

## 📝 ライセンス

このプロジェクトはハッカソン用に作成されました。

## 🙏 謝辞

- React Three Fiberコミュニティ
- Supabaseチーム
- Google Gemini API

---

**GEN-SO（言層）** - 言葉を地層として刻む、没入型アート体験

**最終更新**: 2024年12月30日

