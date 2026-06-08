"use client";

import { useState } from "react";
import { TopBar } from "@/components/topbar";
import { TrendPanel } from "@/components/trend-panel";
import { TimelineView } from "@/components/timeline-view";
import { CardView } from "@/components/card-view";
import { useEntries, useFetchStatus } from "@/lib/use-data";
import { TRENDS } from "@/lib/data";
import { CATEGORIES } from "@/lib/sources";
import { getSourceColor } from "@/lib/crypto-data";
import { HighlightedText } from "@/components/term-highlight";
import { MarketDashboard } from "@/components/market-dashboard";
import type { Entry } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";

/* ---------- 话题行（为你推荐 + 分类） ---------- */
function TopicRow({ active, counts, onSelect }: {
  active: string;
  counts: Record<string, number>;
  onSelect: (id: string) => void;
}) {
  const items = [
    { id: "all", name: "✨ 为你推荐", icon: "" },
    ...CATEGORIES,
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin" style={{ scrollbarWidth: "none" }}>
      {items.map((item) => (
        <button key={item.id}
          onClick={() => onSelect(item.id)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border cursor-pointer"
          style={{
            background: active === item.id ? "rgba(124,92,252,0.15)" : "rgba(255,255,255,0.05)",
            borderColor: active === item.id ? "rgba(124,92,252,0.25)" : "rgba(255,255,255,0.06)",
            color: active === item.id ? "#c4b5fd" : "rgba(255,255,255,0.55)",
          }}
        >
          {item.icon} {item.name}
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            {counts[item.id] || 0}
          </span>
        </button>
      ))}
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

type ViewMode = "timeline" | "cards";

export default function HomePage() {
  const [topic, setTopic] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const { entries, loading, total } = useEntries({ limit: 50, pollInterval: 0, sortBy: "score" });
  const { totalEntries } = useFetchStatus();
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [decodingId, setDecodingId] = useState<string | null>(null);

  // 按话题过滤
  const filtered = topic === "all" ? entries : entries.filter(e => e.category === topic);

  // 分类计数（从真实数据统计）
  const topicCounts: Record<string, number> = { all: entries.length };
  for (const cat of CATEGORIES) {
    topicCounts[cat.id] = entries.filter((e) => e.category === cat.id).length;
  }

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
        <div className="mb-3 flex items-center gap-3">
          <TopicRow active={topic} counts={topicCounts} onSelect={setTopic} />
          {/* 视图切换 */}
          <div className="flex gap-0.5 p-0.5 rounded-lg border flex-shrink-0 ml-auto"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.06)" }}
          >
            <button
              onClick={() => setViewMode("timeline")}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer"
              style={{
                background: viewMode === "timeline" ? "rgba(124,92,252,0.15)" : "transparent",
                color: viewMode === "timeline" ? "#c4b5fd" : "rgba(255,255,255,0.3)",
              }}
              title="时间轴模式"
            >
              ⏱ 时间轴
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer"
              style={{
                background: viewMode === "cards" ? "rgba(124,92,252,0.15)" : "transparent",
                color: viewMode === "cards" ? "#c4b5fd" : "rgba(255,255,255,0.3)",
              }}
              title="信息源卡片模式"
            >
              📰 卡片
            </button>
          </div>
        </div>

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
            <div className="flex flex-col gap-2.5 min-w-0">
              {filtered.length > 0 ? (
                viewMode === "timeline" ? (
                  <TimelineView entries={filtered} onOpen={setSelectedEntry} onDecode={handleDecode} decodingId={decodingId} />
                ) : (
                  <CardView entries={filtered} onOpen={setSelectedEntry} />
                )
              ) : (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <p className="text-sm text-dim">
                    {topic === "all" ? "请先在「发现」页开启信息源" : `${topic} 数据采集中`}
                  </p>
                  <p className="text-xs mt-1 text-tertiary">开启信息源后，内容将自动出现在这里</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <div className="sticky top-6 flex flex-col gap-4">
                <MarketDashboard market={topic === "all" ? "crypto" : topic as "crypto" | "cn" | "us"} />
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
          <span>信息源: 可在「发现」页管理</span>
        </div>
      </div>
      <DecodeDialog entry={selectedEntry} open={!!selectedEntry} onClose={() => setSelectedEntry(null)} />
    </>
  );
}
