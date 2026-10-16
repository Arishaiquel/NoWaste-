export function communityRescuePriority(input: { freshnessRisk: number | null; distanceKm: number; hoursUntilPickupEnds: number }) {
  const proximity = Math.max(0, 1 - input.distanceKm / 10);
  const pickupUrgency = Math.max(0, 1 - input.hoursUntilPickupEnds / 48);
  if (input.freshnessRisk === null) return .6 * proximity + .4 * pickupUrgency;
  return .5 * Math.min(1, input.freshnessRisk / 100) + .3 * proximity + .2 * pickupUrgency;
}
