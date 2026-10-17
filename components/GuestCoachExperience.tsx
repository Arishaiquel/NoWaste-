"use client";
import { useMemo, useState } from "react";
import { WastePatterns } from "@/components/intelligence/WastePatterns";
import { PurchaseCoach } from "@/components/intelligence/PurchaseCoach";
import { guestBehaviorPurchases } from "@/lib/guestDemoData";
import { demoBananaHistory, readDemoScenario, writeDemoScenario } from "@/lib/demoScenario";
import { buildPurchaseRecommendations } from "@/lib/purchaseCoach";

export function GuestCoachExperience() {
  const [state,setState]=useState(()=>readDemoScenario());
  const purchases=useMemo(()=>[
    ...guestBehaviorPurchases.filter(x=>x.normalizedName!=="Bananas"),
    ...demoBananaHistory(state.improvedPurchaseRecorded),
  ],[state.improvedPurchaseRecorded]);
  const before=useMemo(()=>buildPurchaseRecommendations(demoBananaHistory(false))[0],[]);
  const current=useMemo(()=>buildPurchaseRecommendations(demoBananaHistory(state.improvedPurchaseRecorded))[0],[state.improvedPurchaseRecorded]);
  const beforeWaste=Math.round((before.wasteRate.rate??0)*100);
  const currentWaste=Math.round((current.wasteRate.rate??0)*100);
  return <>
    <section className="adaptive-demo" aria-live="polite">
      <div><p className="eyebrow">Demo data · Live calculation</p><h2>Watch NoWaste adapt</h2><p>Add one successful purchase outcome and the coach recalculates from the stored history below.</p></div>
      <div className={`adaptive-result ${state.improvedPurchaseRecorded?"adaptive-result-updated":""}`}><span>Banana waste rate</span><strong>{state.improvedPurchaseRecorded?<>{beforeWaste}% <i>→</i> {currentWaste}%</>:<>{beforeWaste}%</>}</strong><small>Next purchase: {current.recommendedQuantity} {current.unit??"items"}</small></div>
      <button disabled={state.improvedPurchaseRecorded} onClick={()=>setState(writeDemoScenario({improvedPurchaseRecorded:true}))}>{state.improvedPurchaseRecorded?"Outcome recorded ✓":"Record: 5 bought · 5 consumed · 0 discarded"}</button>
      {state.improvedPurchaseRecorded&&<p className="adaptive-note" role="status">Recommendation remains {current.recommendedQuantity}, now backed by {current.resolvedPurchases} completed purchases.</p>}
    </section>
    <WastePatterns purchases={purchases}/>
    <PurchaseCoach purchases={purchases}/>
  </>;
}
