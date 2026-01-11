# shiori

## 開発環境構築の注意事項（Docker + pnpm）

このプロジェクトでは、Docker + pnpm + volume を使用しています。

### 初回セットアップ
```bash
docker compose up --build
```

### 依存関係を追加する場合

コンテナ内で pnpm を実行してください。

```bash
docker compose exec frontend pnpm install
docker compose exec frontend pnpm add <package>
```

### pnpm でエラーが出た場合
pnpm の store と node_modules の不整合が原因の可能性があります。

```bash
docker compose down -v
docker compose up --build
```

※ /app/node_modules は named volume で管理されています。
