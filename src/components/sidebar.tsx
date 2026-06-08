"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS_TOP = [
  { href: "/", icon: "🏠", label: "首页" },
  { href: "/crypto", icon: "₿", label: "币圈" },
  { href: "/discover", icon: "🔍", label: "发现" },
  { href: "/library", icon: "📋", label: "收藏" },
  { href: "/glossary", icon: "📖", label: "术语" },
];

const NAV_ITEMS_BOTTOM = [
  { href: "/profile", icon: "👤", label: "我的" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const html = document.documentElement;
    const stored = localStorage.getItem("theme");
    if (stored === "light") {
      setIsDark(false);
      html.classList.add("light");
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const next = !isDark;
    setIsDark(next);
    html.classList.toggle("light", !next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <aside className="hidden md:flex flex-col items-center w-[72px] h-screen flex-shrink-0 py-5 border-r z-10"
      style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(8,12,26,0.6)", backdropFilter: "blur(20px)" }}
    >
      <Link href="/" className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-extrabold text-white mb-6 transition-transform hover:scale-105"
        style={{ background: "linear-gradient(135deg, #7c5cfc, #a78bfa)" }}
      >
        ✦
      </Link>

      <div className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS_TOP.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const isLibrary = item.href === "/library";
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
              {isLibrary && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center border-2"
                  style={{ borderColor: "#080c1a" }}
                >
                  3
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col gap-1">
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
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mt-2 cursor-pointer transition-all mx-auto"
          style={{ background: "linear-gradient(135deg, #7c5cfc, #2dd4bf)", border: "2px solid rgba(255,255,255,0.06)" }}
          title="用户"
        >
          G
        </div>
        <button onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm mt-1 transition-all cursor-pointer mx-auto"
          style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)" }}
          title={isDark ? "浅色模式" : "深色模式"}
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>
    </aside>
  );
}
