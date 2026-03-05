## 概要

本ドキュメントは，各種ツール・ライブラリの**導入手順**をまとめたものである。   
ツールの一覧と規約は `01_requirements/05_development.md` を参照のこと。

### 目次

1. [Biome](#1-biome)
2. [初期構築手順（プロジェクト作成時のみ）](#2-初期構築手順プロジェクト作成時のみ)


## 1. Biome

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
    "ignoreUnknown": false                                      // 未知のファイル形式をエラーにしない
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


---


## 2. 初期構築手順（プロジェクト作成時のみ）

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
