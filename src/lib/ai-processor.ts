import type { Entry } from "./types";
import axios from "axios";

const DEEPSEEK_API_KEY = () => process.env.DEEPSEEK_API_KEY || "";
const AI_API_URL = () => process.env.AI_API_URL || "https://api.deepseek.com/chat/completions";
const AI_MODEL = () => process.env.AI_MODEL || "deepseek-chat";

/**
 * 信息解码大师 Prompt
 *
 * 来源: 信息解码大师.md — 三段式：事实还原 → 意义判断 → 行动指引
 * 输出为结构化 JSON，不再混在 summary 字符串里用 emoji 切分
 */
const AI_DECODE_PROMPT = `你是一个信息解码大师。你的任务是把一条信息拆解为三段式输出，把英文标题翻译成中文，并生成一句话总结。

请返回以下格式的 JSON（只返回纯 JSON，不要 markdown 代码块）：
{
  "titleCn": "中文标题（如果原文是英文标题则翻译成中文，如果原文已是中文则保持不变）",
  "oneLiner": "一句话中文总结（≤30字，说清楚这条信息最核心的内容）",
  "fact": "🔍 事实还原：发生了什么？谁说的？什么时候？只用名词+动词，不评价",
  "judgment": "💡 意义判断：为什么重要？影响谁？市场会怎么解读？区分事实/预期/观点",
  "action": "🧭 行动指引：要不要行动？不动的话盯什么？信息不够就说「不构成行动依据」",
  "tags": ["标签1", "标签2", "标签3"],
  "category": "ai | tech | funding | crypto | other"
}

输出规则：
- titleCn 必须返回中文标题
- oneLiner 是用中文一句话概括核心信息，不超过30字
- fact / judgment / action 都用中文输出
- 如果是币圈/加密内容，分类设为 crypto
- 不够就说不够，不要硬给建议
- 不废话，每条控制在 2-4 句`;

const DAILY_DIGEST_PROMPT = `你是一个 AI 编辑。请根据以下今日精选文章，生成一段 100-150 字的「今日要闻」导读，中文，语气亲切，突出最重要的 1-2 条新闻。`;

async function callDeepSeek(system: string, userContent: string, maxTokens = 500) {
  const key = DEEPSEEK_API_KEY();
  if (!key) return null;

  try {
    const res = await axios.post(
      AI_API_URL(),
      {
        model: AI_MODEL(),
        max_tokens: maxTokens,
        temperature: 0.3,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userContent },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        timeout: 30000,
      }
    );

    return res.data?.choices?.[0]?.message?.content || null;
  } catch (err: any) {
    const msg = err.response?.data
      ? JSON.stringify(err.response.data).slice(0, 200)
      : err.message;
    throw new Error(`DeepSeek API: ${msg}`);
  }
}

function parseJSON(text: string): Record<string, any> {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? JSON.parse(match[0]) : {};
}

/**
 * 兼容旧数据：如果 aiSummary 是用 emoji 拼接的老格式，
 * 尝试从中提取 fact/judgment/action
 */
function fallbackParseOldFormat(aiSummary: string): { fact?: string; judgment?: string; action?: string } {
  const factIdx = aiSummary.indexOf("🔍");
  const judgmentIdx = aiSummary.indexOf("💡");
  const actionIdx = aiSummary.indexOf("🧭");

  const result: { fact?: string; judgment?: string; action?: string } = {};

  if (factIdx > -1 && judgmentIdx > -1) {
    result.fact = aiSummary.slice(factIdx, judgmentIdx).replace(/^🔍\s*事实[：:]\s*/g, "").trim();
  }
  if (judgmentIdx > -1 && actionIdx > -1) {
    result.judgment = aiSummary.slice(judgmentIdx, actionIdx).replace(/^💡\s*(判断|意义)[：:]\s*/g, "").trim();
  }
  if (actionIdx > -1) {
    result.action = aiSummary.slice(actionIdx).replace(/^🧭\s*(行动|行动指引)[：:]\s*/g, "").trim();
  }

  return result;
}

async function processEntry(entry: Entry): Promise<{
  aiSummary: string;
  oneLiner?: string;
  fact?: string;
  judgment?: string;
  action?: string;
  tags: string[];
  category: string;
  titleCn: string;
}> {
  if (!DEEPSEEK_API_KEY()) {
    return {
      aiSummary: entry.summary || entry.title,
      tags: [entry.category === "ai" ? "AI" : entry.category === "tech" ? "科技" : "商业"],
      category: entry.category,
      titleCn: entry.title,
    };
  }

  const contentText = (entry.contentText || entry.summary || entry.title).slice(0, 2000);
  const textForAI = `标题: ${entry.title}\n\n正文:\n${contentText}`;

  try {
    const result = await callDeepSeek(AI_DECODE_PROMPT, textForAI, 600);
    if (!result) throw new Error("No response");

    const parsed = parseJSON(result);

    // 新格式：结构化字段
    if (parsed.fact || parsed.judgment || parsed.action) {
      return {
        aiSummary: [parsed.fact, parsed.judgment, parsed.action].filter(Boolean).join("\n\n") || entry.summary || entry.title,
        oneLiner: parsed.oneLiner || undefined,
        fact: parsed.fact || undefined,
        judgment: parsed.judgment || undefined,
        action: parsed.action || undefined,
        tags: parsed.tags || [],
        category: parsed.category || entry.category,
        titleCn: parsed.titleCn || entry.title,
      };
    }

    // 兼容旧格式：summary 里带 🔍💡🧭
    if (parsed.summary) {
      const fallback = fallbackParseOldFormat(parsed.summary);
      return {
        aiSummary: parsed.summary,
        fact: fallback.fact,
        judgment: fallback.judgment,
        action: fallback.action,
        tags: parsed.tags || [],
        category: parsed.category || entry.category,
        titleCn: parsed.titleCn || entry.title,
      };
    }

    return {
      aiSummary: parsed.summary || entry.summary || entry.title,
      tags: parsed.tags || [],
      category: parsed.category || entry.category,
      titleCn: parsed.titleCn || entry.title,
    };
  } catch (err: any) {
    console.error(`[AI] Error processing "${entry.title.slice(0, 40)}": ${err.message}`);
    return {
      aiSummary: entry.summary || entry.title,
      tags: [],
      category: entry.category,
      titleCn: entry.title,
    };
  }
}

export async function processEntries(entries: Entry[]): Promise<Entry[]> {
  if (!entries.length) return [];

  const batchSize = Math.min(entries.length, 20);
  console.log(`[AI] Processing ${batchSize}/${entries.length} entries with DeepSeek...`);

  const concurrency = 3;
  const results: Entry[] = [];

  for (let i = 0; i < batchSize; i += concurrency) {
    const chunk = entries.slice(i, i + concurrency);
    const processed = await Promise.all(
      chunk.map(async (entry) => {
        const result = await processEntry(entry);
        return { ...entry, ...result, aiProcessedAt: new Date().toISOString() };
      })
    );
    results.push(...processed);
  }

  console.log(`[AI] Done processing ${results.length} entries`);
  return results;
}

export async function generateDailyDigest(entries: Entry[]): Promise<string> {
  if (!entries.length) return "今日暂无精选内容。";
  if (!DEEPSEEK_API_KEY()) return "今日精选内容已就绪。";

  const textForAI = entries
    .slice(0, 10)
    .map((e, i) => `${i + 1}. ${e.title}\n   来源: ${e.source}\n   摘要: ${e.aiSummary || e.summary}`)
    .join("\n\n");

  try {
    const result = await callDeepSeek(DAILY_DIGEST_PROMPT, textForAI, 800);
    return result || `今日精选 ${entries.length} 篇文章。`;
  } catch {
    return `今日精选 ${entries.length} 篇文章。`;
  }
}
