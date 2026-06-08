"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TopBar } from "@/components/topbar";
import { TopicRow } from "@/components/topic-row";
import { TrendPanel } from "@/components/trend-panel";
import { TimelineView } from "@/components/timeline-view";
import { useEntries, useFetchStatus } from "@/lib/use-data";
import { TRENDS } from "@/lib/data";
import { getSourceColor } from "@/lib/crypto-data";
import { HighlightedText } from "@/components/term-highlight";
import { MarketDashboard } from "@/components/market-dashboard";
import type { Entry } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";

/* ---------- 市场切换 ---------- */
const MARKET_TABS = [
  { id: "all", label: "🔥 综合", icon: "🌐" },
  { id: "cn", label: "📈 A股", icon: "📊" },
  { id: "us", label: "🇺🇸 美股", icon: "🏛️" },
  { id: "crypto", label: "₿ 币圈", icon: "₿" },
];

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
              {entry.readingTime && <><span>·</span><span>☕ {entry.readingTime}</span></>}
            </div>
            <button onClick={onClose} className="text-sm" style={{ color: "rgba(255,255,255,0.3)", background: "none", border: "none", font: "inherit", cursor: "pointer" }}>✕</button>
          </div>
          <h2 className="text-base font-bold leading-snug mb-3"><HighlightedText text={entry.titleCn || entry.title} /></h2>
          {contentSummary && <div className="text-xs leading-relaxed text-dim mb-4 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>{contentSummary}</div>}
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
          {entry.url && <div className="mt-3 pt-3 border-t border-border-subtle"><a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-xs inline-flex items-center gap-1 transition-all" style={{ color: "#a78bfa" }}>🔗 查看原文 →</a></div>}
          <div className="mt-4 text-center">
            <button onClick={onClose} className="text-xs px-5 py-2 rounded-lg font-medium transition-all cursor-pointer" style={{ background: "rgba(124,92,252,0.12)", color: "#a78bfa", border: "none" }}>知道了</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function HomePage() {
  const [market, setMarket] = useState("all");
  const { entries, loading, total } = useEntries({ limit: 50, pollInterval: 60000 });
  const { totalEntries } = useFetchStatus();
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [decodingId, setDecodingId] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    try { const raw = localStorage.getItem("crypto_saved_ids"); if (raw) setSavedCount(JSON.parse(raw).length); } catch {}
  }, []);

  // 按市场过滤
  const filtered = market === "all" ? entries : entries.filter(e => e.category === market);

  const handleDecode = async (entry: Entry) => {
    setDecodingId(entry.id);
    try {
      const key = localStorage.getItem("user_api_key");
      const model = localStorage.getItem("user_api_model") || "deepseek-v4-flash";
      const params = new URLSearchParams({ id: entry.id });
      if (key) params.set("key", key);
      params.set("model", model);
      await fetch(`/api/decode?${params}`);
      window.location.reload();
    } catch (e) { console.error("Decode failed", e); } finally { setDecodingId(null); }
  };

  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-y-auto scrollbar-thin px-8 py-6 pb-8 container-page">
        <div className="mb-4">
          <div className="text-[10px] text-dim tracking-wider mb-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            AI 驱动 · 信息聚合 · 涵盖 A股/美股/币圈
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">☀️ 早上好，探索 <span className="gradient-text">今日市场</span></h1>
              <p className="text-xs mt-1 text-dim">切换市场查看对应信息 · 点击事件查看 AI 解码</p>
            </div>
            <div className="flex gap-5 text-xs text-tertiary">
              <span>📥 总计 <strong className="text-dim">{totalEntries || total || 0}</strong> 条</span>
            </div>
          </div>
        </div>

        {/* 市场切换 */}
        <div className="flex gap-1.5 mb-4">
          {MARKET_TABS.map((tab) => (
            <button key={tab.id} onClick={() => setMarket(tab.id)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
              style={{
                background: market === tab.id ? "rgba(124,92,252,0.15)" : "rgba(255,255,255,0.04)",
                color: market === tab.id ? "#c4b5fd" : "var(--text-dim)",
                border: market === tab.id ? "1px solid rgba(124,92,252,0.2)" : "1px solid transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 收藏提醒 */}
        {savedCount > 0 && (
          <div className="mb-3">
            <Link href="/library" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all"
              style={{ background: "rgba(124,92,252,0.06)", border: "1px solid rgba(124,92,252,0.1)", color: "var(--text-dim)" }}>
              📌 你收藏了 <strong className="text-accent-foreground">{savedCount} 篇</strong> 还没读 → 去收藏夹
            </Link>
          </div>
        )}

        <div className="mb-4"><TopicRow /></div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(124,92,252,0.3)", borderTopColor: "#7c5cfc" }} />
              <p className="text-sm text-dim">正在获取最新内容...</p>
            </div>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
            <div className="flex flex-col gap-2.5">
              {filtered.length > 0 ? (
                <TimelineView entries={filtered} onOpen={setSelectedEntry} onDecode={handleDecode} decodingId={decodingId} />
              ) : (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <p className="text-sm text-dim">
                    {market === "all" ? "内容采集中" : market === "cn" ? "A股数据采集中" : market === "us" ? "美股数据采集中" : "币圈数据采集中"}
                  </p>
                  <p className="text-xs mt-1 text-tertiary">请在「发现」页管理信息源，或点击右侧手动触发抓取</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <div className="sticky top-6 flex flex-col gap-4">
                <MarketDashboard market={market === "all" ? "crypto" : market as "crypto" | "cn" | "us"} />
                <TrendPanel trends={TRENDS} />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 mt-6 pt-3 text-xs text-subtle border-t border-border-subtle">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            数据就绪 · {totalEntries || total || 0} 条内容
          </span>
          <span>•</span>
          <span>数据源: 27 个活跃</span>
        </div>
      </div>
      <DecodeDialog entry={selectedEntry} open={!!selectedEntry} onClose={() => setSelectedEntry(null)} />
    </>
  );
}
