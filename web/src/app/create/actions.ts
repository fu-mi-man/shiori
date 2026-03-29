"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { overviews as overviewsTable } from "@/db/schema/overviews";
import { schedules as schedulesTable } from "@/db/schema/schedules";
import { shioris } from "@/db/schema/shioris";
import { createShioriSchema } from "./schema";

/** しおり作成 Server Action の状態型 */
export type CreateShioriState = {
  status: "idle" | "error";
  message: string;
};

/**
 * しおりを新規作成する Server Action
 *
 * バリデーション → DB トランザクション（shioris / overviews / schedules の INSERT）→ 閲覧画面へリダイレクト
 */
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

  // 全フィールドが空の予定を除外してからバリデーション
  const filteredDays = days.map((day) => ({
    ...day,
    schedules: day.schedules.filter((s) => s.time || s.title || s.memo),
  }));

  if (filteredDays.some((day) => day.schedules.length === 0)) {
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
          startDate: startDate || null,
        })
        .returning({ id: shioris.id });

      shioriId = shiori.id;

      // 2. overviews に INSERT（タイトル・内容が両方空のものは除外）
      const nonEmptyOverviews = overviews.filter(
        (o) => o.title.trim() !== "" || o.content.trim() !== "",
      );
      if (nonEmptyOverviews.length > 0) {
        await tx.insert(overviewsTable).values(
          nonEmptyOverviews.map((item, i) => ({
            shioriId: shiori.id,
            sortOrder: i,
            title: item.title,
            content: item.content,
          })),
        );
      }

      // 3. schedules に INSERT
      const scheduleRows = filteredDays.flatMap((day, dayIndex) =>
        day.schedules.map((schedule, scheduleIndex) => ({
          shioriId: shiori.id,
          sortOrder: scheduleIndex,
          dayNumber: dayIndex + 1,
          date: startDate ? addDays(startDate, dayIndex) : null,
          time: schedule.time || null,
          title: schedule.title || null,
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
