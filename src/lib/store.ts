import type { Entry, SourceConfig, StoreData } from "./types";
import { scoreEntries } from "./scorer";

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
  sortBy?: "time" | "score";
}): Promise<Entry[]> {
  const store = await readStore();
  let entries = Object.values(store.entries);

  if (options?.source) {
    entries = entries.filter((e) => e.sourceId === options.source);
  }
  if (options?.category) {
    entries = entries.filter((e) => e.category === options.category);
  }

  if (options?.sortBy === "score") {
    // 按评分降序，评分相同则按时间
    entries.sort((a, b) => {
      const scoreDiff = (b.score ?? 0) - (a.score ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.isoDate || 0).getTime() - new Date(a.isoDate || 0).getTime();
    });
  } else {
    // 默认按时间降序（最新在前）
    entries.sort((a, b) => new Date(b.isoDate || 0).getTime() - new Date(a.isoDate || 0).getTime());
  }

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

  // 找到真正新增的 entry（去重）
  const trulyNew: Entry[] = [];
  for (const entry of entries) {
    const existing = Object.entries(store.entries).find(([, e]) => e.url === entry.url);
    if (!existing) {
      trulyNew.push(entry);
    }
  }

  if (trulyNew.length === 0) return 0;

  // 评分：跨源频次需要和已有 entry 比较
  const allExisting = Object.values(store.entries);
  const { newEntries, updatedExisting } = scoreEntries(trulyNew, allExisting);

  // 保存新 entry（含评分）
  for (const entry of newEntries) {
    store.entries[entry.id] = entry;
    newCount++;
  }

  // 更新因跨源频次变化的已有 entry
  for (const entry of updatedExisting) {
    store.entries[entry.id] = entry;
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

/**
 * 重算所有 entry 的评分（迁移用：给已有数据打分）
 */
export async function rescoreAllEntries(): Promise<number> {
  const store = await readStore();
  const entries = Object.values(store.entries);
  if (entries.length === 0) return 0;

  const { newEntries, updatedExisting } = scoreEntries([], entries);

  // 所有 entry 都要重算
  for (const entry of entries) {
    const rescored = { ...entry };
    // 对每个 entry 单独算分（传入全部 entries 用于跨源比较）
    const { calculateScore } = await import("./scorer");
    rescored.score = calculateScore(
      { title: entry.title, sourceId: entry.sourceId, isoDate: entry.isoDate, contentText: entry.contentText, summary: entry.summary },
      entries,
    );
    store.entries[entry.id] = rescored;
  }

  await writeStore();
  return entries.length;
}
