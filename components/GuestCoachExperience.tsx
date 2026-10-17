"use client";
import { useMemo } from "react";
import { WastePatterns } from "@/components/intelligence/WastePatterns";
import { PurchaseCoach } from "@/components/intelligence/PurchaseCoach";
import { guestBehaviorPurchases } from "@/lib/guestDemoData";
import { demoBananaHistory } from "@/lib/demoScenario";

export function GuestCoachExperience() {
  const purchases=useMemo(()=>[
    ...guestBehaviorPurchases.filter(x=>x.normalizedName!=="Bananas"),
    ...demoBananaHistory(false),
  ],[]);
  return <>
    <WastePatterns purchases={purchases}/>
    <PurchaseCoach purchases={purchases}/>
  </>;
}
