# AI旅行プラン生成機能 — 要件定義・設計

ステータス: Phase 1 実装中（Gemini 3.5 Flash-Lite 無料枠）

## 1. 概要

「2026年8月10日から京都に2泊3日，大人2人で旅行します。プランを考えて」のような自然文から，AIが旅のしおり（タイトル・旅の情報・日毎の行程）を一括生成し，**そのまま登録して完成した“しおり”（`/i/{id}`）を見せる**機能。

- 条件入力 → 数秒 → **完成したしおりが現れる**のが体験の核（フォームを見せない）
- 手直しは既存の編集ページ（`/i/{id}/edit`）。「同じ条件でもう一回」の再生成に対応
- しおりUIが最終着地点。AIは「下書きを一瞬で作る係」に徹する

### 基本方針

1. **AIベンダーにロックインしない**。プロバイダ切替可能な抽象化層（Vercel AI SDK）を挟む — 各社公式SDK（OpenAI/Anthropic/Google）は単一プロバイダで乗換に書き直しが要り，ゲートウェイ（OpenRouter等）は外部プロキシ依存，LangChain/LlamaIndex等は1回生成に過剰。TS標準の軽量抽象として採用（ホスティングの Vercel とは別物のOSSで，Cloudflare 移行後もそのまま動く）
2. **個人情報は極力持たない**。認証を入れる場合もメール・氏名を保存しない最小構成
3. **赤字を構造的に不可能にする**。固定費ゼロ + 無料枠/スペンド上限で天井を切る。マネタイズは需要実証後（→ `../99_research/monetization.md`）

> 設計変遷: v3 で「作成フォームへのプレフィル」から「即登録フロー」へ変更（生成の感動を編集フォームで削がない／既存の閲覧・編集ページを再利用でき実装が軽い／認証なし・URL共有型で登録ハードルが低く，不要しおりは3ヶ月自動削除で消える）。

## 2. 実現可能性

**実現可能。技術的ブロッカーはない。** 出力先のデータ構造は既に `createShioriSchema`（`web/src/app/create/schema.ts`）として定義済みで，主要プロバイダ（Anthropic / OpenAI / Google）は全てスキーマ準拠のJSON出力に対応（Vercel AI SDK で同一コード）。閲覧・編集ページも実装済みで生成後の表示・手直しに新規UIがほぼ不要。登録は既存 `createShiori` の INSERT ロジックを共通化して使う。営業時間・実在性など最新の事実情報は素のLLMでは保証されないため，注意書き + ユーザー編集前提で吸収する。

## 3. 要件定義

### 機能要件

| ID | 要件 |
|---|---|
| F-1 | `/create` ページに「AIでつくる」導線を置き，ダイアログで条件を入力できる |
| F-2 | 入力は **自由記述（必須・非空〜500字）+ 出発日（任意・DatePicker）**。目的地専用フィールドは作らず自由記述に含める（多都市・移動の流れを自然文で書けるように）。入力補助は表の下に詳述 |
| F-3 | 生成中は「行程を組み立てています…」等の表示（実測4〜10秒）。キャンセル可能 |
| F-4 | 生成成功時は**そのままDBに登録**し，`/i/{id}` へ遷移して完成したしおりを見せる |
| F-5 | 手直しは既存の編集ページ（`/i/{id}/edit`）。AI側に専用編集UIは作らない |
| F-6 | 失敗時（503等）は自動で1回リトライ → それでも失敗ならトースト + 再試行ボタン。手動作成へのフォールバック導線も出す |
| F-7 | **再生成**: 閲覧ページに「同じ条件でもう一回」ボタン。未編集なら黙って上書き，編集済みなら「編集内容が消えます」と確認してから上書き |
| F-8 | 登録直後の閲覧ページで**共有導線（URLコピー）を目立たせる**（作る→配るの完結） |
| F-9 | AI生成しおりの冒頭に注意書きを1回だけ表示（「AIの提案です。営業時間・実在は確認してください」） |
| F-10 | （Phase 2）AI機能はGoogleログインユーザーのみ利用可。しおり閲覧・手動作成は従来通りログイン不要 |

**入力補助（F-2）**: ①「型を挿入」ボタン — `行き先：/人数：/日数：/決まっている予定・希望があれば：` の雛形を本文に差し込む（編集可・埋めなくてもよい）。②リッチな例文チップ（複数都市＋移動を含む完成例。例:「大阪2泊3日・梅田泊，初日は難波・道頓堀でグルメ，2日目は京都で寺社めぐり，最終日は神戸を観光して関空から飛行機」）。③常設ヘルパー文「詳しく書くほど良い行程が返ります」。目的地の欠落は Phase 1 では聞き返さず，この入力ガイド + 編集前提で吸収する（聞き返しは Phase 4）。出発日は任意で，あれば季節・曜日・実日付に使い，無ければ day_number のみのプランになる。

### 非機能要件

| ID | 要件 |
|---|---|
| N-1 | APIキーはサーバーサイドのみで保持 |
| N-2 | 利用上限: Phase 1 はIP単位 5回/日 + 全体 100回/日。Phase 2 以降はユーザー単位クレジット |
| N-3 | プロバイダ側コンソールでも月額スペンド上限を設定（二重の防波堤） |
| N-4 | ユーザーの個人情報（メール・氏名・住所）をDBに保存しない |
| N-5 | Vercel の関数タイムアウト内に収める（`maxDuration` 明示） |
| N-6 | 月間の変動費が固定の天井を超えない構造にする（赤字防止） |

## 4. アーキテクチャ設計

```
/create ページ
 └─ [AIでつくる] → AiPlanDialog（新規）で 自由記述〔型挿入・例文チップ〕+ 出発日〔任意〕を入力
          │ generateAiPlan() ← Server Action（新規）
          │    ├─ 入力検証（Zod）
          │    ├─ (Phase 2) セッション確認・クレジット残高チェック
          │    ├─ レート制限チェック（DB）
          │    ├─ generateText + Output.object → Gemini（env で切替可）
          │    ├─ 共通化した登録ロジックで INSERT（トランザクション）
          │    ├─ ai_generations に利用ログ + 入力条件を記録
          │    └─ { shioriId } を返却 → router.push(`/i/${shioriId}`)
/i/[id] 閲覧ページ（既存 + 少改修）
 ├─ AI注意書き（冒頭に1回）／共有ボタン（URLコピー）を強調
 ├─ [同じ条件でもう一回] → generateAiPlan({ regenerate: shioriId })（未編集は上書き / 編集済みは確認後）
 └─ [編集] → /i/[id]/edit（既存・変更なし）
```

### 設計判断

- **Server Action を採用**（プロジェクトルール通り）: フローは「入力 → 生成 → 登録 → id返却」の1往復でアプリ内に閉じるため，Route Handler の例外条件（外部公開・ストリーム応答）に該当しない。`maxDuration` は呼び出し元ページ側で export すれば効く。素の SSE が必要になったとき（Phase 4 の進捗表示）だけ Route Handler を追加する
- **登録ロジックの共通化**: `createShiori`（`create/actions.ts`）の INSERT 処理（shioris → overviews → schedules のトランザクション，日付計算含む）を `web/src/lib/shiori/insert.ts` に抽出し，手動作成とAI生成で共用。二重実装を作らない
- **再生成の上書き**: `ai_generations` に `shiori_id` と入力条件を記録し，同条件で生成し直して中身を差し替える。上書きは INSERT だけでは済まず**既存の overviews / schedules を全削除してから再INSERT**するため，`insert.ts` は新規作成と中身差し替えの両方をトランザクションで扱う（`shioriId` の有無で分岐）
- **編集済み判定**: `shioris.updatedAt` が**当該しおりの `ai_generations` 最新行 `createdAt`（最終生成時刻）より後か**で判定。初回生成直後は等値になり得るため厳密に `>` で比較し，等値は未編集扱い
- **CreateForm は無改修**（プレフィル連携はしない・v3 で廃止）

### 新規ファイル一覧（Phase 1）

| ファイル | 役割 |
|---|---|
| `web/src/lib/ai/actions.ts` | Server Action（検証 → 制限 → 生成 → 登録 → id返却，再生成対応）。`/create` と `/i/[id]` の両方から呼ぶため lib に置く |
| `web/src/lib/shiori/insert.ts` | 登録トランザクションの共通化（`create/actions.ts` から抽出）。新規作成と再生成の上書き（子行を全削除して再INSERT）の両方を扱う |
| `web/src/lib/ai/provider.ts` | モデルの env 切替（デフォルト `gemini-3.5-flash-lite`） |
| `web/src/lib/ai/schema.ts` | AI出力・API入力の Zod スキーマ（+ 単体テスト） |
| `web/src/lib/ai/prompt.ts` | プロンプト組み立て |
| `web/src/components/features/create/AiPlanDialog.tsx` | 条件入力ダイアログ（shadcn/ui Dialog，例文チップ・生成中表示） |
| `web/src/components/features/view/AiActions.tsx` | 閲覧ページの再生成ボタン・注意書き（命名は実装時に調整） |
| `web/src/db/schema/aiGenerations.ts` | レート制限・利用ログ・再生成条件テーブル |

## 5. AI設計

### 5.1 モデル選定

デフォルトは **Gemini 3.5 Flash-Lite（無料枠）**。2026-07-21 リリースで，疎通確認済みの 3.1 Flash-Lite の後継（低遅延・高スループット向けという位置づけも同じ）。切替は env 1行 + 再疎通のみ。抽象化層を挟むので後から覆せる（品質を上げたいときは Gemini 3.6 Flash / 3.1 Pro / Claude Sonnet 5 / gpt-5.4 を有料で試す。実測トークン量なら1回 ¥1〜3。料金一次ソースは §10）。ローカルLLMは Vercel + Neon 構成では動かす場所がなく，品質もオープンモデルは日本の旅行知識で劣るため不採用。

実測（2026-07-14，AI Studio + 疎通確認）:

| モデル | RPD（無料枠） | 疎通確認 |
|---|---|---|
| gemini-3.5-flash | 20 | 503（高負荷）頻発・不安定 |
| gemini-3.1-flash-lite | 500 | 4.1秒で高品質・スキーマ完全準拠（in 143 / out 1,098 tokens） |

- 3.5 Flash-Lite の無料枠 RPD は AI Studio で確認の上，再疎通してから既定に反映する
- 無料枠の入出力は Google の学習に利用され得る。旅行条件程度で機微性は低いが**利用規約・プライバシーポリシーに明記が必要**（`docs/03_legal/`）
- 同時アクセスが増えたら有料課金を有効化して切替（コード変更不要）

### 5.2 実装（Vercel AI SDK + Zod）

出力スキーマ `aiPlanSchema`（`web/src/lib/ai/schema.ts`）は `createShioriSchema` と互換の形 — `title` / `overviews[]{title, content}` / `days[].schedules[]{time, title, memo}`。`startDate`・`dayNumber` はAIに出させず，日付計算は既存の登録処理（`addDays`）に任せる。

```typescript
// actions.ts の呼び出し（プロバイダ非依存）
// v7 で generateObject は非推奨のため generateText + Output.object を使う
import { Output, generateText } from "ai";
import { getModel } from "@/lib/ai/provider"; // env の AI_PROVIDER / AI_MODEL で解決

const result = await generateText({
  model: getModel(),                              // 例: google("gemini-3.5-flash-lite")
  output: Output.object({ schema: aiPlanSchema }),
  system: SYSTEM_PROMPT,
  prompt: buildUserPrompt(input),
  maxOutputTokens: 8192,
});
const plan = result.output;                       // 型付き・スキーマ検証済み
```

- 文字数・日数の上限（title 255・memo 200・`days` / `overviews` は max 10 等）を超えると**登録がまるごと失敗する**（安全網ではなく失敗要因）。プロンプトで上限内に収めるのが本線で，登録時バリデーションは最終防御（具体値は §5.3）
- 実測4〜10秒だが，モデル切替・混雑時の余裕を見て呼び出し元ページ（`/create`・`/i/[id]`）に `export const maxDuration = 120;`

### 5.3 プロンプト設計（方針）

- **システムプロンプト**: 日本語の旅行プランナー。実在する場所のみ。移動時間を現実的に。各日4〜7件。overviews に持ち物・注意事項・予算目安を1〜3件。出発日があれば季節・曜日を考慮
- **上限（登録スキーマに合わせる）**: 日程 ≤10日・overviews ≤10件，title ≤50字・overview title ≤255字・overview content ≤500字・行程 title ≤40字・memo ≤100字。超過は登録で弾かれるため，疎通スクリプト `ai-smoke.mts` と同じ制約に揃える
- **ユーザープロンプト**: ダイアログ入力を埋め込む。自由記述はそのまま渡す（インジェクションされても出力はスキーマ強制で実害は内容の変質に留まる）。入力は `ラベル：値` の半構造でも自然文でも来るため両方を解釈する
- **肉付けルール**: ユーザーがざっくりした行程（「初日は名古屋，2日目は常滑」等）を書いていたら，それを土台に肉付けする（勝手に別プランへ差し替えない）。書いていなければAIが組む

## 6. 利用制御（認証・レート制限）

### 6.1 Phase 1: 認証なし（IPレート制限）

`ai_generations` テーブルでカウント（サーバーレスのためカウンタは既存Postgresで持つ・追加インフラ不要）。同一 `ipHash` 当日5回 / 全体当日100回 超で 429。

```typescript
// web/src/db/schema/aiGenerations.ts（主要カラム）
ipHash: varchar("ip_hash", { length: 64 }).notNull(),  // SHA-256(IP + salt)，生IPは保存しない
userId: integer("user_id"),                            // Phase 2 から使用，NULL可
shioriId: uuid("shiori_id"),                           // 生成しおり，再生成の条件復元・編集済み判定に使う（onDelete: set null）
request: jsonb("request").notNull(),                   // 入力条件（出発日・自由記述），再生成で再利用
model: varchar("model", { length: 64 }).notNull(),
inputTokens: integer("input_tokens").notNull(),
outputTokens: integer("output_tokens").notNull(),
```

### 6.2 Phase 2: Googleログインでゲーティング（将来）

AI機能をログインユーザー限定にすると，IPより確実な単位で回数制御できる。**メール・氏名を保存しない**構成が可能: Auth.js（NextAuth v5）+ Google で要求スコープを `openid` のみにし，匿名識別子 `sub` だけ受け取る。DBに保存するのは `SHA-256(sub + salt)` とクレジット残高のみ（セッションは JWT・DBセッションテーブル不要）。ユーザーに見えるのは「Googleでログイン」ボタンだけ。テーブル定義は Phase 2 着手時に確定。識別子ハッシュ・利用ログを持つためプライバシーポリシー更新は必要。

## 7. マネタイズ

詳細（旅行アフィリエイト・MCP・チャージ制・損益シナリオ）は**本節の発展版として `../99_research/monetization.md` に集約**。要点:

- **Phase 1 は無料**（Gemini 無料枠 + IP 制限）でコストゼロ運用。マネタイズは需要実証後
- 直販（AIクレジット・チャージ制）は特商法表記（運営者の氏名・住所公開）と資金決済法対応が壁のため**最初はやらない**。法的負担がほぼゼロの旅行アフィリエイトを先に検討する

## 8. リスクと対策

| # | リスク | 対策 |
|---|---|---|
| 1 | API乱用によるコスト暴走 | IP/ユーザー単位レート制限 + プロバイダ側スペンド上限 + 入力500字上限。無料枠運用なら被害上限は枠まで |
| 2 | APIキー管理 | compose.yaml に書かず `web/.env.local`（gitignore済・Next.js が自動読み込み）。本番は Vercel 環境変数。→ Phase 1 整備済み |
| 3 | 関数タイムアウト | `maxDuration = 120` を明示（Vercel Fluid Compute） |
| 4 | ハルシネーション（閉業店舗等） | 注意書き表示 + 編集前提のUX。Phase 4 でWeb検索ツール検討 |
| 5 | Gemini無料枠の仕様変更・学習利用 | 抽象化層で有料切替は env 1行。学習利用は規約明記 |
| 6 | 生成品質のブレ | プロンプトで件数・粒度を明示・再生成ボタン |

**事前に必要な作業（コード外）**: 採用プロバイダのAPIキー発行 + スペンド上限設定のみ。

## 9. 実装フェーズ

### Phase 1 — MVP（無料・認証なし）

1. ~~`ai` + `@ai-sdk/google` 追加~~ ✅（ai@7.0.26，@ai-sdk/google@4.0.14）
2. ~~環境変数整備~~ ✅（`web/.env.local` + `.env.example`）
3. ~~疎通確認~~ ✅（`ai-smoke.mts`。3.1 Flash-Lite で4.1秒・スキーマ準拠。3.5 Flash-Lite への切替時に再実行）
4. `aiPlanSchema` + API入力スキーマ + 単体テスト（Red-Green）
5. `aiGenerations` テーブル・マイグレーション
6. 登録ロジック共通化（`create/actions.ts` → `lib/shiori/insert.ts`。新規作成と再生成の上書きを扱う。既存テストが通ること）
7. `prompt.ts` / `provider.ts`（疎通スクリプトの内容を本実装へ）
8. Server Action（検証 → レート制限 → 生成〔自動1リトライ〕 → 登録 → ログ → id返却）
9. `AiPlanDialog`（自由記述〔型挿入・例文チップ〕+ 出発日〔任意〕+ 生成中表示）
10. 閲覧ページ改修（注意書き・共有強調・再生成 + 上書き確認）
11. 利用規約・プライバシーポリシー更新（無料枠の学習利用・IPハッシュ保存）

### Phase 2 以降

- **Phase 2**: Auth.js（`openid` のみ）でログインゲーティング + 月次無料クレジット（IP制限は併存）
- **Phase 3**: チャージ制（Stripe Checkout + 6ヶ月失効）。需要実証後。詳細は `../99_research/monetization.md`
- **Phase 4**: 部分再生成（「2日目だけ作り直す」等・優先度高）／行き先が欠落・曖昧なときの聞き返し（needInfo 二択スキーマ。Phase 1 は非対応）／Web検索で実在情報の精度向上／SSE進捗表示（優先度低・このときだけ Route Handler を追加）

## 10. 料金の出典

- Anthropic: https://docs.claude.com/en/docs/about-claude/pricing
- OpenAI: https://developers.openai.com/api/docs/pricing
- Google Gemini: https://ai.google.dev/gemini-api/docs/pricing （無料枠の現行値は AI Studio で要確認）
- マネタイズ関連（Stripe・資金決済法等）は `../99_research/monetization.md` §7

## 11. 要決定事項

| # | 論点 | 現状・推奨 |
|---|---|---|
| 1 | 無料枠の学習利用を許容するか | 旅行条件程度なら許容でよいが要判断（回避は有料課金でも1回¥0.5弱） |
| 2 | Phase 2（ログイン）に進む基準 | MVPはIP制限のみで出し，乱用や需要が見えたら入れる |
| 3 | Phase 3（課金）に進む基準 | 特商法表記（氏名・住所公開）を許容できるか（`../99_research/monetization.md` §4） |
| 4 | レート制限値 | 5回/日/IP・全体100回/日は仮置き（旧 3.1 Flash-Lite の無料枠500/日基準では余裕。3.5 Flash-Lite の RPD 確認後に見直し）。運用しながら調整 |
