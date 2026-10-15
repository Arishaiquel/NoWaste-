import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth/server";
import { linkedTelegramUserId } from "@/lib/auth/linkedUser";
import { getAdminSupabase } from "@/lib/supabase";
import { defaultStorageFor, getStorageRule } from "@/lib/foodkeeper";
import { calculateFreshness } from "@/lib/freshness";
import type { ReceiptExtraction } from "@/schemas/receipt";

export async function POST(request: Request) {
  const authUser = await requireAuthUser();
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = await linkedTelegramUserId(authUser.id);
  if (!userId) return NextResponse.json({ error: "Link Telegram first" }, { status: 403 });
  const { receiptId } = await request.json().catch(() => ({})) as { receiptId?: string };
  if (!receiptId) return NextResponse.json({ error: "Invalid receipt" }, { status: 400 });
  const db = getAdminSupabase();
  const { data: receipt } = await db.from("receipts").select("*").eq("id", receiptId).eq("user_id", userId).eq("status", "pending").maybeSingle();
  if (!receipt) return NextResponse.json({ error: "Receipt not found or already confirmed" }, { status: 404 });
  const extraction = receipt.extraction_json as ReceiptExtraction;
  const rows = extraction.items.map((item) => {
    const storage = defaultStorageFor(item.food_category);
    const rule = getStorageRule(item.food_category, storage);
    const freshness = calculateFreshness(receipt.purchase_date, rule?.max_days ?? null);
    return { receipt_id: receipt.id, user_id: userId, raw_name: item.raw_receipt_name, normalized_name: item.normalized_name, food_category: item.food_category, quantity: item.quantity, unit: item.unit, price: item.price, purchase_date: receipt.purchase_date, storage_method: storage, perishable: item.perishable, extraction_confidence: item.confidence, needs_review: item.needs_review, shelf_life_min_days: rule?.min_days ?? null, shelf_life_max_days: rule?.max_days ?? null, freshness_risk: freshness.riskScore, freshness_status: freshness.status };
  });
  const { error } = await db.from("pantry_items").upsert(rows, { onConflict: "receipt_id,raw_name,normalized_name", ignoreDuplicates: true });
  if (error) return NextResponse.json({ error: "Could not add groceries" }, { status: 500 });
  await db.from("receipts").update({ status: "confirmed" }).eq("id", receipt.id).eq("user_id", userId).eq("status", "pending");
  return NextResponse.json({ ok: true, count: rows.length });
}

