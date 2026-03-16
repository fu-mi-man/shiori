import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as relations from "./relations";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const queryClient = postgres(process.env.DATABASE_URL); // compose.yamlのDATABASE_URL環境変数を参照
export const db = drizzle({ client: queryClient, schema: { ...schema, ...relations } }); // アプリ全体で使うDBクライアント
