# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**Shiori** (旅のしおり作成サービス) - 旅行の行程表を簡単に作成・共有できるWebサービス。「行程さん」のようなシンプルで使いやすいUIを目指す。アカウント登録不要で、URLを知っている人は誰でも閲覧可能。

**規模感**: 個人プロジェクト（数十人規模から開始）、需要があれば将来的に商用化を検討

## 技術スタック

### フロントエンド（現在実装中）
- **React 19** + **TypeScript** + **Vite 7**
- **Tailwind CSS v4** （重要: 新しい`@import "tailwindcss"`構文を使用）
- **React Router v7** でルーティング
- **pnpm 10.28.0** （Corepackで管理 - package.jsonでバージョン指定）
- **Node.js 24 LTS** （Krypton、2028年4月までサポート）

### バックエンド（将来実装予定）
- **Python + FastAPI** （Vercel Serverless Functions上で動作）
- **Vercel Postgres** （PostgreSQL）

### デプロイ先
- **Vercel** （無料プラン、商用化までは非商用利用）

## 開発コマンド

### 開発環境の起動

全ての開発はDockerコンテナ内で行います。**ホストマシンでnpm/pnpmコマンドを実行しないこと。**

```bash
# 初回起動、またはDockerfile変更時
docker compose up --build

# 通常起動（2回目以降）
docker compose up

# 停止
docker compose down

# 完全クリーンアップ（node_modulesを含むボリュームも削除）
docker compose down -v
```

開発サーバー: http://localhost:5173

### 依存関係の追加

**重要**: pnpmのstore不整合を防ぐため、必ずコンテナ内でパッケージをインストールすること。

```bash
# コンテナに入る
docker compose exec frontend sh

# パッケージを追加
pnpm add <package-name>

# 開発用パッケージを追加
pnpm add -D <package-name>

# コンテナから抜ける
exit
```

パッケージ追加後はコンテナを再起動:
```bash
docker compose restart frontend
```

### ビルド

```bash
# コンテナ内で実行
docker compose exec frontend sh
pnpm build

# プロダクションビルドをプレビュー
pnpm preview
```

### Lint実行

```bash
# コンテナ内で実行
docker compose exec frontend sh
pnpm lint
```

## アーキテクチャとコード構成

### ルーティング

| パス | コンポーネント | 説明 |
|------|-----------|-------------|
| `/` | TopPage（未実装） | トップ画面（LP）、サービス説明 |
| `/create` | CreatePage | しおり作成画面 |
| `/i/:id` | ViewPage（未実装） | しおり表示画面（閲覧専用） |
| `/i/:id/edit` | EditPage（未実装） | しおり編集画面（合言葉が必要） |

### ディレクトリ構成

```
shiori/
├── compose.yaml          # Docker Compose設定
├── docs/                 # 要件定義書など（日本語）
│   ├── 01_requirements.md  # 機能要件
│   ├── 02_technology.md    # 技術選定理由
│   └── 03_development.md   # 開発環境構築
└── frontend/
    ├── Dockerfile
    ├── package.json      # packageManagerフィールドが重要
    ├── vite.config.ts    # Tailwind v4プラグイン設定
    └── src/
        ├── main.tsx
        ├── App.tsx       # ルーター設定
        ├── pages/        # 画面単位のコンポーネント
        └── components/   # 再利用可能なコンポーネント（将来）
```

### データモデル（将来実装予定）

**しおりテーブル**:
- `id` (UUID) - 共有URLに使用
- `title` (String) - しおりのタイトル
- `overview` (JSON配列) - 概要セクション（旅費、持ち物など）
- `schedule` (JSON配列) - 行程（日付、時間、交通手段、補足）
- `password_hash` (String、任意) - 編集用合言葉（bcryptハッシュ）
- `created_at`, `last_accessed_at` - 最終アクセスから3ヶ月後に自動削除

## 重要な実装詳細

### Tailwind CSS v4への移行

**このプロジェクトはTailwind CSS v4を使用**しており、v3からの破壊的変更があります:

- ❌ `tailwind.config.js` ファイルは不要
- ❌ `postcss.config.js` ファイルも不要
- ✅ `vite.config.ts` でプラグイン設定
- ✅ CSSは `@import "tailwindcss";` を使用（`@tailwind`ディレクティブではない）

`frontend/vite.config.ts:8` でTailwindプラグインの設定を確認できます。

### Dockerボリューム戦略

`node_modules`は**named volume**として管理され、bind-mountしません。これはOS固有のバイナリ（esbuildなど）の互換性問題を防ぐためです。そのため、パッケージインストールはコンテナ内で行う必要があります。

`compose.yaml:26` と `compose.yaml:43-51` でボリューム設定を確認できます。

### pnpm設定

`package.json`の`packageManager`フィールドが重要:
```json
"packageManager": "pnpm@10.28.0"
```

**このフィールドを絶対に変更・削除しないこと。** CorepackがDockerとVercelの両方でこのバージョンを自動的に使用します。

## 設計方針

### モバイルファースト設計（最重要）
- **主要ターゲット: スマートフォンユーザー**
- 固定幅デザイン（max-width: 480px程度）
- 最小タッチターゲットサイズ: 44x44px
- PC/タブレットでは中央配置
- タイムライン表示は視覚的に美しく、一目で分かりやすいこと

### タイムライン表示の要件
- 時系列に沿った縦方向レイアウト
- 交通手段の視覚的表現（アイコン）
- 日数表示のサポート（1日目、2日目など）
- 概要セクションと行程セクションを明確に分ける

### 認証不要
- ユーザーアカウント・ログイン不要
- 編集保護は任意の合言葉で実現（bcryptハッシュで保存）
- 共有は一意のURLで: `https://yoursite.com/i/<uuid>`

## 段階的な拡張計画

### Phase 1: 現在（静的モック）
- Docker + React + TypeScriptのセットアップ ✅
- React Routerで基本ルーティング ✅
- 静的UIコンポーネント（作業中）

### Phase 2: バックエンド統合
- FastAPIサーバーレス関数の追加
- Vercel Postgresとの連携
- しおりのCRUD API実装
- 合言葉保護機能（bcrypt）

### Phase 3: 追加機能（需要があれば）
- 写真アップロード（Cloudflare R2 - 無料枠10GB）
- QRコード生成
- PDF出力
- カラーテーマ選択
- テンプレート機能（1泊2日、2泊3日など）

### Phase 4: 商用化（必要になれば）
- Vercel Pro（$20/月）に移行して広告・収益化を可能に
- コストが増大する場合はVPS移行を検討

## よくある落とし穴

1. **ホストマシンでpnpm installを実行しない** - 必ずDockerコンテナを使用
2. **Tailwind v4の設定は異なる** - tailwind.config.jsを作成しない
3. **packageManagerフィールドは神聖** - Corepackが依存している
4. **モバイルファーストはオプションではない** - デスクトップは二の次
5. **日本語UIが前提** - 日本人ユーザー向けサービス

## テストと品質管理（将来）

未実装。計画:
- ESLint + Prettier（設定済み、強制は未実装）
- Husky + lint-stagedでpre-commitフック
- Conventional Commits標準

## Vercelデプロイ（将来）

デプロイ準備ができたら:
1. GitHubリポジトリをVercelに接続
2. Vercelが自動的にViteプロジェクトを検出
3. ビルドコマンド: `pnpm build`
4. 出力ディレクトリ: `dist/`
5. Vercelは`packageManager`フィールドからpnpmバージョンを使用

初期の静的デプロイには環境変数は不要。
