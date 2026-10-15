"use client";
import { useState } from "react";
import type { KitchenItemData } from "@/lib/foodVisuals";

const reasons = [["forgot_about_it","Forgot about it"],["bought_too_much","Bought too much"],["spoiled_before_use","Spoiled before I used it"],["changed_plans","Changed plans"],["did_not_like","Didn't like it"],["storage_issue","Storage issue"],["other","Other"]] as const;
export function DiscardDialog({ item, onCancel, onConfirm }: { item: KitchenItemData; onCancel:()=>void; onConfirm:(reason:string)=>Promise<void> }) {
  const [reason,setReason]=useState(""); const [busy,setBusy]=useState(false);
  return <div className="modal-backdrop" role="presentation"><section className="discard-dialog" role="dialog" aria-modal="true" aria-labelledby="discard-title"><p className="eyebrow">A quick check first</p><h2 id="discard-title" className="mt-2 text-2xl font-black">Discard {item.normalized_name}?</h2><p className="mt-2 text-sm text-[#6d7972]">Why are you discarding it?</p><div className="mt-5 grid gap-2">{reasons.map(([value,label])=><button key={value} onClick={()=>setReason(value)} className={`reason-option ${reason===value?"reason-option-active":""}`}>{label}<span>{reason===value?"●":"○"}</span></button>)}</div><div className="mt-6 flex gap-3"><button onClick={onCancel} className="button flex-1 border">Keep it</button><button disabled={!reason||busy} onClick={async()=>{setBusy(true);await onConfirm(reason).finally(()=>setBusy(false));}} className="button flex-1 bg-[#263f32] text-white disabled:opacity-40">Discard</button></div></section></div>;
}
