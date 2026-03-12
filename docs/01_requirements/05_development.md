## 概要

本ドキュメントは，Shioriプロジェクトの**開発環境・開発ツール・開発時の規約**をまとめた実践ガイドである。  
技術選定の判断根拠は `99_research/technology.md` を参照のこと。

### 目次

1. [開発ツール](#1-開発ツール)
2. [推奨プラグイン・スキル](#2-推奨プラグインスキル)
3. [ディレクトリ構成](#3-ディレクトリ構成)
4. [Git運用ルール](#4-git運用ルール)
5. [コーディング規約](#5-コーディング規約)
6. [コマンド一覧](#6-コマンド一覧)


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
| Bruno | APIテスト | Git管理可能なAPIクライアント（`.bru`ファイル）。Postmanの代替。VS Code/Cursor拡張機能で送信・確認が完結 |

### コード品質

| ツール | 用途 | 備考 |
|--------|------|------|
| Biome | リンター + フォーマッター | ESLint + Prettierを1ツールで代替。Rust製で高速 |
| lefthook | Git hooks管理 | `git commit` 時にlint・型チェックを自動実行。huskyの代替（Go製で高速） |

### データベース

| ツール | 用途 | 備考 |
|--------|------|------|
| Drizzle Kit | マイグレーション管理 | Drizzle ORMの付属ツール。スキーマからSQL自動生成，DB管理UI（Studio） |

### UI

| ツール | 用途 | 備考 |
|--------|------|------|
| shadcn/ui CLI | UIコンポーネント追加 | `pnpm dlx shadcn@latest add <component>` でコンポーネントを `components/ui/` に追加。コピー方式のため自由にカスタマイズ可能。Dockerコンテナ内で実行する |


## 2. 推奨プラグイン・スキル

Claude Codeの拡張機能。全てプロジェクトスコープで管理し，Git経由でチームに共有する。

### Anthropicプラグイン

プロジェクトにインストール。`.claude/settings.json` に記録されGit管理される。

| プラグイン | 用途 |
|-----------|------|
| context7 | Next.js，Tailwind CSS v4，Drizzle等の最新ドキュメントを参照 |
| security-guidance | セキュリティ脆弱性の自動検出。XSS，SQLインジェクション等をコード編集時にブロック |
| typescript-lsp | リアルタイム型チェック。型エラーをコード編集直後に検出 |
| code-review | PRの自動コードレビュー。5つのSonnetエージェントが並列でレビューし，信頼度スコアで偽陽性をフィルタリング |

```bash
/plugin install context7 --scope project
/plugin install security-guidance --scope project
/plugin install typescript-lsp --scope project
/plugin install code-review --scope project
```

### スキル

プロジェクトの `.claude/skills/` にインストール。Git管理されるため，clone した時点で全員に共有される。  
Claude Codeはタスクの内容に応じて関連するスキルを自動で読み込む（Progressive Disclosure）。

**Vercel: agent-skills** — React全般のベストプラクティス（フレームワーク非依存）

| スキル | 用途 |
|--------|------|
| vercel-react-best-practices | 40+ルールのパフォーマンス最適化。バンドルサイズ削減，リクエストウォーターフォール排除 |
| vercel-composition-patterns | Compound Component等の設計パターン。boolean prop氾濫の防止 |
| web-design-guidelines | 100+ルールのアクセシビリティ・UX監査。ARIA属性，alt text，レスポンシブ対応 |

**Vercel: next-skills** — Next.js固有のベストプラクティス

| スキル | 用途 |
|--------|------|
| next-best-practices | 19トピックのNext.js開発ガイド。App Router，Server/Client Components，データフェッチ |
| next-cache-components | Next.js 16のキャッシュ戦略。`use cache`ディレクティブ，PPR，cacheLife/cacheTag |
| next-upgrade | Next.jsバージョンアップの移行ガイド。破壊的変更の対応手順 |

**Anthropic: skills** — 開発支援・メタスキル

| スキル | 用途 |
|--------|------|
| frontend-design | AI臭くない高品質UIデザイン生成。React + Tailwind構成に最適化 |
| skill-creator | カスタムスキル作成のガイド。SKILL.mdの構造・フロントマター・ベストプラクティス |

**shadcn: ui** — shadcn/uiコンポーネント管理

| スキル | 用途 |
|--------|------|
| shadcn | プロジェクト設定の自動読み取り，コンポーネントの追加・検索・構成パターンの強制 |

```bash
# ホストで実行（プロジェクトルートの .claude/skills/ にインストールするため）
npx skills add vercel-labs/agent-skills -a claude-code
npx skills add vercel-labs/next-skills -a claude-code
npx skills add anthropics/skills --skill frontend-design --skill skill-creator -a claude-code
pnpm dlx skills add shadcn/ui
```

### MCPサーバー

| サーバー | 用途 | 備考 |
|---------|------|------|
| Pencil.dev | UIデザインツール連携 | VSCode/Cursor拡張機能をインストールすると内蔵MCPサーバーが自動起動。Claude Codeが`.pen`ファイルを読み取りコード生成 |
| Playwright | E2Eテスト・ブラウザ自動操作 | 自然言語でブラウザを操作。テスト実行・デバッグに使用 |

```bash
# ホストで実行（claude CLIはホスト側にのみ存在するため）
# MCP起動コマンドはdocker run経由にすることでホストへのNode.jsインストールを不要にする
claude mcp add playwright -s project -- docker run --rm -i mcr.microsoft.com/playwright:v1.52.0-noble npx @playwright/mcp@latest
# Pencil.devはアプリ起動時に自動でMCP接続される（設定不要）
```

### アップデート

```bash
# ホストで実行
npx skills update
```


## 3. ディレクトリ構成

Next.js 16 App Routerのベストプラクティスに準拠。  
将来のバックエンド分離に備え，Next.jsアプリは `web/` ディレクトリに配置する（モノレポ構成）。  

```
shiori/
├── .agents/                                # スキル本体（npx skills addで自動生成）
│   └── skills/                             # .claude/skills/ からシンボリンクされる
│
├── .claude/                                # Claude Code設定
│   └── skills/                             # スキル（.agents/skills/ へのシンボリンク）
│
├── .github/                                # GitHub設定
│   └── pull_request_template.md            # PRテンプレート
│
├── .vscode/                                # VSCode設定
│   └── extensions.json                     # 推奨拡張機能
│
├── bruno/                                  # APIテスト（Bruno）
│   ├── environments/
│   │   └── local.bru                       # ローカル環境変数
│   ├── shiori-api/                         # API単位のリクエスト定義（.bruファイル）
│   └── bruno.json                          # コレクション設定
│
├── designs/                                # UIデザイン（Pencil.dev .penファイル）
│
├── docs/                                   # ドキュメント
│   ├── 01_requirements/                    # 要件定義（概要・機能・画面・データ・開発規約）
│   ├── 02_specification/                   # 詳細設計
│   ├── 98_wiki/                            # 開発Wiki
│   │   └── setup/                          # ツール導入手順（00_initial〜06_shadcn）
│   └── 99_research/                        # 調査・技術選定
│
├── web/                                    # Next.jsアプリ（フロント＋バックエンド）
│   ├── src/
│   │   ├── app/                            # App Router（ルーティング専用）
│   │   │   ├── (main)/                     # メインページ群（route group，URLに影響しない）
│   │   │   │   ├── create/page.tsx         # 作成画面 (/create)
│   │   │   │   └── page.tsx                # トップ画面 (/)
│   │   │   ├── api/                        # API Routes
│   │   │   │   ├── auth/route.ts           # POST: 合言葉認証
│   │   │   │   └── shiori/route.ts         # POST: しおり作成
│   │   │   ├── i/[id]/page.tsx             # 表示画面 (/i/[id])
│   │   │   ├── error.tsx                   # エラーバウンダリ
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx                  # ルートレイアウト
│   │   │   └── not-found.tsx               # 404ページ
│   │   │
│   │   ├── components/
│   │   │   ├── features/                   # 機能固有コンポーネント（機能単位で分類）
│   │   │   └── ui/                         # 汎用UIコンポーネント（shadcn/uiで追加）
│   │   │
│   │   ├── db/                             # Drizzle ORM（公式準拠）
│   │   │   ├── migrations/                 # マイグレーションファイル
│   │   │   ├── index.ts                    # DB接続
│   │   │   └── schema.ts                   # スキーマ定義
│   │   │
│   │   ├── hooks/                          # カスタムReact Hooks
│   │   │
│   │   └── lib/                            # ユーティリティ・共通ロジック
│   │
│   ├── tests/                              # テストファイル
│   │   ├── e2e/                            # E2Eテスト（Playwright）
│   │   ├── integration/                    # 統合テスト
│   │   └── unit/                           # ユニットテスト
│   │
│   ├── public/                             # 静的ファイル
│   ├── biome.json                          # Biome設定
│   ├── components.json                     # shadcn/ui設定
│   ├── Dockerfile                          # コンテナイメージ定義
│   ├── drizzle.config.ts                   # Drizzle Kit設定
│   ├── next.config.ts                      # Next.js設定
│   ├── package.json                        # 依存関係・スクリプト定義
│   ├── playwright.config.ts                # Playwright設定（E2Eテスト）
│   ├── pnpm-lock.yaml                      # 依存関係ロックファイル
│   ├── tsconfig.json                       # TypeScript設定
│   └── vitest.config.ts                    # Vitest設定
│
├── CLAUDE.md                               # Claude Code指示書
├── compose.yaml                            # Docker Compose設定
├── lefthook.yml                            # Git hooks設定（pre-commit）
└── README.md
```

### 構成のポイント

- **`web/`**: Next.jsプロジェクトルート。将来バックエンドを分離する場合は `api/` 等を並列に追加できる
- **`src/app/`**: App Routerのルーティング専用。ページとAPIルートのみ配置。ビジネスロジックやコンポーネントは置かない
- **`src/components/ui/`**: shadcn/uiの汎用コンポーネント。どの画面でも使える
- **`src/components/features/`**: 機能固有のコンポーネント。機能単位で分類
- **`src/db/`**: Drizzle関連を集約（公式準拠）。スキーマ，接続，マイグレーションを一箇所で管理
- **`src/hooks/`**: カスタムHooksを `lib/` と分離して配置
- **`tests/`**: Playwrightのデフォルト探索ディレクトリ名。Vitestはファイル名パターン（`*.test.ts`）で検出するため，どちらのツールも追加設定なしで動作する


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

Next.jsアプリ（web/）のコマンドはDockerコンテナ内で実行する。
スキル管理（`npx skills add` 等）はホストで実行する。

### 起動・停止

```bash
docker compose up --build        # 初回 or Dockerfile変更時
docker compose up                # 通常起動（http://localhost:3000）
docker compose down              # 停止
docker compose exec web sh       # コンテナに入る
```

### パッケージ管理

```bash
docker compose stop web                                    # devサーバーを停止
docker compose run --rm web pnpm add <package>             # 依存追加
docker compose run --rm web pnpm add -D <package>          # 開発依存追加
docker compose rm -v web                                   # anonymous volume（node_modules）を削除
docker compose up --build -d                               # イメージ再ビルド＋起動
```

> **なぜこの手順が必要か？**
> - `docker compose exec` でコンテナに入って `pnpm add` すると，dev サーバーが `package.json` の変更を検知してクラッシュする。`docker compose run` は CMD（dev サーバー）を実行せずに指定コマンドだけ実行するため安全。
> - `run` で更新された `node_modules` は一時コンテナ内のみ。実行中コンテナの anonymous volume には反映されないため，`rm -v web` で古い anonymous volume を削除し，`--build` で再構築する必要がある。
> - `rm -v` は anonymous volume のみ削除する。named volume（`pgdata`）には影響しない。
> - pnpm はシンボリンクベースの `node_modules` 構造を採用しているため named volume との相性が悪く，anonymous volume を使う必要がある（[pnpm/pnpm#2720](https://github.com/pnpm/pnpm/issues/2720)）。

### 検証

```bash
pnpm typecheck                   # 型チェック
pnpm lint                        # lint（Biome）
pnpm test                        # ユニット・統合テスト（Vitest）
pnpm test:e2e                    # E2Eテスト（Playwright）
pnpm build                       # ビルド確認
```

### データベース

コンテナ内で実行する。

```bash
pnpm db:generate                  # マイグレーションSQL生成
pnpm db:migrate                   # マイグレーション適用
pnpm db:studio                    # DB管理UI起動
```

### UI

```bash
pnpm dlx shadcn@latest init              # 初期セットアップ（実施済み）
pnpm dlx shadcn@latest add <component>   # コンポーネント追加（例: button, input, dialog）
```


セットアップ手順は `docs/98_wiki/setup/` を参照。
