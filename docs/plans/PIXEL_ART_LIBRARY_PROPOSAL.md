# ドット絵ライブラリ実装提案

## 📋 概要

2D表示でドット絵風の表現を実現するためのカスタムライブラリを作成します。

## 🎯 実現方法

### Option 1: Canvas API + 低解像度拡大（推奨）

**仕組み:**
- 低解像度（例: 16x16px）でCanvasに描画
- `image-rendering: pixelated`で拡大表示
- ドット絵の質感を自然に再現

**メリット:**
- 軽量で高速
- 完全にカスタマイズ可能
- 既存のReactコンポーネントと統合しやすい

**実装例:**
```typescript
// 低解像度Canvasで描画 → 拡大表示
const pixelSize = 16; // 内部解像度
const scale = 4; // 表示倍率
const displaySize = pixelSize * scale; // 64px
```

### Option 2: 専用ライブラリ（PixiJS）

**ライブラリ:**
- `pixi.js` - 2Dレンダリングエンジン
- `pixi-filters` - ピクセルアート用フィルター

**メリット:**
- 高パフォーマンス
- 豊富な機能

**デメリット:**
- バンドルサイズが増える
- 学習コスト

### Option 3: CSSのみ（シンプル）

**仕組み:**
- CSSの`image-rendering: pixelated`を使用
- SVGやCanvasで描画した画像を拡大

**メリット:**
- 最もシンプル
- 追加ライブラリ不要

**デメリット:**
- 表現力に限界

## 💡 推奨実装: カスタムライブラリ（Option 1）

### アーキテクチャ

```
src/lib/pixel-art/
├── PixelCanvas.tsx        # 低解像度Canvasコンポーネント
├── PixelSprite.tsx        # ドット絵スプライトコンポーネント
├── shapes/                # 形状描画ユーティリティ
│   ├── drawStar.ts        # 星形
│   ├── drawDiamond.ts     # ダイヤモンド
│   ├── drawDrop.ts        # 滴型
│   └── ...
└── utils/
    ├── pixelRenderer.ts   # 描画ロジック
    └── colorPalette.ts    # ドット絵用カラーパレット
```

### 実装のポイント

1. **低解像度描画**
   - 内部Canvas: 16x16px または 32x32px
   - 表示時: `image-rendering: pixelated`で拡大

2. **ドット絵用カラーパレット**
   - 色数を制限（例: 16色）
   - ドット絵らしい色合い

3. **アンチエイリアス無効化**
   - `imageSmoothingEnabled: false`
   - シャープなエッジ

4. **パフォーマンス最適化**
   - 描画結果をキャッシュ
   - 必要時のみ再描画

## 🛠 実装計画

### Phase 1: 基本ライブラリ作成
1. `PixelCanvas`コンポーネントの作成
2. 基本的な形状描画関数（円、四角、星など）
3. カラーパレットの定義

### Phase 2: 感情オブジェクトへの適用
1. 各感情カテゴリのドット絵スプライト作成
2. `EmotionDot2D`を`PixelSprite`に置き換え
3. アニメーション対応

### Phase 3: 最適化
1. 描画キャッシュ
2. パフォーマンス測定と調整

## 📦 依存関係

追加不要（Canvas APIは標準機能）

## ✅ メリット

1. **ドット絵らしさ**: 低解像度拡大で自然なドット感
2. **軽量**: 追加ライブラリ不要
3. **カスタマイズ性**: 完全に制御可能
4. **パフォーマンス**: Canvas APIは高速

