## 概要

本ドキュメントは，各種ツール・ライブラリの**導入手順**をまとめたものである。   
ツールの一覧と規約は `01_requirements/05_development.md` を参照のこと。

### 目次

0. [初期構築手順（プロジェクト作成時のみ）](#0-初期構築手順プロジェクト作成時のみ)
1. [スキル（Claude Code拡張）](#1-スキルclaude-code拡張)
2. [Biome](#2-biome)
3. [Vitest](#3-vitest)



## 0. 初期構築手順（プロジェクト作成時のみ）

> 以下はプロジェクト新規作成時に一度だけ実行する手順。通常の開発では参照不要。

### 1. 一時Dockerfileを作成

プロジェクトルートに一時的なDockerfileを作成（`web/`は`create-next-app`が空ディレクトリを要求するため）:

```dockerfile
FROM node:24-slim
WORKDIR /app
RUN corepack enable
```

### 2. Dockerイメージをビルド

```bash
docker build -t shiori-init .
```

### 3. Next.jsプロジェクトを作成

```bash
mkdir web
docker run --rm -it -v $(pwd)/web:/app shiori-init pnpm create next-app@latest . --typescript --tailwind --no-eslint --app --src-dir --import-alias='@/*'
```

| オプション | 意味 |
|-----------|------|
| `--rm` | 終了後にコンテナを削除 |
| `-it` | 対話モード（Corepackの確認プロンプトに応答するため必須） |
| `-v $(pwd)/web:/app` | web/ディレクトリをコンテナの/appにマウント |
| `--typescript` | TypeScriptを使用 |
| `--tailwind` | Tailwind CSSを使用 |
| `--no-eslint` | ESLintを無効化（Biomeで代替） |
| `--app` | App Routerを使用（Pages Routerではなく） |
| `--src-dir` | src/ディレクトリを使用（ソースと設定ファイルを分離） |
| `--import-alias='@/*'` | インポートエイリアスを`@/*`に設定 |

### 4. 一時Dockerfileを削除し，web/Dockerfileを作成

```bash
rm Dockerfile
```

`web/Dockerfile`:

```dockerfile
FROM node:24-slim
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install
EXPOSE 3000
CMD ["pnpm", "dev"]
```

### 5. compose.yamlを作成

リポジトリルートに `compose.yaml` を配置:

```yaml
services:
  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./web:/app
      - node_modules:/app/node_modules
    environment:
      - NODE_ENV=development
    container_name: shiori-web
    stdin_open: true
    tty: true

volumes:
  node_modules:
```

### 6. クリーンアップと開発サーバーの起動

```bash
docker rmi shiori-init                   # 一時イメージを削除
docker volume rm shiori_node_modules     # 旧構成のボリュームが残っている場合のみ
docker compose up --build
```



## 1. スキル（Claude Code拡張）

Claude Codeにベストプラクティスを教えるスキルファイル。  
`.claude/skills/` にインストールされ，Git管理される。clone した時点でチーム全員が使える。

> スキルの一覧と詳細は `01_requirements/05_development.md` の「推奨プラグイン・スキル」を参照。

### 1. インストール

ホストで実行する（プロジェクトルートの `.claude/skills/` にインストールするため）。  
内部で `git clone` を使うので，ホストに `git` と `Node.js`（npx）が必要。

#### Vercel: agent-skills（React全般のベストプラクティス）

```bash
npx skills add vercel-labs/agent-skills -a claude-code
```

選択するスキル: `vercel-composition-patterns`, `vercel-react-best-practices`, `web-design-guidelines`（`vercel-react-native-skills` はモバイルアプリ用なので不要）

#### Vercel: next-skills（Next.js固有のベストプラクティス）

```bash
npx skills add vercel-labs/next-skills -a claude-code
```

含まれるスキル: `next-best-practices`, `next-cache-components`, `next-upgrade`

#### Anthropic: skills（開発支援・メタスキル）

```bash
npx skills add anthropics/skills --skill frontend-design --skill skill-creator -a claude-code
```

`--skill` で必要なスキルだけを選択してインストールする。

#### shadcn/ui スキル

> **注意**: shadcn/ui の init（`06_shadcn.md`）を完了して `components.json` が生成された後に実行すること

```bash
npx skills add shadcn/ui
```

`components.json` を読んでプロジェクト構成を把握し，shadcn/ui コンポーネントの正しいコードを生成できるようになる。

### 2. 動作確認

```bash
ls .claude/skills/
```

各スキルのディレクトリ（`SKILL.md` を含む）が表示されれば完了。

### 3. インストール時の選択肢

対話式プロンプトで以下を選択する:

| 項目 | 選択 | 理由 |
|------|------|------|
| Installation scope | **Project** | Git管理されチームで共有できる |
| Installation method | **Symlink** | `npx skills update` で一括更新可能 |
| find-skills | **No** | 使うスキルは自分で決める運用で十分 |

### 4. アップデート

スキルを最新版に更新する場合（ホストで実行）:

```bash
npx skills update
```



## 2. Biome

Rust製のリンター + フォーマッター。
ESLint + Prettierを1ツールで代替する。

### 1. インストール

```bash
docker compose exec web sh
pnpm add -D --save-exact @biomejs/biome
```

`--save-exact` でバージョンを完全固定する（`"^2.0.6"` ではなく `"2.0.6"`）。Biome公式推奨。

### 2. 設定ファイルを作成

```bash
pnpm biome init
```

`web/biome.json` が生成される。
`.git` を検知して `.gitignore` 連携（`vcs`）も自動で設定される。

以下の内容に編集する:

```jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.4.5/schema.json",   // インストールしたバージョンに合わせる
  "vcs": {
    "enabled": true,                                            // Git連携を有効化
    "clientKind": "git",
    "useIgnoreFile": true                                       // .gitignoreの内容をlint・format対象外にする
  },
  "files": {
    "ignoreUnknown": false                                      // 未知のファイル形式があればエラーを出す（trueにすると無視）
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",                                     // "tab" も選択可
    "lineWidth": 100                                            // 1行あたりの最大文字数
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true                                       // 推奨ルールセットを一括有効化
    }
  },
  "css": {
    "parser": {
      "cssModules": true,                                       // CSS Modulesを有効化
      "tailwindDirectives": true                                // @theme等のTailwind v4構文を認識
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double"                                    // 文字列リテラルにダブルクォートを使用
    }
  },
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"                                 // import文の自動並び替え
      }
    }
  }
}
```

### 3. package.json にスクリプトを追加

`pnpm add` は `devDependencies` を自動更新するが，`scripts` は自動では追加されない。手動で追記する。

```jsonc
{
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write ."
  }
}
```

| コマンド | 実行内容 | ファイル変更 | 用途 |
|---------|---------|:----------:|------|
| `pnpm lint` | lint + format のチェック | しない | CI・pre-commit。問題があればエラーで報告 |
| `pnpm lint:fix` | lint + format の自動修正 | する | 開発中に使う。修正できない問題はエラーで報告 |
| `pnpm format` | フォーマットのみ自動修正 | する | インデントや改行だけ直したいとき |

### 4. 既存コードを一括整形

```bash
pnpm lint:fix
```

### 5. 動作確認

```bash
pnpm lint
```

エラーが出なければ完了。`exit` でコンテナを出る。



## 3. Vitest

Vite ベースのテストランナー。
TypeScript・ESModules との相性が良く，Jest より設定がシンプル。

### 1. インストール

`docker compose run` を使う理由は `05_development.md` のパッケージ管理を参照。

```bash
docker compose stop web
docker compose run --rm web pnpm add -D vitest @vitejs/plugin-react
docker compose rm -v web
docker compose up --build -d
```

| パッケージ | 用途 |
|-----------|------|
| `vitest` | テストランナー本体 |
| `@vitejs/plugin-react` | JSX 変換（React コンポーネントのテストに必要） |

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
| `plugins` | `react()` | JSX 変換を有効化 |
| `resolve.alias` | `@/ → src/` | `tsconfig.json` のパスエイリアスと同期 |
| `test.include` | `tests/` と `src/` | ディレクトリ構成では `tests/` を推奨しつつ，コロケーションも許容 |
| `test.environment` | `"node"` | ユニット・統合テストのデフォルト。コンポーネントテストが必要になったらファイル単位で `// @vitest-environment jsdom` を指定 |

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
| `pnpm test` | ウォッチモードでテスト実行（公式デフォルト） | 開発中 |
| `pnpm exec vitest run` | テストを1回実行して終了 | CI・pre-commit |
| `pnpm typecheck` | TypeScript の型チェック | CI・pre-commit |

### 4. テストディレクトリを作成

```bash
mkdir -p tests/unit tests/integration
```

ディレクトリ構成（`05_development.md` に記載済み）:

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
