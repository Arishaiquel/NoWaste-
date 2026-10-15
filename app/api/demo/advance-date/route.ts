import { NextRequest, NextResponse } from "next/server";
import { isDemoMode, setDemoOffset } from "@/lib/demoTime";

export async function POST(request: NextRequest) {
  if (!isDemoMode()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await request.json().catch(() => null) as { days?: number } | null;
  if (!body || ![0, 1, 3, 7].includes(body.days ?? -1)) return NextResponse.json({ error: "Invalid offset" }, { status: 400 });
  const { error } = await setDemoOffset(body.days!);
  if (error) return NextResponse.json({ error: "Could not update demo time" }, { status: 500 });
  return NextResponse.json({ ok: true, days: body.days });
}
