export type Hotness = "hot" | "quality" | "niche" | "deep" | "newsflash";

export interface Entry {
  id: string;
  title: string;
  url: string;
  summary?: string;
  aiSummary?: string;
  content?: string;
  contentText?: string;
  source: string;
  sourceId: string;
  sourceIcon: string;
  time: string;
  isoDate?: string;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isRead?: boolean;
  coverGradient?: string;
  coverEmoji?: string;
  badge?: { label: string; type: 'hot' | 'new' | 'exclusive' };
  readingTime?: string;
  aiProcessedAt?: string;
  titleCn?: string;         // AI 翻译的中文标题
  oneLiner?: string;        // AI 一句话中文总结（在标题下展示）
  fact?: string;            // 🔍 事实还原
  judgment?: string;        // 💡 意义判断
  action?: string;          // 🧭 行动指引
  score?: number;           // 信息价值评分 0-100
}

export interface SourceConfig {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'rsshub';
  category: string;
  icon: string;
  lang: 'zh' | 'en';
  tier: 1 | 2 | 3;
  interval: number; // minutes
  aiTranslate: boolean;
  aiPriority: 'high' | 'normal' | 'low';
  active: boolean;
  description?: string;    // 一句话特点
  hotness?: Hotness;       // 热门程度
}

export interface Trend {
  rank: number;
  title: string;
  count: string;
  readingCount: string;
  trend: string;
  trendUp: boolean;
}

export interface FetchResult {
  sourceId: string;
  sourceName: string;
  entries: number;
  newEntries: number;
  error?: string;
}

export interface StoreData {
  entries: Record<string, Entry>;
  fetchLogs: FetchResult[];
  lastFetched: Record<string, string>;
}
