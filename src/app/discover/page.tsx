"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/* ===== 类型定义 ===== */
interface SourceItem {
  id: string;
  name: string;
  url: string;
  type: string;
  category: string;
  icon: string;
  lang: string;
  tier: 1 | 2 | 3;
  interval: number;
  aiTranslate: boolean;
  aiPriority: string;
  active: boolean;
  enabled: boolean;
  description?: string;
}

const CATEGORIES = [
  { id: "ai", name: "AI·大模型", icon: "🤖" },
  { id: "tech", name: "科技", icon: "📱" },
  { id: "funding", name: "投融资", icon: "💰" },
  { id: "crypto", name: "币圈", icon: "₿" },
  { id: "cn", name: "A股", icon: "📈" },
  { id: "us", name: "美股", icon: "🇺🇸" },
];

const TIER_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "核心", color: "#7c5cfc" },
  2: { label: "扩展", color: "#2dd4bf" },
  3: { label: "长尾", color: "rgba(255,255,255,0.3)" },
};

/* ===== 分类：紧凑卡片网格 ===== */
function CategoryCard({
  cat,
  sources,
  onToggle,
  onBatch,
}: {
  cat: { id: string; name: string; icon: string };
  sources: SourceItem[];
  onToggle: (id: string) => void;
  onBatch: (ids: string[], enabled: boolean) => void;
}) {
  const enabled = sources.filter((s) => s.enabled).length;
  const allOn = sources.every((s) => s.enabled);
  const allOff = sources.every((s) => !s.enabled);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{cat.icon}</span>
          <h3 className="text-sm font-bold">{cat.name}</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(124,92,252,0.1)", color: "#a78bfa" }}
          >
            {enabled}/{sources.length}
          </span>
        </div>
        <div className="flex gap-1.5">
          {!allOn && (
            <button onClick={() => onBatch(sources.map((s) => s.id), true)}
              className="text-[10px] px-2 py-1 rounded-lg transition-all cursor-pointer"
              style={{ background: "rgba(45,212,191,0.08)", color: "#2dd4bf" }}
            >
              全开
            </button>
          )}
          {!allOff && (
            <button onClick={() => onBatch(sources.map((s) => s.id), false)}
              className="text-[10px] px-2 py-1 rounded-lg transition-all cursor-pointer"
              style={{ background: "rgba(239,68,68,0.08)", color: "#f87171" }}
            >
              全关
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {sources.map((source) => (
          <div key={source.id}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all cursor-pointer"
            onClick={() => onToggle(source.id)}
            style={{
              background: source.enabled ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)",
              border: "1px solid",
              borderColor: source.enabled ? "rgba(124,92,252,0.12)" : "rgba(255,255,255,0.04)",
              opacity: source.enabled ? 1 : 0.5,
            }}
          >
            <span className="text-lg flex-shrink-0">{source.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium truncate">{source.name}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[9px] px-1 py-[0.5px] rounded-sm font-medium"
                  style={{ background: TIER_LABELS[source.tier].color + "18", color: TIER_LABELS[source.tier].color }}
                >
                  {TIER_LABELS[source.tier].label}
                </span>
                <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                  {source.interval < 60 ? `${source.interval}min` : `${source.interval / 60}h`}
                </span>
                {source.lang === "en" && source.aiTranslate && (
                  <span className="text-[8px] px-1 py-[0.5px] rounded-sm"
                    style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}
                  >
                    译
                  </span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 w-4 h-4 rounded-full transition-all"
              style={{
                background: source.enabled ? "#7c5cfc" : "rgba(255,255,255,0.08)",
                border: source.enabled ? "3px solid #a78bfa" : "2px solid rgba(255,255,255,0.12)",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ===== 主页面 ===== */
export default function DiscoverPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<number | null>(null);
  const [rescoring, setRescoring] = useState(false);
  const [rescoreMsg, setRescoreMsg] = useState("");

  // 加载信息源
  const loadSources = useCallback(async () => {
    try {
      const res = await fetch("/api/sources");
      const data = await res.json();
      setSources(data.sources || []);
    } catch (e) {
      console.error("Failed to load sources", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSources(); }, [loadSources]);

  // 切换单个源
  const handleToggle = async (sourceId: string) => {
    try {
      const res = await fetch("/api/sources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", sourceId }),
      });
      const data = await res.json();
      if (data.success) {
        setSources((prev) =>
          prev.map((s) => (s.id === sourceId ? { ...s, enabled: data.enabled } : s))
        );
      }
    } catch (e) {
      console.error("Toggle failed", e);
    }
  };

  // 批量开关
  const handleBatch = async (sourceIds: string[], enabled: boolean) => {
    try {
      await fetch("/api/sources", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "batch", sourceIds, enabled }),
      });
      setSources((prev) =>
        prev.map((s) => (sourceIds.includes(s.id) ? { ...s, enabled } : s))
      );
    } catch (e) {
      console.error("Batch toggle failed", e);
    }
  };

  // 重新评分
  const handleRescore = async () => {
    setRescoring(true);
    setRescoreMsg("评分计算中...");
    try {
      const res = await fetch("/api/rescore", { method: "POST" });
      const data = await res.json();
      setRescoreMsg(data.message || "✅ 完成");
      setTimeout(() => setRescoreMsg(""), 3000);
    } catch {
      setRescoreMsg("❌ 失败");
      setTimeout(() => setRescoreMsg(""), 3000);
    } finally {
      setRescoring(false);
    }
  };

  // 过滤
  const filtered = sources.filter((s) => {
    if (search) {
      const q = search.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !(s.description || "").toLowerCase().includes(q)) {
        return false;
      }
    }
    if (tierFilter !== null && s.tier !== tierFilter) return false;
    return true;
  });

  // 按分类分组
  const grouped = CATEGORIES.map((cat) => ({
    cat,
    sources: filtered.filter((s) => s.category === cat.id),
  })).filter((g) => g.sources.length > 0);

  const enabledCount = sources.filter((s) => s.enabled).length;
  const totalCount = sources.length;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {/* Header */}
      <header className="h-16 flex items-center px-8 border-b shrink-0 gap-3"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(8,12,26,0.4)", backdropFilter: "blur(16px)" }}
      >
        <h1 className="text-lg font-bold">🔍 发现</h1>
        <div className="flex items-center gap-2 ml-auto px-4 py-2 rounded-xl border max-w-xs w-full"
          style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
        >
          <span className="text-sm">🔍</span>
          <input
            type="text"
            placeholder="搜索信息源..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm bg-transparent border-none outline-none w-full text-white"
            style={{ color: "rgba(255,255,255,0.8)" }}
          />
        </div>
        <button
          onClick={handleRescore}
          disabled={rescoring}
          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer disabled:opacity-40"
          style={{ background: "rgba(124,92,252,0.1)", color: "#a78bfa", border: "1px solid rgba(124,92,252,0.15)" }}
        >
          {rescoring ? "⏳ 评分中..." : rescoreMsg || "📊 重新评分"}
        </button>
      </header>

      <div className="px-8 py-6 max-w-[1200px] mx-auto w-full">
        {/* 统计概览 */}
        <div className="flex items-center gap-4 mb-6 text-xs">
          <span style={{ color: "rgba(255,255,255,0.4)" }}>
            信息源 <strong className="text-dim">{enabledCount}</strong> / {totalCount} 已启用
          </span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
          {[1, 2, 3].map((tier) => {
            const count = sources.filter((s) => s.tier === tier && s.enabled).length;
            const total = sources.filter((s) => s.tier === tier).length;
            return (
              <button key={tier}
                onClick={() => setTierFilter(tierFilter === tier ? null : tier)}
                className="px-2 py-0.5 rounded-md transition-all cursor-pointer"
                style={{
                  background: tierFilter === tier ? "rgba(124,92,252,0.12)" : "transparent",
                  color: tierFilter === tier ? "#a78bfa" : TIER_LABELS[tier].color,
                }}
              >
                {TIER_LABELS[tier].label} {count}/{total}
              </button>
            );
          })}
          {tierFilter !== null && (
            <button onClick={() => setTierFilter(null)}
              className="text-xs px-2 py-0.5 rounded-md cursor-pointer"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              清除筛选 ✕
            </button>
          )}
        </div>

        {/* 加载态 */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "rgba(124,92,252,0.3)", borderTopColor: "#7c5cfc" }}
            />
          </div>
        )}

        {/* 信息源列表（按分类） */}
        {!loading && (
          <div className="flex flex-col gap-8 mb-10">
            {grouped.map(({ cat, sources: catSources }) => (
              <CategoryCard key={cat.id} cat={cat} sources={catSources} onToggle={handleToggle} onBatch={handleBatch} />
            ))}
          </div>
        )}

        {/* 工具推荐 — 紧凑 */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.04)" }} />
            <span className="text-xs font-semibold tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>
              🛠 工具
            </span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.04)" }} />
          </div>
          <Link href="/tools"
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span className="text-xl">📡</span>
            <span className="text-xs font-medium">RSS Everything</span>
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>— 网页转 RSS</span>
            <span className="ml-auto text-xs" style={{ color: "rgba(124,92,252,0.6)" }}>使用 →</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
