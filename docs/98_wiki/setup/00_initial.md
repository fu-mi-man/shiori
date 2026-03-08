
## 初期構築

Next.jsプロジェクトを新規作成する手順。  
**プロジェクト作成時に一度だけ実行する。通常の開発では参照不要。**

### 1. 一時Dockerfileを作成

`web/` は `create-next-app` が空ディレクトリを要求するため，先にイメージだけ用意する。  
プロジェクトルートに一時的なDockerfileを作成する。

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
| `-v $(pwd)/web:/app` | `web/` ディレクトリをコンテナの `/app` にマウント |
| `--typescript` | TypeScriptを使用 |
| `--tailwind` | Tailwind CSSを使用 |
| `--no-eslint` | ESLintを無効化（Biomeで代替） |
| `--app` | App Routerを使用（Pages Routerではなく） |
| `--src-dir` | `src/` ディレクトリを使用（ソースと設定ファイルを分離） |
| `--import-alias='@/*'` | インポートエイリアスを `@/*` に設定 |

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

リポジトリルートに `compose.yaml` を作成する。

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

| 設定 | 値 | 理由 |
|------|-----|------|
| `volumes: node_modules` | anonymous volume | pnpmのシンボリンクベース構成とnamed volumeの相性が悪いため anonymous volumeを使用 |
| `stdin_open / tty` | `true` | 対話式CLIツール（shadcn等）の実行に必要 |

### 6. クリーンアップと開発サーバーの起動

```bash
docker rmi shiori-init                   # 一時イメージを削除
docker volume rm shiori_node_modules     # 旧構成のボリュームが残っている場合のみ
docker compose up --build
```

開発サーバーが起動し，http://localhost:3000 にアクセスできれば完了。
