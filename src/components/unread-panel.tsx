"use client";

import Link from "next/link";
import type { Entry } from "@/lib/data";

export function UnreadPanel({ entries }: { entries: Entry[] }) {
  return (
    <div className="glass p-5 flex-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">⏳ 继续阅读</h3>
        <button className="text-xs py-1 px-2 rounded-lg transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}>
          全部 →
        </button>
      </div>
      <div className="flex flex-col gap-0.5">
        {entries.map((entry) => (
          <Link key={entry.id} href={`/reading/${entry.id}`}
            className="flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.04)]"
          >
            <span
              className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
              style={{
                background: entry.isRead === false ? "#7c5cfc" : "rgba(255,255,255,0.15)",
                boxShadow: entry.isRead === false ? "0 0 6px rgba(124,92,252,0.4)" : "none",
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{entry.title}</div>
              <div className="flex gap-1.5 mt-1 text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                <span style={{ color: "#7c5cfc", fontWeight: 500 }}>{entry.source}</span>
                <span>·</span>
                <span>{entry.time}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
