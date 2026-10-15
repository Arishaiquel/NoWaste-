import { NextRequest, NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demoTime";
import { getAdminSupabase } from "@/lib/supabase";
import { getStorageRule } from "@/lib/foodkeeper";
import { calculateFreshness } from "@/lib/freshness";
import { effectiveNow } from "@/lib/demoTime";
import type { StorageMethod } from "@/types/pantry";
import { DISCARD_REASONS } from "@/types/behavior";

export async function POST(request: NextRequest) {
  if (!isDemoMode()) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { id, action, storageMethod, discardReason } = await request.json().catch(() => ({})) as { id?: string; action?: string; storageMethod?: StorageMethod; discardReason?: string };
  if (!id || !["consumed", "frozen", "discarded", "storage"].includes(action ?? "")) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  const storageMethods: StorageMethod[] = ["refrigerator", "freezer", "pantry", "counter", "unknown"];
  if (action === "storage" && (!storageMethod || !storageMethods.includes(storageMethod))) return NextResponse.json({ error: "Invalid storage method" }, { status: 400 });
  if (action === "discarded" && (!discardReason || !DISCARD_REASONS.includes(discardReason as (typeof DISCARD_REASONS)[number]))) return NextResponse.json({ error: "Discard reason required" }, { status: 400 });
  const db = getAdminSupabase();
  const { data: current, error: currentError } = await db.from("pantry_items").select("food_category,purchase_date,freshness_risk,price,normalized_name").eq("id", id).eq("status", "active").single();
  if (currentError || !current) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  let patch: Record<string, unknown>;
  const timestamp = new Date().toISOString();
  if (action === "consumed") patch = { status: "consumed", consumed_at: timestamp, rescued_at: timestamp, action_risk: current.freshness_risk };
  else if (action === "discarded") patch = { status: "discarded", discarded_at: timestamp, discard_reason: discardReason, action_risk: current.freshness_risk };
  else {
    const nextStorage = action === "frozen" ? "freezer" : storageMethod!;
    const rule = getStorageRule(current.food_category, nextStorage);
    const freshness = calculateFreshness(current.purchase_date, rule?.max_days ?? null, await effectiveNow());
    patch = { storage_method: nextStorage, frozen_at: action === "frozen" ? timestamp : null, rescued_at: action === "frozen" ? timestamp : null, action_risk: action === "frozen" ? current.freshness_risk : null, shelf_life_min_days: rule?.min_days ?? null, shelf_life_max_days: rule?.max_days ?? null, freshness_risk: freshness.riskScore, freshness_status: freshness.status, last_alert_threshold: null, updated_at: timestamp };
  }
  let { error } = await db.from("pantry_items").update(patch).eq("id", id).eq("status", "active");
  // Temporary compatibility for deployments where migration 003 has not run yet.
  if (error?.code === "23514" && action === "discarded") {
    const legacyReason: Record<string, string> = { forgot_about_it: "forgot", spoiled_before_use: "spoiled", did_not_like: "disliked" };
    const retry = await db.from("pantry_items").update({ ...patch, discard_reason: legacyReason[discardReason!] ?? discardReason }).eq("id", id).eq("status", "active");
    error = retry.error;
  }
  return error ? NextResponse.json({ error: "Update failed" }, { status: 500 }) : NextResponse.json({ ok: true, item: { name: current.normalized_name, price: current.price, actionRisk: current.freshness_risk } });
}
