// AI疎通確認用の使い捨てスクリプト（Phase 1 Step 4）
// 実行: docker compose exec web node scripts/ai-smoke.mts [モデルID...]
import { readFileSync } from "node:fs";
import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";

// Next.js 外の実行なので .env.local を手動で読み込む
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const match = line.match(/^([A-Z_]+)=(.+)$/);
  if (match?.[1] && match[2] && !process.env[match[1]]) {
    process.env[match[1]] = match[2];
  }
}

// 既存 createShioriSchema と互換の形（設計ドキュメント §5.2）
const aiPlanSchema = z.object({
  title: z.string(),
  overviews: z.array(z.object({ title: z.string(), content: z.string() })),
  days: z.array(
    z.object({
      schedules: z.array(z.object({ time: z.string(), title: z.string(), memo: z.string() })),
    }),
  ),
});

const SYSTEM_PROMPT = `あなたは日本語の旅行プランナーです。
- 実在する場所のみ提案する
- 移動時間を現実的に見積もる
- 各日は朝から夜まで4〜7件の行程にする
- time は "HH:mm" 形式（24時間表記）
- overviews には持ち物・注意事項・予算目安を1〜3件入れる
- title は50文字以内，行程の title は40文字以内，memo は100文字以内`;

const USER_PROMPT = `2026年8月10日から京都に2泊3日で旅行します。大人2人です。
寺社仏閣と美味しいものが好きです。プランを考えてください。`;

async function smoke(modelId: string) {
  console.log(`\n===== ${modelId} =====`);
  const start = Date.now();
  try {
    const result = await generateText({
      model: google(modelId),
      output: Output.object({ schema: aiPlanSchema }),
      system: SYSTEM_PROMPT,
      prompt: USER_PROMPT,
      maxOutputTokens: 8192,
    });
    const sec = ((Date.now() - start) / 1000).toFixed(1);
    const plan = result.output;
    const { inputTokens, outputTokens, totalTokens } = result.usage;
    console.log(
      `所要: ${sec}秒 / tokens: in=${inputTokens} out=${outputTokens} total=${totalTokens}`,
    );
    console.log(`タイトル: ${plan.title}`);
    console.log(`overviews: ${plan.overviews.length}件 / days: ${plan.days.length}日`);
    for (const [i, day] of plan.days.entries()) {
      console.log(`--- ${i + 1}日目（${day.schedules.length}件）---`);
      for (const s of day.schedules) {
        console.log(`  ${s.time} ${s.title}`);
        if (s.memo) console.log(`      memo: ${s.memo}`);
      }
    }
    console.log("--- overviews ---");
    for (const o of plan.overviews) {
      console.log(`  [${o.title}] ${o.content}`);
    }
  } catch (error) {
    console.error(`失敗（${((Date.now() - start) / 1000).toFixed(1)}秒）:`, error);
  }
}

// 無料枠 RPD: 3.5 Flash は20回/日と少ないため実行は最小限にする
// 例: docker compose exec web node scripts/ai-smoke.mts gemini-3.5-flash
const models = process.argv.slice(2);
for (const m of models.length > 0 ? models : ["gemini-3.5-flash", "gemini-3.1-flash-lite"]) {
  await smoke(m);
}
