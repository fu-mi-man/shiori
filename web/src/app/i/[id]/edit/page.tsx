import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import z from "zod";
import { Header } from "@/components/features/common/Header";
import { CreateForm } from "@/components/features/create/CreateForm";
import { db } from "@/db";
import { shioris } from "@/db/schema";
import { updateShiori } from "./actions";

/**
 * 旅のしおり編集ページ
 *
 * @param params - 動的ルートパラメータ（IDを含む）
 * @returns 旅のしおり編集ページのJSX
 */
export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!z.uuid().safeParse(id).success) {
    notFound();
  }

  const shiori = await db.query.shioris.findFirst({
    where: eq(shioris.id, id),
    with: {
      overviews: {
        orderBy: (overviews, { asc }) => [asc(overviews.sortOrder)],
      },
      schedules: {
        orderBy: (schedules, { asc }) => [asc(schedules.dayNumber), asc(schedules.sortOrder)],
      },
    },
  });

  if (!shiori) {
    notFound();
  }

  const initialOverviews = shiori.overviews.map((o) => ({
    id: o.id,
    title: o.title ?? "",
    content: o.content ?? "",
  }));

  const groupedByDay = Object.groupBy(shiori.schedules, (s) => s.dayNumber ?? 0);
  const initialDays = Object.entries(groupedByDay)
    .filter((entry): entry is [string, typeof shiori.schedules] => entry[1] !== undefined)
    .map(([, schedules]) => ({
      id: schedules[0].dayNumber ?? 0,
      schedules: schedules.map((s) => ({
        id: s.id,
        time: s.time?.slice(0, 5) ?? "",
        title: s.title ?? "",
        memo: s.note ?? "",
      })),
    }));

  // startDateはshiorisテーブルから取得。既存レコード（カラム追加前）はschedules[day1].dateにフォールバック
  const initialStartDate =
    shiori.startDate ?? shiori.schedules.find((s) => s.dayNumber === 1)?.date ?? "";

  return (
    <main className="mx-auto min-h-dvh max-w-[480px] bg-[#F5F4F1]">
      <Header className="max-w-[480px] px-5" />
      <CreateForm
        action={updateShiori.bind(null, id)}
        initialDays={initialDays}
        initialOverviews={initialOverviews}
        initialStartDate={initialStartDate}
        initialTitle={shiori.title}
        key={id}
        submitLabel="更新する"
      />
    </main>
  );
}
