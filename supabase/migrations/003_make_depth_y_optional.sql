-- depth_yカラムをオプショナルに変更（created_atから自動計算されるため）
-- 既存のデータとの互換性を保つため、カラムは削除せずNULLを許可する

ALTER TABLE strata_objects 
  ALTER COLUMN depth_y DROP NOT NULL;

-- コメントを追加（depth_yはcreated_atから計算されることを明記）
COMMENT ON COLUMN strata_objects.depth_y IS '深度（オプショナル）。created_atから自動計算される。新しいメッセージは浅い深度、古いメッセージは深い深度。';

