# CLAUDE.md

## プロジェクト

**Shiori** - 旅行の行程表を作成・URLで共有するWebサービス。アカウント登録不要。

- 要件定義: `docs/01_requirements/`
- 詳細設計: `docs/02_specification/`
- 調査資料: `docs/99_research/`
- 画面デザイン: `designs/*.pen`（Pencilで閲覧）

IMPORTANT: **会話開始時に必ず `docs/` 以下のドキュメントをすべて読むこと。** 仕様を把握してから作業に入る。

## 技術スタック

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 / shadcn/ui / Lucide
- React Hook Form + Zod / date-fns
- pnpm 10.28.0 (Corepack管理)
- Neon Postgres + Drizzle ORM（未実装）

## 開発コマンド

IMPORTANT: **全コマンドはDockerコンテナ内で実行。ホストマシンで直接 pnpm/npm を実行しない。**

```bash
docker compose up --build   # 初回 or Dockerfile変更時
docker compose up            # 通常起動（開発サーバー: http://localhost:3000）
docker compose down          # 停止
```

パッケージ追加:
```bash
docker compose exec app sh
pnpm add <package>           # または pnpm add -D <package>
exit
docker compose restart app
```

lint / build:
```bash
docker compose exec app sh
pnpm lint    # または pnpm build
```

## 絶対に守るルール

1. **Tailwind v4**: `tailwind.config.js` と `postcss.config.js` は作らない。`app/globals.css` に `@import "tailwindcss";` のみ記述
2. **`package.json` の `packageManager` フィールドを変更・削除しない**（Corepackが依存）
3. **`frontend/` ディレクトリは無視**（旧Vite構成の残骸。プロジェクトルートがNext.jsアプリ）
4. **モバイルファースト必須**: max-width 480px、タッチターゲット 44×44px 以上、PC/タブレットは中央配置
5. **日本語UIが前提**（Phase 1は日本語のみ）
6. **Server Components優先**: DBに直接アクセス可能。Client Componentからの更新にはAPI Routesを使用

## ルーティング

| URL | ファイル |
|-----|---------|
| `/` | `app/page.tsx` |
| `/create` | `app/create/page.tsx` |
| `/i/[id]` | `app/i/[id]/page.tsx` |
| `/i/[id]/edit` | `app/i/[id]/edit/page.tsx` |
