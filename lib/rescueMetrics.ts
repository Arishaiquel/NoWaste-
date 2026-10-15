import { endOfWeek, isAfter, isWithinInterval, startOfMonth, startOfWeek, subWeeks } from "date-fns";

export interface OutcomeItem {
  status: string; price: number | string | null; food_category: string;
  consumed_at: string | null; frozen_at: string | null; discarded_at: string | null;
  rescued_at: string | null; action_risk: number | null; discard_reason: string | null;
}

export interface RescueMetrics {
  rescueScore: number | null; rescuedCount: number; discardedCount: number;
  rescuedValue: number; wasteValue: number; weeklyRescued: number; weeklyGoal: number;
  lowWasteStreak: number; mostDiscardedCategory: string | null; mostCommonReason: string | null;
}

const money = (value: number) => Math.round(value * 100) / 100;
const label = (value: string | null) => value?.replaceAll("_", " ") ?? null;
function mode(values: Array<string | null>) {
  const counts = new Map<string, number>();
  values.filter((x): x is string => Boolean(x)).forEach((x)=>counts.set(x,(counts.get(x)??0)+1));
  return [...counts].sort((a,b)=>b[1]-a[1])[0]?.[0] ?? null;
}

export function calculateRescueMetrics(items: OutcomeItem[], now = new Date(), weeklyGoal = 5): RescueMetrics {
  const rescued = items.filter((x)=>Boolean(x.consumed_at || x.frozen_at));
  const discarded = items.filter((x)=>Boolean(x.discarded_at));
  const outcomes = rescued.length + discarded.length;
  const week = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
  const weeklyRescued = rescued.filter((x)=>x.rescued_at && (x.action_risk ?? 0) >= 50 && isWithinInterval(new Date(x.rescued_at), week)).length;
  const monthStart = startOfMonth(now);
  const discardedThisMonth = discarded.filter((x)=>x.discarded_at && isAfter(new Date(x.discarded_at), monthStart));
  let lowWasteStreak = 0;
  for (let offset = 1; offset <= 52; offset++) {
    const target = subWeeks(now, offset);
    const interval = { start: startOfWeek(target,{weekStartsOn:1}), end: endOfWeek(target,{weekStartsOn:1}) };
    const weekRescued = rescued.filter((x)=>x.rescued_at && isWithinInterval(new Date(x.rescued_at), interval)).length;
    const weekDiscarded = discarded.filter((x)=>x.discarded_at && isWithinInterval(new Date(x.discarded_at), interval)).length;
    if (weekRescued + weekDiscarded === 0 || weekDiscarded / (weekRescued + weekDiscarded) >= .1) break;
    lowWasteStreak++;
  }
  return {
    rescueScore: outcomes ? Math.round(rescued.length / outcomes * 100) : null,
    rescuedCount: rescued.length, discardedCount: discarded.length,
    rescuedValue: money(rescued.reduce((sum,x)=>sum+Number(x.price??0),0)),
    wasteValue: money(discarded.reduce((sum,x)=>sum+Number(x.price??0),0)),
    weeklyRescued, weeklyGoal, lowWasteStreak,
    mostDiscardedCategory: label(mode(discardedThisMonth.map((x)=>x.food_category))),
    mostCommonReason: label(mode(discardedThisMonth.map((x)=>x.discard_reason))),
  };
}
