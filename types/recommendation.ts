import type { BehaviorPurchase, WasteRateResult } from "@/types/behavior";

export type RecommendationConfidence = "Insufficient history" | "Low" | "Moderate" | "Higher";

export interface PurchaseRecommendationInput {
  normalizedName: string;
  purchases: BehaviorPurchase[];
}

export interface PurchaseRecommendation {
  normalizedName: string;
  foodCategory: string;
  unit: string | null;
  resolvedPurchases: number;
  averagePurchased: number;
  averageConsumed: number;
  weightedAverageConsumed: number;
  averageDiscarded: number;
  wasteRate: WasteRateResult;
  recentTrend: "improving" | "worsening" | "steady" | "not_enough_history";
  recommendedQuantity: number | null;
  confidence: RecommendationConfidence;
  explanation: string[];
  recentPurchases: BehaviorPurchase[];
}

export interface PurchaseRecommendationModel {
  predict(input: PurchaseRecommendationInput): PurchaseRecommendation;
}
