import { NextResponse } from "next/server";
import { getAllSources, toggleSource, setSourcesEnabled, resetAllSources } from "@/lib/source-settings";

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
      return NextResponse.json({
        success: true,
        sourceId: body.sourceId,
        enabled: nowEnabled,
        source: source || null,
      });
    }

    if (body.action === "batch") {
      await setSourcesEnabled(body.sourceIds, body.enabled);
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
