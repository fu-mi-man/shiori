# 開発環境構成

## ディレクトリ構成

```
shiori/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── route.ts
│   │   └── shiori/
│   │       ├── [id]/
│   │       │   └── route.ts
│   │       └── route.ts
│   ├── board/
│   │   └── page.tsx            # Phase 2
│   ├── create/
│   │   └── page.tsx
│   ├── i/
│   │   └── [id]/
│   │       ├── edit/
│   │       │   └── page.tsx
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ShioriForm.tsx
│   ├── Timeline.tsx
│   └── ...
├── docs/
│   ├── requirements/
│   │   ├── data.md
│   │   ├── features.md
│   │   ├── overview.md
│   │   └── screens.md
│   ├── benchmark.md
│   ├── development.md
│   └── technology.md
├── lib/
│   ├── db.ts
│   ├── types.ts
│   └── utils.ts
├── locales/                    # Phase 2
│   ├── en.json
│   └── ja.json
├── public/
├── CLAUDE.md
├── compose.yaml
├── Dockerfile
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── README.md
└── tsconfig.json
```



## ルーティング

### ページ

| パス | ファイル | 説明 |
|------|----------|------|
| `/` | `app/page.tsx` | トップ画面 |
| `/create` | `app/create/page.tsx` | 作成画面 |
| `/i/[id]` | `app/i/[id]/page.tsx` | 表示画面 |
| `/i/[id]/edit` | `app/i/[id]/edit/page.tsx` | 編集画面 |
| `/board` | `app/board/page.tsx` | 掲示板（Phase 2） |

### API

| メソッド | パス | 説明 |
|---------|------|------|
| POST | `/api/shiori` | しおり作成 |
| GET | `/api/shiori/[id]` | しおり取得 |
| PUT | `/api/shiori/[id]` | しおり更新 |
| DELETE | `/api/shiori/[id]` | しおり削除 |
| POST | `/api/auth` | 合言葉認証 |



## コーディング規約

| 対象 | 規約 |
|------|------|
| Pageコンポーネント | `page.tsx`（App Router規約） |
| Layoutコンポーネント | `layout.tsx`（App Router規約） |
| API Routes | `route.ts`（App Router規約） |
| 再利用コンポーネント | PascalCase（`Timeline.tsx`） |
| ユーティリティ | camelCase（`formatDate.ts`） |
| Server Component | デフォルト |
| Client Component | `'use client'`ディレクティブ |
