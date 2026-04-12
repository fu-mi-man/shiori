import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createShiori } from "@/app/create/actions";
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

function getCreatedId(): string {
  expect(redirect).toHaveBeenCalledTimes(1);
  const url = vi.mocked(redirect).mock.calls[0][0] as string;
  return url.replace("/i/", "");
}

describe("createShiori", () => {
  let createdId: string | null = null;

  afterEach(async () => {
    if (createdId) {
      await db.delete(shioris).where(eq(shioris.id, createdId));
      createdId = null;
    }
    vi.clearAllMocks();
  });

  it("有効なタイトルを渡したとき，shioris にレコードが挿入される", async () => {
    await createShiori(idle, makeFormData({ title: "沖縄旅行" }));
    createdId = getCreatedId();

    const [row] = await db.select().from(shioris).where(eq(shioris.id, createdId));
    expect(row.title).toBe("沖縄旅行");
  });

  it("概要を渡したとき，overviews にレコードが挿入される", async () => {
    const overviews = JSON.stringify([{ title: "持ち物", content: "パスポート" }]);
    await createShiori(idle, makeFormData({ overviews }));
    createdId = getCreatedId();

    const rows = await db
      .select()
      .from(overviewsTable)
      .where(eq(overviewsTable.shioriId, createdId));
    expect(rows[0].content).toBe("パスポート");
  });

  it("スケジュールを渡したとき，schedules にレコードが挿入される", async () => {
    const days = JSON.stringify([{ schedules: [{ time: "10:00", title: "那覇空港", memo: "" }] }]);
    await createShiori(idle, makeFormData({ days }));
    createdId = getCreatedId();

    const rows = await db
      .select()
      .from(schedulesTable)
      .where(eq(schedulesTable.shioriId, createdId));
    expect(rows[0].title).toBe("那覇空港");
  });

  it("startDate を渡したとき，1日目の date が startDate と一致する", async () => {
    const days = JSON.stringify([{ schedules: [{ time: "10:00", title: "那覇空港", memo: "" }] }]);
    await createShiori(idle, makeFormData({ days, startDate: "2025-08-01" }));
    createdId = getCreatedId();

    const rows = await db
      .select()
      .from(schedulesTable)
      .where(eq(schedulesTable.shioriId, createdId));
    expect(rows[0].date).toBe("2025-08-01");
  });

  it("startDate を渡したとき，2日目の date が startDate の翌日になる", async () => {
    const days = JSON.stringify([
      { schedules: [{ time: "09:00", title: "1日目", memo: "" }] },
      { schedules: [{ time: "10:00", title: "2日目", memo: "" }] },
    ]);
    await createShiori(idle, makeFormData({ days, startDate: "2025-08-01" }));
    createdId = getCreatedId();

    const rows = await db
      .select()
      .from(schedulesTable)
      .where(eq(schedulesTable.shioriId, createdId))
      .orderBy(schedulesTable.dayNumber);
    expect(rows[1].date).toBe("2025-08-02");
  });

  it("startDate が空のとき，schedules の date は null になる", async () => {
    const days = JSON.stringify([{ schedules: [{ time: "10:00", title: "那覇空港", memo: "" }] }]);
    await createShiori(idle, makeFormData({ days, startDate: "" }));
    createdId = getCreatedId();

    const rows = await db
      .select()
      .from(schedulesTable)
      .where(eq(schedulesTable.shioriId, createdId));
    expect(rows[0].date).toBeNull();
  });

  it("startDate を渡したとき，shioris.startDate に保存される", async () => {
    await createShiori(idle, makeFormData({ startDate: "2025-08-01" }));
    createdId = getCreatedId();

    const [row] = await db.select().from(shioris).where(eq(shioris.id, createdId));
    expect(row.startDate).toBe("2025-08-01");
  });

  it("概要のタイトルのみ空のとき，overviews にレコードが挿入される", async () => {
    const overviews = JSON.stringify([{ title: "", content: "パスポート" }]);
    await createShiori(idle, makeFormData({ overviews }));
    createdId = getCreatedId();

    const rows = await db
      .select()
      .from(overviewsTable)
      .where(eq(overviewsTable.shioriId, createdId));
    expect(rows[0].content).toBe("パスポート");
  });

  it("概要のタイトル・内容が両方空のとき，overviews にレコードが挿入されない", async () => {
    const overviews = JSON.stringify([{ title: "", content: "" }]);
    await createShiori(idle, makeFormData({ overviews }));
    createdId = getCreatedId();

    const rows = await db
      .select()
      .from(overviewsTable)
      .where(eq(overviewsTable.shioriId, createdId));
    expect(rows).toHaveLength(0);
  });

  it("スケジュールの全フィールドが空のとき，schedules にレコードが挿入されない", async () => {
    const days = JSON.stringify([{ schedules: [{ time: "", title: "", memo: "" }] }]);
    await createShiori(idle, makeFormData({ days }));
    createdId = getCreatedId();

    const rows = await db
      .select()
      .from(schedulesTable)
      .where(eq(schedulesTable.shioriId, createdId));
    expect(rows).toHaveLength(0);
  });

  it("パスフレーズを渡したとき，shioris.passphrase に保存される", async () => {
    await createShiori(idle, makeFormData({ passphrase: "secret123" }));
    createdId = getCreatedId();

    const [row] = await db.select().from(shioris).where(eq(shioris.id, createdId));
    expect(row.passphrase).toBe("secret123");
  });
});
