import { z } from "zod";
import { transportEnum } from "@/db/schema/schedules";

const transportValues = transportEnum.enumValues;

/** 概要カード1件のバリデーション */
const overviewSchema = z.object({
  title: z.string().max(255),
  content: z.string().max(500),
});

/** 行程の1コマのバリデーション */
const scheduleSchema = z.object({
  time: z.string(),
  title: z.string().max(255),
  transport: z.enum(transportValues).or(z.literal("")),
  memo: z.string().max(200),
});

/** 1日分の行程グループ */
const daySchema = z.object({
  schedules: z.array(scheduleSchema),
});

/** しおり作成フォームのバリデーションスキーマ */
export const createShioriSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(255),
  passphrase: z.string().max(255),
  overviews: z.array(overviewSchema).max(10),
  days: z.array(daySchema).max(10),
  startDate: z.iso.date().or(z.literal("")),
});
