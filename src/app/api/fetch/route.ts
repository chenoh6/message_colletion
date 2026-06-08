import { NextResponse } from "next/server";
import { TIER1_SOURCES, SOURCES } from "@/lib/sources";
import { fetchSource } from "@/lib/fetcher";
import { saveEntries, markFetched, shouldFetch, addFetchLog, getStore } from "@/lib/store";
import { processEntries } from "@/lib/ai-processor";

export const maxDuration = 120; // 2 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sourceId = searchParams.get("source");
  const runAi = searchParams.get("ai") !== "false";
  const force = searchParams.get("force") === "true";
  const reprocess = searchParams.get("reprocess") === "true";
  const userKey = searchParams.get("key");
  const userModel = searchParams.get("model") || "deepseek-chat";
  const userUrl = searchParams.get("url");

  // Reprocess existing crypto entries without aiSummary
  if (reprocess) {
    if (userKey) process.env.DEEPSEEK_API_KEY = userKey;
    if (userModel) process.env.AI_MODEL = userModel;
    if (userUrl) process.env.AI_API_URL = userUrl;
    const store = await getStore();
    const entries = Object.entries(store.entries);
    const toProcess = entries.filter(
      ([, e]: [string, any]) => e.category === "crypto" && (!e.aiSummary || !e.titleCn)
    ).slice(0, 10);
    if (toProcess.length > 0 && (process.env.DEEPSEEK_API_KEY || userKey)) {
      const { saveEntry } = await import("@/lib/store");
      const processed = await processEntries(toProcess.map(([, e]) => e) as any);
      for (const entry of processed) {
        await saveEntry(entry);
      }
      return NextResponse.json({ reprocessed: processed.length, total: toProcess.length });
    }
    return NextResponse.json({ reprocessed: 0, total: toProcess.length, message: "No API key or no entries to process" });
  }

  // Status check if no source specified
  if (!sourceId) {
    const store = await getStore();
    const statuses = SOURCES.filter((s) => s.active).map((s) => ({
      id: s.id,
      name: s.name,
      tier: s.tier,
      interval: s.interval,
      lastFetched: store.lastFetched[s.id] || null,
      needsFetch: force || null, // can't compute shouldFetch without await inside map
    }));
    const totalEntries = Object.keys(store.entries).length;
    return NextResponse.json({ status: "ok", sources: statuses, totalEntries });
  }

  // Fetch single source
  const source = SOURCES.find((s) => s.id === sourceId);
  if (!source) {
    return NextResponse.json({ error: `Source "${sourceId}" not found` }, { status: 404 });
  }

  // Check if fetch is needed
  if (!force) {
    const needed = await shouldFetch(source);
    if (!needed) {
      return NextResponse.json({ message: `Skipped ${source.name}, not yet due` });
    }
  }

  // Fetch
  const result = await fetchSource(source);

  // Save new entries
  let newCount = 0;
  if (result.entries.length > 0) {
    newCount = await saveEntries(result.entries);
  }

  // AI process (first pass — only new entries, with API key check)
  let aiProcessed = 0;
  if (runAi && newCount > 0 && process.env.DEEPSEEK_API_KEY) {
    // Get the newly saved entries
    const newEntries = result.entries.slice(0, newCount);
    const processed = await processEntries(newEntries);
    for (const entry of processed) {
      await saveEntries([entry]);
    }
    aiProcessed = processed.length;
  }

  // Mark as fetched
  await markFetched(source.id);
  await addFetchLog({
    sourceId: source.id,
    sourceName: source.name,
    entries: result.entries.length,
    newEntries: newCount,
    error: result.error,
  });

  return NextResponse.json({
    source: source.name,
    total: result.entries.length,
    new: newCount,
    aiProcessed,
    error: result.error || null,
  });
}

export async function POST(request: Request) {
  // Fetch ALL tier 1 sources
  const results = [];
  for (const source of TIER1_SOURCES) {
    const needed = await shouldFetch(source);
    if (!needed) {
      results.push({ id: source.id, name: source.name, skipped: true });
      continue;
    }

    const result = await fetchSource(source);
    let newCount = 0;
    if (result.entries.length > 0) {
      newCount = await saveEntries(result.entries);
    }

    if (newCount > 0 && process.env.DEEPSEEK_API_KEY) {
      const newEntries = result.entries.slice(0, newCount);
      const processed = await processEntries(newEntries);
      for (const entry of processed) {
        await saveEntries([entry]);
      }
    }

    await markFetched(source.id);
    await addFetchLog({
      sourceId: source.id,
      sourceName: source.name,
      entries: result.entries.length,
      newEntries: newCount,
      error: result.error,
    });

    results.push({
      id: source.id,
      name: source.name,
      total: result.entries.length,
      new: newCount,
      error: result.error || null,
    });
  }

  const store = await getStore();
  return NextResponse.json({
    results,
    totalEntries: Object.keys(store.entries).length,
  });
}
