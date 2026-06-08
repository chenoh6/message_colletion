"use client";

import Link from "next/link";
import type { Entry } from "@/lib/data";

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}

export function FeedGrid({ entries }: { entries: Entry[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {entries.map((entry, i) => (
        <Link key={entry.id} href={`/reading/${entry.id}`}
          className="glass rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-3px]"
          style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(18px) saturate(180%)", border: "1px solid rgba(255,255,255,0.06)", animation: `fadeInUp 0.5s ease ${0.05 * (i + 1)}s both` }}
        >
          <div className={`h-[90px] flex items-end justify-end p-3 bg-gradient-to-br ${entry.coverGradient}`}>
            <span className="text-3xl opacity-20">{entry.coverEmoji}</span>
          </div>
          <div className="p-4 pb-3">
            <h3 className="text-sm font-semibold leading-snug mb-1.5 line-clamp-2">{entry.title}</h3>
            <div className="flex gap-2 text-[11px] mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
              <span style={{ color: "#7c5cfc", fontWeight: 500 }}>{entry.source}</span>
              <span>·</span>
              <span>{entry.time}</span>
            </div>
            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "rgba(255,255,255,0.45)" }}>
              {entry.summary}
            </p>
          </div>
          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex gap-3 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
              <span>👍 {formatCount(entry.likes)}</span>
              <span>💬 {formatCount(entry.comments)}</span>
            </div>
            <button className="text-base transition-colors" style={{ color: "rgba(255,255,255,0.25)" }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              ☆
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
}
