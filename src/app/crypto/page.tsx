"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HighlightedText } from "@/components/term-highlight";
import {
  MARKET_TICKER,
  MARKET_SENTIMENT,
  CRYPTO_TOTAL_MC,
  BTC_DOMINANCE,
  getSourceColor,
} from "@/lib/crypto-data";
import { CryptoAnalysisPanel } from "@/components/crypto-analysis-panel";
import { TimelineView } from "@/components/timeline-view";
import { PriceEventChart } from "@/components/price-event-chart";
import { MarketDashboard } from "@/components/market-dashboard";
import { useEntries } from "@/lib/use-data";
import type { Entry } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";

/* ---------- 产品标识 ---------- */
function ProductBanner() {
  return (
    <div className="text-[10px] text-dim tracking-wider mb-1 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
      AI 驱动 · 币圈信息聚合
    </div>
  );
}

/* ---------- 快照条 ---------- */
function MarketSnapshotBar() {
  return (
    <div className="glass-sm px-5 py-3 flex items-center gap-4 flex-wrap text-xs" style={{ borderColor: "rgba(124,92,252,0.08)" }}>
      <div className="flex items-center gap-1.5 font-semibold text-dim">
        BTC <span className="font-mono text-sm text-foreground">{MARKET_TICKER[0].value}</span>
        <span className="font-mono text-xs" style={{ color: MARKET_TICKER[0].up ? "#2dd4bf" : "#f87171" }}>{MARKET_TICKER[0].change}</span>
      </div>
      <span className="w-px h-4 bg-border" />
      <span>恐惧 <strong style={{ color: MARKET_SENTIMENT.color }}>{MARKET_SENTIMENT.value}</strong></span>
      <span className="w-px h-4 bg-border" />
      <span>ETF <strong className="text-red-400">-$48.8M</strong></span>
      <span className="w-px h-4 bg-border" />
      <span>RSI <strong className="text-teal-400">16.3</strong></span>
      <span className="w-px h-4 bg-border" />
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
        实时
      </span>
    </div>
  );
}

/* ---------- 过滤条 ---------- */
const CATEGORY_FILTERS = ["全部", "ETF", "宏观", "观点", "清算", "监管", "技术分析"];

function CategoryFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      {CATEGORY_FILTERS.map((cat) => {
        const active = value === cat;
        return (
          <button key={cat}
            onClick={() => onChange(cat)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer relative"
            style={{ background: active ? "rgba(124,92,252,0.12)" : "transparent", color: active ? "#c4b5fd" : "var(--text-dim)" }}
          >
            {cat}
            {active && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-accent" />}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- 解码弹窗 ---------- */
function DecodeDialog({ entry, open, onClose }: { entry: Entry | null; open: boolean; onClose: () => void }) {
  if (!entry) return null;
  const raw = entry.aiSummary || "";
  let contentSummary = entry.summary || "";
  let factText = "", judgmentText = "", actionText = "";

  const factIdx = raw.indexOf("🔍");
  const judgmentIdx = raw.indexOf("💡");
  const actionIdx = raw.indexOf("🧭");

  if (factIdx > -1) contentSummary = raw.slice(0, factIdx).replace(/解码分析[：:]\s*/g, "").trim();
  else contentSummary = raw || entry.summary || "";

  if (factIdx > -1 && judgmentIdx > -1) factText = raw.slice(factIdx, judgmentIdx).replace(/^🔍\s*事实[：:]\s*/g, "").trim();
  else if (factIdx > -1) factText = raw.slice(factIdx).replace(/^🔍\s*事实[：:]\s*/g, "").trim();

  if (judgmentIdx > -1 && actionIdx > -1) judgmentText = raw.slice(judgmentIdx, actionIdx).replace(/^💡\s*(判断|意义)[：:]\s*/g, "").trim();
  else if (judgmentIdx > -1) judgmentText = raw.slice(judgmentIdx).replace(/^💡\s*(判断|意义)[：:]\s*/g, "").trim();

  if (actionIdx > -1) actionText = raw.slice(actionIdx).replace(/^🧭\s*(行动|行动指引)[：:]\s*/g, "").trim();

  if (!factText) factText = "这条信息提供了关于 " + entry.source + " 的最新动态。";
  if (!judgmentText) judgmentText = "值得关注，但需要结合更多信息综合判断。";
  if (!actionText) actionText = "关注即可，无需立即操作。跟踪指标：行情变化 + 后续政策动向。";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogOverlay />
      <DialogContent className="max-w-[560px] max-h-[80vh] overflow-y-auto rounded-2xl p-0"
        style={{ background: "#0d1128", border: "1px solid rgba(255,255,255,0.08)" }}
        showCloseButton={false}
      >
        <div className="p-5 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-[10px] text-tertiary">
              <span style={{ color: getSourceColor(entry.source) }}>{entry.sourceIcon} {entry.source}</span>
              <span>·</span>
              <span>{entry.time}</span>
            </div>
            <button onClick={onClose} className="text-sm" style={{ color: "rgba(255,255,255,0.3)", background: "none", border: "none", font: "inherit", cursor: "pointer" }}>✕</button>
          </div>
          <h2 className="text-base font-bold leading-snug mb-3"><HighlightedText text={entry.titleCn || entry.title} /></h2>
          {contentSummary && (
            <div className="text-xs leading-relaxed text-dim mb-4 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>{contentSummary}</div>
          )}
          <div className="rounded-lg p-3 mb-2" style={{ background: "rgba(59,130,246,0.06)" }}>
            <div className="flex items-center gap-1.5 text-xs font-semibold mb-1" style={{ color: "#60a5fa" }}>🔍 事实还原</div>
            <p className="text-xs leading-relaxed text-dim">{factText}</p>
          </div>
          <div className="rounded-lg p-3 mb-2" style={{ background: "rgba(251,191,36,0.06)" }}>
            <div className="flex items-center gap-1.5 text-xs font-semibold mb-1" style={{ color: "#fbbf24" }}>💡 意义判断</div>
            <p className="text-xs leading-relaxed text-dim">{judgmentText}</p>
          </div>
          <div className="rounded-lg p-3 mb-2" style={{ background: "rgba(45,212,191,0.06)" }}>
            <div className="flex items-center gap-1.5 text-xs font-semibold mb-1" style={{ color: "#2dd4bf" }}>🧭 行动指引</div>
            <p className="text-xs leading-relaxed text-dim">{actionText}</p>
          </div>
          {entry.url && (
            <div className="mt-3 pt-3 border-t border-border-subtle">
              <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-xs inline-flex items-center gap-1 transition-all" style={{ color: "#a78bfa" }}>🔗 查看原文 →</a>
            </div>
          )}
          <div className="mt-4 text-center">
            <button onClick={onClose} className="text-xs px-5 py-2 rounded-lg font-medium transition-all cursor-pointer" style={{ background: "rgba(124,92,252,0.12)", color: "#a78bfa", border: "none" }}>知道了</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- 行情小部件 ---------- */
function MarketTicker() {
  return (
    <div className="glass-card">
      <h3 className="text-sm font-semibold mb-3">📈 实时行情</h3>
      <div className="space-y-2">
        {MARKET_TICKER.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="flex items-center gap-2">
              <span className="text-xs text-dim">{item.label}</span>
              <span className="text-sm font-bold font-mono">{item.value}</span>
            </div>
            <span className="text-xs font-bold font-mono" style={{ color: item.up ? "#2dd4bf" : "#f87171" }}>{item.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- 市场概览 ---------- */
function MarketOverview() {
  return (
    <div className="glass-card">
      <h3 className="text-sm font-semibold mb-3">🌐 市场概览</h3>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-dim">总市值</span>
          <span className="text-sm font-bold font-mono">{CRYPTO_TOTAL_MC}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-dim">BTC 市占率</span>
          <span className="text-sm font-bold font-mono">{BTC_DOMINANCE}</span>
        </div>
        <div className="h-px bg-border-subtle" />
        <div className="flex items-center justify-between">
          <span className="text-xs text-dim">情绪指数</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 rounded-full overflow-hidden bg-muted">
              <div className="h-full rounded-full transition-all" style={{ width: `${MARKET_SENTIMENT.value}%`, background: MARKET_SENTIMENT.color }} />
            </div>
            <span className="text-sm font-bold" style={{ color: MARKET_SENTIMENT.color }}>{MARKET_SENTIMENT.value} {MARKET_SENTIMENT.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ 主页面 ============================ */
const COINS = [
  { id: "btc", name: "BTC", icon: "₿" },
  { id: "eth", name: "ETH", icon: "⟠" },
  { id: "sol", name: "SOL", icon: "◎" },
];

export default function CryptoPage() {
  const [mode, setMode] = useState<"feed" | "analysis">("feed");
  const [coin, setCoin] = useState("btc");
  const [category, setCategory] = useState("全部");
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [decodingId, setDecodingId] = useState<string | null>(null);
  const { entries, loading, error, refresh } = useEntries({ category: "crypto", limit: 50, pollInterval: 60000 });
  const allEntries = entries;
  const filteredFeed = category === "全部" ? allEntries : allEntries.filter((e) => e.category === category || (!e.category && category === "crypto"));

  const handleDecode = async (entry: Entry) => {
    setDecodingId(entry.id);
    try {
      const key = localStorage.getItem("user_api_key");
      const model = localStorage.getItem("user_api_model") || "deepseek-v4-flash";
      const params = new URLSearchParams({ id: entry.id });
      if (key) params.set("key", key);
      params.set("model", model);
      await fetch(`/api/decode?${params}`);
      refresh();
    } catch (e) {
      console.error("Decode failed", e);
    } finally {
      setDecodingId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <header className="h-16 flex items-center px-8 border-b border-border shrink-0 gap-3"
        style={{ background: "rgba(8,12,26,0.4)", backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xl">₿</span>
          <h1 className="text-lg font-bold">{mode === "feed" ? "币圈" : "今日交易方案"}</h1>
        </div>
        <button onClick={() => setMode(mode === "feed" ? "analysis" : "feed")}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex-shrink-0"
          style={{
            background: mode === "analysis" ? "linear-gradient(135deg, rgba(124,92,252,0.2), rgba(45,212,191,0.12))" : "rgba(255,255,255,0.05)",
            color: mode === "analysis" ? "#c4b5fd" : "var(--text-dim)",
            border: mode === "analysis" ? "1px solid rgba(124,92,252,0.15)" : "1px solid var(--border)",
          }}
        >
          {mode === "feed" ? "📊 交易方案" : "📰 快讯"}
        </button>
        <Link href="/glossary" className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all flex-shrink-0"
          style={{ color: "var(--text-tertiary)", border: "1px solid var(--border)" }}
        >
          📖 术语
        </Link>
        <div className="flex gap-0.5 rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.04)" }}>
          {COINS.map((c) => (
            <button key={c.id} onClick={() => setCoin(c.id)}
              className="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer"
              style={{
                background: coin === c.id ? "rgba(124,92,252,0.2)" : "transparent",
                color: coin === c.id ? "#c4b5fd" : "var(--text-tertiary)",
              }}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 ml-auto text-xs text-tertiary">
          <span>总市值 <strong className="text-dim">{CRYPTO_TOTAL_MC}</strong></span>
          <span>·</span>
          <span>BTC 市占 <strong className="text-dim">{BTC_DOMINANCE}</strong></span>
          <span>·</span>
          <span className="flex items-center gap-1">情绪 <span style={{ color: MARKET_SENTIMENT.color, fontWeight: 600 }}>{MARKET_SENTIMENT.value}</span></span>
        </div>
      </header>

      <div className="px-8 py-6 container-page">
        {mode === "feed" ? (
          <>
            <ProductBanner />
            <div className="flex items-end justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">₿ 币圈 <span className="gradient-text">时间线</span></h1>
                <p className="text-xs mt-1 text-dim">按时间轴浏览 · 点击条目查看 AI 解码</p>
              </div>
              <div className="flex gap-5 text-xs text-tertiary">
                <span>📥 今日 <strong className="text-dim">{allEntries.length}</strong> 条</span>
              </div>
            </div>

            <div className="mb-4">
              <MarketSnapshotBar />
            </div>

            {/* 价格走势图 + 时间轴双栏 */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(124,92,252,0.3)", borderTopColor: "#7c5cfc" }} />
                  <p className="text-xs text-dim">正在获取币圈数据...</p>
                </div>
              </div>
            )}
            {error && (
              <div className="glass-card rounded-2xl p-8 text-center" style={{ borderColor: "rgba(248,113,113,0.15)" }}>
                <p className="text-sm text-red-400">数据获取失败</p>
                <p className="text-xs mt-1 text-dim">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
                <div className="flex flex-col gap-4">
                  {/* 价格走势图 */}
                  <PriceEventChart entries={filteredFeed} onEntryClick={setSelectedEntry} coin={coin} />

                  {/* 分类过滤 */}
                  <CategoryFilter value={category} onChange={setCategory} />

                  {/* 时间轴主体 */}
                  {filteredFeed.length > 0 ? (
                    <TimelineView entries={filteredFeed} onOpen={setSelectedEntry} onDecode={handleDecode} decodingId={decodingId} />
                  ) : (
                    <div className="glass-card rounded-2xl p-8 text-center">
                      <p className="text-sm text-dim">暂无币圈数据</p>
                      <p className="text-xs mt-1 text-tertiary">信息源正在抓取中，请稍后刷新...</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  <div className="sticky top-6 flex flex-col gap-4">
                    <MarketDashboard market="crypto" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mt-6 pt-3 text-xs text-subtle border-t border-border-subtle">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                数据实时更新
              </span>
              <span>·</span>
              <span>来源: CoinDesk / Farside / Glassnode / WuBlockchain</span>
            </div>
          </>
        ) : (
          <CryptoAnalysisPanel />
        )}
      </div>

      <DecodeDialog entry={selectedEntry} open={!!selectedEntry} onClose={() => setSelectedEntry(null)} />
    </div>
  );
}
