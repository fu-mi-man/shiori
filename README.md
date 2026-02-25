# Shiori - 旅のしおり作成サービス

旅行の行程表を簡単に作成・共有できるWebサービス。

## セットアップ

```bash
git clone <repository-url>
cd shiori
docker compose up --build
```

開発サーバー: http://localhost:3000

## ドキュメント

詳細は `docs/` を参照。

| ディレクトリ / ファイル | 内容 |
|------------------------|------|
| `01_requirements/01_overview.md` | サービス概要 |
| `01_requirements/02_features.md` | 機能要件 |
| `01_requirements/03_screens.md` | 画面定義 |
| `01_requirements/04_data.md` | データ定義 |
| `01_requirements/05_development.md` | 開発環境・ルーティング |
| `02_specification/` | 詳細設計（必要に応じて追加） |
| `02_specification/view-page.md` | 表示画面の実装仕様 |
| `99_research/technology.md` | 技術選定 |
| `99_research/benchmark.md` | 競合分析 |



## 初期構築（プロジェクト作成時のみ）

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
