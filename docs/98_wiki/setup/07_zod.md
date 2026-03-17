
## Zod

TypeScriptファーストのバリデーションライブラリ。
スキーマを定義するだけで，バリデーションとTypeScriptの型推論を同時に得られる。

> 公式ドキュメント: https://zod.dev/

### 1. インストール

`docker compose run` を使う理由は `01_requirements/05_development.md` のパッケージ管理を参照。

```bash
docker compose stop web
docker compose run --rm web pnpm add zod --store-dir /pnpm/store
docker compose rm -v web
docker compose up --build -d
```

| パッケージ | 用途 |
|-----------|------|
| `zod` | スキーマ定義・バリデーション本体 |

> **`--store-dir /pnpm/store` が必要な理由:**
> Dockerfile で `pnpm config set store-dir /pnpm/store` を設定しているが、`docker compose run` で起動した一時コンテナではこのグローバル設定が反映されず、pnpm がデフォルトの `/app/.pnpm-store/v10` を使おうとする。既存の `node_modules` は `/pnpm/store` にリンクされているため、ストアパスの不一致で `ERR_PNPM_UNEXPECTED_STORE` エラーになる。`--store-dir` を明示することで回避できる。

### 2. 設定

設定ファイル不要。インストールのみで使用可能。

### 3. 使い方

Server Action（`"use server"` ファイル）内で `safeParse` によるバリデーションを行う。
Next.js 公式が推奨するパターン。

```ts
'use server'

import { z } from 'zod'

// スキーマ定義（バリデーションルール + 型推論の両方を兼ねる）
const schema = z.object({
  email: z.string({ error: '無効なメールアドレスです' }),
})

export async function createUser(prevState: any, formData: FormData) {
  // safeParse: 例外を投げずに結果オブジェクトを返す
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
  })

  // バリデーション失敗 → エラーを state で返す
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // validatedFields.data は型安全なバリデーション済みデータ
  // DB保存などの処理へ
}
```

**ポイント:**

| メソッド | 動作 |
|---------|------|
| `schema.parse(data)` | 失敗時に例外を投げる |
| `schema.safeParse(data)` | 失敗時に `{ success: false, error }` を返す（Server Action向き） |

| エラー整形 | 用途 |
|-----------|------|
| `error.flatten().fieldErrors` | フィールドごとのエラー配列（フォーム表示向き） |
| `error.issues` | 全エラーの詳細一覧 |

### 4. プロジェクトでの利用方針

`docs/01_requirements/05_development.md` のフォーム実装方針に準拠。

```text
useActionState + Server Action + Zod

[ブラウザ] <form action={formAction}>
    ↓ FormData
[サーバー] Server Action
    ├── safeParse でバリデーション
    ├── 失敗 → エラーを state で返す → ブラウザでエラー表示
    └── 成功 → DB保存 → リダイレクト
```

- バリデーションスキーマは Server Action と同じディレクトリに `schema.ts` として配置
- クライアント側のバリデーションは行わない（サーバーサイドで一元管理）
- エラー表示は `useActionState` の `state` 経由で行う
