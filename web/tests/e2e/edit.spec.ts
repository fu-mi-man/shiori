import { expect, test } from "@playwright/test";

test.describe("編集ページ", () => {
  let shioriEditUrl: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto("/create");
    await page.getByLabel("タイトル").fill("編集テスト用しおり");
    await page.getByRole("button", { name: "作成する" }).click();
    await page.waitForURL(/\/i\//);
    shioriEditUrl = `${page.url()}/edit`;
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(shioriEditUrl);
  });

  test("フォームにタイトル「編集テスト用しおり」が入力済みで表示される", async ({ page }) => {
    await expect(page.getByLabel("タイトル")).toHaveValue("編集テスト用しおり");
  });

  test("ヘッダーの「Tabiji」をクリックしたとき，/ に遷移する", async ({ page }) => {
    await page.locator("header").getByRole("link", { name: "Tabiji" }).click();
    await expect(page).toHaveURL("/");
  });

  test("フッターの「Tabiji」をクリックしたとき，/ に遷移する", async ({ page }) => {
    await page.getByRole("contentinfo").getByRole("link", { name: "Tabiji" }).click();
    await expect(page).toHaveURL("/");
  });

  test("タイトルを空にして「更新する」をクリックしたとき，エラートーストが表示される", async ({
    page,
  }) => {
    await page.getByLabel("タイトル").clear();
    await page.getByRole("button", { name: "更新する" }).click();
    await expect(page.getByText("タイトルは必須です")).toBeVisible();
  });

  test("タイトルを変更して「更新する」をクリックしたとき，/i/[id] に遷移し変更後のタイトルが表示される", async ({
    page,
  }) => {
    await page.getByLabel("タイトル").fill("編集後のしおり");
    await page.getByRole("button", { name: "更新する" }).click();
    await expect(page).toHaveURL(/\/i\/(?!.*\/edit).+/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("編集後のしおり");
  });
});
