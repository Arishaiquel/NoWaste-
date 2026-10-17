import { describe, expect, it } from "vitest";
import type { BehaviorPurchase } from "@/types/behavior";
import { StatisticalPurchaseModel, buildPurchaseRecommendations, confidenceForHistory, roundPracticalQuantity } from "@/lib/purchaseCoach";
import { demoBananaHistory } from "@/lib/demoScenario";

const history = (consumed: number[]): BehaviorPurchase[] => consumed.map((quantity, index) => ({ id: String(index), normalizedName: "Bananas", foodCategory: "fruit", purchaseQuantity: 7, unit: "units", purchaseDate: `2026-0${index + 1}-01`, storageMethod: "counter", priceValue: 3, consumedQuantity: quantity, discardedQuantity: 7 - quantity, frozenQuantity: 0, consumedAt: `2026-0${index + 1}-05T12:00:00Z`, discardedAt: quantity < 7 ? `2026-0${index + 1}-07T12:00:00Z` : null, frozenAt: null, discardReason: quantity < 7 ? "bought_too_much" : null, freshnessRiskAtOutcome: 90 }));

describe("statistical purchase coach", () => {
  it("does not personalize before three resolved purchases", () => {
    const result = new StatisticalPurchaseModel().predict({ normalizedName: "Bananas", purchases: history([4, 5]) });
    expect(result.recommendedQuantity).toBeNull();
    expect(result.confidence).toBe("Insufficient history");
    expect(result.explanation.join(" ")).toContain("Only 2 resolved purchases");
  });

  it("weights recent consumption and returns practical whole units", () => {
    const result = new StatisticalPurchaseModel().predict({ normalizedName: "Bananas", purchases: history([4, 5, 4, 6]) });
    expect(result.recommendedQuantity).toBe(5);
    expect(result.averagePurchased).toBe(7);
    expect(result.averageConsumed).toBe(4.8);
    expect(result.averageDiscarded).toBe(2.3);
    expect(result.weightedAverageConsumed).toBeGreaterThan(4.7);
    expect(result.confidence).toBe("Low");
  });

  it("recalculates the demo recommendation from a newly recorded outcome", () => {
    const before = buildPurchaseRecommendations(demoBananaHistory(false))[0];
    const after = buildPurchaseRecommendations(demoBananaHistory(true))[0];
    expect(Math.round(before.wasteRate.rate! * 100)).toBe(36);
    expect(Math.round(after.wasteRate.rate! * 100)).toBe(30);
    expect(before.recommendedQuantity).toBe(5);
    expect(after.recommendedQuantity).toBe(5);
    expect(after.resolvedPurchases).toBe(before.resolvedPurchases + 1);
    expect(after.recentPurchases[0].id).toBe("banana-5");
  });

  it("uses deterministic confidence tiers and sensible unit rounding", () => {
    expect([2, 3, 6, 11].map(confidenceForHistory)).toEqual(["Insufficient history", "Low", "Moderate", "Higher"]);
    expect(roundPracticalQuantity(1.26, "l")).toBe(1.25);
    expect(roundPracticalQuantity(463, "g")).toBe(450);
  });
});
