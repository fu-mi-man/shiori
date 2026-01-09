# 開発環境構成

## 1. ディレクトリ構成

```
shiori/
├── .dockerignore           # Docker除外ファイル
├── .gitignore             # Git除外ファイル
├── compose.yaml           # Docker Compose設定
├── README.md              # プロジェクト概要
├── docs/                  # ドキュメント
│   ├── 01_requirements.md      # 要件定義
│   ├── 02_technology.md        # 技術選定
│   └── 03_development.md       # 開発環境（このファイル）
├── frontend/              # フロントエンド
│   ├── Dockerfile         # フロントエンド用Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts     # Vite設定（Tailwind v4設定含む）
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx            # エントリーポイント
│   │   ├── App.tsx             # ルートコンポーネント
│   │   ├── pages/              # 画面単位のコンポーネント
│   │   │   ├── TopPage.tsx         # トップ画面（LP）
│   │   │   ├── CreatePage.tsx      # 作成画面
│   │   │   ├── ViewPage.tsx        # 表示画面（共有URL）
│   │   │   └── EditPage.tsx        # 編集画面
│   │   ├── components/         # 再利用可能なコンポーネント
│   │   │   ├── Timeline.tsx        # タイムライン表示
│   │   │   ├── ScheduleItem.tsx    # 行程アイテム
│   │   │   ├── OverviewSection.tsx # 概要セクション
│   │   │   └── ...
│   │   ├── assets/             # 画像・アイコン
│   │   └── styles/             # グローバルCSS
│   │       └── index.css
│   └── public/                 # 静的ファイル
└── backend/                    # バックエンド（将来追加）
    └── （未実装）
```

---

## 2. 技術スタック詳細

### フロントエンド

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| 言語 | **TypeScript** | latest | 型安全な開発 |
| フレームワーク | **React** | 19.x | UIライブラリ |
| ビルドツール | **Vite** | 7.x | 高速ビルド・開発サーバー |
| スタイリング | **Tailwind CSS** | 4.x | ユーティリティファーストCSS |
| ルーティング | **React Router** | 7.x | SPA用ルーティング |
| アイコン | **Lucide React** | latest | 軽量アイコンライブラリ |
| 日付処理 | **date-fns** | latest | 日付フォーマット・計算 |

### 開発環境

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|------|------|
| コンテナ | **Docker** | latest | ローカル開発環境 |
| オーケストレーション | **Docker Compose** | latest | 複数コンテナ管理 |
| Node.js | **v24.x LTS (Krypton)** | 24.12+ | JavaScriptランタイム（2028年4月までサポート） |

**Note**: Vite 7はNode.js 20.19+または22.12+が必要（Node.js 18は2025年4月にEOL）

### 将来追加予定

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| Linter | ESLint | コード品質チェック |
| Formatter | Prettier | コード整形 |
| Git Hooks | Husky + lint-staged | コミット前チェック |
| コミット規約 | Conventional Commits | コミットメッセージ標準化 |

---

## 3. ルーティング設計

| パス | ページ | 説明 |
|------|--------|------|
| `/` | TopPage | トップ画面（LP）、サービス説明 |
| `/create` | CreatePage | しおり作成画面 |
| `/i/:id` | ViewPage | しおり表示画面（共有URL） |
| `/i/:id/edit` | EditPage | しおり編集画面（合言葉入力） |

---

## 4. 開発環境セットアップ

### 4.1 前提条件

- Docker Desktop インストール済み
- Git インストール済み

### 4.2 セットアップ手順（未実装）

```bash
# リポジトリをクローン
git clone <repository-url>
cd shiori

# Docker環境を起動
docker compose up -d

# ブラウザでアクセス
open http://localhost:5173
```

### 4.3 開発コマンド（未実装）

```bash
# 開発サーバー起動
docker compose up

# コンテナ停止
docker compose down

# ログ確認
docker compose logs -f frontend

# コンテナに入る
docker compose exec frontend sh
```

---

## 5. Tailwind CSS v4の設定

### 5.1 重要な変更点（v3からv4）

**Tailwind CSS v4は大きな変更があります**：

1. **tailwind.config.js が不要**
   - v3まで必要だった `tailwind.config.js` は削除
   - 設定は `vite.config.ts` に統合

2. **PostCSS設定が不要**
   - `postcss.config.js` も不要
   - `@tailwindcss/vite` プラグインで統合

3. **CSSインポート方法の変更**
   - v3: `@tailwind base; @tailwind components; @tailwind utilities;`
   - v4: `@import "tailwindcss";`（1行のみ）

4. **パフォーマンス向上**
   - フルビルド: 5倍高速
   - インクリメンタルビルド: 100倍高速

### 5.2 セットアップ例

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**src/styles/index.css**:
```css
@import "tailwindcss";
```

---

## 6. コーディング規約（将来策定）

### 6.1 ファイル命名規則
- コンポーネント: PascalCase（例: `TopPage.tsx`, `ScheduleItem.tsx`）
- ユーティリティ: camelCase（例: `formatDate.ts`）
- 定数: UPPER_SNAKE_CASE（例: `API_BASE_URL`）

### 6.2 コンポーネント設計
- 1ファイル1コンポーネント
- Props の型定義を必須化
- デフォルトエクスポート推奨

### 6.3 スタイリング
- Tailwind CSS を優先
- カスタムCSSは最小限に
- レスポンシブ対応必須（モバイルファースト）

---

## 7. 設計方針

### 7.1 モバイルファースト
- スマホ幅固定デザイン（max-width: 480px）
- タップしやすいボタンサイズ（最低44x44px）
- PC表示では中央配置

### 7.2 タイムライン表示
- 縦方向レイアウト
- 時系列に沿った表示
- 交通手段アイコンを見やすく配置
- 視覚的に美しいデザイン

### 7.3 データフロー（将来）
```
フロント → API (Vercel Functions) → DB (Vercel Postgres)
```

---

## 8. デプロイ

### 8.1 開発環境
- **ローカル**: Docker Compose

### 8.2 本番環境
- **プラットフォーム**: Vercel
- **デプロイ方法**: GitHub連携（自動デプロイ）
- **ビルドコマンド**: `npm run build`
- **出力ディレクトリ**: `dist/`

---

## 9. 環境変数（将来）

### 9.1 開発環境
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8000
```

### 9.2 本番環境
```bash
# Vercel環境変数
VITE_API_BASE_URL=https://api.example.com
```

---

## 10. 今後の拡張計画

### Phase 1: モック画面作成（現在）
- Docker環境構築
- Reactプロジェクトセットアップ
- 静的モック画面作成（ロジックなし）

### Phase 2: バックエンド追加
- FastAPI セットアップ
- Vercel Postgres 連携
- API実装

### Phase 3: 完全実装
- フロント・バックエンド連携
- 合言葉（認証）機能
- 自動削除機能

### Phase 4: 品質向上
- ESLint + Prettier 導入
- Husky + lint-staged 導入
- テスト追加

### Phase 5: 将来機能
- 写真挿入機能（Cloudflare R2）
- カラーテーマ選択
- QRコード生成
- PDF出力

---

## 11. SEO対策（将来）

### 11.1 基本的なSEO対策
- title, description メタタグ設定
- OGP画像設定
- robots.txt 作成
- sitemap.xml 作成

### 11.2 検索キーワード
- 「旅のしおり Webアプリ」
- 「旅行 しおり 作成」
- 「行程表 共有」

**Note**: SSR/SSGが必要になった場合は、Next.jsへの移行を検討
