# ベースイメージの選択
FROM node:24-slim

# pnpmのパス設定（公式推奨）
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# 作業ディレクトリの設定
WORKDIR /app

# Corepackを有効化してpnpmを利用可能にする
RUN corepack enable

# pnpmストアの場所を固定（ビルド時・ランタイム共通）
# BuildKitキャッシュマウントのターゲットと一致させる
RUN pnpm config set store-dir /pnpm/store --global

# lockfileだけ先にコピー（レイヤーキャッシュ最適化）
COPY pnpm-lock.yaml ./

# ストアにパッケージをフェッチ（lockfileだけで実行可能）
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch

# package.jsonをコピーしてインストール
COPY package.json ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --offline

# pnpmディレクトリとアプリディレクトリの所有権をnodeユーザーに変更
# rootでインストールしたnode_modules・pnpmストアをnodeユーザーで操作可能にする
RUN chown -R node:node /pnpm /app

# コンテナ内の実行ユーザーをnodeに変更（UID 1000）
# volume マウント時のファイル所有権をホスト側ユーザーと一致させる
USER node

# ポート公開
EXPOSE 3000

# 開発サーバーの起動
CMD ["pnpm", "dev"]
