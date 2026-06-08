import { NextResponse } from "next/server";
import { getEntries, getEntry, getStore } from "@/lib/store";
import { SOURCES } from "@/lib/sources";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const source = searchParams.get("source");
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");
  const sortBy = searchParams.get("sort_by") === "score" ? "score" : "time";

  // Single entry
  if (id) {
    const entry = await getEntry(id);
    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    return NextResponse.json(entry);
  }

  // List entries
  const entries = await getEntries({ source: source || undefined, category: category || undefined, limit, offset, sortBy });
  const store = await getStore();

  return NextResponse.json({
    entries,
    total: Object.keys(store.entries).length,
    sources: SOURCES.filter((s) => s.active).length,
  });
}
