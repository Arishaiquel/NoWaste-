"use client";
import { FoodObject } from "@/components/kitchen/FoodObject";
import type { KitchenItemData } from "@/lib/foodVisuals";

export function CounterZone({ items, onOpen, focusMode=false, priorityIds=[], dragEnabled=false }: { items: KitchenItemData[]; onOpen: (x: KitchenItemData) => void; focusMode?: boolean; priorityIds?: string[]; dragEnabled?: boolean }) {
  if (!items.length) return null;
  return <section className="counter-zone" aria-labelledby="counter-heading"><div className="min-w-36"><p className="kitchen-label text-[#80634a]">Room temperature</p><h3 id="counter-heading" className="text-xl font-black">On the counter</h3></div><div className="flex flex-1 flex-wrap gap-3">{items.map(item=><div className="w-[7.3rem]" key={item.id}><FoodObject item={item} onOpen={onOpen} focusMode={focusMode} rank={priorityIds.indexOf(item.id)+1||undefined} dragEnabled={dragEnabled}/></div>)}</div></section>;
}
