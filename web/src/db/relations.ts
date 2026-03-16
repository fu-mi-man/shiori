import { relations } from "drizzle-orm";
import { overviews } from "./schema/overviews";
import { schedules } from "./schema/schedules";
import { shioris } from "./schema/shioris";

// shioris → overviews, schedules（1対多）
export const shiorisRelations = relations(shioris, ({ many }) => ({
  overviews: many(overviews),
  schedules: many(schedules),
}));

// overviews → shioris（多対1）
export const overviewsRelations = relations(overviews, ({ one }) => ({
  shiori: one(shioris, {
    fields: [overviews.shioriId],
    references: [shioris.id],
  }),
}));

// schedules → shioris（多対1）
export const schedulesRelations = relations(schedules, ({ one }) => ({
  shiori: one(shioris, {
    fields: [schedules.shioriId],
    references: [shioris.id],
  }),
}));
