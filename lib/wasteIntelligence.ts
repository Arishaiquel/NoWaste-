import { differenceInCalendarDays, parseISO } from "date-fns";
import type { BehaviorPurchase, DiscardReason, WasteRateResult } from "@/types/behavior";

type Dimension = "mass" | "volume" | "count";
const UNIT_MAP: Record<string, { dimension: Dimension; factor: number; label: string }> = {
  g: { dimension: "mass", factor: 1, label: "g" }, gram: { dimension: "mass", factor: 1, label: "g" }, grams: { dimension: "mass", factor: 1, label: "g" },
  kg: { dimension: "mass", factor: 1000, label: "g" }, kilogram: { dimension: "mass", factor: 1000, label: "g" }, kilograms: { dimension: "mass", factor: 1000, label: "g" },
  ml: { dimension: "volume", factor: 1, label: "ml" }, milliliter: { dimension: "volume", factor: 1, label: "ml" }, milliliters: { dimension: "volume", factor: 1, label: "ml" },
  l: { dimension: "volume", factor: 1000, label: "ml" }, litre: { dimension: "volume", factor: 1000, label: "ml" }, liter: { dimension: "volume", factor: 1000, label: "ml" },
  unit: { dimension: "count", factor: 1, label: "units" }, units: { dimension: "count", factor: 1, label: "units" }, each: { dimension: "count", factor: 1, label: "units" }, item: { dimension: "count", factor: 1, label: "units" }, items: { dimension: "count", factor: 1, label: "units" }, pack: { dimension: "count", factor: 1, label: "packs" }, packs: { dimension: "count", factor: 1, label: "packs" },
};

const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const resolved = (purchase: BehaviorPurchase) => purchase.consumedQuantity > 0 || purchase.discardedQuantity > 0;

function convertibleValue(quantity: number, unit: string | null) {
  const normalized = (unit ?? "unit").trim().toLowerCase();
  const mapping = UNIT_MAP[normalized];
  return mapping ? { value: quantity * mapping.factor, dimension: mapping.dimension } : null;
}

export function calculateWasteRate(purchases: BehaviorPurchase[]): WasteRateResult {
  const complete = purchases.filter(resolved);
  if (!complete.length) return { rate: null, method: "insufficient_data", discardedQuantity: 0, purchasedQuantity: 0, discardedEvents: 0, resolvedEvents: 0 };
  const converted = complete.map((purchase) => ({ purchased: convertibleValue(purchase.purchaseQuantity, purchase.unit), discarded: convertibleValue(purchase.discardedQuantity, purchase.unit) }));
  const dimensions = new Set(converted.flatMap((entry) => [entry.purchased?.dimension, entry.discarded?.dimension]).filter(Boolean));
  if (dimensions.size === 1 && converted.every((entry) => entry.purchased && entry.discarded)) {
    const purchasedQuantity = converted.reduce((sum, entry) => sum + entry.purchased!.value, 0);
    const discardedQuantity = converted.reduce((sum, entry) => sum + entry.discarded!.value, 0);
    return { rate: purchasedQuantity > 0 ? discardedQuantity / purchasedQuantity : null, method: "quantity", discardedQuantity, purchasedQuantity, discardedEvents: complete.filter((item) => item.discardedQuantity > 0).length, resolvedEvents: complete.length };
  }
  const discardedEvents = complete.filter((item) => item.discardedQuantity > 0).length;
  return { rate: discardedEvents / complete.length, method: "events", discardedQuantity: 0, purchasedQuantity: 0, discardedEvents, resolvedEvents: complete.length };
}

export function calculateFoodWasteRate(purchases: BehaviorPurchase[], food: string) {
  return calculateWasteRate(purchases.filter((item) => item.normalizedName.toLowerCase() === food.toLowerCase()));
}

export function calculateCategoryWasteRate(purchases: BehaviorPurchase[], category: string) {
  return calculateWasteRate(purchases.filter((item) => item.foodCategory === category));
}

export const calculateAveragePurchasedQuantity = (purchases: BehaviorPurchase[]) => average(purchases.filter(resolved).map((item) => item.purchaseQuantity));
export const calculateAverageConsumedQuantity = (purchases: BehaviorPurchase[]) => average(purchases.filter(resolved).map((item) => item.consumedQuantity));
export const calculateAverageDiscardedQuantity = (purchases: BehaviorPurchase[]) => average(purchases.filter(resolved).map((item) => item.discardedQuantity));

export function calculateMostCommonDiscardReason(purchases: BehaviorPurchase[]): DiscardReason | null {
  const counts = new Map<DiscardReason, number>();
  purchases.forEach((item) => { if (item.discardReason) counts.set(item.discardReason, (counts.get(item.discardReason) ?? 0) + 1); });
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? null;
}

export function calculatePurchaseFrequency(purchases: BehaviorPurchase[]): number | null {
  const dates = purchases.map((item) => parseISO(item.purchaseDate)).sort((a, b) => a.getTime() - b.getTime());
  if (dates.length < 2) return null;
  return average(dates.slice(1).map((date, index) => differenceInCalendarDays(date, dates[index])));
}

function averageDays(purchases: BehaviorPurchase[], field: "consumedAt" | "discardedAt") {
  const values = purchases.flatMap((item) => item[field] ? [Math.max(0, differenceInCalendarDays(parseISO(item[field]!), parseISO(item.purchaseDate)))] : []);
  return values.length ? average(values) : null;
}

export const calculateAverageDaysToConsume = (purchases: BehaviorPurchase[]) => averageDays(purchases, "consumedAt");
export const calculateAverageDaysToDiscard = (purchases: BehaviorPurchase[]) => averageDays(purchases, "discardedAt");

export function groupPurchasesByFood(purchases: BehaviorPurchase[]) {
  const groups = new Map<string, BehaviorPurchase[]>();
  purchases.forEach((purchase) => {
    const key = purchase.normalizedName.trim().toLowerCase();
    groups.set(key, [...(groups.get(key) ?? []), purchase]);
  });
  return groups;
}
