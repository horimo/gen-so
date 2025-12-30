# データベースセットアップ手順

## 1. Supabaseでテーブルを作成

Supabaseダッシュボードの「SQL Editor」で以下のSQLを実行してください：

```sql
-- 言層（Strata）オブジェクトを保存するテーブルを作成
CREATE TABLE IF NOT EXISTS strata_objects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('joy', 'peace', 'stress', 'sadness', 'inspiration', 'nostalgia', 'confusion')),
  strength NUMERIC(3, 2) NOT NULL CHECK (strength >= 0.0 AND strength <= 1.0),
  depth_y NUMERIC(10, 2) NOT NULL,
  analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- インデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_strata_objects_user_id ON strata_objects(user_id);
CREATE INDEX IF NOT EXISTS idx_strata_objects_created_at ON strata_objects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_strata_objects_depth_y ON strata_objects(depth_y);

-- Row Level Security (RLS) を有効化
ALTER TABLE strata_objects ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のデータのみ読み取り可能
CREATE POLICY "Users can view their own strata objects"
  ON strata_objects
  FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: ユーザーは自分のデータのみ挿入可能
CREATE POLICY "Users can insert their own strata objects"
  ON strata_objects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ポリシー: ユーザーは自分のデータのみ更新可能
CREATE POLICY "Users can update their own strata objects"
  ON strata_objects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ポリシー: ユーザーは自分のデータのみ削除可能
CREATE POLICY "Users can delete their own strata objects"
  ON strata_objects
  FOR DELETE
  USING (auth.uid() = user_id);
```

## 2. テーブルの確認

Supabaseダッシュボードの「Table Editor」で`strata_objects`テーブルが作成されていることを確認してください。

## 3. RLSポリシーの確認

「Authentication」→「Policies」で、`strata_objects`テーブルに4つのポリシーが作成されていることを確認してください。

## 動作確認

1. アプリにログイン
2. メッセージを送信
3. Supabaseダッシュボードの「Table Editor」で`strata_objects`テーブルを確認
4. 自分のユーザーIDのデータのみが表示されることを確認

