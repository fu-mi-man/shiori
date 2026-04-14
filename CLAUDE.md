# Commands

Next.jsアプリのコマンドはプロジェクトルートから `docker compose exec web` 経由で実行する（cd 不要）。
パッケージのインストール・実行は `npm` ではなく `pnpm` を使う（`npx` → `pnpm dlx`、`npm install` → `pnpm add`）。

コード変更後は以下の順で検証すること。
```bash
# 毎回（変更後）
docker compose exec web pnpm format           # フォーマット（Biome，自動修正）
docker compose exec web pnpm typecheck        # 型チェック
docker compose exec web pnpm lint             # lint（Biome）

# コミット・PR 前
docker compose exec web pnpm exec vitest run  # ユニット・統合テスト（Vitest・テスト追加後）
docker compose exec web pnpm build            # ビルド確認
```

# Pitfalls

- `docker compose down -v` を使わない（named volume の `pgdata` が消える。パッケージ追加手順は docs/98_wiki/dev-guide.md 参照）
- `web/package.json` の `packageManager` フィールドを変更・削除しない（Corepack が依存）

@.claude/rules/frontend.md
@.claude/rules/database.md
@.claude/rules/git.md
@.claude/rules/documentation.md
@.claude/rules/testing.md
