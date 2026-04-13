import { expect, test } from "@playwright/test";

test.describe("トップページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("h1「旅のしおりをかんたん作成」が表示される", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText("旅のしおりをかんたん作成");
  });

  test("Hero の「しおりを作る」ボタンをクリックしたとき，/create に遷移する", async ({ page }) => {
    await page.getByRole("link", { name: "しおりを作る" }).first().click();
    await expect(page).toHaveURL("/create");
  });

  test("ページ下部の「しおりを作る」ボタンをクリックしたとき，/create に遷移する", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "しおりを作る" }).last().click();
    await expect(page).toHaveURL("/create");
  });

  test("「利用規約」リンクをクリックしたとき，/terms に遷移する", async ({ page }) => {
    await page.getByRole("link", { name: "利用規約" }).first().click();
    await expect(page).toHaveURL("/terms");
  });

  test("「プライバシーポリシー」リンクをクリックしたとき，/privacy に遷移する", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "プライバシーポリシー" }).first().click();
    await expect(page).toHaveURL("/privacy");
  });
});
