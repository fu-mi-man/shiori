## Vitest

Viteベースのテストランナー。  
TypeScript・ESModulesとの相性が良く，Jestより設定がシンプル。

> 公式ドキュメント: https://vitest.dev/guide/

### 1. インストール

`docker compose run` を使う理由は `../dev-guide.md` のパッケージ管理を参照。

```bash
docker compose down
docker compose build web
docker compose run --rm web pnpm add -D vitest @vitejs/plugin-react @vitest/coverage-v8 @vitest/ui
docker compose up --build -d
```

| パッケージ | 用途 |
|-----------|------|
| `vitest` | テストランナー本体 |
| `@vitejs/plugin-react` | JSX変換（Reactコンポーネントのテストに必要） |
| `@vitest/coverage-v8` | V8エンジンによるカバレッジ計測 |
| `@vitest/ui` | ブラウザUIでテスト結果を確認 |

> Testing Library（`@testing-library/react`, `@testing-library/jest-dom`, `jsdom`）はコンポーネントテストの段階で追加する。初期セットアップでは不要。

> **注意**: `docker compose build web` を `run --rm` の前に必ず実行すること。省略すると pnpm のストアパス設定が一致せず `ERR_PNPM_UNEXPECTED_STORE` エラーが発生する。

### 2. vitest.config.ts を作成

`web/vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()], // JSX変換を有効化（Reactコンポーネントのテストに必要）

  resolve: {
    alias: {
      // tsconfig.jsonの"@/*": ["./src/*"]と同期。import.meta.urlはVitest公式推奨のESModules対応パス解決
      "@/": new URL("./src/", import.meta.url).pathname,
    },
  },

  test: {
    include: ["tests/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"], // tests/配下（推奨）とsrc/配下（コロケーション）の両方を対象
    environment: "node", // デフォルトはNode.js環境。コンポーネントテスト時はファイル先頭に // @vitest-environment jsdom を指定
    coverage: {
      provider: "v8",
      reporter: ["text", "html"], // text: ターミナル表示，html: ブラウザで詳細確認
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/db/migrations/**"],
    },
  },
});
```

| 設定 | 値 | 理由 |
|------|-----|------|
| `plugins` | `react()` | JSX変換を有効化 |
| `resolve.alias` | `@/ → src/` | `tsconfig.json` のパスエイリアスと同期。`import.meta.url` はESModules対応のパス解決（Vitest公式推奨） |
| `test.include` | `tests/` と `src/` | `tests/` を推奨しつつ，コロケーションも許容 |
| `test.environment` | `"node"` | ユニット・統合テストのデフォルト。コンポーネントテスト時はファイル先頭に `// @vitest-environment jsdom` を指定 |
| `coverage.provider` | `"v8"` | Node.js内蔵のV8カバレッジ。追加インストール不要で高速 |
| `coverage.reporter` | `["text", "html"]` | `text`: ターミナル確認用，`html`: `coverage/` ディレクトリにHTML生成 |

### 3. package.json にスクリプトを追加

```jsonc
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "typecheck": "tsc --noEmit"
  }
}
```

| コマンド | 実行内容 | 用途 |
|---------|---------|------|
| `pnpm test` | ウォッチモードでテスト実行 | 開発中 |
| `pnpm exec vitest run` | テストを1回実行して終了 | CI・pre-commit |
| `pnpm test:coverage` | カバレッジ付きで1回実行 | カバレッジ確認時 |
| `pnpm typecheck` | TypeScriptの型チェック | CI・pre-commit |

### 4. テストディレクトリを作成

```bash
mkdir -p tests/integration
```

```text
web/
├── src/
│   └── **/*.test.ts   # 単体テスト（ソース横・コロケーション）
└── tests/
    ├── e2e/           # E2Eテスト（Playwright）
    └── integration/   # 統合テスト
```

### 5. 動作確認

```bash
# テスト実行
docker compose exec web pnpm exec vitest run

# カバレッジ計測
docker compose exec web pnpm test:coverage

# UI（ブラウザで確認）
docker compose exec web pnpm exec vitest --ui
```

### 6. カバレッジの見方

`pnpm test:coverage` を実行すると以下が出力される。

```
 % Coverage report from v8
---------|---------|---------|---------|---------
File     | % Stmts | % Branch| % Funcs | % Lines |
---------|---------|---------|---------|---------
...
```

| 列 | 意味 |
|----|------|
| `% Stmts` | ステートメント（命令）の実行率 |
| `% Branch` | 分岐（if/else等）の網羅率 |
| `% Funcs` | 関数の呼び出し率 |
| `% Lines` | 行の実行率 |

HTMLレポートは `web/coverage/index.html` に生成される（`.gitignore` 推奨）。
