import { NextRequest, NextResponse } from "next/server";
import { runFreshnessCheck } from "@/lib/freshnessJob";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json(await runFreshnessCheck()); }
  catch (error) {
    console.error("Freshness cron failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Freshness check failed" }, { status: 500 });
  }
}
