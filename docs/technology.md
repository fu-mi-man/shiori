# 技術選定

## 1. プロジェクト概要

**サービス名**: 旅のしおり作成サービス(仮)

**目的**:
- 旅行の行程表を簡単に作成・共有できるWebサービス
- 「行程さん」(2020年終了)のような使いやすさを目指す

**想定ユーザー数**: 数十人規模(個人プロジェクト)

**運用方針**:
- **完全無料で運用開始**
- まずはリリースして需要を見極める
- アクセスが集まれば商用化を検討

---

## 2. 検討したアーキテクチャ

### パターンA: Cloudflare + Render + Supabase

**構成**:
```
フロント: Cloudflare Pages (React)
API: Render (Python/FastAPI)
DB: Supabase (PostgreSQL)
```

**メリット**:
- 完全無料で運用可能
- 商用利用OK
- React、Python、PostgreSQL全て使える

**デメリット**:
- Renderが15分無操作で自動スリープ(起動に10〜30秒)
- 3つのサービスを管理する必要がある
- デプロイが複雑

**コスト**: 月額0円

---

### パターンB: Vercel完結（Next.js）

**構成**:
```text
フルスタック: Vercel (Next.js 16 App Router)
API: Next.js API Routes / Server Actions
DB: Neon Postgres (PostgreSQL、Vercel統合)
```

**メリット**:
- 完全無料（非商用利用限定）
- スリープなし、常時起動
- 管理が簡単(1箇所のみ)
- デプロイが超簡単
- **単一言語(TypeScript)で完結**
- **最速のパフォーマンス**(Node.jsはPythonより起動が速い)
- **React Server Componentsで最新のベストプラクティス**
- **学習リソースが豊富**
- **Neon無料枠**（0.5GB/プロジェクト、100 CU時間/月、プロジェクト数20まで）

**デメリット**:
- **無料プランは非商用のみ**（Vercel利用規約上の制約）
- 広告・収益化は不可（規約違反によるアカウント停止リスクあり）
- 商用化時は必ずPro ($20/月)への移行が必要
- Pythonの学習にならない

**コスト**: 月額0円(非商用)、$20/月(商用)

**重要**: 2024年Q4にVercel PostgresはNeon Postgresへ移行済み。無料枠の詳細: 0.5GB/プロジェクト、100 CU時間/月

---

### パターンC: VPS

**構成**:
```
VPS: さくらVPS / ConoHa
全部載せ: React + Python/FastAPI + PostgreSQL
```

**メリット**:
- 完全な自由度
- 商用利用OK
- 学習効果が高い

**デメリット**:
- 有料(月額500円〜)
- 全て自分で管理・設定が必要
- 初心者にはハードルが高い

**コスト**: 月額500〜1000円

---

### パターンD: VPS + Pocketbase/Trailbase

**構成**:
```
VPS: さくらVPS / ConoHa（月500円〜）
バックエンド: Pocketbase または Trailbase（オールインワン）
  - DB: SQLite
  - API: 組み込み
  - ファイルストレージ: 組み込み
```

**メリット**:
- DB・API・ファイルストレージが一体化
- 単一バイナリで動作（デプロイ簡単）
- オープンソース（MIT/OSL-3.0）
- 高速・軽量（メモリ90-150MB）
- Trailbaseは特に高速（Rustベース）
- 完全な自由度

**デメリット**:
- **月額500円〜のコストが発生**
- サーバー管理が必要（セキュリティ対応含む）
- 初心者にはハードルが高い
- Trailbaseは新しく情報が少ない

**コスト**: 月額500〜1000円

**評価**: 優秀なBaaSだが、「完全無料」の要件を満たさないため不採用

---

## 3. 採用構成（ファーストリリース）

**選定結果**: パターンB - Vercel完結型（Next.js）

**構成**:
```text
フルスタック: Vercel (Next.js 16 App Router)
API: Next.js API Routes / Server Actions
DB: Vercel Postgres (PostgreSQL)
画像: なし（将来的にCloudflare R2を追加）
開発環境: Docker + pnpm（Node.js 24 LTS）
```

**採用理由**:
1. **完全無料で運用可能**（非商用利用）
2. スリープなし、常時起動（Vercel Fluid Compute）
3. 管理が簡単（1箇所のみ、単一言語）
4. デプロイが超簡単（Git pushのみ）
5. 段階的に機能追加・移行が可能
6. **フルスタックTypeScriptの実践学習ができる**
7. **最速のパフォーマンス**（コールドスタート最小化）
8. **市場価値の高いスキルセット**（Next.js + TypeScript）

**コスト**: 月額0円

---

## 4. 技術スタック

| カテゴリ | 技術 | 備考 |
|---------|------|------|
| フルスタックフレームワーク | **Next.js 16** | App Router、React Server Components |
| 言語 | **TypeScript** | フロント・バックエンド統一 |
| スタイリング | **Tailwind CSS v4** | レスポンシブ対応 |
| UIコンポーネント | **shadcn/ui** | Tailwind + Radix UI、アクセシビリティ対応 |
| フォーム管理 | **React Hook Form + Zod** | 型安全なバリデーション |
| アイコン | **React Icons** | 多様な交通手段アイコン |
| 日付処理 | **date-fns** | 軽量日付ライブラリ |
| ORM | **Drizzle ORM** | TypeScript-first、軽量高速 |
| データベース | **PostgreSQL** | Neon Postgres（Vercel統合、無料枠0.5GB） |
| 画像ストレージ | **Cloudflare R2** | 将来実装時に追加（無料枠10GB） |
| パッケージマネージャー | **pnpm** | Corepackで管理（v10.28.0） |
| 開発環境 | **Docker** | Node.js 24 LTS |
| デプロイ | **Vercel** | Hobby無料プラン（**非商用利用限定**） |
| バージョン管理 | **Git + GitHub** | - |

---

## 5. 画像機能の実装戦略（将来）

### 5.1 画像ストレージサービスの比較（2025年）

将来的な写真挿入機能のため、画像ストレージを事前検討。

| サービス | 無料枠 | 有料 | 商用利用 | 評価 |
|---------|--------|------|---------|------|
| **Cloudflare R2** | 10GB、100万アップロード/月 | $0.015/GB | ✅ | ⭐推奨 |
| Supabase Storage | 1GB、7日で停止 | $25/月〜 | ✅ | 無料枠が少ない |
| Vercel Blob | なし（Pro必須） | $20/月〜 | ✅ | 無料不可 |
| Pocketbase/Trailbase | 無制限（VPS次第） | VPS代 | ✅ | 月額500円〜 |

### 5.2 Cloudflare R2を選ぶ理由

**無料枠が大きい**:
- ストレージ: 10GB/月
- アップロード: 100万リクエスト/月
- ダウンロード: 1000万リクエスト/月
- **帯域幅: 完全無料**

**Vercelとの相性**:
- S3互換APIで簡単に連携（TypeScriptの`@aws-sdk/client-s3`）
- Vercel無料プランを継続可能
- 商用化後もコストが安い（$0.015/GB、AWS S3の約1/10）

**実装イメージ**:
1. フロント → Next.js API Routes: 画像アップロード要求
2. API Routes: Presigned URLを生成
3. フロント → R2: 直接アップロード
4. API Routes: 画像URLをDBに保存

---

## 6. 段階的な移行戦略

### フェーズ1: ファーストリリース（完全無料）

**構成**:
```
Next.js 16完結型（画像機能なし）
```

**コスト**: 月額0円

**目的**:
- まずはリリースして需要を確認
- ユーザーのフィードバックを収集
- 基本機能の安定稼働を確認

**技術スタック**:
- Next.js 16 App Router
- Neon Postgres (via Vercel)
- Tailwind CSS v4 + shadcn/ui
- React Hook Form + Zod
- Drizzle ORM
- React Icons

---

### フェーズ2: 画像機能追加（完全無料継続）

**構成**:
```text
Next.js 16 + Cloudflare R2
```

**コスト**: 月額0円（無料枠内）

**実装内容**:
- 概要・行程への写真挿入機能
- Cloudflare R2との連携（S3互換API）
- 画像最適化・リサイズ処理（Next.js Image Optimization）

**移行難易度**: 低（数時間〜1日）

---

### フェーズ3: 商用化時の移行（需要があれば）

**移行タイミング**:
- 広告を貼りたくなった時
- アクセスが大幅に増加した時（月10万PV超など）
- 収益化したくなった時

**移行先候補**:

| 移行先 | 月額 | 特徴 | 移行難易度 |
|--------|------|------|-----------|
| **Vercel Pro** | $20 | 最も簡単、コード変更不要 | 極低 |
| VPS + Pocketbase | 500円〜 | 自由度高、オールインワン | 中 |
| VPS + 既存構成 | 500円〜 | コード変更少、自由度高 | 中 |
| Railway | $5〜 | バランス型 | 低 |

**推奨**: Vercel Pro（設定変更のみで移行完了）

**移行作業量**:
- Vercel Pro: 即日（設定のみ）
- VPS移行: 1〜3日（環境構築含む）

---

## 7. まとめ

**採用アーキテクチャ**:
- **今すぐ**: Next.js 16完結型（画像なし）→ 月額0円（**非商用利用限定**）
- **画像追加時**: Next.js 16 + Cloudflare R2 → 月額0円（**非商用利用限定**）
- **商用化時**: Vercel Pro → 月額$20（**必須**）

**選定理由**:
- 完全無料で始められる（非商用利用に限る）
- **単一言語（TypeScript）で管理が簡単**
- **最速のパフォーマンス**（Vercel Fluid Compute）
- 需要を見極めてから投資できる
- 段階的に機能追加・移行可能
- 商用化後もコストが抑えられる
- **市場価値の高いスキルセット**（Next.js + TypeScript）
- **Neon無料枠**（0.5GB/プロジェクト、100 CU時間/月）

**代替案（検討したが不採用）**:
- **FastAPI (Python)**: 学習目的なら選択肢だが、このプロジェクトには過剰スペック。単純なCRUD操作にはNext.js API Routesで十分
- **Pocketbase/Trailbase**: 優秀だが月額500円〜かかる
- **Supabase**: 無料枠が小さく、7日で停止する

**Python学習について**:
- このプロジェクトはバックエンドロジックが非常にシンプル（CRUD + bcrypt）
- FastAPIの真の強みは、機械学習API、画像処理、複雑な非同期処理など
- Python学習は別途、FastAPIの強みを活かせるプロジェクトで行うことを推奨

**結論**: まずは完全無料（非商用）のNext.js 16完結型でリリースし、需要を確認してから次のステップを検討する

**重要な注意事項（2026年1月時点）**:
- Vercel PostgresはNeon Postgresへ移行済み（2024年Q4-2025年Q1）
- Neon無料枠: 0.5GB/プロジェクト、100 CU時間/月、プロジェクト数20まで
- Vercel Hobby無料プランは**非商用利用限定**（規約上の制約）
- 広告掲載や収益化を行う場合は必ずPro ($20/月)への移行が必要

**Next.js 16の新機能**:
- **`use cache`ディレクティブ**: ページ、コンポーネント、関数のキャッシュ制御が明示的かつ柔軟に
- **React Compiler サポート**: コンポーネントの自動メモ化で不要な再レンダリングを削減
- **ルーティング改善**: 共有レイアウトのプリフェッチ最適化（50リンクで50回 → 1回のダウンロードに）
- **Build Adapters API**: カスタムホスティングプロバイダーとの統合が容易に

---

## 8. UIライブラリとフォーム管理の選定理由

### 8.1 shadcn/ui: UIコンポーネントライブラリ

**採用理由**:
- **Tailwind CSS v4の上に構築**: 既存のTailwind設定をそのまま活用
- **コピー可能なコンポーネント**: npm依存関係ではなく、コードを直接プロジェクトにコピー
- **完全なカスタマイズ性**: 自分のコードなので自由に編集可能
- **アクセシビリティ対応**: Radix UIベースで、ARIA対応が標準
- **TypeScript完全サポート**: 型安全なコンポーネント
- **豊富なコンポーネント**: Button、Card、Calendar、Dialog、Formなど全て揃っている

**このプロジェクトでの用途**:
- タイムラインカード（Card）
- ボタン（Button）
- 日付ピッカー（Calendar）
- フォーム要素（Input、Textarea、Select）
- ダイアログ・モーダル（Dialog）
- トースト通知（Toast）

**代替案との比較**:
| ライブラリ | バンドルサイズ | カスタマイズ性 | 評価 |
|---------|-------------|--------------|-----|
| **shadcn/ui** | 小（必要な分のみ） | ◎（コードを直接編集） | ⭐推奨 |
| Chakra UI | 大 | ○（テーマ設定） | 過剰スペック |
| Material UI | 大 | △（テーマ複雑） | デザインが固定的 |
| Mantine | 中 | ○（テーマ設定） | 悪くないが、shadcn/uiより重い |

---

### 8.2 React Hook Form + Zod: フォーム管理とバリデーション

**採用理由**:
- **動的フォームに最適**: 概要追加、日程追加、スケジュール項目の動的追加・削除が簡単
- **型安全なバリデーション**: Zodで定義したスキーマから自動的に型推論
- **パフォーマンス**: 不要な再レンダリングを最小化（uncontrolled componentsベース）
- **shadcn/uiと完全統合**: shadcn/uiのFormコンポーネントがReact Hook Formと統合済み
- **エラーハンドリング**: フィールドごとのエラーメッセージ表示が簡単
- **Next.js Server Actionsとの統合**: サーバーサイドバリデーションも簡単

**実装例**:
```typescript
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// しおりのスキーマ定義
const shioriSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内'),
  overview: z.array(z.object({
    title: z.string().min(1, '概要タイトルは必須です'),
    content: z.string()
  })),
  schedule: z.array(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付形式が正しくありません'),
    time: z.string().optional(),
    transport: z.enum(['train', 'bus', 'plane', 'walk', 'taxi', 'ship']),
    memo: z.string().optional()
  })),
  password: z.string().min(4, '合言葉は4文字以上').optional()
})

// 型推論
type ShioriFormData = z.infer<typeof shioriSchema>

// フォームの使用
const form = useForm<ShioriFormData>({
  resolver: zodResolver(shioriSchema),
  defaultValues: {
    title: '',
    overview: [],
    schedule: []
  }
})
```

**代替案との比較**:
| ライブラリ | パフォーマンス | 型安全性 | 評価 |
|---------|-------------|---------|-----|
| **React Hook Form + Zod** | ◎ | ◎ | ⭐推奨 |
| Formik | ○ | △ | 再レンダリングが多い |
| React Final Form | ○ | △ | メンテナンス停滞 |
| 手動実装 | △ | × | 実装コスト高 |

---

### 8.3 React Icons: アイコンライブラリ

**採用理由**:
- **多様なアイコンセット**: Font Awesome、Material Icons、Bootstrap Iconsなど全て使える
- **交通手段アイコンが豊富**: 電車、バス、飛行機、船、タクシー、徒歩など多様
- **統一インターフェース**: すべてのアイコンが同じ方法で使用可能
- **Tree Shaking対応**: 未使用アイコンは自動的にバンドルから除外
- **軽量**: 使用した分だけバンドルされる

**このプロジェクトでの用途**:
```typescript
import {
  FaTrain,       // 電車
  FaBus,         // バス
  FaPlane,       // 飛行機
  FaShip,        // 船
  FaTaxi,        // タクシー
  FaWalking,     // 徒歩
  FaCar,         // 車
  FaBicycle,     // 自転車
  FaSubway,      // 地下鉄
  FaCalendar,    // カレンダー
  FaClock        // 時計
} from 'react-icons/fa'
```

**代替案との比較**:
| ライブラリ | アイコン数 | 交通アイコン | 評価 |
|---------|---------|------------|-----|
| **React Icons** | 10,000+ | ◎ | ⭐推奨 |
| Lucide React | 1,000+ | ○ | 交通アイコンが少ない |
| Heroicons | 300+ | △ | 交通アイコンがほぼない |

---

### 8.4 Drizzle ORM: データベースORM

**採用理由**:
- **TypeScript-first設計**: 型推論が強力で、型安全なクエリ
- **軽量高速**: Prismaより小さいバンドルサイズ
- **Next.js Server Componentsと相性抜群**: サーバーコンポーネントで直接使用可能
- **Neon Postgresとの統合が簡単**: 公式ドキュメントでNeon統合をサポート
- **マイグレーション管理**: SQL-likeな構文でマイグレーションが簡単

**実装例**:
```typescript
// schema.ts
import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core'

export const shiori = pgTable('shiori', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 100 }).notNull(),
  overview: jsonb('overview').$type<OverviewItem[]>(),
  schedule: jsonb('schedule').$type<ScheduleItem[]>(),
  passwordHash: varchar('password_hash', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  lastAccessedAt: timestamp('last_accessed_at').defaultNow()
})

// クエリ
import { db } from '@/lib/db'
import { shiori } from '@/lib/schema'
import { eq } from 'drizzle-orm'

// しおり取得
const result = await db.select().from(shiori).where(eq(shiori.id, id))

// しおり作成
const newShiori = await db.insert(shiori).values({
  title: 'My Trip',
  overview: [],
  schedule: []
}).returning()
```

**Prismaとの比較**:
| 項目 | Drizzle ORM | Prisma |
|------|------------|--------|
| **バンドルサイズ** | 小（~40KB） | 大（~500KB） |
| **パフォーマンス** | 高速 | 中速 |
| **学習曲線** | 中（SQL知識が活かせる） | 緩やか |
| **Next.js 16推奨度** | ⭐⭐⭐ | ⭐⭐ |
| **型安全性** | ◎ | ◎ |
| **マイグレーション** | SQL-like | 独自DSL |

**Drizzle ORM採用の決め手**:
1. Next.js 16のServer Componentsとの相性が最高
2. バンドルサイズが小さく、パフォーマンス優先
3. TypeScript型推論が強力で、開発体験が良い
4. Neon Postgresとの統合が公式サポート
