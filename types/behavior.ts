export const DISCARD_REASONS = [
  "forgot_about_it",
  "bought_too_much",
  "spoiled_before_use",
  "changed_plans",
  "did_not_like",
  "storage_issue",
  "other",
] as const;

export type DiscardReason = (typeof DISCARD_REASONS)[number];
export type OutcomeAction = "consumed" | "discarded" | "frozen";

export interface FoodOutcome {
  id: string;
  userId: string;
  pantryItemId: string;
  normalizedName: string;
  foodCategory: string;
  action: OutcomeAction;
  quantity: number;
  unit: string | null;
  priceValue: number | null;
  discardReason: DiscardReason | null;
  freshnessRiskAtAction: number | null;
  actionAt: string;
  purchaseQuantity: number;
  purchaseUnit: string | null;
  purchaseDate: string;
  storageMethod: string;
}

export interface BehaviorPurchase {
  id: string;
  userId?: string;
  normalizedName: string;
  foodCategory: string;
  purchaseQuantity: number;
  unit: string | null;
  purchaseDate: string;
  storageMethod: string;
  priceValue: number | null;
  consumedQuantity: number;
  discardedQuantity: number;
  frozenQuantity: number;
  consumedAt: string | null;
  discardedAt: string | null;
  frozenAt: string | null;
  discardReason: DiscardReason | null;
  freshnessRiskAtOutcome: number | null;
}

export interface WasteRateResult {
  rate: number | null;
  method: "quantity" | "events" | "insufficient_data";
  discardedQuantity: number;
  purchasedQuantity: number;
  discardedEvents: number;
  resolvedEvents: number;
}
