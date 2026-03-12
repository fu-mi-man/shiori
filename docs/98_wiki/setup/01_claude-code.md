
## Claude Code

プラグイン・スキル・MCPサーバーの導入手順。  
いずれもプロジェクトスコープで管理し，Git経由でチームに共有される。  
clone した時点で使用可能な状態になる。

> 各ツールの概要・一覧は `01_requirements/05_development.md` の「推奨プラグイン・スキル」を参照。

### 1. プラグイン

リアルタイム型チェック・セキュリティ検出・コードレビューなどの機能を追加する。  
インストールするとプロジェクトの `.claude/settings.json` に記録され，Git管理される。

```bash
/plugin install context7 --scope project
/plugin install security-guidance --scope project
/plugin install typescript-lsp --scope project
/plugin install code-review --scope project
```

| プラグイン | 用途 |
|-----------|------|
| `context7` | Next.js，Tailwind CSS v4，Drizzle等の最新ドキュメントを参照 |
| `security-guidance` | XSS，SQLインジェクション等の脆弱性をコード編集時に自動検出 |
| `typescript-lsp` | リアルタイム型チェック。型エラーをコード編集直後に検出 |
| `code-review` | PRの自動コードレビュー。5つのエージェントが並列でレビュー |

### 2. スキル

Claude Codeにベストプラクティスを教えるスキルファイル。  
`.claude/skills/` にインストールされ，Git管理される。  
ホストで実行する（プロジェクトルートの `.claude/skills/` にインストールするため）。  

```bash
npx skills add vercel-labs/agent-skills -a claude-code
npx skills add vercel-labs/next-skills -a claude-code
npx skills add anthropics/skills --skill frontend-design --skill skill-creator -a claude-code
```

| コレクション | 選択するスキル | 用途 |
|-------------|--------------|------|
| `vercel-labs/agent-skills` | `vercel-composition-patterns`<br>`vercel-react-best-practices`<br>`web-design-guidelines` | React全般のベストプラクティス |
| `vercel-labs/next-skills` | 全て | Next.js固有のベストプラクティス |
| `anthropics/skills` | `frontend-design`<br>`skill-creator` | 高品質UIデザイン生成・スキル作成支援 |

> `vercel-labs/agent-skills` のインストール時，`vercel-react-native-skills` はモバイルアプリ用なので選択しない。

インストール時の対話プロンプトでは以下を選択する:

| 項目 | 選択 | 理由 |
|------|------|------|
| Installation scope | **Project** | Git管理されチームで共有できる |
| Installation method | **Symlink** | `npx skills update` で一括更新可能 |
| find-skills | **No** | 使うスキルは自分で決める運用で十分 |

**shadcn/uiスキル**

> **注意**: shadcn/ui の init（`06_shadcn.md`）を完了して `components.json` が生成された後に実行すること。

```bash
pnpm dlx skills add shadcn/ui
```

`components.json` を読んでプロジェクト構成を把握し，shadcn/ui コンポーネントの正しいコードを生成できるようになる。

**動作確認**

```bash
ls .claude/skills/
```

各スキルのディレクトリ（`SKILL.md` を含む）が表示されれば完了。

**アップデート**

ホストで実行する。インストール済みの全スキルを一括で更新する。

```bash
npx skills update
```

個別に更新したい場合は `npx skills add <コレクション>` を再実行する。

### 3. MCPサーバー

Claude Codeにブラウザ操作・UIデザインツールとの連携機能を追加する。

**Playwright（E2Eテスト・ブラウザ自動操作）**

ホストへのNode.jsインストールを不要にするため，`docker run` 経由で起動する。

```bash
claude mcp add playwright -s project -- docker run --rm -i mcr.microsoft.com/playwright:v1.52.0-noble npx @playwright/mcp@latest
```

> `-s project` でプロジェクトスコープに登録される。`.claude/settings.json` に記録されGit管理される。

**Pencil.dev（UIデザインツール連携）**

VSCode/Cursor拡張機能（`highagency.pencildev`）をインストールすると，内蔵MCPサーバーが自動起動する。  
追加のコマンドは不要。`.pen` ファイルの編集・読み取りが Claude Code から可能になる。  

> リポジトリの `.vscode/extensions.json` に推奨拡張として登録済みのため，VSCodeが自動で提案する。
