See @README.md for project overview and @web/package.json for available npm commands。  

# Commands

全コマンドはDockerコンテナ内で実行する。  
ホストで直接 pnpm/npm を実行しない。

```bash
docker compose up --build        # 初回 or Dockerfile変更時
docker compose up                # 通常起動（http://localhost:3000）
docker compose down              # 停止
docker compose exec web sh       # コンテナに入る
```

コード変更後は以下の順で検証すること。

```bash
pnpm typecheck                   # 型チェック
pnpm lint                        # lint（Biome）
pnpm test                        # ユニット・統合テスト（Vitest）
pnpm build                       # ビルド確認
```

# Code style

- ESモジュール（import/export）のみ使用。named importを優先（例: `import { useState } from "react"`）
- 汎用UI → `components/ui/`，機能固有 → `components/features/`
- フォーマットはBiomeに従う。手動で整形しない

# Git

- Git運用は @docs/01_requirements/05_development.md を参照
- PR作成時は `.github/pull_request_template.md` のテンプレートを使用する

# Pitfalls

- IMPORTANT: `frontend/` ディレクトリは旧Vite構成の残骸。無視すること。Next.jsアプリは `web/` ディレクトリに配置
- IMPORTANT: Tailwind v4 を使用。`tailwind.config.js` と `postcss.config.js` は作らない。`web/src/app/globals.css` に `@import "tailwindcss";` のみ
- `web/package.json` の `packageManager` フィールドを変更・削除しない（Corepackが依存）
- IMPORTANT: Server Componentsを優先する。DBへの直接アクセスはServer Componentで行う。Client ComponentからはAPI Routes経由で更新する
- モバイルファースト: max-width 480px、タッチターゲット 44×44px以上、PC/タブレットは中央配置
- E2EテストにはPlaywright MCPが使用可能

# Documentation

- コード変更時は関連ドキュメント（docs/配下、CLAUDE.md、README.md）も更新し、整合性を保つこと
