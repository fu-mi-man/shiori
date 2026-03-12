# 技術選定

## 結論: Vercel + Next.js 16 フルスタック構成

**採用アーキテクチャ**:
```text
フルスタック: Vercel (Next.js 16 App Router)
API: Next.js Server Actions / Route Handlers
DB: Neon Postgres (Vercel統合、無料枠0.5GB)
画像: Cloudflare R2 (Phase 3以降、無料枠10GB)
```

**コスト**: 月額0円（非商用利用限定）

**採用理由**:
1. **完全無料で運用可能**（非商用利用）
2. **スリープなし、常時起動**（Vercel Fluid Compute）
3. **管理が簡単**（1箇所のみ、単一言語TypeScript）
4. **デプロイが超簡単**（Git pushのみ）
5. **最速のパフォーマンス**（コールドスタート最小化）
6. **市場価値の高いスキルセット**（Next.js + TypeScript）

**重要な注意事項**:
- Vercel Hobby無料プランは**非商用利用限定**（規約上の制約）
- 広告掲載や収益化を行う場合は必ず**Pro ($20/月)**への移行が必要



## 1. プロジェクト概要

→ 詳細は [01_overview.md](../01_requirements/01_overview.md) を参照

**運用方針**:
- **完全無料で運用開始**（Vercel Hobby無料プラン）
- まずはリリースして需要を見極める
- アクセスが集まれば商用化を検討（Vercel Pro $20/月）



## 2. 検討したアーキテクチャ

### パターンA: Cloudflare + Render + Supabase（不採用）

```text
フロント: Cloudflare Pages (React)
API: Render (Python/FastAPI)
DB: Supabase (PostgreSQL)
```

| 項目 | 評価 |
|------|------|
| コスト | 月額0円 |
| 商用利用 | ✅ OK |
| 常時起動 | ❌ Renderは15分無操作でスリープ（起動に10〜30秒） |
| 管理の簡単さ | ❌ 3サービスを管理 |
| デプロイ | ❌ 複雑 |

**不採用理由**: Renderのスリープ問題、管理の複雑さ

---

### パターンB: Vercel完結（Next.js）⭐採用

```text
フルスタック: Vercel (Next.js 16 App Router)
API: Next.js Server Actions / Route Handlers
DB: Neon Postgres (Vercel統合)
```

| 項目 | 評価 |
|------|------|
| コスト | 月額0円（非商用）、$20/月（商用） |
| 商用利用 | ⚠️ Pro必須 |
| 常時起動 | ✅ スリープなし |
| 管理の簡単さ | ✅ 1箇所のみ |
| デプロイ | ✅ Git pushのみ |
| パフォーマンス | ✅ 最速（Node.js > Python） |

**採用理由**: シンプルさ、パフォーマンス、開発体験の良さ

---

### パターンC: VPS（不採用）

```text
VPS: さくらVPS / ConoHa
全部載せ: React + Python/FastAPI + PostgreSQL
```

| 項目 | 評価 |
|------|------|
| コスト | 月額500〜1000円 |
| 商用利用 | ✅ OK |
| 自由度 | ✅ 完全な自由度 |
| 管理の簡単さ | ❌ 全て自分で管理 |

**不採用理由**: 「完全無料」の要件を満たさない

---

### パターンD: VPS + Pocketbase/Trailbase（不採用）

```text
VPS: さくらVPS / ConoHa（月500円〜）
バックエンド: Pocketbase または Trailbase（オールインワン）
```

| 項目 | 評価 |
|------|------|
| コスト | 月額500〜1000円 |
| 商用利用 | ✅ OK |
| 管理の簡単さ | ○ 単一バイナリ |
| パフォーマンス | ✅ 高速・軽量 |

**不採用理由**: 「完全無料」の要件を満たさない



## 3. 技術スタック

### 3.1 採用技術

| カテゴリ | 技術 | 備考 |
|---------|------|------|
| **フレームワーク** | Next.js 16 | App Router、React Server Components |
| **言語** | TypeScript | フロント・バックエンド統一 |
| **スタイリング** | Tailwind CSS v4 | レスポンシブ対応 |
| **UIコンポーネント** | shadcn/ui | Tailwind + Radix UI、アクセシビリティ対応 |
| **フォーム管理** | React Hook Form + Zod | 型安全なバリデーション |
| **アイコン** | Lucide | 軽量、ISC License、交通アイコン充実 |
| **日付処理** | date-fns | 軽量日付ライブラリ。Temporal APIが普及したら置き換え検討 |
| **ORM** | Drizzle ORM | TypeScript-first、軽量高速 |
| **データベース** | Neon Postgres | Vercel統合、無料枠0.5GB |
| **画像ストレージ** | Cloudflare R2 | Phase 3で追加（無料枠10GB） |
| **パッケージマネージャー** | pnpm | Corepackで管理 |
| **開発環境** | Docker | Node.js 24 LTS |
| **デプロイ** | Vercel | Hobby無料プラン（非商用限定） |

### 3.2 検討したが現時点では不要なカテゴリ

以下のカテゴリは検討の上、現時点では専用ライブラリを導入しないと判断した。必要になった時点で改めて選定する。

| カテゴリ | 判断 | 理由 |
|---------|------|------|
| **状態管理** | useStateで開始 | Server Components構成でクライアント側の状態が少ない。useState → useReducer → Zustand/Jotai の順で必要に応じて段階的に移行する |
| **データフェッチング** | Server Components + Route Handlers | Server Componentsで直接DB読み取り、クライアントからはAPI Routes経由で更新。TanStack Query等は不要 |
| **アニメーション** | 未導入 | Framer Motion、React Spring等。UXで必要になったら検討 |
| **認証** | 合言葉認証を自前実装 | NextAuth.js、Clerk等は不要。シンプルな合言葉方式で十分 |
| **国際化 (i18n)** | Phase 2で検討 | next-intl等。英語対応の段階で選定する |
| **トースト/通知** | 未導入 | shadcn/uiにToastコンポーネントが組み込まれているため、必要になったらshadcn/uiのものを追加 |
| **ドラッグ&ドロップ** | 未導入 | dnd kit等。行程の並べ替え機能で必要になったら検討 |
| **PDF出力** | Phase 2で検討 | react-pdf、jsPDF等。しおりのPDF出力機能の段階で選定する |



## 4. Next.js 16の新機能活用

**`use cache`ディレクティブ**:
- ページ、コンポーネント、関数のキャッシュ制御が明示的かつ柔軟に

**React Compiler サポート**:
- コンポーネントの自動メモ化で不要な再レンダリングを削減

**ルーティング改善**:
- 共有レイアウトのプリフェッチ最適化（50リンクで50回 → 1回のダウンロードに）

**Vercel Fluid Compute**:
- コールドスタート最小化
- 常時起動でユーザー体験向上



## 5. ライブラリ選定理由

### 5.1 shadcn/ui

**採用理由**:
- Tailwind CSS v4の上に構築
- コピー可能なコンポーネント（npm依存関係ではない）
- 完全なカスタマイズ性
- アクセシビリティ対応（Radix UIベース）

**代替案との比較**:
| ライブラリ | バンドルサイズ | カスタマイズ性 | 評価 |
|---------|-------------|--------------|-----|
| **shadcn/ui** | 小（必要な分のみ） | ◎ | ⭐推奨 |
| Chakra UI | 大 | ○ | 過剰スペック |
| Material UI | 大 | △ | デザインが固定的 |

---

### 5.2 React Hook Form + Zod

**採用理由**:
- 動的フォームに最適（概要追加、日程追加など）
- 型安全なバリデーション（Zodスキーマから型推論）
- パフォーマンス（uncontrolled componentsベース）
- shadcn/uiと完全統合

**代替案との比較**:
| ライブラリ | パフォーマンス | 型安全性 | 評価 |
|---------|-------------|---------|-----|
| **React Hook Form + Zod** | ◎ | ◎ | ⭐推奨 |
| Formik | ○ | △ | 再レンダリングが多い |

---

### 5.3 Lucide

**採用理由**:
- **軽量**: 必要なアイコンのみインポート、ツリーシェイクが確実に効く
- **ISC License**: 商用利用OK、UIへの帰属表示不要（コード内に残すだけ）
- **交通アイコンが充実**: 電車、バス、飛行機、船、タクシー、徒歩など全て揃っている
- **shadcn/uiと相性抜群**: shadcn/uiの推奨アイコンライブラリ

**使用する交通アイコン**:
```typescript
import {
  TrainFront,    // 電車
  Bus,           // バス
  Plane,         // 飛行機
  Ship,          // 船
  CarTaxiFront,  // タクシー
  Footprints,    // 徒歩
  Car,           // 車
  Bike,          // 自転車
  CableCar,      // ケーブルカー
} from 'lucide-react'
```

**代替案との比較**:
| ライブラリ | バンドルサイズ | ツリーシェイク | ライセンス | 評価 |
|---------|-------------|--------------|-----------|-----|
| **Lucide** | 小 | ✅ 確実 | ISC（帰属不要） | ⭐推奨 |
| React Icons | 大になりがち | ⚠️ 効きにくい場合あり | 各セットによる | 過剰 |
| Heroicons | 小 | ✅ | MIT | 交通アイコンが少ない |

**React Iconsを不採用とした理由**:
- 複数のアイコンセット（Font Awesome、Material Iconsなど）を内包
- ツリーシェイクが効きにくく、バンドルサイズが肥大化するリスク
- Font Awesome使用時はCC BY 4.0で帰属表示が必要になる場合あり
- このプロジェクトでは交通アイコンしか使わないため過剰

---

### 5.4 Drizzle ORM

**採用理由**:
- TypeScript-first設計（型推論が強力）
- 軽量高速（Prismaより小さいバンドルサイズ）
- Next.js Server Componentsと相性抜群
- Neon Postgresとの統合が公式サポート

**Prismaとの比較**:
| 項目 | Drizzle ORM | Prisma |
|------|------------|--------|
| バンドルサイズ | 小（~40KB） | 大（~500KB） |
| パフォーマンス | 高速 | 中速 |
| Next.js 16推奨度 | ⭐⭐⭐ | ⭐⭐ |



## 6. 画像機能の実装戦略（Phase 3）

### 画像ストレージサービスの比較

| サービス | 無料枠 | 商用利用 | 評価 |
|---------|--------|---------|------|
| **Cloudflare R2** | 10GB、100万アップロード/月 | ✅ | ⭐推奨 |
| Supabase Storage | 1GB、7日で停止 | ✅ | 無料枠が少ない |
| Vercel Blob | なし（Pro必須） | ✅ | 無料不可 |

### Cloudflare R2を選ぶ理由

**無料枠が大きい**:
- ストレージ: 10GB/月
- アップロード: 100万リクエスト/月
- ダウンロード: 1000万リクエスト/月
- **帯域幅: 完全無料**

**実装イメージ**:
1. フロント → Next.js Route Handlers: 画像アップロード要求
2. Route Handlers: Presigned URLを生成
3. フロント → R2: 直接アップロード
4. Route Handlers: 画像URLをDBに保存



## 7. 段階的な移行戦略

### Phase 1: MVP（完全無料）

```text
Next.js 16完結型（画像機能なし）
```

**コスト**: 月額0円

**目的**:
- まずはリリースして需要を確認
- ユーザーのフィードバックを収集
- 基本機能の安定稼働を確認

---

### Phase 2: 機能拡充（完全無料継続）

```text
Next.js 16
```

**コスト**: 月額0円（無料枠内）

**実装内容**:
- フィードバック掲示板
- 多言語対応（英語）
- テンプレート機能
- カラーテーマ選択
- PDF出力機能

---

### Phase 3: 商用化（需要があれば）

**移行タイミング**:
- 広告を貼りたくなった時
- アクセスが大幅に増加した時（月10万PV超など）
- 収益化したくなった時

**収益化の内容**:
- AdSense広告（しおり表示画面下部）
- 永久保存課金（買い切り200〜300円/しおり）
- 決済: Stripe（PayPay含む複数決済対応）

**移行先候補**:
| 移行先 | 月額 | 移行難易度 |
|--------|------|-----------|
| **Vercel Pro** | $20 | 極低（設定変更のみ） |
| VPS + Pocketbase | 500円〜 | 中 |
| Railway | $5〜 | 低 |

**推奨**: Vercel Pro（コード変更不要、即日移行可能）



## 8. まとめ

**採用構成**:
- **Phase 1**: Next.js 16完結型（画像なし）→ 月額0円
- **Phase 2**: 機能拡充（掲示板、多言語、PDF等）→ 月額0円
- **Phase 3**: 画像機能 + 商用化（Vercel Pro）→ 月額$20

**選定の決め手**:
1. 完全無料で始められる
2. 単一言語（TypeScript）で管理が簡単
3. 最速のパフォーマンス
4. 段階的に機能追加・移行可能
5. 市場価値の高いスキルセット

**不採用とした代替案**:
- **FastAPI (Python)**: このプロジェクトには過剰スペック
- **Pocketbase/Trailbase**: 優秀だが月額500円〜かかる
- **Supabase**: 無料枠が小さく、7日で停止する

**結論**: Vercel + Next.js 16でシンプルに始め、需要を確認してから次のステップを検討する
