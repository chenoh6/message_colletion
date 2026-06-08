"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS_TOP = [
  { href: "/", icon: "🏠", label: "首页" },
  { href: "/crypto", icon: "₿", label: "币圈" },
  { href: "/discover", icon: "🔍", label: "发现" },
  { href: "/tools", icon: "🛠", label: "工具" },
  { href: "/library", icon: "📋", label: "收藏" },
  { href: "/glossary", icon: "📖", label: "术语" },
];

const NAV_ITEMS_BOTTOM = [
  { href: "/profile", icon: "👤", label: "我的" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const s = localStorage.getItem("sidebar_collapsed");
    if (s === "true") setCollapsed(true);

    const t = localStorage.getItem("theme");
    if (t === "light") {
      setIsDark(false);
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar_collapsed", String(next));
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    const next = !isDark;
    setIsDark(next);
    html.classList.toggle("light", !next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  if (!mounted) {
    return <aside className="hidden md:flex flex-col items-center w-[72px] flex-shrink-0 border-r" style={{ borderColor: "rgba(255,255,255,0.06)" }} />;
  }

  return (
    <aside
      className="hidden md:flex flex-col items-center py-5 border-r z-10 relative transition-all duration-300 flex-shrink-0 overflow-hidden"
      style={{
        width: collapsed ? 20 : 72,
        borderColor: "rgba(255,255,255,0.06)",
        background: "rgba(8,12,26,0.6)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* 折叠按钮 — 固定在右上 */}
      <button
        onClick={toggle}
        className="absolute top-3 right-1 w-4 h-4 rounded flex items-center justify-center text-[8px] cursor-pointer z-20 transition-all hover:bg-[rgba(255,255,255,0.06)]"
        style={{ color: "rgba(255,255,255,0.25)" }}
        title={collapsed ? "展开" : "折叠"}
      >
        {collapsed ? "▶" : "◀"}
      </button>

      {/* Logo — 折叠时隐藏 */}
      <Link
        href="/"
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-extrabold text-white mb-6 transition-all duration-300 flex-shrink-0 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, #7c5cfc, #a78bfa)",
          opacity: collapsed ? 0 : 1,
          transform: collapsed ? "scale(0.5)" : "scale(1)",
        }}
      >
        ✦
      </Link>

      {/* 导航 — 折叠时透明 */}
      <div className="flex flex-col gap-1 flex-1 transition-all duration-300" style={{ opacity: collapsed ? 0 : 1 }}>
        {NAV_ITEMS_TOP.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all relative"
              style={{
                background: isActive ? "rgba(124,92,252,0.15)" : "transparent",
                color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.3)",
                border: isActive ? "1px solid rgba(124,92,252,0.2)" : "none",
              }}
              title={item.label}
            >
              {item.icon}
            </Link>
          );
        })}
      </div>

      {/* 底部 — 折叠时透明 */}
      <div className="flex flex-col gap-1 items-center transition-all duration-300" style={{ opacity: collapsed ? 0 : 1 }}>
        {NAV_ITEMS_BOTTOM.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all"
              style={{
                background: isActive ? "rgba(124,92,252,0.15)" : "transparent",
                color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.3)",
                border: isActive ? "1px solid rgba(124,92,252,0.2)" : "none",
              }}
              title={item.label}
            >
              {item.icon}
            </Link>
          );
        })}
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mt-2 cursor-pointer transition-all"
          style={{ background: "linear-gradient(135deg, #7c5cfc, #2dd4bf)", border: "2px solid rgba(255,255,255,0.06)" }}
          title="用户"
        >
          G
        </div>
        <button onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm mt-1 transition-all cursor-pointer"
          style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)" }}
          title={isDark ? "浅色模式" : "深色模式"}
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>
    </aside>
  );
}
