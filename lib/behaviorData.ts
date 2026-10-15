import type { BehaviorPurchase, DiscardReason, FoodOutcome } from "@/types/behavior";

interface OutcomeDatabaseRow {
  id: string; user_id: string; pantry_item_id: string; normalized_name: string; food_category: string;
  action: "consumed" | "discarded" | "frozen"; quantity: number | string; unit: string | null;
  price_value: number | string | null; discard_reason: DiscardReason | null; freshness_risk_at_action: number | null;
  action_at: string; pantry_items: { quantity: number | string; unit: string | null; purchase_date: string; storage_method: string };
}

interface LegacyPantryRow {
  id: string; user_id: string; normalized_name: string; food_category: string; quantity: number | string; unit: string | null;
  price: number | string | null; purchase_date: string; storage_method: string; consumed_at: string | null; discarded_at: string | null;
  frozen_at: string | null; discard_reason: string | null; action_risk: number | null; freshness_risk: number | null;
}

const legacyReasons: Record<string, DiscardReason> = { forgot: "forgot_about_it", spoiled: "spoiled_before_use", disliked: "did_not_like" };

export function databaseRowsToOutcomes(rows: OutcomeDatabaseRow[]): FoodOutcome[] {
  return rows.map((row) => ({ id: row.id, userId: row.user_id, pantryItemId: row.pantry_item_id, normalizedName: row.normalized_name, foodCategory: row.food_category, action: row.action, quantity: Number(row.quantity), unit: row.unit, priceValue: row.price_value === null ? null : Number(row.price_value), discardReason: row.discard_reason, freshnessRiskAtAction: row.freshness_risk_at_action, actionAt: row.action_at, purchaseQuantity: Number(row.pantry_items.quantity), purchaseUnit: row.pantry_items.unit, purchaseDate: row.pantry_items.purchase_date, storageMethod: row.pantry_items.storage_method }));
}

export function outcomesToPurchases(outcomes: FoodOutcome[]): BehaviorPurchase[] {
  const purchases = new Map<string, BehaviorPurchase>();
  outcomes.forEach((outcome) => {
    const existing = purchases.get(outcome.pantryItemId) ?? { id: outcome.pantryItemId, userId: outcome.userId, normalizedName: outcome.normalizedName, foodCategory: outcome.foodCategory, purchaseQuantity: outcome.purchaseQuantity, unit: outcome.purchaseUnit, purchaseDate: outcome.purchaseDate, storageMethod: outcome.storageMethod, priceValue: outcome.priceValue, consumedQuantity: 0, discardedQuantity: 0, frozenQuantity: 0, consumedAt: null, discardedAt: null, frozenAt: null, discardReason: null, freshnessRiskAtOutcome: null };
    if (outcome.action === "consumed") { existing.consumedQuantity += outcome.quantity; existing.consumedAt = outcome.actionAt; }
    if (outcome.action === "discarded") { existing.discardedQuantity += outcome.quantity; existing.discardedAt = outcome.actionAt; existing.discardReason = outcome.discardReason; }
    if (outcome.action === "frozen") { existing.frozenQuantity += outcome.quantity; existing.frozenAt = outcome.actionAt; }
    existing.freshnessRiskAtOutcome = outcome.freshnessRiskAtAction;
    purchases.set(outcome.pantryItemId, existing);
  });
  return [...purchases.values()];
}

export function legacyPantryRowsToPurchases(rows: LegacyPantryRow[]): BehaviorPurchase[] {
  return rows.filter((row) => row.consumed_at || row.discarded_at || row.frozen_at).map((row) => {
    const quantity = Number(row.quantity);
    return { id: row.id, userId: row.user_id, normalizedName: row.normalized_name, foodCategory: row.food_category, purchaseQuantity: quantity, unit: row.unit, purchaseDate: row.purchase_date, storageMethod: row.storage_method, priceValue: row.price === null ? null : Number(row.price), consumedQuantity: row.consumed_at ? quantity : 0, discardedQuantity: row.discarded_at ? quantity : 0, frozenQuantity: row.frozen_at ? quantity : 0, consumedAt: row.consumed_at, discardedAt: row.discarded_at, frozenAt: row.frozen_at, discardReason: row.discard_reason ? (legacyReasons[row.discard_reason] ?? row.discard_reason as DiscardReason) : null, freshnessRiskAtOutcome: row.action_risk ?? row.freshness_risk };
  });
}

export type { OutcomeDatabaseRow, LegacyPantryRow };
