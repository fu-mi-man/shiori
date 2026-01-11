# 旅のしおり - フロントエンド

React + TypeScript + Vite を使用した旅のしおり作成サービスのフロントエンドアプリケーション。

## 技術スタック

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| 言語 | TypeScript | 5.9.x |
| フレームワーク | React | 19.2.x |
| ビルドツール | Vite | 7.2.x |
| スタイリング | Tailwind CSS | 4.1.x |
| ルーティング | React Router | 7.x |
| パッケージマネージャー | pnpm | 10.28.0 |

## 環境構築

### 前提条件

- Docker Desktop インストール済み
- ローカルにNode.jsやpnpmは**不要**（全てDocker内で実行）

### 開発環境の起動

```bash
# プロジェクトルートで実行
cd ../  # shiori/ ディレクトリに移動

# コンテナをビルド＆起動（初回 or Dockerfile変更時）
docker compose up --build -d

# 通常起動（2回目以降）
docker compose up -d

# ログ確認
docker compose logs -f frontend

# 停止
docker compose down
```

ブラウザで http://localhost:5173 にアクセス

---

## 開発フロー

### コンテナに入る

```bash
# プロジェクトルートで実行
docker compose exec frontend sh
```

### パッケージの追加

**重要**: パッケージ追加は必ずコンテナ内で実行してください。

```bash
# コンテナに入る
docker compose exec frontend sh

# パッケージをインストール
pnpm add <package-name>

# 開発用パッケージをインストール
pnpm add -D <package-name>

# コンテナから抜ける
exit
```

**注意事項**:
- ローカルでpnpmコマンドを実行しないでください
- パッケージ追加後は `docker compose restart frontend` で反映

### ビルド

```bash
# コンテナ内で実行
pnpm build

# プレビュー
pnpm preview
```

---

## 重要な設定

### 1. package.jsonの`packageManager`フィールド

```json
{
  "packageManager": "pnpm@10.28.0"
}
```

このフィールドは**絶対に削除・変更しないでください**。

- Corepackがこのバージョンを自動的に使用
- チーム全員が同じpnpmバージョンを使用
- Vercelデプロイ時もこのバージョンが使われる

### 2. pnpmストアの場所

Dockerfileで以下のように設定されています：

```dockerfile
ENV PNPM_STORE_DIR=/app/.pnpm-store
```

これにより、pnpmのストアが一貫した場所に配置されます。

---

## Tailwind CSS v4 について

### 重要な変更点

Tailwind CSS v4では従来のv3から大きく変更されています：

- ❌ `tailwind.config.js` は**不要**
- ❌ `postcss.config.js` も**不要**
- ✅ `vite.config.ts` にプラグインを追加
- ✅ CSSは `@import "tailwindcss";` の1行のみ

### 設定例

**vite.config.ts**:
```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**src/index.css**:
```css
@import "tailwindcss";
```

---

## React Router v7 について

### インストール済みパッケージ

- `react-router-dom` (v7系)

### 基本的な使い方

```tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/create">Create</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

---

## トラブルシューティング

### パッケージ追加時にエラーが出る

**エラー例**:
```
ERR_PNPM_UNEXPECTED_STORE  Unexpected store location
```

**解決方法**:
```bash
# コンテナ内で実行
pnpm install
pnpm add <package-name>
```

### ホットリロードが効かない

```bash
# 完全に再ビルド
docker compose down
docker compose up --build -d
```

### node_modulesが削除できない

Docker Composeでボリュームマウントしているため、直接削除できません。

```bash
# ボリュームごと削除
docker compose down -v
docker compose up --build -d
```

---

## ディレクトリ構成

```
frontend/
├── Dockerfile             # Docker設定
├── package.json           # 依存関係定義
├── pnpm-lock.yaml         # ロックファイル
├── vite.config.ts         # Vite設定
├── tsconfig.json          # TypeScript設定
├── index.html             # エントリーポイント
├── src/
│   ├── main.tsx           # アプリエントリー
│   ├── App.tsx            # ルートコンポーネント
│   ├── pages/             # 画面コンポーネント
│   ├── components/        # 再利用可能なコンポーネント
│   ├── assets/            # 画像・アイコン
│   └── styles/            # グローバルCSS
└── public/                # 静的ファイル
```

---

## 参考リンク

- [Vite Documentation](https://vite.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
- [pnpm Documentation](https://pnpm.io/)
