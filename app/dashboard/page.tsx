import { DemoControls } from "@/components/DemoControls";
import { getAdminSupabase } from "@/lib/supabase";
import { effectiveNow, isDemoMode } from "@/lib/demoTime";
import { calculateFreshness } from "@/lib/freshness";
import { KitchenView } from "@/components/kitchen/KitchenView";
import type { KitchenItemData } from "@/lib/foodVisuals";
import type { StorageMethod } from "@/types/pantry";
import { RescueProgress } from "@/components/kitchen/RescueProgress";
import { calculateRescueMetrics, type OutcomeItem } from "@/lib/rescueMetrics";
import { requireAuthUser } from "@/lib/auth/server";
import { linkedTelegramUserId } from "@/lib/auth/linkedUser";
import { redirect } from "next/navigation";
import { isGuestDemo } from "@/lib/guestDemo";
import { guestKitchenItems, guestMetrics } from "@/lib/guestDemoData";

export const dynamic = "force-dynamic";

interface DashboardRow {
  id: string; user_id: string; status: string; normalized_name: string; purchase_date: string;
  storage_method: string; shelf_life_min_days: number | null; shelf_life_max_days: number | null;
  freshness_risk: number | null; price: number | string | null;
  raw_name: string; food_category: string; quantity: number | string; unit: string | null;
  extraction_confidence: number | string;
  consumed_at: string | null; frozen_at: string | null; discarded_at: string | null;
  rescued_at: string | null; action_risk: number | null; discard_reason: string | null;
}

export default async function Dashboard() {
  const authUser = await requireAuthUser();
  const guest = !authUser && await isGuestDemo();
  if (guest) return <main className="mx-auto max-w-[1500px] px-3 pb-10 sm:px-5"><div className="demo-strip"><div className="card flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Guest demo</p><p className="mt-1 text-sm text-[#526259]">Explore freely—your demo changes stay temporary.</p></div><a href="/login" className="button bg-[#164b35] px-4 py-2 text-sm text-white">Make an account</a></div></div><KitchenView items={guestKitchenItems()} metrics={guestMetrics} actionsEnabled guestDemo/><div className="mx-auto mt-8 max-w-6xl"><RescueProgress metrics={guestMetrics}/></div></main>;
  if (!authUser) redirect("/login");
  const userId = await linkedTelegramUserId(authUser.id);
  if (!userId) return <main className="mx-auto max-w-4xl px-5 py-16"><div className="card p-8"><span className="text-3xl">✈️</span><h1 className="mt-4 text-3xl font-black">Link Telegram to open your kitchen.</h1><p className="mt-3 text-[#526259]">Your Telegram identity connects receipt uploads and pantry records to this signed-in account.</p><a href="/telegram" className="button mt-6 bg-[#164b35] text-white">Link Telegram</a></div></main>;
  let rows: DashboardRow[] = []; let configured = true;
  try {
    const { data, error } = await getAdminSupabase().from("pantry_items").select("*").eq("user_id", userId).order("freshness_risk", { ascending: false });
    if (error) throw error; rows = (data ?? []) as DashboardRow[];
  } catch { configured = false; }
  const now = configured ? await effectiveNow().catch(() => new Date()) : new Date();
  const active = rows.filter((x) => x.status === "active").map((x) => ({ ...x, freshness: calculateFreshness(x.purchase_date, x.shelf_life_max_days, now) })).sort((a,b)=>(b.freshness.riskScore ?? -1)-(a.freshness.riskScore ?? -1));
  const kitchenItems: KitchenItemData[] = active.map((item) => ({ id: item.id, normalized_name: item.normalized_name, raw_name: item.raw_name, food_category: item.food_category, quantity: Number(item.quantity), unit: item.unit, price: item.price === null ? null : Number(item.price), purchase_date: item.purchase_date, storage_method: item.storage_method as StorageMethod, extraction_confidence: Number(item.extraction_confidence), shelf_life_min_days: item.shelf_life_min_days, shelf_life_max_days: item.shelf_life_max_days, freshness: item.freshness }));
  const metrics = calculateRescueMetrics(rows as OutcomeItem[], now);
  return <main className="mx-auto max-w-[1500px] px-3 pb-10 sm:px-5">
    {!configured ? <div className="card mt-10 p-8"><span className="text-3xl" aria-hidden="true">🍽️</span><h2 className="mt-4 text-2xl font-black">We couldn&apos;t load your kitchen right now.</h2><p className="mt-3 text-[#526259]">Your groceries are still safe in the pantry database. Try the connection again in a moment.</p><a href="/dashboard" className="button mt-5 bg-[#164b35] text-white">Try again</a></div> : <>
      {isDemoMode() && <div className="demo-strip"><DemoControls/></div>}
      <div id="your-kitchen"><KitchenView key={`${kitchenItems.map((item)=>`${item.id}:${item.storage_method}:${item.freshness.riskScore}`).join("|")}:${metrics.rescuedCount}:${metrics.discardedCount}`} items={kitchenItems} metrics={metrics} actionsEnabled/></div>
      <div className="mx-auto mt-8 max-w-6xl"><RescueProgress metrics={metrics}/></div>
    </>}
  </main>;
}
