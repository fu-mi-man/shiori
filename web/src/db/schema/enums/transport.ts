import { pgEnum } from "drizzle-orm/pg-core";

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
