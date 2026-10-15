import { describe, expect, it } from "vitest";
import type { BehaviorPurchase } from "@/types/behavior";
import { crossedBehavioralThreshold, getBehavioralAlertRule } from "@/lib/behavioralAlerts";

const item = (id: string, reason: BehaviorPurchase["discardReason"]): BehaviorPurchase => ({ id, normalizedName: "Spinach", foodCategory: "leafy_greens", purchaseQuantity: 200, unit: "g", purchaseDate: `2026-0${id}-01`, storageMethod: "refrigerator", priceValue: 3, consumedQuantity: 100, discardedQuantity: 100, frozenQuantity: 0, consumedAt: `2026-0${id}-03T12:00:00Z`, discardedAt: `2026-0${id}-06T12:00:00Z`, frozenAt: null, discardReason: reason, freshnessRiskAtOutcome: 90 });

describe("behavioral alerts", () => {
  it("only moves the reminder earlier with enough supporting history", () => {
    expect(getBehavioralAlertRule("Spinach", [item("1", "forgot_about_it"), item("2", "forgot_about_it")])).toBeNull();
    const rule = getBehavioralAlertRule("Spinach", [item("1", "forgot_about_it"), item("2", "forgot_about_it"), item("3", "changed_plans")]);
    expect(rule).toMatchObject({ threshold: 55, supportingDiscards: 2 });
    expect(crossedBehavioralThreshold(null, 56, rule)).toBe(55);
    expect(crossedBehavioralThreshold(55, 80, rule)).toBeNull();
  });
});
