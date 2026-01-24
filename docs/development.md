# 開発環境構成

## 1. ディレクトリ構成

```
shiori/
├── .dockerignore           # Docker除外ファイル
├── .gitignore             # Git除外ファイル
├── compose.yaml           # Docker Compose設定
├── Dockerfile             # Next.js用Dockerfile
├── README.md              # プロジェクト概要
├── CLAUDE.md              # Claude Code用プロジェクト説明
├── docs/                  # ドキュメント
│   ├── 01_requirements.md      # 要件定義
│   ├── 02_technology.md        # 技術選定
│   └── 03_development.md       # 開発環境（このファイル）
├── package.json           # 依存関係定義
├── pnpm-lock.yaml         # ロックファイル
├── tsconfig.json          # TypeScript設定
├── next.config.ts         # Next.js設定
├── app/                   # Next.js App Router
│   ├── layout.tsx              # ルートレイアウト
│   ├── page.tsx                # トップページ（/）
│   ├── globals.css             # グローバルCSS（Tailwind含む）
│   ├── create/
│   │   └── page.tsx            # 作成ページ（/create）
│   ├── i/
│   │   └── [id]/
│   │       ├── page.tsx        # 表示ページ（/i/:id）
│   │       └── edit/
│   │           └── page.tsx    # 編集ページ（/i/:id/edit）
│   └── api/                    # API Routes（バックエンド）
│       ├── shiori/
│       │   ├── route.ts        # GET/POST /api/shiori
│       │   └── [id]/
│       │       └── route.ts    # GET/PUT/DELETE /api/shiori/:id
│       └── auth/
│           └── route.ts        # 合言葉認証
├── components/            # 再利用可能なコンポーネント
│   ├── Timeline.tsx            # タイムライン表示
│   ├── ScheduleItem.tsx        # 行程アイテム
│   ├── OverviewSection.tsx     # 概要セクション
│   └── ...
├── lib/                   # ユーティリティ・型定義
│   ├── db.ts                   # DB接続（Vercel Postgres）
│   ├── types.ts                # 型定義
│   └── utils.ts                # ヘルパー関数
└── public/                # 静的ファイル
    ├── favicon.ico
    └── images/
```

**重要な変更点**:
- **プロジェクトルートがNext.jsアプリ**（`frontend/`ディレクトリは不要）
- **App Router構造**: `app/`ディレクトリがルーティングの基準
- **API Routesで統合**: バックエンド用の`backend/`ディレクトリは不要
- **ファイルベースルーティング**: ディレクトリ構造がそのままURLになる

---

## 2. 技術スタック詳細

### フルスタック

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| **フレームワーク** | **Next.js** | 16.x | フルスタックReactフレームワーク |
| 言語 | **TypeScript** | latest | 型安全な開発（フロント・バックエンド統一） |
| スタイリング | **Tailwind CSS** | 4.x | ユーティリティファーストCSS |
| アイコン | **Lucide React** | latest | 軽量アイコンライブラリ |
| 日付処理 | **date-fns** | latest | 日付フォーマット・計算 |
| パッケージマネージャー | **pnpm** | 10.28.0 | 高速・効率的（Corepackで管理） |

### 開発環境

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|------|------|
| コンテナ | **Docker** | latest | ローカル開発環境 |
| オーケストレーション | **Docker Compose** | latest | コンテナ管理 |
| Node.js | **v24.x LTS (Krypton)** | 24.12+ | JavaScriptランタイム（2028年4月までサポート） |

**Note**: Next.js 16はNode.js 18.18以上が必要ですが、長期サポートのためNode.js 24 LTSを採用

### データベース（将来実装）

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| DB | **Neon Postgres** | PostgreSQL互換（Vercel統合、無料枠512MB） |
| ORM候補 | Drizzle ORM / Prisma | 型安全なDB操作 |

**注**: 2024年Q4にVercel PostgresからNeon Postgresへ移行済み。無料枠は改善（512MB、190時間/月）

### 将来追加予定

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| Linter | ESLint | コード品質チェック（Next.js標準設定） |
| Formatter | Prettier | コード整形 |
| Git Hooks | Husky + lint-staged | コミット前チェック |
| コミット規約 | Conventional Commits | コミットメッセージ標準化 |

---

## 3. ルーティング設計

### 3.1 ページルーティング（App Router）

Next.js App Routerは**ファイルベースルーティング**を採用。ディレクトリ構造がそのままURLになります。

| パス | ファイルパス | 説明 |
|------|-------------|------|
| `/` | `app/page.tsx` | トップ画面（LP）、サービス説明 |
| `/create` | `app/create/page.tsx` | しおり作成画面 |
| `/i/[id]` | `app/i/[id]/page.tsx` | しおり表示画面（共有URL） |
| `/i/[id]/edit` | `app/i/[id]/edit/page.tsx` | しおり編集画面（合言葉入力） |

**ダイナミックルート**:
- `[id]`は動的セグメント（例: `/i/abc123`）
- React Routerの`:id`に相当

---

### 3.2 API Routes（バックエンド）

API Routesも同じくファイルベースルーティング。`route.ts`ファイルがAPIエンドポイントになります。

| メソッド | パス | ファイルパス | 説明 |
|---------|------|-------------|------|
| `GET` | `/api/shiori/:id` | `app/api/shiori/[id]/route.ts` | しおり取得 |
| `POST` | `/api/shiori` | `app/api/shiori/route.ts` | しおり作成 |
| `PUT` | `/api/shiori/:id` | `app/api/shiori/[id]/route.ts` | しおり更新 |
| `DELETE` | `/api/shiori/:id` | `app/api/shiori/[id]/route.ts` | しおり削除 |
| `POST` | `/api/auth` | `app/api/auth/route.ts` | 合言葉認証 |

**実装例**:
```typescript
// app/api/shiori/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  // しおり一覧取得
  return NextResponse.json({ shiori: [] })
}

export async function POST(request: Request) {
  // しおり作成
  const body = await request.json()
  return NextResponse.json({ id: 'abc123' })
}
```

---

## 4. 開発環境セットアップ

### 4.1 前提条件

- **Docker Desktop** インストール済み
- **Git** インストール済み
- ローカルにNode.jsやpnpmは**不要**（全てDocker内で実行）

---

### 4.2 セットアップ手順

```bash
# リポジトリをクローン
git clone <repository-url>
cd shiori

# Docker環境を起動（初回 or Dockerfile変更時）
docker compose up --build

# 通常起動（2回目以降）
docker compose up

# バックグラウンド起動
docker compose up -d

# ブラウザでアクセス
open http://localhost:3000
```

---

### 4.3 開発コマンド

```bash
# 開発サーバー起動
docker compose up

# コンテナ停止
docker compose down

# ログ確認
docker compose logs -f app

# コンテナに入る
docker compose exec app sh

# コンテナ内でパッケージ追加
docker compose exec app sh
pnpm add <package-name>

# 開発用パッケージを追加
pnpm add -D <package-name>

# パッケージ追加後は再起動
docker compose restart app
```

**重要**: パッケージ追加は必ずコンテナ内で実行してください。ホストマシンでpnpmコマンドを実行すると、pnpmストアの不整合が発生します。

---

### 4.4 その他のコマンド

```bash
# ビルド（本番用）
docker compose exec app sh
pnpm build

# 本番プレビュー
pnpm start

# 型チェック
pnpm type-check

# Lint実行
pnpm lint

# 完全クリーンアップ（node_modulesを含むボリュームも削除）
docker compose down -v
docker compose up --build
```

---

## 5. Docker環境について

### 5.1 なぜDockerを使うのか

- **環境の統一**: Node.js 24 LTSを確実に使用
- **ホストマシンを汚さない**: ローカルにNode.jsインストール不要
- **Vercelとの一貫性**: 本番環境と同じNode.js + pnpmバージョン
- **チーム開発**: 全員が同じ環境で作業可能
- **OS互換性**: macOS/Windows/Linux問わず同じ環境

---

### 5.2 Docker Compose構成

**サービス名**: `app`（Next.jsアプリ全体）

**ポート設定**:
- **開発サーバー**: http://localhost:3000（Next.jsデフォルト）

**ボリューム戦略**:
- `node_modules`: **named volume**で管理（OS固有バイナリの互換性のため）
- プロジェクトルート: **bind mount**（コード変更の即反映）

---

### 5.3 pnpm設定

`package.json`の`packageManager`フィールドが重要:
```json
{
  "packageManager": "pnpm@10.28.0"
}
```

**このフィールドを絶対に変更・削除しないこと**:
- CorepackがDockerとVercelの両方でこのバージョンを自動使用
- チーム全員が同じpnpmバージョンを使用
- ロックファイルの一貫性を保証

---

## 6. Tailwind CSS v4の設定

### 6.1 重要な変更点（v3からv4）

**Tailwind CSS v4は大きく変更されています**:

1. **tailwind.config.js が不要**
   - v3まで必要だった `tailwind.config.js` は削除
   - Next.js 16が自動的にTailwind v4を統合

2. **PostCSS設定が不要**
   - `postcss.config.js` も不要
   - Next.jsが`@tailwindcss/postcss`を自動統合

3. **CSSインポート方法の変更**
   - v3: `@tailwind base; @tailwind components; @tailwind utilities;`
   - v4: `@import "tailwindcss";`（1行のみ）

4. **パフォーマンス向上**
   - フルビルド: 5倍高速
   - インクリメンタルビルド: 100倍高速

---

### 6.2 セットアップ例

**next.config.ts**:
```typescript
import type { NextConfig } from 'next'

const config: NextConfig = {
  // Next.js 16はTailwind v4を自動サポート
  // 特別な設定は不要
}

export default config
```

**app/globals.css**:
```css
@import "tailwindcss";

/* カスタムスタイルをここに追加 */
```

**app/layout.tsx**:
```typescript
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
```

---

## 7. コーディング規約

### 7.1 ファイル命名規則
- **Pageコンポーネント**: `page.tsx`（App Router規約）
- **Layoutコンポーネント**: `layout.tsx`（App Router規約）
- **API Routes**: `route.ts`（App Router規約）
- **再利用コンポーネント**: PascalCase（例: `Timeline.tsx`, `ScheduleItem.tsx`）
- **ユーティリティ**: camelCase（例: `formatDate.ts`）
- **定数**: UPPER_SNAKE_CASE（例: `API_BASE_URL`）

---

### 7.2 コンポーネント設計
- 1ファイル1コンポーネント
- Props の型定義を必須化
- Server ComponentとClient Componentを明確に分ける
  - Client Component: `'use client'`ディレクティブ
  - Server Component: デフォルト（ディレクティブ不要）

---

### 7.3 スタイリング
- Tailwind CSS を優先
- カスタムCSSは最小限に
- レスポンシブ対応必須（モバイルファースト）

---

## 8. 設計方針

### 8.1 モバイルファースト
- スマホ幅固定デザイン（max-width: 480px）
- タップしやすいボタンサイズ（最低44x44px）
- PC表示では中央配置

---

### 8.2 タイムライン表示
- 縦方向レイアウト
- 時系列に沿った表示
- 交通手段アイコンを見やすく配置
- 視覚的に美しいデザイン

---

### 8.3 データフロー

**Server Componentsを活用**:
```
Server Component → DB直接アクセス → レンダリング
```

**Client Componentsの場合**:
```
Client Component → API Routes → DB → レスポンス
```

Next.jsでは、Server Componentsでデータベースに直接アクセスできるため、多くの場合API Routesは不要です。ただし、Client Componentからのデータ更新にはAPI Routesを使用します。

---

## 9. デプロイ

### 9.1 開発環境
- **ローカル**: Docker Compose
- **URL**: http://localhost:3000

---

### 9.2 本番環境
- **プラットフォーム**: Vercel
- **デプロイ方法**: GitHub連携（自動デプロイ）
- **ビルドコマンド**: `pnpm build`（Vercel自動検出）
- **出力ディレクトリ**: `.next/`（Vercel自動検出）

**Vercel設定**:
- Vercelが`package.json`の`packageManager`フィールドを読み取り
- 自動的にpnpm 10.28.0を使用
- 環境変数の設定のみで即デプロイ可能

---

## 10. 環境変数

### 10.1 開発環境（.env.local）

```bash
# データベース接続（Neon Postgres via Vercel、ローカルテスト用）
POSTGRES_URL="postgres://user:pass@localhost:5432/shiori"
POSTGRES_PRISMA_URL="postgres://user:pass@localhost:5432/shiori?pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgres://user:pass@localhost:5432/shiori"

# 合言葉ハッシュ化用のソルトラウンド
BCRYPT_SALT_ROUNDS=10

# Next.js設定
NODE_ENV=development
```

**重要**: `.env.local`は`.gitignore`に含めること

---

### 10.2 本番環境（Vercel）

Neon Postgres連携時に**自動設定**される環境変数:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

**注**: 2024年Q4以降、Vercel MarketplaceからNeon統合を追加すると上記環境変数が自動設定されます

追加で手動設定が必要な環境変数:
- `BCRYPT_SALT_ROUNDS`

---

## 11. 今後の拡張計画

### Phase 1: Next.js環境構築（現在）
- ✅ Docker + Next.js 16セットアップ
- 🔄 App Router構造の作成
- 🔄 静的ページ作成（モック）
- 🔄 Tailwind CSS v4統合

---

### Phase 2: API Routes実装
- Next.js API Routes実装（CRUD）
- Neon Postgres (via Vercel)連携
- 合言葉認証（bcrypt）
- 自動削除機能の実装（cron job or Vercel Cron）

---

### Phase 3: フロント・バックエンド連携
- Server ActionsまたはAPI Routes経由でDB操作
- フォーム送信・データ取得
- 楽観的UI更新（Optimistic Updates）
- エラーハンドリング

---

### Phase 4: 品質向上
- ESLint + Prettier 導入（Next.js標準設定）
- Husky + lint-staged 導入
- テスト追加（Jest + React Testing Library）
- E2Eテスト（Playwright）

---

### Phase 5: 将来機能
- 写真挿入機能（Cloudflare R2 + Next.js Image）
- カラーテーマ選択
- QRコード生成
- PDF出力
- OGP画像生成（動的）

---

## 12. SEO対策

### 12.1 Next.jsのSEO機能を活用

**Metadata API**:
```typescript
// app/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '旅のしおり - 旅行の行程表を簡単作成',
  description: '旅行の行程表を簡単に作成し、URLで共有できるWebサービス',
  openGraph: {
    title: '旅のしおり',
    description: '旅行の行程表を簡単作成・共有',
    images: ['/og-image.png'],
  },
}
```

---

### 12.2 基本的なSEO対策

- ✅ **SSR/SSG**: Next.jsが標準でサポート（SEOに有利）
- title, description メタタグ設定（Metadata API）
- OGP画像設定
- robots.txt 作成（`public/robots.txt`）
- sitemap.xml 作成（動的生成可能）

---

### 12.3 検索キーワード
- 「旅のしおり Webアプリ」
- 「旅行 しおり 作成」
- 「行程表 共有」
- 「旅行計画 テンプレート」

**Next.jsの利点**: SPAと異なり、SSR/SSGによりクローラーが確実にコンテンツを読み取れる

---

## 13. パフォーマンス最適化

### 13.1 Next.js 16の最適化機能

- **React Server Components**: サーバーサイドレンダリングでバンドルサイズ削減
- **`use cache`ディレクティブ**: ページ、コンポーネント、関数のキャッシュ制御が明示的かつ柔軟に
- **React Compiler**: コンポーネントの自動メモ化で不要な再レンダリングを削減（手動最適化が不要）
- **ルーティング改善**: 共有レイアウトのプリフェッチ最適化で大幅な性能向上
- **Turbopack**: 超高速な開発サーバー（Viteより高速）
- **Image Optimization**: 自動画像最適化（Next.js Image）
- **Font Optimization**: Googleフォント最適化（next/font）
- **Code Splitting**: 自動コード分割

---

### 13.2 目標

- **ページ読み込み**: 3秒以内
- **API応答時間**: 1秒以内
- **Lighthouse Score**: 90以上

---

## 14. トラブルシューティング

### パッケージ追加時にエラーが出る

**エラー例**:
```
ERR_PNPM_UNEXPECTED_STORE  Unexpected store location
```

**解決方法**:
```bash
# コンテナ内で実行
docker compose exec app sh
pnpm install
pnpm add <package-name>
```

---

### ホットリロードが効かない

```bash
# 完全に再ビルド
docker compose down
docker compose up --build
```

---

### node_modulesが削除できない

Docker Composeでボリュームマウントしているため、直接削除できません。

```bash
# ボリュームごと削除
docker compose down -v
docker compose up --build
```

---

## 15. 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [pnpm Documentation](https://pnpm.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
