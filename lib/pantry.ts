import { getAdminSupabase } from "@/lib/supabase";
import { calculateFreshness } from "@/lib/freshness";
import { effectiveNow } from "@/lib/demoTime";

export async function pantryForUser(userId: string) {
  const db = getAdminSupabase();
  const { data, error } = await db.from("pantry_items").select("*").eq("user_id", userId).eq("status", "active");
  if (error) throw error;
  const now = await effectiveNow();
  return (data ?? []).map((item) => ({ ...item, ...calculateFreshness(item.purchase_date, item.shelf_life_max_days, now) }))
    .sort((a, b) => (b.riskScore ?? -1) - (a.riskScore ?? -1));
}
