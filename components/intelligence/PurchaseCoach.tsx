"use client";

import { useMemo } from "react";
import type { BehaviorPurchase } from "@/types/behavior";
import { buildPurchaseRecommendations } from "@/lib/purchaseCoach";
import { RecommendationCard } from "@/components/intelligence/RecommendationCard";

export function PurchaseCoach({ purchases }: { purchases: BehaviorPurchase[] }) {
  const recommendations = useMemo(() => buildPurchaseRecommendations(purchases), [purchases]);
  const visible = recommendations.slice(0, 5);
  return <section id="purchase-coach" className="intelligence-section">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Purchase coach</p><h2 className="mt-2 text-3xl font-black tracking-tight">Buy for the way you actually eat.</h2></div></div>
    {visible.length ? <div className="coach-grid">{visible.map((recommendation) => <RecommendationCard key={recommendation.normalizedName} recommendation={recommendation}/>)}</div> : <div className="card mt-6 p-6"><h3 className="font-black">Not enough history yet.</h3><p className="mt-2 text-sm text-[#627068]">Keep tracking outcomes and NoWaste! will personalize recommendations after a few grocery cycles.</p></div>}
  </section>;
}
