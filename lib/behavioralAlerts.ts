import type { BehaviorPurchase } from "@/types/behavior";

export interface BehavioralAlertRule {
  threshold: 55;
  reason: string;
  supportingDiscards: number;
}

export function getBehavioralAlertRule(foodName: string, history: BehaviorPurchase[]): BehavioralAlertRule | null {
  const relevant = history.filter((item) => item.normalizedName.toLowerCase() === foodName.toLowerCase() && (item.consumedQuantity > 0 || item.discardedQuantity > 0));
  const forgotten = relevant.filter((item) => item.discardedQuantity > 0 && item.discardReason === "forgot_about_it");
  if (relevant.length < 3 || forgotten.length < 2) return null;
  return { threshold: 55, supportingDiscards: forgotten.length, reason: `We're reminding you earlier because you've previously forgotten ${foodName.toLowerCase()} before using it.` };
}

export function crossedBehavioralThreshold(previous: number | null, risk: number | null, rule: BehavioralAlertRule | null) {
  if (!rule || risk === null) return null;
  return risk >= rule.threshold && rule.threshold > (previous ?? 0) ? rule.threshold : null;
}
