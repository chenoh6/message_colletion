import { NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";

const MARKER = path.join(process.cwd(), "data", ".auto-fetch");
let started = false;

export async function POST(request: Request) {
  const { action } = await request.json();

  if (action === "start") {
    try { await mkdir(path.dirname(MARKER), { recursive: true }); } catch {}
    await writeFile(MARKER, "true", "utf-8");
    if (!started) {
      const { startScheduler } = await import("@/lib/scheduler");
      await startScheduler();
      started = true;
    }
    return NextResponse.json({ status: "started" });
  }

  if (action === "stop") {
    try { await unlink(MARKER); } catch {}
    const { stopScheduler } = await import("@/lib/scheduler");
    stopScheduler();
    started = false;
    return NextResponse.json({ status: "stopped" });
  }

  return NextResponse.json({ status: started ? "running" : "stopped", started });
}
