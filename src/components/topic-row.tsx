"use client";

import { TOPICS } from "@/lib/data";

export function TopicRow() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin" style={{ scrollbarWidth: "none" }}>
      {TOPICS.map((topic) => (
        <button
          key={topic.name}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border cursor-pointer`}
          style={{
            background: topic.active ? "rgba(124,92,252,0.15)" : "rgba(255,255,255,0.05)",
            borderColor: topic.active ? "rgba(124,92,252,0.25)" : "rgba(255,255,255,0.06)",
            color: topic.active ? "#c4b5fd" : "rgba(255,255,255,0.55)",
          }}
        >
          {topic.name}
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{topic.count}</span>
        </button>
      ))}
    </div>
  );
}
