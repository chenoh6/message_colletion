"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
  as?: "div" | "button" | "a";
  onClick?: () => void;
  [key: string]: any;
}

const paddingMap = {
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function GlassCard({
  children,
  className,
  hover = false,
  padding = "md",
  as: Tag = "div",
  ...props
}: GlassCardProps) {
  return (
    <Tag
      className={cn(
        "glass",
        paddingMap[padding],
        hover && "glass-hover",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
