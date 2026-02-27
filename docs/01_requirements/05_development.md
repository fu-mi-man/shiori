## 概要

本ドキュメントは、Shioriプロジェクトの**開発環境・開発ツール・開発時の規約**をまとめた実践ガイドである。  
技術選定の判断根拠は `99_research/technology.md` を参照のこと。

### 目次

1. [開発ツール](#1-開発ツール)
2. [推奨プラグイン・スキル](#2-推奨プラグインスキル)
3. [ディレクトリ構成](#3-ディレクトリ構成)
4. [Git運用ルール](#4-git運用ルール)
5. [コーディング規約](#5-コーディング規約)
6. [コマンド一覧](#6-コマンド一覧)
7. [付録: 初期構築手順](#付録-初期構築手順プロジェクト作成時のみ)


## 1. 開発ツール

### 基盤

| ツール | バージョン | 用途 |
|--------|-----------|------|
| Docker | - | 開発環境のコンテナ化 |
| Node.js | 24 LTS | ランタイム |
| pnpm | 10.28.0 | パッケージマネージャー（Corepack管理） |

### テスト

| ツール | 用途 | 備考 |
|--------|------|------|
| Vitest | ユニットテスト・統合テスト | Jestより設定がシンプル。TypeScript・ESModulesとの相性が良い |
| Testing Library | コンポーネントテスト | Reactコンポーネントをユーザー操作の視点でテストするライブラリ。Vitestと組み合わせて使用 |
| Playwright | E2Eテスト | ブラウザ操作の自動テスト。業界標準 |

### コード品質

| ツール | 用途 | 備考 |
|--------|------|------|
| Biome | リンター + フォーマッター | ESLint + Prettierを1ツールで代替。Rust製で高速 |
| lefthook | Git hooks管理 | `git commit` 時にlint・型チェックを自動実行。huskyの代替（Go製で高速） |
| lint-staged | 差分チェック | lefthookと組み合わせ、変更ファイルのみをlint対象にする |

### データベース

| ツール | 用途 | 備考 |
|--------|------|------|
| Drizzle Kit | マイグレーション管理 | Drizzle ORMの付属ツール。スキーマからSQL自動生成、DB管理UI（Studio） |


## 2. 推奨プラグイン・スキル

Claude Codeの拡張機能。全てプロジェクトスコープで管理し、Git経由でチームに共有する。

### Anthropicプラグイン

プロジェクトにインストール。`.claude/settings.json` に記録されGit管理される。

| プラグイン | 用途 |
|-----------|------|
| context7 | Next.js、Tailwind CSS v4、Drizzle等の最新ドキュメントを参照 |
| security-guidance | セキュリティ脆弱性の自動検出。XSS、SQLインジェクション等をコード編集時にブロック |
| typescript-lsp | リアルタイム型チェック。型エラーをコード編集直後に検出 |

```bash
/plugin install context7 --scope project
/plugin install security-guidance --scope project
/plugin install typescript-lsp --scope project
```

### スキル

プロジェクトの `.claude/skills/` にインストール。Git管理されるため、clone した時点で全員に共有される。  
Claude Codeはタスクの内容に応じて関連するスキルを自動で読み込む（Progressive Disclosure）。

**Vercel: agent-skills** — React全般のベストプラクティス（フレームワーク非依存）

| スキル | 用途 |
|--------|------|
| react-best-practices | 40+ルールのパフォーマンス最適化。バンドルサイズ削減、リクエストウォーターフォール排除 |
| react-composition-patterns | Compound Component等の設計パターン。boolean prop氾濫の防止 |
| vercel-deploy-claimable | Vercelへのデプロイ。プレビューURL発行、所有権の移転 |
| web-design-guidelines | 100+ルールのアクセシビリティ・UX監査。ARIA属性、alt text、レスポンシブ対応 |

**Vercel: next-skills** — Next.js固有のベストプラクティス

| スキル | 用途 |
|--------|------|
| next-best-practices | 19トピックのNext.js開発ガイド。App Router、Server/Client Components、データフェッチ |
| next-cache-components | Next.js 16のキャッシュ戦略。`use cache`ディレクティブ、PPR、cacheLife/cacheTag |
| next-upgrade | Next.jsバージョンアップの移行ガイド。破壊的変更の対応手順 |

**Anthropic: skills** — 開発支援・メタスキル

| スキル | 用途 |
|--------|------|
| frontend-design | AI臭くない高品質UIデザイン生成。React + Tailwind構成に最適化 |
| skill-creator | カスタムスキル作成のガイド。SKILL.mdの構造・フロントマター・ベストプラクティス |

```bash
# コンテナ内で実行
npx skills add vercel-labs/agent-skills -a claude-code
npx skills add vercel-labs/next-skills -a claude-code
npx skills add anthropics/skills --skill frontend-design --skill skill-creator -a claude-code
```

### MCPサーバー

| サーバー | 用途 | 備考 |
|---------|------|------|
| Pencil.dev | UIデザインツール連携 | VSCode/Cursor拡張機能をインストールすると内蔵MCPサーバーが自動起動。Claude Codeが`.pen`ファイルを読み取りコード生成 |
| Playwright | E2Eテスト・ブラウザ自動操作 | 自然言語でブラウザを操作。テスト実行・デバッグに使用 |

```bash
claude mcp add playwright -s project -- npx @playwright/mcp@latest
# Pencil.devはアプリ起動時に自動でMCP接続される（設定不要）
```

### アップデート

```bash
npx skills update    # 全スキルを最新に更新
```


## 3. ディレクトリ構成

Next.js 16 App Routerのベストプラクティスに準拠。

```
shiori/
├── app/                        # App Router（ルーティング専用）
│   ├── (main)/                 # メインページ群（route group）
│   │   ├── page.tsx            # トップ画面 (/)
│   │   └── create/
│   │       └── page.tsx        # 作成画面 (/create)
│   ├── i/
│   │   └── [id]/
│   │       ├── page.tsx        # 表示画面 (/i/[id])
│   │       └── edit/
│   │           └── page.tsx    # 編集画面 (/i/[id]/edit)
│   ├── board/                  # Phase 2
│   │   └── page.tsx            # 掲示板 (/board)
│   ├── api/
│   │   ├── shiori/
│   │   │   ├── route.ts        # POST: しおり作成
│   │   │   └── [id]/
│   │   │       └── route.ts    # GET/PUT/DELETE: しおり操作
│   │   └── auth/
│   │       └── route.ts        # POST: 合言葉認証
│   ├── layout.tsx              # ルートレイアウト
│   ├── not-found.tsx           # 404ページ
│   ├── error.tsx               # エラーバウンダリ
│   └── globals.css
│
├── components/                 # コンポーネント
│   ├── ui/                     # 汎用UIコンポーネント（shadcn/ui）
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   └── features/               # 機能固有コンポーネント
│       ├── shiori/
│       │   ├── ShioriForm.tsx
│       │   └── Timeline.tsx
│       └── ...
│
├── lib/                        # ユーティリティ・共通ロジック
│   ├── db/
│   │   ├── schema.ts           # Drizzleスキーマ定義
│   │   ├── index.ts            # DB接続
│   │   └── migrations/         # マイグレーションファイル
│   ├── types.ts                # 共通型定義
│   ├── utils.ts                # ユーティリティ関数
│   └── validations.ts          # Zodスキーマ（API・フォーム共用）
│
├── hooks/                      # カスタムReact Hooks
│
├── docs/
│   ├── 01_requirements/
│   │   ├── 01_overview.md
│   │   ├── 02_feature.md
│   │   ├── 03_screens.md
│   │   ├── 04_data.md
│   │   └── 05_development.md
│   ├── 02_specification/
│   └── 99_research/
│       ├── benchmark.md
│       └── technology.md
│
├── locales/                    # Phase 2
│   ├── en.json
│   └── ja.json
│
├── public/                     # 静的ファイル
│
├── __tests__/                  # テストファイル
│   ├── unit/                   # ユニットテスト
│   ├── integration/            # 統合テスト
│   └── e2e/                    # E2Eテスト（Playwright）
│
├── .claude/                    # Claude Code
│   └── skills/                 # スキル（Git管理、npx skills addで追加）
├── CLAUDE.md
├── compose.yaml
├── Dockerfile
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── biome.json                  # Biome設定
├── vitest.config.ts            # Vitest設定
├── README.md
└── tsconfig.json
```

### 構成のポイント

- **`app/` はルーティング専用**: ページとAPIルートのみ配置。ビジネスロジックやコンポーネントは置かない
- **`components/ui/`**: shadcn/uiの汎用コンポーネント。どの画面でも使える
- **`components/features/`**: 機能固有のコンポーネント。shiori、board等の機能単位で分類
- **`lib/db/`**: Drizzle関連を集約。スキーマ、接続、マイグレーションを一箇所で管理
- **`lib/validations.ts`**: ZodスキーマをフォームバリデーションとAPIバリデーションで共用
- **`hooks/`**: カスタムHooksを `lib/` と分離して配置
- **`__tests__/`**: テストファイルをソースと分離。unit / integration / e2e で分類
- **route group `(main)`**: トップ画面と作成画面をグループ化。URLには影響しない


## 4. Git運用ルール

### ブランチ戦略

GitHub Flow（main + 作業ブランチ）を採用。

| ブランチ | 用途 |
|---------|------|
| `main` | 常にデプロイ可能な状態 |
| `種別/内容` | 全ての作業はここから切る |

### ブランチ命名

`種別/内容`（kebab-case）

| 種別 | 用途 | 例 |
|------|------|-----|
| feature | 新機能 | `feature/add-timeline-component` |
| fix | バグ修正 | `fix/shiori-save-error` |
| hotfix | 本番の緊急修正 | `hotfix/crash-on-create` |
| refactor | リファクタリング | `refactor/extract-form-logic` |
| design | UIデザイン（Pencil.dev） | `design/top-page-layout` |
| chore | 設定・依存関係の更新 | `chore/update-dependencies` |
| docs | ドキュメント | `docs/add-git-rules` |
| test | テスト追加・修正 | `test/shiori-api-integration` |

### コミットメッセージ

Conventional Commits形式。日本語で記述。

```
種別: 内容
```

| 種別 | 用途 |
|------|------|
| feat | 新機能 |
| fix | バグ修正 |
| hotfix | 本番の緊急修正 |
| refactor | リファクタリング |
| design | UIデザイン |
| chore | 設定・依存関係の更新 |
| docs | ドキュメント |
| test | テスト追加・修正 |
| style | コードスタイルの変更（機能に影響しない） |

```bash
# 例
feat: しおり作成フォームを実装
fix: タイムラインの表示順が逆になる不具合を修正
hotfix: しおり保存時にクラッシュする問題を緊急修正
refactor: フォームロジックをカスタムHookに抽出
design: トップ画面のレイアウトをPencilで作成
chore: Biomeの設定を更新
docs: development.mdにGit運用ルールを追加
test: しおりAPIの統合テストを追加
style: インデントを修正
```


## 5. コーディング規約

| 対象 | 規約 |
|------|------|
| Pageコンポーネント | `page.tsx`（App Router規約） |
| Layoutコンポーネント | `layout.tsx`（App Router規約） |
| API Routes | `route.ts`（App Router規約） |
| 再利用コンポーネント | PascalCase（`Timeline.tsx`） |
| ユーティリティ | camelCase（`formatDate.ts`） |
| Server Component | デフォルト |
| Client Component | `'use client'` ディレクティブを明示 |


## 6. コマンド一覧

全コマンドはDockerコンテナ内で実行する。

### 起動・停止

```bash
docker compose up --build      # 初回 or Dockerfile変更時
docker compose up               # 通常起動（http://localhost:3000）
docker compose down              # 停止
docker compose exec app sh       # コンテナに入る
```

### パッケージ管理

```bash
docker compose exec app sh
pnpm add <package>               # 依存追加
pnpm add -D <package>            # 開発依存追加
exit
docker compose restart app       # 反映
```

### 検証

```bash
pnpm typecheck                   # 型チェック
pnpm lint                        # lint（Biome）
pnpm test                        # ユニット・統合テスト（Vitest）
pnpm test:e2e                    # E2Eテスト（Playwright）
pnpm build                       # ビルド確認
```

### データベース

```bash
pnpm drizzle-kit generate        # マイグレーションSQL生成
pnpm drizzle-kit migrate          # マイグレーション適用
pnpm drizzle-kit studio           # DB管理UI起動
```


## 付録: 初期構築手順（プロジェクト作成時のみ）

> 以下はプロジェクト新規作成時に一度だけ実行する手順。通常の開発では参照不要。

### 1. 最小限のDockerfileを作成

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
docker run --rm -v $(pwd):/app -w /app shiori-init \
  pnpm create next-app@latest . \
  --typescript --tailwind --eslint --app --src-dir=false --import-alias='@/*'
```

| オプション | 意味 |
|-----------|------|
| `--rm` | 終了後にコンテナを削除 |
| `-v $(pwd):/app` | 現在のディレクトリをコンテナの/appにマウント |
| `-w /app` | 作業ディレクトリを/appに設定 |

### 4. Dockerfileを本番用に更新

```dockerfile
FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=development
RUN corepack enable
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install
EXPOSE 3000
CMD ["pnpm", "dev"]
```

### 5. compose.yamlを作成

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - node_modules:/app/node_modules
    environment:
      - NODE_ENV=development
    tty: true

volumes:
  node_modules:
```

### 6. 開発サーバーを起動

```bash
docker compose up --build
```
