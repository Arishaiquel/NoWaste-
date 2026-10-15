import { getAdminSupabase } from "@/lib/supabase";
import { effectiveNow } from "@/lib/demoTime";
import { getStorageRule } from "@/lib/foodkeeper";
import { calculateFreshness, crossedThreshold } from "@/lib/freshness";
import { inlineKeyboard, sendMessage } from "@/lib/telegram";
import { crossedBehavioralThreshold, getBehavioralAlertRule } from "@/lib/behavioralAlerts";
import { databaseRowsToOutcomes, outcomesToPurchases, type OutcomeDatabaseRow } from "@/lib/behaviorData";
import type { BehaviorPurchase } from "@/types/behavior";

export async function runFreshnessCheck() {
  const db = getAdminSupabase();
  const now = await effectiveNow();
  const { data: items, error } = await db.from("pantry_items").select("*,telegram_users!inner(telegram_chat_id)").eq("status", "active");
  if (error) throw error;
  let behaviorHistory: BehaviorPurchase[] = [];
  const { data: outcomeRows, error: outcomeError } = await db.from("food_outcomes").select("*,pantry_items!inner(quantity,unit,purchase_date,storage_method)").order("action_at", { ascending: false });
  if (!outcomeError) behaviorHistory = outcomesToPurchases(databaseRowsToOutcomes((outcomeRows ?? []) as unknown as OutcomeDatabaseRow[]));
  let alertsSent = 0;
  for (const item of items ?? []) {
    const rule = getStorageRule(item.food_category, item.storage_method);
    const result = calculateFreshness(item.purchase_date, rule?.max_days ?? null, now);
    const alertRule = getBehavioralAlertRule(item.normalized_name, behaviorHistory.filter((purchase) => purchase.userId === item.user_id));
    const regularThreshold = crossedThreshold(item.last_alert_threshold, result.riskScore);
    const behavioralThreshold = crossedBehavioralThreshold(item.last_alert_threshold, result.riskScore, alertRule);
    const threshold = behavioralThreshold && (!regularThreshold || behavioralThreshold > regularThreshold) ? behavioralThreshold : regularThreshold;
    await db.from("pantry_items").update({ shelf_life_min_days: rule?.min_days ?? null, shelf_life_max_days: rule?.max_days ?? null, freshness_risk: result.riskScore, freshness_status: result.status, updated_at: new Date().toISOString() }).eq("id", item.id);
    if (!threshold) continue;
    const exceeded = result.windowExceeded ? "\n\nEstimated storage window exceeded." : "";
    const caution = ["raw_poultry", "raw_meat", "fish"].includes(item.food_category) ? "\n\nFor higher-risk foods, follow official handling guidance and never taste food to determine safety." : "";
    const behaviorNote = threshold === alertRule?.threshold ? `\n\n${alertRule.reason}` : "";
    const text = `${result.status === "Use soon" ? "🟡" : "🔴"} Use-soon alert\n\nYour ${item.normalized_name.toLowerCase()} was purchased ${result.elapsedDays} days ago and is approaching its estimated freshness window.\n\nFreshness priority: ${result.status}\n\nStorage assumption:\n${item.storage_method}${behaviorNote}\n\nStorage and handling conditions may change this estimate.${exceeded}${caution}\n\nWant ideas to use it with your other groceries?`;
    const { error: alertError } = await db.from("alerts").insert({ user_id: item.user_id, pantry_item_id: item.id, threshold, message: text });
    if (alertError?.code === "23505") continue;
    if (alertError) throw alertError;
    try {
      await sendMessage(Number(item.telegram_users.telegram_chat_id), text, inlineKeyboard([
        [{ text: "🍳 Rescue my food", callback_data: "rescue" }],
        [{ text: "✅ I ate it", callback_data: `item:consumed:${item.id}` }, { text: "🧊 I froze it", callback_data: `item:frozen:${item.id}` }],
        [{ text: "🗑 I discarded it", callback_data: `item:discarded:${item.id}` }],
      ]));
      await db.from("pantry_items").update({ last_alert_threshold: threshold }).eq("id", item.id);
      alertsSent++;
    } catch (sendError) {
      await db.from("alerts").delete().eq("pantry_item_id", item.id).eq("threshold", threshold);
      console.error("Freshness alert failed", { itemId: item.id, error: sendError instanceof Error ? sendError.message : "Unknown error" });
    }
  }
  return { checked: items?.length ?? 0, alertsSent, simulatedNow: now.toISOString() };
}
