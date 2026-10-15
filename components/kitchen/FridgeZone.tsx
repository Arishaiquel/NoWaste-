"use client";
import { useDroppable } from "@dnd-kit/core";
import { FoodObject } from "@/components/kitchen/FoodObject";
import type { KitchenItemData } from "@/lib/foodVisuals";

function Shelf({ items, onOpen, empty, focusMode, priorityIds, dragEnabled }: { items: KitchenItemData[]; onOpen: (x: KitchenItemData) => void; empty?: string; focusMode: boolean; priorityIds: string[]; dragEnabled: boolean }) {
  return <div className="fridge-shelf"><div className="grid min-h-36 grid-cols-2 content-end items-end gap-3 px-3 pb-4 sm:grid-cols-3">
    {items.length ? items.map((item) => <FoodObject key={item.id} item={item} onOpen={onOpen} focusMode={focusMode} rank={priorityIds.indexOf(item.id)+1||undefined} dragEnabled={dragEnabled}/>) : <p className="col-span-full self-center text-center text-sm font-bold text-[#78909a]">{empty}</p>}
  </div></div>;
}

export function FridgeZone({ items, freezerItems, onOpen, focusMode=false, priorityIds=[], dragEnabled=false }: { items: KitchenItemData[]; freezerItems: KitchenItemData[]; onOpen: (x: KitchenItemData) => void; focusMode?: boolean; priorityIds?: string[]; dragEnabled?: boolean }) {
  const { isOver: isOverFridge, setNodeRef: setFridgeRef } = useDroppable({ id: "fridge", disabled: !dragEnabled });
  const { isOver: isOverFreezer, setNodeRef: setFreezerRef } = useDroppable({ id: "freezer", disabled: !dragEnabled });
  const midpoint = Math.ceil(items.length / 2);
  return <section ref={setFridgeRef} aria-labelledby="fridge-heading" className={`kitchen-appliance fridge-shell ${isOverFridge ? "appliance-drop-active" : ""}`}>
    <div className="flex items-center justify-between px-5 pb-3"><div><p className="kitchen-label">Cool zone</p><h3 id="fridge-heading" className="text-2xl font-black tracking-tight">Fridge</h3></div><span className="grid size-10 place-items-center rounded-full bg-white/70 text-xl shadow-sm" aria-hidden="true">❄</span></div>
    <div className="fridge-interior">
      <div ref={setFreezerRef} className={`freezer-compartment ${isOverFreezer ? "freezer-drop-active" : ""}`}><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-[.16em] text-[#66818b]">Freezer drawer · drop to freeze</span><span className="text-xs text-[#78909a]">{freezerItems.length}</span></div>{freezerItems.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{freezerItems.map((item)=><FoodObject key={item.id} item={item} onOpen={onOpen} focusMode={focusMode} rank={priorityIds.indexOf(item.id)+1||undefined} dragEnabled={dragEnabled}/>)}</div>}</div>
      <Shelf items={items.slice(0, midpoint)} onOpen={onOpen} empty={items.length ? undefined : "Your fridge is looking clear 🧊"} focusMode={focusMode} priorityIds={priorityIds} dragEnabled={dragEnabled}/>
      {items.length > 2 && <Shelf items={items.slice(midpoint)} onOpen={onOpen} focusMode={focusMode} priorityIds={priorityIds} dragEnabled={dragEnabled}/>} 
      <div className="grid grid-cols-2 gap-2 border-t border-[#bdd4dc] bg-[#e5f1f3] p-3"><span className="rounded-xl border border-[#b9d2da] bg-white/45 py-3 text-center text-[10px] font-black uppercase tracking-wider text-[#69818a]">Crisper</span><span className="rounded-xl border border-[#b9d2da] bg-white/45 py-3 text-center text-[10px] font-black uppercase tracking-wider text-[#69818a]">Fresh drawer</span></div>
    </div>
    <span className="fridge-handle" aria-hidden="true"/>
  </section>;
}
