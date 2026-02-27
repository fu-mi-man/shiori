# Shiori - 旅のしおり作成サービス

旅行の行程表を簡単に作成し，URLで共有できるWebサービス。  
アカウント登録不要。

## セットアップ

### 前提条件

- Docker
- Claude Code（AI支援開発）
- Pencil.dev（VSCode/Cursor拡張機能，UIデザイン）

### 起動

```bash
git clone <repository-url>
cd shiori
docker compose up --build
```

開発サーバー: http://localhost:3000

Claude Code のプラグイン・スキル・MCPサーバーはプロジェクトでGit管理しているため，clone した時点で使用可能。  
詳細は `docs/01_requirements/05_development.md` を参照。

## 開発コマンド

全コマンドはDockerコンテナ内で実行する。

```bash
docker compose up                # 起動（http://localhost:3000）
docker compose down              # 停止
docker compose exec app sh       # コンテナに入る
```

```bash
pnpm typecheck                   # 型チェック
pnpm lint                        # lint（Biome）
pnpm test                        # ユニット・統合テスト（Vitest）
pnpm test:e2e                    # E2Eテスト（Playwright）
pnpm build                       # ビルド確認
```

## 技術スタック

Next.js 16 (App Router) / TypeScript / Tailwind CSS v4 / shadcn/ui / Neon Postgres / Drizzle ORM / pnpm / Docker

## ドキュメント

`docs/` 以下に配置。

| ファイル | 内容 |
|---------|------|
| `01_requirements/01_overview.md` | サービス概要 |
| `01_requirements/02_features.md` | 機能要件 |
| `01_requirements/03_screens.md` | 画面定義 |
| `01_requirements/04_data.md` | データ定義 |
| `01_requirements/05_development.md` | 開発環境・ツール・規約 |
| `02_specification/` | 詳細設計（必要に応じて追加） |
| `99_research/benchmark.md` | 競合分析 |
| `99_research/technology.md` | 技術選定 |
