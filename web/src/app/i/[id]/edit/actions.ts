"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { createShioriSchema } from "@/app/create/schema";
import { db } from "@/db";
import { overviews as overviewsTable } from "@/db/schema/overviews";
import { schedules as schedulesTable } from "@/db/schema/schedules";
import { shioris } from "@/db/schema/shioris";

export type UpdateShioriState = {
  status: "idle" | "error";
  message: string;
};

const updateShioriSchema = createShioriSchema.omit({ passphrase: true });

export async function updateShiori(
  id: string,
  _prevState: UpdateShioriState,
  formData: FormData,
): Promise<UpdateShioriState> {
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
    overviews: parsedOverviews,
    days: parsedDays,
    startDate: formData.get("startDate"),
  };

  const result = updateShioriSchema.safeParse(rawData);

  if (!result.success) {
    return {
      status: "error",
      message: result.error.issues[0].message,
    };
  }

  const { title, overviews, days, startDate } = result.data;

  if (days.some((day) => day.schedules.length === 0)) {
    return { status: "error", message: "予定がない日程は保存できません" };
  }

  try {
    await db.transaction(async (tx) => {
      // 1. shioris を UPDATE
      await tx.update(shioris).set({ title }).where(eq(shioris.id, id));

      // 2. overviews を DELETE → INSERT
      await tx.delete(overviewsTable).where(eq(overviewsTable.shioriId, id));
      if (overviews.length > 0) {
        await tx.insert(overviewsTable).values(
          overviews.map((item, i) => ({
            shioriId: id,
            sortOrder: i,
            title: item.title,
            content: item.content,
          })),
        );
      }

      // 3. schedules を DELETE → INSERT
      await tx.delete(schedulesTable).where(eq(schedulesTable.shioriId, id));
      const scheduleRows = days.flatMap((day, dayIndex) =>
        day.schedules.map((schedule, scheduleIndex) => ({
          shioriId: id,
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

  redirect(`/i/${id}`);
}

/** startDate に days 日加算した日付文字列を返す（UTC基準） */
function addDays(startDate: string, days: number): string {
  const [year, month, day] = startDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
