
## Biome

Rust製のリンター + フォーマッター。  
ESLint + Prettierを1ツールで代替する。

> 公式ドキュメント: https://biomejs.dev/guides/getting-started/

### 1. インストール

```bash
docker compose exec web sh
pnpm add -D --save-exact @biomejs/biome
```

`--save-exact` でバージョンを完全固定する（`"^2.0.6"` ではなく `"2.0.6"`）。Biome公式推奨。

### 2. 設定ファイルを作成

```bash
pnpm biome init
```

`web/biome.json` が生成される。  
`.git` を検知して `.gitignore` 連携（`vcs`）も自動で設定される。  

以下の内容に編集する:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.5/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "css": {
    "parser": {
      "cssModules": true,
      "tailwindDirectives": true
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double"
    }
  },
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

| 設定 | 値 | 理由 |
|------|-----|------|
| `vcs.useIgnoreFile` | `true` | `.gitignore` の内容を lint・format 対象外にする |
| `formatter.indentStyle` | `"space"` | Next.jsのデフォルトに合わせる |
| `formatter.lineWidth` | `100` | デフォルト（80）より少し広め |
| `css.tailwindDirectives` | `true` | `@theme` 等のTailwind v4構文を認識させる |
| `javascript.formatter.quoteStyle` | `"double"` | JSXとの統一性を保つ |
| `assist.organizeImports` | `"on"` | import文を自動で並び替え |

### 3. package.json にスクリプトを追加

`pnpm add` は `devDependencies` を自動更新するが，`scripts` は自動では追加されない。  
手動で追記する。

```jsonc
{
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write ."
  }
}
```

| コマンド | 実行内容 | ファイル変更 | 用途 |
|---------|---------|:----------:|------|
| `pnpm lint` | lint + format のチェック | しない | CI・pre-commit |
| `pnpm lint:fix` | lint + format の自動修正 | する | 開発中 |
| `pnpm format` | フォーマットのみ自動修正 | する | インデント・改行だけ直したいとき |

### 4. 既存コードを一括整形

```bash
pnpm lint:fix
```

### 5. 動作確認

```bash
pnpm lint
```

エラーが出なければ完了。  
`exit` でコンテナを出る。  
