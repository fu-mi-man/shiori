import { describe, expect, it } from "vitest";
import { createShioriSchema } from "./schema";

/** テスト用の最小限の有効データ */
const validInput = {
  title: "沖縄旅行",
  overviews: [],
  days: [],
  startDate: "",
};

describe("createShioriSchema", () => {
  describe("overviews", () => {
    const overview = { title: "", content: "" };

    it("overviewsが10件のとき，成功する", () => {
      const result = createShioriSchema.safeParse({
        ...validInput,
        overviews: Array(10).fill(overview),
      });
      expect(result.success).toBe(true);
    });

    it("overviewsが11件のとき，バリデーションエラーになる", () => {
      const result = createShioriSchema.safeParse({
        ...validInput,
        overviews: Array(11).fill(overview),
      });
      expect(result.success).toBe(false);
    });

    it("overviewのtitleが255文字のとき，成功する", () => {
      const result = createShioriSchema.safeParse({
        ...validInput,
        overviews: [{ title: "a".repeat(255), content: "" }],
      });
      expect(result.success).toBe(true);
    });

    it("overviewのtitleが256文字のとき，バリデーションエラーになる", () => {
      const result = createShioriSchema.safeParse({
        ...validInput,
        overviews: [{ title: "a".repeat(256), content: "" }],
      });
      expect(result.success).toBe(false);
    });

    it("overviewのcontentが500文字のとき，成功する", () => {
      const result = createShioriSchema.safeParse({
        ...validInput,
        overviews: [{ title: "", content: "a".repeat(500) }],
      });
      expect(result.success).toBe(true);
    });

    it("overviewのcontentが501文字のとき，バリデーションエラーになる", () => {
      const result = createShioriSchema.safeParse({
        ...validInput,
        overviews: [{ title: "", content: "a".repeat(501) }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("startDate", () => {
    it.each([
      ["ISO形式の日付", "2025-08-01"],
      ["空文字", ""],
    ])("%s のとき，成功する", (_, date) => {
      const result = createShioriSchema.safeParse({ ...validInput, startDate: date });
      expect(result.success).toBe(true);
    });

    it.each([
      ["スラッシュ区切り", "2025/08/01"],
      ["不正な文字列", "abc"],
    ])("%s のとき，バリデーションエラーになる", (_, date) => {
      const result = createShioriSchema.safeParse({ ...validInput, startDate: date });
      expect(result.success).toBe(false);
    });
  });

  describe("days", () => {
    const schedule = { time: "", title: "", memo: "" };
    const day = { schedules: [schedule] };

    it("daysが10件のとき，成功する", () => {
      const result = createShioriSchema.safeParse({ ...validInput, days: Array(10).fill(day) });
      expect(result.success).toBe(true);
    });

    it("daysが11件のとき，バリデーションエラーになる", () => {
      const result = createShioriSchema.safeParse({ ...validInput, days: Array(11).fill(day) });
      expect(result.success).toBe(false);
    });

    it("scheduleのtitleが255文字のとき，成功する", () => {
      const result = createShioriSchema.safeParse({
        ...validInput,
        days: [{ schedules: [{ ...schedule, title: "a".repeat(255) }] }],
      });
      expect(result.success).toBe(true);
    });

    it("scheduleのtitleが256文字のとき，バリデーションエラーになる", () => {
      const result = createShioriSchema.safeParse({
        ...validInput,
        days: [{ schedules: [{ ...schedule, title: "a".repeat(256) }] }],
      });
      expect(result.success).toBe(false);
    });

    it("scheduleのmemoが200文字のとき，成功する", () => {
      const result = createShioriSchema.safeParse({
        ...validInput,
        days: [{ schedules: [{ ...schedule, memo: "a".repeat(200) }] }],
      });
      expect(result.success).toBe(true);
    });

    it("scheduleのmemoが201文字のとき，バリデーションエラーになる", () => {
      const result = createShioriSchema.safeParse({
        ...validInput,
        days: [{ schedules: [{ ...schedule, memo: "a".repeat(201) }] }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe("passphrase", () => {
    it("省略したとき，空文字がデフォルト値になる", () => {
      const result = createShioriSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.passphrase).toBe("");
      }
    });

    it("255文字のとき，成功する", () => {
      const result = createShioriSchema.safeParse({ ...validInput, passphrase: "a".repeat(255) });
      expect(result.success).toBe(true);
    });

    it("256文字のとき，バリデーションエラーになる", () => {
      const result = createShioriSchema.safeParse({ ...validInput, passphrase: "a".repeat(256) });
      expect(result.success).toBe(false);
    });
  });

  describe("title", () => {
    it("有効なタイトルのとき，成功する", () => {
      const result = createShioriSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("タイトルが空のとき，バリデーションエラーになる", () => {
      const result = createShioriSchema.safeParse({ ...validInput, title: "" });
      expect(result.success).toBe(false);
    });

    it("タイトルが255文字のとき，成功する", () => {
      const result = createShioriSchema.safeParse({ ...validInput, title: "a".repeat(255) });
      expect(result.success).toBe(true);
    });

    it("タイトルが256文字のとき，バリデーションエラーになる", () => {
      const result = createShioriSchema.safeParse({ ...validInput, title: "a".repeat(256) });
      expect(result.success).toBe(false);
    });

    it("絵文字を含むタイトルのとき，成功する", () => {
      const result = createShioriSchema.safeParse({ ...validInput, title: "🌺沖縄旅行" });
      expect(result.success).toBe(true);
    });
  });
});
