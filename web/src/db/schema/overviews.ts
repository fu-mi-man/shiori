import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { shioris } from "./shioris";

/**
 * overviews — しおりの概要セクション（1対多）
 *
 * - sort_order で表示順を管理
 * - content の500文字制限はアプリ側で制御
 */
export const overviews = pgTable(
  "overviews",
  {
    id: serial("id").primaryKey(),
    shioriId: uuid("shiori_id")
      .notNull()
      .references(() => shioris.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull(),
    title: varchar("title", { length: 255 }), // タイトル
    content: text("content"), // 内容（最大500文字はアプリ側で制御）
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [index("overviews_shiori_id_sort_order_idx").on(table.shioriId, table.sortOrder)],
);
