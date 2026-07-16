# AI旅行プラン生成機能 — 要件定義・設計

作成日: 2026-07-07（v2: プロバイダ比較・認証・マネタイズ追加，v3: 即登録フローへ全面変更）/ ステータス: Phase 1 実装中（モデルは Gemini 3.1 Flash Lite 無料枠・疎通確認済み）

## 1. 概要

「2026年8月10日から京都に2泊3日，大人2人で旅行します。プランを考えて」のような自然文の入力から，AIが旅のしおり（タイトル・旅の情報・日毎の行程）を一括生成し，**そのまま登録して完成した“しおり”（`/i/{id}`）を見せる**機能。

- 条件入力 → 数秒 → **完成したしおりが目の前に現れる**のが体験の核（フォームを見せない）
- 手直しは既存の編集ページ（`/i/{id}/edit`）で自由に行える
- 「同じ条件でもう一回」の再生成に対応（未編集なら上書き，編集済みなら確認してから）
- しおりUIが最終着地点。AIは「下書きを一瞬で作る係」に徹する

> v3 での変更: 当初は「作成フォームへのプレフィル（登録一歩手前）」だったが，(1) 生成の感動が編集フォームで削がれる，(2) 即登録の方が既存の閲覧・編集ページを再利用でき実装が軽い，(3) Tabiji は認証なし・URL共有型で登録のハードルが元々低く，不要しおりは既存の3ヶ月自動削除で消える，の3点から即登録フローに変更した。

### 基本方針（v2で追加）

1. **特定のAIベンダーにロックインしない**。プロバイダ切替可能な抽象化層（Vercel AI SDK）を挟む
2. **個人情報は極力持たない**。認証を入れる場合もメール・氏名を保存しない最小構成
3. **赤字を構造的に不可能にする**。固定費ゼロ + 無料枠/スペンド上限で天井を切る。マネタイズは需要実証後

## 2. 実現可能性の結論

**実現可能。** 技術的なブロッカーはない。

1. AIの出力先となるデータ構造（`title` / `overviews[]` / `days[].schedules[]`）が既に `createShioriSchema`（`web/src/app/create/schema.ts`）として定義済み
2. 主要プロバイダ（Anthropic / OpenAI / Google）はいずれもスキーマ準拠のJSON出力（structured outputs）に対応。Vercel AI SDK の `generateText` + `Output.object`（Zod）で**どのプロバイダでも同一コード**で書ける
3. 閲覧ページ（`/i/{id}`）と編集ページ（`/i/{id}/edit`）が実装済みのため，**生成後の表示・手直しに新規UIがほぼ不要**
4. 登録は既存 `createShiori` の INSERT ロジックを共通化して使う（AI用のDB書き込みを新設しない）

### できること / できないこと

| | 内容 |
|---|---|
| ◎ できる | 自然文入力からしおり形式のJSONを確実に生成（structured outputs） |
| ◎ できる | 生成 → 即登録 → 完成しおり表示 → 既存編集ページで手直し |
| ◎ できる | プロバイダの後から切替（env 1行。Claude ⇔ GPT ⇔ Gemini） |
| ◎ できる | Googleログインを「メール・氏名を保存しない」構成で導入（§6） |
| ○ できる（手間あり） | ¥500チャージ制のクレジット販売（§7。技術より法対応がコスト） |
| △ 条件付き | 営業時間・料金など最新の事実情報。素のLLMでは保証されない |
| ✗ できない（採らない） | ローカルLLMでの本番運用（§5.1。Vercel構成と両立しない） |
| ✗ できない | 実在性・正確性の保証 → 注意書き + ユーザー編集前提で吸収 |

## 3. 要件定義

### 機能要件

| ID | 要件 |
|---|---|
| F-1 | `/create` ページに「AIでつくる」導線を置き，ダイアログで条件を入力できる |
| F-2 | 入力は最小構成: **出発日（DatePicker・必須）+ 自由記述（必須・500字以内）**。例文チップ（「京都に2泊3日，大人2人，寺と美味しいもの」等）をワンタップで入力できる |
| F-3 | 生成中は「行程を組み立てています…」等の表示（実測4〜10秒）。キャンセル可能 |
| F-4 | 生成成功時は**そのままDBに登録**し，`/i/{id}` へ遷移して完成したしおりを見せる |
| F-5 | 手直しは既存の編集ページ（`/i/{id}/edit`）。AI側に専用編集UIは作らない |
| F-6 | 失敗時（503等）は自動で1回リトライ → それでも失敗ならトースト表示 + 再試行ボタン。手動作成へのフォールバック導線も出す |
| F-7 | **再生成**: AI生成しおりの閲覧ページに「同じ条件でもう一回」ボタン。生成後に未編集なら黙って上書き，編集済みなら「編集内容が消えます」と確認してから上書き |
| F-8 | 登録直後の閲覧ページで**共有導線（URLコピー）を目立たせる**（作る→配るの完結） |
| F-9 | AI生成しおりの冒頭に注意書きを1回だけ表示（「AIの提案です。営業時間・実在は確認してください」） |
| F-10 | （Phase 2）AI機能はGoogleログインユーザーのみ利用可。しおり閲覧・手動作成は従来通りログイン不要 |

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
 └─ [AIでつくる] ボタン → AiPlanDialog（新規）
          │ 出発日 + 自由記述（+ 例文チップ）を入力
          │ POST /api/ai/generate-plan  ← Route Handler（新規）
          │    ├─ 入力検証（Zod）
          │    ├─ (Phase 2) セッション確認・クレジット残高チェック
          │    ├─ レート制限チェック（DB）
          │    ├─ generateText + Output.object → Gemini（env で切替可）
          │    ├─ 共通化した登録ロジックで INSERT（トランザクション）
          │    ├─ ai_generations に利用ログ + 入力条件を記録
          │    └─ { shioriId } を返却
          ▼ router.push(`/i/${shioriId}`)
/i/[id] 閲覧ページ（既存 + 少改修）
 ├─ AI注意書き（冒頭に1回）
 ├─ 共有ボタン（URLコピー）を強調
 ├─ [同じ条件でもう一回] → POST /api/ai/generate-plan { regenerate: shioriId }
 │      未編集なら上書き / 編集済みならクライアントで確認後に上書き
 └─ [編集] → /i/[id]/edit（既存・変更なし）
```

### 設計判断

- **Route Handler を採用**: プロジェクトルールは Server Actions 優先だが，(1) 生成に数秒〜数十秒かかり `maxDuration` の明示が必要，(2) 将来のストリーミング（SSE）は Server Action で対応不可，のため例外条件に該当。`web/src/app/api/ai/generate-plan/route.ts`
- **登録ロジックの共通化**: `createShiori`（`web/src/app/create/actions.ts`）内の INSERT 処理（shioris → overviews → schedules のトランザクション，日付計算含む）を `web/src/lib/shiori/insert.ts` に抽出し，手動作成とAI生成の両方から使う。二重実装を作らない
- **Vercel AI SDK（`ai` パッケージ）で抽象化**: `generateText` + `Output.object`（Zodスキーマ → 型付きオブジェクト）を使う（v7 で `generateObject` は非推奨）。モデルは env（`AI_MODEL`）で切替。料金改定・品質変化への追従が1行で済む
- **再生成の上書き判定**: `ai_generations` に `shiori_id` と入力条件を記録しておき，再生成時は同条件で生成し直して該当しおりの中身を差し替える。「編集済みか」は `shioris.updatedAt` が最終生成時刻より後かで判定し，編集済みならクライアントで確認ダイアログを挟む
- **CreateForm は無改修**: 手動作成フローはそのまま。プレフィル連携はしない（v3 で廃止）

### 新規ファイル一覧（Phase 1）

| ファイル | 役割 |
|---|---|
| `web/src/app/api/ai/generate-plan/route.ts` | Route Handler（検証 → 制限 → 生成 → 登録 → id返却，再生成対応） |
| `web/src/lib/shiori/insert.ts` | 登録トランザクションの共通化（`create/actions.ts` から抽出） |
| `web/src/lib/ai/provider.ts` | モデルの env 切替（デフォルト `gemini-3.1-flash-lite`） |
| `web/src/lib/ai/schema.ts` | AI出力・API入力の Zod スキーマ（+ 単体テスト） |
| `web/src/lib/ai/prompt.ts` | プロンプト組み立て |
| `web/src/components/features/create/AiPlanDialog.tsx` | 条件入力ダイアログ（shadcn/ui Dialog，例文チップ・生成中表示） |
| `web/src/components/features/view/AiActions.tsx` | 閲覧ページの再生成ボタン・注意書き（命名は実装時に調整） |
| `web/src/db/schema/aiGenerations.ts` | レート制限・利用ログ・再生成条件テーブル |

## 5. AI設計

### 5.1 プロバイダ・モデル比較（2026-07時点，各社公式料金ページ確認済み）

1回あたりコストの前提: 入力 約2,000トークン + 出力 約3,000トークン（3日分のプランJSON），為替 ¥150/$。

| プロバイダ / モデル | 入力$/1M | 出力$/1M | 1回コスト | 所感 |
|---|---|---|---|---|
| **Anthropic** Claude Opus 4.8 | $5.00 | $25.00 | ¥13 | 最高品質帯。本用途にはオーバースペック気味 |
| **Anthropic** Claude Sonnet 5 | $3.00（〜08/31は$2.00） | $15.00（同$10.00） | ¥8（導入価格¥5） | 品質・速度・コストのバランス良 |
| **Anthropic** Claude Haiku 4.5 | $1.00 | $5.00 | ¥3 | 最安帯。プランの気の利き方は一段落ちる |
| **OpenAI** gpt-5.5 | $5.00 | $30.00 | ¥15 | 最高品質帯。同上 |
| **OpenAI** gpt-5.4 | $2.50 | $15.00 | ¥8 | Sonnet 5 と同格の中位 |
| **OpenAI** gpt-5.4-mini | $0.75 | $4.50 | ¥2.3 | 小型。定型的なプランなら十分 |
| **OpenAI** gpt-5.4-nano | $0.20 | $1.25 | ¥0.6 | 最安。品質は要検証 |
| **Google** Gemini 3.1 Pro | $2.00 | $12.00 | ¥6 | 中位フラッグシップ。日本の地理情報に強い傾向 |
| **Google** Gemini 3.5 Flash | $1.50 | $9.00 | ¥4.5 | **無料枠あり**。速い |
| **Google** Gemini 3.1 Flash-Lite | $0.25 | $1.50 | ¥0.8 | **無料枠あり**。最安帯 |
| **Google** Gemini 2.5 Flash | $0.30 | $2.50 | ¥1.2 | **無料枠あり**。旧世代だが実績十分 |

#### Gemini の無料枠という選択肢

Flash / Flash-Lite 系は API 無料枠がある。本アプリの想定規模（数十〜数百回/月）なら**API料金ゼロで運用できる**。

実測値（2026-07-14，AI Studio 表示 + 疎通確認）:

| モデル | RPM | RPD | 疎通確認の結果 |
|---|---|---|---|
| gemini-3.5-flash | 5 | **20** | 503（高負荷）が頻発。無料枠では不安定 |
| gemini-3.1-flash-lite | 15 | **500** | **4.1秒で高品質なプランを生成**（in 143 / out 1,098 tokens） |

→ **デフォルトは `gemini-3.1-flash-lite`**。品質は疎通確認で十分と判断（季節考慮・現実的な動線・スキーマ完全準拠）。3.5 Flash は品質比較用の上位候補として env 切替で残す。

- 注意1: 無料枠の入出力は Google のモデル改善（学習）に利用され得る。旅行条件程度で機微性は低いが，**利用規約・プライバシーポリシーに明記が必要**（`docs/03_legal/` 更新）
- 注意2: 無料枠はレート制限が厳しめ。同時アクセスが増えたら有料課金を有効化して切替（コード変更不要）

#### ローカルLLMの評価 → 不採用

| 観点 | 評価 |
|---|---|
| 本番構成との両立 | ✗ 本番は Vercel（サーバーレス）+ Neon。GPUを持てないためローカルモデルを動かす場所がない |
| 別途GPUサーバーを借りる場合 | ✗ クラウドGPUは常時稼働で月数万円〜。従量のAPI（1回数円）と比べ本末転倒 |
| 自宅マシンで動かす場合 | ✗ 公開Webアプリのバックエンドに自宅PCを常時公開することになり，運用・セキュリティ負担が大きい |
| 品質 | △ Qwen・Llama等のオープンモデルは日本の旅行知識・日本語の自然さで商用APIに劣る |

結論: **公開Webアプリの構成ではローカルLLMは不採用**。開発中のプロンプト実験に手元の Ollama を使うのは自由。

#### 推奨

- **決定: Gemini 3.1 Flash Lite（無料枠）をデフォルトにする**。疎通確認で品質・速度とも十分と判断（上表）。コストゼロで「赤字は嫌」への最も直接的な回答
- 品質を上げたくなったら env 切替で Gemini 3.5 Flash（無料枠だが不安定）/ Claude Sonnet 5 / gpt-5.4 / Gemini 3.1 Pro（有料，1回¥5〜8）と並べて試す
- 抽象化層があるので**この選定は後からいつでも覆せる**

### 5.2 実装: Vercel AI SDK + Zod

```typescript
// web/src/lib/ai/schema.ts — 既存 createShioriSchema と互換の形
import { z } from "zod";

export const aiPlanSchema = z.object({
  title: z.string(),                       // しおりタイトル（例: 京都2泊3日の旅）
  overviews: z.array(
    z.object({ title: z.string(), content: z.string() }),
  ),                                       // 旅の情報（持ち物・予算目安など）
  days: z.array(
    z.object({
      schedules: z.array(
        z.object({
          time: z.string(),                // "HH:mm"
          title: z.string(),
          memo: z.string(),
        }),
      ),
    }),
  ),
});
export type AiPlan = z.infer<typeof aiPlanSchema>;
```

```typescript
// route.ts 内の呼び出しイメージ（プロバイダ非依存）
// AI SDK v7 では generateObject は非推奨。generateText + Output.object を使う
import { Output, generateText } from "ai";
import { getModel } from "@/lib/ai/provider"; // env の AI_PROVIDER / AI_MODEL で解決

const result = await generateText({
  model: getModel(),           // 例: google("gemini-3.1-flash-lite")
  output: Output.object({ schema: aiPlanSchema }),
  system: SYSTEM_PROMPT,
  prompt: buildUserPrompt(input),
  maxOutputTokens: 8192,
});
const plan = result.output;    // 型付き・スキーマ検証済み
// 使用量: result.usage.inputTokens / outputTokens / totalTokens
```

- 追加パッケージ: `ai` + `@ai-sdk/google`（採用プロバイダ分のみ。切替候補は後から追加）
- `startDate` / `dayNumber` はAIに出させない。日付計算は既存の登録処理（`addDays`）に任せる
- 文字数上限（title 255等）はスキーマ強制の対象外になり得るため，プロンプトで指示しつつ最終的には既存の登録時バリデーションで担保
- サーバー処理が長い（10〜60秒）ため Route Handler に `export const maxDuration = 120;`

### 5.3 プロンプト設計（方針）

- **システムプロンプト**: 日本語の旅行プランナー。実在する場所のみ。移動時間を現実的に。各日4〜7件。overviews に持ち物・注意事項・予算目安を1〜3件。titleは50文字以内
- **ユーザープロンプト**: ダイアログ入力をテンプレートに埋め込む。自由記述はそのまま渡す（インジェクションされても出力はスキーマ強制のため実害は内容の変質に留まる）
- 出発日から季節・曜日を考慮したプランにする

## 6. 利用制御 — 認証とレート制限

### 6.1 Phase 1: 認証なし（IPレート制限のみ）

```typescript
// web/src/db/schema/aiGenerations.ts
export const aiGenerations = pgTable("ai_generations", {
  id: serial("id").primaryKey(),
  ipHash: varchar("ip_hash", { length: 64 }).notNull(), // SHA-256(IP + salt)．生IPは保存しない
  userId: integer("user_id"),                            // Phase 2 から使用．NULL可
  shioriId: uuid("shiori_id"),                           // 生成したしおり．再生成の条件復元と編集済み判定に使う
  request: jsonb("request").notNull(),                   // 入力条件（出発日・自由記述）．再生成で再利用
  model: varchar("model", { length: 64 }).notNull(),
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

補足: `shioriId` は `onDelete: set null` の FK にする（しおりの3ヶ月自動削除でログまで消さない。利用量の記録が目的のため）。

- 同一 `ipHash` 当日5回 / 全体当日100回 を超えたら 429
- サーバーレスのためカウンタは既存Postgresで持つ（追加インフラ不要）

### 6.2 Phase 2: Googleログインでゲーティング（個人情報を持たない構成）

「AI機能はログインユーザーのみ」にすると，IPより確実な単位（Googleアカウント）で回数制御できる。**メール・氏名を一切保存しない**構成が可能:

- **Auth.js（NextAuth v5）+ Google プロバイダ**，要求スコープを **`openid` のみ**にする（`profile` / `email` を要求しない）→ Google から返るのは匿名の識別子 `sub` だけ
- DBに保存するのは `SHA-256(sub + salt)` とクレジット残高のみ:

```typescript
// web/src/db/schema/users.ts（Phase 2）
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  googleSubHash: varchar("google_sub_hash", { length: 64 }).notNull().unique(),
  credits: integer("credits").notNull().default(0), // 残クレジット（1クレジット=1生成）
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

- セッションは JWT 戦略（DBセッションテーブル不要）
- ログイン特典として月3回分の無料クレジット付与（値は要決定）
- ユーザーから見えるもの: 「Googleでログイン」ボタンのみ。アプリ側は誰なのか知らない（メールも名前も持たない）
- それでも `docs/03_legal/01_privacy.md` の更新は必要（識別子ハッシュ・利用ログを保持する旨）

代替案（参考）: パスキー認証（完全に個人情報ゼロだが実装が重い），購入コード方式（§7.3）。Googleログイン + openid のみが実装コストと匿名性のバランスで最良。

## 7. マネタイズ検討 — 「¥500チャージ制」の実現性

### 7.1 結論

- **技術的には可能**で，仕組みとしても筋は悪くない（誰も損しない，は概ね正しい）
- ただし**最初からやるべきではない**。理由は収益性ではなく，(1) 法対応の手間，(2) **運営者自身の氏名・住所の公開義務**が発生すること
- 推奨は段階導入: 無料枠運用（コストゼロ）→ ログイン + 無料クレジット → 需要が実証されたら課金

### 7.2 チャージ制を今やらない理由（=「面倒？」への回答）

| # | 論点 | 内容 |
|---|---|---|
| 1 | **特定商取引法** | 有償販売すると通信販売の表示義務が発生し，**事業者（=個人）の氏名・住所等の表記が原則必要**。「個人情報を扱いたくない」の最大の壁は，ユーザーの情報ではなく**自分の情報公開**になる（バーチャルオフィス等の実務対応はあるが月額費用がかかり，トントン目標と矛盾しがち） |
| 2 | **資金決済法（前払式支払手段）** | チャージ残高は「前払式支払手段」に該当し得る。**有効期限を発行から6ヶ月以内に設定すれば適用除外**（供託・届出義務なし）。6ヶ月超の残高を持たせるなら未使用残高が基準日で1,000万円超になると届出・供託義務。→ 設計は「クレジットは購入から6ヶ月で失効」を利用規約に明記し，厳密に運用する |
| 3 | 決済手数料 | Stripe 3.6%（国内カード，固定費ゼロ）。¥500決済で手数料¥18 → 手取り¥482。単価的には全く問題ない |
| 4 | 運用負荷 | 返金対応・問い合わせ・失効管理・確定申告（雑所得）。金額の割に人間のコストが出る |
| 5 | 需要の不確実性 | ChatGPT等で無料でプランを作れる時代に，¥500先払いのコンバージョンは低い見込み。**先に無料で需要を確かめる方が合理的** |

### 7.3 やるとしたらの設計（Phase 3）

- **Stripe Checkout**（カード情報・購入者情報はStripeが保持。アプリ側は customer id と決済イベントのみ）
- ¥500 → 10クレジット（1生成 = 1クレジット = 実質¥50）
- 原価: Gemini 3.5 Flash なら10回で約¥45，Sonnet 5でも約¥80 → **手取り¥482に対し粗利¥400前後**。単価レベルで赤字にならない
- 決済フロー: Checkout → webhook（`checkout.session.completed`）→ `users.credits` に加算 → `credit_transactions` テーブルに記録
- クレジットは購入から6ヶ月で失効（資金決済法の適用除外要件。自動延長などの脱法的運用はしない）
- 完全匿名の代替案: ログインなしで「購入コード」を販売し，アプリでコード入力 → ブラウザに紐付け。個人情報は最小だがコード紛失・機種変更の問い合わせ対応が重く，非推奨

### 7.4 損益シナリオ

| シナリオ | 構成 | 月間コスト | 月間収入 | 収支 |
|---|---|---|---|---|
| A: 無料枠運用 | Gemini Flash 無料枠 + IP制限 | **¥0** | ¥0 | **±0（赤字リスクなし）** |
| B: 有料モデル・無課金 | Sonnet 5，300回/月 | 約¥2,400 | ¥0 | ▲¥2,400（趣味の範囲。スペンド上限で天井固定） |
| C: チャージ制稼働 | 月30人が¥500購入，原価Flash | 約¥140 + 運用 | ¥14,460（手数料引後） | +¥14,000程度。ただし特商法対応・確定申告が発生 |

「少なくともトントン」は**シナリオAで即達成**できる。Cは需要があれば黒字化するが，先に人が来るかの検証が先。

## 8. ブロッカー・リスクと対策

| # | リスク | 深刻度 | 対策 |
|---|---|---|---|
| 1 | **API乱用によるコスト暴走** | 高 | IP/ユーザー単位レート制限 + プロバイダ側スペンド上限 + 入力文字数上限（自由記述500字）。無料枠運用なら被害上限は枠まで |
| 2 | **APIキー管理**（現状 `.env` 運用がない） | 高 | キーは compose.yaml に書かない。`web/.env`（`.env*` はgitignore済み）+ compose の `env_file`。本番は Vercel 環境変数 |
| 3 | **関数タイムアウト** | 中 | `maxDuration = 120` を明示（Vercel Fluid Compute） |
| 4 | **ハルシネーション**（閉業店舗等） | 中 | 生成結果に注意書き表示。編集前提のUXが本質的対策。Phase 4 でWeb検索ツール検討 |
| 5 | Gemini無料枠の仕様変更・学習利用 | 中 | 抽象化層により有料切替は env 1行。学習利用は規約に明記 |
| 6 | チャージ制の法対応（特商法・資金決済法） | 中（Phase 3のみ） | §7.2。6ヶ月失効設計 + 特商法表記の覚悟ができてから着手 |
| 7 | 生成品質のブレ | 低 | プロンプトで件数・粒度を明示。モデル比較。再生成ボタン |

**事前に必要な作業（コード外）**: 採用プロバイダのAPIキー発行 + スペンド上限設定のみ。

## 9. 実装フェーズ

### Phase 1 — MVP（無料・認証なし）

1. ~~`ai` + `@ai-sdk/google` 追加~~ ✅ 済（ai@7.0.26，@ai-sdk/google@4.0.14）
2. ~~環境変数整備~~ ✅ 済（`web/.env.local` + `.env.example`。Next.js が自動読み込みするため compose 変更は不要だった）
3. ~~疎通確認~~ ✅ 済（`web/scripts/ai-smoke.mts`。Flash Lite で4.1秒・スキーマ準拠を確認）
4. `aiPlanSchema` + API入力スキーマ + 単体テスト（Red-Green）
5. `aiGenerations` テーブル・マイグレーション
6. 登録ロジックの共通化（`create/actions.ts` → `lib/shiori/insert.ts` 抽出。既存テストが通ることを確認）
7. `prompt.ts` / `provider.ts`（疎通スクリプトの内容を本実装へ）
8. Route Handler（入力検証 → レート制限 → 生成（自動1リトライ） → 登録 → ログ → id返却）
9. `AiPlanDialog`（出発日 DatePicker + 自由記述 + 例文チップ + 生成中表示）
10. 閲覧ページ改修（AI注意書き・共有ボタン強調・再生成ボタン + 上書き確認）
11. 利用規約とプライバシーポリシー更新（無料枠の学習利用・IPハッシュ保存）

### Phase 2 — Googleログインでゲーティング

- Auth.js（`openid` スコープのみ）+ `users` テーブル（subハッシュ + クレジットのみ）
- AI機能をログイン必須化，月次無料クレジット付与
- IP制限はスパム対策として併存

### Phase 3 — チャージ制（需要が実証されたら）

- Stripe Checkout + webhook + `credit_transactions`
- クレジット6ヶ月失効（資金決済法適用除外）・特商法表記・利用規約改定

### Phase 4 — 品質向上（任意）

- **部分再生成**（優先度高: 「2日目だけ作り直す」「もっとグルメ寄りに」等の追加指示）
- Web検索ツール併用で実在情報の精度向上
- SSEストリーミングで生成進捗表示（実測4〜10秒のため優先度低）

## 10. コスト・料金の出典

- Anthropic: https://docs.claude.com/en/docs/about-claude/pricing
- OpenAI: https://developers.openai.com/api/docs/pricing
- Google Gemini: https://ai.google.dev/gemini-api/docs/pricing （無料枠の現行値は AI Studio で要確認）
- Stripe 日本: https://stripe.com/pricing （国内カード3.6%）
- 資金決済法の6ヶ月適用除外: https://topcourt-law.com/finance/six-months-prepaid-payment 等（実装時に最新の法令・ガイドラインを確認）

## 11. 要決定事項

| # | 論点 | 選択肢 | 推奨 |
|---|---|---|---|
| 1 | 初期プロバイダ・モデル | **決定: Gemini 3.5 Flash（無料枠）** | env切替なので後から変更可。ADK / LangChain / FastMCP 等のフレームワークは Phase 1 では不採用（1回呼び出しに対して過剰。AI SDK で足りる） |
| 2 | 無料枠の学習利用を許容するか | 許容（規約明記）/ 有料課金で回避（1回¥4.5） | 旅行条件程度なら許容でよいが要判断 |
| 3 | Phase 2（ログイン）に進む基準 | 最初から入れる / IP制限で困ってから | MVPはIP制限のみで出し，乱用や需要が見えたら入れる |
| 4 | Phase 3（課金）に進む基準 | §7.2 の表参照 | 特商法表記（氏名・住所公開）を許容できるかが実質の判断点 |
| 5 | レート制限値・無料クレジット数 | 5回/日/IP・全体100回/日・月3回/人 は仮置き | Flash Lite の無料枠は500回/日のため全体100回/日で問題なし。運用しながら調整 |
