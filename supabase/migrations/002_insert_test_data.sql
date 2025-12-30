-- テスト用データの挿入スクリプト
-- 注意: このスクリプトを実行する前に、実際のユーザーIDを取得してください

-- 方法1: 現在ログインしているユーザーのIDを取得して使用
-- SELECT auth.uid(); で現在のユーザーIDを確認できます

-- 方法2: 既存のユーザーIDを使用（最初のユーザーを取得）
-- DO $$
-- DECLARE
--   test_user_id UUID;
-- BEGIN
--   SELECT id INTO test_user_id FROM auth.users LIMIT 1;
--   
--   IF test_user_id IS NOT NULL THEN
--     -- テストデータを挿入
--     INSERT INTO strata_objects (user_id, message, category, strength, depth_y, analysis)
--     VALUES
--       (test_user_id, '今日はとても楽しかった！', 'joy', 0.9, 0, '喜びの表現'),
--       (test_user_id, '少し疲れたな...', 'stress', 0.6, 100, '疲労感'),
--       (test_user_id, '穏やかな気持ち', 'peace', 0.7, 200, '平穏'),
--       (test_user_id, '新しいアイデアが浮かんだ', 'inspiration', 0.8, 300, '創造性'),
--       (test_user_id, '懐かしい思い出', 'nostalgia', 0.7, 400, '郷愁'),
--       (test_user_id, '何か分からない', 'confusion', 0.5, 500, '混乱'),
--       (test_user_id, '悲しい気持ち', 'sadness', 0.6, 600, '悲しみ'),
--       (test_user_id, 'また楽しい日々', 'joy', 0.85, 700, '喜び'),
--       (test_user_id, 'ストレスが溜まっている', 'stress', 0.75, 800, 'ストレス'),
--       (test_user_id, '心が落ち着いている', 'peace', 0.8, 900, '平穏');
--   END IF;
-- END $$;

-- 方法3: 現在のユーザーIDを使用（推奨）
-- このスクリプトを実行する前に、SupabaseダッシュボードでログインしているユーザーのIDを確認してください

-- テストデータを挿入（user_idは実際のユーザーIDに置き換えてください）
-- INSERT INTO strata_objects (user_id, message, category, strength, depth_y, analysis)
-- VALUES
--   ((SELECT id FROM auth.users LIMIT 1), '今日はとても楽しかった！', 'joy', 0.9, 0, '喜びの表現'),
--   ((SELECT id FROM auth.users LIMIT 1), '少し疲れたな...', 'stress', 0.6, 100, '疲労感'),
--   ((SELECT id FROM auth.users LIMIT 1), '穏やかな気持ち', 'peace', 0.7, 200, '平穏'),
--   ((SELECT id FROM auth.users LIMIT 1), '新しいアイデアが浮かんだ', 'inspiration', 0.8, 300, '創造性'),
--   ((SELECT id FROM auth.users LIMIT 1), '懐かしい思い出', 'nostalgia', 0.7, 400, '郷愁'),
--   ((SELECT id FROM auth.users LIMIT 1), '何か分からない', 'confusion', 0.5, 500, '混乱'),
--   ((SELECT id FROM auth.users LIMIT 1), '悲しい気持ち', 'sadness', 0.6, 600, '悲しみ'),
--   ((SELECT id FROM auth.users LIMIT 1), 'また楽しい日々', 'joy', 0.85, 700, '喜び'),
--   ((SELECT id FROM auth.users LIMIT 1), 'ストレスが溜まっている', 'stress', 0.75, 800, 'ストレス'),
--   ((SELECT id FROM auth.users LIMIT 1), '心が落ち着いている', 'peace', 0.8, 900, '平穏');

