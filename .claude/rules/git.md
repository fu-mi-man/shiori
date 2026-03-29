# Git

- コミット: Conventional Commits 形式（feat:, fix:, docs:, refactor:, chore: 等）
- ブランチ: feat/xxx, fix/xxx 形式
- PR 作成時は `.github/pull_request_template.md` のテンプレートを使用する

## ブランチ戦略

- 独立した作業（機能・ドキュメント・設定変更）は必ず main から切る
- 進行中のブランチに依存する作業のみ、そのブランチから切る

## Worktree

- worktree を作るときは必ず `-b` でブランチ名を指定する（detached HEAD 禁止）
- パス: メインリポジトリと同階層（シブリング）に `<repo>-<branch>` の形式で置く
  ```bash
  git worktree add -b <branch> ../<repo>-<branch-name> main
  # 例: git worktree add -b docs/setup ../shiori-docs-setup main
  ```
- 用途: 作業中のブランチを止めずに別ブランチを同時に扱いたいとき
  - ホットフィックス，PR レビュー，別ブランチへの独立したコミット など
- 作業完了・PR マージ後は必ず削除する
  ```bash
  git worktree remove ../<repo>-<branch-name>
  ```

## main の最新化（rebase）

- push する前に毎回 fetch して，main に更新があれば rebase する
  ```bash
  git fetch origin
  git rebase origin/main        # 更新がなければ自動でスキップされる
  git push                      # 既に push 済みなら --force-with-lease
  ```
- merge は使わない（履歴が汚くなるため）
