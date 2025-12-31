# PixiJS統合計画

## 📋 概要

複雑な図形描画とUI全体のドット絵化を実現するため、PixiJSを導入します。

## 🎯 なぜPixiJSか？

### 要件
1. **複雑な図形の描画**: 星形、ダイヤモンド、滴型、六角形など
2. **UI全体のドット絵化**: ボタン、メニュー、深度メーターなど
3. **将来的な拡張性**: アニメーション、エフェクト、パーティクルなど

### PixiJSの利点
- ✅ **高パフォーマンス**: WebGLを使用した高速レンダリング
- ✅ **豊富な機能**: スプライト、フィルター、アニメーション、パーティクル
- ✅ **React統合**: `@pixi/react`でReactコンポーネントとして使用可能
- ✅ **ドット絵対応**: `pixi-filters`のピクセル化フィルター
- ✅ **スケーラブル**: 小規模から大規模まで対応
- ✅ **コミュニティ**: 豊富なドキュメントとサンプル

## 📦 必要なパッケージ

```json
{
  "dependencies": {
    "pixi.js": "^8.0.0",
    "@pixi/react": "^8.0.0",
    "pixi-filters": "^5.1.1"
  }
}
```

## 🏗 アーキテクチャ

### ディレクトリ構造

```
src/
├── lib/
│   └── pixi/
│       ├── PixelArtRenderer.tsx      # PixiJSアプリケーションラッパー
│       ├── PixelSprite.tsx          # ドット絵スプライトコンポーネント
│       ├── PixelUI.tsx              # ドット絵UIコンポーネント
│       ├── shapes/                  # 形状描画ユーティリティ
│       │   ├── drawStar.ts
│       │   ├── drawDiamond.ts
│       │   ├── drawDrop.ts
│       │   ├── drawHexagon.ts
│       │   └── ...
│       ├── filters/                 # ピクセル化フィルター
│       │   └── pixelateFilter.ts
│       └── utils/
│           ├── colorPalette.ts      # ドット絵用カラーパレット
│           └── pixelRenderer.ts    # 描画ロジック
├── components/
│   ├── canvas/
│   │   └── Scene2D.tsx              # PixiJSを使用した2Dシーン
│   └── ui/
│       ├── DepthIndicator.tsx       # ドット絵風深度メーター
│       ├── EmotionDetailModal.tsx   # ドット絵風モーダル
│       └── ...
```

## 🛠 実装計画

### Phase 1: PixiJSの導入と基本設定

1. **パッケージインストール**
   ```bash
   npm install pixi.js @pixi/react pixi-filters
   ```

2. **PixelArtRendererコンポーネントの作成**
   - PixiJSアプリケーションの初期化
   - ピクセル化フィルターの設定
   - React統合

3. **基本的な形状描画関数の作成**
   - 星形、ダイヤモンド、滴型など
   - 低解像度で描画 → 拡大表示

### Phase 2: 感情オブジェクトのドット絵化

1. **PixelSpriteコンポーネントの作成**
   - 各感情カテゴリのスプライト生成
   - アニメーション対応

2. **Scene2Dの置き換え**
   - HTML/CSSからPixiJSに移行
   - 感情オブジェクトをPixelSpriteで表示

### Phase 3: UI全体のドット絵化

1. **PixelUIコンポーネントの作成**
   - ボタン、メニュー、モーダルなど
   - ドット絵風のスタイリング

2. **既存UIコンポーネントの置き換え**
   - DepthIndicator
   - EmotionDetailModal
   - その他のUI要素

### Phase 4: 最適化と拡張

1. **パフォーマンス最適化**
   - スプライトのバッチ処理
   - テクスチャキャッシュ
   - 描画範囲の最適化

2. **エフェクトの追加**
   - パーティクルシステム
   - 発光エフェクト
   - アニメーション

## 💡 実装のポイント

### 1. ピクセル化フィルター

```typescript
import { PixelateFilter } from 'pixi-filters';

const pixelateFilter = new PixelateFilter(4); // 4x4ピクセル単位
app.stage.filters = [pixelateFilter];
```

### 2. 低解像度描画 → 拡大

```typescript
// 内部解像度: 16x16px
const internalSize = 16;
const scale = 4; // 表示倍率
const displaySize = internalSize * scale; // 64px

// 低解像度で描画
const graphics = new Graphics();
graphics.scale.set(scale);
// ... 描画処理
```

### 3. カラーパレット

```typescript
const pixelPalette = {
  joy: 0xffd700,      // ゴールド
  peace: 0x4dd0e1,    // 青緑
  stress: 0xff1744,   // 赤
  // ...
};
```

### 4. React統合

```typescript
import { Stage, Sprite } from '@pixi/react';

<Stage>
  <Sprite texture={pixelTexture} x={100} y={100} />
</Stage>
```

## 📊 パフォーマンス考慮事項

### 最適化手法

1. **スプライトバッチング**: 同じテクスチャのスプライトをまとめて描画
2. **テクスチャキャッシュ**: 一度生成したスプライトを再利用
3. **オブジェクトプーリング**: 頻繁に生成/削除されるオブジェクトを再利用
4. **描画範囲の最適化**: 画面外のオブジェクトは描画しない

### 目標パフォーマンス

- **デスクトップ**: 60FPS（1000+スプライト）
- **モバイル**: 30FPS（500+スプライト）

## 🔄 移行戦略

### 段階的移行

1. **Phase 1**: PixiJSの導入と基本設定（既存コードは維持）
2. **Phase 2**: 感情オブジェクトのみPixiJSに移行（並行運用）
3. **Phase 3**: UIコンポーネントを段階的に移行
4. **Phase 4**: 完全移行と最適化

### リスク軽減

- 既存のHTML/CSS実装を残しつつ、段階的に移行
- 機能フラグで切り替え可能にする
- 各フェーズでテストと検証

## ✅ メリット

1. **拡張性**: 将来的な機能追加が容易
2. **パフォーマンス**: WebGLによる高速レンダリング
3. **表現力**: 複雑な図形やエフェクトが可能
4. **一貫性**: UI全体をドット絵スタイルで統一
5. **メンテナンス性**: 標準的なライブラリで保守しやすい

## ⚠️ 注意事項

1. **バンドルサイズ**: PixiJSは約200KB（gzip圧縮後）
2. **学習コスト**: PixiJSのAPIを理解する必要がある
3. **React統合**: `@pixi/react`の使用方法を習得

## 📚 参考リソース

- [PixiJS公式ドキュメント](https://pixijs.com/)
- [@pixi/react](https://github.com/pixijs/pixi-react)
- [pixi-filters](https://github.com/pixijs/filters)

