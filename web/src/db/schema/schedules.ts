import {
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  time,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { shioris } from "./shioris";

export const transportEnum = pgEnum("transport", [
  "walk",
  "train",
  "bus",
  "plane",
  "car",
  "ship",
  "bicycle",
  "taxi",
  "cablecar",
]);

/**
 * schedules — しおりの行程テーブル（1対多）
 *
 * - day_number と sort_order で日程・表示順を管理
 * - date は任意。表示画面の日付範囲は date の MIN/MAX から動的算出
 * - note の200文字制限はアプリ側で制御
 */
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  shioriId: uuid("shiori_id")
    .notNull()
    .references(() => shioris.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull(),
  date: date("date"), // 実際の日付（任意）
  dayNumber: integer("day_number"), // 何日目か（1日目，2日目…）
  time: time("time"), // 時刻（任意）
  title: varchar("title", { length: 255 }), // 場所名・イベント名
  transport: transportEnum("transport"), // 交通手段
  note: text("note"), // 補足（最大200文字はアプリ側で制御）
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
