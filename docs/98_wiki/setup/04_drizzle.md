
## Drizzle ORM

TypeScript-first の ORM。  
Neon Postgres（本番）とローカル Postgres（開発）の両方に対応する。

> 公式ドキュメント: https://orm.drizzle.team/docs/get-started/neon-new

### 1. インストール

```bash
docker compose stop web
docker compose run --rm web pnpm add drizzle-orm @neondatabase/serverless postgres
docker compose run --rm web pnpm add -D drizzle-kit
docker compose rm -v web
docker compose up --build -d
```


| パッケージ                 | 種別       | 用途                               |
| -------------------------- | ---------- | ---------------------------------- |
| `drizzle-orm`              | 本体       | ORM                                |
| `@neondatabase/serverless` | ドライバ   | Neon Postgres 接続（本番）         |
| `postgres`                 | ドライバ   | ローカル Postgres 接続（開発）     |
| `drizzle-kit`              | 開発ツール | マイグレーション生成・適用・Studio |

> 公式チュートリアルでは `dotenv` で `.env` を読み込むが，本プロジェクトでは Docker Compose の `environment` で環境変数を注入しているため不要。

### 2. drizzle.config.ts を作成

`web/drizzle.config.ts`:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
```

| 設定                | 値                         | 理由                           |
| ------------------- | -------------------------- | ------------------------------ |
| `out`               | `src/db/migrations`    | DB 関連を `db/` に集約（公式準拠） |
| `schema`            | `src/db/schema.ts`     | Drizzle スキーマ定義のパス     |
| `dialect`           | `"postgresql"`             | Neon / ローカル共に PostgreSQL |
| `dbCredentials.url` | `process.env.DATABASE_URL` | compose.yaml で注入済み        |

### 3. package.json にスクリプトを追加

```jsonc
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
  },
}
```

| コマンド           | 実行内容                    | 用途                 |
| ------------------ | --------------------------- | -------------------- |
| `pnpm db:generate` | スキーマ差分から SQL を生成 | スキーマ変更時       |
| `pnpm db:migrate`  | SQL を DB に適用            | マイグレーション実行 |
| `pnpm db:studio`   | DB 管理 UI を起動           | データ確認・編集     |

### 4. スキーマファイル・DB接続ファイルを作成

drizzle-kit は `schema` に指定されたファイルが存在しないとエラーになる。  
空のスキーマファイルと，DB接続ファイルをホスト側で作成する（ボリュームマウントでコンテナに反映される）。  
テーブル定義は開発タスクとして別途実装する。

```bash
# ホストで実行（web/ ディレクトリ配下）
mkdir -p src/db
touch src/db/schema.ts
```

`web/src/db/index.ts`:

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const queryClient = postgres(process.env.DATABASE_URL ?? ""); // compose.yamlのDATABASE_URL環境変数を参照
export const db = drizzle({ client: queryClient }); // アプリ全体で使うDBクライアント
```

| 設定 | 値 | 理由 |
| --- | --- | --- |
| ドライバ | `drizzle-orm/postgres-js` | ローカル Postgres（Docker）に接続。本番 Neon 時は `drizzle-orm/neon-http` に差し替え |
| `DATABASE_URL` | `process.env.DATABASE_URL ?? ""` | compose.yaml で注入済み |

### 5. 動作確認

```bash
docker compose exec web sh
pnpm db:studio
```

Drizzle Studio が起動し，ローカル Postgres に接続できれば完了。  
`Ctrl+C` で終了し，`exit` でコンテナを出る。
