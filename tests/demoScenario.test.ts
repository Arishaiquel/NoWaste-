import { describe, expect, it } from "vitest";
import { demoBananaHistory } from "@/lib/demoScenario";
import { buildPurchaseRecommendations } from "@/lib/purchaseCoach";

describe("hackathon demo learning loop", () => {
  it("derives the initial banana recommendation from four purchases", () => {
    const recommendation = buildPurchaseRecommendations(demoBananaHistory(false))[0];
    expect(recommendation.averagePurchased).toBe(7);
    expect(recommendation.averageConsumed).toBe(4.5);
    expect(recommendation.averageDiscarded).toBe(2.5);
    expect(recommendation.wasteRate.rate).toBeCloseTo(10 / 28);
    expect(recommendation.recommendedQuantity).toBe(5);
  });

  it("shows improvement after a fully consumed purchase", () => {
    const before = buildPurchaseRecommendations(demoBananaHistory(false))[0];
    const after = buildPurchaseRecommendations(demoBananaHistory(true))[0];
    expect(after.wasteRate.rate).toBeLessThan(before.wasteRate.rate!);
    expect(after.wasteRate.rate).toBeCloseTo(10 / 33);
    expect(after.recommendedQuantity).toBe(5);
  });
});
