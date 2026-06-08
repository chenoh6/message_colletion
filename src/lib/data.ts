export interface Entry {
  id: string;
  title: string;
  summary?: string;
  source: string;
  sourceIcon: string;
  time: string;
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
  aiSummary?: string;
}

export interface Trend {
  rank: number;
  title: string;
  count: string;
  readingCount: string;
  trend: string;
  trendUp: boolean;
}

export const FEATURED_ENTRIES: Entry[] = [
  {
    id: 'f1',
    title: 'Anthropic 发布 Claude 4：200K 上下文，推理能力翻倍',
    summary: 'Anthropic 今日发布了 Claude 4 系列模型，支持 200,000 token 上下文窗口（约 15 万字），在数学推理、代码生成和长文档理解方面取得突破性进展。性能较前代提升 40%，定价降低 50%。',
    aiSummary: 'Claude 4 是 Anthropic 迄今为止最强大的模型，200K 上下文意味着可以一次处理整本《三体》三部曲。推理能力翻倍主要得益于新的架构设计。',
    source: '机器之心',
    sourceIcon: '🤖',
    time: '2 小时前',
    category: 'AI',
    tags: ['#AI', '#Claude', '#Anthropic', '#大模型'],
    likes: 256,
    comments: 48,
    coverGradient: 'from-[#7c5cfc]/40 to-[#2dd4bf]/15',
    coverEmoji: '🤖',
    badge: { label: '🔥 今日头条', type: 'hot' },
    readingTime: '8 分钟',
  },
  {
    id: 'f2',
    title: 'OpenAI 完成 400 亿美元融资，SoftBank 领投',
    summary: 'SoftBank 领投，Microsoft 跟投。OpenAI 估值突破 3000 亿美元，资金将用于算力基础设施建设和 AGI 研发。这轮融资是 AI 领域历史上规模最大的一轮。',
    aiSummary: '400 亿美金是什么概念？超过大多数独角兽公司的总估值。SoftBank 的领投标志着孙正义全力押注 AGI 赛道。',
    source: '36氪',
    sourceIcon: '💰',
    time: '5 小时前',
    category: '融资',
    tags: ['#融资', '#OpenAI', '#AGI'],
    likes: 189,
    comments: 32,
    coverGradient: 'from-[#2dd4bf]/25 to-[#7c5cfc]/10',
    coverEmoji: '💰',
    badge: { label: '📈 独家', type: 'exclusive' },
    readingTime: '5 分钟',
  },
];

export const FEED_ENTRIES: Entry[] = [
  {
    id: 'e1',
    title: 'Google Gemini 2.0 发布：原生多模态 + Agent 能力',
    summary: 'Google 发布 Gemini 2.0 系列，主打原生多模态理解和 Agent 自动化能力，支持图像、音频、视频实时推理。',
    source: 'Google Blog',
    sourceIcon: '🧠',
    time: '昨天',
    category: 'AI',
    tags: ['AI'],
    likes: 156,
    comments: 28,
    aiSummary: '多模态+Agent 是 2026 年 AI 竞争的标配，Gemini 2.0 的核心差异化在于原生多模态而非后期拼接。对开发者来说是利好，Agent 能力的开放意味着更多自动化场景落地。',
    coverGradient: 'from-[#7c5cfc]/20 to-[#2dd4bf]/10',
    coverEmoji: '🧠',
  },
  {
    id: 'e2',
    title: 'Meta 开源 LLaMA 4：支持 1M Token 上下文窗口',
    summary: 'Meta 正式开源 LLaMA 4 系列，最大亮点是支持 100 万 token 上下文，采用 MoE 架构，性能对标 GPT-4。',
    source: '开源中国',
    sourceIcon: '📦',
    time: '昨天',
    category: '开源',
    tags: ['开源'],
    likes: 134,
    comments: 21,
    coverGradient: 'from-[#2dd4bf]/15 to-[#7c5cfc]/8',
    coverEmoji: '📦',
  },
  {
    id: 'e3',
    title: 'Figma 推出 AI 设计助手：一句话生成 UI 组件',
    summary: 'Figma 推出 AI 驱动的设计助手，支持自然语言生成 UI 组件、智能布局、样式迁移和一键适配。',
    source: '少数派',
    sourceIcon: '🎨',
    time: '1 天前',
    category: '设计工具',
    tags: ['设计工具'],
    likes: 89,
    comments: 15,
    coverGradient: 'from-[#f472b6]/15 to-[#7c5cfc]/10',
    coverEmoji: '🎨',
  },
  {
    id: 'e4',
    title: 'NVIDIA 发布 H200 NVL：专为推理优化的 GPU 规格',
    summary: 'NVIDIA 发布 H200 NVL 推理专用 GPU，显存带宽提升 1.5 倍，能效比提升 2 倍，专为大模型推理优化。',
    source: 'TechCrunch',
    sourceIcon: '⚡',
    time: '2 天前',
    category: '芯片',
    tags: ['芯片'],
    likes: 67,
    comments: 12,
    coverGradient: 'from-[#fbbf24]/15 to-[#f472b6]/10',
    coverEmoji: '⚡',
  },
  {
    id: 'e5',
    title: 'Microsoft Copilot 集成 DeepSeek R1 推理模型',
    summary: '微软宣布 Copilot 将集成 DeepSeek R1 推理模型，在数学推理和代码生成方面显著增强，用户可直接使用。',
    source: '科技媒体',
    sourceIcon: '🌐',
    time: '2 天前',
    category: '产品',
    tags: ['产品'],
    likes: 45,
    comments: 8,
    coverGradient: 'from-[#7c5cfc]/15 to-[#f472b6]/8',
    coverEmoji: '🌐',
  },
  {
    id: 'e6',
    title: 'Apple 发布 AI 私有云架构 Whitechapel',
    summary: 'Apple 发布 Whitechapel 私有云 AI 计算架构，主打端侧隐私保护与云端算力结合。',
    source: 'Apple Insider',
    sourceIcon: '🍎',
    time: '2 天前',
    category: 'AI',
    tags: ['AI'],
    likes: 78,
    comments: 14,
    coverGradient: 'from-[#2dd4bf]/12 to-[#7c5cfc]/8',
    coverEmoji: '🍎',
  },
];

export const TRENDS: Trend[] = [
  { rank: 1, title: 'Claude 4 发布', count: '48 篇讨论', readingCount: '2.3w 阅读', trend: '↑ 156%', trendUp: true },
  { rank: 2, title: 'OpenAI 400 亿融资', count: '36 篇讨论', readingCount: '1.8w 阅读', trend: '↑ 89%', trendUp: true },
  { rank: 3, title: 'Gemini 2.0 多模态', count: '29 篇讨论', readingCount: '1.2w 阅读', trend: '↑ 64%', trendUp: true },
  { rank: 4, title: 'LLaMA 4 开源', count: '21 篇讨论', readingCount: '9.8k 阅读', trend: '↑ 42%', trendUp: true },
  { rank: 5, title: 'AI 编程助手对比', count: '15 篇讨论', readingCount: '6.2k 阅读', trend: '↑ 28%', trendUp: true },
];

export const UNREAD_ENTRIES: Entry[] = [
  { id: 'u1', title: 'Apple 发布 AI 私有云架构 Whitechapel', source: 'Apple Insider', sourceIcon: '🍎', time: '10m', category: 'AI', tags: ['AI'], likes: 0, comments: 0, isRead: false },
  { id: 'u2', title: 'Stability AI 发布 Stable Diffusion 4', source: 'Stability AI', sourceIcon: '🎨', time: '25m', category: 'AI', tags: ['AI'], likes: 0, comments: 0, isRead: false },
  { id: 'u3', title: 'Hugging Face 推出新数据集平台', source: 'Hugging Face', sourceIcon: '🤗', time: '1h', category: '开源', tags: ['开源'], likes: 0, comments: 0, isRead: false },
  { id: 'u4', title: 'Anthropic 发布 Responsible Scaling Policy 2.0', source: 'Anthropic', sourceIcon: '🤖', time: '2h', category: '政策', tags: ['政策'], likes: 0, comments: 0, isRead: false },
  { id: 'u5', title: 'NVIDIA 推出 H200 NVL 推理专用 GPU', source: 'TechCrunch', sourceIcon: '⚡', time: '3h', category: '芯片', tags: ['芯片'], likes: 0, comments: 0, isRead: false },
];

export const TOPICS = [
  { name: '✨ 为你推荐', count: 6, active: true },
  { name: '🤖 AI·大模型', count: 18, active: false },
  { name: '💰 投融资', count: 7, active: false },
  { name: '🚀 新产品', count: 12, active: false },
  { name: '📱 科技', count: 24, active: false },
  { name: '🎨 设计', count: 5, active: false },
  { name: '📚 深度长文', count: 4, active: false },
  { name: '🌏 出海', count: 6, active: false },
];
