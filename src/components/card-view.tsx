"use client";

import type { Entry } from "@/lib/types";
import { getSourceColor } from "@/lib/crypto-data";

/** ISO 日期 → "06/08 10:30" */
function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

/* ===== 卡片：单个信息源 ===== */
function SourceCard({ sourceId, sourceName, sourceIcon, entries, onOpen }: {
  sourceId: string;
  sourceName: string;
  sourceIcon: string;
  entries: Entry[];
  onOpen: (e: Entry) => void;
}) {
  const color = getSourceColor(sourceName);
  const top3 = entries.filter((e) => (e.score ?? 0) >= 60).length;

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <span className="text-xl">{sourceIcon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{sourceName}</span>
            {top3 > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}
              >
                🔥 {top3}
              </span>
            )}
          </div>
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            {entries.length} 条
          </span>
        </div>
      </div>

      {/* Entry List */}
      <div className="flex-1 overflow-y-auto max-h-[400px] p-2 scrollbar-thin"
        style={{ scrollbarWidth: "thin" }}
      >
        {entries.map((entry) => {
          const score = entry.score ?? 0;
          const isHighValue = score >= 80;

          return (
            <div
              key={entry.id}
              onClick={() => onOpen(entry)}
              className="flex items-start gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all hover:bg-[rgba(255,255,255,0.04)]"
            >
              {/* Score indicator dot */}
              <div className="flex-shrink-0 mt-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: isHighValue ? "#f59e0b" : "rgba(255,255,255,0.15)",
                    boxShadow: isHighValue ? "0 0 6px rgba(245,158,11,0.5)" : "none",
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium leading-snug line-clamp-2">
                  {entry.titleCn || entry.title}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {entry.time}
                  </span>
                  {entry.aiSummary && (
                    <span className="text-[9px] px-1 py-[1px] rounded-sm"
                      style={{ background: "rgba(124,92,252,0.1)", color: "#a78bfa" }}
                    >
                      已解析
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== 卡片视图主组件 ===== */
export function CardView({ entries, onOpen }: {
  entries: Entry[];
  onOpen: (e: Entry) => void;
}) {
  // 按 sourceId 分组
  const groups = new Map<string, { name: string; icon: string; entries: Entry[] }>();

  for (const entry of entries) {
    if (!groups.has(entry.sourceId)) {
      groups.set(entry.sourceId, {
        name: entry.source,
        icon: entry.sourceIcon,
        entries: [],
      });
    }
    groups.get(entry.sourceId)!.entries.push(entry);
  }

  // 转换为数组并按分数排序（最高分的源排前面）
  const cards = Array.from(groups.entries())
    .map(([id, g]) => ({ id, ...g }))
    .sort((a, b) => {
      const aMax = Math.max(...a.entries.map((e) => e.score ?? 0));
      const bMax = Math.max(...b.entries.map((e) => e.score ?? 0));
      return bMax - aMax;
    });

  if (cards.length === 0) return null;

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
      }}
    >
      {cards.map((card) => (
        <SourceCard
          key={card.id}
          sourceId={card.id}
          sourceName={card.name}
          sourceIcon={card.icon}
          entries={card.entries}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
