import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { shioris } from "@/db/schema";

export default async function ShioriPage({ params }: { params: Promise<{ id: string }> }) {
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

  const dates = shiori.schedules.map((s) => s.date).filter((d): d is string => d !== null);
  const minDate = dates.length > 0 ? dates[0] : null;
  const maxDate = dates.length > 0 ? dates[dates.length - 1] : null;

  return (
    <main className="mx-auto min-h-dvh max-w-[480px] bg-[#F5F4F1]">
      <header className="flex flex-col gap-4 bg-[#3D8A5A] px-5 py-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-[22px] text-white tracking-tight">{shiori.title}</h1>
          {minDate && maxDate && (
            <p className="text-[13px] text-white/80">
              {minDate} 〜 {maxDate}
            </p>
          )}
        </div>
        <div className="flex gap-2.5">
          <Button className="h-10 flex-1 rounded-full bg-white font-semibold text-[#3D8A5A] text-[13px] hover:bg-white/90">
            URLをコピー
          </Button>
          <Button className="h-10 flex-1 rounded-full bg-white font-semibold text-[#3D8A5A] text-[13px] hover:bg-white/90">
            編集する
          </Button>
        </div>
      </header>
      <div className="flex flex-col gap-6 px-5 py-6">
        {/* 概要セクション */}
        {shiori.overviews.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="font-semibold text-[#1A1918] text-base tracking-tight">概要</h2>
            {shiori.overviews.map((overview) => (
              <Card
                className="gap-2 border-[#E5E4E1] bg-white shadow-[0_2px_12px_rgba(26,25,24,0.03)]"
                key={overview.id}
              >
                {overview.title && (
                  <CardHeader>
                    <CardTitle className="font-semibold text-[#1A1918] text-sm">
                      {overview.title}
                    </CardTitle>
                  </CardHeader>
                )}
                {overview.content && (
                  <CardContent>
                    <p className="text-[#6D6C6A] text-sm leading-relaxed">{overview.content}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
