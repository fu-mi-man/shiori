
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
      "recommended": true,
      "nursery": {
        "useSortedClasses": "warn"
      }
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
| `nursery.useSortedClasses` | `"warn"` | TailwindCSSクラス名を公式推奨順（レイアウト → サイズ → 余白 → 装飾 → テキスト）に自動ソート。Prettierの `prettier-plugin-tailwindcss` と同じソート順。ソート順は1種類のみでカスタマイズ不可 |

> **nursery について**  
> Biomeの実験段階ルールカテゴリ。Biomeチームが分類を決め，安定したら `recommended` 等に昇格する。バージョンアップで挙動が変わる可能性があるため `"warn"` が無難（`"error"` にすると `pnpm lint` が失敗する，`"off"` で無効化）。安定版に昇格したら `"error"` への変更を検討する。

> **注意: `biome.json` にコメントを書かないこと**  
> Biomeは JSONC（コメント付きJSON）を構文上は受け付けるが，コメントがあると一部の設定（`formatter.indentStyle`，`css.tailwindDirectives` 等）が正しく読み取れないバグがある。設定の説明はこのドキュメントに記載し，`biome.json` 自体にはコメントを入れない。

### 3. package.json にスクリプトを追加

`pnpm add` は `devDependencies` を自動更新するが，`scripts` は自動では追加されない。  
手動で追記する。

```jsonc
{
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --write --unsafe .",
    "format": "biome format --write ."
  }
}
```

| ショートカット | 正規コマンド | ファイル変更 | 用途 |
|---------|---------|:----------:|------|
| `pnpm lint` | `biome check .` | しない | CI・pre-commit |
| `pnpm lint:fix` | `biome check --write --unsafe .` | する | 開発中 |
| `pnpm format` | `biome format --write .` | する | インデント・改行だけ直したいとき |

> **`--unsafe` フラグについて**
> nursery（実験段階）ルールの自動修正には `--unsafe` が必要。  
>`lint:fix` に組み込み済みのため，普段は `pnpm lint:fix` だけでクラスソート等も自動修正される。

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
