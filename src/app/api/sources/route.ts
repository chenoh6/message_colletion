import { NextResponse } from "next/server";
import { SOURCES } from "@/lib/sources";

export async function GET() {
  const sources = SOURCES.filter((s) => s.active).map((s) => ({
    id: s.id,
    name: s.name,
    icon: s.icon,
    category: s.category,
    lang: s.lang,
    tier: s.tier,
  }));

  return NextResponse.json({ sources });
}
