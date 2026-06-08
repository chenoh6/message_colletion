"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEntry } from "@/lib/use-data";
import { CRYPTO_FEED } from "@/lib/crypto-data";
import { formatTime } from "@/lib/utils";

export default function ReadingPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const { entry, loading, error } = useEntry(id);

  // 相关推荐（基于同 category 的币圈条目）
  const related = id?.startsWith("ce") || id?.startsWith("cb")
    ? CRYPTO_FEED.filter((e) => e.id !== id).slice(0, 2)
    : [];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(124,92,252,0.3)", borderTopColor: "#7c5cfc" }} />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-dim">{error || "内容未找到"}</p>
          <Link href="/" className="text-xs mt-2 inline-block text-accent">← 返回首页</Link>
        </div>
      </div>
    );
  }

  const paragraphs = (entry.contentText || entry.summary || entry.title)
    .split("\n")
    .filter((p) => p.trim())
    .slice(0, 20);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {/* Header */}
      <header className="h-14 flex items-center px-4 md:px-8 border-b border-border shrink-0 z-10 sticky top-0"
        style={{ background: "rgba(8,12,26,0.8)", backdropFilter: "blur(16px)" }}
      >
        <Link href="/" className="flex items-center gap-2 text-sm transition-colors text-dim hover:text-foreground">
          ← 返回
        </Link>
        <div className="flex items-center gap-2 ml-auto">
          <button className="text-lg px-2 py-1 rounded-lg transition-colors text-dim hover:text-foreground">★</button>
          <button className="text-lg px-2 py-1 rounded-lg transition-colors text-dim hover:text-foreground">⋯</button>
        </div>
      </header>

      <article className="container-read px-5 md:px-0 py-8 md:py-12">
        {/* 正文玻璃容器 */}
        <div className="glass-sm p-6 md:p-8 rounded-2xl">
          {/* 元数据 */}
          <div className="flex items-center gap-2 text-xs text-tertiary mb-3">
            <span className="text-accent-foreground font-medium">{entry.source}</span>
            <span>·</span>
            <span>{entry.time}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight mb-5 text-foreground">
            {entry.title}
          </h1>

          {/* AI 摘要卡片 */}
          {(entry.aiSummary || entry.summary) && (
            <div className="p-4 md:p-5 mb-6 rounded-xl" style={{ background: "rgba(124,92,252,0.06)", border: "1px solid rgba(124,92,252,0.1)" }}>
              <div className="flex items-center gap-2 text-xs font-semibold mb-2 text-accent-foreground">
                <span>✨</span> {entry.aiSummary ? "AI 摘要" : "摘要"}
              </div>
              <p className="text-sm leading-relaxed text-dim">
                {entry.aiSummary || entry.summary}
              </p>
            </div>
          )}

          {/* 正文 */}
          <div className="text-body text-dim">
            {paragraphs.length > 0 ? paragraphs.map((p, i) => (
              <p key={i} className="mb-4">{p}</p>
            )) : (
              <p className="italic text-tertiary">
                暂无全文内容。{entry.url && <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-accent">查看原文 →</a>}
              </p>
            )}
          </div>
        </div>

        {/* 标签 */}
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-6">
            {entry.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-md border text-tertiary"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--border)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 阅读原文 */}
        {entry.url && (
          <div className="mt-6 p-4 glass-sm rounded-xl">
            <a href={entry.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-lg font-medium text-white transition-all"
              style={{ background: "linear-gradient(135deg, #7c5cfc, #a78bfa)" }}
            >
              🔗 阅读原文
            </a>
          </div>
        )}

        {/* 相关推荐 */}
        {related.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 text-xs text-tertiary mb-3">
              <span className="w-1 h-1 rounded-full bg-accent" />
              继续阅读
            </div>
            <div className="flex flex-col gap-2">
              {related.map((r) => (
                <Link key={r.id} href={r.sourceUrl || "#"} target={r.sourceUrl ? "_blank" : undefined}
                  className="glass-sm rounded-xl p-4 flex items-start gap-3 transition-all hover:translate-y-[-1px]"
                >
                  <span className="text-xl mt-0.5">{r.sourceIcon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold leading-snug line-clamp-1">{r.title}</div>
                    <div className="flex items-center gap-2 text-xs text-tertiary mt-0.5">
                      <span className="text-accent-foreground font-medium">{r.source}</span>
                      <span>·</span>
                      <span>{r.time}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 返回 */}
        <div className="flex items-center justify-between mt-8 text-xs text-tertiary">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">← 返回首页</Link>
        </div>
      </article>
    </div>
  );
}
