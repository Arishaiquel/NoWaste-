import { describe, expect, it } from "vitest";
import type { BehaviorPurchase } from "@/types/behavior";
import { calculateAverageDaysToConsume, calculateCategoryWasteRate, calculateMostCommonDiscardReason, calculatePurchaseFrequency, calculateWasteRate } from "@/lib/wasteIntelligence";

const purchase = (overrides: Partial<BehaviorPurchase> = {}): BehaviorPurchase => ({ id: crypto.randomUUID(), normalizedName: "Bananas", foodCategory: "fruit", purchaseQuantity: 8, unit: "units", purchaseDate: "2026-09-01", storageMethod: "counter", priceValue: 4, consumedQuantity: 5, discardedQuantity: 3, frozenQuantity: 0, consumedAt: "2026-09-05T12:00:00Z", discardedAt: "2026-09-08T12:00:00Z", frozenAt: null, discardReason: "forgot_about_it", freshnessRiskAtOutcome: 90, ...overrides });

describe("waste intelligence", () => {
  it("uses quantity-normalized waste when units are convertible", () => {
    const result = calculateWasteRate([purchase({ unit: "g" }), purchase({ id: "kg", purchaseQuantity: 1, consumedQuantity: .75, discardedQuantity: .25, unit: "kg" })]);
    expect(result.method).toBe("quantity");
    expect(result.rate).toBeCloseTo(253 / 1008);
  });

  it("falls back to event rate for incompatible units", () => {
    const result = calculateWasteRate([purchase(), purchase({ id: "mystery", unit: "bunch", discardedQuantity: 0, consumedQuantity: 1 })]);
    expect(result).toMatchObject({ method: "events", rate: .5, discardedEvents: 1, resolvedEvents: 2 });
  });

  it("calculates category, reasons, frequency and timing from stored history", () => {
    const history = [purchase(), purchase({ id: "2", purchaseDate: "2026-09-08", discardReason: "bought_too_much" }), purchase({ id: "3", purchaseDate: "2026-09-15" })];
    expect(calculateCategoryWasteRate(history, "fruit").rate).toBeCloseTo(3 / 8);
    expect(calculateMostCommonDiscardReason(history)).toBe("forgot_about_it");
    expect(calculatePurchaseFrequency(history)).toBe(7);
    expect(calculateAverageDaysToConsume(history)).toBeGreaterThanOrEqual(0);
  });

  it("returns transparent insufficient data", () => {
    expect(calculateWasteRate([])).toMatchObject({ rate: null, method: "insufficient_data" });
  });
});
