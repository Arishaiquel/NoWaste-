"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { FridgeZone } from "@/components/kitchen/FridgeZone";
import { PantryZone } from "@/components/kitchen/PantryZone";
import { CounterZone } from "@/components/kitchen/CounterZone";
import { ItemDetailModal } from "@/components/kitchen/ItemDetailModal";
import { DiscardDialog } from "@/components/kitchen/DiscardDialog";
import { ConsumptionZone } from "@/components/kitchen/ConsumptionZone";
import { TrashZone } from "@/components/kitchen/TrashZone";
import { WasteMeter } from "@/components/kitchen/WasteMeter";
import { RescuePot } from "@/components/kitchen/RescuePot";
import { FoodObject } from "@/components/kitchen/FoodObject";
import { FoodActionSheet, type FoodSheetAction } from "@/components/kitchen/FoodActionSheet";
import { getStorageZone, type KitchenItemData } from "@/lib/foodVisuals";
import { updatePantryItem } from "@/lib/pantryActions";
import type { RescueMetrics } from "@/lib/rescueMetrics";
import type { StorageMethod } from "@/types/pantry";
import { ShareNearbyCTA } from "@/components/ShareNearbyCTA";
import { checkListingEligibility } from "@/lib/communityEligibility";

type OutcomeAction = "consumed" | "frozen";

export function KitchenView({ items, metrics, actionsEnabled, guestDemo = false }: { items: KitchenItemData[]; metrics: RescueMetrics; actionsEnabled: boolean; guestDemo?: boolean }) {
  const router = useRouter();
  const [localItems,setLocalItems]=useState(items);
  const [displayMetrics,setDisplayMetrics]=useState(metrics);
  const [active,setActive]=useState<KitchenItemData|null>(null);
  const [sheetItem,setSheetItem]=useState<KitchenItemData|null>(null);
  const [detailItem,setDetailItem]=useState<KitchenItemData|null>(null);
  const [discarding,setDiscarding]=useState<KitchenItemData|null>(null);
  const [basket,setBasket]=useState<KitchenItemData[]>([]);
  const [toast,setToast]=useState("");
  const [focusMode,setFocusMode]=useState(false);
  const [shareCandidate,setShareCandidate]=useState<KitchenItemData|null>(null);
  const sensors=useSensors(useSensor(PointerSensor,{activationConstraint:{distance:7}}),useSensor(TouchSensor,{activationConstraint:{delay:180,tolerance:8}}),useSensor(KeyboardSensor));

  const closeSheet=useCallback(()=>setSheetItem(null),[]);
  const priorityIds=localItems.slice(0,3).map((item)=>item.id);
  const zones=useMemo(()=>({fridge:localItems.filter((item)=>getStorageZone(item.storage_method)==="fridge"),freezer:localItems.filter((item)=>getStorageZone(item.storage_method)==="freezer"),pantry:localItems.filter((item)=>getStorageZone(item.storage_method)==="pantry"),counter:localItems.filter((item)=>getStorageZone(item.storage_method)==="counter")}),[localItems]);

  function celebrate(message:string){setToast(message);window.setTimeout(()=>setToast(""),3200)}
  function addRescueMetric(price:number|null){setDisplayMetrics((current)=>{const rescued=current.rescuedCount+1;const outcomes=rescued+current.discardedCount;return{...current,rescuedCount:rescued,rescuedValue:Math.round((current.rescuedValue+(price??0))*100)/100,rescueScore:outcomes?Math.round(rescued/outcomes*100):null}})}
  function addWasteMetric(price:number|null){setDisplayMetrics((current)=>{const discarded=current.discardedCount+1;const outcomes=current.rescuedCount+discarded;return{...current,discardedCount:discarded,wasteValue:Math.round((current.wasteValue+(price??0))*100)/100,rescueScore:outcomes?Math.round(current.rescuedCount/outcomes*100):null}})}
  async function completeOutcome(action:OutcomeAction,item:KitchenItemData){
    try{const result=guestDemo?{price:item.price}:await updatePantryItem(item.id,action);if(action==="consumed"){setLocalItems((current)=>current.filter((entry)=>entry.id!==item.id));setBasket((current)=>current.filter((entry)=>entry.id!==item.id));addRescueMetric(result.price);celebrate(`✨ Rescued! ${item.normalized_name}${result.price?` · $${Number(result.price).toFixed(2)} of groceries used`:""}`)}else{setLocalItems((current)=>current.map((entry)=>entry.id===item.id?{...entry,storage_method:"freezer"}:entry));addRescueMetric(result.price);celebrate(`❄ Saved for later · ${item.normalized_name}`)}if(!guestDemo)router.refresh();}
    catch{celebrate("We couldn't update that item. Please try again.")}
  }
  async function moveItem(item:KitchenItemData,storageMethod:StorageMethod){
    if(item.storage_method===storageMethod)return;
    try{if(!guestDemo)await updatePantryItem(item.id,"storage",{storageMethod});setLocalItems((current)=>current.map((entry)=>entry.id===item.id?{...entry,storage_method:storageMethod}:entry));celebrate(`${item.normalized_name} moved to the ${storageMethod==="refrigerator"?"fridge":storageMethod}.`);if(!guestDemo)router.refresh();}
    catch{celebrate("We couldn't move that item. Please try again.")}
  }
  function addToPot(item:KitchenItemData){setBasket((current)=>current.some((entry)=>entry.id===item.id)?current:[...current,item]);celebrate(`${item.normalized_name} added to the Rescue Pot.`)}
  function shareNearby(item:KitchenItemData){const eligibility=checkListingEligibility({foodCategory:item.food_category,condition:"unopened",storageMethod:item.storage_method,refrigerationConfirmed:item.storage_method==="refrigerator"});if(!eligibility.eligible){celebrate(eligibility.reason);return}router.push(`/community?food=${encodeURIComponent(item.normalized_name)}&category=${encodeURIComponent(item.food_category)}&quantity=${item.quantity}&unit=${encodeURIComponent(item.unit??"item")}&storage=${encodeURIComponent(item.storage_method)}&risk=${item.freshness.riskScore??""}`)}
  function handleAction(action:FoodSheetAction,item:KitchenItemData){
    setSheetItem(null);
    if(action==="consumed"||action==="frozen")void completeOutcome(action,item);
    else if(action==="discarded")setDiscarding(item);
    else if(action==="pantry")void moveItem(item,"pantry");
    else if(action==="fridge")void moveItem(item,"refrigerator");
    else if(action==="rescue")addToPot(item);
    else if(action==="share")shareNearby(item);
    else setDetailItem(item);
  }
  async function confirmDiscard(reason:string){if(!discarding)return;const item=discarding;try{const result=guestDemo?{price:item.price}:await updatePantryItem(item.id,"discarded",{discardReason:reason});setLocalItems((current)=>current.filter((entry)=>entry.id!==item.id));setBasket((current)=>current.filter((entry)=>entry.id!==item.id));addWasteMetric(result.price);setDiscarding(null);celebrate(`Waste logged${result.price?` · $${Number(result.price).toFixed(2)} discarded`:""}`);if(!guestDemo)router.refresh();}catch{celebrate("We couldn't log that. Please try again.")}}
  function makeMeal(){window.open("/api/telegram/open?command=rescue","_blank","noopener,noreferrer");celebrate(`Recipe request started with ${basket.length} ingredient${basket.length===1?"":"s"}.`)}
  function dragStart(event:DragStartEvent){setActive(localItems.find((item)=>item.id===String(event.active.id))??null)}
  function dragEnd(event:DragEndEvent){const item=active;setActive(null);if(!item||!event.over)return;const target=String(event.over.id);if(target==="consumed")void completeOutcome("consumed",item);else if(target==="discarded")setDiscarding(item);else if(target==="fridge")void moveItem(item,"refrigerator");else if(target==="freezer")void completeOutcome("frozen",item);else if(target==="pantry")void moveItem(item,"pantry");else if(target==="rescue")addToPot(item);else if(target==="share-nearby"){const eligibility=checkListingEligibility({foodCategory:item.food_category,condition:"unopened",storageMethod:item.storage_method,refrigerationConfirmed:item.storage_method==="refrigerator"});if(eligibility.eligible)setShareCandidate(item);else celebrate(eligibility.reason)}}
  const zoneProps={onOpen:setSheetItem,focusMode,priorityIds:focusMode?priorityIds:[],dragEnabled:actionsEnabled};

  return <DndContext id="shelfsense-kitchen" sensors={sensors} collisionDetection={closestCenter} onDragStart={dragStart} onDragCancel={()=>setActive(null)} onDragEnd={dragEnd}>
    <section className={`digital-kitchen ${active?"kitchen-is-dragging":""}`} aria-labelledby="kitchen-title">
      <div className="kitchen-wall" aria-hidden="true"><span className="wall-rail"/><span className="hanging-leaf leaf-one">♧</span><span className="hanging-leaf leaf-two">♧</span></div>
      <h1 id="kitchen-title" className="sr-only">Your interactive digital kitchen</h1>
      <ShareNearbyCTA items={localItems} kitchen droppedItem={shareCandidate} onDroppedItemHandled={()=>setShareCandidate(null)}/>
      <div className="kitchen-top"><ConsumptionZone disabled={!actionsEnabled}/><WasteMeter metrics={displayMetrics}/><TrashZone disabled={!actionsEnabled}/></div>
      <div className="kitchen-hint"><span>Grab a food and move it around your kitchen</span><button onClick={()=>{setFocusMode((value)=>!value);if(!focusMode)setBasket(localItems.slice(0,3))}}>{focusMode?"Show everything":"What should I use first?"}</button></div>
      <div className="kitchen-floor"><div className="appliance-slot fridge-slot"><FridgeZone items={zones.fridge} freezerItems={zones.freezer} {...zoneProps}/></div><div className="appliance-slot pantry-slot"><PantryZone items={zones.pantry} {...zoneProps}/></div><RescuePot basket={basket} onRemove={(id)=>setBasket((current)=>current.filter((item)=>item.id!==id))} onMakeMeal={makeMeal} disabled={!actionsEnabled}/></div>
      <CounterZone items={zones.counter} {...zoneProps}/>
      {!localItems.length&&<div className="empty-kitchen"><span>🧺</span><b>Your kitchen is ready for groceries.</b><small>Send a receipt to the Telegram bot to stock the shelves.</small></div>}
      <div className="mobile-action-note">Tap any food to cook, freeze, share nearby, or record an outcome.</div>
    </section>
    <DragOverlay dropAnimation={{duration:220,easing:"cubic-bezier(.2,.8,.2,1)"}}>{active?<div className="drag-overlay-wrap"><FoodObject item={active} overlay/></div>:null}</DragOverlay>
    <FoodActionSheet item={sheetItem} enabled={actionsEnabled} onClose={closeSheet} onAction={handleAction}/>
    <ItemDetailModal item={detailItem} onClose={()=>setDetailItem(null)} actionsEnabled={actionsEnabled} onItemAction={(action,item)=>handleAction(action,item)}/>
    {discarding&&<DiscardDialog item={discarding} onCancel={()=>setDiscarding(null)} onConfirm={confirmDiscard}/>} 
    {toast&&<div className="rescue-toast" role="status" aria-live="polite">{toast}<span>🌱</span></div>}
  </DndContext>;
}

export function KitchenSkeleton(){return <section className="digital-kitchen animate-pulse" aria-label="Loading your kitchen"><div className="h-52 rounded-3xl bg-white/50"/><div className="mt-5 grid gap-5 lg:grid-cols-2"><div className="h-[34rem] rounded-[2rem] bg-[#dcebef]"/><div className="h-[34rem] rounded-[2rem] bg-[#e5c9a4]"/></div></section>}
