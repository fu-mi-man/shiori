"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { overviews as overviewsTable } from "@/db/schema/overviews";
import { schedules as schedulesTable } from "@/db/schema/schedules";
import { shioris } from "@/db/schema/shioris";
import { addDays } from "@/lib/shiori/add-days";
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
    passphrase: formData.get("passphrase") ?? undefined,
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
      // - 全フィールドがスペースのみ・空の予定は除外（スペースのみは DB の time 型エラーを防ぐため trim() で判定）
      // - 元の days インデックスを使い dayNumber と date がズレないようにする
      const scheduleRows = days.flatMap((day, dayIndex) =>
        day.schedules
          .filter((s) => s.time.trim() || s.title.trim() || s.memo.trim())
          .map((schedule, scheduleIndex) => ({
            shioriId: shiori.id,
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

  redirect(`/i/${shioriId}`);
}
