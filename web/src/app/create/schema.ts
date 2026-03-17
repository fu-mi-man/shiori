import { z } from "zod";
import { transportEnum } from "@/db/schema/schedules";

const transportValues = transportEnum.enumValues;

const overviewSchema = z.object({
  title: z.string().max(255),
  content: z.string().max(500),
});

const scheduleSchema = z.object({
  time: z.string(),
  title: z.string().max(255),
  transport: z.enum(transportValues).or(z.literal("")),
  memo: z.string().max(200),
});

const daySchema = z.object({
  schedules: z.array(scheduleSchema),
});

export const createShioriSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(255),
  passphrase: z.string().max(255),
  overviews: z.array(overviewSchema).max(10),
  days: z.array(daySchema).max(10),
  startDate: z.string(),
});
