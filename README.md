# Shiori - 旅のしおり作成サービス

旅行の行程表を簡単に作成・共有できるWebサービス。

## 技術スタック（2026年1月時点）

- **Next.js 16** (App Router、React Server Components)
- **TypeScript** (フロント・バックエンド統一)
- **Tailwind CSS v4** (Next.js 16が自動統合)
- **Neon Postgres** (Vercel統合、無料枠512MB)
- **pnpm 10.28.0** (Corepackで管理)
- **Node.js 24 LTS** (Docker環境)
- **Vercel** (Hobby無料プラン、**非商用利用限定**)

## 開発環境構築

### 必要環境
- Docker Desktop
- Git

**注**: ホストマシンにNode.jsやpnpmのインストールは不要です。全てDocker内で実行します。

### 初回セットアップ

```bash
# リポジトリをクローン
git clone <repository-url>
cd shiori

# Docker環境を起動
docker compose up --build
```

開発サーバー: http://localhost:3000

### 依存関係を追加する場合

**重要**: 必ずコンテナ内でpnpmを実行してください。

```bash
# コンテナに入る
docker compose exec app sh

# パッケージを追加
pnpm add <package-name>

# 開発用パッケージを追加
pnpm add -D <package-name>

# コンテナから抜ける
exit

# 再起動
docker compose restart app
```

### pnpm でエラーが出た場合

pnpm の store と node_modules の不整合が原因の可能性があります。

```bash
# 完全クリーンアップ（volumeも削除）
docker compose down -v
docker compose up --build
```

**注**: `node_modules` は named volume で管理されています（OS固有のバイナリ互換性のため）。

## ドキュメント

詳細なドキュメントは `docs/` ディレクトリにあります：

- [サービス概要](docs/requirements/overview.md)
- [機能要件](docs/requirements/features.md)
- [データ定義](docs/requirements/data.md)
- [画面定義](docs/requirements/screens.md)
- [技術選定](docs/technology.md)
- [開発環境](docs/development.md)
- [競合分析](docs/benchmark.md)

Claude Codeを使用する場合は [CLAUDE.md](CLAUDE.md) も参照してください。
