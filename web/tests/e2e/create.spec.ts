import { expect, test } from "@playwright/test";

test.describe("作成ページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/create");
  });

  test("タイトル入力欄が表示される", async ({ page }) => {
    await expect(page.getByLabel("タイトル")).toBeVisible();
  });

  test("ヘッダーの「Tabiji」をクリックしたとき，/ に遷移する", async ({ page }) => {
    await page.locator("header").getByRole("link", { name: "Tabiji" }).click();
    await expect(page).toHaveURL("/");
  });

  test("フッターの「Tabiji」をクリックしたとき，/ に遷移する", async ({ page }) => {
    await page.getByRole("contentinfo").getByRole("link", { name: "Tabiji" }).click();
    await expect(page).toHaveURL("/");
  });

  test("タイトルを入力して「作成する」をクリックしたとき，/i/[id] に遷移する", async ({ page }) => {
    await page.getByLabel("タイトル").fill("沖縄旅行 2025年3月");
    await page.getByRole("button", { name: "作成する" }).click();
    await expect(page).toHaveURL(/\/i\//);
  });

  test("タイトルを空のまま「作成する」をクリックしたとき，エラートーストが表示される", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "作成する" }).click();
    await expect(page.getByText("タイトルは必須です")).toBeVisible();
  });
});
