# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**Shiori** (旅のしおり作成サービス) - 旅行の行程表を簡単に作成・共有できるWebサービス。「行程さん」のようなシンプルで使いやすいUIを目指す。アカウント登録不要で、URLを知っている人は誰でも閲覧可能。

**規模感**: 個人プロジェクト（数十人規模から開始）、需要があれば将来的に商用化を検討

## 技術スタック

### フルスタック（移行予定）
- **Next.js 16** (App Router)
- **TypeScript** （フロント・バックエンド統一）
- **Tailwind CSS v4** （重要: Next.js 16が自動統合、`@import "tailwindcss"`構文を使用）
- **shadcn/ui** （UIコンポーネント、Tailwind + Radix UI）
- **React Hook Form + Zod** （フォーム管理と型安全なバリデーション）
- **React Icons** （多様な交通手段アイコン）
- **date-fns** （日付処理）
- **pnpm 10.28.0** （Corepackで管理 - package.jsonでバージョン指定）
- **Node.js 24 LTS** （Krypton、2028年4月までサポート）

### データベース（将来実装予定）
- **Neon Postgres** （PostgreSQL、Vercel統合経由）
  - 無料枠: 0.5GB/プロジェクト、100 CU時間/月
  - 注: 2024年Q4にVercel PostgresからNeonへ移行済み
- **Drizzle ORM** （TypeScript-first、軽量高速なORM）

### デプロイ先
- **Vercel** （Hobby無料プラン、**非商用利用限定**）
  - 注: 商用化時はPro ($20/月)への移行が必須

### 現在の実装（移行前）
- React 19 + Vite 7 + React Router v7（`frontend/`ディレクトリ）
- 近日中にNext.js 16 App Router構成に移行予定

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

開発サーバー: http://localhost:3000

### 依存関係の追加

**重要**: pnpmのstore不整合を防ぐため、必ずコンテナ内でパッケージをインストールすること。

```bash
# コンテナに入る
docker compose exec app sh

# パッケージを追加
pnpm add <package-name>

# 開発用パッケージを追加
pnpm add -D <package-name>

# コンテナから抜ける
exit
```

パッケージ追加後はコンテナを再起動:
```bash
docker compose restart app
```

### ビルド

```bash
# コンテナ内で実行
docker compose exec app sh
pnpm build

# プロダクションビルドをプレビュー
pnpm start
```

### Lint実行

```bash
# コンテナ内で実行
docker compose exec app sh
pnpm lint
```

## アーキテクチャとコード構成

### ルーティング（Next.js App Router）

Next.js App Routerは**ファイルベースルーティング**を採用。ディレクトリ構造がそのままURLになります。

| パス | ファイルパス | 説明 |
|------|-----------|-------------|
| `/` | `app/page.tsx` | トップ画面（LP）、サービス説明 |
| `/create` | `app/create/page.tsx` | しおり作成画面 |
| `/i/[id]` | `app/i/[id]/page.tsx` | しおり表示画面（閲覧専用） |
| `/i/[id]/edit` | `app/i/[id]/edit/page.tsx` | しおり編集画面（合言葉が必要） |

**ダイナミックルート**: `[id]`は動的セグメント（例: `/i/abc123`）

### ディレクトリ構成

```
shiori/
├── compose.yaml          # Docker Compose設定
├── docs/                 # 要件定義書など（日本語）
│   ├── 01_requirements.md  # 機能要件
│   ├── 02_technology.md    # 技術選定理由
│   └── 03_development.md   # 開発環境構築
├── package.json          # packageManagerフィールドが重要
├── next.config.ts        # Next.js設定
├── tsconfig.json         # TypeScript設定
├── app/                  # Next.js App Router
│   ├── layout.tsx            # ルートレイアウト
│   ├── page.tsx              # トップページ（/）
│   ├── globals.css           # グローバルCSS（Tailwind含む）
│   ├── create/
│   │   └── page.tsx          # 作成ページ（/create）
│   ├── i/
│   │   └── [id]/
│   │       ├── page.tsx      # 表示ページ（/i/:id）
│   │       └── edit/
│   │           └── page.tsx  # 編集ページ（/i/:id/edit）
│   └── api/                  # API Routes（バックエンド）
│       ├── shiori/
│       │   ├── route.ts      # GET/POST /api/shiori
│       │   └── [id]/
│       │       └── route.ts  # GET/PUT/DELETE /api/shiori/:id
│       └── auth/
│           └── route.ts      # 合言葉認証
├── components/           # 再利用可能なコンポーネント
│   ├── Timeline.tsx
│   ├── ScheduleItem.tsx
│   └── ...
├── lib/                  # ユーティリティ・型定義
│   ├── db.ts                 # DB接続（Neon Postgres via Vercel）
│   ├── types.ts              # 型定義
│   └── utils.ts              # ヘルパー関数
└── public/               # 静的ファイル
    └── images/
```

**重要**: プロジェクトルートがNext.jsアプリケーション（`frontend/`ディレクトリは不要）

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
- ✅ Next.js 16が自動的にTailwind v4を統合
- ✅ CSSは `@import "tailwindcss";` を使用（`@tailwind`ディレクティブではない）

**app/globals.css**:
```css
@import "tailwindcss";

/* カスタムスタイルをここに追加 */
```

### Dockerボリューム戦略

`node_modules`は**named volume**として管理され、bind-mountしません。これはOS固有のバイナリ（esbuildなど）の互換性問題を防ぐためです。そのため、パッケージインストールはコンテナ内で行う必要があります。

`compose.yaml`でボリューム設定を確認できます。

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

### データフロー

**Server Componentsを活用**（推奨）:
```
Server Component → DB直接アクセス → レンダリング
```

**Client Componentsの場合**:
```
Client Component → API Routes → DB → レスポンス
```

Next.jsでは、Server Componentsでデータベースに直接アクセスできるため、多くの場合API Routesは不要です。ただし、Client Componentからのデータ更新にはAPI Routesを使用します。

## 段階的な拡張計画

### Phase 1: 現在（移行作業中）
- Docker + Next.js 16のセットアップ
- App Router構造への移行
- 静的UIコンポーネントの移植

### Phase 2: バックエンド統合
- Next.js API Routes / Server Actions実装
- Neon Postgres (via Vercel)との連携
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
2. **Tailwind v4の設定は異なる** - Next.js 16が自動統合するため、tailwind.config.jsを作成しない
3. **packageManagerフィールドは神聖** - Corepackが依存している
4. **モバイルファーストはオプションではない** - デスクトップは二の次
5. **日本語UIが前提** - 日本人ユーザー向けサービス
6. **Server ComponentsとClient Componentsを区別** - `'use client'`ディレクティブを適切に使用

## コンポーネント設計

### Server ComponentsとClient Componentsの使い分け

- **Server Component**（デフォルト）: データフェッチ、静的表示、SEO重視
- **Client Component**（`'use client'`）: インタラクティブな操作、状態管理、イベントハンドラ

```typescript
// Server Component（デフォルト）
export default function ViewPage({ params }: { params: { id: string } }) {
  // DB直接アクセス可能
  const shiori = await db.getShiori(params.id)
  return <Timeline data={shiori} />
}

// Client Component
'use client'
export default function CreateForm() {
  const [title, setTitle] = useState('')
  // イベントハンドラやuseStateが使える
}
```

## テストと品質管理（将来）

未実装。計画:
- ESLint + Prettier（Next.js標準設定）
- Husky + lint-stagedでpre-commitフック
- Conventional Commits標準

## Vercelデプロイ（将来）

デプロイ準備ができたら:
1. GitHubリポジトリをVercelに接続
2. Vercelが自動的にNext.jsプロジェクトを検出
3. ビルドコマンド: `pnpm build`（自動検出）
4. 出力ディレクトリ: `.next/`（自動検出）
5. Vercelは`packageManager`フィールドからpnpmバージョンを使用

初期の静的デプロイには環境変数は不要。

## 技術選定の理由

### なぜNext.js 16を採用したか

**当初の計画**: React + Vite + Python FastAPI

**変更理由**:
1. **バックエンドロジックがシンプル** - CRUD + bcrypt認証のみ、FastAPIは過剰スペック
2. **単一言語で管理が簡単** - TypeScriptでフロント・バックエンド統一
3. **完全無料で運用可能** - Vercel Hobby無料プラン（**非商用利用限定**）
4. **最速のパフォーマンス** - Vercel Fluid Compute、コールドスタート最小化
5. **市場価値の高いスキルセット** - Next.js + TypeScriptの実践学習

**重要な制約**:
- Vercel Hobby無料プランは**非商用利用のみ**
- 広告掲載や収益化を行う場合はPro ($20/月)への移行が**必須**
- 利用規約違反によるアカウント停止リスクあり

**Next.js 16の新機能**:
- **`use cache`ディレクティブ**: ページ、コンポーネント、関数のキャッシュ制御が明示的かつ柔軟に
- **React Compiler サポート**: コンポーネントの自動メモ化、手動での最適化が不要
- **ルーティング改善**: 共有レイアウトのプリフェッチ最適化（50個のリンクで50回 → 1回のダウンロードに）
- **Build Adapters API**: カスタムホスティングプロバイダーとの統合が容易に

**Python学習について**:
- このプロジェクトのバックエンドは非常にシンプル
- FastAPIの真の強みは、機械学習API、画像処理、複雑な非同期処理など
- Python学習は別途、FastAPIの強みを活かせるプロジェクトで行うことを推奨
