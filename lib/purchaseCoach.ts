import type { BehaviorPurchase } from "@/types/behavior";
import type { PurchaseRecommendation, PurchaseRecommendationInput, PurchaseRecommendationModel, RecommendationConfidence } from "@/types/recommendation";
import { calculateAverageConsumedQuantity, calculateAverageDiscardedQuantity, calculateAveragePurchasedQuantity, calculateWasteRate, groupPurchasesByFood } from "@/lib/wasteIntelligence";

export const MIN_HISTORY_FOR_PERSONALIZATION = 3;
const RECENCY_DECAY_PER_DAY = 0.008;

const rounded = (value: number) => Math.round(value * 10) / 10;
const resolved = (purchase: BehaviorPurchase) => purchase.consumedQuantity > 0 || purchase.discardedQuantity > 0;

export function confidenceForHistory(count: number): RecommendationConfidence {
  if (count < MIN_HISTORY_FOR_PERSONALIZATION) return "Insufficient history";
  if (count <= 5) return "Low";
  if (count <= 10) return "Moderate";
  return "Higher";
}

export function roundPracticalQuantity(value: number, unit: string | null) {
  const normalized = (unit ?? "unit").toLowerCase();
  if (["unit", "units", "each", "item", "items", "pack", "packs"].includes(normalized)) return Math.max(1, Math.round(value));
  if (["l", "litre", "liter", "kg", "kilogram"].includes(normalized)) return Math.max(.25, Math.round(value * 4) / 4);
  if (["ml", "g", "gram", "grams"].includes(normalized)) return Math.max(50, Math.round(value / 50) * 50);
  return Math.max(.1, rounded(value));
}

function weightedConsumption(purchases: BehaviorPurchase[]) {
  const ordered = [...purchases].sort((a, b) => Date.parse(b.purchaseDate) - Date.parse(a.purchaseDate));
  const newest = Math.max(...ordered.map((item) => Date.parse(item.purchaseDate)));
  let weighted = 0; let weights = 0;
  ordered.forEach((item) => {
    const ageDays = Math.max(0, (newest - Date.parse(item.purchaseDate)) / 86_400_000);
    const weight = Math.exp(-RECENCY_DECAY_PER_DAY * ageDays);
    weighted += item.consumedQuantity * weight; weights += weight;
  });
  return weights ? weighted / weights : 0;
}

function recentTrend(purchases: BehaviorPurchase[]): PurchaseRecommendation["recentTrend"] {
  if (purchases.length < 4) return "not_enough_history";
  const ordered = [...purchases].sort((a, b) => Date.parse(a.purchaseDate) - Date.parse(b.purchaseDate));
  const midpoint = Math.floor(ordered.length / 2);
  const earlier = calculateWasteRate(ordered.slice(0, midpoint)).rate;
  const recent = calculateWasteRate(ordered.slice(midpoint)).rate;
  if (earlier === null || recent === null || Math.abs(earlier - recent) < .05) return "steady";
  return recent < earlier ? "improving" : "worsening";
}

export class StatisticalPurchaseModel implements PurchaseRecommendationModel {
  predict({ normalizedName, purchases }: PurchaseRecommendationInput): PurchaseRecommendation {
    const history = purchases.filter(resolved).sort((a, b) => Date.parse(b.purchaseDate) - Date.parse(a.purchaseDate));
    const count = history.length;
    const confidence = confidenceForHistory(count);
    const averagePurchased = calculateAveragePurchasedQuantity(history);
    const averageConsumed = calculateAverageConsumedQuantity(history);
    const averageDiscarded = calculateAverageDiscardedQuantity(history);
    const recommendation = count >= MIN_HISTORY_FOR_PERSONALIZATION ? roundPracticalQuantity(weightedConsumption(history), history[0]?.unit ?? null) : null;
    const unit = history[0]?.unit ?? null;
    const explanation = count < MIN_HISTORY_FOR_PERSONALIZATION
      ? [`Only ${count} resolved purchase${count === 1 ? "" : "s"} recorded.`, "Keep tracking this item and NoWaste! will personalize recommendations after a few grocery cycles."]
      : [`You bought ${normalizedName.toLowerCase()} ${count} times recently.`, `Average purchased: ${rounded(averagePurchased)}${unit ? ` ${unit}` : ""}. Average consumed: ${rounded(averageConsumed)}${unit ? ` ${unit}` : ""}. Average discarded: ${rounded(averageDiscarded)}${unit ? ` ${unit}` : ""}.`, "This estimate is a recency-weighted average of your recorded consumption."];
    return { normalizedName, foodCategory: history[0]?.foodCategory ?? "other", unit, resolvedPurchases: count, averagePurchased: rounded(averagePurchased), averageConsumed: rounded(averageConsumed), averageDiscarded: rounded(averageDiscarded), wasteRate: calculateWasteRate(history), recentTrend: recentTrend(history), recommendedQuantity: recommendation, confidence, explanation, recentPurchases: history.slice(0, 6) };
  }
}

export function buildPurchaseRecommendations(purchases: BehaviorPurchase[], model: PurchaseRecommendationModel = new StatisticalPurchaseModel()) {
  return [...groupPurchasesByFood(purchases)].map(([, history]) => model.predict({ normalizedName: history[0].normalizedName, purchases: history })).sort((a, b) => b.resolvedPurchases - a.resolvedPurchases || (b.wasteRate.rate ?? -1) - (a.wasteRate.rate ?? -1));
}
