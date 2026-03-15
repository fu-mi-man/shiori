import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const shioris = pgTable("shioris", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(), // タイトル
  passphrase: varchar("passphrase", { length: 255 }), // パスフレーズ
  isPremium: boolean("is_premium").notNull().default(false), // 課金済みフラグ
  lastAccessedAt: timestamp("last_accessed_at").notNull().defaultNow(), // 最終アクセス日時
  createdAt: timestamp("created_at").notNull().defaultNow(), // 作成日時
  updatedAt: timestamp("updated_at").notNull().defaultNow(), // 更新日時
});
