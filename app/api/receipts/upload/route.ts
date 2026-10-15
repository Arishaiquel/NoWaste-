import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth/server";
import { linkedTelegramUserId } from "@/lib/auth/linkedUser";
import { parseReceiptImage } from "@/lib/receiptParser";
import { getAdminSupabase } from "@/lib/supabase";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const authUser = await requireAuthUser();
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = await linkedTelegramUserId(authUser.id);
  if (!userId) return NextResponse.json({ error: "Link Telegram before uploading" }, { status: 403 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("receipt");
  if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size === 0 || file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Upload a JPG, PNG, or WebP receipt up to 8 MB" }, { status: 400 });
  try {
    const extraction = await parseReceiptImage(new Uint8Array(await file.arrayBuffer()), file.type);
    if (!extraction.items.length) return NextResponse.json({ error: "No grocery items were found. Try a clearer receipt photo." }, { status: 422 });
    const purchaseDate = extraction.purchase_date ?? new Date().toISOString().slice(0, 10);
    const { data, error } = await getAdminSupabase().from("receipts").insert({ user_id: userId, telegram_message_id: null, store_name: extraction.store_name, purchase_date: purchaseDate, currency: extraction.currency, extraction_json: extraction, status: "pending" }).select("id").single();
    if (error) throw error;
    return NextResponse.json({ receiptId: data.id, purchaseDate, extraction });
  } catch (error) {
    console.error("Web receipt upload failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "We couldn't process that receipt. Please try again." }, { status: 500 });
  }
}

