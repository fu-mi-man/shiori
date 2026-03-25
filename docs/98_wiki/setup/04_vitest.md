
## Vitest

Viteベースのテストランナー。  
TypeScript・ESModulesとの相性が良く，Jestより設定がシンプル。

> 公式ドキュメント: https://vitest.dev/guide/

### 1. インストール

`docker compose run` を使う理由は `98_wiki/dev-guide.md` のパッケージ管理を参照。

```bash
docker compose stop web
docker compose run --rm web pnpm add -D vitest @vitejs/plugin-react
docker compose rm -v web
docker compose up --build -d
```

| パッケージ | 用途 |
|-----------|------|
| `vitest` | テストランナー本体 |
| `@vitejs/plugin-react` | JSX変換（Reactコンポーネントのテストに必要） |

> Testing Library（`@testing-library/react`, `@testing-library/jest-dom`, `jsdom`）はコンポーネントテストの段階で追加する。初期セットアップでは不要。

### 2. vitest.config.ts を作成

`web/vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/": new URL("./src/", import.meta.url).pathname,
    },
  },
  test: {
    include: ["tests/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
    environment: "node",
  },
});
```

| 設定 | 値 | 理由 |
|------|-----|------|
| `plugins` | `react()` | JSX変換を有効化 |
| `resolve.alias` | `@/ → src/` | `tsconfig.json` のパスエイリアスと同期。`import.meta.url` はESModules対応のパス解決（Vitest公式推奨） |
| `test.include` | `tests/` と `src/` | `tests/` を推奨しつつ，コロケーションも許容 |
| `test.environment` | `"node"` | ユニット・統合テストのデフォルト。コンポーネントテスト時はファイル先頭に `// @vitest-environment jsdom` を指定 |

### 3. package.json にスクリプトを追加

```jsonc
{
  "scripts": {
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

| コマンド | 実行内容 | 用途 |
|---------|---------|------|
| `pnpm test` | ウォッチモードでテスト実行 | 開発中 |
| `pnpm exec vitest run` | テストを1回実行して終了 | CI・pre-commit |
| `pnpm typecheck` | TypeScriptの型チェック | CI・pre-commit |

### 4. テストディレクトリを作成

```bash
mkdir -p tests/unit tests/integration
```

```text
web/tests/
├── e2e/           # E2Eテスト（Playwright）
├── integration/   # 統合テスト
└── unit/          # ユニットテスト
```

### 5. サンプルテストで動作確認

`tests/unit/sample.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("sample", () => {
  it("should work", () => {
    expect(1 + 1).toBe(2);
  });
});
```

```bash
pnpm exec vitest run
```

テストがパスすれば完了。サンプルテストは確認後に削除してよい。  
`exit` でコンテナを出る。

### 将来の拡張

| タイミング | 追加パッケージ |
|-----------|--------------|
| コンポーネントテスト開始時 | `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` |
| カバレッジ計測時 | `@vitest/coverage-v8` |
