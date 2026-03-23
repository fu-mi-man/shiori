
## Playwright

ブラウザ操作の自動テストフレームワーク。  
E2Eテストと，Claude Code MCPによるブラウザ自動操作に使用する。

> 公式ドキュメント: https://playwright.dev/docs/intro


### 1. インストール

`docker compose run` を使う理由は `01_requirements/05_development.md` のパッケージ管理を参照。

```bash
docker compose down
docker compose run --rm web pnpm add -D @playwright/test --store-dir /pnpm/store
docker compose up --build -d
```

| パッケージ | 用途 |
|-----------|------|
| `@playwright/test` | テストランナー・アサーション・ブラウザ自動操作 |

> `pnpm create playwright` が公式推奨の初期化コマンドだが，  
>`docker compose run` の一時コンテナではpnpmのストア設定が引き継がれず `ERR_PNPM_UNEXPECTED_STORE` になる（Zodと同じ問題）。  
>そのため `pnpm add -D` でパッケージだけ追加し，config・テストファイルの生成はホスト側で行う。

**インストール方法の選択肢:**

| 方法 | コマンド | 特徴 |
|------|---------|------|
| **プロジェクト初期化（公式推奨）** | `pnpm create playwright` | `devDependencies` 追加 + config生成 + サンプルテスト + ブラウザDLを一括実行 |
| 手動で追加 | `pnpm add -D @playwright/test` | `devDependencies` にパッケージだけ追加。config等は自分で作成 |

**配置場所:**

公式の推奨構成では，`playwright.config.ts` と `tests/` は `package.json` と同じディレクトリに置く。  
モノレポでの分離に関する公式の言及はなく，既存プロジェクトに追加する場合はそのプロジェクトの `package.json` に依存が追加される。

```
web/                          ← package.json があるディレクトリ
├── src/
├── tests/e2e/                ← E2Eテスト
├── playwright.config.ts      ← Playwright設定
└── package.json              ← devDependencies に @playwright/test
```

将来 `admin/` 等のアプリが増えた場合は，各アプリが自分の `playwright.config.ts` と `tests/e2e/` を持つ。  
Playwright本体とブラウザはホストに1回インストールすれば全アプリから共有される。


### 2. 日本語フォントのインストール

WSL2（Ubuntu）にはデフォルトで日本語フォントがない。  
スクリーンショットやE2Eテストで日本語を表示するために必要。

**WSL2 / Ubuntu / Debian:**

```bash
sudo apt update
sudo apt install -y fonts-noto-cjk
fc-cache -fv
```

**macOS:**

デフォルトで日本語フォントが含まれるため不要。

インストール後の確認:

```bash
fc-list :lang=ja | head -3
# Noto Sans CJK JP 等が表示されればOK
```


### 3. ホスト側にインストール

Playwrightはブラウザバイナリとシステム依存（フォント，libglib，libnss等）を必要とする。  
`node:24-slim` コンテナにこれらを追加するとイメージが肥大化するため，ブラウザのインストールとテスト実行はホスト側で行う。  

コンテナの `node_modules`（anonymous volume）はホストから参照できないため，ホスト側でも `pnpm install` が必要。

```bash
cd web
pnpm install
pnpm exec playwright install chromium --with-deps
```

| コマンド | 用途 |
|---------|------|
| `pnpm install` | `web/package.json` の `devDependencies` をホスト側の `web/node_modules/` にインストール |
| `pnpm exec playwright install chromium --with-deps` | Chromiumバイナリとシステム依存ライブラリをホストにインストール |

`--with-deps` はブラウザ実行に必要なシステムライブラリも一緒にインストールする。  
Chromiumのみで十分（Firefox・WebKitは必要になった時点で追加）。

インストール後の確認:

```bash
pnpm exec playwright --version
# Version 1.xx.x が表示されればOK
```


### 4. playwright.config.ts とテストファイルの生成

ホスト側で `pnpm create playwright` を実行し，設定ファイルとサンプルテストを生成する。  
ステップ1でパッケージは追加済みのため，`Already up to date` と表示される。  

```bash
cd web
pnpm create playwright
```

対話プロンプトで以下を選択:

| 質問 | 選択 | 理由 |
|------|------|------|
| tests folder name | `tests/e2e` | ディレクトリ構成に合わせる |
| Add a GitHub Actions workflow | No | CI導入時に追加 |
| Install Playwright browsers | No | ステップ3で済み |
| Install system dependencies | No | ステップ3で済み |

以下のファイルが生成される:

| ファイル | 内容 |
|---------|------|
| `web/playwright.config.ts` | テスト設定（testDir，ブラウザプロジェクト，webServer等） |
| `web/tests/e2e/example.spec.ts` | サンプルE2Eテスト |

> 生成された `playwright.config.ts` には Chromium・Firefox・WebKit の3ブラウザが定義されている。  
> MVPではChromiumのみで十分だが，将来のクロスブラウザテストに備えてそのままにしておく。  
> `baseURL` や `webServer` はコメントアウトされた状態で生成されるため，必要になったタイミングで有効化する。


### 5. .gitignore の確認

`pnpm create playwright` により，`web/.gitignore` に以下が自動追加される:

```gitignore
# Playwright
/test-results/
/playwright-report/
/blob-report/
/playwright/.cache/
/playwright/.auth/
```

| ディレクトリ | 内容 |
|-------------|------|
| `/test-results/` | テスト失敗時のスクリーンショット・トレースファイル |
| `/playwright-report/` | HTMLレポート（`pnpm exec playwright show-report` で閲覧） |
| `/blob-report/` | CI用のレポートデータ |
| `/playwright/.cache/` | ブラウザバイナリのキャッシュ |
| `/playwright/.auth/` | 認証状態の保存先 |


### 6. 動作確認

```bash
cd web
pnpm exec playwright test --project=chromium
```

サンプルテスト（`tests/e2e/example.spec.ts`）が実行される。
Chromiumのみインストール済みのため `--project=chromium` を指定する（省略するとFirefox・WebKitでエラーになる）。
テストがパスすれば完了。サンプルテストは実際のE2Eテストを書く際に置き換える。


### コマンドまとめ

ホストの `web/` ディレクトリ内で実行する。

| コマンド | 用途 |
|---------|------|
| `pnpm exec playwright test` | 全テスト実行 |
| `pnpm exec playwright test --ui` | UIモードで実行（デバッグ向け） |
| `pnpm exec playwright test --headed` | ブラウザを表示して実行 |
| `pnpm exec playwright show-report` | HTMLレポートを表示 |
| `pnpm exec playwright codegen localhost:3000` | テストコードを自動生成 |


### チームへの共有

`web/playwright.config.ts` と `web/tests/e2e/` はGit管理されるため，clone した時点で設定は共有済み。  
各自が以下を実行するだけで有効になる:

1. [2. 日本語フォントのインストール](#2-日本語フォントのインストール)
2. [3. ホスト側にインストール](#3-ホスト側にインストール)


### 将来の拡張

| タイミング | 対応内容 |
|-----------|---------|
| モバイルテスト追加時 | `projects` に `Mobile Chrome` / `Mobile Safari` を追加 |
| クロスブラウザテスト時 | `pnpm exec playwright install firefox webkit --with-deps` でブラウザ追加 |
| CI導入時 | `reuseExistingServer` を `!process.env.CI` に変更，`webServer.command` をCI用に調整 |
| Visual Regression | `@playwright/test` の `toHaveScreenshot()` を使用 |
