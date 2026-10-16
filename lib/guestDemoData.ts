import type { KitchenItemData } from "@/lib/foodVisuals";
import type { RescueMetrics } from "@/lib/rescueMetrics";
import type { BehaviorPurchase } from "@/types/behavior";

const day = 86_400_000;
const isoDaysAgo = (days: number) => new Date(Date.now() - days * day).toISOString();

export function guestKitchenItems(): KitchenItemData[] {
  return [
    ["demo-spinach", "Baby spinach", "leafy_vegetables", "refrigerator", 3.8, 3, "High priority", 82],
    ["demo-chicken", "Chicken breast", "raw_poultry", "refrigerator", 8.9, 2, "Use soon", 64],
    ["demo-milk", "Full cream milk", "dairy", "refrigerator", 4.2, 4, "Use soon", 51],
    ["demo-bananas", "Bananas", "fruit", "counter", 3.4, 3, "Fresh", 34],
    ["demo-bread", "Wholemeal bread", "bread", "pantry", 3.1, 2, "Fresh", 22],
    ["demo-rice", "Brown rice", "dry_goods", "pantry", 6.5, 12, "Fresh", 4],
  ].map(([id, name, category, storage, price, elapsed, status, risk]) => ({
    id: String(id), normalized_name: String(name), raw_name: String(name), food_category: String(category),
    quantity: 1, unit: "pack", price: Number(price), purchase_date: isoDaysAgo(Number(elapsed)),
    storage_method: storage as KitchenItemData["storage_method"], extraction_confidence: .96,
    shelf_life_min_days: 3, shelf_life_max_days: 7,
    freshness: { riskScore: Number(risk), status: status as KitchenItemData["freshness"]["status"], elapsedDays: Number(elapsed), windowExceeded: false },
  }));
}

export const guestMetrics: RescueMetrics = { rescueScore: 83, rescuedCount: 10, discardedCount: 2, rescuedValue: 42.7, wasteValue: 6.2, weeklyRescued: 3, weeklyGoal: 5, lowWasteStreak: 2, mostDiscardedCategory: "fruit", mostCommonReason: "bought too much" };

export const guestBehaviorPurchases: BehaviorPurchase[] = [
  ["spinach-1", "Baby spinach", "leafy_vegetables", 2, 2, 0, null], ["spinach-2", "Baby spinach", "leafy_vegetables", 2, 1, 1, "bought_too_much"], ["spinach-3", "Baby spinach", "leafy_vegetables", 1, 1, 0, null],
  ["banana-1", "Bananas", "fruit", 6, 5, 1, "forgot_about_it"], ["banana-2", "Bananas", "fruit", 5, 4, 1, "bought_too_much"], ["banana-3", "Bananas", "fruit", 4, 4, 0, null],
].map(([id, name, category, bought, eaten, discarded, reason], index) => ({ id: String(id), normalizedName: String(name), foodCategory: String(category), purchaseQuantity: Number(bought), unit: "items", purchaseDate: isoDaysAgo(35 - index * 4).slice(0, 10), storageMethod: "refrigerator", priceValue: 4, consumedQuantity: Number(eaten), discardedQuantity: Number(discarded), frozenQuantity: 0, consumedAt: eaten ? isoDaysAgo(30 - index * 4) : null, discardedAt: discarded ? isoDaysAgo(29 - index * 4) : null, frozenAt: null, discardReason: reason as BehaviorPurchase["discardReason"], freshnessRiskAtOutcome: 70 }));
