"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Entry } from "@/lib/types";
import { getSourceColor } from "@/lib/crypto-data";

interface PricePoint { t: number; p: number }

function toTs(timeStr: string): number {
  if (timeStr.includes("刚刚")) return Date.now();
  const m = timeStr.match(/(\d+)\s*(分钟|小时|天)/);
  if (!m) return Date.now();
  const n = parseInt(m[1]);
  const unit = m[2];
  if (unit === "分钟") return Date.now() - n * 60000;
  if (unit === "小时") return Date.now() - n * 3600000;
  if (unit === "天") return Date.now() - n * 86400000;
  return Date.now();
}

type RangeKey = "7d" | "3d" | "1d";
const RANGE_MS: Record<RangeKey, number> = { "7d": 7 * 86400000, "3d": 3 * 86400000, "1d": 86400000 };

export function PriceEventChart({ entries, onEntryClick, coin = "btc" }: {
  entries: Entry[];
  onEntryClick: (e: Entry) => void;
  coin?: string;
}) {
  const [data, setData] = useState<{ points: PricePoint[]; current: number } | null>(null);
  const [range, setRange] = useState<RangeKey>("3d"); // default 3 days
  const [zoom, setZoom] = useState(1);
  const [hovered, setHovered] = useState<{ entry: Entry; x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/price?coin=${coin}`).then(r => r.json()).then(d => {
      if (d.points && d.points.length) setData(d);
    }).catch(() => {});
  }, [coin]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.5, Math.min(5, z + (e.deltaY > 0 ? -0.2 : 0.2))));
  }, []);

  if (!data || !data.points.length) return (
    <div className="glass-card">
      <h3 className="text-sm font-semibold mb-3">📈 BTC 价格与事件</h3>
      <div className="h-[200px] glass-skeleton rounded" />
    </div>
  );

  // 筛选可见时间范围
  const now = Date.now();
  const rangeMs = RANGE_MS[range];
  const visibleStart = now - rangeMs;

  const visiblePts = data.points.filter(pt => pt.t >= visibleStart && pt.t <= now);
  if (visiblePts.length < 2) return null;

  const pts = visiblePts;
  const minT = pts[0].t;
  const maxT = pts[pts.length - 1].t;
  const rangeT = maxT - minT || 1;

  const prices = pts.map(p => p.p);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const rangeP = maxP - minP || 1;
  const padP = rangeP * 0.08;

  const W = Math.round(600 * zoom);
  const H = 220;
  const padX = 44, padY = 24;
  const cw = W - padX * 2, ch = H - padY * 2;

  const xScale = (t: number) => padX + ((t - minT) / rangeT) * cw;
  const yScale = (p: number) => padY + ch - ((p - (minP - padP)) / (rangeP + padP * 2)) * ch;

  // 价格折线
  const pathD = pts.map((pt, i) => `${i === 0 ? "M" : "L"}${xScale(pt.t)},${yScale(pt.p)}`).join(" ");

  // 事件点
  const eventDots = entries.map(entry => {
    const et = toTs(entry.time);
    if (et < visibleStart || et > now) return null;
    const x = xScale(et);
    let nearest = pts[0];
    for (const pt of pts) {
      if (Math.abs(pt.t - et) < Math.abs(nearest.t - et)) nearest = pt;
    }
    return { entry, x, y: yScale(nearest.p), price: nearest.p };
  }).filter(Boolean) as { entry: Entry; x: number; y: number; price: number }[];

  // 刻度间距：按天/小时自适应
  const autoLabel = (t: number) => {
    const d = new Date(t);
    if (range === "1d") return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    if (range === "3d") {
      const h = d.getHours();
      return h % 6 === 0 ? `${d.getMonth() + 1}/${d.getDate()} ${String(h).padStart(2, "0")}:00` : "";
    }
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };
  // 智能刻度间隔：确保约 8-12 个标签
  const tickCount = range === "1d" ? 12 : range === "3d" ? 10 : 8;
  const tickStep = Math.max(1, Math.floor(pts.length / tickCount));

  return (
    <div className="glass-card" ref={ref} onWheel={handleWheel}>
      {/* 顶栏：标题 + 时间范围切换 + 缩放 */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-sm font-semibold">📈 BTC 价格与事件</h3>
        <div className="flex items-center gap-2">
          {/* 时间范围 */}
          <div className="flex gap-0.5 rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.04)" }}>
            {(["7d", "3d", "1d"] as RangeKey[]).map((k) => (
              <button key={k} onClick={() => setRange(k)}
                className="px-2.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer"
                style={{
                  background: range === k ? "rgba(124,92,252,0.2)" : "transparent",
                  color: range === k ? "#c4b5fd" : "var(--text-tertiary)",
                }}
              >
                {k.replace("d", " 日")}
              </button>
            ))}
          </div>
          {/* 缩放 */}
          <div className="flex gap-0.5 rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.04)" }}>
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.3))}
              className="px-2 py-1 rounded-md text-[10px] font-medium cursor-pointer"
              style={{ color: "var(--text-tertiary)" }}
            >−</button>
            <span className="px-1.5 py-1 text-[10px]" style={{ color: "var(--text-tertiary)" }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(5, z + 0.3))}
              className="px-2 py-1 rounded-md text-[10px] font-medium cursor-pointer"
              style={{ color: "var(--text-tertiary)" }}
            >+</button>
          </div>
        </div>
      </div>

      {/* 图表 */}
      <div className="relative w-full overflow-x-auto scrollbar-thin">
        <svg width={W} height={H} className="block" style={{ userSelect: "none", minWidth: "100%" }}>
          {/* 网格 */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = padY + (ch / 4) * i;
            const p = Math.round(maxP - (rangeP + padP * 2) * (i / 4) + padP);
            return (
              <g key={i}>
                <line x1={padX} y1={y} x2={padX + cw} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                <text x={padX - 6} y={y + 3} textAnchor="end" className="text-[9px]" fill="rgba(255,255,255,0.3)">{p.toLocaleString()}</text>
              </g>
            );
          })}

          {/* 时间刻度 */}
          {pts.filter((_, i) => i % tickStep === 0).map((pt, i) => {
            const x = xScale(pt.t);
            const label = autoLabel(pt.t);
            if (!label) return null;
            return (
              <text key={i} x={x} y={H - 4} textAnchor="middle" className="text-[8px]" fill="rgba(255,255,255,0.25)">
                {label}
              </text>
            );
          })}

          {/* 价格面积 */}
          <defs>
            <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(124,92,252,0.2)" />
              <stop offset="100%" stopColor="rgba(124,92,252,0.01)" />
            </linearGradient>
          </defs>
          <path d={`${pathD} L${xScale(pts[pts.length - 1].t)},${padY + ch} L${xScale(pts[0].t)},${padY + ch} Z`} fill="url(#pg)" />

          {/* 折线 */}
          <path d={pathD} fill="none" stroke="#7c5cfc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* 事件点 */}
          {eventDots.map((dot, i) => (
            <g key={i} className="cursor-pointer"
              onMouseEnter={() => setHovered({ entry: dot.entry, x: dot.x, y: dot.y })}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onEntryClick(dot.entry)}
            >
              <line x1={dot.x} y1={dot.y} x2={dot.x} y2={dot.y - 8} stroke="rgba(124,92,252,0.25)" strokeWidth="1" strokeDasharray="2,2" />
              <circle cx={dot.x} cy={dot.y - 8} r="4.5" fill={getSourceColor(dot.entry.source)} stroke="#0d1128" strokeWidth="2" />
            </g>
          ))}
        </svg>
      </div>

      {/* 悬浮提示 */}
      {hovered && (
        <div className="absolute z-20 pointer-events-none" style={{
          left: `${Math.min(Math.max(hovered.x / (6 * zoom) * 100, 5), 80)}%`,
          top: `${Math.min(Math.max(hovered.y / 2.4 - 30, 5), 50)}%`,
        }}>
          <div className="rounded-lg p-2.5 max-w-[240px] shadow-lg" style={{ background: "#0d1128", border: "1px solid rgba(255,255,255,0.12)" }}>
            <div className="text-[10px] font-medium mb-0.5" style={{ color: getSourceColor(hovered.entry.source) }}>{hovered.entry.sourceIcon} {hovered.entry.source} · {hovered.entry.time}</div>
            <div className="text-[11px] font-semibold leading-snug text-white">{hovered.entry.titleCn || hovered.entry.title}</div>
          </div>
        </div>
      )}

      {/* 底部 */}
      <div className="flex items-center justify-between mt-2 text-[10px] text-tertiary">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "#7c5cfc" }} /> 价格</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded" style={{ background: "rgba(124,92,252,0.4)" }} /> 事件（按来源着色）</span>
        </div>
        <div>
          <span className="text-dim">${(minP).toLocaleString()}</span> — <span className="text-dim">${(maxP).toLocaleString()}</span>
          <span className="ml-2">{pts.length} 点 · {eventDots.length} 事件</span>
        </div>
      </div>
    </div>
  );
}
