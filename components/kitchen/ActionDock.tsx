"use client";
import { useState } from "react";
import { FoodVisual } from "@/components/kitchen/FoodVisual";
import type { KitchenItemData } from "@/lib/foodVisuals";

type DockAction = "consumed"|"frozen"|"discarded"|"rescue";
const targets: Array<[DockAction,string,string,string]> = [["consumed","🍽","Ate it","Mark as consumed"],["frozen","❄","Freeze","Save for later"],["discarded","↘","Discard","Log without judgment"],["rescue","✦","Rescue Basket","Build a meal"]];
export function ActionDock({ items, basket, onAction, onRemove, onMakeMeal }: { items: KitchenItemData[]; basket: KitchenItemData[]; onAction:(action:DockAction,item:KitchenItemData)=>void; onRemove:(id:string)=>void; onMakeMeal:()=>void }) {
  const [over,setOver]=useState<DockAction|null>(null);
  function dropped(event:React.DragEvent, action:DockAction){event.preventDefault();setOver(null);const item=items.find(x=>x.id===event.dataTransfer.getData("application/x-shelfsense-item"));if(item)onAction(action,item);}
  return <div className="action-dock-wrap"><div><p className="eyebrow">Action dock</p><p className="mt-1 text-xs text-[#748078]">Drag a food here, or tap it for actions.</p></div><div className="action-dock">{targets.map(([action,icon,label,help])=><div key={action} onDragOver={(e)=>{e.preventDefault();setOver(action)}} onDragLeave={()=>setOver(null)} onDrop={(e)=>dropped(e,action)} className={`dock-target ${over===action?"dock-target-over":""}`}><span aria-hidden="true">{icon}</span><b>{label}</b>{over===action&&<small>Drop here · {help}</small>}</div>)}</div>{basket.length>0&&<div className="rescue-tray"><div className="flex flex-wrap gap-2">{basket.map(item=><button title="Remove from basket" onClick={()=>onRemove(item.id)} className="ingredient-chip" key={item.id}><FoodVisual category={item.food_category} name={item.normalized_name} size="sm"/><span>{item.normalized_name}</span><i>×</i></button>)}</div><button onClick={onMakeMeal} className="make-meal-button">Make me a meal →</button></div>}</div>;
}
