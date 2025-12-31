# GEN-SO ドキュメント

このディレクトリには、GEN-SOプロジェクトの各種ドキュメントが整理されています。

## 📁 ディレクトリ構造

```
docs/
├── README.md              # このファイル
├── plans/                 # 計画・設計ドキュメント
├── status/               # 実装状況・完了報告
├── proposals/             # 機能提案・次の実装
└── technical/             # 技術・運用ドキュメント
```

## 📚 ドキュメント一覧

### 📋 plans/ - 計画・設計ドキュメント

実装前の計画や設計に関するドキュメントです。

- **FEATURE_DESIGN.md** - テラリウム機能の詳細設計
- **2D_MIGRATION_PLAN.md** - 3Dから2Dへの移行計画
- **2D_OBJECT_DESIGN.md** - 2Dオブジェクトのデザイン仕様
- **PIXIJS_INTEGRATION_PLAN.md** - PixiJS統合計画
- **PIXIJS_V8_UPGRADE.md** - PixiJS v8へのアップグレード計画
- **PIXEL_ART_LIBRARY_PROPOSAL.md** - ピクセルアートライブラリの提案

### ✅ status/ - 実装状況・完了報告

実装完了後の記録や現在の実装状況に関するドキュメントです。

- **PROJECT_STATUS.md** - プロジェクトの現在の状態まとめ（実装状況、技術スタック、アーキテクチャ）
- **IMPLEMENTATION_STATUS.md** - 実装状況と技術詳細
- **PIXIJS_PHASE2_COMPLETE.md** - PixiJS Phase 2の完了報告

### 💡 proposals/ - 機能提案・次の実装

将来の実装予定や機能提案に関するドキュメントです。

- **NEXT_IMPLEMENTATION_PLAN.md** - 次の実装計画
- **NEXT_FEATURES_PROPOSAL.md** - 次の機能提案
- **3D_TO_2D_MISSING_FEATURES.md** - 3Dから2Dへの移行時に未実装の機能一覧

### 🔧 technical/ - 技術・運用ドキュメント

技術的な詳細や運用に関するドキュメントです。

- **README_DATABASE.md** - データベース構造とセットアップ
- **DEPLOY.md** - デプロイ手順
- **DEPLOY_CHECKLIST.md** - デプロイ前チェックリスト
- **COMPILE_OPTIMIZATION.md** - コンパイル最適化の記録

## 🎯 ドキュメントの使い方

### 新機能を実装する場合

1. **計画段階**: `plans/`に設計ドキュメントを作成
2. **実装中**: 必要に応じて`status/`のドキュメントを更新
3. **実装完了**: `status/`に完了報告を追加

### 次の実装を検討する場合

1. `proposals/`のドキュメントを確認
2. 新しい提案がある場合は`proposals/`に追加

### 技術的な詳細を確認する場合

1. `technical/`のドキュメントを参照
2. データベース関連は`technical/README_DATABASE.md`
3. デプロイ関連は`technical/DEPLOY.md`と`technical/DEPLOY_CHECKLIST.md`

## 📝 ドキュメント作成ルール

- **README.md**: プロジェクトルートに配置（GitHub等の標準的な構成に従う）
- **その他のドキュメント**: `docs/`ディレクトリに配置
  - 計画・設計: `docs/plans/`
  - 実装状況: `docs/status/`
  - 機能提案: `docs/proposals/`
  - 技術・運用: `docs/technical/`

## 🔄 ドキュメントの更新

ドキュメントは定期的に更新し、古い情報が残らないように注意してください。

- 実装が完了した計画ドキュメントは`status/`に移動またはアーカイブ
- 実装済みの提案は`status/`に完了報告を追加
- 技術的な変更があった場合は`technical/`のドキュメントを更新

---

**最終更新**: 2024年12月30日

