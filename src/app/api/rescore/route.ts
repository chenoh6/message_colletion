import { NextResponse } from "next/server";
import { rescoreAllEntries } from "@/lib/store";

export async function POST() {
  try {
    const count = await rescoreAllEntries();
    return NextResponse.json({
      success: true,
      rescored: count,
      message: `已重新评分 ${count} 条信息`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
