import { TIER1_SOURCES, SOURCES } from "./sources";
import { fetchSource } from "./fetcher";
import { saveEntries, markFetched, shouldFetch, addFetchLog, getStore } from "./store";
import { processEntries } from "./ai-processor";

let isRunning = false;
let intervalHandle: ReturnType<typeof setInterval> | null = null;

async function processSource(sourceId: string, force = false) {
  const source = SOURCES.find((s) => s.id === sourceId);
  if (!source || !source.active) return;

  if (!force) {
    const needed = await shouldFetch(source);
    if (!needed) return;
  }

  console.log(`[Scheduler] Fetching ${source.name}...`);
  const result = await fetchSource(source);

  if (result.entries.length > 0) {
    const newCount = await saveEntries(result.entries);

    if (newCount > 0 && process.env.DEEPSEEK_API_KEY) {
      const newEntries = result.entries.slice(0, newCount);
      const processed = await processEntries(newEntries);
      for (const entry of processed) {
        await saveEntries([entry]);
      }
      console.log(`[Scheduler] AI processed ${processed.length} entries from ${source.name}`);
    }
  }

  await markFetched(source.id);
  await addFetchLog({
    sourceId: source.id,
    sourceName: source.name,
    entries: result.entries.length,
    newEntries: result.entries.length, // approximate
    error: result.error,
  });

  if (result.error) {
    console.error(`[Scheduler] Error fetching ${source.name}: ${result.error}`);
  } else {
    console.log(`[Scheduler] Done ${source.name}: ${result.entries.length} items`);
  }
}

async function tick() {
  if (isRunning) return; // prevent overlapping ticks
  isRunning = true;

  try {
    const activeSources = SOURCES.filter((s) => s.active);
    for (const source of activeSources) {
      await processSource(source.id, false);
    }
  } catch (err) {
    console.error("[Scheduler] Tick error:", err);
  } finally {
    isRunning = false;
  }
}

export async function startScheduler() {
  if (intervalHandle) return; // already started

  console.log("[Scheduler] Starting...");

  // 1. Initial burst: fetch all Tier 1 sources immediately
  console.log("[Scheduler] Initial fetch of Tier 1 sources...");
  for (const source of TIER1_SOURCES) {
    await processSource(source.id, true);
  }

  // 2. Refresh store counts
  const store = await getStore();
  const total = Object.keys(store.entries).length;
  console.log(`[Scheduler] Initial fetch complete. Total entries: ${total}`);

  // 3. Start periodic check (every 30 seconds)
  intervalHandle = setInterval(tick, 30_000);
  console.log("[Scheduler] Running (checks every 30s)");
}

export function stopScheduler() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    console.log("[Scheduler] Stopped");
  }
}
