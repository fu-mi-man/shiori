import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const queryClient = postgres(process.env.DATABASE_URL ?? "");      // compose.yamlのDATABASE_URL環境変数を参照
export const db = drizzle({ client: queryClient });                // アプリ全体で使うDBクライアント
