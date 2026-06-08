/**
 * 用户设置持久化
 *   - aiEnabled: 采集时是否执行 AI 解析（翻译+总结+解码）
 *   存储在 data/user-settings.json
 */

interface UserSettings {
  aiEnabled: boolean;
}

const SETTINGS_PATH = process.cwd() + "/data/user-settings.json";

let cache: UserSettings | null = null;

function getDefaults(): UserSettings {
  return { aiEnabled: true };
}

async function read(): Promise<UserSettings> {
  if (cache) return cache;
  try {
    const fs = await import("fs/promises");
    const raw = await fs.readFile(SETTINGS_PATH, "utf-8");
    cache = JSON.parse(raw);
    return cache!;
  } catch {
    cache = getDefaults();
    return cache!;
  }
}

async function write(): Promise<void> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const dir = path.dirname(SETTINGS_PATH);
  try { await fs.mkdir(dir, { recursive: true }); } catch {}
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(cache, null, 2), "utf-8");
}

export async function isAiEnabled(): Promise<boolean> {
  const s = await read();
  return s.aiEnabled;
}

export async function setAiEnabled(enabled: boolean): Promise<void> {
  const s = await read();
  s.aiEnabled = enabled;
  cache = s;
  await write();
}
