import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateShiori } from "@/app/i/[id]/edit/actions";
import { db } from "@/db";
import { overviews as overviewsTable } from "@/db/schema/overviews";
import { schedules as schedulesTable } from "@/db/schema/schedules";
import { shioris } from "@/db/schema/shioris";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

const idle = { status: "idle" as const, message: "" };

function makeFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("title", "テスト旅行");
  fd.set("overviews", "[]");
  fd.set("days", "[]");
  fd.set("startDate", "");
  for (const [k, v] of Object.entries(overrides)) fd.set(k, v);
  return fd;
}

describe("updateShiori", () => {
  let shioriId: string;

  beforeEach(async () => {
    const [row] = await db
      .insert(shioris)
      .values({ title: "更新前タイトル", passphrase: "元のパスフレーズ" })
      .returning();
    shioriId = row.id;
  });

  afterEach(async () => {
    await db.delete(shioris).where(eq(shioris.id, shioriId));
    vi.clearAllMocks();
  });

  const action = (fd: FormData) => updateShiori(shioriId, idle, fd);

  it("有効なタイトルを渡したとき，shioris.title が更新される", async () => {
    await action(makeFormData({ title: "更新後タイトル" }));

    const [row] = await db.select().from(shioris).where(eq(shioris.id, shioriId));
    expect(row.title).toBe("更新後タイトル");
  });

  it("概要を渡したとき，overviews が新しい内容に置き換えられる", async () => {
    await db
      .insert(overviewsTable)
      .values({ shioriId, sortOrder: 0, title: "古い概要", content: "" });

    const overviews = JSON.stringify([{ title: "新しい概要", content: "内容" }]);
    await action(makeFormData({ overviews }));

    const rows = await db
      .select()
      .from(overviewsTable)
      .where(eq(overviewsTable.shioriId, shioriId));
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe("新しい概要");
  });

  it("スケジュールを渡したとき，schedules が新しい内容に置き換えられる", async () => {
    await db
      .insert(schedulesTable)
      .values({ shioriId, sortOrder: 0, dayNumber: 1, title: "古い予定" });

    const days = JSON.stringify([
      { schedules: [{ time: "10:00", title: "新しい予定", memo: "" }] },
    ]);
    await action(makeFormData({ days }));

    const rows = await db
      .select()
      .from(schedulesTable)
      .where(eq(schedulesTable.shioriId, shioriId));
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe("新しい予定");
  });

  it("startDate を渡したとき，schedules の date が更新される", async () => {
    await db.insert(schedulesTable).values({ shioriId, sortOrder: 0, dayNumber: 1, title: "予定" });

    const days = JSON.stringify([{ schedules: [{ time: "10:00", title: "予定", memo: "" }] }]);
    await action(makeFormData({ days, startDate: "2025-08-01" }));

    const rows = await db
      .select()
      .from(schedulesTable)
      .where(eq(schedulesTable.shioriId, shioriId));
    expect(rows[0].date).toBe("2025-08-01");
  });

  it("startDate が空のとき，schedules の date は null になる", async () => {
    await db
      .insert(schedulesTable)
      .values({ shioriId, sortOrder: 0, dayNumber: 1, title: "予定", date: "2025-08-01" });

    const days = JSON.stringify([{ schedules: [{ time: "10:00", title: "予定", memo: "" }] }]);
    await action(makeFormData({ days, startDate: "" }));

    const rows = await db
      .select()
      .from(schedulesTable)
      .where(eq(schedulesTable.shioriId, shioriId));
    expect(rows[0].date).toBeNull();
  });

  it("overviews を空にしたとき，既存の overviews が全削除される", async () => {
    await db
      .insert(overviewsTable)
      .values({ shioriId, sortOrder: 0, title: "削除対象", content: "" });

    await action(makeFormData({ overviews: "[]" }));

    const rows = await db
      .select()
      .from(overviewsTable)
      .where(eq(overviewsTable.shioriId, shioriId));
    expect(rows).toHaveLength(0);
  });

  it("schedules を空にしたとき，既存の schedules が全削除される", async () => {
    await db
      .insert(schedulesTable)
      .values({ shioriId, sortOrder: 0, dayNumber: 1, title: "削除対象" });

    await action(makeFormData({ days: "[]" }));

    const rows = await db
      .select()
      .from(schedulesTable)
      .where(eq(schedulesTable.shioriId, shioriId));
    expect(rows).toHaveLength(0);
  });

  it("フォームデータに passphrase が含まれていても，shioris.passphrase は変更されない", async () => {
    const fd = makeFormData();
    fd.set("passphrase", "別のパスフレーズ");
    await action(fd);

    const [row] = await db.select().from(shioris).where(eq(shioris.id, shioriId));
    expect(row.passphrase).toBe("元のパスフレーズ");
  });
});
