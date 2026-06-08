/**
 * 信息源热拔插设置 — 持久化模块
 *
 * 用户在后端开关信息源，设置保存在 data/source-settings.json
 * 与硬编码的 sources.ts 解耦，实现运行时热拔插
 */

import { SOURCES } from "./sources";
import type { SourceConfig } from "./types";

interface SourceSettings {
  enabled: Record<string, boolean>;  // sourceId → true/false
}

const SETTINGS_PATH = process.cwd() + "/data/source-settings.json";

let cache: SourceSettings | null = null;

function getDefaultSettings(): SourceSettings {
  // 默认全部关闭，用户手动选择后才采集
  const enabled: Record<string, boolean> = {};
  for (const s of SOURCES) {
    enabled[s.id] = false;
  }
  return { enabled };
}

async function readSettings(): Promise<SourceSettings> {
  if (cache) return cache;
  try {
    const fs = await import("fs/promises");
    const raw = await fs.readFile(SETTINGS_PATH, "utf-8");
    cache = JSON.parse(raw);
    return cache!;
  } catch {
    cache = getDefaultSettings();
    return cache!;
  }
}

async function writeSettings(): Promise<void> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const dir = path.dirname(SETTINGS_PATH);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch { /* ignore */ }
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(cache, null, 2), "utf-8");
}

/**
 * 获取所有源及其当前启/禁用状态
 * 返回 SourceConfig 加 enabled 字段
 */
export async function getAllSources(): Promise<(SourceConfig & { enabled: boolean })[]> {
  const settings = await readSettings();
  return SOURCES.map((s) => ({
    ...s,
    enabled: settings.enabled[s.id] ?? s.active,
  }));
}

/**
 * 获取当前启用的源列表（供采集器/调度器使用）
 */
export async function getEnabledSources(): Promise<SourceConfig[]> {
  const settings = await readSettings();
  return SOURCES.filter((s) => {
    const enabled = settings.enabled[s.id];
    return enabled ?? s.active;
  });
}

/**
 * 获取当前启用的 Tier 1 源
 */
export async function getEnabledTier1Sources(): Promise<SourceConfig[]> {
  const enabled = await getEnabledSources();
  return enabled.filter((s) => s.tier === 1);
}

/**
 * 切换一个源的启用/禁用状态
 */
export async function toggleSource(sourceId: string): Promise<boolean> {
  const settings = await readSettings();
  const current = settings.enabled[sourceId] ?? SOURCES.find((s) => s.id === sourceId)?.active ?? true;
  settings.enabled[sourceId] = !current;
  cache = settings;
  await writeSettings();
  return settings.enabled[sourceId];
}

/**
 * 批量设置源状态
 */
export async function setSourcesEnabled(sourceIds: string[], enabled: boolean): Promise<void> {
  const settings = await readSettings();
  for (const id of sourceIds) {
    settings.enabled[id] = enabled;
  }
  cache = settings;
  await writeSettings();
}

/**
 * 重置所有源到默认状态
 */
export async function resetAllSources(): Promise<void> {
  cache = getDefaultSettings();
  await writeSettings();
}
