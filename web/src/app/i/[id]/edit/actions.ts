"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { createShioriSchema } from "@/app/create/schema";
import { db } from "@/db";
import { overviews as overviewsTable } from "@/db/schema/overviews";
import { schedules as schedulesTable } from "@/db/schema/schedules";
import { shioris } from "@/db/schema/shioris";
import { addDays } from "@/lib/shiori/add-days";

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

  try {
    await db.transaction(async (tx) => {
      // 1. shioris を UPDATE
      await tx
        .update(shioris)
        .set({ title, startDate: startDate || null })
        .where(eq(shioris.id, id));

      // 2. overviews を DELETE → INSERT（タイトル・内容が両方空のものは除外）
      await tx.delete(overviewsTable).where(eq(overviewsTable.shioriId, id));
      const nonEmptyOverviews = overviews.filter(
        (o) => o.title.trim() !== "" || o.content.trim() !== "",
      );
      if (nonEmptyOverviews.length > 0) {
        await tx.insert(overviewsTable).values(
          nonEmptyOverviews.map((item, i) => ({
            shioriId: id,
            sortOrder: i,
            title: item.title,
            content: item.content,
          })),
        );
      }

      // 3. schedules を DELETE → INSERT
      // - 全フィールドがスペースのみ・空の予定は除外（スペースのみは DB の time 型エラーを防ぐため trim() で判定）
      // - 元の days インデックスを使い dayNumber と date がズレないようにする
      await tx.delete(schedulesTable).where(eq(schedulesTable.shioriId, id));
      const scheduleRows = days.flatMap((day, dayIndex) =>
        day.schedules
          .filter((s) => s.time.trim() || s.title.trim() || s.memo.trim())
          .map((schedule, scheduleIndex) => ({
            shioriId: id,
            sortOrder: scheduleIndex,
            dayNumber: dayIndex + 1,
            date: startDate ? addDays(startDate, dayIndex) : null,
            time: schedule.time.trim() || null,
            title: schedule.title.trim() || null,
            note: schedule.memo.trim() || null,
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
