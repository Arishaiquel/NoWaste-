import type { KitchenItemData } from "@/lib/foodVisuals";
import type { RescueMetrics } from "@/lib/rescueMetrics";
import type { BehaviorPurchase } from "@/types/behavior";
import { demoBananaHistory } from "@/lib/demoScenario";

const day = 86_400_000;
const isoDaysAgo = (days: number) => new Date(Date.now() - days * day).toISOString();

export function guestKitchenItems(): KitchenItemData[] {
  return [
    ["demo-spinach", "Baby Spinach", "leafy_vegetables", "refrigerator", 3.8, 1, "Fresh", 24],
    ["demo-oat-milk", "Oat Milk", "dairy", "refrigerator", 4.2, 1, "Fresh", 18],
    ["demo-bananas", "Bananas", "fruit", "counter", 3.4, 1, "Fresh", 14],
    ["demo-bread", "Bread", "bread", "pantry", 3.1, 1, "Fresh", 12],
    ["demo-rice", "Brown rice", "dry_goods", "pantry", 6.5, 12, "Fresh", 4],
  ].map(([id, name, category, storage, price, elapsed, status, risk]) => ({
    id: String(id), normalized_name: String(name), raw_name: String(name), food_category: String(category),
    quantity: String(id)==="demo-bananas"?7:1, unit: String(id)==="demo-spinach"?"bag":String(id)==="demo-bananas"?"items":"pack", price: Number(price), purchase_date: isoDaysAgo(Number(elapsed)),
    storage_method: storage as KitchenItemData["storage_method"], extraction_confidence: .96,
    shelf_life_min_days: 3, shelf_life_max_days: 7,
    freshness: { riskScore: Number(risk), status: status as KitchenItemData["freshness"]["status"], elapsedDays: Number(elapsed), windowExceeded: false },
  }));
}

export const guestMetrics: RescueMetrics = { rescueScore: 83, rescuedCount: 10, discardedCount: 2, rescuedValue: 42.7, wasteValue: 6.2, weeklyRescued: 3, weeklyGoal: 5, lowWasteStreak: 2, mostDiscardedCategory: "fruit", mostCommonReason: "bought too much" };

export const guestBehaviorPurchases: BehaviorPurchase[] = [
  ["spinach-1", "Baby spinach", "leafy_vegetables", 2, 2, 0, null], ["spinach-2", "Baby spinach", "leafy_vegetables", 2, 1, 1, "bought_too_much"], ["spinach-3", "Baby spinach", "leafy_vegetables", 1, 1, 0, null],
].map(([id, name, category, bought, eaten, discarded, reason], index) => ({ id: String(id), normalizedName: String(name), foodCategory: String(category), purchaseQuantity: Number(bought), unit: "items", purchaseDate: isoDaysAgo(35 - index * 4).slice(0, 10), storageMethod: "refrigerator", priceValue: 4, consumedQuantity: Number(eaten), discardedQuantity: Number(discarded), frozenQuantity: 0, consumedAt: eaten ? isoDaysAgo(30 - index * 4) : null, discardedAt: discarded ? isoDaysAgo(29 - index * 4) : null, frozenAt: null, discardReason: reason as BehaviorPurchase["discardReason"], freshnessRiskAtOutcome: 70 }));

guestBehaviorPurchases.push(...demoBananaHistory(false));
