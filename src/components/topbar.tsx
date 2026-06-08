"use client";

import { useState } from "react";
import Link from "next/link";

export function TopBar() {
  const [showHint, setShowHint] = useState(false);

  return (
    <header className="h-16 flex items-center gap-4 px-8 shrink-0 z-10 border-b"
      style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(8,12,26,0.4)", backdropFilter: "blur(16px)" }}
    >
      {/* Status indicator */}
      <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}
        onMouseEnter={() => setShowHint(true)}
        onMouseLeave={() => setShowHint(false)}
      >
        <span className="relative flex w-2 h-2">
          <span className="animate-ping absolute inline-flex w-full h-full rounded-full opacity-75" style={{ background: "#2dd4bf" }} />
          <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: "#2dd4bf" }} />
        </span>
        <span className="hidden sm:inline">自动采集中</span>
        {showHint && (
          <div className="absolute top-12 left-8 glass px-3 py-2 rounded-lg text-xs whitespace-nowrap z-20" style={{ background: "rgba(8,12,26,0.95)" }}>
            服务启动时自动采集，后台每 30 秒检查新内容
          </div>
        )}
      </div>

      {/* Nav pills */}
      <div className="flex gap-0.5 p-0.5 rounded-lg border ml-4"
        style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.06)" }}
      >
        {["为你推荐", "关注", "热门", "最新"].map((label) => (
          <button
            key={label}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              label === "为你推荐"
                ? "text-[#c4b5fd]" : "text-[rgba(255,255,255,0.35)] hover:text-[rgba(255,255,255,0.6)]"
            }`}
            style={label === "为你推荐" ? { background: "rgba(124,92,252,0.15)" } : {}}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex-1 max-w-sm flex items-center gap-2 px-4 py-2 rounded-xl border transition-all"
        style={{
          background: "rgba(255,255,255,0.05)",
          borderColor: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        <span className="text-sm">🔍</span>
        <span className="text-sm">搜索话题、来源、文章...</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <Link
          href="/discover"
          className="px-4 py-1.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center gap-1.5"
          style={{ background: "linear-gradient(135deg, #7c5cfc, #a78bfa)" }}
        >
          ✚ 订阅话题
        </Link>
      </div>
    </header>
  );
}
