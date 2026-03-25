# Commands

Next.jsアプリ（web/）のコマンドはDockerコンテナ内で実行する。
パッケージのインストール・実行は `npm` ではなく `pnpm` を使う（`npx` → `pnpm dlx`、`npm install` → `pnpm add`）。

コード変更後は以下の順で検証すること。
```bash
pnpm typecheck                   # 型チェック
pnpm lint                        # lint（Biome）
pnpm exec vitest run             # ユニット・統合テスト（Vitest・1回実行）
pnpm build                       # ビルド確認
```

# Code style

- 汎用UI → `components/ui/`，機能固有 → `components/features/`
- IMPORTANT: UIコンポーネントはshadcn/uiを優先して使用する。入力系（`<button>`→`<Button>`、`<input>`→`<Input>`）だけでなく、表示系（`<div>`でカード→`<Card>`）も含む。該当コンポーネントがない場合のみ素のHTML要素を使う
- IMPORTANT: 新しいUIコンポーネント利用時はshadcnスキルで存在確認、ライブラリの設定変更・新規導入時はcontext7で公式ドキュメントを確認すること

# Git

- コミット: Conventional Commits形式（feat:, fix:, docs:, refactor:, chore: 等）
- ブランチ: feat/xxx, fix/xxx 形式
- PR作成時は `.github/pull_request_template.md` のテンプレートを使用する

# Pitfalls

- IMPORTANT: Tailwind v4 を使用。`tailwind.config.js` と `postcss.config.js` は作らない。`web/src/app/globals.css` の先頭は `@import "tailwindcss";`。shadcn/ui 導入後は `@import "tw-animate-css"` と `@import "shadcn/tailwind.css"` も追加される（これらは必要なので削除しない）
- IMPORTANT: パッケージ追加時は `docker compose down -v` を使わない（named volumeの`pgdata`も消える）。手順は docs/98_wiki/dev-guide.md のパッケージ管理を参照
- `web/package.json` の `packageManager` フィールドを変更・削除しない（Corepackが依存）
- Server Componentsを優先する。DBへの直接アクセスはServer Componentで行う。Client Componentからの更新はServer Actions（`useActionState`）を優先し、Server Actionsで対応できない場合のみAPI Routesを使う
- モバイルファースト: max-width 480px、タッチターゲット 44×44px以上（Apple HIG 準拠）。ただしトップページ（`/`）はランディングページのためこの限りではない

# Documentation

- コード変更・パッケージ追加・設定変更時は関連ドキュメント（docs/配下、CLAUDE.md、README.md）も更新すること
- IMPORTANT: コード変更後はドキュメントと齟齬がないか，ドキュメント変更後はコードと齟齬がないか，必ず相互に確認すること
