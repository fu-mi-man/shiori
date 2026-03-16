import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  // shioris → overviews, schedules（1対多）
  shioris: {
    overviews: r.many.overviews(),
    schedules: r.many.schedules(),
  },
  // overviews → shioris（多対1）
  overviews: {
    shiori: r.one.shioris({
      from: r.overviews.shioriId,
      to: r.shioris.id,
    }),
  },
  // schedules → shioris（多対1）
  schedules: {
    shiori: r.one.shioris({
      from: r.schedules.shioriId,
      to: r.shioris.id,
    }),
  },
}));
