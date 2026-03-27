"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { overviews as overviewsTable } from "@/db/schema/overviews";
import { schedules as schedulesTable } from "@/db/schema/schedules";
import { shioris } from "@/db/schema/shioris";
import { createShioriSchema } from "./schema";

export type CreateShioriState = {
  status: "idle" | "error";
  message: string;
};

export async function createShiori(
  _prevState: CreateShioriState,
  formData: FormData,
): Promise<CreateShioriState> {
  let parsedOverviews: unknown;
  let parsedDays: unknown;
  try {
    parsedOverviews = JSON.parse(String(formData.get("overviews") ?? "[]"));
    parsedDays = JSON.parse(String(formData.get("days") ?? "[]"));
  } catch {
    return { status: "error", message: "送信データの形式が不正です" };
  }

  const rawData = {
    title: formData.get("title"),
    passphrase: formData.get("passphrase"),
    overviews: parsedOverviews,
    days: parsedDays,
    startDate: formData.get("startDate"),
  };

  const result = createShioriSchema.safeParse(rawData);

  if (!result.success) {
    return {
      status: "error",
      message: result.error.issues[0].message,
    };
  }

  const { title, passphrase, overviews, days, startDate } = result.data;

  if (days.some((day) => day.schedules.length === 0)) {
    return { status: "error", message: "予定がない日程は保存できません" };
  }

  let shioriId: string | undefined;

  try {
    await db.transaction(async (tx) => {
      // 1. shiorisにinsert
      const [shiori] = await tx
        .insert(shioris)
        .values({
          title,
          passphrase: passphrase || null,
        })
        .returning({ id: shioris.id });

      shioriId = shiori.id;

      // 2. overviews に INSERT
      if (overviews.length > 0) {
        await tx.insert(overviewsTable).values(
          overviews.map((item, i) => ({
            shioriId: shiori.id,
            sortOrder: i,
            title: item.title,
            content: item.content,
          })),
        );
      }

      // 3. schedules に INSERT
      const scheduleRows = days.flatMap((day, dayIndex) =>
        day.schedules.map((schedule, scheduleIndex) => ({
          shioriId: shiori.id,
          sortOrder: scheduleIndex,
          dayNumber: dayIndex + 1,
          date: startDate ? addDays(startDate, dayIndex) : null,
          time: schedule.time || null,
          title: schedule.title || null,
          transport: schedule.transport === "" ? null : schedule.transport,
          note: schedule.memo || null,
        })),
      );

      if (scheduleRows.length > 0) {
        await tx.insert(schedulesTable).values(scheduleRows);
      }
    });
  } catch {
    return { status: "error", message: "保存に失敗しました" };
  }

  redirect(`/i/${shioriId}`);
}

/** startDate に days 日加算した日付文字列を返す（UTC基準） */
function addDays(startDate: string, days: number): string {
  const [year, month, day] = startDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
