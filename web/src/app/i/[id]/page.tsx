import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { shioris } from "@/db/schema";

/** "10:38:00" → "10:38" */
function formatTime(time: string): string {
  return time.slice(0, 5);
}

/** "2026-03-15" → "3月15日（土）" */
function formatDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日（${weekday}）`;
}

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

        {/* 行程セクション */}
        {shiori.schedules.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="font-semibold text-[#1A1918] text-base tracking-tight">行程</h2>
            {Object.entries(Object.groupBy(shiori.schedules, (s) => s.dayNumber ?? 0)).map(
              ([dayNumber, schedules]) => (
                <div className="flex flex-col gap-2" key={dayNumber}>
                  {/* 日程ヘッダー */}
                  <div className="flex items-center gap-2.5">
                    <Badge variant="step">{dayNumber}日目</Badge>
                    {schedules?.[0]?.date && (
                      <span className="font-medium text-[#6D6C6A] text-[13px]">
                        {formatDate(schedules[0].date)}
                      </span>
                    )}
                    <div className="h-px flex-1 bg-[#E5E4E1]" />
                  </div>
                  {/* スケジュール一覧 */}
                  {schedules?.map((schedule, index) => {
                    const isLast = index === (schedules?.length ?? 0) - 1;
                    return (
                      <div className="flex" key={schedule.id}>
                        {/* タイムライン（左側） */}
                        <div className="flex w-10 flex-col items-center">
                          <div className="mt-1 size-3 shrink-0 rounded-full bg-[#3D8A5A]" />
                          {!isLast && <div className="w-0.5 flex-1 bg-[#E5E4E1]" />}
                        </div>
                        {/* コンテンツ（右側） */}
                        <div className="flex flex-col gap-1 pb-6 pl-1">
                          {schedule.time && (
                            <p className="font-semibold text-[#3D8A5A] text-[13px]">
                              {formatTime(schedule.time)}
                            </p>
                          )}
                          {schedule.title && (
                            <p className="font-semibold text-[#1A1918] text-[15px]">
                              {schedule.title}
                            </p>
                          )}
                          {schedule.note && (
                            <p className="text-[#9C9B99] text-[13px]">{schedule.note}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ),
            )}
          </section>
        )}
      </div>
    </main>
  );
}
