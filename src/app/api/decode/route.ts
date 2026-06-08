import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { processEntries } from "@/lib/ai-processor";

export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const key = searchParams.get("key");
  const model = searchParams.get("model") || "deepseek-v4-flash";

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Set credentials from request params
  if (key) process.env.DEEPSEEK_API_KEY = key;
  process.env.AI_MODEL = model;

  const store = await getStore();
  const entry = store.entries[id];
  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  // Process only this entry
  const processed = await processEntries([entry as any]);
  if (!processed.length) {
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  // Save result
  const { saveEntry } = await import("@/lib/store");
  await saveEntry(processed[0]);

  return NextResponse.json({ entry: processed[0] });
}
