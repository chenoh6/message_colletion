import type { Entry, SourceConfig, StoreData } from "./types";
import { scoreEntries } from "./scorer";

const STORE_PATH = process.cwd() + "/data/store.json";

// 最大保留条目数（超过则清理最旧的）
const MAX_ENTRIES = 500;
// 最大取日志数
const MAX_FETCH_LOGS = 50;

// In-memory cache
let cache: StoreData | null = null;
// 写防抖：500ms 内多次写合并为一次
let writeDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let writePending = false;

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

/**
 * 延迟写 + 防抖：连续多次写入合并为一次 I/O
 */
async function scheduleWrite(): Promise<void> {
  if (writePending) return;
  writePending = true;

  return new Promise((resolve) => {
    if (writeDebounceTimer) clearTimeout(writeDebounceTimer);
    writeDebounceTimer = setTimeout(async () => {
      try {
        const fs = await import("fs/promises");
        const path = await import("path");
        const dir = path.dirname(STORE_PATH);
        try { await fs.mkdir(dir, { recursive: true }); } catch {}
        await fs.writeFile(STORE_PATH, JSON.stringify(cache, null, 2), "utf-8");
      } catch (e) {
        console.error("[Store] Write failed:", e);
      } finally {
        writePending = false;
        writeDebounceTimer = null;
        resolve();
      }
    }, 500);
  });
}

/**
 * 持久化前精简 entry：去掉冗余的原始 HTML，限制文本长度
 */
function compactEntry(entry: Entry): Entry {
  const e = { ...entry };
  // 去掉原始 HTML（体积大头）
  delete (e as any).content;
  // 限制 contentText 长度
  if (e.contentText && e.contentText.length > 2000) {
    e.contentText = e.contentText.slice(0, 2000);
  }
  return e;
}

/**
 * 清理旧 entry：只保留最新的 N 条
 */
function pruneEntries(store: StoreData): void {
  const ids = Object.keys(store.entries);
  if (ids.length <= MAX_ENTRIES) return;

  // 按时间排序，删掉最旧的
  const sorted = ids
    .map((id) => ({ id, time: new Date(store.entries[id].isoDate || 0).getTime() }))
    .sort((a, b) => b.time - a.time);

  const toDelete = sorted.slice(MAX_ENTRIES);
  for (const { id } of toDelete) {
    delete store.entries[id];
  }
  console.log(`[Store] Pruned ${toDelete.length} old entries (${MAX_ENTRIES} remaining)`);
}

// ====== 导出函数 ======

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
    entries.sort((a, b) => {
      const scoreDiff = (b.score ?? 0) - (a.score ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.isoDate || 0).getTime() - new Date(a.isoDate || 0).getTime();
    });
  } else {
    entries.sort((a, b) => new Date(b.isoDate || 0).getTime() - new Date(a.isoDate || 0).getTime());
  }

  const offset = options?.offset || 0;
  const limit = options?.limit || entries.length;
  return entries.slice(offset, offset + limit).map((e) => ({
    ...e,
    // 返回给前端时保证没有 content（前端不需要原始 HTML）
    content: undefined,
  })) as any;
}

export async function getEntry(id: string): Promise<Entry | null> {
  const store = await readStore();
  const entry = store.entries[id];
  if (!entry) return null;
  const e = { ...entry };
  delete (e as any).content;
  return e;
}

export async function saveEntry(entry: Entry): Promise<void> {
  const store = await readStore();
  const existing = Object.entries(store.entries).find(([, e]) => e.url === entry.url);
  const compacted = compactEntry(entry);
  if (existing) {
    store.entries[existing[0]] = { ...existing[1], ...compacted, id: existing[0] };
  } else {
    store.entries[entry.id] = compacted;
    pruneEntries(store);
  }
  await scheduleWrite();
}

export async function saveEntries(entries: Entry[]): Promise<number> {
  const store = await readStore();
  let newCount = 0;

  const trulyNew: Entry[] = [];
  for (const entry of entries) {
    const existing = Object.entries(store.entries).find(([, e]) => e.url === entry.url);
    if (!existing) {
      trulyNew.push(entry);
    }
  }

  if (trulyNew.length === 0) return 0;

  // 评分：只对比最近的 200 条（跨源频次不需要全部历史）
  const allExisting = Object.values(store.entries);
  const { newEntries, updatedExisting } = scoreEntries(trulyNew, allExisting);

  for (const entry of newEntries) {
    store.entries[entry.id] = compactEntry(entry);
    newCount++;
  }
  for (const entry of updatedExisting) {
    store.entries[entry.id] = compactEntry(entry);
  }

  pruneEntries(store);
  await scheduleWrite();
  return newCount;
}

export async function markFetched(sourceId: string): Promise<void> {
  const store = await readStore();
  store.lastFetched[sourceId] = new Date().toISOString();
  await scheduleWrite();
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
  store.fetchLogs.push(log);
  if (store.fetchLogs.length > MAX_FETCH_LOGS) {
    store.fetchLogs = store.fetchLogs.slice(-MAX_FETCH_LOGS);
  }
  await scheduleWrite();
}

/**
 * 重算所有 entry 的评分
 */
export async function rescoreAllEntries(): Promise<number> {
  const store = await readStore();
  const entries = Object.values(store.entries);
  if (entries.length === 0) return 0;

  const { calculateScore } = await import("./scorer");
  for (const entry of entries) {
    const rescored = { ...entry };
    rescored.score = calculateScore(
      { title: entry.title, sourceId: entry.sourceId, isoDate: entry.isoDate, contentText: entry.contentText, summary: entry.summary },
      entries,
    );
    store.entries[entry.id] = compactEntry(rescored);
  }

  await scheduleWrite();
  return entries.length;
}

/**
 * 清理 store（调试用）
 */
export async function clearStore(): Promise<void> {
  cache = getDefaultStore();
  await scheduleWrite();
}
