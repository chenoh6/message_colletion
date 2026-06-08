"use client";

import type { Entry } from "@/lib/types";
import { getSourceColor } from "@/lib/crypto-data";

/** ISO 日期 → 具体时间，如 "06/08 10:30" */
function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const MM = String(d.getMonth() + 1).padStart(2, "0");
    const DD = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${MM}/${DD} ${hh}:${mm}`;
  } catch {
    return "";
  }
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

  // 评分标记
  const score = entry.score ?? 0;
  const isHot = score >= 80;
  const isNotable = score >= 60;
  const scoreColor = isHot ? "#f59e0b" : isNotable ? "#a78bfa" : "transparent";

  return (
    <div className="flex gap-3 animate-in" style={{ animationDelay: `${0.03 * index}s` }}>
      {/* 左侧 — 时间标签 + 评分高亮条 */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 56 }}>
        <div className="flex flex-col items-center">
          {/* 时间点 */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-[10px] h-[10px] rounded-full z-10 transition-all"
              style={{
                background: isHot ? scoreColor : sourceColor,
                border: `2px solid ${isHot ? scoreColor + "99" : hasAi ? sourceColor + "66" : "rgba(255,255,255,0.15)"}`,
                boxShadow: isHot ? `0 0 8px ${scoreColor}66` : "none",
              }}
            />
            {/* 模糊时间标签 */}
            <span className="text-[10px] whitespace-nowrap" style={{ color: "rgba(255,255,255,0.2)" }}>
              {entry.time}
            </span>
          </div>
          {isHot && (
            <span className="text-[8px] mt-0.5 font-bold" style={{ color: scoreColor }}>🔥</span>
          )}
        </div>
        {/* 时间线 */}
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
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      {entries.map((entry, i) => (
        <TimelineEvent key={entry.id} entry={entry} index={i} onOpen={onOpen} onDecode={onDecode} decoding={decodingId === entry.id} />
      ))}
    </div>
  );
}
