"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
  DialogClose,
} from "@/components/ui/dialog";
import { CRYPTO_TERMS, type Term } from "@/lib/crypto-glossary";

/* ===== 构建术语查找表 ===== */
const termMap = new Map<string, Term>();
CRYPTO_TERMS.forEach((t) => {
  termMap.set(t.slug.toLowerCase(), t);
  // 也支持别名
  if (t.slug === "RSI") termMap.set("rsi指标", t);
  if (t.slug === "非农") termMap.set("非农数据", t);
  if (t.slug === "ETF") termMap.set("etf", t);
  if (t.slug === "清算") { termMap.set("爆仓", t); termMap.set("被清算", t); }
  if (t.slug === "Saylor") termMap.set("michael saylor", t);
});

/* ===== 排序：长的优先匹配（如「恐惧贪婪指数」优先于「恐惧」） ===== */
const sortedTerms = [...CRYPTO_TERMS].sort((a, b) => b.name.length - a.name.length);

/* ===== 弹窗内容 ===== */
function TermPopover({ term, children }: { term: Term; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline cursor-pointer transition-all border-b border-dashed hover:border-solid"
        style={{ color: "#c4b5fd", borderColor: "rgba(124,92,252,0.3)", background: "none", font: "inherit", padding: 0 }}
      >
        {children}
      </DialogTrigger>
      <DialogOverlay />
      <DialogContent className="max-w-[420px] rounded-2xl p-0 overflow-hidden"
        style={{ background: "#0d1128", border: "1px solid rgba(255,255,255,0.08)" }}
        showCloseButton={false}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{term.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(124,92,252,0.12)", color: "#a78bfa" }}>
                {term.category}
              </span>
            </div>
            <button className="text-sm cursor-pointer" style={{ color: "rgba(255,255,255,0.3)", background: "none", border: "none", font: "inherit" }}
              onClick={() => setOpen(false)}>✕</button>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            {term.short}
          </p>
          {term.example && (
            <div className="mt-3 rounded-lg p-3 text-[11px]" style={{ background: "rgba(124,92,252,0.06)", color: "rgba(255,255,255,0.45)" }}>
              💡 例子：{term.example}
            </div>
          )}
          <div className="mt-4 text-right">
            <button className="text-[10px] px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer"
                style={{ background: "rgba(124,92,252,0.12)", color: "#a78bfa", border: "none" }}
                onClick={() => setOpen(false)}>
                知道了
              </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ===== 手动高亮：已知术语直接包裹 ===== */
export function TermHighlight({ term }: { term: string }) {
  const t = termMap.get(term.toLowerCase());
  if (!t) return <span>{term}</span>;
  return <TermPopover term={t}>{t.name}</TermPopover>;
}

/* ===== 自动高亮：解析文本中的术语 ===== */
export function HighlightedText({ text }: { text: string }) {
  if (!text) return null;

  // 按术语长度降序匹配，避免短词先匹配吃掉长词的一部分
  const matches: { start: number; end: number; term: Term }[] = [];
  sortedTerms.forEach((term) => {
    const lower = text.toLowerCase();
    const search = term.name.toLowerCase();
    let idx = 0;
    while (idx < text.length) {
      const pos = lower.indexOf(search, idx);
      if (pos === -1) break;
      // 检查是否已经被更长的术语覆盖
      const covered = matches.some((m) => pos >= m.start && pos < m.end);
      if (!covered) {
        matches.push({ start: pos, end: pos + search.length, term });
      }
      idx = pos + 1;
    }
  });

  if (matches.length === 0) return <>{text}</>;

  // 按位置排序
  matches.sort((a, b) => a.start - b.start);

  const parts: React.ReactNode[] = [];
  let last = 0;

  matches.forEach((m, i) => {
    if (m.start > last) {
      parts.push(<span key={`t${i}-pre`}>{text.slice(last, m.start)}</span>);
    }
    parts.push(
      <TermPopover key={`t${i}`} term={m.term}>
        {text.slice(m.start, m.end)}
      </TermPopover>
    );
    last = m.end;
  });
  if (last < text.length) {
    parts.push(<span key="last">{text.slice(last)}</span>);
  }

  return <>{parts}</>;
}
