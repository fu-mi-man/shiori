See @README.md for project overview and @package.json for available npm commands。  
Git workflow: @docs/01_requirements/05_development.md

# Commands

全コマンドはDockerコンテナ内で実行する。  
ホストで直接 pnpm/npm を実行しない。

```bash
docker compose up --build      # 初回 or Dockerfile変更時
docker compose up               # 通常起動（http://localhost:3000）
docker compose down              # 停止
docker compose exec app sh       # コンテナに入る
```

コード変更後は以下の順で検証すること。

```bash
pnpm typecheck                   # 型チェック
pnpm lint                        # lint（Biome）
pnpm test                        # ユニット・統合テスト（Vitest）
pnpm build                       # ビルド確認
```

# Code style

- ESモジュール（import/export）を使用。CommonJS（require）は禁止
- 可能な限りnamed importを使う（例: `import { useState } from "react"`）
- 汎用UI → `components/ui/`，機能固有 → `components/features/`
- フォーマットはBiomeに従う。手動で整形しない

# Git

- Conventional Commits（日本語）: `feat: しおり作成フォームを実装`
- 種別: feat, fix, hotfix, refactor, design, chore, docs, test, style
- ブランチ: `種別/内容`（kebab-case）例: `feature/add-timeline-component`

# Pitfalls

- IMPORTANT: `frontend/` ディレクトリは旧Vite構成の残骸。無視すること。プロジェクトルートがNext.jsアプリ
- IMPORTANT: Tailwind v4 を使用。`tailwind.config.js` と `postcss.config.js` は作らない。`app/globals.css` に `@import "tailwindcss";` のみ
- `package.json` の `packageManager` フィールドを変更・削除しない（Corepackが依存）
- モバイルファースト: max-width 480px，タッチターゲット 44×44px以上，PC/タブレットは中央配置
- UIは日本語で記述する（Phase 1）
- IMPORTANT: Server Componentsを優先する。DBへの直接アクセスはServer Componentで行う。Client ComponentからはAPI Routes経由で更新する
- UIデザインは `designs/*.pen`（Pencil.dev）。MCPが接続済みなので，UI実装時は必ず参照すること
- E2EテストにはPlaywright MCPが使用可能
