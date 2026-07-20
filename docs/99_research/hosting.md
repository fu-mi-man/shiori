# ホスティング調査メモ — Vercel Hobby の商用制限と移行先

作成日: 2026-07-11 / 関連: `monetization.md` Stage 1

## 結論

- **Vercel Hobby はアフィリエイトを含む広告掲載が規約違反**（Fair Use Guidelines が広告・アフィリエイトリンクを商用利用として明示的に禁止）
- アフィリエイトを導入する時点で **Cloudflare Workers 無料プランへ移行する**。それまでは Vercel Hobby のままで問題ない（AI機能の無償提供は非商用の範囲）

## 選択肢の比較

| 案 | 費用 | 評価 |
|---|---|---|
| Vercel Hobby のまま | ¥0 | アフィリエイト不可。Phase 1（AI生成の無償提供）までは適法 |
| Vercel Pro | $20/月（約¥3,000） | Stage 1 の想定収益（月¥2,500前後）を食い潰す。収益が育つまで選ぶ理由なし |
| **Cloudflare Workers 無料プラン** | **¥0** | **商用利用が明示的にOK**。10万リクエスト/日・クレカ登録不要 |

## Cloudflare 移行の技術メモ

- Next.js 16 は **OpenNext アダプタ（`@opennextjs/cloudflare`，調査時点 v1.20 系）が対応済み**（Next.js 16 全マイナー・パッチをサポート。活発にメンテされている）
- Next.js 16.2 で Adapter API が stable になり，これを基盤にした次世代アダプタ（AWS / Cloudflare / Netlify）が開発中 → 移行の将来性は安定方向。導入時に最新バージョンと制約一覧（https://opennext.js.org/cloudflare）を確認すること
- **DB は Neon のままでよい**。HTTP 接続の `@neondatabase/serverless` が既に依存に入っており，接続まわりの移行負担が小さい
- 既知の相性問題: Next.js 16 の Proxy アーキテクチャと middleware まわりで報告あり。**Tabiji は middleware 不使用・認証なしのシンプル構成のため該当リスク低**
- 検証が必要な箇所: 画像最適化・ISR/キャッシュの細部
- 副次メリット: 将来の MCP サーバー公開は Cloudflare Workers が本場（Agents SDK に MCP サポート組み込み）。x402 の Monetization Gateway も Cloudflare 発で，足場が揃う

## 移行のタイミング

1. Phase 1（AI生成）は Vercel Hobby のまま実装・公開
2. アフィリエイト導入（monetization.md Stage 1）と**同時に** Cloudflare へ移行
3. 移行作業の規模感: アダプタ導入 + デプロイ設定の書き換えで週末1回分程度

## 出典

- Vercel Fair Use Guidelines: https://vercel.com/docs/limits/fair-use-guidelines
- Vercel Hobby Plan: https://vercel.com/docs/plans/hobby
- Cloudflare Workers 料金: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare 無料プランの商用利用（公式コミュニティ回答）: https://community.cloudflare.com/t/is-cloudflare-pages-workers-free-plan-free-for-commercial-use/291741
- OpenNext Cloudflare アダプタ: https://opennext.js.org/cloudflare
- Next.js Adapter API: https://nextjs.org/blog/nextjs-across-platforms
