"use client";
import { useDroppable } from "@dnd-kit/core";
import { FoodObject } from "@/components/kitchen/FoodObject";
import type { KitchenItemData } from "@/lib/foodVisuals";

export function PantryZone({ items, onOpen, focusMode=false, priorityIds=[], dragEnabled=false }: { items: KitchenItemData[]; onOpen: (x: KitchenItemData) => void; focusMode?: boolean; priorityIds?: string[]; dragEnabled?: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id: "pantry", disabled: !dragEnabled });
  const shelves = items.length > 4 ? [items.slice(0, Math.ceil(items.length / 2)), items.slice(Math.ceil(items.length / 2))] : [items];
  return <section ref={setNodeRef} aria-labelledby="pantry-heading" className={`kitchen-appliance pantry-shell ${isOver ? "appliance-drop-active" : ""}`}>
    <div className="flex items-center justify-between px-5 pb-3"><div><p className="kitchen-label text-[#86694e]">Dry & cozy</p><h3 id="pantry-heading" className="text-2xl font-black tracking-tight">Pantry shelf</h3></div><span className="grid size-10 place-items-center rounded-full bg-[#fff8e9] text-xl shadow-sm" aria-hidden="true">✦</span></div>
    <div className="pantry-interior">
      {items.length ? shelves.map((shelf, index)=><div className="pantry-shelf" key={index}><div className="grid min-h-40 grid-cols-2 content-end items-end gap-3 px-4 pb-5 sm:grid-cols-3">{shelf.map(item=><FoodObject key={item.id} item={item} onOpen={onOpen} focusMode={focusMode} rank={priorityIds.indexOf(item.id)+1||undefined} dragEnabled={dragEnabled}/>)}</div></div>) : <div className="grid min-h-[22rem] place-items-center px-6 text-center"><div><span className="text-4xl" aria-hidden="true">🫙</span><p className="mt-3 text-sm font-bold text-[#8a725d]">Nothing on the shelf yet.</p></div></div>}
    </div>
  </section>;
}
