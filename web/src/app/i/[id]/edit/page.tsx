import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import z from "zod";
import { db } from "@/db";
import { shioris } from "@/db/schema";

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

  return (
    <main className="mx-auto min-h-dvh max-w-[480px] bg-[#F5F4F1]">
      <header className="flex flex-col gap-4 bg-[#3D8A5A] px-5 py-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-[22px] text-white tracking-tight">{shiori.title}</h1>
        </div>
      </header>
    </main>
  );
}
