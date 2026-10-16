"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useDroppable } from "@dnd-kit/core";
import { checkListingEligibility } from "@/lib/communityEligibility";
import type { KitchenItemData } from "@/lib/foodVisuals";

export function ShareNearbyCTA({ items, kitchen = false, droppedItem = null, onDroppedItemHandled }: { items: KitchenItemData[]; kitchen?: boolean; droppedItem?: KitchenItemData|null; onDroppedItemHandled?:()=>void }) {
  const router = useRouter();
  const [open,setOpen]=useState(false);
  const {isOver,setNodeRef}=useDroppable({id:"share-nearby"});
  const eligible=items.filter(item=>checkListingEligibility({
    foodCategory:item.food_category,
    condition:"unopened",
    storageMethod:item.storage_method,
    refrigerationConfirmed:item.storage_method==="refrigerator",
  }).eligible);

  function share(item:KitchenItemData) {
    const params=new URLSearchParams({
      food:item.normalized_name,
      category:item.food_category,
      quantity:String(item.quantity),
      unit:item.unit??"item",
      storage:item.storage_method,
      risk:String(item.freshness.riskScore??""),
    });
    router.push(`/community?${params.toString()}`);
  }

  function close(){setOpen(false);onDroppedItemHandled?.()}
  const picker=(open||droppedItem)&&createPortal(<div className="modal-backdrop" role="presentation" onMouseDown={event=>event.target===event.currentTarget&&close()}><section className="item-modal" role="dialog" aria-modal="true" aria-labelledby="share-nearby-title"><button onClick={close} className="sheet-close" aria-label="Close">×</button><p className="eyebrow">Community Rescue</p><h2 id="share-nearby-title" className="mt-2 text-3xl font-black">{droppedItem?"Share this food nearby?":"Choose food to share"}</h2><p className="mt-2 text-sm text-[#526259]">{droppedItem?"Review the pantry item before opening the listing form.":"Only items that meet the current deterministic sharing rules are shown."}</p>{droppedItem?<div className="mt-5 rounded-2xl border border-[#287557] bg-[#edf5ef] p-5"><b className="text-xl">{droppedItem.normalized_name}</b><p className="mt-1 capitalize text-[#526259]">{droppedItem.quantity} {droppedItem.unit??"item"} · {droppedItem.storage_method} · {droppedItem.freshness.status}</p><div className="mt-5 flex gap-3"><button onClick={close} className="button flex-1 border bg-white">Cancel</button><button onClick={()=>share(droppedItem)} className="button flex-1 bg-[#164b35] text-white">Continue to listing →</button></div></div>:eligible.length?<div className="mt-5 space-y-2">{eligible.map(item=><button key={item.id} onClick={()=>share(item)} className="flex w-full items-center justify-between rounded-2xl border bg-white p-4 text-left transition hover:border-[#287557] hover:bg-[#edf5ef]"><span><b>{item.normalized_name}</b><small className="mt-1 block capitalize text-[#68766e]">{item.quantity} {item.unit??"item"} · {item.storage_method} · {item.freshness.status}</small></span><span className="font-black text-[#287557]">Share →</span></button>)}</div>:<div className="mt-5 rounded-2xl bg-[#f4f1e9] p-4"><b>No eligible pantry items right now.</b><p className="mt-1 text-sm text-[#68766e]">Raw proteins and higher-risk or unknown-storage foods cannot be shared.</p></div>}<p className="mt-5 text-xs leading-5 text-[#7d8881]">Eligibility is checked again before publishing. Exact home locations are never shown publicly.</p></section></div>,document.body);

  return <>
    <section ref={setNodeRef} className={kitchen?"relative z-10 mx-auto max-w-4xl px-3 pt-5 sm:px-6":"mx-auto mt-8 max-w-6xl"}>
      <button onClick={()=>setOpen(true)} className={`group flex w-full items-center justify-between gap-5 border bg-[#edf5ef] text-left shadow-[0_12px_35px_rgba(22,75,53,.08)] transition hover:-translate-y-0.5 hover:border-[#287557] hover:shadow-[0_16px_40px_rgba(22,75,53,.13)] ${isOver?"scale-[1.02] border-[#164b35] ring-4 ring-[#d9f15b]":"border-[#28755740]"} ${kitchen?"rounded-2xl p-4":"rounded-3xl p-5 sm:p-6"}`}>
        <span><span className="block text-xl font-black text-[#164b35] sm:text-2xl">🤝 Share Nearby</span><span className="mt-1 block text-sm leading-6 text-[#526259] sm:text-base">Have food you won&apos;t use? Offer it to someone nearby before it goes to waste.</span></span>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#164b35] text-xl text-white transition group-hover:translate-x-1" aria-hidden="true">→</span>
      </button>
    </section>
    {picker}
  </>;
}
