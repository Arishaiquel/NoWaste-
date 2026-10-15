"use client";

import { useDroppable } from "@dnd-kit/core";
import { FoodVisual } from "@/components/kitchen/FoodVisual";
import type { KitchenItemData } from "@/lib/foodVisuals";

export function RescuePot({ basket, onRemove, onMakeMeal, disabled = false }: { basket: KitchenItemData[]; onRemove: (id: string) => void; onMakeMeal: () => void; disabled?: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id: "rescue", disabled });
  return <aside ref={setNodeRef} className={`rescue-pot ${isOver ? "drop-zone-active" : ""}`} aria-label="Rescue pot drop zone">
    <div className="pot-art" aria-hidden="true"><span className="pot-lid"/><span className="pot-body">⌣</span></div>
    <div className="pot-copy"><span className="action-kicker">Rescue pot</span><strong>{isOver ? "Add to the pot" : basket.length ? `${basket.length} ingredient${basket.length === 1 ? "" : "s"} ready` : "Build a meal"}</strong><small>Drag ingredients here</small></div>
    {basket.length > 0 && <div className="pot-tray">{basket.map((item)=><button key={item.id} onClick={()=>onRemove(item.id)} title={`Remove ${item.normalized_name}`}><FoodVisual category={item.food_category} name={item.normalized_name} size="sm"/></button>)}<button className="pot-cook-button" onClick={onMakeMeal}>Cook with these →</button></div>}
  </aside>;
}
