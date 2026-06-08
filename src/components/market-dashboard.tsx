"use client";

import { useState, useEffect } from "react";

type MarketType = "crypto" | "cn" | "us";

function Explain({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <span className="text-[9px] ml-0.5 cursor-help rounded-full inline-flex items-center justify-center" style={{ width: 12, height: 12, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>?</span>
      {show && (
        <span className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2 rounded-lg text-[10px] leading-relaxed shadow-lg pointer-events-none"
          style={{ background: "#0d1128", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
          {text}
        </span>
      )}
    </span>
  );
}

function Gauge({ label, value, sub, color, explain }: { label: string; value: string; sub?: string; color?: string; explain?: string }) {
  return (
    <div className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="text-[10px] text-dim mb-0.5 flex items-center">{label}{explain && <Explain text={explain} />}</div>
      <div className="text-sm font-bold font-mono" style={{ color: color || "var(--foreground)" }}>{value}</div>
      {sub && <div className="text-[9px] text-tertiary mt-0.5">{sub}</div>}
    </div>
  );
}

function TopSignal({ percent, label, explain }: { percent: number; label: string; explain?: string }) {
  const level = percent >= 80 ? "🔴" : percent >= 60 ? "🟡" : "🟢";
  const barColor = percent >= 80 ? "#f87171" : percent >= 60 ? "#fbbf24" : "#2dd4bf";
  return (
    <div className="flex items-center gap-2 text-[11px] py-1">
      <span>{level}</span>
      <span className="flex-1 text-dim flex items-center">{label}{explain && <Explain text={explain} />}</span>
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full" style={{ width: `${percent}%`, background: barColor }} />
      </div>
      <span className="font-mono text-[10px]" style={{ color: barColor }}>{percent}%</span>
    </div>
  );
}

function fmtColor(change: string): string | undefined {
  if (change?.startsWith("+")) return "#f87171";
  if (change?.startsWith("-")) return "#2dd4bf";
  return undefined;
}

export function MarketDashboard({ market }: { market: MarketType }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/market-indices").then(r => r.json()).then(d => setData(d)).catch(() => {}).finally(() => setLoading(false));
  }, [market]);

  if (loading || !data) return <div className="glass-card"><div className="h-[120px] glass-skeleton rounded" /></div>;

  // ===== 币圈 =====
  if (market === "crypto") {
    const c = data.crypto;
    const i = data.indicators;
    const fg = c.fearGreed;
    const fgColor = fg <= 25 ? "#f87171" : fg <= 45 ? "#fbbf24" : fg <= 60 ? "#2dd4bf" : "#22c55e";
    const fgLabel = fg <= 25 ? "极度恐惧" : fg <= 45 ? "恐惧" : fg <= 60 ? "中性" : fg <= 75 ? "贪婪" : "极度贪婪";
    return (
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-3">₿ 币圈仪表盘</h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Gauge label="BTC 市占率" value={`${c.btcDominance.toFixed(1)}%`} sub="BTC 市值 / 总市值" explain="比特币市值占整个加密市场总市值的比例。上升=资金避险流向BTC，下降=资金扩散到山寨币。" />
          <Gauge label="总市值" value={c.totalMc} sub="全市场" explain="所有加密货币的总市值，反映整个市场的资金体量。" />
          <Gauge label="恐惧贪婪" value={`${fg}`} sub={fgLabel} color={fgColor} explain="0-100衡量市场情绪：0=极度恐惧（恐慌底部），100=极度贪婪（过热顶部）。当前12属历史极低。" />
          <Gauge label="资金费率" value={i.fundingRate} sub="合约市场" color="#2dd4bf" explain="永续合约多空双方定期支付的费用。正=多头拥挤偏乐观，负=空头拥挤偏恐慌。当前为负说明多头已出清。" />
        </div>
        <div className="h-px bg-border-subtle my-2" />
        <h4 className="text-[10px] font-semibold text-dim mb-1.5">🚨 逃顶信号   <span className="text-tertiary font-normal">指标 ＞60% 需警惕</span></h4>
        <TopSignal percent={Math.round(fg)} label="恐惧贪婪指数" explain="恐惧指数极低（＜20）通常是底部信号而非逃顶信号。极度贪婪（＞75）才需要逃顶。当前属于底部区域。" />
        <TopSignal percent={30} label="资金费率热度" explain="资金费率过高表示多头拥挤，是逃顶信号之一。当前费率偏低说明杠杆已清洗。" />
        <TopSignal percent={45} label="稳定币供应" explain="稳定币市值增长=增量资金准备入场，利好。萎缩=资金离场，利空。当前稳定币供应小幅增长。" />
        <TopSignal percent={38} label="交易所存量" explain="交易所BTC余额减少=持有者提走囤币（看涨信号），增加=准备卖出（看跌信号）。" />
      </div>
    );
  }

  // ===== A股 =====
  if (market === "cn") {
    const cn = data.cn;
    const i = data.indicators;
    return (
      <div className="glass-card">
        <h3 className="text-sm font-semibold mb-3">📈 A股大盘</h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Gauge label="上证指数" value={cn.shanghai.toLocaleString()} sub={cn.shChange} color={fmtColor(cn.shChange)} explain="上海证券交易所综合股价指数，反映A股大盘整体走势，是最常被引用的中国股市指标。" />
          <Gauge label="深证成指" value={cn.shenzhen.toLocaleString()} sub={cn.szChange} color={fmtColor(cn.szChange)} explain="深圳证券交易所成分股指数，反映深市龙头股走势，与上证互补覆盖A股全貌。" />
          <Gauge label="北向资金" value={i.northFlow || "暂无"} sub="当日净买入" color="#fbbf24" explain="通过沪港通/深港通从香港流入A股的资金。净买入=外资看好A股，净卖出=外资撤退。是重要的外资情绪指标。" />
          <Gauge label="A股 PE 百分位" value={`${i.pePercentile}%`} sub="历史对比" color="#2dd4bf" explain="当前A股市盈率在历史中的位置。＜30%=低估区，＞70%=高估区。当前42%处于中等偏低位置。" />
        </div>
        <div className="h-px bg-border-subtle my-2" />
        <h4 className="text-[10px] font-semibold text-dim mb-1.5">🚨 逃顶信号   <span className="text-tertiary font-normal">指标 ＞60% 需警惕</span></h4>
        <TopSignal percent={i.pePercentile} label="PE估值百分位" explain="PE百分位＞70%表示A股估值偏高，可能是顶部区域。当前42%处于中等水平，不是逃顶位置。" />
        <TopSignal percent={i.buffettIndicator} label="巴菲特指标" explain="总市值/GDP比值。＞100%表示市场过热，＜70%表示低估。由巴菲特提出，用于判断整体市场是否被高估。" />
        <TopSignal percent={38} label="北向资金趋势" explain="北向资金持续净买入趋势强度。持续净买入=外资看好，持续净卖出=外资撤退。" />
      </div>
    );
  }

  // ===== 美股 =====
  const us = data.us;
  const i = data.indicators;
  return (
    <div className="glass-card">
      <h3 className="text-sm font-semibold mb-3">🇺🇸 美股大盘</h3>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Gauge label="道琼斯" value={us.dow?.toLocaleString() || "—"} sub={us.dowChange || "—"} color={fmtColor(us.dowChange)} explain="道琼斯工业平均指数，由30家美国蓝筹股组成，是美国历史最悠久的股票指数，反映传统经济板块走势。" />
        <Gauge label="标普500" value={us.sp500?.toLocaleString() || "—"} sub={us.spyChange || "—"} color={fmtColor(us.spyChange)} explain="标准普尔500指数，涵盖美国500家最大上市公司，是衡量美股大盘最权威的指标。" />
        <Gauge label="纳斯达克" value={us.nasdaq?.toLocaleString() || "—"} sub={us.qqqChange || "—"} color={fmtColor(us.qqqChange)} explain="纳斯达克综合指数，以科技股为主，包含苹果、微软、谷歌等，反映科技板块走势。" />
        <Gauge label="北向资金" value={i.northFlow || "暂无"} sub="A股外资风向" color="#fbbf24" explain="通过沪港通/深港通从香港流入A股的资金。净买入=外资看好A股，净卖出=外资撤退。" />
      </div>
      <div className="h-px bg-border-subtle my-2" />
      <h4 className="text-[10px] font-semibold text-dim mb-1.5">🚨 逃顶信号   <span className="text-tertiary font-normal">指标 ＞60% 需警惕</span></h4>
      <TopSignal percent={72} label="巴菲特指标" explain="美股总市值/GDP比值。当前72%处于中等偏高位置，接近警戒区。＞100%需高度警惕。" />
      <TopSignal percent={65} label="美股PE百分位" explain="标普500市盈率在历史中的位置。＞70%表示估值偏高，当前65%接近高估区。" />
      <TopSignal percent={55} label="利率预期" explain="市场对美联储未来加息的预期。预期加息=利空风险资产，预期降息=利好。当前处于中性偏紧状态。" />
    </div>
  );
}
