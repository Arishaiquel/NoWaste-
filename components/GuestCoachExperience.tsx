"use client";
import { useMemo, useState } from "react";
import { WastePatterns } from "@/components/intelligence/WastePatterns";
import { PurchaseCoach } from "@/components/intelligence/PurchaseCoach";
import { guestBehaviorPurchases } from "@/lib/guestDemoData";
import { demoBananaHistory, readDemoScenario, writeDemoScenario } from "@/lib/demoScenario";
import { calculateWasteRate } from "@/lib/wasteIntelligence";

export function GuestCoachExperience() {
  const [state,setState]=useState(()=>readDemoScenario());
  const purchases=useMemo(()=>[
    ...guestBehaviorPurchases.filter(x=>x.normalizedName!=="Bananas"),
    ...demoBananaHistory(state.improvedPurchaseRecorded),
  ],[state.improvedPurchaseRecorded]);
  const baseRate=calculateWasteRate(demoBananaHistory(false)).rate;
  const rate=calculateWasteRate(demoBananaHistory(state.improvedPurchaseRecorded)).rate;
  return <>
    <WastePatterns purchases={purchases}/>
    <div className="card mt-6 flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="eyebrow">Learning loop · Demo data</p><p className="mt-1 font-black">Record the next banana purchase: 5 bought → 5 consumed → 0 discarded</p><p className="mt-1 text-sm text-[#526259]">The recommendation and waste statistics recalculate from history—no generated numbers.</p></div><button disabled={state.improvedPurchaseRecorded} onClick={()=>setState(writeDemoScenario({improvedPurchaseRecorded:true}))} className="button bg-[#164b35] text-white disabled:opacity-50">{state.improvedPurchaseRecorded?"Improvement recorded ✓":"Record improved behavior"}</button>{state.improvedPurchaseRecorded&&<p className="w-full rounded-xl bg-[#edf5ef] p-3 text-sm font-bold text-[#287557]" role="status">Historical waste rate improved: {Math.round((baseRate??0)*100)}% → {Math.round((rate??0)*100)}%. Recommendation recalculated below.</p>}</div>
    <PurchaseCoach purchases={purchases}/>
  </>;
}
