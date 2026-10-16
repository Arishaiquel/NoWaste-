import type { PurchaseRecommendation } from "@/types/recommendation";
import { RecommendationExplanation } from "@/components/intelligence/RecommendationExplanation";

const number = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1);

export function RecommendationCard({ recommendation }: { recommendation: PurchaseRecommendation }) {
  const unit = recommendation.unit ? ` ${recommendation.unit}` : "";
  return <article className="coach-card">
    <div className="flex items-start justify-between gap-3"><div><p className="eyebrow">{recommendation.foodCategory.replaceAll("_", " ")}</p><h3 className="mt-1 text-xl font-black">{recommendation.normalizedName}</h3></div><span className={`confidence-badge confidence-${recommendation.confidence.toLowerCase().replaceAll(" ", "-")}`}>{recommendation.confidence}</span></div>
    <dl className="coach-stats"><div><dt>Usually bought</dt><dd>{number(recommendation.averagePurchased)}{unit}</dd></div><div><dt>Usually consumed</dt><dd>{number(recommendation.averageConsumed)}{unit}</dd></div><div><dt>Usually discarded</dt><dd>{number(recommendation.averageDiscarded)}{unit}</dd></div><div><dt>Waste rate</dt><dd>{recommendation.wasteRate.rate === null ? "—" : `${Math.round(recommendation.wasteRate.rate * 100)}%`}<small>{recommendation.wasteRate.method === "events" ? "event-based" : recommendation.wasteRate.method === "quantity" ? "by quantity" : ""}</small></dd></div></dl>
    <div className="coach-recommendation">{recommendation.recommendedQuantity === null ? <><strong>Not enough history yet.</strong><span>Personalization starts after 3 resolved purchases.</span></> : <><span>Recommended next purchase</span><strong>{number(recommendation.recommendedQuantity)}{unit}</strong><small>Based on your last {recommendation.resolvedPurchases} resolved purchases</small></>}</div>
    <RecommendationExplanation recommendation={recommendation}/>
  </article>;
}
