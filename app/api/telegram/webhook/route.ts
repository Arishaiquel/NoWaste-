import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase";
import { answerCallbackQuery, downloadTelegramPhoto, inlineKeyboard, sendMessage } from "@/lib/telegram";
import { parseReceiptImage } from "@/lib/receiptParser";
import { defaultStorageFor, getStorageRule } from "@/lib/foodkeeper";
import { calculateFreshness } from "@/lib/freshness";
import { pantryForUser } from "@/lib/pantry";
import { generateRecipes } from "@/lib/recipes";
import type { TelegramUpdate, TelegramUser } from "@/types/telegram";
import type { ReceiptExtraction } from "@/schemas/receipt";
import type { DiscardReason } from "@/types/behavior";
import { createHash } from "node:crypto";

export const runtime = "nodejs";
export const maxDuration = 60;

const WELCOME = `👋 Welcome to NoWaste!\n\nSend me a photo of your grocery receipt and I'll turn it into a digital pantry.\n\nI'll help you keep track of what you bought and remind you when food should be prioritised.\n\nTry sending me a grocery receipt 📸\n\nFreshness estimates are guidance only and are not a determination that food is safe or unsafe to eat.`;
const DISCARD_REASON_CODES: Record<string, { value: DiscardReason; label: string }> = {
  f: { value: "forgot_about_it", label: "Forgot about it" }, b: { value: "bought_too_much", label: "Bought too much" },
  s: { value: "spoiled_before_use", label: "Spoiled before use" }, c: { value: "changed_plans", label: "Changed plans" },
  d: { value: "did_not_like", label: "Did not like it" }, t: { value: "storage_issue", label: "Storage issue" }, o: { value: "other", label: "Other" },
};

function validSecret(request: NextRequest) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const received = request.headers.get("x-telegram-bot-api-secret-token");
  return !!expected && received === expected;
}

async function upsertUser(from: TelegramUser, chatId: number) {
  const db = getAdminSupabase();
  const { data, error } = await db.from("telegram_users").upsert({
    telegram_user_id: from.id, telegram_chat_id: chatId, username: from.username ?? null, first_name: from.first_name ?? null,
  }, { onConflict: "telegram_user_id" }).select().single();
  if (error) throw error;
  return data;
}

function icon(status: string) { return status === "Check now" ? "🔴" : status === "High priority" ? "🟠" : status === "Use soon" ? "🟡" : "🟢"; }

async function showPantry(chatId: number, userId: string) {
  const items = await pantryForUser(userId);
  if (!items.length) return sendMessage(chatId, "🧺 Your pantry is empty. Send me a receipt photo to add groceries.");
  const lines = items.slice(0, 20).map((item) => `${icon(item.status)} ${item.normalized_name}\n${item.status} · bought ${item.elapsedDays} day${item.elapsedDays === 1 ? "" : "s"} ago`);
  return sendMessage(chatId, `🧺 Your Pantry\n\n${lines.join("\n\n")}\n\nEstimates assume the storage method shown in NoWaste!. Storage and handling conditions may change these estimates.`);
}

async function showStats(chatId: number, userId: string) {
  const { data, error } = await getAdminSupabase().from("pantry_items").select("status,freshness_risk,price,food_category").eq("user_id", userId);
  if (error) throw error;
  const rows = data ?? [];
  const consumed = rows.filter((x) => x.status === "consumed");
  const discarded = rows.filter((x) => x.status === "discarded");
  const atRisk = rows.filter((x) => x.status === "active" && (x.freshness_risk ?? 0) >= 70).length;
  const consumedValue = consumed.filter((x) => (x.freshness_risk ?? 100) < 70).reduce((s, x) => s + Number(x.price ?? 0), 0);
  const counts = new Map<string, number>();
  discarded.forEach((x) => counts.set(x.food_category, (counts.get(x.food_category) ?? 0) + 1));
  const mostDiscarded = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0]?.replaceAll("_", " ") ?? "None yet";
  return sendMessage(chatId, `📊 Your NoWaste! Stats\n\nGroceries tracked: ${rows.length}\nConsumed: ${consumed.length}\nDiscarded: ${discarded.length}\nCurrently at risk: ${atRisk}\n\nEstimated grocery value consumed before high-risk stage: $${consumedValue.toFixed(2)}\n\nMost discarded category: ${mostDiscarded}`);
}

async function rescue(chatId: number, userId: string) {
  const pantry = await pantryForUser(userId);
  if (!pantry.length) return sendMessage(chatId, "Your pantry is empty. Send a receipt photo first.");
  await sendMessage(chatId, "🍳 Finding the best ways to rescue your food...");
  const recipes = await generateRecipes(pantry.map((x) => ({ normalized_name: x.normalized_name, quantity: Number(x.quantity), food_category: x.food_category, freshnessRisk: x.riskScore ?? 0, price: x.price === null ? null : Number(x.price) })));
  await getAdminSupabase().from("recipe_generations").insert({ user_id: userId, recipe_json: recipes });
  const text = recipes.map((r, i) => {
    const high = r.ingredients_used.filter((name) => pantry.some((p) => p.normalized_name.toLowerCase() === name.toLowerCase() && (p.riskScore ?? 0) >= 70)).length;
    return `${i + 1}. ${r.name} (${r.time_minutes} min)\nUses: ${r.ingredients_used.join(", ")}\n${r.additional_ingredients.length ? `Optional / need to buy: ${r.additional_ingredients.join(", ")}\n` : ""}Why this recipe? It uses ${high} of your highest-priority ingredients.`;
  }).join("\n\n");
  return sendMessage(chatId, `🍳 Rescue ideas\n\n${text}`);
}

async function confirmReceipt(chatId: number, userId: string, receiptId: string) {
  const db = getAdminSupabase();
  const { data: receipt, error } = await db.from("receipts").select("*").eq("id", receiptId).eq("user_id", userId).single();
  if (error || !receipt) throw error ?? new Error("Receipt not found");
  if (receipt.status === "confirmed") return sendMessage(chatId, "This receipt is already in your pantry.");
  if (receipt.status !== "pending") return sendMessage(chatId, "This receipt is no longer awaiting confirmation.");
  const extraction = receipt.extraction_json as ReceiptExtraction;
  const rows = extraction.items.map((item) => {
    const storage = defaultStorageFor(item.food_category);
    const rule = getStorageRule(item.food_category, storage);
    const freshness = calculateFreshness(receipt.purchase_date, rule?.max_days ?? null);
    return { receipt_id: receipt.id, user_id: userId, raw_name: item.raw_receipt_name, normalized_name: item.normalized_name, food_category: item.food_category,
      quantity: item.quantity, unit: item.unit, price: item.price, purchase_date: receipt.purchase_date, storage_method: storage, perishable: item.perishable,
      extraction_confidence: item.confidence, needs_review: item.needs_review, shelf_life_min_days: rule?.min_days ?? null, shelf_life_max_days: rule?.max_days ?? null,
      freshness_risk: freshness.riskScore, freshness_status: freshness.status };
  });
  const { error: insertError } = await db.from("pantry_items").upsert(rows, { onConflict: "receipt_id,raw_name,normalized_name", ignoreDuplicates: true });
  if (insertError) throw insertError;
  await db.from("receipts").update({ status: "confirmed" }).eq("id", receipt.id).eq("status", "pending");
  const assumptions = [...new Set(rows.map((x) => x.storage_method))].join(", ");
  return sendMessage(chatId, `✅ Added ${rows.length} groceries to your pantry.\n\nStorage assumptions: ${assumptions}. You can change these in the dashboard. Freshness estimates are guidance only.`);
}

async function handleCallback(update: TelegramUpdate, user: { id: string; telegram_chat_id: number }) {
  const callback = update.callback_query!;
  const data = callback.data ?? "";
  await answerCallbackQuery(callback.id);
  if (data.startsWith("receipt:add:")) return confirmReceipt(user.telegram_chat_id, user.id, data.slice(12));
  if (data.startsWith("receipt:cancel:")) {
    await getAdminSupabase().from("receipts").update({ status: "cancelled" }).eq("id", data.slice(15)).eq("user_id", user.id);
    return sendMessage(user.telegram_chat_id, "❌ Receipt cancelled. Nothing was added.");
  }
  if (data.startsWith("receipt:review:")) return sendMessage(user.telegram_chat_id, "✏️ Review flagged. For this MVP, cancel this receipt and resend a clearer photo if an item is wrong. Storage assumptions can be edited in the dashboard.");
  if (data === "rescue") return rescue(user.telegram_chat_id, user.id);
  const reasonMatch = data.match(/^discard:([fbsctdo]):([0-9a-f-]+)$/);
  if (reasonMatch) {
    const [, code, id] = reasonMatch;
    const reason = DISCARD_REASON_CODES[code];
    const db = getAdminSupabase();
    const { data: current, error: readError } = await db.from("pantry_items").select("freshness_risk,normalized_name").eq("id", id).eq("user_id", user.id).eq("status", "active").single();
    if (readError || !current) return sendMessage(user.telegram_chat_id, "That item is no longer active in your pantry.");
    const now = new Date().toISOString();
    const patch = { status: "discarded", discarded_at: now, discard_reason: reason.value, action_risk: Number(current.freshness_risk ?? 0) };
    let { error } = await db.from("pantry_items").update(patch).eq("id", id).eq("user_id", user.id).eq("status", "active");
    if (error?.code === "23514") {
      const legacyReason: Record<string, string> = { forgot_about_it: "forgot", spoiled_before_use: "spoiled", did_not_like: "disliked" };
      const retry = await db.from("pantry_items").update({ ...patch, discard_reason: legacyReason[reason.value] ?? reason.value }).eq("id", id).eq("user_id", user.id).eq("status", "active");
      error = retry.error;
    }
    if (error) throw error;
    return sendMessage(user.telegram_chat_id, `🗑 Discard logged: ${current.normalized_name}.\nReason: ${reason.label}.\n\nThis structured outcome will help make future purchase guidance more useful.`);
  }
  const match = data.match(/^item:(consumed|frozen|discarded):([0-9a-f-]+)$/);
  if (match) {
    const [, action, id] = match;
    if (action === "discarded") return sendMessage(user.telegram_chat_id, "Why are you discarding this item?", inlineKeyboard([
      [{ text: "Forgot about it", callback_data: `discard:f:${id}` }, { text: "Bought too much", callback_data: `discard:b:${id}` }],
      [{ text: "Spoiled before use", callback_data: `discard:s:${id}` }, { text: "Changed plans", callback_data: `discard:c:${id}` }],
      [{ text: "Did not like it", callback_data: `discard:d:${id}` }, { text: "Storage issue", callback_data: `discard:t:${id}` }],
      [{ text: "Other", callback_data: `discard:o:${id}` }],
    ]));
    const db = getAdminSupabase();
    const { data: current, error: readError } = await db.from("pantry_items").select("freshness_risk").eq("id", id).eq("user_id", user.id).single();
    if (readError) throw readError;
    const now = new Date().toISOString();
    const actionRisk = Number(current.freshness_risk ?? 0);
    const patch = action === "consumed" ? { status: "consumed", consumed_at: now, rescued_at: now, action_risk: actionRisk } : { storage_method: "freezer", frozen_at: now, rescued_at: now, action_risk: actionRisk, last_alert_threshold: null };
    const { error } = await db.from("pantry_items").update(patch).eq("id", id).eq("user_id", user.id).eq("status", "active");
    if (error) throw error;
    return sendMessage(user.telegram_chat_id, action === "frozen" ? "🧊 Marked frozen. Its freshness estimate will be recalculated using freezer guidance where available." : `✅ Marked ${action}.`);
  }
}

async function handlePhoto(update: TelegramUpdate, user: { id: string; telegram_chat_id: number }) {
  const message = update.message!;
  await sendMessage(message.chat.id, "🧾 Reading your receipt...");
  const photos = [...(message.photo ?? [])].sort((a, b) => (b.file_size ?? b.width * b.height) - (a.file_size ?? a.width * a.height));
  const image = await downloadTelegramPhoto(photos[0].file_id);
  const extraction = await parseReceiptImage(image.bytes, image.mimeType);
  if (!extraction.items.length) return sendMessage(message.chat.id, "I couldn't find grocery items in that image. Please send a clearer, complete receipt photo.");
  const purchaseDate = extraction.purchase_date ?? new Date().toISOString().slice(0, 10);
  const { data: receipt, error } = await getAdminSupabase().from("receipts").upsert({ user_id: user.id, telegram_message_id: message.message_id, store_name: extraction.store_name, purchase_date: purchaseDate, currency: extraction.currency, extraction_json: extraction }, { onConflict: "user_id,telegram_message_id" }).select().single();
  if (error) throw error;
  const uncertain = extraction.items.filter((x) => x.needs_review || x.confidence < 0.75).length;
  const items = extraction.items.map((x, i) => `${i + 1}. ${x.needs_review || x.confidence < 0.75 ? "⚠️" : "•"} ${x.normalized_name}`).join("\n");
  const warning = uncertain ? `\n\n⚠️ I wasn't completely sure about ${uncertain} item${uncertain === 1 ? "" : "s"}.` : "";
  const dateNote = extraction.purchase_date ? "" : `\n\n⚠️ No purchase date was visible; assuming ${purchaseDate}.`;
  return sendMessage(message.chat.id, `🧾 I found ${extraction.items.length} groceries:\n\n${items}${warning}${dateNote}\n\nDoes this look right?`, inlineKeyboard([
    [{ text: "✅ Add to pantry", callback_data: `receipt:add:${receipt.id}` }],
    [{ text: "✏️ Review items", callback_data: `receipt:review:${receipt.id}` }],
    [{ text: "❌ Cancel", callback_data: `receipt:cancel:${receipt.id}` }],
  ]));
}

async function processUpdate(update: TelegramUpdate) {
  const message = update.message ?? update.callback_query?.message;
  const from = update.message?.from ?? update.callback_query?.from;
  if (!message || !from) return;
  const user = await upsertUser(from, message.chat.id);
  if (update.callback_query) return handleCallback(update, user);
  if (message.photo?.length) return handlePhoto(update, user);
  const command = message.text?.trim().split(/\s/)[0].toLowerCase();
  const startParameter = message.text?.trim().split(/\s+/)[1];
  if (command === "/start" && startParameter?.startsWith("link_")) {
    const token = startParameter.slice(5);
    if (!/^[a-f0-9]{48}$/.test(token)) return sendMessage(message.chat.id, "That account-linking code is invalid. Create a new one from the NoWaste! website.");
    const db = getAdminSupabase();
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const { data: link } = await db.from("telegram_link_tokens").select("id,auth_user_id,expires_at,used_at").eq("token_hash", tokenHash).maybeSingle();
    if (!link || link.used_at || Date.parse(link.expires_at) <= Date.now()) return sendMessage(message.chat.id, "That account-linking code has expired. Create a new one from the NoWaste! website.");
    const { data: existing } = await db.from("telegram_users").select("id").eq("auth_user_id", link.auth_user_id).neq("id", user.id).maybeSingle();
    if (existing) return sendMessage(message.chat.id, "That web account is already linked to another Telegram account.");
    const { error } = await db.from("telegram_users").update({ auth_user_id: link.auth_user_id }).eq("id", user.id);
    if (error) throw error;
    await db.from("telegram_link_tokens").update({ used_at: new Date().toISOString() }).eq("id", link.id).is("used_at", null);
    return sendMessage(message.chat.id, "✅ Telegram is now linked to your NoWaste! web account. Your kitchen and Coach will show only your data.");
  }
  if (command === "/start" && startParameter === "rescue") return rescue(message.chat.id, user.id);
  if (command === "/start") return sendMessage(message.chat.id, WELCOME);
  if (command === "/help") return sendMessage(message.chat.id, "Send a receipt photo, or use /pantry, /rescue, or /stats. Freshness estimates are guidance only and never a food-safety determination.");
  if (command === "/pantry") return showPantry(message.chat.id, user.id);
  if (command === "/rescue") return rescue(message.chat.id, user.id);
  if (command === "/stats") return showStats(message.chat.id, user.id);
  return sendMessage(message.chat.id, "Send me a grocery receipt photo, or use /pantry, /rescue, /stats, or /help.");
}

export async function POST(request: NextRequest) {
  if (!validSecret(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let update: TelegramUpdate;
  try { update = await request.json() as TelegramUpdate; } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!Number.isSafeInteger(update.update_id)) return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  const db = getAdminSupabase();
  const { error: reserveError } = await db.from("processed_telegram_updates").insert({ update_id: update.update_id });
  if (reserveError?.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
  if (reserveError) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    await processUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram update failed", { updateId: update.update_id, error: error instanceof Error ? error.message : "Unknown error" });
    await db.from("processed_telegram_updates").delete().eq("update_id", update.update_id);
    const chatId = update.message?.chat.id ?? update.callback_query?.message?.chat.id;
    if (chatId) await sendMessage(chatId, "Something went wrong while processing that. Please try again.").catch(() => undefined);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
