"use client";
import { useState } from "react";
import { resetDemoScenario } from "@/lib/demoScenario";
import { useRouter } from "next/navigation";

export function DemoResetButton() {
  const router=useRouter();
  const [done,setDone]=useState(false);
  return <button onClick={()=>{resetDemoScenario();setDone(true);window.setTimeout(()=>router.push("/upload"),500)}} className="button border px-3 py-2 text-xs">{done?"Demo reset ✓":"Reset demo"}</button>;
}
