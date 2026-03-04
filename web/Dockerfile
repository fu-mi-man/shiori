# ベースイメージの選択
FROM node:24-slim

# 作業ディレクトリの設定
WORKDIR /app

# Corepackを有効化してpnpmを利用可能にする
# バージョンはpackage.jsonの"packageManager"フィールドから自動検出
# 現在: pnpm@10.28.0
RUN corepack enable

# 依存関係のインストール（レイヤーキャッシュ最適化）
# package.jsonとpnpm-lock.yamlをコピー（この時点でpackageManagerが読み込まれる）
# * = ファイルが存在しない場合はスキップ（初回ビルド時対応）
COPY package.json pnpm-lock.yaml* ./

# pnpmで依存関係をインストール
RUN pnpm install

# ポート公開
EXPOSE 3000

# 開発サーバーの起動
CMD ["pnpm", "dev"]
