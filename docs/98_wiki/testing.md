## テスト方針

本ドキュメントは，Tabiji プロジェクトのテスト戦略・テストの書き方・運用方針をまとめたものである。

---

## テスト戦略

### テスト種別と役割

| 種別 | ツール | 対象 | 配置 |
|------|--------|------|------|
| 単体テスト | Vitest | Zod スキーマ，ユーティリティ関数，純粋関数 | ソース横 (`*.test.ts`) または `tests/unit/` |
| 統合テスト | Vitest | Server Actions（DB を含むロジック） | `tests/integration/` |
| E2E テスト | Playwright | 画面操作・ページ遷移 | `tests/e2e/` |

### 優先順位

```
高
  ├── 1. Zod スキーマ（バリデーションロジック）← まずここ
  ├── 2. ユーティリティ関数（純粋関数）
  └── 3. 条件分岐の複雑な関数

低
  ├── 4. Server Actions（DB モック or 統合テストで対応）
  └── 5. UI コンポーネント（E2E で対応）

テスト不要
  ├── Next.js の内部動作（フレームワークが保証）
  ├── shadcn/ui のコンポーネント動作（ライブラリが保証）
  └── 自明な 1 行関数
```

---

## テストの書き方

### 基本構造

```ts
import { describe, it, expect } from "vitest"
import { mySchema } from "./schema"

// describe: テスト対象のまとまり（ファイル・機能単位）
describe("mySchema", () => {

  // it: 1 つの振る舞いの仕様。「〜のとき，〜になる」形式で書く
  it("タイトルが空のとき，バリデーションエラーになる", () => {
    const result = mySchema.safeParse({ title: "" })

    // expect: こうなるはず，という断言
    expect(result.success).toBe(false)
  })
})
```

### テスト説明文の書き方

`it()` の説明文はそのままテスト仕様になる。別途仕様書は不要。

```ts
// ✅ 仕様として読める
it("タイトルが空のとき，バリデーションエラーになる")
it("タイトルが 50 文字のとき，成功する")
it("タイトルが 51 文字のとき，バリデーションエラーになる")

// ❌ 仕様として読めない
it("title validation")
it("test 1")
```

### `it.each` の使い方

同じパターンで入力だけ違うケースが複数あるとき（3件以上が目安）は `it.each` でまとめる。
**成功ケースと失敗ケースは分けて書く**のが読みやすい。

```ts
// ✅ 成功・失敗を分けて，ラベルを第1要素にする
it.each([
  ["ISO形式の日付", "2025-08-01"],
  ["空文字",        ""],
])("%s のとき，成功する", (_, date) => {
  expect(schema.safeParse({ startDate: date }).success).toBe(true);
});

it.each([
  ["スラッシュ区切り", "2025/08/01"],
  ["不正な文字列",     "abc"],
])("%s のとき，バリデーションエラーになる", (_, date) => {
  expect(schema.safeParse({ startDate: date }).success).toBe(false);
});

// ❌ 成功・失敗を混在させると出力が英語まじりで読みにくい
it.each([
  ["2025-08-01", true],
  ["abc",        false],
])("'%s' のとき，success は %s", (date, expected) => { ... });
```

### 1 テスト 1 アサーション

`expect` が複数必要になったら，`it` を分割することを検討する。

```ts
// ❌ 1 つの it に複数の関心事が混在
it("バリデーション", () => {
  expect(schema.safeParse({ title: "" }).success).toBe(false)
  expect(schema.safeParse({ title: "a".repeat(51) }).success).toBe(false)
  expect(schema.safeParse({ title: "正常" }).success).toBe(true)
})

// ✅ 関心事ごとに分離
it("タイトルが空のとき，バリデーションエラーになる", () => {
  expect(schema.safeParse({ title: "" }).success).toBe(false)
})

it("タイトルが 51 文字のとき，バリデーションエラーになる", () => {
  expect(schema.safeParse({ title: "a".repeat(51) }).success).toBe(false)
})

it("タイトルが 50 文字のとき，成功する", () => {
  expect(schema.safeParse({ title: "a".repeat(50) }).success).toBe(true)
})
```

### Red-Green サイクル（失敗から書く）

1. `expect(result.success).toBe(false)` を先に書いてテストが失敗することを確認
2. ロジックを書いてテストをパスさせる
3. リファクタリング

---

## ファイル配置

```
web/
├── src/
│   └── app/
│       └── create/
│           ├── schema.ts        ← ソース
│           └── schema.test.ts   ← 単体テスト（ソース横配置を推奨）
│
└── tests/
    ├── e2e/           # Playwright E2E テスト
    ├── integration/   # Vitest 統合テスト（DB を含む）
    └── unit/          # Vitest 単体テスト（ソース横に置けない場合）
```

Zod スキーマやユーティリティ関数はソース横（`schema.test.ts`）に置く。
ソースファイルと 1 対 1 で対応させることで，テストの所在が明確になる。

---

## 文字列長テストの注意点

Zod の `.max(n)` は JavaScript の `string.length`（UTF-16 コード単位数）を使う。
境界値テストに `"a".repeat(n)` を使っていい理由はここにある。

| 文字種 | 例 | `.length` |
|--------|-----|-----------|
| 半角英数 | `"a"` | 1 |
| ひらがな・カタカナ・漢字 | `"あ"` `"ア"` `"旅"` | 1 |
| 全角英数・記号 | `"Ａ"` `"！"` | 1 |
| 半角カタカナ | `"ｱ"` | 1 |
| **絵文字** | `"🌺"` | **2**（サロゲートペア） |

通常の日本語文字はすべて 1 なので、`"a".repeat(255)` と `"あ".repeat(255)` は同じ結果になる。
絵文字だけは 2 になるため、ユーザーが思ったより少ない文字数で上限に引っかかる可能性がある。
絵文字が入力されうる箇所は別途テストを追加しておく。

---

## コマンド

```bash
# テスト実行（コンテナ内）
docker compose exec web pnpm exec vitest run     # 1 回実行（CI・コミット前）
docker compose exec web pnpm test                # ウォッチモード（開発中）

# E2E テスト（ホストの web/ で実行）
pnpm exec playwright test --project=chromium
```

---

## 参考

- セットアップ手順: `docs/98_wiki/setup/04_vitest.md`
- Playwright セットアップ: `docs/98_wiki/setup/08_playwright.md`
