"use client";

import Link from "next/link";
import { TOPICS, FEED_ENTRIES } from "@/lib/data";
import { CRYPTO_CATEGORIES } from "@/lib/crypto-data";

const HOT_SOURCES = [
  { name: "机器之心", desc: "AI 科技媒体", icon: "🤖", followers: "2.3w" },
  { name: "36氪", desc: "商业科技媒体", icon: "📡", followers: "1.8w" },
  { name: "少数派", desc: "效率和数字生活", icon: "✍️", followers: "1.5w" },
  { name: "开源中国", desc: "开源技术社区", icon: "📦", followers: "1.2w" },
  { name: "TechCrunch", desc: "国际科技媒体", icon: "🌐", followers: "9.8k" },
  { name: "Google Blog", desc: "Google 官方", icon: "🧠", followers: "8.6k" },
];

export default function DiscoverPage() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {/* Header */}
      <header className="h-16 flex items-center px-8 border-b shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(8,12,26,0.4)", backdropFilter: "blur(16px)" }}
      >
        <h1 className="text-lg font-bold">🔍 发现</h1>
        <div className="flex items-center gap-2 ml-auto px-4 py-2 rounded-xl border max-w-xs w-full"
          style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}
        >
          <span className="text-sm">🔍</span>
          <span className="text-sm">搜索话题、来源...</span>
        </div>
      </header>

      <div className="px-8 py-6 max-w-[1200px] mx-auto w-full">
        {/* Topics */}
        <section className="mb-10">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">🏷️ 热门话题</h2>
          <div className="flex gap-2 flex-wrap">
            {TOPICS.map((t) => (
              <button key={t.name}
                className="px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer"
                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)" }}
              >
                {t.name}
                <span className="ml-1.5 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{t.count}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Hot Sources */}
        <section className="mb-10">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">📡 热门信息源</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {HOT_SOURCES.map((source) => (
              <div key={source.name}
                className="glass rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 hover:translate-y-[-2px]"
              >
                <span className="text-3xl">{source.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{source.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{source.desc}</div>
                  <div className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>{source.followers} 关注</div>
                </div>
                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                  style={{ background: "linear-gradient(135deg, #7c5cfc, #a78bfa)" }}>
                  + 关注
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 币圈信息源 */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.04)" }} />
            <span className="text-xs font-semibold tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>₿ 币圈信息源</span>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.04)" }} />
          </div>
          {CRYPTO_CATEGORIES.map((cat) => (
            <div key={cat.title} className="mb-6">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-lg">{cat.icon}</span>
                <h3 className="text-sm font-bold">{cat.title}</h3>
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{cat.items.length} 个</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                {cat.items.map((source) => (
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
        </section>

        {/* Trending now */}
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
