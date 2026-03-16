import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql", // 使用するDB（ローカルPostgres / 本番Neon共通）
  schema: "./src/db/schema", // Drizzleスキーマ定義ディレクトリ（再帰探索）
  out: "./src/db/migrations", // マイグレーションSQL出力先
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "", // compose.yamlのDATABASE_URL環境変数を参照（drizzle-kitはthrowを使えないため ?? ""）
  },
});
