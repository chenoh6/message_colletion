/* ===== 币圈术语表 ===== */
// 结构：名词 + 通俗释义 + 话术套路 + 一级分类 + 二级分类

export interface Term {
  slug: string;
  name: string;           // 名词
  short: string;          // 通俗释义（弹窗用）
  detail: string;         // 话术套路（页面用 + 弹窗扩展）
  category: string;       // 一级分类
  subcategory: string;    // 二级分类
  example?: string;
}

export const CRYPTO_TERMS: Term[] = [
  // ===== ① 基础定义词 =====
  { slug: "BTC", name: "比特币 BTC", short: "一种去中心化数字资产，不依赖单一银行或公司发行", detail: "比特币不是普通 App 积分，它更像一个全球共识账本上的稀缺数字资产。", category: "专业名词", subcategory: "基础定义词" },
  { slug: "区块链", name: "区块链 Blockchain", short: "记录交易数据的公开账本，按区块顺序连接", detail: "理解比特币，先要理解它不是靠某家公司记账，而是靠区块链网络共同记账。", category: "专业名词", subcategory: "基础定义词" },
  { slug: "去中心化", name: "去中心化 Decentralization", short: "没有单一机构完全控制网络运行", detail: "比特币的核心叙事之一，就是不依赖单点信任，而依赖规则和网络共识。", category: "专业名词", subcategory: "基础定义词" },
  { slug: "共识机制", name: "共识机制 Consensus", short: "网络参与者对交易和账本状态达成一致的规则", detail: "区块链不是谁声音大谁说了算，而是通过共识机制决定哪条记录有效。", category: "专业名词", subcategory: "基础定义词" },
  { slug: "PoW", name: "工作量证明 PoW", short: "矿工用算力竞争记账权的机制", detail: "PoW 的作用不是浪费电，而是用真实成本保护网络安全。", category: "专业名词", subcategory: "基础定义词" },
  { slug: "矿工", name: "矿工 Miner", short: "负责打包交易、维护网络安全并获得奖励的人或机构", detail: "矿工不是在凭空造币，而是在用算力换取维护网络的奖励。", category: "专业名词", subcategory: "基础定义词" },
  { slug: "私钥", name: "私钥 Private Key", short: "控制比特币资产的核心密码", detail: "币圈第一课不是怎么买币，而是明白私钥丢了，资产就基本不可恢复。", category: "专业名词", subcategory: "基础定义词" },
  { slug: "钱包", name: "钱包 Wallet", short: "管理私钥和地址的工具", detail: "钱包不是装币的盒子，本质上是管理私钥和链上地址的工具。", category: "专业名词", subcategory: "基础定义词" },

  // ===== ② 核心流程词 =====
  { slug: "链上交易", name: "链上交易 On-chain", short: "在比特币网络上真实发生并被记录的转账", detail: "链上交易代表资产真的在网络里发生了转移，不是交易所内部数字变化。", category: "专业名词", subcategory: "核心流程词" },
  { slug: "确认", name: "确认 Confirmation", short: "交易被区块记录并获得后续区块承认", detail: "确认数越多，交易被篡改的难度越高，安全性也越强。", category: "专业名词", subcategory: "核心流程词" },
  { slug: "区块", name: "区块 Block", short: "一批交易数据的打包结果", detail: "区块可以理解成账本的一页，每一页都会接在前一页后面。", category: "专业名词", subcategory: "核心流程词" },
  { slug: "挖矿", name: "挖矿 Mining", short: "矿工竞争生成新区块的过程", detail: "挖矿不是单纯赚钱行为，它同时承担网络记账和安全维护。", category: "专业名词", subcategory: "核心流程词" },
  { slug: "区块奖励", name: "区块奖励 Block Reward", short: "矿工成功出块后获得的 BTC 奖励", detail: "区块奖励是比特币早期激励矿工维护网络的重要机制。", category: "专业名词", subcategory: "核心流程词" },
  { slug: "减半", name: "减半 Halving", short: "区块奖励按周期减少一半", detail: "减半影响的是新增供给速度，但价格还要看需求和流动性。", category: "专业名词", subcategory: "核心流程词" },
  { slug: "交易所", name: "交易所 Exchange", short: "用户买卖 BTC 的平台", detail: "交易所提供交易便利，但不等于链上自托管，平台风险要单独看。", category: "专业名词", subcategory: "核心流程词" },
  { slug: "现货", name: "现货 Spot", short: "直接买入或卖出 BTC 本身", detail: "现货更适合方向判断，风险主要来自价格波动和托管安全。", category: "专业名词", subcategory: "核心流程词" },
  { slug: "合约", name: "合约 Futures/Perpetual", short: "用保证金交易 BTC 价格涨跌的衍生品", detail: "合约不是简单放大收益，它首先放大的是波动和错误。", category: "专业名词", subcategory: "核心流程词" },

  // ===== ③ 关键指标词 =====
  { slug: "价格", name: "价格 Price", short: "市场当前愿意买卖 BTC 的报价", detail: "价格只是结果，真正要看价格背后的资金、情绪和结构。", category: "专业名词", subcategory: "关键指标词" },
  { slug: "成交量", name: "成交量 Volume", short: "一段时间内 BTC 买卖成交规模", detail: "上涨有没有持续性，不能只看价格，要看成交量是否配合。", category: "专业名词", subcategory: "关键指标词" },
  { slug: "市值", name: "市值 Market Cap", short: "BTC 总量乘以价格形成的整体规模", detail: "市值反映资产体量，但不等于所有 BTC 都能按当前价格卖出。", category: "专业名词", subcategory: "关键指标词" },
  { slug: "波动率", name: "波动率 Volatility", short: "价格上下波动的剧烈程度", detail: "比特币机会来自波动，风险也来自波动。", category: "专业名词", subcategory: "关键指标词" },
  { slug: "BTC市占率", name: "BTC 市占率 Dominance", short: "BTC 在整个加密市场中的市值占比", detail: "BTC 市占率上升，通常说明资金更偏向主流资产或市场避险。", category: "专业名词", subcategory: "关键指标词", example: "当前 BTC 市占率约 52%，处于中等偏高水平。" },
  { slug: "资金费率", name: "资金费率 Funding Rate", short: "永续合约多空双方定期支付的费用", detail: "资金费率过高，说明多头拥挤；过低或为负，说明空头压力较大。", category: "专业名词", subcategory: "关键指标词" },
  { slug: "交易所余额", name: "交易所余额 Exchange Balance", short: "存放在交易所里的 BTC 数量", detail: "交易所余额变化能提示潜在卖压或长期持有倾向，但不能单独做买卖依据。", category: "专业名词", subcategory: "关键指标词" },
  { slug: "活跃地址", name: "活跃地址 Active Addresses", short: "一段时间内发生交易的钱包地址数量", detail: "活跃地址反映链上使用热度，但要结合转账量和市场环境看。", category: "专业名词", subcategory: "关键指标词" },
  { slug: "哈希率", name: "哈希率 Hash Rate", short: "全网挖矿算力规模", detail: "哈希率越高，通常说明网络安全成本越高，矿工竞争越激烈。", category: "专业名词", subcategory: "关键指标词" },
  { slug: "回撤", name: "回撤 Drawdown", short: "价格或账户从高点下跌的幅度", detail: "看收益之前先看回撤，因为你能不能活下来比赚多少更重要。", category: "专业名词", subcategory: "关键指标词" },

  // ===== ④ 方法工具词 =====
  { slug: "K线", name: "K线 Candlestick", short: "用开盘、收盘、最高、最低价格展示走势", detail: "K线看的是多空博弈结果，不是单独预测未来的工具。", category: "专业名词", subcategory: "方法工具词" },
  { slug: "均线", name: "均线 MA", short: "一段时间内价格平均值形成的趋势线", detail: "均线主要看趋势成本，价格在均线之上说明资金结构偏强。", category: "专业名词", subcategory: "方法工具词" },
  { slug: "支撑位", name: "支撑位 Support", short: "价格下跌时可能出现买盘的位置", detail: "支撑位不是绝对安全线，而是市场可能重新接盘的区域。", category: "专业名词", subcategory: "方法工具词" },
  { slug: "压力位", name: "压力位 Resistance", short: "价格上涨时可能遇到卖盘的位置", detail: "压力位本质上是前期套牢盘和获利盘容易兑现的区域。", category: "专业名词", subcategory: "方法工具词" },
  { slug: "突破", name: "突破 Breakout", short: "价格越过关键压力区", detail: "突破不能只看价格站上去，还要看成交量和后续站稳。", category: "专业名词", subcategory: "方法工具词" },
  { slug: "回踩", name: "回踩 Retest", short: "突破后价格回落测试支撑", detail: "健康突破往往会有回踩确认，不是所有回落都代表走弱。", category: "专业名词", subcategory: "方法工具词" },
  { slug: "链上分析", name: "链上分析 On-chain Analysis", short: "通过链上数据观察真实资金和持币行为", detail: "链上分析看的是资金在链上的真实移动，不只是交易所盘口情绪。", category: "专业名词", subcategory: "方法工具词" },
  { slug: "仓位管理", name: "仓位管理 Position Sizing", short: "控制投入资金比例", detail: "仓位不是表达信仰，而是控制风险暴露。", category: "专业名词", subcategory: "方法工具词" },
  { slug: "止损", name: "止损 Stop Loss", short: "交易逻辑失效时主动退出", detail: "止损不是承认失败，而是让下一次机会还和你有关。", category: "专业名词", subcategory: "方法工具词" },
  { slug: "定投", name: "定投 DCA", short: "分批固定买入，降低择时压力", detail: "定投解决的不是稳赚，而是降低一次性买在高点的风险。", category: "专业名词", subcategory: "方法工具词" },

  // ===== ⑤ 问题风险词 =====
  { slug: "FOMO", name: "FOMO", short: "害怕错过上涨而冲动买入", detail: "FOMO 最大的问题是用情绪代替判断，通常发生在风险收益比变差的时候。", category: "专业名词", subcategory: "问题风险词" },
  { slug: "诱多", name: "诱多 Bull Trap", short: "制造上涨假象吸引追高", detail: "高位突然放量拉升，不一定是机会，也可能是给出货制造流动性。", category: "专业名词", subcategory: "问题风险词" },
  { slug: "诱空", name: "诱空 Bear Trap", short: "制造下跌假象逼人割肉", detail: "低位破位后快速收回，有时不是趋势崩坏，而是一次诱空洗盘。", category: "专业名词", subcategory: "问题风险词" },
  { slug: "爆仓", name: "爆仓 Liquidation", short: "合约亏损触及强平线，被系统强制平仓", detail: "爆仓不是亏损扩大，而是直接失去继续参与市场的资格。", category: "专业名词", subcategory: "问题风险词" },
  { slug: "脱锚", name: "脱锚 Depeg", short: "稳定币价格偏离应有锚定价值", detail: "稳定币脱锚会影响整个市场流动性，是系统性风险信号之一。", category: "专业名词", subcategory: "问题风险词" },
  { slug: "交易所风险", name: "交易所风险 Exchange Risk", short: "平台冻结、跑路、挤兑、技术故障等风险", detail: "币在交易所里，除了价格风险，还有平台信用和流动性风险。", category: "专业名词", subcategory: "问题风险词" },
  { slug: "黑天鹅", name: "黑天鹅 Black Swan", short: "难以预测但影响巨大的突发事件", detail: "币圈黑天鹅的杀伤力大，是因为杠杆、流动性和情绪会同时连锁反应。", category: "专业名词", subcategory: "问题风险词" },
  { slug: "假突破", name: "假突破 False Breakout", short: "短暂突破后快速跌回原区间", detail: "假突破最容易套追高资金，所以必须看站稳和回踩确认。", category: "专业名词", subcategory: "问题风险词" },
  { slug: "流动性风险", name: "流动性风险 Liquidity Risk", short: "想买卖时成交困难或滑点很大", detail: "流动性差的时候，看起来有价格，实际上未必能按那个价格成交。", category: "专业名词", subcategory: "问题风险词" },
  { slug: "指标滞后", name: "指标滞后 Lagging Indicator", short: "指标反映的是已经发生的价格变化", detail: "技术指标大多滞后，不能把它当成预测未来的水晶球。", category: "专业名词", subcategory: "问题风险词" },

  // ===== ⑥ 高阶策略词 =====
  { slug: "牛熊周期", name: "牛熊周期 Market Cycle", short: "市场在上涨、疯狂、下跌、冷清之间循环", detail: "币圈不是线性上涨，而是在流动性、情绪和杠杆之间形成周期。", category: "专业名词", subcategory: "高阶策略词" },
  { slug: "资产配置", name: "资产配置 Allocation", short: "把资金分配到不同资产或不同仓位", detail: "专业参与 BTC，不是满仓梭哈，而是放进整体资产配置里看。", category: "专业名词", subcategory: "高阶策略词" },
  { slug: "风险收益比", name: "风险收益比 Risk-Reward", short: "可能亏损和可能收益之间的比例", detail: "一个机会值不值得做，不看故事多大，而看亏多少、赚多少。", category: "专业名词", subcategory: "高阶策略词" },
  { slug: "安全边际", name: "安全边际 Margin of Safety", short: "给错误判断留下缓冲空间", detail: "安全边际越薄，行情即使看对，也可能因为波动被洗出去。", category: "专业名词", subcategory: "高阶策略词" },
  { slug: "长期持有", name: "长期持有 Long-term Holding", short: "基于长期逻辑而非短线波动持有", detail: "长期持有的前提不是喊信仰，而是资金期限、仓位和心理承受力匹配。", category: "专业名词", subcategory: "高阶策略词" },
  { slug: "资金轮动", name: "资金轮动 Capital Rotation", short: "资金在 BTC、ETH、山寨、稳定币之间流动", detail: "判断行情阶段，要看资金是回流 BTC，还是扩散到高风险山寨。", category: "专业名词", subcategory: "高阶策略词" },
  { slug: "现货ETF", name: "现货 ETF Spot Bitcoin ETF", short: "通过传统证券账户获得 BTC 价格敞口的产品", detail: "ETF 改变的是资金进入方式，不等于 BTC 自身风险消失。", category: "专业名词", subcategory: "高阶策略词" },
  { slug: "宏观流动性", name: "宏观流动性 Macro Liquidity", short: "全球资金松紧、利率、美元等影响风险资产的环境", detail: "BTC 不是孤岛，全球资金价格变化会直接影响风险偏好。", category: "专业名词", subcategory: "高阶策略词" },
  { slug: "交易系统", name: "交易系统 Trading System", short: "买入、卖出、仓位、止损、复盘的一整套规则", detail: "成熟交易不是找神指标，而是建立可重复执行的系统。", category: "专业名词", subcategory: "高阶策略词" },
  { slug: "复盘", name: "复盘 Iteration", short: "交易后检查判断、执行和结果", detail: "复盘不是看哪里涨了，而是检查自己有没有按系统做事。", category: "专业名词", subcategory: "高阶策略词" },

  // ===== 宏观经济（原有保留） =====
  { slug: "非农", name: "非农", short: "美国非农就业数据，每月第一个周五发布，是衡量美国经济健康最重要的指标之一", detail: "非农数据好于预期 → 经济过热 → 加息 → 利空 BTC。差于预期 → 降息 → 利好 BTC。每次非农发布日 BTC 波动率放大 2-3 倍。", category: "宏观经济", subcategory: "经济指标" },
  { slug: "美联储", name: "美联储", short: "美国的中央银行，负责制定利率政策。加息→资金回流美元→风险资产承压", detail: "加息 → 美元走强 + 无风险利率上升 → BTC 吸引力下降。降息 → 美元走弱 + 流动性宽松 → 利好 BTC。", category: "宏观经济", subcategory: "经济指标" },

  // ===== 交易工具（原有保留） =====
  { slug: "ETF", name: "ETF", short: "交易所交易基金。比特币 ETF 让普通投资者像买股票一样买卖比特币", detail: "ETF 净流入 → 机构在买入 → 利好 BTC。净流出 → 机构在卖出 → 利空 BTC。当前美国比特币 ETF 总规模约 $828 亿。", category: "交易工具", subcategory: "ETF", example: "美国现货比特币 ETF 已连续 13 个交易日净流出。" },
  { slug: "IBIT", name: "IBIT", short: "贝莱德发行的比特币现货 ETF 代码，规模最大的比特币 ETF", detail: "贝莱德 IBIT 是全球最大比特币 ETF，AUM 约 $300 亿+。其流入流出对整个 BTC 价格影响最大。", category: "交易工具", subcategory: "ETF" },
  { slug: "稳定币", name: "稳定币", short: "价值锚定法币（如 1 USDT=1 美元）的加密货币", detail: "稳定币市值增长 → 有更多资金准备买入 → 利好。萎缩 → 资金离场 → 利空。是加密市场的备用金。", category: "交易工具", subcategory: "稳定币" },
  { slug: "永续合约", name: "永续合约 Perpetual", short: "没有到期日的期货合约，通过资金费率锚定现货价格", detail: "永续合约永不结算，通过资金费率让合约价贴近现货价。支持高杠杆，24h 交易，资金费率每 8h 结算。", category: "交易工具", subcategory: "衍生品" },

  // ===== 技术指标（原有保留） =====
  { slug: "RSI", name: "RSI", short: "相对强弱指数，衡量价格涨跌速度，0-100。低于30=超卖，高于70=超买", detail: "RSI < 30 超卖区间，价格可能反弹。RSI > 70 超买区间，价格可能回调。RSI < 20 极度超卖，历史上仅在大恐慌底部出现。", category: "技术指标", subcategory: "震荡指标", example: "当前 BTC 的 RSI 为 16.3，2020.3 以来最低。" },
  { slug: "恐惧贪婪指数", name: "恐惧贪婪指数", short: "0-100 衡量市场情绪，0=极度恐惧（可能见底），100=极度贪婪（可能见顶）", detail: "0-24 极度恐惧 → 底部区域。25-49 恐惧。50-74 贪婪。75-100 极度贪婪 → 顶部区域。当前 12 属历史极低。", category: "技术指标", subcategory: "情绪指标" },

  // ===== 人物 =====
  { slug: "Saylor", name: "Saylor / Michael Saylor", short: "Strategy CEO，比特币最大公开持有者，持有约 84 万枚 BTC", detail: "Michael Saylor 是比特币最著名的多头旗手，公司通过发行可转债不断买入 BTC。他卖币就是新闻。", category: "人物", subcategory: "行业人物" },
];
