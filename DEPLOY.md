# デプロイ手順

## Vercelへのデプロイ

### 1. Vercelアカウントの準備

1. https://vercel.com にアクセス
2. GitHubアカウントでログイン（推奨）

### 2. プロジェクトのインポート

1. Vercelダッシュボードで「Add New Project」をクリック
2. GitHubリポジトリを選択
3. プロジェクトをインポート

### 3. 環境変数の設定

Vercelダッシュボードの「Settings」→「Environment Variables」で以下を設定：

#### 必須の環境変数

```
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 環境変数の設定方法

1. Vercelダッシュボードでプロジェクトを選択
2. 「Settings」→「Environment Variables」を開く
3. 各環境変数を追加：
   - **Key**: `GEMINI_API_KEY`
   - **Value**: 実際のAPIキー
   - **Environment**: Production, Preview, Development すべてにチェック
4. 同様に`NEXT_PUBLIC_SUPABASE_URL`と`NEXT_PUBLIC_SUPABASE_ANON_KEY`も設定

### 4. ビルド設定の確認

Vercelは自動的にNext.jsプロジェクトを検出しますが、必要に応じて以下を確認：

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`（デフォルト）
- **Output Directory**: `.next`（デフォルト）
- **Install Command**: `npm install`（デフォルト）

### 5. デプロイの実行

1. 「Deploy」ボタンをクリック
2. ビルドが完了するまで待機（通常1-3分）
3. デプロイ完了後、URLが表示されます

### 6. デプロイ後の確認

- [ ] アプリが正常に表示される
- [ ] ログイン機能が動作する
- [ ] 3Dシーンが表示される
- [ ] メッセージ送信が動作する
- [ ] データベースへの保存が動作する

## トラブルシューティング

### ビルドエラー

**エラー**: `Module not found` や `Type error`

**解決策**:
1. `npm install`をローカルで実行して依存関係を確認
2. `npm run build`をローカルで実行してエラーを確認
3. TypeScriptの型エラーを修正

### 環境変数エラー

**エラー**: `GEMINI_API_KEY is not defined`

**解決策**:
1. Vercelダッシュボードで環境変数が正しく設定されているか確認
2. 環境変数名にタイポがないか確認
3. 再デプロイを実行

### Supabase接続エラー

**エラー**: `Failed to connect to Supabase`

**解決策**:
1. SupabaseのURLとキーが正しいか確認
2. Supabaseプロジェクトがアクティブか確認
3. RLSポリシーが正しく設定されているか確認

### 3Dシーンの表示問題

**問題**: 3Dシーンが表示されない

**解決策**:
1. ブラウザのコンソールでエラーを確認
2. WebGLが有効になっているか確認
3. モバイルブラウザではWebGLのサポートを確認

## 本番環境での注意事項

### セキュリティ

- ✅ 環境変数はVercelの環境変数設定で管理（Gitにコミットしない）
- ✅ `.env.local`は`.gitignore`に含まれていることを確認
- ✅ SupabaseのRLSポリシーが正しく設定されていることを確認

### パフォーマンス

- ✅ 画像やアセットの最適化
- ✅ 3Dオブジェクトの数を適切に制限
- ✅ 不要な再レンダリングを避ける

### モニタリング

- VercelのAnalyticsを有効化（オプション）
- エラーログを定期的に確認

## カスタムドメインの設定（オプション）

1. Vercelダッシュボードで「Settings」→「Domains」を開く
2. ドメインを追加
3. DNS設定を更新（Vercelの指示に従う）

## 継続的デプロイ（CI/CD）

GitHubにプッシュすると自動的にデプロイされます：

- **mainブランチ**: 本番環境にデプロイ
- **その他のブランチ**: プレビュー環境にデプロイ

---

**デプロイ成功後、本番環境のURLを共有してください！**

