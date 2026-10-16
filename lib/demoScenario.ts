import type { BehaviorPurchase } from "@/types/behavior";

export const DEMO_STORAGE_KEY = "nowaste-demo-v2";

export interface DemoScenarioState {
  dayOffset: number;
  receiptConfirmed: boolean;
  bananaOutcomeRecorded: boolean;
  improvedPurchaseRecorded: boolean;
  spinachShared: boolean;
  rescueStatus: "available" | "requested" | "reserved" | "collected";
}

export const initialDemoScenario: DemoScenarioState = {
  dayOffset: 0,
  receiptConfirmed: false,
  bananaOutcomeRecorded: false,
  improvedPurchaseRecorded: false,
  spinachShared: false,
  rescueStatus: "available",
};

export function readDemoScenario(): DemoScenarioState {
  if (typeof window === "undefined") return initialDemoScenario;
  try {
    return { ...initialDemoScenario, ...JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) ?? "{}") };
  } catch {
    return initialDemoScenario;
  }
}

export function writeDemoScenario(patch: Partial<DemoScenarioState>) {
  const next = { ...readDemoScenario(), ...patch };
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("nowaste-demo-change", { detail: next }));
  return next;
}

export function resetDemoScenario() {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(initialDemoScenario));
  window.dispatchEvent(new CustomEvent("nowaste-demo-change", { detail: initialDemoScenario }));
  return initialDemoScenario;
}

const isoDaysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

export function demoBananaHistory(includeImprovement = false): BehaviorPurchase[] {
  const rows: Array<[string, number, number, number, BehaviorPurchase["discardReason"]]> = [
    ["banana-1", 7, 4, 3, "bought_too_much"],
    ["banana-2", 8, 5, 3, "bought_too_much"],
    ["banana-3", 6, 5, 1, "forgot_about_it"],
    ["banana-4", 7, 4, 3, "bought_too_much"],
    ...(includeImprovement ? [["banana-5", 5, 5, 0, null] as [string, number, number, number, null]] : []),
  ];
  const ages: Record<string, number> = { "banana-1": 35, "banana-2": 28, "banana-3": 7, "banana-4": 14, "banana-5": 0 };
  return rows.map(([id, bought, consumed, discarded, reason]) => ({
    id, normalizedName: "Bananas", foodCategory: "fruit", purchaseQuantity: bought,
    unit: "items", purchaseDate: isoDaysAgo(ages[id]).slice(0, 10),
    storageMethod: "counter", priceValue: 3.5, consumedQuantity: consumed,
    discardedQuantity: discarded, frozenQuantity: 0,
    consumedAt: consumed ? isoDaysAgo(Math.max(0, ages[id] - 1)) : null,
    discardedAt: discarded ? isoDaysAgo(Math.max(0, ages[id] - 1)) : null,
    frozenAt: null, discardReason: reason, freshnessRiskAtOutcome: 72,
  }));
}
