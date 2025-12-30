# GEN-SO プロジェクト現状まとめ

## 📅 ドキュメント情報

- **作成日**: 2024年12月30日
- **最終更新日**: 2024年12月30日
- **プロジェクトバージョン**: 0.1.0
- **ステータス**: Phase 1-4 実装完了、本番環境準備中

---

## 🎯 プロジェクト概要

GEN-SO（言層）は、ユーザーの言葉やライフログを3D空間上の「地層（Strata）」として視覚化する没入型アート作品です。感情を3Dオブジェクトとして表現し、スクロールで時間の深さを探索できる体験を提供します。

### 設計思想

- **垂直軸の移動**: y軸（マイナス方向）を時間軸の深さとする。スクロールで過去へ潜る。
- **幻想的な質感**: 無機質なツールではなく、Geminiの感性を通じた「秘密基地」のような情緒的な演出を行う。
- **動的環境**: ユーザーの感情や外部データ（カレンダー等）で、光、霧、植物の形状が変化する。

---

## ✅ 実装完了状況

### コア機能（Phase 0）

- ✅ **認証システム**
  - Supabase Authによるメール/パスワード認証
  - ログイン・新規登録・ログアウト機能
  - 認証状態の管理（AuthContext）

- ✅ **3Dシーン基盤**
  - React Three Fiberによる3Dレンダリング
  - 無限垂直移動（スクロール/スワイプで深度移動）
  - 深度に応じた背景色のグラデーション（紺→黒）
  - 指数関数的なフォグ（FogExp2）による幻想的な霧の演出
  - 星屑や光の粒（Sparkles）によるスピード感の演出

- ✅ **感情解析システム**
  - Gemini 2.0 Flashによる感情解析API
  - 7種類の感情カテゴリ（joy, peace, stress, sadness, inspiration, nostalgia, confusion）
  - 感情の強度（0.0-1.0）と解析理由の取得

- ✅ **3D感情オブジェクト**
  - 全7種類の感情タイプに対応した3Dオブジェクト
  - 感情マッピング定義に基づく形状・色・動き
  - Emissive効果による発光
  - 深度に応じた位置配置

- ✅ **データベース連携**
  - Supabase PostgreSQLによるデータ保存
  - Row Level Security (RLS)によるデータ保護
  - 画面リロード時の状態復元

### テラリウム機能（Phase 1-4）

#### Phase 1-1.5: 植物システム ✅

- ✅ **全7種類の植物タイプ**
  - JoyPlant: キラキラした花（球体+トーラス花びら、開花アニメーション）
  - PeacePlant: 苔・シダ（複数のコーン型の葉、ゆっくり揺れる）
  - StressPlant: トゲのある植物（octahedron+複数のコーン、震える動き）
  - SadnessPlant: 透明な水草（複数のシリンダー、透過効果）
  - InspirationPlant: 発光する菌類（複数層のdodecahedron、虹色変化）
  - NostalgiaPlant: 古い木の根（icosahedron、浮遊）
  - ConfusionPlant: 歪んだ植物（tetrahedron、不規則な動き）

- ✅ **植物生成システム**
  - 感情オブジェクトの周囲に自動生成（半径2.0-4.5単位、深度方向にも分散）
  - 感情の強度に応じた植物の数とサイズの調整
  - 成長アニメーション（1-3秒で0.5倍→1.0倍に成長）
  - 揺れ・開花・脈動などの動的アニメーション

#### Phase 2: 生物システム ✅

- ✅ **5種類の浮遊生物**
  - LightButterfly: 光の蝶々（joy/inspirationの周りに出現、羽ばたきアニメーション）
  - WaterBubble: 水の泡（sadness/peaceの周りに出現、ゆっくり上に浮かぶ）
  - EnergyParticle: エネルギーの粒（stress/inspirationの周りに出現、高速回転と脈動）
  - MemoryFragment: 記憶の欠片（nostalgiaの周りに出現、ゆっくり浮遊）
  - LostLight: 迷子の光（confusionの周りに出現、不規則な動き）

- ✅ **生物行動システム**
  - 感情オブジェクトへの反応（引力/反発）
  - 群れ行動とランダムウォーク
  - 感情の分布に応じた生物の生成数調整

#### Phase 3: 環境の動的反応 ✅

- ✅ **動的ライティング**
  - joy/inspirationが多い: 明るく暖色の光（#fff4e6）
  - sadnessが多い: 暗く青みがかった光（#e6e6ff）
  - stressが多い: 点滅する赤みがかった光（#ffe6e6）
  - peaceが多い: 柔らかな青白の光（#e6f3ff）

- ✅ **適応的フォグ**
  - 強い感情が多い深度では霧が薄くなる（感情が「空間を切り開く」）
  - 感情オブジェクトが少ない深度では霧が濃くなる

- ✅ **背景色の感情反映**
  - 深度ベースの基本色に、感情の分布を20%反映
  - 各感情タイプの色が背景に混ざる

#### Phase 4: インタラクション機能 ✅

- ✅ **ホバー/タッチ反応**
  - 感情オブジェクトにマウスを近づけるとスケールが1.2倍に拡大
  - レイキャストによる正確な検出

- ✅ **感情オブジェクトの詳細表示**
  - クリック/タップで詳細モーダルを表示
  - メッセージ内容、解析理由、作成日時、深度情報を表示
  - ESCキーで閉じる

- ✅ **深度マップ**
  - 深度メーターをタップで深度マップを表示
  - 実際にオブジェクトが存在する深度のみを表示（10単位でグループ化）
  - オブジェクト数に応じてバーの太さ（20-100px）と色（青→緑→赤）が変化
  - クリックでその深度にスムーズにジャンプ

- ✅ **深度ジャンプ機能**
  - スムーズなアニメーション（1秒、easeInOutCubic）
  - ジャンプ後のスクロール位置を正しく維持（ジャンプ中フラグで制御）

### UI/UX機能

- ✅ **ガラスモフィズムデザイン**
  - 透過、ぼかし、柔らかな発光を多用
  - ネオン、パステル、深い深海の色調

- ✅ **深度インジケーター**
  - リアルタイム深度表示
  - タップで深度マップ表示

- ✅ **浮遊チャットUI**
  - メッセージ入力と送信
  - 感情解析結果の表示

- ✅ **テラリウム感のあるローディング画面**
  - 成長する植物アニメーション（茎、葉、花）
  - 光る粒子のアニメーション

- ✅ **スマホ対応**
  - レスポンシブデザイン
  - タッチ操作（上下スワイプで深度移動）
  - `touch-action: pan-y`でタッチ操作を最適化

### ソーシャル機能

- ✅ **他者の存在表示**
  - 他者の存在を「遠くの光」として表示
  - 同じ深度にいる他者の気配を感じる演出
  - プライバシー保護（メッセージ内容は非表示）

---

## 🛠 技術スタック

### フロントエンド

- **Next.js**: 14.2.0 (App Router)
- **React**: 18.3.1
- **TypeScript**: 5.5.4
- **Tailwind CSS**: 3.4.7

### 3Dレンダリング

- **React Three Fiber**: 8.17.10
- **@react-three/drei**: 9.114.0
- **Three.js**: 0.169.0

### アニメーション

- **Framer Motion**: 11.5.4

### AI・データベース

- **Google Gemini API**: 2.0 Flash (@google/generative-ai: 0.24.1)
- **Supabase**: 
  - @supabase/supabase-js: 2.89.0
  - @supabase/ssr: 0.8.0

### 状態管理

- **Zustand**: 5.0.9

### UIライブラリ

- **lucide-react**: 0.445.0 (アイコン)
- **clsx**: 2.1.1 (クラス名ユーティリティ)
- **tailwind-merge**: 2.5.4 (Tailwindクラスマージ)

---

## 📁 プロジェクト構造

```
gen-so/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/                    # API Routes
│   │   │   ├── analyze/            # 感情解析API
│   │   │   ├── strata/             # 言層データAPI
│   │   │   │   └── others/         # 他者の言層データAPI
│   │   │   └── test-data/          # テストデータ作成API
│   │   ├── auth/
│   │   │   └── callback/           # OAuth認証コールバック
│   │   ├── globals.css             # グローバルスタイル
│   │   ├── layout.tsx              # ルートレイアウト
│   │   └── page.tsx                # トップページ
│   ├── components/
│   │   ├── canvas/                 # 3D Canvasコンポーネント
│   │   │   ├── emotions/           # 感情別3Dコンポーネント
│   │   │   │   ├── JoyEmotion.tsx
│   │   │   │   ├── StressEmotion.tsx
│   │   │   │   ├── SadnessEmotion.tsx
│   │   │   │   ├── PeaceEmotion.tsx
│   │   │   │   ├── InspirationEmotion.tsx
│   │   │   │   ├── NostalgiaEmotion.tsx
│   │   │   │   ├── ConfusionEmotion.tsx
│   │   │   │   └── EmotionObject.tsx
│   │   │   ├── ecosystem/          # 生態系コンポーネント
│   │   │   │   ├── PlantSystem.tsx
│   │   │   │   ├── JoyPlant.tsx
│   │   │   │   ├── PeacePlant.tsx
│   │   │   │   ├── StressPlant.tsx
│   │   │   │   ├── SadnessPlant.tsx
│   │   │   │   ├── InspirationPlant.tsx
│   │   │   │   ├── NostalgiaPlant.tsx
│   │   │   │   ├── ConfusionPlant.tsx
│   │   │   │   ├── CreatureSystem.tsx
│   │   │   │   ├── LightButterfly.tsx
│   │   │   │   ├── WaterBubble.tsx
│   │   │   │   ├── EnergyParticle.tsx
│   │   │   │   ├── MemoryFragment.tsx
│   │   │   │   └── LostLight.tsx
│   │   │   ├── DepthCanvas.tsx     # メインCanvasコンポーネント
│   │   │   ├── Scene.tsx           # 3Dシーン
│   │   │   └── OthersLight.tsx     # 他者の光
│   │   └── ui/                     # UIコンポーネント
│   │       ├── DepthIndicator.tsx
│   │       ├── FloatingChat.tsx
│   │       ├── LoginGate.tsx
│   │       ├── TerrariumLoader.tsx
│   │       ├── EmotionDetailModal.tsx
│   │       └── EmotionDepthMap.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx         # 認証コンテキスト
│   ├── hooks/
│   │   ├── useDepth.ts             # 深度管理フック（ジャンプ機能付き）
│   │   └── useSmoothDepth.ts       # 滑らかな深度更新フック
│   ├── lib/
│   │   ├── supabase/               # Supabaseクライアント
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── api.ts                  # 感情解析APIクライアント
│   │   ├── api-strata.ts           # 言層データAPIクライアント
│   │   ├── api-test-data.ts        # テストデータAPIクライアント
│   │   └── utils.ts                # ユーティリティ関数
│   └── store/                      # Zustandストア
│       ├── useEmotionStore.ts      # 感情オブジェクト管理
│       ├── useMessageStore.ts      # メッセージ管理
│       └── useInteractionStore.ts  # インタラクション状態管理
├── supabase/
│   └── migrations/                 # データベースマイグレーション
├── docs/                           # ドキュメント
│   ├── FEATURE_DESIGN.md           # テラリウム機能の詳細設計
│   ├── IMPLEMENTATION_STATUS.md    # 実装状況と技術詳細
│   ├── PROJECT_STATUS.md           # このファイル
│   ├── README_DATABASE.md          # データベース構造とセットアップ
│   ├── DEPLOY.md                   # デプロイ手順
│   └── DEPLOY_CHECKLIST.md         # デプロイ前チェックリスト
├── .cursorrules                    # プロジェクトルール
├── .env.local                      # 環境変数（gitignore）
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── README.md                       # プロジェクト概要
```

---

## 🏗 アーキテクチャ概要

### データフロー

1. **ユーザー入力** → FloatingChatコンポーネント
2. **感情解析** → `/api/analyze` → Gemini API
3. **データ保存** → `/api/strata` → Supabase
4. **状態更新** → useEmotionStore (Zustand)
5. **3Dレンダリング** → Scene.tsx → 感情オブジェクト + 生態系

### 状態管理

- **useEmotionStore**: 感情オブジェクトの一覧と操作
- **useMessageStore**: メッセージ入力と送信状態
- **useInteractionStore**: インタラクション状態（選択中のオブジェクト、深度マップ表示など）
- **AuthContext**: 認証状態の管理

### 3Dレンダリング

- **DepthCanvas**: メインCanvasコンポーネント、深度管理
- **Scene**: 3Dシーンのルート、環境設定（ライティング、フォグ、背景）
- **EmotionObject**: 感情オブジェクトのファクトリー
- **PlantSystem**: 植物の生成と管理
- **CreatureSystem**: 生物の生成と管理

### パフォーマンス最適化

- **Frustum Culling**: 現在の深度±500の範囲内のオブジェクトのみを描画
- **シードベースの疑似乱数**: 一貫性のある植物/生物の配置
- **useMemo**: 計算結果のメモ化
- **useRef**: useFrame内での直接的な値の更新（setStateを避ける）

---

## 📊 実装統計

### コンポーネント数

- **感情オブジェクト**: 7種類
- **植物コンポーネント**: 7種類
- **生物コンポーネント**: 5種類
- **UIコンポーネント**: 6種類
- **合計**: 25種類以上のコンポーネント

### ストア・フック

- **Zustandストア**: 3種類
- **カスタムフック**: 2種類
- **React Context**: 1種類

### API Routes

- **感情解析API**: `/api/analyze`
- **言層データAPI**: `/api/strata`
- **他者の言層データAPI**: `/api/strata/others`
- **テストデータ作成API**: `/api/test-data`

---

## 🎨 デザイン原則

### 視覚デザイン

- **ガラスモフィズム**: 透過、ぼかし、柔らかな発光
- **色調**: ネオン、パステル、深い深海の色調
- **UIとCanvasの分離**: HTML UIは`fixed`や`absolute`でCanvasの上に重ねる

### アニメーション

- **成長アニメーション**: 1-3秒で0.5倍→1.0倍に成長
- **揺れアニメーション**: sin波ベースの微風のような動き
- **開花アニメーション**: 4秒周期の脈動
- **深度ジャンプ**: easeInOutCubicイージング関数

### パフォーマンス

- **目標FPS**: 
  - デスクトップ: 60FPS
  - モバイル: 30FPS
- **メモリ使用量**: 
  - デスクトップ: 500MB以下
  - モバイル: 300MB以下

---

## 🔒 セキュリティ

### 認証・認可

- **Supabase Auth**: メール/パスワード認証
- **Row Level Security (RLS)**: ユーザーは自分のデータのみアクセス可能
- **API認証チェック**: すべてのAPI Route Handlerで認証を確認

### プライバシー保護

- **他者のメッセージ内容は非表示**: 他者の存在は「遠くの光」としてのみ表示
- **データベース**: RLSにより、他ユーザーのデータにアクセス不可

---

## 📝 今後の拡張可能性

### Phase 5: 生態系の循環と進化（未実装）

- [ ] 感情の組み合わせ効果（異なる感情が近くにあると新しい植物が生える）
- [ ] 生態系の成熟システム（時間が経つと生態系が「成熟」する）
- [ ] 自己組織化（同じタイプの感情が集まるとエリアが「特化」する）

### Phase 6: 季節・時間帯の演出（未実装）

- [ ] 時間帯による環境変化（朝・昼・夕方・夜）
- [ ] カレンダー連携（季節に応じた植物の色や種類の変化）

### その他の拡張アイデア

- [ ] **音響効果**: 環境音、感情に応じたBGM
- [ ] **AR対応**: スマホのカメラで現実世界に重ねる
- [ ] **共有機能**: 自分のテラリウムをスクリーンショットで共有
- [ ] **カスタマイズ**: 植物の種類や色をユーザーが選べる
- [ ] **AI生成**: Geminiで植物の形状や色を生成

### パフォーマンス最適化

- [ ] **インスタンシング**: 同じ形状の植物をまとめて描画
- [ ] **LOD (Level of Detail)**: 遠くの植物は簡易形状
- [ ] **パーティクルシステム**: 生物をGPU加速のパーティクルで

---

## 🧪 テスト状況

### 実装済み

- ✅ 開発環境での動作確認
- ✅ スマホ対応（レスポンシブデザイン、タッチ操作）
- ✅ パフォーマンステスト（FPS、メモリ使用量）

### 未実装

- [ ] 自動テスト（ユニットテスト、統合テスト）
- [ ] E2Eテスト
- [ ] パフォーマンスベンチマーク

---

## 🚀 デプロイ状況

### 準備中

- [ ] 本番環境のセットアップ
- [ ] 環境変数の設定
- [ ] データベースマイグレーション
- [ ] デプロイ前チェックリストの確認

詳細は `docs/DEPLOY.md` と `docs/DEPLOY_CHECKLIST.md` を参照してください。

---

## 📚 ドキュメント一覧

1. **README.md**: プロジェクト概要、セットアップ手順、機能一覧
2. **docs/FEATURE_DESIGN.md**: テラリウム機能の詳細設計
3. **docs/IMPLEMENTATION_STATUS.md**: 実装状況と技術詳細
4. **docs/PROJECT_STATUS.md**: このファイル（プロジェクトの現在の状態）
5. **docs/README_DATABASE.md**: データベース構造とセットアップ
6. **docs/DEPLOY.md**: デプロイ手順
7. **docs/DEPLOY_CHECKLIST.md**: デプロイ前チェックリスト

---

## 🎯 成功指標

### 実装完了

- ✅ **没入感**: ユーザーが5分以上眺め続けられる体験を実現
- ✅ **発見**: 眺めていると新しい発見がある（植物の成長、生物の行動）
- ✅ **感情との共鳴**: 自分の感情が環境に反映されていると感じる
- ✅ **パフォーマンス**: 60FPSを維持（デスクトップ）、30FPS以上（モバイル）

### 今後の目標

- [ ] **ユーザーエンゲージメント**: 平均セッション時間の向上
- [ ] **パフォーマンス**: より多くのオブジェクトを同時表示
- [ ] **アクセシビリティ**: より多くのユーザーが利用可能

---

## 📞 開発情報

### 開発環境

- **Node.js**: 推奨バージョン（package.jsonを参照）
- **パッケージマネージャー**: npm
- **開発サーバー**: `npm run dev` (http://localhost:3000)

### 必要な環境変数

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

詳細なセットアップ手順は `README.md` を参照してください。

---

**最終更新**: 2024年12月30日
**プロジェクトバージョン**: 0.1.0
**ステータス**: Phase 1-4 実装完了、本番環境準備中

