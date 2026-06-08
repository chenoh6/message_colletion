"use client";

import Link from "next/link";

export function TopBar() {
  return (
    <header className="h-14 flex items-center gap-4 px-6 shrink-0 z-10 border-b"
      style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(8,12,26,0.3)", backdropFilter: "blur(16px)" }}
    >
      {/* Status - subtle */}
      <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
        <span className="relative flex w-1.5 h-1.5">
          <span className="animate-ping absolute inline-flex w-full h-full rounded-full opacity-60" style={{ background: "#2dd4bf" }} />
          <span className="relative inline-flex w-1.5 h-1.5 rounded-full" style={{ background: "#2dd4bf" }} />
        </span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xs flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: "rgba(255,255,255,0.05)",
          color: "rgba(255,255,255,0.2)",
        }}
      >
        <span className="text-xs">🔍</span>
        <span className="text-xs">搜索话题、来源...</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <Link
          href="/discover"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all flex items-center gap-1"
          style={{ background: "linear-gradient(135deg, #7c5cfc, #a78bfa)" }}
        >
          ✚ 订阅
        </Link>
      </div>
    </header>
  );
}
