import { differenceInCalendarDays, parseISO } from "date-fns";
import type { FreshnessStatus } from "@/types/pantry";

export interface FreshnessResult {
  elapsedDays: number;
  riskScore: number | null;
  status: FreshnessStatus;
  windowExceeded: boolean;
}

export function calculateFreshness(purchaseDate: string, maxDays: number | null, now = new Date()): FreshnessResult {
  const elapsedDays = Math.max(0, differenceInCalendarDays(now, parseISO(purchaseDate)));
  if (!maxDays || maxDays <= 0) return { elapsedDays, riskScore: null, status: "No guidance", windowExceeded: false };
  const riskScore = Math.round(Math.min(Math.max(elapsedDays / maxDays, 0), 1) * 100);
  const status: FreshnessStatus = riskScore < 40 ? "Fresh" : riskScore < 70 ? "Use soon" : riskScore < 90 ? "High priority" : "Check now";
  return { elapsedDays, riskScore, status, windowExceeded: elapsedDays > maxDays };
}

export function crossedThreshold(previous: number | null, risk: number | null): 50 | 70 | 90 | null {
  if (risk === null) return null;
  const reached = ([90, 70, 50] as const).find((threshold) => risk >= threshold);
  return reached && reached > (previous ?? 0) ? reached : null;
}
