import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import z from "zod";
import { db } from "@/db";
import { shioris } from "@/db/schema";

export default async function ShioriPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!z.uuid().safeParse(id).success) {
    notFound();
  }

  const shiori = await db.query.shioris.findFirst({
    where: eq(shioris.id, id),
  });

  if (!shiori) {
    notFound();
  }

  return (
    <main>
      <header className="bg-[#3D8A5A] px-5 py-6">
        <h1 className="font-bold text-[22px] text-white tracking-tight">{shiori.title}</h1>
      </header>
      <div className="px-5 py-6">
        <p className="text-[#6D6C6A] text-sm">
          しおりが作成されました。表示画面は今後実装予定です。
        </p>
      </div>
    </main>
  );
}
