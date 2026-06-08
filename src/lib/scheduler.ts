import { fetchSource } from "./fetcher";
import { saveEntries, markFetched, shouldFetch, addFetchLog, getStore } from "./store";
import { processEntries } from "./ai-processor";
import { getEnabledSources, getEnabledTier1Sources } from "./source-settings";
import type { SourceConfig } from "./types";

let isRunning = false;
let intervalHandle: ReturnType<typeof setInterval> | null = null;

async function processSource(source: SourceConfig) {
  const needed = await shouldFetch(source);
  if (!needed) return;

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
    newEntries: result.entries.length,
    error: result.error,
  });

  if (result.error) {
    console.error(`[Scheduler] Error fetching ${source.name}: ${result.error}`);
  } else {
    console.log(`[Scheduler] Done ${source.name}: ${result.entries.length} items`);
  }
}

async function tick() {
  if (isRunning) return;
  isRunning = true;

  try {
    const activeSources = await getEnabledSources();
    for (const source of activeSources) {
      await processSource(source);
    }
  } catch (err) {
    console.error("[Scheduler] Tick error:", err);
  } finally {
    isRunning = false;
  }
}

export async function startScheduler() {
  if (intervalHandle) return;

  console.log("[Scheduler] Starting...");

  // 1. Initial burst: fetch all enabled Tier 1 sources
  console.log("[Scheduler] Initial fetch of Tier 1 sources...");
  const tier1Sources = await getEnabledTier1Sources();
  for (const source of tier1Sources) {
    await processSource(source);
  }

  // 2. Refresh store counts
  const store = await getStore();
  const total = Object.keys(store.entries).length;
  console.log(`[Scheduler] Initial fetch complete. Total entries: ${total}`);

  // 3. Start periodic check (every 2 minutes, 源自身有 interval 控制采集频率)
  intervalHandle = setInterval(tick, 120_000);
  console.log("[Scheduler] Running (checks every 2min)");
}

export function stopScheduler() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    console.log("[Scheduler] Stopped");
  }
}
