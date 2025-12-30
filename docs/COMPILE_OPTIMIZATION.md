# コンパイル最適化

## 概要
クライアント側のコンパイル待ち時間を短縮し、ユーザー体験を向上させるための最適化戦略。

## 実装内容

### 1. ローディング画面の改善

#### loading.tsx
Next.jsのルートレベルのローディング画面を作成。コンパイル中や初期ロード中に`TerrariumLoader`を表示。

```typescript
import { TerrariumLoader } from "@/components/ui/TerrariumLoader";

export default function Loading() {
  return <TerrariumLoader />;
}
```

#### layout.tsx
ルートレイアウトに`Suspense`を追加し、認証プロバイダーの読み込み中にもローディング画面を表示。

### 2. 動的インポートによる遅延読み込み

#### DepthCanvas.tsx
`Scene2DPixi`を動的インポートで遅延読み込みし、初期バンドルサイズを削減。

```typescript
const Scene2DPixi = dynamic(
  () => import("./Scene2DPixi").then((mod) => mod.Scene2DPixi),
  { ssr: false, loading: () => <TerrariumLoader /> }
);
```

#### page.tsx
`LoginGate`も動的インポートで遅延読み込みし、初期バンドルをさらに削減。

```typescript
const LoginGate = dynamic(
  () => import("@/components/ui/LoginGate").then((mod) => ({ default: mod.LoginGate })),
  { ssr: false, loading: () => <TerrariumLoader /> }
);
```

### 3. Next.js設定の最適化

#### next.config.mjs

**コード分割の最適化:**
- PixiJSとThree.jsを別チャンクに分離
- 優先度を設定して適切な分割を実現

**開発環境の最適化:**
- ファイルシステムキャッシュを有効化（`cache: { type: "filesystem" }`）
- `onDemandEntries`でメモリ使用量を削減
  - `maxInactiveAge: 25 * 1000`（25秒）
  - `pagesBufferLength: 2`（2ページまで保持）

**パッケージインポートの最適化:**
- `optimizePackageImports`でPixiJS、pixi-filters、Three.jsを最適化

```javascript
experimental: {
  optimizePackageImports: ["pixi.js", "pixi-filters", "three"],
},
webpack: (config, { isServer, dev }) => {
  if (!isServer) {
    // コード分割の最適化
    config.optimization.splitChunks = {
      cacheGroups: {
        pixi: {
          test: /[\\/]node_modules[\\/](pixi\.js|pixi-filters)[\\/]/,
          name: "pixi",
          chunks: "all",
          priority: 10,
        },
        three: {
          test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
          name: "three",
          chunks: "all",
          priority: 10,
        },
      },
    };
    
    // 開発環境でのキャッシュ最適化
    if (dev) {
      config.cache = {
        type: "filesystem",
        buildDependencies: {
          config: [__filename],
        },
      };
    }
  }
  return config;
},
...(process.env.NODE_ENV === "development" && {
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}),
```

### 4. 認証コンテキストの最適化

#### AuthContext.tsx
セッション取得を非ブロッキングにし、初期表示を優先。

```typescript
useEffect(() => {
  const loadSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error("セッション取得エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  // 初期表示を優先するため、少し遅延
  const timeoutId = setTimeout(() => {
    loadSession();
  }, 0);

  // 認証状態の変化を監視
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  });

  return () => {
    clearTimeout(timeoutId);
    subscription.unsubscribe();
  };
}, [supabase.auth]);
```

## 効果

### 開発環境
- **コンパイル時間の短縮**: ファイルシステムキャッシュにより、2回目以降のコンパイルが高速化
- **メモリ使用量の削減**: `onDemandEntries`により、不要なページをメモリから解放
- **ローディング体験の改善**: コンパイル中も適切なローディング画面を表示

### 本番環境
- **初期バンドルサイズの削減**: 動的インポートにより、必要なコードのみを読み込み
- **コード分割による並列読み込み**: PixiJSとThree.jsを別チャンクに分離し、並列読み込みを実現
- **First Contentful Paint (FCP) の改善**: 初期表示が高速化

## 今後の改善案

1. **Service Workerの導入**: オフライン対応とキャッシュ戦略の強化
2. **プリロードの最適化**: 重要なリソースのプリロード
3. **画像最適化**: Next.js Imageコンポーネントの活用
4. **フォント最適化**: フォントのプリロードとサブセット化
