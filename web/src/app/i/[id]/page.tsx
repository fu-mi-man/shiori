import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import z from "zod";
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
    },
  });

  if (!shiori) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-dvh max-w-[480px] bg-[#F5F4F1]">
      <header className="bg-[#3D8A5A] px-5 py-6">
        <h1 className="font-bold text-[22px] text-white tracking-tight">{shiori.title}</h1>
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
