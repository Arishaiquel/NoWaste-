"use client";
import { useMemo, useState } from "react";
import { KitchenView } from "@/components/kitchen/KitchenView";
import { RescueProgress } from "@/components/kitchen/RescueProgress";
import { guestKitchenItems, guestMetrics } from "@/lib/guestDemoData";
import { calculateFreshness } from "@/lib/freshness";
import { readDemoScenario, writeDemoScenario } from "@/lib/demoScenario";

export function GuestDemoDashboard() {
  const [state,setState]=useState(()=>readDemoScenario());
  const [referenceTime]=useState(()=>Date.now());
  const [baseItems]=useState(()=>guestKitchenItems());
  const [note,setNote]=useState("");
  const items=useMemo(()=>baseItems.map(item=>({
    ...item,
    freshness:calculateFreshness(item.purchase_date,item.shelf_life_max_days,new Date(referenceTime+state.dayOffset*86_400_000)),
  })),[baseItems,referenceTime,state.dayOffset]);
  function advance(dayOffset:number){setState(writeDemoScenario({dayOffset}));setNote(dayOffset?`Time advanced ${dayOffset} days. Freshness priorities updated instantly.`:"Back to today.")}
  function recordBananas(){setState(writeDemoScenario({bananaOutcomeRecorded:true}));setNote("Banana outcome recorded: 5 consumed · 2 discarded · Bought too much. Your Patterns is ready.")}
  return <>
    <div className="demo-strip"><div className="card p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">Demo data · Simulated date</p><p className="mt-1 text-sm text-[#526259]">Advance time and watch deterministic freshness rules respond.</p></div><div className="flex flex-wrap gap-2">{[[0,"Today"],[1,"+1 day"],[3,"+3 days"],[5,"+5 days"]] .map(([d,l])=><button key={d} onClick={()=>advance(Number(d))} className={`button border px-4 py-2 text-sm ${state.dayOffset===d?"bg-[#164b35] text-white":""}`}>{l}</button>)}</div></div>{note&&<p className="mt-3 text-sm font-bold text-[#287557]" role="status">{note}</p>}<div className="mt-4 flex flex-wrap items-center gap-3 border-t pt-4"><button onClick={recordBananas} className="button bg-[#fff0d7] px-4 py-2 text-sm text-[#754514]">Record banana outcome: 5 consumed · 2 discarded</button>{state.bananaOutcomeRecorded&&<a href="/coach" className="button bg-[#164b35] px-4 py-2 text-sm text-white">See updated Patterns →</a>}<small className="text-[#68766e]">Reason: Bought too much</small></div></div></div>
    <KitchenView key={state.dayOffset} items={items} metrics={guestMetrics} actionsEnabled guestDemo/>
    <div className="mx-auto mt-8 max-w-6xl"><RescueProgress metrics={guestMetrics}/></div>
  </>;
}
