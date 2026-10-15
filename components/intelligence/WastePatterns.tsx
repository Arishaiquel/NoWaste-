import type { BehaviorPurchase, DiscardReason } from "@/types/behavior";
import { calculateCategoryWasteRate, calculateMostCommonDiscardReason } from "@/lib/wasteIntelligence";

const reasonLabels: Record<DiscardReason, string> = { forgot_about_it: "Forgot about it", bought_too_much: "Bought too much", spoiled_before_use: "Spoiled before use", changed_plans: "Changed plans", did_not_like: "Did not like it", storage_issue: "Storage issue", other: "Other" };

export function WastePatterns({ purchases }: { purchases: BehaviorPurchase[] }) {
  const categories = [...new Set(purchases.map((item) => item.foodCategory))].map((category) => ({ category, ...calculateCategoryWasteRate(purchases, category) })).filter((item) => item.rate !== null).sort((a, b) => b.rate! - a.rate!);
  const topReason = calculateMostCommonDiscardReason(purchases);
  return <section className="intelligence-section">
    <div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Your patterns</p><h2 className="mt-2 text-3xl font-black tracking-tight">Small signals. Smarter choices.</h2></div></div>
    <div className="pattern-grid">
      <article><span>Most wasted category</span><strong>{categories[0] ? categories[0].category.replaceAll("_", " ") : "Not enough history"}</strong>{categories[0] && <small>{Math.round(categories[0].rate! * 100)}% {categories[0].method === "events" ? "event-based" : "quantity-based"} waste rate</small>}</article>
      <article><span>Most common discard reason</span><strong>{topReason ? reasonLabels[topReason] : "Not enough history"}</strong><small>From structured discard reasons</small></article>
    </div>
  </section>;
}
