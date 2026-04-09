import { describe, expect, it } from "vitest";
import { updateShioriSchema } from "./schema";

const validInput = {
  title: "沖縄旅行",
  overviews: [],
  days: [],
  startDate: "",
};

describe("updateShioriSchema", () => {
  it("有効な入力のとき，成功する", () => {
    const result = updateShioriSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("passphrase を含む入力でも，result.data に passphrase が含まれない", () => {
    const result = updateShioriSchema.safeParse({
      ...validInput,
      passphrase: "secret",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("passphrase");
    }
  });
});
