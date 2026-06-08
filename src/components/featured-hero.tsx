"use client";

import Link from "next/link";
import type { Entry } from "@/lib/data";

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}

export function FeaturedHero({ entry }: { entry: Entry }) {
  return (
    <Link href={`/reading/${entry.id}`}>
      <div className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-2px]"
        style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px) saturate(180%)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Cover */}
        <div className={`h-[220px] flex items-end p-6 relative overflow-hidden bg-gradient-to-br ${entry.coverGradient}`}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,12,26,0.9) 0%, rgba(8,12,26,0.2) 60%, transparent 100%)" }} />
          <span className="absolute right-6 top-6 text-6xl opacity-15">{entry.coverEmoji}</span>
          <div className="relative z-10">
            {entry.badge && (
              <span
                className="inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide mb-3"
                style={{
                  background: entry.badge.type === "hot" ? "rgba(239,68,68,0.2)" : entry.badge.type === "exclusive" ? "rgba(251,191,36,0.15)" : "rgba(45,212,191,0.15)",
                  color: entry.badge.type === "hot" ? "#fca5a5" : entry.badge.type === "exclusive" ? "#fcd34d" : "#5eead4",
                  border: `1px solid ${entry.badge.type === "hot" ? "rgba(239,68,68,0.15)" : entry.badge.type === "exclusive" ? "rgba(251,191,36,0.12)" : "rgba(45,212,191,0.12)"}`,
                }}
              >
                {entry.badge.label}
              </span>
            )}
            <h2 className="text-[22px] font-bold leading-tight text-white mb-2">{entry.title}</h2>
            <div className="flex items-center gap-2.5 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              <span style={{ color: "#c4b5fd", fontWeight: 500 }}>{entry.source}</span>
              <span>·</span>
              <span>{entry.time}</span>
              {entry.readingTime && <span style={{ color: "rgba(255,255,255,0.35)" }}>☕ {entry.readingTime}</span>}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            <strong style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>AI 导读：</strong>
            {entry.aiSummary || entry.summary}
          </p>
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {entry.tags.map((tag) => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-6 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
          <button className="flex items-center gap-1.5 text-sm px-2 py-1 rounded-lg transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}
            onClick={(e) => { e.preventDefault(); }}>
            👍 <span className="text-xs font-medium">{formatCount(entry.likes)}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm px-2 py-1 rounded-lg transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}
            onClick={(e) => { e.preventDefault(); }}>
            💬 <span className="text-xs font-medium">{formatCount(entry.comments)}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm px-2 py-1 rounded-lg transition-colors ml-auto" style={{ color: "rgba(255,255,255,0.35)" }}
            onClick={(e) => { e.preventDefault(); }}>
            ↗️ 分享
          </button>
        </div>
      </div>
    </Link>
  );
}
