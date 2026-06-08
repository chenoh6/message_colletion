"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FEED_ENTRIES } from "@/lib/data";
import { CRYPTO_FEATURED, CRYPTO_FEED } from "@/lib/crypto-data";

const STORAGE_KEY = "crypto_saved_ids";

const COLLECTIONS = [
  { name: "⭐ 精选", count: 12, icon: "⭐" },
  { name: "📄 AI 技术", count: 8, icon: "🤖" },
  { name: "💰 投融资", count: 5, icon: "💰" },
  { name: "🎨 设计", count: 3, icon: "🎨" },
  { name: "📚 深度长文", count: 7, icon: "📚" },
];

const SAVED_ENTRIES = FEED_ENTRIES.slice(0, 4).map((e, i) => ({
  ...e,
  isSaved: true,
  savedAt: i === 0 ? "2小时前" : i === 1 ? "昨天" : i === 2 ? "2天前" : "3天前",
}));

export default function LibraryPage() {
  const [cryptoSavedIds, setCryptoSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCryptoSavedIds(new Set(JSON.parse(raw)));
    } catch { /* ignore */ }
  }, []);

  const allCryptoEntries = [...CRYPTO_FEATURED, ...CRYPTO_FEED];
  const savedCrypto = allCryptoEntries.filter((e) => cryptoSavedIds.has(e.id));
  const totalSaved = SAVED_ENTRIES.length + savedCrypto.length;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <header className="h-16 flex items-center px-8 border-b shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(8,12,26,0.4)", backdropFilter: "blur(16px)" }}
      >
        <h1 className="text-lg font-bold">📋 收藏</h1>
        <span className="ml-3 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>共 {totalSaved} 篇</span>
      </header>

      <div className="px-8 py-6 max-w-[1200px] mx-auto w-full">
        {/* Collections */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>收藏夹</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {COLLECTIONS.map((col) => (
              <button key={col.name}
                className="glass rounded-xl p-4 text-left cursor-pointer transition-all duration-300 hover:translate-y-[-2px]"
              >
                <div className="text-2xl mb-2">{col.icon}</div>
                <div className="text-sm font-semibold">{col.name}</div>
                <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{col.count} 篇</div>
              </button>
            ))}
          </div>
        </section>

        {/* 币圈收藏 */}
        {savedCrypto.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "rgba(255,255,255,0.45)" }}>
              ₿ 币圈收藏（{savedCrypto.length}）
            </h2>
            <div className="flex flex-col gap-2">
              {savedCrypto.map((entry) => (
                <Link key={entry.id}
                  href={entry.sourceUrl || "#"}
                  target={entry.sourceUrl ? "_blank" : undefined}
                  rel={entry.sourceUrl ? "noopener noreferrer" : undefined}
                  className="glass rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all duration-300 hover:translate-y-[-1px]"
                >
                  <span className="text-2xl mt-1">{entry.sourceIcon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{entry.title}</div>
                    <div className="flex items-center gap-2 text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                      <span style={{ color: "#7c5cfc", fontWeight: 500 }}>{entry.source}</span>
                      <span>·</span>
                      <span>{entry.time}</span>
                    </div>
                    <p className="text-xs mt-1 line-clamp-1" style={{ color: "rgba(255,255,255,0.3)" }}>{entry.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 最近收藏 */}
        <section>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>最近收藏</h2>
          {SAVED_ENTRIES.length > 0 ? (
            <div className="flex flex-col gap-2">
              {SAVED_ENTRIES.map((entry) => (
                <Link key={entry.id} href={`/reading/${entry.id}`}
                  className="glass rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all duration-300 hover:translate-y-[-1px]"
                >
                  <span className="text-2xl mt-1">{entry.coverEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{entry.title}</div>
                    <div className="flex items-center gap-2 text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                      <span style={{ color: "#7c5cfc", fontWeight: 500 }}>{entry.source}</span>
                      <span>·</span>
                      <span>{entry.time}</span>
                    </div>
                  </div>
                  <div className="text-xs shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>
                    {(entry as any).savedAt || ""}
                  </div>
                </Link>
              ))}
            </div>
          ) : savedCrypto.length === 0 ? (
            <div className="glass rounded-xl p-10 text-center">
              <span className="text-4xl">📭</span>
              <p className="text-sm mt-3" style={{ color: "rgba(255,255,255,0.45)" }}>还没有收藏内容</p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                在币圈页面点击 ☆ 即可收藏
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
