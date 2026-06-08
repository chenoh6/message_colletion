"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FEED_ENTRIES } from "@/lib/data";
import { CRYPTO_CATEGORIES } from "@/lib/crypto-data";

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

/* ===== 分类汇总卡片 ===== */
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
      <div className="flex flex-col gap-1.5">
        {sources.map((source) => (
          <div key={source.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
            style={{
              background: source.enabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
              opacity: source.enabled ? 1 : 0.45,
            }}
          >
            <span className="text-lg flex-shrink-0">{source.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium">{source.name}</span>
                <span className="text-[9px] px-1 py-[1px] rounded-sm font-medium"
                  style={{ background: TIER_LABELS[source.tier].color + "18", color: TIER_LABELS[source.tier].color }}
                >
                  {TIER_LABELS[source.tier].label}
                </span>
                {source.lang === "en" && source.aiTranslate && (
                  <span className="text-[9px] px-1 py-[1px] rounded-sm"
                    style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}
                  >
                    AI 翻译
                  </span>
                )}
              </div>
              {source.description && (
                <p className="text-[11px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {source.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                {source.interval < 60 ? `${source.interval}min` : `${source.interval / 60}h`}
              </span>
              <button
                onClick={() => onToggle(source.id)}
                className="relative w-9 h-5 rounded-full transition-all cursor-pointer"
                style={{
                  background: source.enabled ? "linear-gradient(135deg, #7c5cfc, #a78bfa)" : "rgba(255,255,255,0.1)",
                  border: "none",
                }}
              >
                <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ transform: source.enabled ? "translateX(16px)" : "translateX(0)" }}
                />
              </button>
            </div>
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

        {/* 币圈信息源（来自 crypto-data 的静态展示） */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.04)" }} />
            <span className="text-xs font-semibold tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>
              ₿ 币圈生态 — 外部资源
            </span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.04)" }} />
          </div>
          {CRYPTO_CATEGORIES.map((cat: any) => (
            <div key={cat.title} className="mb-6">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-lg">{cat.icon}</span>
                <h3 className="text-sm font-bold">{cat.title}</h3>
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{cat.items.length} 个</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                {cat.items.map((source: any) => (
                  <Link key={source.name}
                    href={source.url || "#"}
                    target={source.url ? "_blank" : undefined}
                    rel={source.url ? "noopener noreferrer" : undefined}
                    className="flex-shrink-0 glass rounded-xl p-3 flex items-center gap-3 transition-all hover:translate-y-[-2px]"
                  >
                    <span className="text-2xl">{source.icon}</span>
                    <div className="min-w-0 max-w-[160px]">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold whitespace-nowrap">{source.name}</span>
                        {source.recommend && (
                          <span className="text-[8px] px-1 py-0.5 rounded-full font-semibold whitespace-nowrap"
                            style={{ background: "linear-gradient(135deg, rgba(124,92,252,0.25), rgba(45,212,191,0.2))", color: "#c4b5fd" }}
                          >
                            推荐
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{source.desc}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[9px] px-1.5 py-[1px] rounded-sm font-medium"
                          style={{
                            background: source.type === "海外" ? "rgba(59,130,246,0.12)" :
                              source.type === "中文" ? "rgba(239,68,68,0.12)" :
                              source.type === "链上数据" ? "rgba(16,185,129,0.12)" :
                              source.type === "Newsletter" ? "rgba(245,158,11,0.12)" :
                              "rgba(168,85,247,0.12)",
                            color: source.type === "海外" ? "#60a5fa" :
                              source.type === "中文" ? "#f87171" :
                              source.type === "链上数据" ? "#34d399" :
                              source.type === "Newsletter" ? "#fbbf24" :
                              "#c084fc",
                          }}
                        >
                          {source.type}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 正在热议 */}
        <section>
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">🔥 正在热议</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {FEED_ENTRIES.slice(0, 3).map((entry, i) => (
              <Link key={entry.id} href={`/reading/${entry.id}`}
                className="glass rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-3px]"
              >
                <div className={`h-[100px] flex items-end justify-end p-4 bg-gradient-to-br ${entry.coverGradient}`}>
                  <span className="text-4xl opacity-20">{entry.coverEmoji}</span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold leading-snug mb-2">{entry.title}</h3>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                    <span style={{ color: "#7c5cfc", fontWeight: 500 }}>{entry.source}</span>
                    <span>·</span>
                    <span>{entry.time}</span>
                  </div>
                  <p className="text-xs mt-2 line-clamp-2" style={{ color: "rgba(255,255,255,0.45)" }}>{entry.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
