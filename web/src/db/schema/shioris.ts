import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

/**
 * shioris — しおりの本体テーブル
 *
 * - id は URL に使用する UUID
 * - passphrase は平文保存（簡易ロック目的）
 * - is_premium が false かつ last_accessed_at から3ヶ月経過で自動削除
 */
export const shioris = pgTable("shioris", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(), // タイトル
  passphrase: varchar("passphrase", { length: 255 }), // パスフレーズ
  isPremium: boolean("is_premium").notNull().default(false), // 課金済みフラグ
  lastAccessedAt: timestamp("last_accessed_at").notNull().defaultNow(), // 最終アクセス日時
  createdAt: timestamp("created_at").notNull().defaultNow(), // 作成日時
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()), // 更新日時
});
