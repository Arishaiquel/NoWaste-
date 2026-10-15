import type { RescueMetrics } from "@/lib/rescueMetrics";

export function WasteMeter({ metrics }: { metrics: RescueMetrics }) {
  const score = metrics.rescueScore ?? 0;
  return <section className="waste-meter" aria-label="Food rescue and waste statistics">
    <p className="meter-period">This month</p>
    <div className="meter-layout">
      <div className="meter-value meter-rescued"><span>rescued</span><strong>${metrics.rescuedValue.toFixed(2)}</strong><small>{metrics.rescuedCount} item{metrics.rescuedCount === 1 ? "" : "s"}</small></div>
      <div className="meter-score" style={{ "--score": score } as React.CSSProperties}><div><strong>{metrics.rescueScore === null ? "—" : `${score}%`}</strong><span>Rescue<br/>Score</span></div></div>
      <div className="meter-value meter-wasted"><span>food waste</span><strong>${metrics.wasteValue.toFixed(2)}</strong><small>{metrics.discardedCount} item{metrics.discardedCount === 1 ? "" : "s"}</small></div>
    </div>
  </section>;
}
