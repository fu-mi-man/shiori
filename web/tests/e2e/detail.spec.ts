import { expect, test } from "@playwright/test";

test.describe("詳細ページ", () => {
  let shioriUrl: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto("/create");

    // タイトル
    await page.getByLabel("タイトル").fill("E2Eテスト用しおり");

    // 旅の情報を1件追加
    await page.getByRole("button", { name: "追加", exact: true }).click();
    await page.getByLabel("項目").fill("持ち物");
    await page.getByLabel("内容").fill("日焼け止め");

    // 1日目のスケジュール
    await page.getByLabel("予定").first().fill("美ら海水族館");

    // 2日目を追加してスケジュール入力
    await page.getByRole("button", { name: "日程を追加" }).click();
    await page.getByLabel("予定").last().fill("首里城");

    // 作成
    await page.getByRole("button", { name: "作成する" }).click();
    await page.waitForURL(/\/i\//);
    shioriUrl = page.url();
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(shioriUrl);
  });

  test("タイトル「E2Eテスト用しおり」が表示される", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText("E2Eテスト用しおり");
  });

  test("旅の情報の項目「持ち物」が表示される", async ({ page }) => {
    await expect(page.getByText("持ち物")).toBeVisible();
  });

  test("旅の情報の内容「日焼け止め」が表示される", async ({ page }) => {
    await expect(page.getByText("日焼け止め")).toBeVisible();
  });

  test("「1日目」の見出しが表示される", async ({ page }) => {
    await expect(page.getByText("1日目")).toBeVisible();
  });

  test("1日目のスケジュール「美ら海水族館」が表示される", async ({ page }) => {
    await expect(page.getByText("美ら海水族館")).toBeVisible();
  });

  test("「2日目」の見出しが表示される", async ({ page }) => {
    await expect(page.getByText("2日目")).toBeVisible();
  });

  test("2日目のスケジュール「首里城」が表示される", async ({ page }) => {
    await expect(page.getByText("首里城")).toBeVisible();
  });

  test("「編集する」をクリックしたとき，/i/[id]/edit に遷移する", async ({ page }) => {
    await page.getByRole("link", { name: "編集する" }).click();
    await expect(page).toHaveURL(/\/i\/.+\/edit/);
  });

  test("「URLをコピー」をクリックしたとき，トーストが表示される", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-write"]);
    await page.getByRole("button", { name: "URLをコピー" }).click();
    await expect(page.getByText("URLをコピーしました")).toBeVisible();
  });

  test("存在しない ID にアクセスしたとき，404 ページが表示される", async ({ page }) => {
    await page.goto("/i/00000000-0000-0000-0000-000000000000");
    await expect(page.getByText("404")).toBeVisible();
  });
});
