
## Figma MCPサーバー

Claude Code から Figma のデザインファイルを参照できるようにするリモートMCPサーバー。  
Figma のフレーム・コンポーネント・スタイルを読み取り，コード生成やデザイン実装の参照として活用できる。  

`claude plugin install figma@claude-plugins-official` を実行すると，MCPサーバー設定と Agent Skills が一括でインストールされる。

> **認証方式について**: Figmaの公式リモートMCPサーバーはOAuth認証のみ対応。Personal Access Token（PAT）による認証は現在サポートされていない。

### 1. プラグインのインストール

ホストで実行する（claude CLIはホスト側にのみ存在するため）。

```bash
claude plugin install figma@claude-plugins-official --scope project
```

`--scope project` でプロジェクトスコープに登録される。  
`.claude/settings.json` に記録されGit管理される。  

全プロジェクトで共通利用する場合は `--scope user` を指定する（プロジェクトごとに再インストール不要になる）。

> 既にGit管理されている設定が存在する場合は実行不要（clone 時に設定が共有される）。ただし，OAuth認証は各開発者が個別に行う必要がある（下記参照）。

### 2. OAuth認証

プラグインのインストール後，Claude Code 内でOAuth認証を行う。

```text
/mcp
```

1. `plugin:figma:figma` を選択（**Built-in MCPs** セクションに表示される）
2. **Authenticate** を選択
3. ブラウザが開くので **Allow Access** をクリック
4. Figmaアカウントでログインして認可する

認証情報はローカルに保存される。  
チームメンバーはそれぞれ自分のFigmaアカウントで認証する。  

> プラグイン経由のMCPは `/mcp` の **Built-in MCPs (always available)** セクションに表示される（Project MCPs ではない）。これはプラグインがMCPを動的に注入する仕様のためで，正常な挙動。

### 3. 動作確認

```text
/mcp
```

`plugin:figma:figma · ✔ connected` になっていれば完了。

Figma ファイルのURLを貼り付けてデザインを参照できるか確認する。

```text
このFigmaフレームのレイアウトを参考にReactコンポーネントを実装してください
https://www.figma.com/design/xxxxxx/...?node-id=xxx
```

### 手動インストール（参考）

プラグインを使わずMCPサーバーのみを追加する場合。

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp --scope project
```
