import { PurchaseCoach } from "@/components/intelligence/PurchaseCoach";
import { WastePatterns } from "@/components/intelligence/WastePatterns";
import {
  databaseRowsToOutcomes,
  legacyPantryRowsToPurchases,
  outcomesToPurchases,
  type OutcomeDatabaseRow,
} from "@/lib/behaviorData";
import { getAdminSupabase } from "@/lib/supabase";
import type { BehaviorPurchase } from "@/types/behavior";
import { requireAuthUser } from "@/lib/auth/server";
import { linkedTelegramUserId } from "@/lib/auth/linkedUser";
import { redirect } from "next/navigation";
import { isGuestDemo } from "@/lib/guestDemo";
import { GuestCoachExperience } from "@/components/GuestCoachExperience";

export const dynamic = "force-dynamic";

interface PantryRow {
  id: string;
  user_id: string;
  status: string;
  normalized_name: string;
  food_category: string;
  quantity: number | string;
  unit: string | null;
  price: number | string | null;
  purchase_date: string;
  storage_method: string;
  action_risk: number | null;
  freshness_risk: number | null;
  discarded_at: string | null;
  consumed_at: string | null;
  frozen_at: string | null;
  discard_reason: string | null;
}

export default async function CoachPage() {
  const authUser = await requireAuthUser();
  const guest = !authUser && await isGuestDemo();
  if (guest) return <main className="mx-auto max-w-6xl px-5 pb-10 pt-6"><header className="mb-2 pt-6"><p className="eyebrow">Guest demo · Demo data</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Learn from what leaves your kitchen.</h1><p className="mt-4 max-w-2xl text-[#526259]">The coach uses deterministic purchase history and outcome math. Every number below traces back to a recorded event.</p></header><GuestCoachExperience/></main>;
  if (!authUser) redirect("/login");
  const linkedUserId = await linkedTelegramUserId(authUser.id);
  if (!linkedUserId) return <main className="mx-auto max-w-4xl px-5 py-16"><div className="card p-8"><h1 className="text-3xl font-black">Link Telegram to build your Coach history.</h1><p className="mt-3 text-[#526259]">Once linked, consumed, frozen, and discarded items become your private recommendation history.</p><a href="/telegram" className="button mt-6 bg-[#164b35] text-white">Link Telegram</a></div></main>;
  let configured = true;
  let rows: PantryRow[] = [];

  try {
    const { data, error } = await getAdminSupabase().from("pantry_items").select("*").eq("user_id", linkedUserId);
    if (error) throw error;
    rows = (data ?? []) as PantryRow[];
  } catch {
    configured = false;
  }

  let behaviorPurchases: BehaviorPurchase[] = [];
  if (configured) {
    const userId = linkedUserId;
    try {
      if (userId) {
        const { data, error } = await getAdminSupabase()
          .from("food_outcomes")
          .select("*,pantry_items!inner(quantity,unit,purchase_date,storage_method)")
          .eq("user_id", userId)
          .order("action_at", { ascending: false });
        if (error) throw error;
        behaviorPurchases = outcomesToPurchases(
          databaseRowsToOutcomes((data ?? []) as unknown as OutcomeDatabaseRow[]),
        );
      }
    } catch {
      behaviorPurchases = legacyPantryRowsToPurchases(rows);
    }
  }

  return <main className="mx-auto max-w-6xl px-5 pb-10 pt-6">
    {!configured ? <div className="card mt-4 p-8">
      <span className="text-3xl" aria-hidden="true">📊</span>
      <h1 className="mt-4 text-2xl font-black">We couldn&apos;t load your coach right now.</h1>
      <p className="mt-3 text-[#526259]">Try the connection again in a moment.</p>
      <a href="/coach" className="button mt-5 bg-[#164b35] text-white">Try again</a>
    </div> : <>
      <header className="mb-2 pt-6">
        <p className="eyebrow">Food waste coach</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Learn from what leaves your kitchen.</h1>
        <p className="mt-4 max-w-2xl text-[#526259]">See your waste patterns and get practical suggestions for how much to buy next time.</p>
      </header>
      {!behaviorPurchases.length ? <section className="card mt-8 p-7"><h2 className="text-2xl font-black">Build your first recommendation</h2><p className="mt-2 text-[#526259]">The Coach learns only from your completed pantry outcomes. No sample data is added.</p><ol className="mt-6 grid gap-4 sm:grid-cols-3"><li><b>1. Add groceries</b><p className="mt-1 text-sm text-[#68766e]">Send a receipt to Telegram or upload one on the web.</p></li><li><b>2. Record outcomes</b><p className="mt-1 text-sm text-[#68766e]">Mark foods consumed, frozen, or discarded in your Kitchen.</p></li><li><b>3. Repeat naturally</b><p className="mt-1 text-sm text-[#68766e]">After three resolved purchases of the same food, a personalized quantity can appear.</p></li></ol><div className="mt-6 flex gap-3"><a href="/upload" className="button bg-[#164b35] text-white">Upload receipt</a><a href="/dashboard" className="button border">Open kitchen</a></div></section> : <><WastePatterns purchases={behaviorPurchases}/><PurchaseCoach purchases={behaviorPurchases}/></>}
    </>}
  </main>;
}
