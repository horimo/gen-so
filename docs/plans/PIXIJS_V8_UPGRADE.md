# PixiJS v8 アップグレード完了

## 📋 概要

PixiJS v8へのアップグレードと関連パッケージの最適化を完了しました。

## ✅ 実施した変更

### 1. PixiJS v8.14.3へのアップグレード
- **変更前**: `pixi.js@^7.4.3`
- **変更後**: `pixi.js@^8.14.3`
- **理由**: v7の`checkMaxIfStatementsInShader`エラーを解消し、パフォーマンス向上

### 2. pixi-filters v6.1.5へのアップグレード
- **変更前**: `pixi-filters@^5.3.0`
- **変更後**: `pixi-filters@^6.1.5`
- **理由**: PixiJS v8対応版

### 3. @pixi/reactの削除
- **削除理由**: v8はReact 19が必要だが、プロジェクトはReact 18を使用
- **代替**: 直接PixiJSを使用（`Application`を直接操作）

## 🔧 API変更への対応

### Application初期化
**v7以前:**
```typescript
const app = new Application({
  view: canvasRef.current,
  width: 800,
  height: 600,
  // ...
});
```

**v8:**
```typescript
const app = new Application();
await app.init({
  canvas: canvasRef.current,
  width: 800,
  height: 600,
  // ...
});
```

### フィルターの適用
`pixi-filters` v6はPixiJS v8と互換性があります。使用方法は同じです：

```typescript
import { PixelateFilter } from "pixi-filters";

const pixelateFilter = new PixelateFilter(4);
app.stage.filters = [pixelateFilter];
```

## 📦 現在の依存関係

```json
{
  "pixi.js": "^8.14.3",
  "pixi-filters": "^6.1.5"
}
```

## 🎯 メリット

1. **エラー解消**: v7の`checkMaxIfStatementsInShader`エラーが解消
2. **パフォーマンス向上**: v8の最適化により、レンダリング性能が向上
3. **将来性**: 最新バージョンで継続的なサポートと機能追加が期待できる
4. **フィルター対応**: `pixi-filters` v6でPixiJS v8と完全互換

## ⚠️ 注意事項

1. **React統合**: `@pixi/react`は使用していません。直接PixiJSを使用しています。
2. **非同期初期化**: v8では`app.init()`が非同期のため、`async/await`が必要です。
3. **互換性**: 既存のコードはv8のAPIに合わせて更新済みです。

## 📝 次のステップ

1. テストページ（`/test/pixi`）で動作確認
2. Phase 2（感情オブジェクトのドット絵化）の実装開始
3. 必要に応じて、他のパッケージの更新も検討

