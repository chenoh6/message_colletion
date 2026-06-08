"use client";

import type { Entry } from "@/lib/types";
import { getSourceColor } from "@/lib/crypto-data";

/* ===== 按时间分组 ===== */
function groupByTimeBucket(entries: Entry[]): { label: string; entries: Entry[] }[] {
  const groups: { label: string; entries: Entry[] }[] = [];

  const getBucket = (timeStr: string): number => {
    const match = timeStr.match(/(\d+)\s*(分钟|小时|天|刚刚)/);
    if (!match) return 999;
    const n = parseInt(match[1]);
    const unit = match[2];
    if (unit === "刚刚" || timeStr.includes("刚刚")) return 0;
    if (unit === "分钟") return n;
    if (unit === "小时") return n * 60;
    if (unit === "天") return n * 1440;
    return 999;
  };

  const sorted = [...entries].sort((a, b) => getBucket(a.time) - getBucket(b.time));

  let currentLabel = "";
  let currentEntries: Entry[] = [];

  for (const entry of sorted) {
    const mins = getBucket(entry.time);
    let label = "";
    if (mins <= 5) label = "刚刚";
    else if (mins <= 60) label = `${mins} 分钟前`;
    else if (mins <= 180) label = `${Math.floor(mins / 60)} 小时前`;
    else if (mins <= 720) label = "今天";
    else label = "更早";

    if (label !== currentLabel && currentEntries.length > 0) {
      groups.push({ label: currentLabel, entries: currentEntries });
      currentEntries = [];
    }
    currentLabel = label;
    currentEntries.push(entry);
  }
  if (currentEntries.length > 0) {
    groups.push({ label: currentLabel, entries: currentEntries });
  }

  return groups;
}

/* ===== 单条时间轴卡片 ===== */
function TimelineEvent({ entry, index, onOpen, onDecode, decoding }: {
  entry: Entry;
  index: number;
  onOpen: (e: Entry) => void;
  onDecode: (e: Entry) => void;
  decoding: boolean;
}) {
  const hasAi = !!entry.aiSummary;
  const sourceColor = getSourceColor(entry.source);

  // 评分标记：≥80 热门，≥60 值得关注
  const score = entry.score ?? 0;
  const isHot = score >= 80;
  const isNotable = score >= 60;
  const scoreColor = isHot ? "#f59e0b" : isNotable ? "#a78bfa" : "transparent";

  return (
    <div className="flex gap-4 animate-in" style={{ animationDelay: `${0.03 * index}s` }}>
      {/* 时间轴左侧 — 评分高亮条 */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 20 }}>
        <div
          className="w-[10px] h-[10px] rounded-full mt-1.5 z-10 transition-all"
          style={{
            background: isHot ? scoreColor : sourceColor,
            border: `2px solid ${isHot ? scoreColor + "99" : hasAi ? sourceColor + "66" : "rgba(255,255,255,0.15)"}`,
            boxShadow: isHot ? `0 0 8px ${scoreColor}66` : "none",
          }}
        />
        {isHot && (
          <span className="text-[8px] mt-0.5 font-bold" style={{ color: scoreColor }}>🔥</span>
        )}
        <div className="w-px flex-1 min-h-[24px]" style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>

      {/* 内容卡片 */}
      <div className="flex-1 min-w-0 pb-4 cursor-pointer" onClick={() => onOpen(entry)}>
        <div
          className="glass-sm rounded-xl px-4 py-3 transition-all hover:translate-y-[-1px]"
          style={{
            borderLeft: isHot ? `3px solid ${scoreColor}` : isNotable ? `3px solid ${scoreColor}66` : "3px solid transparent",
          }}
        >
          <div className="flex items-center gap-1.5 text-[10px] mb-0.5">
            <span style={{ color: getSourceColor(entry.source) }}>{entry.sourceIcon} {entry.source}</span>
            {hasAi && <span className="text-[8px] px-1 py-[1px] rounded-sm" style={{ background: "rgba(124,92,252,0.12)", color: "#a78bfa" }}>已解析</span>}
            {isHot && <span className="text-[8px] px-1 py-[1px] rounded-sm" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>🔥 热门</span>}
            {isNotable && !isHot && <span className="text-[8px] px-1 py-[1px] rounded-sm" style={{ background: "rgba(124,92,252,0.08)", color: "#a78bfa" }}>值得关注</span>}
          </div>
          <h4 className="text-sm font-semibold leading-snug line-clamp-1">{entry.titleCn || entry.title}</h4>
          {(entry.aiSummary || entry.summary) && (
            <p className="text-xs text-dim mt-1 line-clamp-1">{entry.aiSummary || entry.summary}</p>
          )}
        </div>
        {!hasAi && (
          <div className="flex justify-end mt-1">
            <button
              onClick={(e) => { e.stopPropagation(); onDecode(entry); }}
              disabled={decoding}
              className="text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer disabled:opacity-40"
              style={{ background: "rgba(124,92,252,0.1)", color: "#a78bfa", border: "1px solid rgba(124,92,252,0.15)" }}
            >
              {decoding ? "⏳" : "🤖 AI 解码"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== 时间轴主组件 ===== */
export function TimelineView({ entries, onOpen, onDecode, decodingId }: {
  entries: Entry[];
  onOpen: (e: Entry) => void;
  onDecode: (e: Entry) => void;
  decodingId: string | null;
}) {
  const groups = groupByTimeBucket(entries);

  if (groups.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      {groups.map((group) => (
        <div key={group.label}>
          <div className="flex items-center gap-3 mb-2 mt-2 first:mt-0">
            <div className="text-[11px] font-semibold shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>
              {group.label}
            </div>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.04)" }} />
          </div>
          {group.entries.map((entry, i) => (
            <TimelineEvent key={entry.id} entry={entry} index={i} onOpen={onOpen} onDecode={onDecode} decoding={decodingId === entry.id} />
          ))}
        </div>
      ))}
    </div>
  );
}
