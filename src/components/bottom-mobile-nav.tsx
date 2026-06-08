"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", icon: "🏠", label: "首页" },
  { href: "/crypto", icon: "₿", label: "币圈" },
  { href: "/discover", icon: "🔍", label: "发现" },
  { href: "/library", icon: "📋", label: "收藏" },
  { href: "/profile", icon: "👤", label: "我的" },
];

export function BottomMobileNav() {
  const pathname = usePathname();
  const isReading = pathname.startsWith("/reading/");

  if (isReading) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-[64px] pb-[8px] flex items-center justify-around px-2"
      style={{ background: "rgba(8,12,26,0.85)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 px-4 py-1 text-xs transition-colors relative"
            style={{ color: isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.3)" }}
          >
            {isActive && (
              <span className="absolute -top-1 w-5 h-0.5 rounded-full" style={{ background: "#7c5cfc" }} />
            )}
            <span className="text-[20px] leading-6">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
