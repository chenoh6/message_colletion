"use client";

import type { Trend } from "@/lib/data";

export function TrendPanel({ trends }: { trends: Trend[] }) {
  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">🔥 热议趋势</h3>
      </div>
      <div className="flex flex-col gap-0.5">
        {trends.map((t) => (
          <div
            key={t.rank}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.04)]"
          >
            <span
              className="w-5 text-sm font-bold text-center"
              style={{ color: t.rank <= 3 ? "#7c5cfc" : "rgba(255,255,255,0.3)" }}
            >
              {t.rank}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{t.title}</div>
              <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                {t.count} · {t.readingCount}
              </div>
            </div>
            <span className="text-xs font-semibold" style={{ color: t.trendUp ? "#2dd4bf" : "#fca5a5" }}>
              {t.trend}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
