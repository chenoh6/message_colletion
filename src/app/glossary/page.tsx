"use client";

import Link from "next/link";
import { CRYPTO_TERMS, type Term } from "@/lib/crypto-glossary";

/* ===== 按分类分组 ===== */
const categories = [...new Set(CRYPTO_TERMS.map((t) => t.category))];
const grouped = categories.map((cat) => ({
  category: cat,
  terms: CRYPTO_TERMS.filter((t) => t.category === cat),
}));

function TermCard({ term }: { term: Term }) {
  return (
    <div className="glass-sm rounded-xl p-4 transition-all hover:translate-y-[-1px]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-bold">{term.name}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(124,92,252,0.12)", color: "#a78bfa" }}>
          {term.category}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-dim">{term.detail.split("\n\n")[0]}</p>
      {term.detail.includes("\n\n") && (
        <div className="mt-2 pt-2 border-t border-border-subtle">
          {term.detail.split("\n\n").slice(1).map((para, i) => (
            <p key={i} className="text-xs leading-relaxed text-dim mt-1">{para.replace(/\n/g, " ")}</p>
          ))}
        </div>
      )}
      {term.example && (
        <div className="mt-2 rounded-lg p-2.5 text-[11px]" style={{ background: "rgba(124,92,252,0.06)", color: "rgba(255,255,255,0.45)" }}>
          💡 {term.example}
        </div>
      )}
    </div>
  );
}

export default function GlossaryPage() {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <header className="h-16 flex items-center px-8 border-b border-border shrink-0"
        style={{ background: "rgba(8,12,26,0.4)", backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📖</span>
          <h1 className="text-lg font-bold">币圈基础信息表</h1>
        </div>
        <div className="ml-auto">
          <Link href="/crypto" className="text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all"
            style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-dim)" }}
          >
            ← 回币圈
          </Link>
        </div>
      </header>

      <div className="px-8 py-6 container-page">
        {/* 页面说明 */}
        <div className="glass-sm rounded-xl p-5 mb-6" style={{ borderColor: "rgba(124,92,252,0.1)" }}>
          <h2 className="text-sm font-bold mb-2">📖 这是什么？</h2>
          <p className="text-xs leading-relaxed text-dim">
            你在币圈页面看到的每个专业术语，这里都有解释。遇到不懂的词，在页面中点一下就能看到弹窗说明。
            <span className="block mt-1" style={{ color: "#c4b5fd" }}>← 就像这样高亮的词，点击就能看解释</span>
          </p>
        </div>

        {/* 术语列表 */}
        {grouped.map((g) => (
          <section key={g.category} className="mb-8">
            <div className="flex items-center gap-2.5 mb-3">
              <h3 className="text-base font-bold">{g.category}</h3>
              <span className="text-[10px] text-tertiary">{g.terms.length} 个术语</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {g.terms.map((term) => (
                <TermCard key={term.slug} term={term} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
