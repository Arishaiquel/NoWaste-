import type { PurchaseRecommendation } from "@/types/recommendation";

const formatDate = (value: string) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "2-digit" }).format(new Date(`${value}T00:00:00`));

export function RecommendationExplanation({ recommendation }: { recommendation: PurchaseRecommendation }) {
  return <details className="recommendation-details"><summary>Why this?</summary>
    <div className="mt-3 space-y-2 text-sm leading-6 text-[#58685f]">{recommendation.explanation.map((line) => <p key={line}>{line}</p>)}</div>
    {recommendation.recentPurchases.length > 0 && <div className="history-table mt-4" role="table" aria-label={`Recent ${recommendation.normalizedName} purchase history`}>
      <div className="history-row history-head" role="row"><span>Date</span><span>Bought</span><span>Consumed</span><span>Discarded</span></div>
      {recommendation.recentPurchases.map((purchase) => <div className="history-row" role="row" key={purchase.id}><span>{formatDate(purchase.purchaseDate)}</span><span>{purchase.purchaseQuantity}</span><span>{purchase.consumedQuantity}</span><span>{purchase.discardedQuantity}</span></div>)}
    </div>}<p className="mt-3 text-xs font-bold text-[#68766e]">Weighted average consumption: {recommendation.weightedAverageConsumed} {recommendation.unit??"items"} · Recommended quantity: {recommendation.recommendedQuantity??"not available"}</p>
  </details>;
}
