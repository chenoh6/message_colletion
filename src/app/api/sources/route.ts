import { NextResponse } from "next/server";
import { getAllSources, toggleSource, setSourcesEnabled, resetAllSources } from "@/lib/source-settings";
import { fetchSource } from "@/lib/fetcher";
import { saveEntries, markFetched, addFetchLog } from "@/lib/store";
import { processEntries } from "@/lib/ai-processor";
import { SOURCES } from "@/lib/sources";
import type { SourceConfig } from "@/lib/types";

/**
 * GET /api/sources
 *   返回所有信息源及其启用状态
 *   可选 ?category=ai 过滤分类
 *   可选 ?tier=1 过滤层级
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const tier = searchParams.get("tier");

  const sources = await getAllSources();

  let filtered = sources;
  if (category) {
    filtered = filtered.filter((s) => s.category === category);
  }
  if (tier) {
    filtered = filtered.filter((s) => s.tier === parseInt(tier));
  }

  // 按 tier 排序
  filtered.sort((a, b) => a.tier - b.tier || a.category.localeCompare(b.category));

  // 统计
  const enabledCount = filtered.filter((s) => s.enabled).length;
  const totalCount = filtered.length;

  return NextResponse.json({
    sources: filtered,
    enabledCount,
    totalCount,
  });
}

/**
 * PUT /api/sources
 *   { action: "toggle", sourceId: "..." }     → 切换单个
 *   { action: "batch", sourceIds: [...], enabled: true/false } → 批量
 *   { action: "reset" }                        → 恢复默认
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "toggle") {
      const nowEnabled = await toggleSource(body.sourceId);
      const source = (await getAllSources()).find((s) => s.id === body.sourceId);

      // 开启后立即触发一次采集（异步，不阻塞返回）
      if (nowEnabled && source) {
        const rawSource = SOURCES.find((s) => s.id === body.sourceId);
        if (rawSource) {
          triggerFetch(rawSource).catch((e) => console.error(`[Source] Initial fetch failed for ${rawSource.name}:`, e));
        }
      }

      return NextResponse.json({
        success: true,
        sourceId: body.sourceId,
        enabled: nowEnabled,
        source: source || null,
      });
    }

    if (body.action === "batch") {
      await setSourcesEnabled(body.sourceIds, body.enabled);

      // 批量开启后触发采集
      if (body.enabled) {
        for (const id of body.sourceIds) {
          const rawSource = SOURCES.find((s) => s.id === id);
          if (rawSource) {
            triggerFetch(rawSource).catch((e) => console.error(`[Source] Initial fetch failed for ${rawSource.name}:`, e));
          }
        }
      }

      return NextResponse.json({ success: true, sourceIds: body.sourceIds, enabled: body.enabled });
    }

    if (body.action === "reset") {
      await resetAllSources();
      return NextResponse.json({ success: true, message: "已恢复默认" });
    }

    return NextResponse.json({ error: "未知 action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * 开启源后立即触发首次采集
 */
async function triggerFetch(source: SourceConfig) {
  console.log(`[Source] First fetch for ${source.name}...`);
  const result = await fetchSource(source);
  if (result.entries.length > 0) {
    const newCount = await saveEntries(result.entries);
    if (newCount > 0 && process.env.DEEPSEEK_API_KEY) {
      const processed = await processEntries(result.entries.slice(0, newCount));
      for (const entry of processed) {
        await saveEntries([entry]);
      }
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
  console.log(`[Source] Done ${source.name}: ${result.entries.length} items${result.error ? ` (error: ${result.error})` : ""}`);
}
