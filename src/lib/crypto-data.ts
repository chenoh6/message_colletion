/* ===== 币圈内容条目（抓取清洗后） ===== */
// 信息源已迁移到 /discover 页面

export interface CryptoEntry {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceIcon: string;
  sourceUrl?: string;
  credibility: 'A' | 'B' | 'C';
  time: string;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  isRead?: boolean;
  isSaved?: boolean;
  coverGradient: string;
  coverEmoji: string;
  badge?: { label: string; type: 'hot' | 'new' | 'flash' };
  aiSummary?: string;
}

/* ===== 信息源颜色映射（按来源名称，自动分配固定色） ===== */
export const SOURCE_COLORS: Record<string, string> = {
  "CoinDesk": "#3b82f6",
  "Cointelegraph": "#f97316",
  "The Block": "#8b5cf6",
  "Decrypt": "#06b6d4",
  "Bitcoin Magazine": "#fbbf24",
  "Blockworks": "#ec4899",
  "CryptoSlate": "#14b8a6",
  "Farside Investors": "#64748b",
  "Glassnode": "#22d3ee",
  "SoSoValue": "#a78bfa",
  "WuBlockchain": "#ef4444",
  "CoinGlass": "#f59e0b",
  "default": "#6366f1",
};
export function getSourceColor(source: string): string {
  return SOURCE_COLORS[source] || SOURCE_COLORS["default"];
}

export const CRYPTO_FEATURED: CryptoEntry[] = [
  {
    id: 'cb1',
    sourceUrl: 'https://coindesk.com',
    credibility: 'A',
    title: 'BTC 跌破 6 万美元后反弹，ETF 流出速度放缓至 $48.8M',
    summary: '比特币昨日最低触及 $61,349 后反弹至 $63,000 区间。美国现货 ETF 净流出收窄至 $48.8M，为过去 13 天最低单日流出金额。IBIT（贝莱德）流出 $131M 但被其他 ETF 部分对冲。',
    aiSummary: 'ETF 流出降速是重要边际改善信号——已从日均 $3-4亿 降至 $48.8M。虽然还没转正，但方向对了。关键看下周初是否持续收窄。',
    source: 'Farside Investors',
    sourceIcon: '📊',
    time: '1 小时前',
    category: 'ETF',
    tags: ['#ETF', '#BTC', '#资金流'],
    likes: 342,
    comments: 56,
    coverGradient: 'from-[#7c5cfc]/40 to-[#2dd4bf]/15',
    coverEmoji: '₿',
    badge: { label: '🔥 今日头条', type: 'hot' },
  },
  {
    id: 'cb2',
    sourceUrl: 'https://glassnode.com/insights',
    credibility: 'A',
    title: 'RSI 跌至 16.3 创 2020 年 3 月以来最低，历史级超卖信号出现',
    summary: '比特币 RSI 指数跌至 16.33，为 2020 年 3 月（当时 BTC 约 $3,800）以来最低水平。此前 RSI 进入 20 以下后，BTC 在 7 天内平均反弹 8-12%。同时恐惧贪婪指数跌至 12。',
    aiSummary: 'RSI 16 是历史级信号——过去 5 年里只有 2020 年 3 月 12 日比这更低。极端超卖不等于马上涨，但这是一个做反弹而非追空的位置。',
    source: 'Glassnode',
    sourceIcon: '🔬',
    time: '3 小时前',
    category: '技术分析',
    tags: ['#RSI', '#超卖', '#技术面'],
    likes: 267,
    comments: 43,
    coverGradient: 'from-[#2dd4bf]/25 to-[#7c5cfc]/10',
    coverEmoji: '📉',
    badge: { label: '📊 关键信号', type: 'flash' },
  },
];

export const CRYPTO_FEED: CryptoEntry[] = [
  {
    id: 'ce1',
    sourceUrl: 'https://coindesk.com',
    credibility: 'B',
    title: '非农数据远超预期，加息前景再度压制风险资产',
    summary: '美国 5 月非农就业数据大超预期，市场对美联储加息的预期再度升温。分析指出高利率维持更久意味着风险偏好收缩，BTC 等风险资产短期持续承压。',
    source: 'CoinDesk',
    sourceIcon: '📰',
    time: '2 小时前',
    category: '宏观',
    tags: ['#宏观经济', '#非农', '#美联储'],
    likes: 178,
    comments: 31,
    aiSummary: '非农超预期 → 加息预期升温 → BTC 等风险资产承压。这个逻辑链短期内很难打破，但市场对"利率更高更久"已在逐步定价，边际影响在递减。',
    coverGradient: 'from-[#f87171]/20 to-[#fbbf24]/10',
    coverEmoji: '🏛️',
  },
  {
    id: 'ce2',
    sourceUrl: 'https://wublockchain.com',
    credibility: 'A',
    title: 'Michael Saylor：AI 热潮吸走资金是轮动而非 BTC 基本面受损',
    summary: 'Strategy CEO Michael Saylor 公开表示，当前资金从 BTC 流向 AI 领域是"资本轮动"而非比特币基本面出了问题。过去 6 个月约 $4000 亿流入 AI，但 BTC 的网络安全和稀缺性没有改变。',
    source: 'WuBlockchain',
    sourceIcon: '📢',
    time: '4 小时前',
    category: '观点',
    tags: ['#Saylor', '#观点', '#基本面'],
    likes: 145,
    comments: 28,
    aiSummary: 'Saylor 说"资金轮动而非 BTC 基本面受损"是在给市场打气。但 4000 亿 vs BTC 市值这件事本身说明 AI 虹吸是真实的结构性压力，短期不会逆转。',
    coverGradient: 'from-[#7c5cfc]/15 to-[#f472b6]/8',
    coverEmoji: '🎙️',
    badge: { label: '🔥 热议', type: 'hot' },
  },
  {
    id: 'ce3',
    sourceUrl: 'https://sosovalue.com',
    credibility: 'A',
    title: '贝莱德 IBIT 单日流出 $131M，但其他 ETF 逆势净流入',
    summary: '6 月 6 日 ETF 数据显示：IBIT（贝莱德）流出 $131.45M，但 Bitwise BITB +$31.8M、富达 FBTC +$22.8M、ARKB +$11.5M。市场呈现"贝莱德在卖，其他在接"的分化格局。',
    source: 'SoSoValue',
    sourceIcon: '📊',
    time: '6 小时前',
    category: 'ETF',
    tags: ['#ETF', '#IBIT', '#资金分化'],
    likes: 123,
    comments: 19,
    aiSummary: '贝莱德 IBIT 流出 $131M 但其他 ETF 在买入——这个分化很关键：不是全线撤退，而是资金在做调仓。IBIT 流出可能和大型机构季度再平衡有关，未必是趋势性看空。',
    coverGradient: 'from-[#7c5cfc]/20 to-[#2dd4bf]/10',
    coverEmoji: '🏦',
  },
  {
    id: 'ce4',
    sourceUrl: 'https://coinglass.com',
    credibility: 'B',
    title: '24 小时爆仓 $17.6 亿，多头清算创近期新高',
    summary: '加密货币市场 24 小时内总计爆仓约 $17.6 亿，其中多头占 $15 亿+。BTC 资金费率全面转负，表明多头杠杆已大规模清洗，市场处于极度恐慌状态。',
    source: 'CoinGlass',
    sourceIcon: '💥',
    time: '8 小时前',
    category: '清算',
    tags: ['#爆仓', '#清算', '#杠杆'],
    likes: 98,
    comments: 24,
    aiSummary: '$17.6 亿爆仓意味着杠杆已经清洗干净了——这是典型的"恐慌底部"特征。但清洗完杠杆不等于需求会立刻回来，需要观察接下来几天现货买入量是否回升。',
    coverGradient: 'from-[#f87171]/20 to-transparent',
    coverEmoji: '💥',
    badge: { label: '⚠️ 风险', type: 'flash' },
  },
  {
    id: 'ce5',
    sourceUrl: 'https://theblock.co',
    credibility: 'A',
    title: '美国众议院审议七项加密税收法案草案',
    summary: '美国众议院税收委员会正在审议七项加密相关法案草案，包括对小额交易、比特币挖矿和 PoS 质押收益的税收减免提案。若通过将是对行业的重大利好。',
    source: 'The Block',
    sourceIcon: '📊',
    time: '10 小时前',
    category: '监管',
    tags: ['#监管', '#税收', '#法案'],
    likes: 89,
    comments: 16,
    aiSummary: '税收减免法案如果通过，对 BTC 矿工和 PoS 质押者直接利好——会降低卖出压力。但立法进度通常很慢，短期影响有限，更偏向中期情绪催化剂。',
    coverGradient: 'from-[#fbbf24]/15 to-[#7c5cfc]/8',
    coverEmoji: '📜',
  },
  {
    id: 'ce6',
    sourceUrl: 'https://coindesk.com',
    credibility: 'A',
    title: '摩根大通、美银、花旗明年将推出共享代币化网络',
    summary: '摩根大通、美国银行和花旗银行计划明年推出共享代币化网络，以应对稳定币对存款基础的潜在威胁。这标志着美国传统银行业在区块链领域的首次协同进攻。',
    source: 'CoinDesk',
    sourceIcon: '📰',
    time: '12 小时前',
    category: '机构',
    tags: ['#机构', '#代币化', '#银行'],
    likes: 76,
    comments: 14,
    aiSummary: '摩根大通+美银+花旗联手做代币化网络是一个里程碑——传统银行终于认真应对稳定币的威胁。短期对币价影响有限，但长期看是"机构化"趋势的又一证据。',
    coverGradient: 'from-[#2dd4bf]/15 to-[#7c5cfc]/8',
    coverEmoji: '🏛️',
  },
];

export interface CryptoSource {
  name: string;
  url?: string;
  icon: string;
  desc: string;
  tags: string[];
  type: "海外" | "中文" | "链上数据" | "Newsletter" | "社交账号";
  badge?: string;
  recommend?: boolean;
}

export interface CryptoMarketItem {
  label: string;
  value: string;
  change: string;
  up: boolean;
}

export interface CryptoCategory {
  title: string;
  icon: string;
  desc: string;
  items: CryptoSource[];
}

export const CRYPTO_CATEGORIES: CryptoCategory[] = [
  {
    title: "海外主流资讯",
    icon: "🌍",
    desc: "全球最重要的加密新闻媒体，消息源头第一手",
    items: [
      { name: "CoinDesk", url: "https://coindesk.com", icon: "📰", desc: "最老牌的加密新闻媒体，曾率先爆料FTX暴雷。报道深度、监管政策分析业界最强", tags: ["快讯", "深度", "监管"], type: "海外", badge: "🏆 首选", recommend: true },
      { name: "Cointelegraph", url: "https://cointelegraph.com", icon: "⚡", desc: "24/7快讯，覆盖新闻、NFT、DeFi、AI。速度快，移动端体验好", tags: ["快讯", "行情"], type: "海外", badge: "🔥 高频" },
      { name: "The Block", url: "https://theblock.co", icon: "📊", desc: "机构级报道，附带强大数据面板——链上指标、ETF资金流、衍生品数据一应俱全", tags: ["深度", "数据", "机构"], type: "海外", badge: "📊 数据强", recommend: true },
      { name: "Decrypt", url: "https://decrypt.co", icon: "🔐", desc: "科普式解说，适合快速理解复杂话题。内容通俗易懂，入门友好", tags: ["科普", "入门"], type: "海外" },
      { name: "Blockworks", url: "https://blockworks.co", icon: "🏦", desc: "金融研究驱动，关注机构进场动态，PDF研报质量高", tags: ["研报", "机构", "金融"], type: "海外" },
      { name: "Bitcoin Magazine", url: "https://bitcoinmagazine.com", icon: "₿", desc: "最老的比特币专门媒体（2012年创刊）。纯正比特币视角，无山寨币噪音", tags: ["比特币", "深度"], type: "海外", recommend: true },
    ],
  },
  {
    title: "中文资讯",
    icon: "🇨🇳",
    desc: "中文币圈消息面首选，实时获取华语圈动态",
    items: [
      { name: "吴说区块链", url: "https://wublockchain.com", icon: "📢", desc: "中英文双语，深度行业报道、政策分析，业内口碑最好", tags: ["深度", "政策", "行业"], type: "中文", badge: "🏆 首选", recommend: true },
      { name: "币界网", url: "https://bijie.com", icon: "💹", desc: "行情+资讯+社区一体，支持30000+币种追踪，内置AI分析工具", tags: ["行情", "社区", "AI"], type: "中文", badge: "📱 全能" },
      { name: "链智库", url: "https://lianzhiku.com", icon: "🧠", desc: "人工筛选快讯，无广告，无需登录，简洁干净", tags: ["快讯", "极简"], type: "中文", recommend: true },
      { name: "Foresight News", url: "https://foresightnews.pro", icon: "🔭", desc: "专注区块链深度内容，行业活动和项目分析", tags: ["深度", "活动"], type: "中文" },
      { name: "律动 BlockBeats", url: "https://theblockbeats.info", icon: "📡", desc: "快速、全面的中文加密资讯，覆盖各类链上新闻", tags: ["快讯", "全面"], type: "中文" },
      { name: "Chainfeeds", icon: "📬", desc: "中文加密Newsletter，每日精选优质内容聚合推送", tags: ["精选", "订阅"], type: "中文" },
    ],
  },
  {
    title: "链上数据工具",
    icon: "🔗",
    desc: "链上数据不会撒谎——信号比新闻更真实",
    items: [
      { name: "DefiLlama", url: "https://defillama.com", icon: "🦙", desc: "各协议TVL、收益、资金流向。最中立无偏的数据平台", tags: ["TVL", "DeFi", "收益"], type: "链上数据", badge: "🏆 首选", recommend: true },
      { name: "Glassnode", url: "https://glassnode.com", icon: "🔬", desc: "比特币链上指标——持仓分布、交易所流量、实现价格、持币地址分析", tags: ["比特币", "链上", "持仓"], type: "链上数据", recommend: true },
      { name: "CryptoQuant", url: "https://cryptoquant.com", icon: "📈", desc: "交易所流入流出、矿工持仓、期货数据。偏交易决策", tags: ["交易所", "矿工", "期货"], type: "链上数据" },
      { name: "Dune Analytics", url: "https://dune.com", icon: "📊", desc: "社区自定义链上数据看板，灵活度最高，需一定技术能力", tags: ["自定义", "看板", "社区"], type: "链上数据" },
      { name: "CoinGecko", url: "https://coingecko.com", icon: "🦎", desc: "综合行情、排名、市场情绪、币种基础数据", tags: ["行情", "排名", "综合"], type: "链上数据" },
      { name: "Nansen / Arkham", url: "https://nansen.ai", icon: "🐋", desc: "链上地址追踪、智能资金流向分析，追踪聪明钱", tags: ["地址追踪", "聪明钱", "分析"], type: "链上数据", badge: "🐋 聪明钱" },
    ],
  },
  {
    title: "Newsletter 订阅",
    icon: "📬",
    desc: "每日推送到邮箱，省去主动搜集的时间",
    items: [
      { name: "CoinDesk: The Node", icon: "📰", desc: "每日一刊，覆盖全市场最重要的动态", tags: ["每日", "全面"], type: "Newsletter", badge: "📅 每日", recommend: true },
      { name: "Milk Road", icon: "🥛", desc: "轻松阅读的加密Newsletter，适合初学者，带点幽默", tags: ["轻松", "入门"], type: "Newsletter" },
      { name: "The Pomp Letter", icon: "📝", desc: "Anthony Pompliano主笔，比特币+宏观经济深度分析", tags: ["比特币", "宏观", "周更"], type: "Newsletter", recommend: true },
      { name: "Glassnode Insights", icon: "🔬", desc: "每周链上数据深度解读，信号极强", tags: ["链上", "周更", "数据"], type: "Newsletter", badge: "📊 数据" },
      { name: "Bankless", icon: "🏦", desc: "DeFi和以太坊生态，提供多版本订阅", tags: ["DeFi", "以太坊", "策略"], type: "Newsletter" },
      { name: "a16z Crypto", icon: "🏛️", desc: "顶级VC的加密研究报告，不定期发布", tags: ["研报", "VC", "深度"], type: "Newsletter", recommend: true },
    ],
  },
  {
    title: "X / Twitter 必跟账号",
    icon: "🐦",
    desc: "消息最快的地方是 X，但噪音最大。只看这些",
    items: [
      { name: "@zachxbt", icon: "🕵️", desc: "链上侦探，防坑必跟。追踪黑客攻击和资金流向", tags: ["安全", "侦探"], type: "社交账号", badge: "🛡️ 防坑" },
      { name: "@lopp", icon: "🔐", desc: "比特币安全大神，技术分析向。比特币核心开发者", tags: ["比特币", "安全", "技术"], type: "社交账号", recommend: true },
      { name: "@TheWolfOfAllStreets", icon: "🐺", desc: "Scott Melker。市场趋势、交易策略、政策解读", tags: ["市场", "交易", "趋势"], type: "社交账号" },
      { name: "WuBlockchain", icon: "📡", desc: "中文加密新闻最快出口，吴说官方X账号", tags: ["中文", "快讯"], type: "社交账号", recommend: true },
      { name: "@DefiLlama", icon: "🦙", desc: "TVL和协议数据更新，只发事实，不喊单", tags: ["数据", "DeFi", "客观"], type: "社交账号", recommend: true },
      { name: "@saylor", icon: "₿", desc: "Michael Saylor。Strategy CEO，大饼最大多头，关注机构化", tags: ["机构", "比特币"], type: "社交账号" },
    ],
  },
];

/* ===== 比特币实时行情模拟数据 ===== */
export const MARKET_TICKER: CryptoMarketItem[] = [
  { label: "BTC/USDT", value: "62,350", change: "-1.58%", up: false },
  { label: "ETH/USDT", value: "1,654", change: "-18.2%", up: false },
  { label: "SOL/USDT", value: "120.4", change: "-7.4%", up: false },
  { label: "DOGE/USDT", value: "0.098", change: "-12.5%", up: false },
];

export const MARKET_SENTIMENT = {
  value: 12,
  label: "极度恐惧",
  color: "#f87171",
};

export const CRYPTO_TOTAL_MC = "2.41T";
export const BTC_DOMINANCE = "52.3%";

/* ===== 热门话题 ===== */
/* ===== 分析模式的信号数据 ===== */

export interface CryptoSignal {
  label: string;
  value: string;
  badge: 'bullish' | 'bearish' | 'neutral' | 'extreme_bull' | 'extreme_bear';
  detail: string;
}

export interface KeyLevel {
  price: string;
  label: string;
  significance: 'major' | 'key' | 'minor';
  type: 'support' | 'resistance';
}

export interface Scenario {
  name: string;
  icon: string;
  probability: number;
  trigger: string;
  targetRange: string;
  color: string;
}

export interface StrategyPlan {
  id: string;
  name: string;
  tag: string;
  tagColor: string;
  desc: string;
  riskLevel: 'high' | 'medium' | 'low';
  suitable: string;
  action: string;
  entryRange: string;
  stopLoss: string;
  targets: string[];
  positionRatio: string;
}

/* --- 今日信号 --- */
export const TODAY_SIGNALS: CryptoSignal[] = [
  { label: "BTC 价格", value: "$62,350", badge: "bearish", detail: "距高点-51%，周跌14%" },
  { label: "ETF 资金流", value: "-$48.8M", badge: "extreme_bear", detail: "13天流出记录，但降速明显" },
  { label: "恐惧贪婪", value: "12", badge: "extreme_bear", detail: "极度恐惧 · 2020.3以来最低" },
  { label: "RSI", value: "16.3", badge: "extreme_bull", detail: "极度超卖 · 反弹信号强烈" },
  { label: "资金费率", value: "负值", badge: "bullish", detail: "多头出清，杠杆清洗完毕" },
  { label: "总清算", value: "$17.6 亿", badge: "neutral", detail: "24h 多头爆仓 15 亿+" },
];

/* --- 关键价位 --- */
export const KEY_LEVELS: KeyLevel[] = [
  { price: "$55,000", label: "深度底部", significance: "major", type: "support" },
  { price: "$58,000", label: "矿工成本支撑", significance: "key", type: "support" },
  { price: "$60,000", label: "最后心理防线 ⚠️", significance: "major", type: "support" },
  { price: "$61,112", label: "年内低点区域", significance: "key", type: "support" },
  { price: "$63,000", label: "当前价格", significance: "minor", type: "support" },
  { price: "$65,000", label: "确认转强门槛", significance: "key", type: "resistance" },
  { price: "$67,000", label: "反弹理论目标", significance: "major", type: "resistance" },
  { price: "$71,000", label: "趋势线阻力", significance: "major", type: "resistance" },
];

/* --- 三大场景 --- */
export const SCENARIOS: Scenario[] = [
  { name: "看涨 · 超卖反转", icon: "🟢", probability: 25, trigger: "ETF流出收窄→转正 + 非农利空出尽", targetRange: "$65K → $71K", color: "#2dd4bf" },
  { name: "中性 · 底部震荡", icon: "🟡", probability: 50, trigger: "ETF减缓 + AI分流持续 + 无新增催化剂", targetRange: "$58K ~ $67K", color: "#fbbf24" },
  { name: "看跌 · 跌破6万", icon: "🔴", probability: 25, trigger: "ETF加速流出 / 地缘升级 / AI超预期吸金", targetRange: "$55K → $58K", color: "#f87171" },
];

/* --- 策略方案（动态生成） --- */
export type TimeFrame = "short" | "mid" | "long";
export type RiskTolerance = "aggressive" | "neutral" | "conservative";

export function getStrategyPlans(timeFrame: TimeFrame, risk: RiskTolerance): StrategyPlan[] {
  // 根据参数调整入场价/仓位比例
  const entryMap: Record<string, string> = {
    "short_aggressive": "$61,500",
    "short_neutral": "$61,000",
    "short_conservative": "—",
    "mid_aggressive": "$61,500",
    "mid_neutral": "$61,000",
    "mid_conservative": "$60,000",
    "long_aggressive": "$61,000",
    "long_neutral": "$58,000~$61,000",
    "long_conservative": "$55,000~$58,000",
  };
  const posMap: Record<string, string> = {
    "short_aggressive": "20%",
    "short_neutral": "10%",
    "short_conservative": "0%",
    "mid_aggressive": "40%",
    "mid_neutral": "30%",
    "mid_conservative": "15%",
    "long_aggressive": "60%",
    "long_neutral": "40%",
    "long_conservative": "20%",
  };
  const slMap: Record<string, string> = {
    "short_aggressive": "$59,500",
    "short_neutral": "$59,800",
    "short_conservative": "—",
    "mid_aggressive": "$57,000",
    "mid_neutral": "$55,000",
    "mid_conservative": "—",
    "long_aggressive": "$52,000",
    "long_neutral": "$52,000",
    "long_conservative": "—",
  };
  const stopLoss = slMap[`${timeFrame}_${risk}`] || "—";
  const entry = entryMap[`${timeFrame}_${risk}`] || "$61,000";
  const pos = posMap[`${timeFrame}_${risk}`] || "10%";

  return [
    {
      id: "a",
      name: "短线超卖反弹",
      tag: risk === "aggressive" ? "激进" : risk === "neutral" ? "波段" : "—",
      tagColor: risk === "aggressive" ? "#f87171" : risk === "neutral" ? "#fbbf24" : "#60a5fa",
      desc: `利用 RSI 16 的历史级超卖博${timeFrame === "short" ? "快速" : timeFrame === "mid" ? "阶段性" : "底部"}反弹`,
      riskLevel: risk === "aggressive" ? "high" : risk === "neutral" ? "medium" : "low",
      suitable: risk === "aggressive" ? "激进型 · 能盯盘" : risk === "neutral" ? "中性 · 波段" : "保守 · 轻仓",
      action: entry === "—" ? "不参与" : "轻仓做多",
      entryRange: entry,
      stopLoss,
      targets: risk === "conservative" ? ["观望等待"] : ["$65,000（减50%）", "$67,000（清仓）"],
      positionRatio: pos,
    },
    {
      id: "b",
      name: "中线分批建仓",
      tag: "推荐",
      tagColor: "#2dd4bf",
      desc: `距高点-51%${timeFrame === "long" ? "，周期底部区域" : "，低估区域"}，分${risk === "aggressive" ? "2" : "3"}批低吸`,
      riskLevel: "medium",
      suitable: `${risk === "aggressive" ? "积极" : risk === "neutral" ? "中线" : "保守"}投资者`,
      action: "分批买入现货",
      entryRange: risk === "aggressive" ? "$61K→$55K" : risk === "neutral" ? "$61K→$58K→$55K" : "$58K→$55K→$50K",
      stopLoss: risk === "aggressive" ? "均价跌破$52K" : risk === "neutral" ? "均价跌破$52K" : "均价跌破$48K",
      targets: risk === "aggressive"
        ? ["$61K 建仓30% ← 现在", "$55K 补仓30%"]
        : ["$61K~$63K 建仓 20%", "$55K~$58K 补仓 20%", "$50K~$55K 加仓 20%"],
      positionRatio: pos,
    },
    {
      id: "c",
      name: "保守观望",
      tag: "安全",
      tagColor: "#60a5fa",
      desc: "趋势未逆转，等待右侧确认信号再入场",
      riskLevel: "low",
      suitable: "保守型 · 新手",
      action: "空仓等待",
      entryRange: "—",
      stopLoss: "—",
      targets: ["ETF净流入≥3天", "BTC站稳 $65K"],
      positionRatio: "0%",
    },
    {
      id: "d",
      name: "持有者对冲",
      tag: "防守",
      tagColor: "#c084fc",
      desc: "有现货持仓者开空单或买Put对冲下行风险",
      riskLevel: "medium",
      suitable: "已有仓位者",
      action: "开对冲空单/买入看跌期权",
      entryRange: "$62K~$65K",
      stopLoss: "BTC站稳$68K以上平仓",
      targets: ["对冲仓位 = 现货的20-30%", "防止跌破6万"],
      positionRatio: "对冲20-30%",
    },
  ];
}
