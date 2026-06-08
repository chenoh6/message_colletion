/**
 * 信息价值评分引擎
 *
 * 改造自 TradingAgents TrendRadar 的权重公式:
 *   原文: total = R×0.6 + F×0.3 + H×0.1  (依赖热搜排名数据)
 *   改造: total = 源可信度×0.35 + 时效性×0.30 + 跨源频次×0.20 + 内容丰富度×0.15
 *
 * 评分范围: 0-100, 越高越有价值
 */

import { SOURCES } from "./sources";
import type { Entry } from "./types";

/* ========== 1. 源可信度 ========== */

/** 源可信度基准表（基于 tier + 人工判断） */
const SOURCE_CREDIBILITY: Record<string, number> = {
  // Tier 1 AI/科技 — 高可信
  mit_tech_review: 0.95,
  anthropic: 0.90,
  openai: 0.90,
  huggingface: 0.85,
  deepmind: 0.90,
  // Tier 1 中文科技
  jiqizhixin: 0.85,
  qbitai: 0.80,
  "36kr": 0.70,
  // Tier 1 财经
  xueqiu: 0.75,
  "cls-cn": 0.80,
  caixin: 0.90,
  yicai: 0.80,
  eastmoney: 0.70,
  "fin-zh": 0.65,
  "ft-china": 0.90,
  reuters: 0.95,
  bloomberg: 0.95,
  wsj: 0.95,
  cnbc: 0.85,
  investing: 0.70,
  seekingalpha: 0.75,
  "yahoo-finance": 0.70,
  // Tier 1 币圈
  coindesk: 0.80,
  cointelegraph: 0.75,
  theblock: 0.85,
  // Tier 2
  techcrunch: 0.80,
  "hacker-news": 0.75,
  ruanyifeng: 0.85,
  "simon-willison": 0.85,
  decrypt: 0.65,
  bitcoinmagazine: 0.70,
  blockworks: 0.70,
  cryptoslate: 0.65,
  venturebeat: 0.75,
  "ars-technica": 0.85,
  ifanr: 0.65,
  ithome: 0.60,
  sspai: 0.70,
  "36kr-funding": 0.65,
  crunchbase: 0.80,
  // Tier 3
  "smol-ai": 0.45,
  "one-useful-thing": 0.60,
  "latent-space": 0.70,
};

/** 按 tier 的保底可信度 */
const TIER_FALLBACK: Record<number, number> = {
  1: 0.75,
  2: 0.55,
  3: 0.35,
};

function getSourceCredibility(sourceId: string): number {
  return SOURCE_CREDIBILITY[sourceId] ?? TIER_FALLBACK[getSourceTier(sourceId)] ?? 0.5;
}

function getSourceTier(sourceId: string): 1 | 2 | 3 {
  const source = SOURCES.find((s) => s.id === sourceId);
  return source?.tier ?? 2;
}

/* ========== 2. 时效性（指数衰减） ========== */

/**
 * 指数衰减 — 从 TradingAgents 文档直接引用
 *   decay = exp(-hoursAge / halfLife)
 *   金融信息半衰期设为 24 小时
 */
function getRecencyScore(isoDate?: string, halfLifeHours = 24): number {
  if (!isoDate) return 0.3; // 无时间戳，保守给低分
  const ageHours = (Date.now() - new Date(isoDate).getTime()) / 3_600_000;
  if (ageHours < 0) return 1.0; // 未来时间（罕见），给满分
  return Math.exp(-ageHours / halfLifeHours);
}

/* ========== 3. 跨源频次（去重匹配） ========== */

/**
 * 标题标准化 — 去标点/小写/统一空格
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 标题相似度（Jaccard 相似度）
 *   分词后取交集/并集
 *   对中文：按字 bigram
 *   对英文：按单词
 */
function titleSimilarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;

  // 中英文混合场景：统一按 2-gram（字符级）
  const setA = new Set<string>();
  const setB = new Set<string>();
  for (let i = 0; i < na.length - 1; i++) setA.add(na.slice(i, i + 2));
  for (let i = 0; i < nb.length - 1; i++) setB.add(nb.slice(i, i + 2));

  let inter = 0;
  for (const item of setA) if (setB.has(item)) inter++;

  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? inter / union : 0;
}

/**
 * 跨源频次评分
 *   入参一条新 entry，与所有已有 entry 比较
 *   标题相似度 > 0.3 视为"同一件事"
 *   统计这件事覆盖了多少个不同源
 */
function getCrossSourceFrequency(title: string, sourceId: string, allEntries: Entry[]): number {
  if (!title) return 0;

  // 统计有多少不同源报道了相似内容（排除自己）
  const relatedSources = new Set<string>();

  for (const existing of allEntries) {
    if (existing.sourceId === sourceId) continue;
    if (!existing.title) continue;

    const sim = titleSimilarity(title, existing.title);
    if (sim > 0.35) {
      relatedSources.add(existing.sourceId);
    }
  }

  // 0 个 → 0分, 1个 → 0.4, 2个 → 0.7, 3+ → 1.0
  const count = relatedSources.size;
  if (count === 0) return 0;
  if (count === 1) return 0.4;
  if (count === 2) return 0.7;
  return 1.0;
}

/* ========== 4. 内容丰富度 ========== */

/**
 * 内容质量 — 有正文 vs 只有标题
 */
function getContentQuality(title: string, contentText?: string, summary?: string): number {
  if (!title) return 0;

  const contentLen = (contentText || "").length;
  const summaryLen = (summary || "").length;

  // 有正文且长度足够 → 高分
  if (contentLen > 500) return 1.0;
  if (contentLen > 200) return 0.8;
  // 只有摘要但质量还行
  if (summaryLen > 100) return 0.6;
  if (summaryLen > 50) return 0.4;
  // 只有标题
  return 0.3;
}

/* ========== 主函数 ========== */

export interface ScoreInput {
  title: string;
  sourceId: string;
  isoDate?: string;
  contentText?: string;
  summary?: string;
}

/**
 * 计算单条信息的价值评分
 *
 * @param input  当前 entry 的信息
 * @param allEntries  已有全部 entry（用于跨源频次计算）
 * @returns 0-100 的评分
 */
export function calculateScore(input: ScoreInput, allEntries: Entry[]): number {
  const credibility = getSourceCredibility(input.sourceId);
  const recency = getRecencyScore(input.isoDate);
  const frequency = getCrossSourceFrequency(input.title, input.sourceId, allEntries);
  const quality = getContentQuality(input.title, input.contentText, input.summary);

  const total =
    credibility * 0.35 +
    recency * 0.30 +
    frequency * 0.20 +
    quality * 0.15;

  // 归一化为 0-100 整数
  return Math.round(Math.min(total, 1) * 100);
}

/**
 * 批量计算评分并更新 entries
 *   - 新 entry 计算初始评分
 *   - 已有 entry 也可能因为跨源频次变化而被动提分
 */
export function scoreEntries(
  incoming: Entry[],
  allExisting: Entry[],
): { newEntries: Entry[]; updatedExisting: Entry[] } {
  const all = [...allExisting, ...incoming];

  // 1. 为新 entry 算分
  const newEntries = incoming.map((e) => ({
    ...e,
    score: calculateScore(
      { title: e.title, sourceId: e.sourceId, isoDate: e.isoDate, contentText: e.contentText, summary: e.summary },
      all,
    ),
  }));

  // 2. 检查已有 entry 的跨源频次是否因新 entry 增加而需要更新
  const updatedExisting: Entry[] = [];
  for (const existing of allExisting) {
    const newFreq = getCrossSourceFrequency(existing.title, existing.sourceId, all);
    const oldFreq = (existing.score ?? 0) / 100;

    // 只提取 existing 里需要的维度反算
    // 如果跨源频次显著提高（旧频次权重贡献 < 新频次），则重新评分
    if (newFreq > 0.4) {
      const oldCred = getSourceCredibility(existing.sourceId);
      const oldRecency = getRecencyScore(existing.isoDate);
      const oldQuality = getContentQuality(existing.title, existing.contentText, existing.summary);

      const newTotal =
        oldCred * 0.35 + oldRecency * 0.30 + newFreq * 0.20 + oldQuality * 0.15;
      const newScore = Math.round(Math.min(newTotal, 1) * 100);

      // 分数变化超过 5 分才更新（避免抖动）
      if (Math.abs(newScore - (existing.score ?? 0)) > 5) {
        updatedExisting.push({ ...existing, score: newScore });
      }
    }
  }

  return { newEntries, updatedExisting };
}
