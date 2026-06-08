import type { Entry } from "./types";
import axios from "axios";

const DEEPSEEK_API_KEY = () => process.env.DEEPSEEK_API_KEY || "";
const AI_API_URL = () => process.env.AI_API_URL || "https://api.deepseek.com/chat/completions";
const AI_MODEL = () => process.env.AI_MODEL || "deepseek-chat";

const AI_SUMMARY_PROMPT = `你是一个信息解码大师。你的任务是把一条信息拆解为三段式输出，并把英文标题翻译成中文。

请返回以下格式的 JSON（只返回纯 JSON，不要 markdown 代码块）：
{
  "titleCn": "中文标题（如果原文是英文标题则翻译成中文，如果原文已是中文则保持不变）",
  "summary": "这段话包含两部分：\n1. 用 1-2 句中文总结信息核心内容（如果原文是英文则翻译成中文）\n2. 空一行后输出「解码分析：」开头的内容\n\n完整格式示例：\n比特币跌至 6 万美元后反弹，ETF 流出降速至 $48.8M。\n\n解码分析：\n🔍 事实：ETF 净流出收窄至过去 13 天最低水平，IBIT 流出 $131M 但被其他 ETF 对冲。\n💡 判断：流出降速是边际改善信号，但还没转正。关键看下周初能否持续收窄。如果是币圈相关则用 RSI、ETF、非农等术语（保持原文术语不做替换）。\n🧭 行动：关注即可，不需立即操作。跟踪指标：下周一 ETF 数据、美国 CPI。",
  "tags": ["标签1", "标签2", "标签3"],
  "category": "ai | tech | funding | crypto | other",
  "readingTime": "X 分钟"
}

规则：
- titleCn 必须返回中文标题
- summary 必须包含「解码分析：」部分，三段式标记用 🔍 💡 🧭
- 如果是币圈/加密内容，分类设为 crypto
- 判断要区分"事实"和"观点"，不说废话`;

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

async function processEntry(entry: Entry): Promise<{
  aiSummary: string;
  tags: string[];
  category: string;
  readingTime: string;
  titleCn: string;
}> {
  if (!DEEPSEEK_API_KEY()) {
    return {
      aiSummary: entry.summary || entry.title,
      tags: [entry.category === "ai" ? "AI" : entry.category === "tech" ? "科技" : "商业"],
      category: entry.category,
      readingTime: entry.readingTime || "3 分钟",
      titleCn: entry.title,
    };
  }

  const contentText = (entry.contentText || entry.summary || entry.title).slice(0, 2000);
  const textForAI = `标题: ${entry.title}\n\n正文:\n${contentText}`;

  try {
    const result = await callDeepSeek(AI_SUMMARY_PROMPT, textForAI, 500);
    if (!result) throw new Error("No response");

    const parsed = parseJSON(result);
    return {
      aiSummary: parsed.summary || entry.summary || entry.title,
      tags: parsed.tags || [],
      category: parsed.category || entry.category,
      readingTime: parsed.readingTime || entry.readingTime || "3 分钟",
      titleCn: parsed.titleCn || entry.title,
    };
  } catch (err: any) {
    console.error(`[AI] Error processing "${entry.title.slice(0, 40)}": ${err.message}`);
    return {
      aiSummary: entry.summary || entry.title,
      tags: [],
      category: entry.category,
      readingTime: entry.readingTime || "3 分钟",
      titleCn: entry.title,
    };
  }
}

export async function processEntries(entries: Entry[]): Promise<Entry[]> {
  if (!entries.length) return [];

  const batch = entries.slice(0, 10);
  console.log(`[AI] Processing ${batch.length}/${entries.length} entries with DeepSeek...`);

  const concurrency = 3;
  const results: Entry[] = [];

  for (let i = 0; i < batch.length; i += concurrency) {
    const chunk = batch.slice(i, i + concurrency);
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
