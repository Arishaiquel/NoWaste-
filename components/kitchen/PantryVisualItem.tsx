"use client";
import { FoodVisual } from "@/components/kitchen/FoodVisual";
import { getFoodVisual, getFreshnessVisualState, type KitchenItemData } from "@/lib/foodVisuals";

export function PantryVisualItem({ item, onOpen, focusMode = false, rank, dragEnabled = false }: { item: KitchenItemData; onOpen: (item: KitchenItemData) => void; focusMode?: boolean; rank?: number; dragEnabled?: boolean }) {
  const state = getFreshnessVisualState(item.freshness.status);
  const food = getFoodVisual(item.normalized_name, item.food_category);
  const quantity = item.quantity > 1 || item.unit ? `${item.quantity}${item.unit ? ` · ${item.unit}` : ""}` : null;
  return <button type="button" draggable={dragEnabled} onDragStart={(event)=>{event.dataTransfer.setData("application/x-shelfsense-item",item.id);event.dataTransfer.effectAllowed="move";}} onClick={() => onOpen(item)} aria-label={`${item.normalized_name}, ${item.freshness.status}, ${item.freshness.riskScore ?? "unknown"} percent freshness priority`} title={`${item.normalized_name} · ${state.friendly}`} className={`kitchen-sticker group ring-2 ${state.ring} ${item.freshness.status === "Check now" ? "urgent-sticker" : ""} ${focusMode&&!rank?"kitchen-sticker-dim":""} ${rank?"kitchen-sticker-ranked":""}`} style={{ background: `linear-gradient(160deg, #fffffff5, ${food.palette[0]}d9)`, "--food-accent": food.accent } as React.CSSProperties}>
    {rank&&<span className="rank-pin" aria-label={`Priority ${rank}`}>{rank}</span>}
    {item.freshness.status !== "Fresh" && item.freshness.status !== "No guidance" && <span className={`absolute right-2 top-2 grid size-5 place-items-center rounded-full text-[10px] font-black text-white ${state.dot}`}>{state.symbol}</span>}
    <FoodVisual category={item.food_category} name={item.normalized_name}/>
    <span className="mt-2 line-clamp-2 text-center text-[12px] font-black leading-tight text-[#26382e]">{item.normalized_name}</span>
    {quantity && <span className="mt-1 max-w-full truncate text-[10px] font-bold text-[#758079]">{quantity}</span>}
    {item.freshness.status !== "Fresh" && item.freshness.status !== "No guidance" && <span className={`mt-2 rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[.08em] ${state.badge}`}>{state.friendly}</span>}
  </button>;
}
