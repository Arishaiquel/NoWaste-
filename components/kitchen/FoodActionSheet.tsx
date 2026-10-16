"use client";

import { useEffect } from "react";
import { FoodVisual } from "@/components/kitchen/FoodVisual";
import type { KitchenItemData } from "@/lib/foodVisuals";

export type FoodSheetAction = "consumed" | "discarded" | "frozen" | "pantry" | "fridge" | "rescue" | "share" | "edit";

export function FoodActionSheet({ item, enabled, onClose, onAction }: { item: KitchenItemData | null; enabled: boolean; onClose: () => void; onAction: (action: FoodSheetAction, item: KitchenItemData) => void }) {
  useEffect(()=>{if(!item)return;const key=(event:KeyboardEvent)=>event.key==="Escape"&&onClose();document.addEventListener("keydown",key);return()=>document.removeEventListener("keydown",key)},[item,onClose]);
  if (!item) return null;
  const actions: Array<[FoodSheetAction,string,string]> = [["consumed","🍽","Ate it"],["discarded","🗑","Discard"],["frozen","❄","Freeze"],["pantry","🧺","Move to pantry"],["fridge","🧊","Move to fridge"],["rescue","🍳","Cook with it"],["share","🤝","Share Nearby"],["edit","✏","View & edit"]];
  return <div className="modal-backdrop action-sheet-backdrop" role="presentation" onMouseDown={(event)=>event.target===event.currentTarget&&onClose()}><section className="food-action-sheet" role="dialog" aria-modal="true" aria-labelledby="food-action-title">
    <div className="sheet-handle"/><button onClick={onClose} className="sheet-close" aria-label="Close actions">×</button>
    <div className="sheet-food"><FoodVisual name={item.normalized_name} category={item.food_category} size="lg"/><div><p>What would you like to do?</p><h2 id="food-action-title">{item.normalized_name}</h2><small>{item.freshness.status} · {item.freshness.riskScore ?? "—"}% priority</small></div></div>
    <div className="sheet-actions">{actions.map(([action,icon,label])=><button key={action} disabled={!enabled && action!=="rescue" && action!=="edit"} onClick={()=>onAction(action,item)}><span>{icon}</span><b>{label}</b></button>)}</div>
    {!enabled&&<p className="sheet-note">Inventory changes are available in demo mode.</p>}
  </section></div>;
}
