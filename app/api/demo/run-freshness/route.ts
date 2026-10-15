import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demoTime";
import { runFreshnessCheck } from "@/lib/freshnessJob";

export async function POST() {
  if (!isDemoMode()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try { return NextResponse.json(await runFreshnessCheck()); }
  catch (error) {
    console.error("Demo freshness check failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Freshness check failed" }, { status: 500 });
  }
}
