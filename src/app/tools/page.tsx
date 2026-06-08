"use client";

import { useState } from "react";

const EMBED_URL = "https://rsseverything.com/zh";

export default function ToolsPage() {
  const [iframeLoading, setIframeLoading] = useState(true);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 flex items-center px-8 border-b shrink-0 gap-3"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(8,12,26,0.4)", backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🛠</span>
          <h1 className="text-lg font-bold">工具箱</h1>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <a href={EMBED_URL} target="_blank" rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer"
            style={{ background: "rgba(124,92,252,0.1)", color: "#a78bfa", border: "1px solid rgba(124,92,252,0.15)" }}
          >
            ↗ 在新标签页打开
          </a>
        </div>
      </header>

      {/* Tool description */}
      <div className="px-8 pt-4 pb-2 text-xs flex items-center gap-4 flex-wrap"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        <span>🔗 <strong className="text-dim">RSS Everything</strong> — 将任意网页转换为 RSS 订阅源</span>
        <span>•</span>
        <span>粘贴网址 → 定义规则 → 生成 RSS → 添加到本平台</span>
        <span>•</span>
        <a href={EMBED_URL} target="_blank" rel="noopener noreferrer"
          style={{ color: "#a78bfa", textDecoration: "underline" }}
        >
          访问官网
        </a>
      </div>

      {/* Iframe */}
      <div className="flex-1 px-4 pb-4 pt-2 relative">
        {iframeLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10"
            style={{ background: "#080c1a" }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "rgba(124,92,252,0.3)", borderTopColor: "#7c5cfc" }}
              />
              <span className="text-sm text-dim">加载工具中...</span>
            </div>
          </div>
        )}
        <iframe
          src={EMBED_URL}
          className="w-full h-full rounded-xl border-0"
          style={{ background: "#fff" }}
          onLoad={() => setIframeLoading(false)}
          allow="clipboard-read; clipboard-write"
          title="RSS Everything - 网页转 RSS 工具"
        />
      </div>
    </div>
  );
}
