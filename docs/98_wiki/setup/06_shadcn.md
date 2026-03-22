
## shadcn/ui

Tailwind CSS v4 + Radix UI ベースのUIコンポーネントライブラリ。  
npm依存ではなくコピー方式のため，コンポーネントを自由にカスタマイズできる。

> 公式ドキュメント: https://ui.shadcn.com/docs/installation/next

### 1. 初期化

対話式CLIのため `-it` フラグが必要。

```bash
docker compose stop web
docker compose run --rm -it web npx shadcn@latest init -t next
docker compose rm -v web
docker compose up --build -d
```

| オプション | 意味 |
|-----------|------|
| `-t next` | Next.js テンプレートを使用 |

> `pnpm dlx` ではなく `npx` を使うこと。`pnpm dlx` はpnpmのストア設定が絡んでクラッシュする。

初期化時の選択肢:

| 質問 | 選択 | 理由 |
|------|------|------|
| Select a component library | **Radix** | shadcn/ui の標準ライブラリ |
| Which preset would you like to use? | **Nova** | Lucide アイコン + Geist フォント。Next.js のデフォルト構成と一致（導入後，フォントを Outfit に変更済み） |

> Tailwind v4 が検出されると，OKLCH形式のCSS変数が `globals.css` に書き込まれる。  
>`tailwind.config.js` は作成されない。  
> `globals.css` の既存内容は上書きされる。

> **注意**: 初期化後に `Can't resolve 'tw-animate-css'` エラーが出る場合は，Turbopackのキャッシュが古い状態を保持しているのが原因（[shadcn-ui/ui#6970](https://github.com/shadcn-ui/ui/issues/6970)）。  
>`.next`（キャッシュフォルダ）を削除してdevサーバーを再起動すれば，クリーンな `.next` が再生成されて解消する。

> ```bash
> docker compose exec web sh -c "rm -rf .next"
> docker compose restart web
> ```


### 2. 生成されるファイル

| ファイル | 内容 |
|---------|------|
| `components.json` | shadcn/ui の設定ファイル |
| `src/lib/utils.ts` | `cn()` ユーティリティ関数（clsx + tailwind-merge） |
| `src/components/ui/button.tsx` | Nova プリセットに含まれるサンプルコンポーネント |
| `src/app/globals.css` | OKLCH形式のCSS変数が書き込まれる（既存内容は上書き） |
| `src/app/layout.tsx` | Geist フォントの設定が追記される（Nova プリセット）。導入後 Outfit フォントに変更済み |

`components.json` の内容を確認し，以下の設定になっていることを確認する:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "radix-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {}
}
```

| 設定 | 値 | 理由 |
|------|-----|------|
| `style` | `radix-nova` | shadcn v4 の Nova プリセット（Lucide + Geist）。フォントは導入後 Outfit に変更済み |
| `tailwind.config` | `""` | Tailwind v4 では `tailwind.config.js` が不要なため空 |
| `rsc` | `true` | React Server Components を使用 |
| `iconLibrary` | `lucide` | Nova プリセットのデフォルトアイコンライブラリ |
| `aliases.ui` | `@/components/ui` | shadcn/ui コンポーネントの配置先 |
| `aliases.hooks` | `@/hooks` | カスタム Hooks の配置先 |


### 3. コンポーネントの追加方法

以降，コンポーネントが必要になったタイミングで都度追加する。

```bash
docker compose exec web sh
pnpm dlx shadcn@latest add <component>   # 例: input, dialog, sonner
```

追加されたコンポーネントは `src/components/ui/` に配置される。
一覧は https://ui.shadcn.com/docs/components を参照。
