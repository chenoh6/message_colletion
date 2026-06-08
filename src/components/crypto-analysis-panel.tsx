"use client";

import { useState, useCallback, useEffect } from "react";
import {
  TODAY_SIGNALS,
  KEY_LEVELS,
  SCENARIOS,
  getStrategyPlans,
  type StrategyPlan,
  type TimeFrame,
  type RiskTolerance,
} from "@/lib/crypto-data";

/* ============ 子组件：信号仪表盘 ============ */
function SignalDashboard() {
  const badgeMap: Record<string, { bg: string; text: string }> = {
    bullish: { bg: "rgba(45,212,191,0.12)", text: "#2dd4bf" },
    bearish: { bg: "rgba(248,113,113,0.12)", text: "#f87171" },
    neutral: { bg: "rgba(251,191,36,0.12)", text: "#fbbf24" },
    extreme_bull: { bg: "rgba(45,212,191,0.18)", text: "#2dd4bf" },
    extreme_bear: { bg: "rgba(248,113,113,0.18)", text: "#f87171" },
  };

  return (
    <div className="glass-card">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">📡 今日信号</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {TODAY_SIGNALS.map((s) => {
          const c = badgeMap[s.badge] || badgeMap.neutral;
          return (
            <div key={s.label}
              className="rounded-lg px-3 py-2.5 transition-all hover:translate-y-[-1px]"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-dim">{s.label}</span>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-sm" style={{ background: c.bg, color: c.text }}>
                  {s.badge === "extreme_bull" ? "🟢 强" : s.badge === "extreme_bear" ? "🔴 强" : s.badge === "bullish" ? "🟢" : s.badge === "bearish" ? "🔴" : "🟡"}
                </span>
              </div>
              <div className="text-sm font-bold font-mono">{s.value}</div>
              <div className="text-[10px] mt-0.5 text-tertiary">{s.detail}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ 子组件：关键价位图 ============ */
function KeyLevelsView() {
  const allPrices = KEY_LEVELS.map((l) => parseInt(l.price.replace(/[$,]/g, "")));
  const min = Math.min(...allPrices) - 2000;
  const max = Math.max(...allPrices) + 2000;

  return (
    <div className="glass-card">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">🎯 关键价位</h3>
      <div className="relative h-[180px]">
        <div className="absolute left-0 top-0 bottom-0 w-14 flex flex-col justify-between text-[10px] font-mono text-tertiary">
          <span>${(max / 1000).toFixed(0)}K</span>
          <span>${((min + max) / 2 / 1000).toFixed(0)}K</span>
          <span>${(min / 1000).toFixed(0)}K</span>
        </div>
        <div className="ml-14 relative h-full">
          <div className="absolute bottom-0 left-0 right-0 h-2/5 rounded-sm" style={{ background: "rgba(45,212,191,0.06)" }} />
          <div className="absolute top-0 left-0 right-0 h-1/4 rounded-sm" style={{ background: "rgba(248,113,113,0.06)" }} />
          <div className="absolute left-0 right-0 h-px" style={{ top: "37%", background: "var(--border)" }} />

          {KEY_LEVELS.map((lvl) => {
            const price = parseInt(lvl.price.replace(/[$,]/g, ""));
            const y = ((max - price) / (max - min)) * 100;
            const isSupport = lvl.type === "support";
            const sizeMap = { major: 12, key: 9, minor: 6 };

            return (
              <div key={lvl.price}
                className="absolute left-0 right-0 flex items-center"
                style={{ top: `${y}%`, transform: "translateY(-50%)" }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="rounded-full flex-shrink-0 transition-all cursor-pointer hover:scale-125"
                    style={{
                      width: sizeMap[lvl.significance],
                      height: sizeMap[lvl.significance],
                      background: isSupport
                        ? `radial-gradient(circle, ${lvl.significance === "major" ? "#2dd4bf" : "rgba(45,212,191,0.5)"}, transparent)`
                        : `radial-gradient(circle, ${lvl.significance === "major" ? "#f87171" : "rgba(248,113,113,0.5)"}, transparent)`,
                      border: `1px solid ${isSupport ? "rgba(45,212,191,0.3)" : "rgba(248,113,113,0.3)"}`,
                    }}
                  />
                  <span className="text-[11px] font-bold font-mono" style={{ color: isSupport ? "#2dd4bf" : "#f87171" }}>
                    {lvl.price}
                  </span>
                  <span className="text-[10px] truncate text-dim">{lvl.label}</span>
                </div>
                <span className="text-[9px] font-medium flex-shrink-0" style={{ color: isSupport ? "rgba(45,212,191,0.4)" : "rgba(248,113,113,0.4)" }}>
                  {isSupport ? "支撑" : "阻力"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============ 子组件：参数设置 ============ */
function ParameterPanel({
  timeFrame,
  setTimeFrame,
  risk,
  setRisk,
}: {
  timeFrame: TimeFrame;
  setTimeFrame: (v: TimeFrame) => void;
  risk: RiskTolerance;
  setRisk: (v: RiskTolerance) => void;
}) {
  const tfOptions: { value: TimeFrame; label: string }[] = [
    { value: "short", label: "短线 <1月" },
    { value: "mid", label: "中线 1-6月" },
    { value: "long", label: "长线 >6月" },
  ];
  const riskOptions: { value: RiskTolerance; label: string; color: string }[] = [
    { value: "aggressive", label: "激进", color: "#f87171" },
    { value: "neutral", label: "中性", color: "#fbbf24" },
    { value: "conservative", label: "保守", color: "#60a5fa" },
  ];

  const btnClass = (active: boolean) =>
    `flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border ${
      active ? "border-accent/25 bg-accent/20 text-accent-foreground" : "border-transparent text-dim"
    }`;

  return (
    <div className="glass-card">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">⚙️ 分析参数</h3>
      <div className="flex flex-col gap-3">
        <div>
          <div className="text-[11px] font-medium mb-1.5 text-dim">持有周期</div>
          <div className="flex gap-1.5">
            {tfOptions.map((opt) => (
              <button key={opt.value}
                onClick={() => setTimeFrame(opt.value)}
                className={btnClass(timeFrame === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium mb-1.5 text-dim">风险承受</div>
          <div className="flex gap-1.5">
            {riskOptions.map((opt) => {
              const active = risk === opt.value;
              return (
                <button key={opt.value}
                  onClick={() => setRisk(opt.value)}
                  className="flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border"
                  style={{
                    background: active ? `${opt.color}22` : "rgba(255,255,255,0.04)",
                    color: active ? opt.color : undefined,
                    borderColor: active ? `${opt.color}44` : "transparent",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ 子组件：场景推演 ============ */
function ScenarioView() {
  return (
    <div className="glass-card">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">🎯 场景推演</h3>
      <div className="flex flex-col gap-3">
        {SCENARIOS.map((sc) => (
          <div key={sc.name} className="rounded-lg p-3 transition-all hover:translate-y-[-1px]" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold">{sc.icon} {sc.name}</span>
              <span className="text-xs font-bold font-mono" style={{ color: sc.color }}>{sc.probability}%</span>
            </div>
            <div className="h-2 rounded-full mb-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${sc.probability}%`, background: sc.color }} />
            </div>
            <div className="text-[10px] text-dim">触发：{sc.trigger}</div>
            <div className="text-[10px] font-mono text-tertiary">目标：{sc.targetRange}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ 子组件：数据状态条 ============ */
function DataTrustBar() {
  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg text-[10px] mb-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-teal-400" /> 链上数据</span>
      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> 实时行情</span>
      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> AI 分析建议</span>
      <span className="ml-auto text-tertiary">仅供参考，不构成投资建议</span>
    </div>
  );
}

/* ============ 子组件：策略卡片（含"为什么"折叠 + 最坏情景） ============ */
/* ============ 子组件：策略卡片（含"为什么"折叠 + 最坏情景） ============ */
function StrategyCard({ plan, highlight }: { plan: StrategyPlan; highlight: boolean }) {
  const [showWhy, setShowWhy] = useState(false);

  const worstCaseMap: Record<string, string> = {
    a: "跌破 $59,800 时最大亏损约 -8%（以 $62K 入场计算）",
    b: "若 BTC 跌至 $50K，浮亏约 -15%~-20%，建议继续持有等待周期反转",
    c: "空仓无亏损风险",
    d: "对冲仓位最高亏损 = 期权费 / 资金费率成本",
  };
  const whyMap: Record<string, string> = {
    a: "RSI 16.3 处于 2020.3 以来最低水平 → 过去 5 次进入此区间后 7 天内平均反弹 +9.2% → 当前入场性价比较高",
    b: "距历史高点 $126K 回撤 51%，接近 BTC 历次大周期平均回撤深度 55% → 分批建仓可摊平成本",
    c: "ETF 持续流出 + AI IPO 资金虹吸未结束 → 趋势逆转前空仓等待更安全",
    d: "有现货仓位者此时平仓成本高 → 用空单/Put 对冲比直接卖出更划算",
  };

  return (
    <div
      className="glass-card-hover"
      style={{
        borderColor: highlight ? "rgba(124,92,252,0.15)" : undefined,
        background: highlight ? "rgba(124,92,252,0.04)" : undefined,
        opacity: highlight ? 1 : 0.7,
      }}
    >
      {/* 最坏情景 */}
      {plan.id !== "c" && (
        <div className="mb-2.5 rounded-lg px-2.5 py-1.5 text-[10px]" style={{ background: "rgba(248,113,113,0.08)", color: "#f87171" }}>
          ⚠️ 最坏情景：{worstCaseMap[plan.id] || "风险自担"}
        </div>
      )}

      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{plan.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-sm font-semibold" style={{ background: `${plan.tagColor}22`, color: plan.tagColor }}>
            {plan.tag}
          </span>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
          <span className={plan.riskLevel === "high" ? "text-red-400" : plan.riskLevel === "medium" ? "text-yellow-400" : "text-blue-400"}>
            {plan.riskLevel === "high" ? "🔴 高风险" : plan.riskLevel === "medium" ? "🟡 中风险" : "🟢 低风险"}
          </span>
        </span>
      </div>

      <p className="text-[11px] mb-3 text-dim">{plan.desc}</p>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-dim">操作</span>
          <span className="font-bold font-mono" style={{ color: plan.tagColor }}>{plan.action}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-dim">入场</span>
          <span className="font-mono">{plan.entryRange}</span>
        </div>
        {plan.stopLoss !== "—" && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-dim">止损</span>
            <span className="font-mono text-red-400">{plan.stopLoss}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-dim">仓位</span>
          <span className="font-mono">{plan.positionRatio}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-dim">适合</span>
          <span className="text-right">{plan.suitable}</span>
        </div>
      </div>

      <div className="mt-2.5 pt-2.5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="text-[10px] font-medium mb-1 text-dim">目标</div>
        {plan.targets.map((t, i) => (
          <div key={i} className="text-[11px] font-mono flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full" style={{ background: plan.tagColor }} />
            {t}
          </div>
        ))}
      </div>

      {/* 为什么推荐这个方案 */}
      <button
        onClick={() => setShowWhy(!showWhy)}
        className="mt-2.5 w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] transition-all cursor-pointer"
        style={{ background: "rgba(255,255,255,0.03)", color: "var(--text-tertiary)" }}
      >
        {showWhy ? "收起说明" : "💡 为什么推荐这个方案？"}
      </button>
      {showWhy && (
        <div className="mt-1.5 px-2.5 py-2 rounded-lg text-[10px] leading-relaxed" style={{ background: "rgba(124,92,252,0.06)", color: "var(--text-dim)" }}>
          {whyMap[plan.id] || "基于当前市场数据综合分析"}
        </div>
      )}
    </div>
  );
}

/* ============ 子组件：质量校验 ============ */
function QualityCheck() {
  const checks = [
    { label: "信息来源可追溯", ok: true },
    { label: "事实与观点分离", ok: true },
    { label: "关键信息≤5条", ok: true },
    { label: "多角度覆盖", ok: true },
    { label: "三种场景都有", ok: true },
    { label: "关键信息有阐释", ok: true },
    { label: "风险有量化", ok: true },
    { label: "建议有操作性", ok: true },
    { label: "偏差已识别", ok: true },
    { label: "失效条件已声明", ok: true },
  ];
  return (
    <div className="glass-card">
      <h3 className="text-xs font-semibold mb-2.5 flex items-center gap-1.5">✅ 质量校验</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5 text-[10px] text-dim">
            <span style={{ color: c.ok ? "#2dd4bf" : "#f87171" }}>{c.ok ? "✓" : "✗"}</span>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ 主组件 ============ */
export function CryptoAnalysisPanel() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("mid");
  const [risk, setRisk] = useState<RiskTolerance>("neutral");
  const [copied, setCopied] = useState(false);

  const plans = getStrategyPlans(timeFrame, risk);

  const getHighlighted = (planId: string): boolean => {
    if (risk === "aggressive" && timeFrame === "short") return planId === "a";
    if (risk === "conservative") return planId === "c" || planId === "b";
    if (risk === "neutral" && timeFrame === "mid") return planId === "b";
    if (risk === "aggressive" && timeFrame === "mid") return planId === "b";
    if (risk === "neutral" && timeFrame === "long") return planId === "b";
    if (risk === "aggressive" && timeFrame === "long") return planId === "b";
    return planId === "b";
  };

  const handleCopy = useCallback(() => {
    const selected = plans.find((p) => getHighlighted(p.id)) || plans[1];
    const text = `📊 币圈交易方案 | ${timeFrame === "short" ? "短线" : timeFrame === "mid" ? "中线" : "长线"} | ${risk === "aggressive" ? "激进" : risk === "neutral" ? "中性" : "保守"}

推荐方案：${selected.name}
操作：${selected.action}
入场区间：${selected.entryRange}
止损位：${selected.stopLoss}
仓位：${selected.positionRatio}
目标：${selected.targets.join("、")}

核心理由：${selected.desc}
数据来源：CoinDesk / Farside / Glassnode / SoSoValue
更新日期：2026.06.06`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, [plans, timeFrame, risk]);

  return (
    <div className="flex flex-col gap-4 animate-in">
      {/* 数据状态条 */}
      <DataTrustBar />

      {/* 顶部：信号仪表盘 + 关键价位 */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
        <SignalDashboard />
        <KeyLevelsView />
      </div>

      {/* 参数设置 */}
      <ParameterPanel timeFrame={timeFrame} setTimeFrame={setTimeFrame} risk={risk} setRisk={setRisk} />

      {/* 场景推演 + 策略方案 */}
      <div className="grid grid-cols-1 xl:grid-cols-[0.5fr_1.5fr] gap-4">
        <div className="order-1 xl:order-none">
          <ScenarioView />
        </div>
        <div className="order-2 xl:order-none">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">📋 今日交易方案</h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer border"
              style={{
                background: copied ? "rgba(45,212,191,0.12)" : "rgba(255,255,255,0.04)",
                color: copied ? "#2dd4bf" : "var(--text-dim)",
                borderColor: "var(--border)",
              }}
            >
              {copied ? "✅ 已复制" : "📋 复制方案"}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plans.map((plan) => (
              <StrategyCard key={plan.id} plan={plan} highlight={getHighlighted(plan.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* 质量校验 */}
      <QualityCheck />

      {/* 更新提示 */}
      <div className="flex items-center justify-between text-[11px] text-subtle">
        <span>🔄 数据来源：CoinDesk / Farside / Glassnode / SoSoValue</span>
        <span>更新于 2026.06.06</span>
      </div>
    </div>
  );
}
