import { NextResponse } from "next/server";
import { isAiEnabled, setAiEnabled } from "@/lib/settings";

export async function GET() {
  const aiEnabled = await isAiEnabled();
  return NextResponse.json({ aiEnabled });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.aiEnabled === "boolean") {
      await setAiEnabled(body.aiEnabled);
      return NextResponse.json({ success: true, aiEnabled: body.aiEnabled });
    }
    return NextResponse.json({ error: "aiEnabled must be boolean" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
