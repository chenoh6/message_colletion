import type { Entry, SourceConfig, StoreData } from "./types";

const STORE_PATH = process.cwd() + "/data/store.json";

// In-memory cache (faster than reading file every time)
let cache: StoreData | null = null;

function getDefaultStore(): StoreData {
  return {
    entries: {},
    fetchLogs: [],
    lastFetched: {},
  };
}

function needsFetch(source: SourceConfig): boolean {
  const last = cache?.lastFetched[source.id];
  if (!last) return true;
  const elapsed = Date.now() - new Date(last).getTime();
  return elapsed > source.interval * 60 * 1000;
}

async function readStore(): Promise<StoreData> {
  if (cache) return cache;
  try {
    const fs = await import("fs/promises");
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    cache = JSON.parse(raw);
    return cache!;
  } catch {
    cache = getDefaultStore();
    return cache!;
  }
}

async function writeStore(): Promise<void> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const dir = path.dirname(STORE_PATH);
  try { await fs.mkdir(dir, { recursive: true }); } catch {}
  await fs.writeFile(STORE_PATH, JSON.stringify(cache, null, 2), "utf-8");
}

export async function getStore(): Promise<StoreData> {
  return readStore();
}

export async function getEntries(options?: {
  source?: string;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<Entry[]> {
  const store = await readStore();
  let entries = Object.values(store.entries);

  if (options?.source) {
    entries = entries.filter((e) => e.sourceId === options.source);
  }
  if (options?.category) {
    entries = entries.filter((e) => e.category === options.category);
  }

  entries.sort((a, b) => new Date(b.isoDate || 0).getTime() - new Date(a.isoDate || 0).getTime());

  const offset = options?.offset || 0;
  const limit = options?.limit || entries.length;
  return entries.slice(offset, offset + limit);
}

export async function getEntry(id: string): Promise<Entry | null> {
  const store = await readStore();
  return store.entries[id] || null;
}

export async function saveEntry(entry: Entry): Promise<void> {
  const store = await readStore();
  // Dedup by URL
  const existing = Object.entries(store.entries).find(([, e]) => e.url === entry.url);
  if (existing) {
    // Update existing
    store.entries[existing[0]] = { ...existing[1], ...entry, id: existing[0] };
  } else {
    store.entries[entry.id] = entry;
  }
  await writeStore();
}

export async function saveEntries(entries: Entry[]): Promise<number> {
  const store = await readStore();
  let newCount = 0;
  for (const entry of entries) {
    const existing = Object.entries(store.entries).find(([, e]) => e.url === entry.url);
    if (!existing) {
      store.entries[entry.id] = entry;
      newCount++;
    }
  }
  await writeStore();
  return newCount;
}

export async function markFetched(sourceId: string): Promise<void> {
  const store = await readStore();
  store.lastFetched[sourceId] = new Date().toISOString();
  await writeStore();
}

export async function shouldFetch(source: SourceConfig): Promise<boolean> {
  await readStore();
  return needsFetch(source);
}

export async function getFetchLogs(limit = 20) {
  const store = await readStore();
  return (store.fetchLogs || []).slice(-limit).reverse();
}

export async function addFetchLog(log: { sourceId: string; sourceName: string; entries: number; newEntries: number; error?: string }): Promise<void> {
  const store = await readStore();
  store.fetchLogs.push({ ...log, sourceId: log.sourceId, sourceName: log.sourceName, entries: log.entries, newEntries: log.newEntries, error: log.error });
  if (store.fetchLogs.length > 200) store.fetchLogs = store.fetchLogs.slice(-200);
  await writeStore();
}
