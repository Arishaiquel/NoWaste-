"use client";

import { CSS } from "@dnd-kit/utilities";
import { useDraggable } from "@dnd-kit/core";
import { FoodVisual } from "@/components/kitchen/FoodVisual";
import { getFoodVisual, getFreshnessVisualState, type KitchenItemData } from "@/lib/foodVisuals";

export function FoodObject({ item, onOpen, focusMode = false, rank, dragEnabled = false, overlay = false }: { item: KitchenItemData; onOpen?: (item: KitchenItemData) => void; focusMode?: boolean; rank?: number; dragEnabled?: boolean; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id, data: { item }, disabled: !dragEnabled || overlay });
  const state = getFreshnessVisualState(item.freshness.status);
  const food = getFoodVisual(item.normalized_name, item.food_category);
  const style = { background: `linear-gradient(160deg, #fffffff5, ${food.palette[0]}d9)`, "--food-accent": food.accent, transform: CSS.Translate.toString(transform) } as React.CSSProperties;
  return <button ref={setNodeRef} type="button" {...attributes} {...listeners} onClick={()=>!isDragging&&onOpen?.(item)} aria-label={`${item.normalized_name}, ${item.freshness.status}. Press for actions${dragEnabled ? ", or drag to a kitchen zone" : ""}.`} title={`${item.normalized_name} · ${state.friendly}`} className={`food-object ${item.freshness.status === "Check now" ? "urgent-food" : ""} ${focusMode&&!rank?"food-object-dim":""} ${rank?"food-object-ranked":""} ${isDragging?"food-object-dragging":""} ${overlay?"food-object-overlay":""}`} style={style}>
    {rank&&<span className="rank-pin" aria-label={`Priority ${rank}`}>{rank}</span>}
    {item.freshness.status !== "Fresh" && item.freshness.status !== "No guidance" && <span className={`freshness-pin freshness-${item.freshness.status.toLowerCase().replaceAll(" ","-")}`} aria-label={state.friendly}>{item.freshness.status === "Use soon" ? "◷" : state.symbol}</span>}
    <FoodVisual category={item.food_category} name={item.normalized_name}/>
    <span className="food-object-name">{item.normalized_name}</span>
  </button>;
}
